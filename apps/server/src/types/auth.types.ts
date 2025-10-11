import type { Request } from 'express';

/**
 * JWT payload structure
 */
export interface JWTPayload {
	id: string;
	username: string;
	role: string;
	name: string;
}

/**
 * User object without password
 */
export interface UserWithoutPassword {
	id: string;
	username: string;
	email: string;
	name: string;
	role: string;
	createdAt: string;
}

/**
 * Extended Express Request with user information
 */
export interface AuthRequest extends Request {
	user?: JWTPayload;
}

/**
 * Login request body
 */
export interface LoginRequestBody {
	username: string;
	password: string;
}

/**
 * Signup request body
 */
export interface SignupRequestBody {
	username: string;
	password: string;
	email: string;
	name: string;
	role?: string;
	adminPasscode?: string;
}
