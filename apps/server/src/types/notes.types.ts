/**
 * Note-related type definitions
 */

// Request body types for notes API
export interface CreateNoteBody {
	content: string;
	attachedToId: string;
	attachedToType: string;
	tags?: string[];
}

export interface UpdateNoteBody {
	content?: string;
	tags?: string[];
}

// Note response type
export interface Note {
	id: string;
	content: string;
	attachedToId: string;
	attachedToType: string;
	tags: string | null;
	createdAt: string;
	updatedAt: string;
}
