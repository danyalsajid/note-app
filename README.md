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

This will start both the backend server and frontend web app concurrently for local development.

**Note for Deployment**: On platforms like Railway, only the server is deployed as a single service, serving both API and static frontend files.

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


# Deployment Guide for Railway

## Production Setup

This server is configured to work with Railway's deployment platform.

### Environment Variables

Set these in your Railway project settings:

```env
DATABASE_URL=./data/database.db
NODE_ENV=production
PORT=3001  # Railway will override this automatically
```


### Database

- **Development**: Uses `./data/database.db` (local file)
- **Production**: Railway will create a fresh database on first deployment
- **Migrations**: Run automatically when deploying (if new migrations exist)

### Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Set Environment Variables**: Add the variables above in Railway dashboard
3. **Deploy**: Railway will automatically build and deploy your app
4. **Database Setup**: The first deployment will create a fresh database

### Database Scripts

```bash
# Generate new migrations (run locally)
npm run db:generate

# Apply migrations (run locally or in production)
npm run db:migrate

# Reset database (development only)
npm run db:reset
```