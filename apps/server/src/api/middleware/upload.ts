import multer, { type StorageEngine } from 'multer';
import type { Request } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the uploads directory path
const pathParts = __dirname.split(path.sep);
const inDist = pathParts.includes('dist');
const uploadsPath = inDist
	? path.join(__dirname, '../../../../data/voice-notes')
	: path.join(__dirname, '../../../data/voice-notes');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsPath)) {
	fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configure multer storage
const storage: StorageEngine = multer.diskStorage({
	destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
		cb(null, uploadsPath);
	},
	filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
		// Generate unique filename with timestamp
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const ext = path.extname(file.originalname) || '.webm';
		cb(null, `voice-note-${uniqueSuffix}${ext}`);
	},
});

// File filter to only accept audio files
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	const allowedMimeTypes = [
		'audio/webm',
		'audio/ogg',
		'audio/wav',
		'audio/mp3',
		'audio/mpeg',
		'audio/mp4',
		'audio/x-m4a',
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type. Only audio files are allowed.'));
	}
};

// Create multer upload instance
export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});
