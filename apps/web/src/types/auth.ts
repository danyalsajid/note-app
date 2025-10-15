/**
 * Authentication type definitions
 */

export interface User {
	id: string;
	username: string;
	email: string;
	name: string;
	role: string;
	createdAt: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface SignupRequest {
	username: string;
	password: string;
	email: string;
	name: string;
	role?: string;
	adminPasscode?: string;
}

export interface AuthResponse {
	token: string;
	user: User;
	message?: string;
}

export interface AuthError {
	error: string;
}
