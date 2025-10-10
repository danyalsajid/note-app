## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd note-app
   ```

2. Install dependencies for the entire project:
   ```bash
   npm install
   ```
   
   This will install dependencies for the root project and all workspaces (`apps/server` and `apps/web`).

### Development

To start the development servers for both the backend and frontend:

```bash
npm run dev
```

This will concurrently start:
- Backend server (typically on `http://localhost:3001` or as configured in `apps/server`)
- Frontend web app (on `http://localhost:3000` as configured in `apps/web/vite.config.ts`)

### Production

To build and start the applications:

```bash
npm run build
npm run start
```

### Additional Scripts

- `npm run install:all` - Explicitly install dependencies for root, server, and web (alternative to `npm install`)
- `npm run clean` - Clean build artifacts from both applications

## Project Structure

- `apps/web/` - Frontend web application
- `apps/server/` - Backend server

## Development

This is a monorepo setup with separate applications for web and server components.
