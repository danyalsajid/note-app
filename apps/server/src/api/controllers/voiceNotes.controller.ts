import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Extend Express Request type to include multer file
interface MulterRequest extends Request {
	file?: Express.Multer.File;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POST /api/voice-notes/upload - Upload a voice note
export async function uploadVoiceNote(req: MulterRequest, res: Response) {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		// Return the filename and path
		res.status(201).json({
			filename: req.file.filename,
			originalName: req.file.originalname,
			size: req.file.size,
			path: `/api/voice-notes/${req.file.filename}`,
		});
	} catch (error) {
		console.error('Error uploading voice note:', error);
		res.status(500).json({ error: 'Failed to upload voice note' });
	}
}

// GET /api/voice-notes/:filename - Serve a voice note file
export async function getVoiceNote(req: Request<{ filename: string }>, res: Response) {
	try {
		const { filename } = req.params;
		
		// Sanitize filename to prevent directory traversal
		const sanitizedFilename = path.basename(filename);
		
		// Determine the uploads directory path
		const pathParts = __dirname.split(path.sep);
		const inDist = pathParts.includes('dist');
		const uploadsPath = inDist
			? path.join(__dirname, '../../../../data/voice-notes')
			: path.join(__dirname, '../../../data/voice-notes');
		
		const filePath = path.join(uploadsPath, sanitizedFilename);
		
		// Check if file exists
		try {
			await fs.access(filePath);
		} catch {
			return res.status(404).json({ error: 'Voice note not found' });
		}
		
		// Set appropriate headers for audio
		res.setHeader('Content-Type', 'audio/webm');
		res.setHeader('Accept-Ranges', 'bytes');
		
		// Send the file
		res.sendFile(filePath);
	} catch (error) {
		console.error('Error serving voice note:', error);
		res.status(500).json({ error: 'Failed to serve voice note' });
	}
}

// DELETE /api/voice-notes/:filename - Delete a voice note file
export async function deleteVoiceNote(req: Request<{ filename: string }>, res: Response) {
	try {
		const { filename } = req.params;
		
		// Sanitize filename to prevent directory traversal
		const sanitizedFilename = path.basename(filename);
		
		// Determine the uploads directory path
		const pathParts = __dirname.split(path.sep);
		const inDist = pathParts.includes('dist');
		const uploadsPath = inDist
			? path.join(__dirname, '../../../../data/voice-notes')
			: path.join(__dirname, '../../../data/voice-notes');
		
		const filePath = path.join(uploadsPath, sanitizedFilename);
		
		// Check if file exists and delete it
		try {
			await fs.unlink(filePath);
			res.json({ message: 'Voice note deleted successfully' });
		} catch {
			return res.status(404).json({ error: 'Voice note not found' });
		}
	} catch (error) {
		console.error('Error deleting voice note:', error);
		res.status(500).json({ error: 'Failed to delete voice note' });
	}
}
