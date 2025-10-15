/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import type { LoginRequest, SignupRequest, AuthResponse, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AuthService {
	/**
	 * Login user
	 */
	async login(credentials: LoginRequest): Promise<AuthResponse> {
		const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(credentials),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Login failed');
		}

		return response.json();
	}

	/**
	 * Signup new user
	 */
	async signup(userData: SignupRequest): Promise<AuthResponse> {
		const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Signup failed');
		}

		return response.json();
	}

	/**
	 * Logout user
	 */
	async logout(): Promise<void> {
		const token = this.getToken();
		
		if (token) {
			await fetch(`${API_BASE_URL}/api/auth/logout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});
		}

		this.removeToken();
	}

	/**
	 * Get current user
	 */
	async getCurrentUser(): Promise<User> {
		const token = this.getToken();

		if (!token) {
			throw new Error('No token found');
		}

		const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error('Failed to get current user');
		}

		return response.json();
	}

	/**
	 * Save token to localStorage
	 */
	saveToken(token: string): void {
		localStorage.setItem('auth_token', token);
	}

	/**
	 * Get token from localStorage
	 */
	getToken(): string | null {
		return localStorage.getItem('auth_token');
	}

	/**
	 * Remove token from localStorage
	 */
	removeToken(): void {
		localStorage.removeItem('auth_token');
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return !!this.getToken();
	}
}

export const authService = new AuthService();
