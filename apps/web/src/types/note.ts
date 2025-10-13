/**
 * Note type definitions
 */

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
