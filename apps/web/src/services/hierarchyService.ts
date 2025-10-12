import type {
	HierarchyResponse,
	CreateHierarchyItemBody,
	HierarchyNode,
	ApiResponse,
	DeleteResponse,
} from '../types';

const API_BASE_URL =
	import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const hierarchyService = {
	/**
	 * Fetch the complete hierarchy tree
	 */
	async getHierarchyTree(): Promise<HierarchyResponse> {
		const response = await fetch(`${API_BASE_URL}/hierarchy/tree`);
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
		const response = await fetch(`${API_BASE_URL}/hierarchy`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
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
		const response = await fetch(`${API_BASE_URL}/hierarchy/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
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
		const response = await fetch(`${API_BASE_URL}/hierarchy/${id}`, {
			method: 'DELETE',
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
		const response = await fetch(`${API_BASE_URL}/hierarchy/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch hierarchy item');
		}
		return response.json();
	},
};
