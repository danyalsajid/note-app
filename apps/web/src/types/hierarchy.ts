/**
 * Hierarchy node type definitions
 */

export type HierarchyNodeType = 'organisation' | 'team' | 'client' | 'episode';

// Base hierarchy node interface
export interface HierarchyNode {
	id: string;
	type: HierarchyNodeType;
	name: string;
	createdAt: string;
	updatedAt: string;
	noteIds: string[];
	notes?: unknown[]; // Using unknown[] to avoid circular dependency with Note type
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
