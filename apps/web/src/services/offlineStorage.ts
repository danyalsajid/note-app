import type { CreateNoteBody, UpdateNoteBody } from './notesService';

export interface PendingNote {
	id: string; // Temporary ID for offline notes
	type: 'create' | 'update';
	data: CreateNoteBody | (UpdateNoteBody & { noteId: string });
	timestamp: number;
}

const STORAGE_KEY = 'pending_notes';

export const offlineStorage = {
	/**
	 * Get all pending notes from localStorage
	 */
	getPendingNotes(): PendingNote[] {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch (error) {
			console.error('Failed to get pending notes:', error);
			return [];
		}
	},

	/**
	 * Add a new pending note to localStorage
	 */
	addPendingNote(note: PendingNote): void {
		try {
			const pending = this.getPendingNotes();
			pending.push(note);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
		} catch (error) {
			console.error('Failed to add pending note:', error);
			throw new Error('Failed to save note offline');
		}
	},

	/**
	 * Remove a pending note from localStorage
	 */
	removePendingNote(id: string): void {
		try {
			const pending = this.getPendingNotes();
			const filtered = pending.filter(note => note.id !== id);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
		} catch (error) {
			console.error('Failed to remove pending note:', error);
		}
	},

	/**
	 * Clear all pending notes
	 */
	clearPendingNotes(): void {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.error('Failed to clear pending notes:', error);
		}
	},

	/**
	 * Generate a temporary ID for offline notes
	 */
	generateTempId(): string {
		return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	},
};
