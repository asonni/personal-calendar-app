import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('Events', function (table) {
    table.increments('event_id').primary();
    table
      .integer('calendar_id')
      .notNullable()
      .references('calendar_id')
      .inTable('Calendars');
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('location', 255);
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
    table.boolean('all_day').defaultTo(false);
    table.string('recurrence_rule', 255);
    table
      .integer('created_by')
      .notNullable()
      .references('user_id')
      .inTable('Users');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('Events');
}
