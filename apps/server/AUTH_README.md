# Authentication System Documentation

## Overview

This authentication system provides secure user authentication using JWT (JSON Web Tokens) and bcrypt for password hashing. It supports role-based access control with `admin` and `clinician` roles.

## Features

- ✅ User registration (signup)
- ✅ User login with JWT token generation
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (admin, clinician)
- ✅ Admin passcode protection
- ✅ Email validation
- ✅ Token-based authentication middleware
- ✅ Current user endpoint

## API Endpoints

### 1. POST `/api/auth/signup`

Register a new user.

**Request Body:**

```json
{
	"username": "johndoe",
	"password": "securepassword123",
	"email": "john@example.com",
	"name": "John Doe",
	"role": "clinician", // Optional: "admin" or "clinician" (default: "clinician")
	"adminPasscode": "000000" // Required only if role is "admin"
}
```

**Response (201):**

```json
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"user": {
		"id": "user-1234567890-abc123",
		"username": "johndoe",
		"email": "john@example.com",
		"name": "John Doe",
		"role": "clinician",
		"createdAt": "2024-01-01T00:00:00.000Z"
	},
	"message": "User created successfully"
}
```

**Validation Rules:**

- Username, password, email, and name are required
- Password must be at least 6 characters
- Email must be valid format
- Username must be unique (case insensitive)
- Email must be unique
- Role must be either "admin" or "clinician"
- Admin role requires valid admin passcode

### 2. POST `/api/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
	"username": "johndoe",
	"password": "securepassword123"
}
```

**Response (200):**

```json
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"user": {
		"id": "user-1234567890-abc123",
		"username": "johndoe",
		"email": "john@example.com",
		"name": "John Doe",
		"role": "clinician",
		"createdAt": "2024-01-01T00:00:00.000Z"
	}
}
```

### 3. GET `/api/auth/me`

Get current authenticated user information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
	"id": "user-1234567890-abc123",
	"username": "johndoe",
	"email": "john@example.com",
	"name": "John Doe",
	"role": "clinician",
	"createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. POST `/api/auth/logout`

Logout user (client-side token removal).

**Response (200):**

```json
{
	"message": "Logged out successfully"
}
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# JWT Secret - CHANGE THIS IN PRODUCTION
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Admin Passcode - CHANGE THIS IN PRODUCTION
ADMIN_PASSCODE=000000

# Database URL (optional, defaults to ./data/database.db)
DATABASE_URL=./data/database.db
```

## Middleware

### `requireAuth`

Protects routes by requiring a valid JWT token.

**Usage:**

```typescript
import { requireAuth } from './api/middleware/auth.middleware.js';

router.get('/protected-route', requireAuth, (req, res) => {
	// req.user contains the decoded JWT payload
	console.log(req.user.id, req.user.username, req.user.role);
	res.json({ message: 'Protected data' });
});
```

### `requireAdmin`

Requires both authentication and admin role. Must be used after `requireAuth`.

**Usage:**

```typescript
import { requireAuth, requireAdmin } from './api/middleware/auth.middleware.js';

router.delete('/admin-only', requireAuth, requireAdmin, (req, res) => {
	res.json({ message: 'Admin-only action' });
});
```

## TypeScript Types

### `JWTPayload`

```typescript
interface JWTPayload {
	id: string;
	username: string;
	role: string;
	name: string;
}
```

### `AuthRequest`

Extended Express Request with user information:

```typescript
interface AuthRequest extends Request {
	user?: JWTPayload;
}
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Tokens expire after 24 hours
3. **Case-Insensitive Usernames**: Usernames are stored and compared in lowercase
4. **Admin Protection**: Admin role requires a passcode
5. **Input Validation**: All inputs are validated before processing
6. **Error Handling**: Sensitive information is not exposed in error messages

## Client-Side Usage Example

```typescript
// Login
const loginResponse = await fetch('/api/auth/login', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ username: 'johndoe', password: 'password123' }),
});
const { token, user } = await loginResponse.json();

// Store token (e.g., in localStorage)
localStorage.setItem('token', token);

// Make authenticated requests
const response = await fetch('/api/auth/me', {
	headers: {
		Authorization: `Bearer ${token}`,
	},
});
const currentUser = await response.json();

// Logout (remove token client-side)
localStorage.removeItem('token');
await fetch('/api/auth/logout', { method: 'POST' });
```

## File Structure

```
apps/server/src/
├── api/
│   ├── controllers/
│   │   └── auth.controller.ts      # Authentication logic
│   ├── middleware/
│   │   └── auth.middleware.ts      # Auth middleware
│   └── routes/
│       └── auth.routes.ts          # Auth routes
├── types/
│   └── auth.types.ts               # TypeScript types
└── utils/
    └── auth.ts                     # Helper functions
```

## Testing

You can test the authentication endpoints using curl or any API client:

```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "name": "Test User",
    "role": "clinician"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# Get current user (replace TOKEN with actual token)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Notes

- Default admin passcode is `000000` - **CHANGE THIS IN PRODUCTION**
- Default JWT secret is set in code - **USE ENVIRONMENT VARIABLE IN PRODUCTION**
- Tokens expire after 24 hours
- Logout is handled client-side by removing the token
- All timestamps are in ISO 8601 format
