import { initDatabase, sanitizeConnectionString } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration(): Promise<void> {
  console.log('=============================================');
  console.log('SkillBridge AI - Database Migration Runner');
  console.log('Target:', sanitizeConnectionString(process.env.DATABASE_URL));
  console.log('=============================================\n');

  try {
    await initDatabase();
    console.log('✓ Migration completed successfully: 27 relational tables and indexes are ready.\n');
    process.exit(0);
  } catch (err: any) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
