import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('Users', function (table) {
    table.increments('userId').primary();
    table.string('email', 255).unique().notNullable();
    table.string('firstName', 50);
    table.string('lastName', 50);
    table.string('password', 255).notNullable();
    table.string('resetPasswordToken', 255);
    table.timestamp('resetPasswordExpires');
    table.timestamp('passwordChangedAt');
    table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('Users');
}
