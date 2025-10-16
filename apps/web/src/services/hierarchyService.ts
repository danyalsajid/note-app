import type {
	HierarchyResponse,
	CreateHierarchyItemBody,
	HierarchyNode,
	ApiResponse,
	DeleteResponse,
} from '../types';
import { getAuthHeaders } from '../utils/authHeaders';
import { API_BASE_URL } from '../config/api';

export const hierarchyService = {
	/**
	 * Fetch the complete hierarchy tree
	 */
	async getHierarchyTree(): Promise<HierarchyResponse> {
		const response = await fetch(`${API_BASE_URL}/api/hierarchy/tree`, {
			headers: getAuthHeaders(),
		});
		if (!response.ok) {
			throw new Error('Failed to fetch hierarchy tree');
		}
		return response.json();
	},

	/**
	 * Create a new hierarchy item
	 */
	async createHierarchyItem(
		data: CreateHierarchyItemBody
	): Promise<ApiResponse<HierarchyNode>> {
		const response = await fetch(`${API_BASE_URL}/api/hierarchy`, {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to create hierarchy item');
		}
		return response.json();
	},

	/**
	 * Update a hierarchy item
	 */
	async updateHierarchyItem(
		id: string,
		data: { name?: string; type?: string }
	): Promise<ApiResponse<HierarchyNode>> {
		const response = await fetch(`${API_BASE_URL}/api/hierarchy/${id}`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to update hierarchy item');
		}
		return response.json();
	},

	/**
	 * Delete a hierarchy item
	 */
	async deleteHierarchyItem(id: string): Promise<DeleteResponse> {
		const response = await fetch(`${API_BASE_URL}/api/hierarchy/${id}`, {
			method: 'DELETE',
			headers: getAuthHeaders(),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to delete hierarchy item');
		}
		return response.json();
	},

	/**
	 * Get a single hierarchy item by ID
	 */
	async getHierarchyItem(id: string): Promise<HierarchyNode> {
		const response = await fetch(`${API_BASE_URL}/api/hierarchy/${id}`, {
			headers: getAuthHeaders(),
		});
		if (!response.ok) {
			throw new Error('Failed to fetch hierarchy item');
		}
		return response.json();
	},
};
