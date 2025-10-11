import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/index.js';
import { notes } from './db/schema.js';
import { eq } from 'drizzle-orm';
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
app.get('/api/health', (req, res) => {
	console.log('Health check');
	res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Notes API routes
app.get('/api/notes', async (req, res) => {
	try {
		const allNotes = await db.select().from(notes);
		res.json(allNotes);
	} catch (error) {
		console.error('Error fetching notes:', error);
		res.status(500).json({ error: 'Failed to fetch notes' });
	}
});

app.post('/api/notes', async (req, res) => {
	try {
		const { content, attachedToId, attachedToType, tags } = req.body;

		if (!content || !attachedToId || !attachedToType) {
			return res.status(400).json({ error: 'Content, attachedToId, and attachedToType are required' });
		}

		const id = `note-${Date.now()}`;
		const newNote = await db.insert(notes).values({
			id,
			content,
			attachedToId,
			attachedToType,
			tags: tags ? JSON.stringify(tags) : undefined,
		}).returning();

		res.status(201).json(newNote[0]);
	} catch (error) {
		console.error('Error creating note:', error);
		res.status(500).json({ error: 'Failed to create note' });
	}
});

app.get('/api/notes/:id', async (req, res) => {
	try {
		const noteId = req.params.id;
		const note = await db.select().from(notes).where(eq(notes.id, noteId));

		if (note.length === 0) {
			return res.status(404).json({ error: 'Note not found' });
		}

		res.json(note[0]);
	} catch (error) {
		console.error('Error fetching note:', error);
		res.status(500).json({ error: 'Failed to fetch note' });
	}
});

app.put('/api/notes/:id', async (req, res) => {
	try {
		const noteId = req.params.id;
		const { content, tags } = req.body;

		if (!content) {
			return res.status(400).json({ error: 'Content is required' });
		}

		const updatedNote = await db.update(notes)
			.set({ 
				content, 
				tags: tags ? JSON.stringify(tags) : undefined,
				updatedAt: new Date().toISOString() 
			})
			.where(eq(notes.id, noteId))
			.returning();

		if (updatedNote.length === 0) {
			return res.status(404).json({ error: 'Note not found' });
		}

		res.json(updatedNote[0]);
	} catch (error) {
		console.error('Error updating note:', error);
		res.status(500).json({ error: 'Failed to update note' });
	}
});

app.delete('/api/notes/:id', async (req, res) => {
	try {
		const noteId = req.params.id;
		const deletedNote = await db.delete(notes).where(eq(notes.id, noteId)).returning();

		if (deletedNote.length === 0) {
			return res.status(404).json({ error: 'Note not found' });
		}

		res.json({ message: 'Note deleted successfully' });
	} catch (error) {
		console.error('Error deleting note:', error);
		res.status(500).json({ error: 'Failed to delete note' });
	}
});

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
