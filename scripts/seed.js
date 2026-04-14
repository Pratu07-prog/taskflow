// Seed script for database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../backend/src/config/db.js';
import { hashPassword } from '../backend/src/utils/bcrypt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEEDS_DIR = path.join(__dirname, '../seeds');

// Run seeds
const seed = async () => {
  const pool = db.initializePool();

  console.log('Seeding database...');

  try {
    // Read seed file
    const seedFile = path.join(SEEDS_DIR, 'seed.sql');
    let sql = fs.readFileSync(seedFile, 'utf8');

    // Replace the placeholder with a real bcrypt hash so seeded login works.
    const passwordHash = await hashPassword('TestPass123');
    sql = sql.replace('hashed_password_placeholder', passwordHash);

    console.log('Executing seed data...');
    await pool.query(sql);

    console.log('✓ Database seeded successfully');
  } catch (err) {
    // Ignore duplicate key errors (idempotent seeding)
    if (err.code === '23505') {
      console.log('✓ Seed data already exists (skipped duplicates)');
    } else {
      console.error(`✗ Seed error: ${err.message}`);
      process.exit(1);
    }
  } finally {
    await db.closePool();
  }
};

seed().then(() => {
  process.exit(0);
});
