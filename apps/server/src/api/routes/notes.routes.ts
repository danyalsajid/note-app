import express from 'express';
import {
	getAllNotes,
	createNote,
	getNoteById,
	updateNote,
	deleteNote,
	searchNotes,
} from '../controllers/notes.controller.js';

const router = express.Router();

// GET /api/notes/search - Search notes (must be before /:id route)
router.get('/notes/search', searchNotes);

// GET /api/notes - Get all notes
router.get('/notes', getAllNotes);

// POST /api/notes - Create a new note
router.post('/notes', createNote);

// GET /api/notes/:id - Get a specific note
router.get('/notes/:id', getNoteById);

// PUT /api/notes/:id - Update a note
router.put('/notes/:id', updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete('/notes/:id', deleteNote);

export default router;
