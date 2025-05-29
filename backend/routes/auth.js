import express from 'express';
import ldap from 'ldapjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const {
  LDAP_URL,
  LDAP_DOMAIN,
  LDAP_BASE_DN,
  JWT_SECRET,
  JWT_EXPIRES = '8h'
} = process.env;

// POST /auth/ldap — LDAP аутентификация + JWT + полный объект AD
router.post('/ldap', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: 'Требуется логин и пароль' });
  }
  if (!LDAP_URL || !LDAP_BASE_DN) {
    console.error('❌ LDAP_URL или LDAP_BASE_DN не настроены');
    return res.status(500).json({ error: 'Сервер неверно сконфигурирован' });
  }

  const bindLogin = login.includes('@') ? login : `${login}@${LDAP_DOMAIN}`;
  const shortLogin = login.includes('@') ? login.split('@')[0] : login;

  const client = ldap.createClient({ url: LDAP_URL });
  client.on('error', err => console.error('❌ LDAP client error:', err));

  client.bind(bindLogin, password, err => {
    if (err) {
      console.error('❌ LDAP bind error:', err);
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const opts = {
      filter: `(sAMAccountName=${shortLogin})`,
      scope: 'sub',
      attributes: ['*']
    };

    client.search(LDAP_BASE_DN, opts, (err, searchRes) => {
      if (err) {
        console.error('❌ LDAP search error:', err);
        client.unbind();
        return res.status(500).json({ error: 'Ошибка поиска: ' + err.message });
      }

      let found = false;
      searchRes.on('searchEntry', async entry => {
        found = true;
        const adUser = {};
        entry.attributes.forEach(attr => {
          adUser[attr.type] =
            attr.vals.length === 1 ? attr.vals[0] : attr.vals;
        });
        adUser.dn = entry.dn.toString();

        // Find-or-create in DB
        const actualLogin = bindLogin;
        let id, role;
        try {
          const { rows } = await pool.query(
            'SELECT id, role FROM users WHERE username = $1',
            [actualLogin]
          );
          if (rows.length) {
            ({ id, role } = rows[0]);
          } else {
            const ins = await pool.query(
              `INSERT INTO users (username)
                 VALUES ($1)
               ON CONFLICT (username) DO UPDATE SET updated_at = now()
             RETURNING id, role`,
              [actualLogin]
            );
            ({ id, role } = ins.rows[0]);
          }
        } catch (dbErr) {
          console.error('❌ DB error:', dbErr);
          client.unbind();
          return res.status(500).json({ error: 'Ошибка БД' });
        }

        // Generate JWT
        const token = jwt.sign(
          { id, username: actualLogin, role },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES }
        );

        client.unbind(unbindErr => {
          if (unbindErr) console.error('❌ LDAP unbind error:', unbindErr);
        });

        return res.json({
          username: actualLogin,
          role,
          token,
          user: adUser
        });
      });

      searchRes.on('end', () => {
        if (!found) {
          client.unbind();
          return res.status(404).json({ error: 'Пользователь не найден' });
        }
      });

      searchRes.on('error', err => {
        console.error('❌ LDAP stream error:', err);
        client.unbind();
        return res.status(500).json({ error: 'Ошибка поиска: ' + err.message });
      });
    });
  });
});

// GET /auth/ldap/me — профиль текущего пользователя
router.get('/ldap/me', authMiddleware, (req, res) => {
  const { id, username, role } = req.user;
  res.json({ id, username, role });
});

// GET /auth/ldap/menu — меню по роли
router.get('/ldap/menu', authMiddleware, (req, res) => {
  const menus = {
    user: [
      { label: 'Мои заявки', path: '/user/tickets' },
      { label: 'Новая заявка', path: '/user/tickets/new' }
    ],
    support: [
      { label: 'Панель поддержки', path: '/support/dashboard' },
      { label: 'Все заявки', path: '/support/tickets' }
    ],
    superadmin: [
      { label: 'Админка проекта', path: '/admin/dashboard' },
      { label: 'Управление пользователями', path: '/admin/users' },
      { label: 'Панель поддержки', path: '/support/dashboard' }
    ]
  };
  res.json(menus[req.user.role] || menus.user);
});

export default router;
