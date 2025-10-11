/**
 * Hierarchy-related type definitions
 */

// Hierarchy node types
export type HierarchyNodeType = 'organisation' | 'team' | 'client' | 'episode';

// Base hierarchy node interface
export interface HierarchyNode {
	id: string;
	type: HierarchyNodeType;
	name: string;
	createdAt: string;
	updatedAt: string;
	noteIds: string[];
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

export interface UpdateHierarchyItemBody {
	name?: string;
	type?: string;
}

// Database query result types
export interface NodeWithParent {
	id: string;
	type: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	parentId: string | null;
}

export interface NoteAttachment {
	id: string;
	attachedToId: string;
}

// Parent-child type validation mapping
export const VALID_PARENT_TYPES: Record<string, string> = {
	team: 'organisation',
	client: 'team',
	episode: 'client',
};

export const VALID_HIERARCHY_TYPES: readonly HierarchyNodeType[] = [
	'organisation',
	'team',
	'client',
	'episode',
] as const;
