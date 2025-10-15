/**
 * Utility function to get authorization headers
 */
export function getAuthHeaders(): HeadersInit {
	const token = localStorage.getItem('auth_token');
	
	if (token) {
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		};
	}
	
	return {
		'Content-Type': 'application/json',
	};
}

/**
 * Utility function to get authorization headers for multipart/form-data
 */
export function getAuthHeadersForFormData(): HeadersInit {
	const token = localStorage.getItem('auth_token');
	
	if (token) {
		return {
			Authorization: `Bearer ${token}`,
		};
	}
	
	return {};
}
