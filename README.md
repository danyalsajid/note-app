# Note App

A modern, full-stack note-taking application with hierarchical organization, voice notes, and AI-powered features.

## Features

### Hierarchical Organization
- **Multi-level structure**: Organize notes under Organizations → Teams → Clients → Episodes

### Rich Note Attachments
- **Text content**: Add notes at any level of Hierarchicy
- **Custom tags**: Organize notes with custom tagging system
- **Search functionality**: Search across all notes and hierarchies
- **Offline notes**: Add notes when offline and sync when online
- **Voice notes**: Record voice notes directly in the browser
- **AI assistant**: AI summary of notes

## Architecture


### Modern Tech Stack
- **Frontend**: SolidJS + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Drizzle ORM
- **Deployment**: Railway-ready configuration

### Project Structure

```
note-app/
├── apps/
│   ├── web/                 # Frontend application
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   │   ├── layout/  # Header, Sidebar components
│   │   │   │   ├── notes/   # Note editor and display
│   │   │   │   ├── tree/    # Hierarchy tree navigation
│   │   │   │   └── ui/      # Reusable UI components
│   │   │   ├── contexts/    # State management
│   │   │   ├── hooks/       # Custom SolidJS hooks
│   │   │   ├── pages/       # Route components
│   │   │   ├── services/    # API integration services
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   └── utils/       # Utility functions
│   │   └── package.json     # Frontend dependencies
│   │
│   └── server/              # Backend API server
│       ├── src/
│       │   ├── api/         # API routes and controllers
│       │   │   ├── controllers/  # Request handlers
│       │   │   ├── middleware/   # Auth and validation
│       │   │   └── routes/       # Route definitions
│       │   ├── db/          # Database configuration
│       │   │   ├── schema.ts     # Database schema
│       │   │   ├── database.ts  # DB connection
│       │   │   └── seed.ts       # Sample data
│       │   ├── services/    # Business logic
│       │   ├── types/       # TypeScript definitions
│       │   └── utils/       # Helper functions
│       ├── drizzle/         # Database migrations
│       └── package.json     # Backend dependencies
├── package.json            # Root monorepo configuration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js (version 19 or higher)
- npm (version 6 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd note-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   This installs dependencies for the root project and all workspaces (`apps/server` and `apps/web`).

### Development

Start both frontend and backend servers concurrently:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Notes
- `GET /api/notes` - Get all notes for user
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search?q=query` - Search notes

### Hierarchy
- `GET /api/hierarchy` - Get hierarchy tree
- `POST /api/hierarchy` - Create hierarchy node
- `PUT /api/hierarchy/:id` - Update hierarchy node
- `DELETE /api/hierarchy/:id` - Delete hierarchy node

### Voice Notes
- `POST /api/voice-notes/upload` - Upload voice note
- `GET /api/voice-notes/:filename` - Get voice note file


## Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3001
DATABASE_URL=./data/database.db
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key
```


## Additional Scripts

### Development Scripts
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Clean build artifacts
- `npm run lint` - Run ESLint on all projects
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database Scripts
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations
- `npm run db:reset` - Reset development database