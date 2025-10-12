import cors from 'cors';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:5173'
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
  exposedHeaders: ['X-Total-Count']
};

// Apply CORS middleware
app.use(cors(corsOptions));

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
import authRoutes from './api/routes/auth.routes.js';
import notesRoutes from './api/routes/notes.routes.js';
import hierarchyRoutes from './api/routes/hierarchy.routes.js';

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

// Catch-all handler for client-side routing
app.use((req: Request, res: Response) => {
	res.sendFile(path.join(webDistPath, 'index.html'));
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
