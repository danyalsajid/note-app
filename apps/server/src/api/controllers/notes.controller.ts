import express from 'express';
import { db } from '../../db/index.js';
import { notes } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// GET /api/notes - Get all notes
router.get('/notes', async (req, res) => {
	try {
		const allNotes = await db.select().from(notes);
		res.json(allNotes);
	} catch (error) {
		console.error('Error fetching notes:', error);
		res.status(500).json({ error: 'Failed to fetch notes' });
	}
});

// POST /api/notes - Create a new note
router.post('/notes', async (req, res) => {
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

// GET /api/notes/:id - Get a specific note
router.get('/notes/:id', async (req, res) => {
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

// PUT /api/notes/:id - Update a note
router.put('/notes/:id', async (req, res) => {
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

// DELETE /api/notes/:id - Delete a note
router.delete('/notes/:id', async (req, res) => {
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

export default router;
