import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the database file path relative to the project root
// We need to handle both development (src/) and production (dist/) environments
const DB_PATH = process.env.DATABASE_URL || (() => {
  // Check if we're in dist/ or src/
  const pathParts = __dirname.split(path.sep);
  const inDist = pathParts.includes('dist');

  // From src/db/: go up 2 levels (../../)
  // From dist/src/db/: go up 3 levels (../../../)
  const upLevels = inDist ? '../../..' : '../..';
  return path.join(__dirname, upLevels, 'data/database.db');
})();

// Ensure the directory exists before creating the database
const dbDir = path.dirname(DB_PATH);
mkdirSync(dbDir, { recursive: true });

const sqlite: Database.Database = new Database(DB_PATH);

// Create the drizzle instance
export const db = drizzle(sqlite, { schema });

// Export the raw database instance for direct queries if needed
export { sqlite };
