import { db } from '../../db/index.js';
import { notes } from '../../db/schema.js';
import { eq, like, or } from 'drizzle-orm';
import type { Request, Response } from 'express';
import type {
	CreateNoteBody,
	UpdateNoteBody,
} from '../../types/notes.types.js';

// GET /api/notes - Get all notes
export async function getAllNotes(req: Request, res: Response) {
	try {
		const allNotes = await db.select().from(notes);
		res.json(allNotes);
	} catch (error) {
		console.error('Error fetching notes:', error);
		res.status(500).json({ error: 'Failed to fetch notes' });
	}
}

// POST /api/notes - Create a new note
export async function createNote(
	req: Request<object, object, CreateNoteBody>,
	res: Response
) {
	try {
		const { content, attachedToId, attachedToType, tags, voiceNoteFilename, voiceNoteDuration } = req.body;

		if (!content || !attachedToId || !attachedToType) {
			return res
				.status(400)
				.json({
					error: 'Content, attachedToId, and attachedToType are required',
				});
		}

		const id = `note-${Date.now()}`;
		const newNote = await db
			.insert(notes)
			.values({
				id,
				content,
				attachedToId,
				attachedToType,
				tags: tags ? JSON.stringify(tags) : undefined,
				voiceNoteFilename: voiceNoteFilename || null,
				voiceNoteDuration: voiceNoteDuration || null,
			})
			.returning();

		res.status(201).json(newNote[0]);
	} catch (error) {
		console.error('Error creating note:', error);
		res.status(500).json({ error: 'Failed to create note' });
	}
}

// GET /api/notes/:id - Get a specific note
export async function getNoteById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id: noteId } = req.params;
		const note = await db.select().from(notes).where(eq(notes.id, noteId));

		if (note.length === 0) {
			return res.status(404).json({ error: 'Note not found' });
		}

		res.json(note[0]);
	} catch (error) {
		console.error('Error fetching note:', error);
		res.status(500).json({ error: 'Failed to fetch note' });
	}
}

// PUT /api/notes/:id - Update a note
export async function updateNote(
	req: Request<{ id: string }, object, UpdateNoteBody>,
	res: Response
) {
	try {
		const { id: noteId } = req.params;

		const { content, tags, voiceNoteFilename, voiceNoteDuration } = req.body;

		if (!content) {
			return res.status(400).json({ error: 'Content is required' });
		}

		const updatedNote = await db
			.update(notes)
			.set({
				content,
				tags: tags ? JSON.stringify(tags) : undefined,
				voiceNoteFilename: voiceNoteFilename !== undefined ? voiceNoteFilename : undefined,
				voiceNoteDuration: voiceNoteDuration !== undefined ? voiceNoteDuration : undefined,
				updatedAt: new Date().toISOString(),
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
}

// DELETE /api/notes/:id - Delete a note
export async function deleteNote(req: Request<{ id: string }>, res: Response) {
	try {
		const { id: noteId } = req.params;
		const deletedNote = await db
			.delete(notes)
			.where(eq(notes.id, noteId))
			.returning();

		if (deletedNote.length === 0) {
			return res.status(404).json({ error: 'Note not found' });
		}

		res.json({ message: 'Note deleted successfully' });
	} catch (error) {
		console.error('Error deleting note:', error);
		res.status(500).json({ error: 'Failed to delete note' });
	}
}

// GET /api/notes/search?q=query - Search notes
export async function searchNotes(req: Request, res: Response) {
	try {
		const query = req.query.q as string;

		if (!query || query.trim() === '') {
			return res.json([]);
		}

		const searchPattern = `%${query}%`;
		const searchResults = await db
			.select()
			.from(notes)
			.where(
				or(
					like(notes.content, searchPattern),
					like(notes.tags, searchPattern)
				)
			);

		res.json(searchResults);
	} catch (error) {
		console.error('Error searching notes:', error);
		res.status(500).json({ error: 'Failed to search notes' });
	}
}
