/**
 * Note type definitions
 */

export interface Note {
	id: string;
	content: string;
	attachedToId: string;
	attachedToType: string;
	tags: string | null;
	createdAt: string;
	updatedAt: string;
}
