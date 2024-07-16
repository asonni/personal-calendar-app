import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('Calendars', function (table) {
    table.increments('calendar_id').primary();
    table
      .integer('user_id')
      .notNullable()
      .references('user_id')
      .inTable('Users');
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('color', 7);
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('Calendars');
}
