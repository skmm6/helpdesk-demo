import express from 'express'
import ldap from 'ldapjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

const LDAP_URL = process.env.LDAP_URL
const LDAP_DOMAIN = process.env.LDAP_DOMAIN // <-- впиши свой домен!

router.post('/ldap', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Требуется логин и пароль' })
  }

  // Формируем userDN для bind (через userPrincipalName)
  const bindLogin = username.includes('@') ? username : `${username}@${LDAP_DOMAIN}`;
  const shortLogin = username.includes('@') ? username.split('@')[0] : username;

  const client = ldap.createClient({ url: LDAP_URL })

  client.bind(bindLogin, password, err => {
    if (err) {
      console.error('LDAP bind error:', err.message)
      return res.status(401).json({ error: 'Ошибка авторизации: ' + err.message })
    }
    const opts = {
      filter: `(sAMAccountName=${shortLogin})`,
      scope: 'sub',
      attributes: ['*'] // Все поля
    };

    client.search(process.env.LDAP_BASE_DN, opts, (err, searchRes) => {
      if (err) {
        client.unbind();
        return res.status(500).json({ error: 'Ошибка поиска: ' + err.message });
      }

      // Авторизация успешна — отдаём токен!
      const token = jwt.sign(
        { username: bindLogin },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || '8h' }
      )

      let found = false;

      searchRes.on('searchEntry', (entry) => {
        let userObj = {};
        // Собираем объект вручную, если нужен
        if (entry.attributes) {
          entry.attributes.forEach(attr => {
            userObj[attr.type] = attr.values.length === 1 ? attr.values[0] : attr.values;
          });
        }
        userObj.dn = entry.dn && entry.dn.toString ? entry.dn.toString() : entry.dn;

        found = true;
        res.json({ found: true, username: bindLogin, token, user: userObj})
        client.unbind();
      });

      searchRes.on('end', () => {
        if (!found) {
          client.unbind();
          res.status(404).json({ found: false, error: 'Пользователь не найден' });
        }
      });

      searchRes.on('error', (err) => {
        client.unbind();
        res.status(500).json({ error: 'Ошибка поиска: ' + err.message });
      });

    });
  })
})

export default router
