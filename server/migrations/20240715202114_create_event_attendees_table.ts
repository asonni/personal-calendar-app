import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('EventAttendees', function (table) {
    table
      .integer('event_id')
      .notNullable()
      .references('event_id')
      .inTable('Events');
    table
      .integer('user_id')
      .notNullable()
      .references('user_id')
      .inTable('Users');
    table
      .enu('status', ['pending', 'accepted', 'declined'])
      .defaultTo('pending');
    table.primary(['event_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('EventAttendees');
}
