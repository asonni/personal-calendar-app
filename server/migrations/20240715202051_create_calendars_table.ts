import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('Calendars', function (table) {
    table.uuid('calendarId').primary().defaultTo(knex.fn.uuid());
    table.uuid('userId').notNullable().references('userId').inTable('Users');
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('color', 7);
    table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('Calendars');
}
