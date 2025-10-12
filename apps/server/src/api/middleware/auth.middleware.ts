import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '../../utils/auth.js';
import type { AuthRequest, JWTPayload } from '../../types/auth.types.js';

/**
 * Middleware to require authentication
 * Verifies JWT token from Authorization header
 */
export function requireAuth(
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ error: 'No token provided' });
			return;
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix
		const JWT_SECRET = getJWTSecret();

		try {
			const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
			req.user = decoded;
			next();
		} catch {
			res.status(401).json({ error: 'Invalid or expired token' });
			return;
		}
	} catch (error) {
		console.error('Auth middleware error:', error);
		res.status(500).json({ error: 'Authentication failed' });
		return;
	}
}

/**
 * Middleware to require admin role
 * Must be used after requireAuth
 */
export function requireAdmin(
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void {
	if (!req.user) {
		res.status(401).json({ error: 'Authentication required' });
		return;
	}

	if (req.user.role !== 'admin') {
		res.status(403).json({ error: 'Admin access required' });
		return;
	}

	next();
}
