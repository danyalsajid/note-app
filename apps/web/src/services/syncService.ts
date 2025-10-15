import { notesService, type CreateNoteBody, type UpdateNoteBody } from './notesService';
import { offlineStorage } from './offlineStorage';
import type { PendingNote } from './offlineStorage';

export const syncService = {
	/**
	 * Sync all pending notes with the server
	 * Returns the number of successfully synced notes
	 */
	async syncPendingNotes(): Promise<{ synced: number; failed: number }> {
		const pendingNotes = offlineStorage.getPendingNotes();
		
		if (pendingNotes.length === 0) {
			return { synced: 0, failed: 0 };
		}

		let synced = 0;
		let failed = 0;

		for (const pendingNote of pendingNotes) {
			try {
				if (pendingNote.type === 'create') {
					// Only sync typed notes (notes without voice attachments)
					const data = pendingNote.data as CreateNoteBody;
					if (!data.voiceNoteFilename) {
						await notesService.createNote(data);
						offlineStorage.removePendingNote(pendingNote.id);
						synced++;
					} else {
						// Skip voice notes
						offlineStorage.removePendingNote(pendingNote.id);
					}
				} else if (pendingNote.type === 'update') {
					const data = pendingNote.data as UpdateNoteBody & { noteId: string };
					if (!data.voiceNoteFilename) {
						const { noteId, ...updateData } = data;
						await notesService.updateNote(noteId, updateData);
						offlineStorage.removePendingNote(pendingNote.id);
						synced++;
					} else {
						// Skip voice notes
						offlineStorage.removePendingNote(pendingNote.id);
					}
				}
			} catch (error) {
				console.error('Failed to sync note:', error);
				failed++;
			}
		}

		return { synced, failed };
	},

	/**
	 * Check if there are any pending notes
	 */
	hasPendingNotes(): boolean {
		return offlineStorage.getPendingNotes().length > 0;
	},

	/**
	 * Get the count of pending notes
	 */
	getPendingNotesCount(): number {
		return offlineStorage.getPendingNotes().length;
	},
};
