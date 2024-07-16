import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('Users', function (table) {
    table.increments('user_id').primary();
    table.string('email', 255).unique().notNullable();
    table.string('first_name', 50);
    table.string('last_name', 50);
    table.string('password', 255).notNullable();
    table.string('reset_password_token', 255);
    table.timestamp('reset_password_expires');
    table.timestamp('password_changed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('Users');
}
