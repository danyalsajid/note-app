import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

// Create the database file path
const DB_PATH = process.env.DATABASE_URL || './data/database.db';
const sqlite = new Database(DB_PATH);

// Create the drizzle instance
export const db = drizzle(sqlite, { schema });

// Export the raw database instance for direct queries if needed
export { sqlite };
