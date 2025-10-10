import { db } from "./connection.ts";
import { notes, users, hierarchyNodes, hierarchyClosure, attachments } from "./schema.ts";
import { seedDatabase } from "./seed.ts";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

// Initialize database function
export const initializeDatabase = async () => {
	try {
		console.log("Running database migrations");

		// Run migrations to create/update tables
		await migrate(db, { migrationsFolder: "./src/db/migrations" });

		console.log("Database migrations completed successfully!");

		await seedDatabase(db);
		console.log("Database initialization completed.");
	} catch (error) {
		console.error("Database initialization failed:", error);
		process.exit(1);
	}
};

// Export schema for use in other files
export { notes, users, hierarchyNodes, hierarchyClosure, attachments };