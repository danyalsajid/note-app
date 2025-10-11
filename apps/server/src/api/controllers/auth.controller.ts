import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { generateId, getJWTSecret, getAdminPasscode } from '../../utils/auth.js';
import type { 
	AuthRequest, 
	LoginRequestBody, 
	SignupRequestBody
} from '../../types/auth.types.js';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function login(req: Request<object, object, LoginRequestBody>, res: Response): Promise<void> {
	try {
		const { username, password } = req.body;

		// Validation
		if (!username || !password) {
			res.status(400).json({ error: 'Username and password are required' });
			return;
		}

		// Find user by username (case insensitive)
		const userList = await db
			.select()
			.from(users)
			.where(eq(users.username, username.toLowerCase()))
			.limit(1);

		const user = userList[0];

		if (!user) {
			res.status(401).json({ error: 'Invalid credentials' });
			return;
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			res.status(401).json({ error: 'Invalid credentials' });
			return;
		}

		// Generate JWT token
		const JWT_SECRET = getJWTSecret();
		const token = jwt.sign(
			{
				id: user.id,
				username: user.username,
				role: user.role,
				name: user.name
			},
			JWT_SECRET,
			{ expiresIn: '24h' }
		);

		// Remove password from response
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = user;

		res.json({
			token,
			user: userWithoutPassword
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Login failed' });
	}
}

/**
 * POST /api/auth/signup
 * Register a new user
 */
export async function signup(req: Request<object, object, SignupRequestBody>, res: Response): Promise<void> {
	try {
		const { username, password, email, name, role, adminPasscode } = req.body;

		// Validation
		if (!username || !password || !email || !name) {
			res.status(400).json({ error: 'Username, password, email, and name are required' });
			return;
		}

		// Role validation - only allow admin and clinician
		const allowedRoles = ['admin', 'clinician'];
		if (role && !allowedRoles.includes(role.toLowerCase())) {
			res.status(400).json({ error: 'Invalid role. Only admin and clinician roles are allowed' });
			return;
		}

		// Admin passcode validation
		const ADMIN_PASSCODE = getAdminPasscode();
		if (role && role.toLowerCase() === 'admin') {
			if (!adminPasscode) {
				res.status(400).json({ error: 'Admin passcode is required for administrator accounts' });
				return;
			}
			if (adminPasscode !== ADMIN_PASSCODE) {
				res.status(400).json({ error: 'Invalid admin passcode' });
				return;
			}
		}

		// Password strength validation
		if (password.length < 6) {
			res.status(400).json({ error: 'Password must be at least 6 characters long' });
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			res.status(400).json({ error: 'Please enter a valid email address' });
			return;
		}

		// Check if username already exists (case insensitive)
		const existingUsers = await db
			.select()
			.from(users)
			.where(eq(users.username, username.toLowerCase()));

		if (existingUsers.length > 0) {
			res.status(409).json({ error: 'Username already exists' });
			return;
		}

		// Check if email already exists
		const existingEmails = await db
			.select()
			.from(users)
			.where(eq(users.email, email));

		if (existingEmails.length > 0) {
			res.status(409).json({ error: 'Email already exists' });
			return;
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const newUser = {
			id: generateId('user'),
			username: username.toLowerCase(),
			password: hashedPassword,
			email,
			name,
			role: role ? role.toLowerCase() : 'clinician', // Default role
			createdAt: new Date().toISOString()
		};

		// Insert user
		await db.insert(users).values(newUser);

		// Generate token for immediate login
		const JWT_SECRET = getJWTSecret();
		const token = jwt.sign(
			{
				id: newUser.id,
				username: newUser.username,
				role: newUser.role,
				name: newUser.name
			},
			JWT_SECRET,
			{ expiresIn: '24h' }
		);

		// Remove password from response
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = newUser;

		res.status(201).json({
			token,
			user: userWithoutPassword,
			message: 'User created successfully'
		});
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({ error: 'Signup failed' });
	}
}

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
export function logout(req: Request, res: Response): void {
	// With JWT, logout is primarily handled client-side by removing the token
	// This endpoint exists for consistency and potential future session management
	res.json({ message: 'Logged out successfully' });
}

/**
 * GET /api/auth/me
 * Get current user information
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
	try {
		if (!req.user) {
			res.status(401).json({ error: 'Not authenticated' });
			return;
		}

		// Fetch fresh user data from database
		const userList = await db
			.select()
			.from(users)
			.where(eq(users.id, req.user.id))
			.limit(1);

		const user = userList[0];

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		// Remove password from response
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = user;
		res.json(userWithoutPassword);
	} catch (error) {
		console.error('Get user error:', error);
		res.status(500).json({ error: 'Failed to get user info' });
	}
}
