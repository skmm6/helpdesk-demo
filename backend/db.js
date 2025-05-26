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

    // --- Категории ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        fields JSONB NOT NULL
      );
    `);

    // --- Заявки ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        fields JSONB NOT NULL,             -- динамические поля из формы
        status TEXT NOT NULL DEFAULT 'Новый',
        created_by TEXT,                   -- логин/имя залогиненного пользователя
        created_at TIMESTAMP
        WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Таблицы categories и tickets проверены/созданы');
  } catch (err) {
    console.error('❌ Ошибка при создании таблиц:', err);
  }
}

export { pool };