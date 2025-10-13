import type { Note } from '../types';

const API_BASE_URL =
	import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CreateNoteBody {
	content: string;
	attachedToId: string;
	attachedToType: string;
	tags?: string[];
	voiceNoteFilename?: string | null;
	voiceNoteDuration?: number | null;
}

export interface UpdateNoteBody {
	content: string;
	tags?: string[];
	voiceNoteFilename?: string | null;
	voiceNoteDuration?: number | null;
}

export const notesService = {
	/**
	 * Create a new note
	 */
	async createNote(data: CreateNoteBody): Promise<Note> {
		const response = await fetch(`${API_BASE_URL}/notes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to create note');
		}
		return response.json();
	},

	/**
	 * Update a note
	 */
	async updateNote(id: string, data: UpdateNoteBody): Promise<Note> {
		const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to update note');
		}
		return response.json();
	},

	/**
	 * Delete a note
	 */
	async deleteNote(id: string): Promise<{ message: string }> {
		const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to delete note');
		}
		return response.json();
	},

	/**
	 * Search notes by query
	 */
	async searchNotes(query: string): Promise<Note[]> {
		if (!query || query.trim() === '') {
			return [];
		}
		const response = await fetch(
			`${API_BASE_URL}/notes/search?q=${encodeURIComponent(query)}`
		);
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to search notes');
		}
		return response.json();
	},

	/**
	 * Upload a voice note file
	 */
	async uploadVoiceNote(audioBlob: Blob): Promise<{ filename: string; path: string }> {
		const formData = new FormData();
		formData.append('voiceNote', audioBlob, 'voice-note.webm');

		const response = await fetch(`${API_BASE_URL}/voice-notes/upload`, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to upload voice note');
		}

		return response.json();
	},

	/**
	 * Delete a voice note file
	 */
	async deleteVoiceNote(filename: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/voice-notes/${filename}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to delete voice note');
		}
	},

	/**
	 * Get voice note URL
	 */
	getVoiceNoteUrl(filename: string): string {
		return `${API_BASE_URL}/voice-notes/${filename}`;
	},
};
