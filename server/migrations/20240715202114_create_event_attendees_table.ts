import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('EventAttendees', function (table) {
    table.uuid('eventId').notNullable().references('eventId').inTable('Events');
    table.uuid('userId').notNullable().references('userId').inTable('Users');
    table
      .enu('status', ['pending', 'accepted', 'declined'])
      .defaultTo('pending');
    table.primary(['eventId', 'userId']);
    table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('EventAttendees');
}
