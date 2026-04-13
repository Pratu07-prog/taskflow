// Migration runner script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../backend/src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// Get list of migration files
const getMigrationFiles = (direction) => {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  const ext = direction === 'up' ? '.up.sql' : '.down.sql';
  return files
    .filter(f => f.endsWith(ext))
    .sort((a, b) => {
      const numA = parseInt(a.split('_')[0]);
      const numB = parseInt(b.split('_')[0]);
      return direction === 'up' ? numA - numB : numB - numA;
    });
};

// Execute migration
const runMigration = async (direction) => {
  const pool = db.initializePool();
  const files = getMigrationFiles(direction);

  console.log(`Running ${direction} migrations...`);

  try {
    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Executing: ${file}`);
      await pool.query(sql);
    }

    console.log(`✓ ${direction} migrations completed successfully`);
  } catch (err) {
    console.error(`✗ Migration error: ${err.message}`);
    process.exit(1);
  } finally {
    await db.closePool();
  }
};

// Main
const direction = process.argv[2] || 'up';
if (!['up', 'down'].includes(direction)) {
  console.error('Usage: node migrate.js [up|down]');
  process.exit(1);
}

runMigration(direction).then(() => {
  process.exit(0);
});
