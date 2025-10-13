/**
 * API type definitions
 */

import type { Organisation, HierarchyNode } from './hierarchy';

export interface HierarchyResponse {
	organisations: Organisation[];
}

export interface CreateHierarchyItemBody {
	id: string;
	type: string;
	name: string;
	parentId?: string;
}

export interface ApiResponse<T> {
	message: string;
	node?: T;
}

export interface DeleteResponse {
	message: string;
	deleted: {
		node: HierarchyNode;
		descendantsCount: number;
		descendants: HierarchyNode[];
	};
}
