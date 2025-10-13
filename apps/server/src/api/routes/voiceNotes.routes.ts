import express from 'express';
import { upload } from '../middleware/upload.js';
import {
	uploadVoiceNote,
	getVoiceNote,
	deleteVoiceNote,
} from '../controllers/voiceNotes.controller.js';

const router = express.Router();

// POST /api/voice-notes/upload - Upload a voice note
router.post('/voice-notes/upload', upload.single('voiceNote'), uploadVoiceNote);

// GET /api/voice-notes/:filename - Serve a voice note file
router.get('/voice-notes/:filename', getVoiceNote);

// DELETE /api/voice-notes/:filename - Delete a voice note file
router.delete('/voice-notes/:filename', deleteVoiceNote);

export default router;
