import express from 'express';
import {
	getAllNotes,
	createNote,
	getNoteById,
	updateNote,
	deleteNote,
	searchNotes,
	summarizeContent,
} from '../controllers/notes.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/notes/search - Search notes (must be before /:id route)
router.get('/notes/search', requireAuth, searchNotes);

// POST /api/notes/summarize - Summarize note content (must be before /:id route)
router.post('/notes/summarize', requireAuth, summarizeContent);

// GET /api/notes - Get all notes
router.get('/notes', requireAuth, getAllNotes);

// POST /api/notes - Create a new note
router.post('/notes', requireAuth, createNote);

// GET /api/notes/:id - Get a specific note
router.get('/notes/:id', requireAuth, getNoteById);

// PUT /api/notes/:id - Update a note
router.put('/notes/:id', requireAuth, updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete('/notes/:id', requireAuth, deleteNote);

export default router;
