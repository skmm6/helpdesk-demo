// backend/migrations/20250527_create_users.js
export async function up(knex) {
  // ENUM для ролей
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'support', 'superadmin');
      END IF;
    END$$;
  `);

  // Таблица пользователей
  await knex.schema.createTable('users', tbl => {
    tbl.increments('id').primary();
    tbl.text('username').notNullable().unique();
    tbl
      .specificType('role', 'user_role')
      .notNullable()
      .defaultTo('user');
    tbl
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    tbl
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
  await knex.raw(`DROP TYPE IF EXISTS user_role;`);
}
