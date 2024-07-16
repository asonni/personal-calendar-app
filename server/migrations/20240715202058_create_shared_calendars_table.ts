import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('SharedCalendars', function (table) {
    table
      .integer('calendarId')
      .notNullable()
      .references('calendarId')
      .inTable('Calendars');
    table.integer('userId').notNullable().references('userId').inTable('Users');
    table
      .enu('role', ['owner', 'editor', 'viewer'])
      .defaultTo('viewer')
      .notNullable();
    table
      .enu('status', ['pending', 'accepted'])
      .defaultTo('pending')
      .notNullable();
    table.primary(['calendarId', 'userId']);
    table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('SharedCalendars');
}
