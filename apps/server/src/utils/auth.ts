import crypto from 'crypto';

/**
 * Generate a unique ID with a prefix
 */
export function generateId(prefix: string = 'id'): string {
	const timestamp = Date.now();
	const randomPart = crypto.randomBytes(8).toString('hex');
	return `${prefix}-${timestamp}-${randomPart}`;
}

/**
 * Get JWT secret from environment or use default for development
 */
export function getJWTSecret(): string {
	return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
}

/**
 * Get admin passcode from environment or use default
 */
export function getAdminPasscode(): string {
	return process.env.ADMIN_PASSCODE || '000000';
}
