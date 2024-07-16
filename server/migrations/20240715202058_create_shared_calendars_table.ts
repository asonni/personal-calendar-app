import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('SharedCalendars', function (table) {
    table
      .integer('calendar_id')
      .notNullable()
      .references('calendar_id')
      .inTable('Calendars');
    table
      .integer('user_id')
      .notNullable()
      .references('user_id')
      .inTable('Users');
    table
      .enu('role', ['owner', 'editor', 'viewer'])
      .defaultTo('viewer')
      .notNullable();
    table
      .enu('status', ['pending', 'accepted'])
      .defaultTo('pending')
      .notNullable();
    table.primary(['calendar_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('SharedCalendars');
}
