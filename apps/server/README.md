# Note App Server

Backend API server for the Note App, built with Express.js, TypeScript, and Drizzle ORM.

## Project Structure

```
src/
├── api/                    # API layer
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.ts       # Authentication endpoints
│   │   ├── hierarchy.controller.ts  # Hierarchy CRUD operations
│   │   └── notes.controller.ts      # Notes CRUD operations
│   ├── middleware/         # Express middleware
│   │   └── auth.middleware.ts       # JWT authentication
│   └── routes/            # Route definitions
│       ├── auth.routes.ts
│       ├── hierarchy.routes.ts
│       └── notes.routes.ts
├── db/                    # Database layer
│   ├── database.ts        # Database initialization
│   ├── index.ts          # Database connection
│   ├── schema.ts         # Drizzle ORM schema
│   └── seed.ts           # Seed data
├── types/                # TypeScript type definitions
│   ├── auth.types.ts     # Authentication types
│   ├── hierarchy.types.ts # Hierarchy types
│   └── notes.types.ts    # Notes types
├── utils/                # Utility functions
│   └── auth.ts          # Auth helpers
└── index.ts             # Application entry point
```

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM
- **Authentication**: JWT with bcrypt
- **Build Tool**: TypeScript Compiler (tsc)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (requires auth)

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Hierarchy
- `GET /api/hierarchy/tree` - Get complete hierarchy tree
- `POST /api/hierarchy` - Create a hierarchy item
- `PUT /api/hierarchy/:id` - Update a hierarchy item
- `DELETE /api/hierarchy/:id` - Delete a hierarchy item (cascading)

### Health Check
- `GET /api/health` - Server health status

## Database Schema

### Users
- Authentication and user management
- Roles: admin, clinician

### Hierarchy Nodes
- Organisation → Team → Client → Episode
- Closure table for efficient hierarchy queries

### Notes
- Attached to any hierarchy node
- Support for tags and timestamps

### Attachments
- File attachments for notes

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database

# Linting
npm run lint
npm run lint:fix
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - Database file path
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_PASSCODE` - Passcode for admin registration

## Type Safety

All controllers, routes, and database operations are fully typed with TypeScript:
- Request/Response types for all endpoints
- Proper typing for database queries
- Centralized type definitions in `/types` directory
- Strict TypeScript configuration with `strict: true`

## Code Organization

- **Controllers**: Handle business logic and request/response
- **Routes**: Define API endpoints and apply middleware
- **Middleware**: Authentication, validation, error handling
- **Types**: Centralized TypeScript definitions
- **Utils**: Reusable helper functions
- **Database**: Schema, migrations, and seed data
