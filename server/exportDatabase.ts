import fs from 'fs';
import knex from 'knex';

import configuration from './knex.config';

const db = knex(configuration.development);

async function exportDatabase() {
  try {
    const tables: any = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);

    const exportPromises = tables.rows.map(async ({ table_name }: any) => {
      const data = await db.select('*').from(table_name);
      const outputPath = `./seeds/${table_name}.json`;
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`Exported ${table_name} to ${outputPath}`);
    });

    await Promise.all(exportPromises);
    console.log('Database export completed.');
  } catch (error) {
    console.error('Error exporting database:', error);
  } finally {
    await db.destroy();
  }
}

exportDatabase();
