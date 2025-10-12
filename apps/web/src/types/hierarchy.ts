/**
 * Hierarchy-related type definitions for the frontend
 */

// Hierarchy node types
export type HierarchyNodeType = 'organisation' | 'team' | 'client' | 'episode';

// Note interface
export interface Note {
	id: string;
	content: string;
	attachedToId: string;
	attachedToType: string;
	tags: string | null;
	createdAt: string;
	updatedAt: string;
}

// Base hierarchy node interface
export interface HierarchyNode {
	id: string;
	type: HierarchyNodeType;
	name: string;
	createdAt: string;
	updatedAt: string;
	noteIds: string[];
	notes?: Note[];
}

// Episode node
export interface Episode extends HierarchyNode {
	type: 'episode';
	parentId: string;
}

// Client node
export interface Client extends HierarchyNode {
	type: 'client';
	parentId: string;
	episodes: Episode[];
}

// Team node
export interface Team extends HierarchyNode {
	type: 'team';
	parentId: string;
	clients: Client[];
}

// Organisation node
export interface Organisation extends HierarchyNode {
	type: 'organisation';
	parentId: null;
	teams: Team[];
}

// API response type
export interface HierarchyResponse {
	organisations: Organisation[];
}

// Request body types
export interface CreateHierarchyItemBody {
	id: string;
	type: string;
	name: string;
	parentId?: string;
}
