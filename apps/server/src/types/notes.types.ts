/**
 * Note-related type definitions
 */

// Request body types for notes API
export interface CreateNoteBody {
	content: string;
	attachedToId: string;
	attachedToType: string;
	tags?: string[];
	voiceNoteFilename?: string;
	voiceNoteDuration?: number;
}

export interface UpdateNoteBody {
	content?: string;
	tags?: string[];
	voiceNoteFilename?: string;
	voiceNoteDuration?: number;
}

// Note response type
export interface Note {
	id: string;
	content: string;
	attachedToId: string;
	attachedToType: string;
	tags: string | null;
	voiceNoteFilename: string | null;
	voiceNoteDuration: number | null;
	createdAt: string;
	updatedAt: string;
}
