import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('Events', function (table) {
    table.string('color', 7).defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('Events', function (table) {
    table.dropColumn('color');
  });
}
