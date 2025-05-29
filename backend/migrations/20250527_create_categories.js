// migrations/20250527_create_categories.js
export async function up(knex) {
  const exists = await knex.schema.hasTable('categories');
  if (!exists) {
    await knex.schema.createTable('categories', tbl => {
      tbl.increments('id').primary();
      tbl.text('name').notNullable();
      tbl.jsonb('fields').notNullable();
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('categories');
}
