import cors from 'cors';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
	origin: function (
		origin: string | undefined,
		callback: (err: Error | null, allow?: boolean) => void
	) {
		// Allow requests with no origin (mobile apps, etc.)
		if (!origin) return callback(null, true);

		const allowedOrigins = [
			'http://localhost:3000',
			'http://127.0.0.1:3000',
			'http://localhost:5173', // Vite dev server
			'http://127.0.0.1:5173',
		];

		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		} else {
			return callback(new Error('Not allowed by CORS'), false);
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	exposedHeaders: ['X-Total-Count'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the web app's build directory
// Find the project root (where apps/ folder is located)
let projectRoot = __dirname;
while (!fs.existsSync(path.join(projectRoot, 'apps')) && projectRoot !== '/') {
	projectRoot = path.dirname(projectRoot);
}

const webDistPath = path.join(projectRoot, 'apps', 'web', 'dist');

console.log('Current directory:', __dirname);
console.log('Project root:', projectRoot);
console.log('Web dist path:', webDistPath);
console.log('Web dist exists:', fs.existsSync(webDistPath));

if (fs.existsSync(webDistPath)) {
	const files = fs.readdirSync(webDistPath);
	console.log('Files in web dist:', files);
} else {
	console.error('WARNING: Web dist directory does not exist!');
}

app.use(express.static(webDistPath, { 
	fallthrough: true,
	index: false // Don't serve index.html automatically for directories
}));

// API routes
import authRoutes from './api/routes/auth.routes.js';
import notesRoutes from './api/routes/notes.routes.js';
import hierarchyRoutes from './api/routes/hierarchy.routes.js';
import voiceNotesRoutes from './api/routes/voiceNotes.routes.js';

app.get('/api/health', (req: Request, res: Response) => {
	console.log('Health check');
	res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Use auth routes for authentication
app.use('/api', authRoutes);

// Use notes routes for all notes routes
app.use('/api', notesRoutes);

// Use hierarchy routes for all hierarchy routes
app.use('/api', hierarchyRoutes);

// Use voice notes routes for voice note uploads
app.use('/api', voiceNotesRoutes);

// Catch-all handler for client-side routing
app.use((req: Request, res: Response) => {
	// Only serve index.html for non-API routes and non-asset routes
	if (!req.path.startsWith('/api') && !req.path.startsWith('/assets')) {
		const indexPath = path.join(webDistPath, 'index.html');
		console.log('Serving index.html from:', indexPath);
		res.sendFile(indexPath, (err) => {
			if (err) {
				console.error('Error serving index.html:', err);
				res.status(500).send('Error loading application');
			}
		});
	} else {
		res.status(404).send('Not found');
	}
});

// Initialize database and start server
async function startServer(): Promise<void> {
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
