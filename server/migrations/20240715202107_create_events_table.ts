import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('Events', function (table) {
    table.uuid('eventId').primary().defaultTo(knex.fn.uuid());
    table
      .uuid('calendarId')
      .notNullable()
      .references('calendarId')
      .inTable('Calendars');
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('location', 255);
    table.timestamp('startTime').notNullable();
    table.timestamp('endTime').notNullable();
    table.boolean('allDay').defaultTo(false);
    table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('Events');
}
