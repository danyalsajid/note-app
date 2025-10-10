import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Database
import { initializeDatabase } from "./db/database.ts";
import { db } from "./db/connection.ts";
import { notes } from "./db/schema.ts";

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
await initializeDatabase();

// CORS for development
app.use(cors({
	origin: true, // Allow all origins in development
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
	optionsSuccessStatus: 200
}));

app.use(express.json());

// Serve static files from dist directory in production
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, '../../web/dist')));
}

// API routes
app.get('/api/health', (req, res) => {
	console.log('Health check');
	res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all notes
app.get('/api/notes', async (req, res) => {
	try {
		console.log('Fetching all notes');
		const allNotes = await db.select().from(notes);
		res.json({ notes: allNotes });
	} catch (error) {
		console.error('Error fetching notes:', error);
		res.status(500).json({ error: 'Failed to fetch notes' });
	}
});

// Catch-all handler for client-side routing
app.use((req, res) => {
	res.sendFile(path.join(__dirname, '../../web/dist/index.html'));
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
