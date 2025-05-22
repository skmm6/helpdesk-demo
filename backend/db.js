import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://helpdesk:secret@db:5432/helpdesk_db',
});

async function waitForDb(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ База данных готова');
      return;
    } catch (err) {
      console.log(`⏳ Ожидание БД (${i + 1}/${retries})...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error('❌ База данных не ответила вовремя');
}

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Подключение к базе успешно:', res.rows[0]);
  } catch (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.message);
  }
}

export async function initDb() {
  try {
    await waitForDb();
    const query = `
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        screenshot_url TEXT,
        status TEXT NOT NULL DEFAULT 'Новый',
        assigned_to TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log('✅ Таблица tickets проверена/создана');
  } catch (err) {
    console.error('❌ Ошибка при создании таблицы:', err);
  }
}

export { pool };