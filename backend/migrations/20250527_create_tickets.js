// migrations/20250527_create_tickets.js
export async function up(knex) {
  // Пропускаем создание типа, если уже есть
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
        CREATE TYPE ticket_status AS ENUM ('Новый','В работе','Закрыт');
      END IF;
    END$$;
  `);

  const exists = await knex.schema.hasTable('tickets');
  if (!exists) {
    await knex.schema.createTable('tickets', tbl => {
      tbl.increments('id').primary();
      tbl
        .integer('category_id')
        .notNullable()
        .references('id')
        .inTable('categories')
        .onDelete('RESTRICT');
      tbl.jsonb('fields').notNullable();
      tbl
        .specificType('status', 'ticket_status')
        .notNullable()
        .defaultTo('Новый');
      tbl.text('created_by');
      tbl
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    });
    await knex.schema.alterTable('tickets', tbl => {
      tbl.index(['category_id']);
      tbl.index(['status']);
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('tickets');
  await knex.raw(`DROP TYPE IF EXISTS ticket_status;`);
}
