import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the web app's build directory
// In development: from src/index.ts -> ../../web/dist
// In production: from dist/src/index.js -> ../../../web/dist
const pathParts = __dirname.split(path.sep);
const inDist = pathParts.includes('dist');
const webDistPath = inDist 
  ? path.join(__dirname, '../../../web/dist')
  : path.join(__dirname, '../../web/dist');

app.use(express.static(webDistPath));

// API routes
import notesController from './api/controllers/notes.controller.js';

app.get('/api/health', (req, res) => {
	console.log('Health check');
	res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Use notes controller for all notes routes
app.use('/api', notesController);

// Catch-all handler for client-side routing
app.use((req, res) => {
	res.sendFile(path.join(webDistPath, 'index.html'));
});

// Initialize database and start server
async function startServer() {
	try {
		await initializeDatabase();
		app.listen(PORT, () => {
			console.log(`Server running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
}

startServer();
