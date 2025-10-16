import type { Note } from '../types';
import { getAuthHeaders, getAuthHeadersForFormData } from '../utils/authHeaders';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api`;

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
		const response = await fetch(`${API_URL}/notes`, {
			method: 'POST',
			headers: getAuthHeaders(),
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
		const response = await fetch(`${API_URL}/notes/${id}`, {
			method: 'PUT',
			headers: getAuthHeaders(),
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
		const response = await fetch(`${API_URL}/notes/${id}`, {
			method: 'DELETE',
			headers: getAuthHeaders(),
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
			`${API_BASE_URL}/notes/search?q=${encodeURIComponent(query)}`,
			{
				headers: getAuthHeaders(),
			}
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

		const response = await fetch(`${API_URL}/voice-notes/upload`, {
			method: 'POST',
			headers: getAuthHeadersForFormData(),
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
		const response = await fetch(`${API_URL}/voice-notes/${filename}`, {
			method: 'DELETE',
			headers: getAuthHeaders(),
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
		return `${API_URL}/voice-notes/${filename}`;
	},

	/**
	 * Fetch voice note as blob with authentication
	 */
	async fetchVoiceNoteBlob(filename: string): Promise<string> {
		const response = await fetch(`${API_URL}/voice-notes/${filename}`, {
			method: 'GET',
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error('Failed to fetch voice note');
		}

		const blob = await response.blob();
		return URL.createObjectURL(blob);
	},

	/**
	 * Get all unique tags from notes
	 */
	async getAllTags(): Promise<string[]> {
		const response = await fetch(`${API_URL}/notes/tags`, {
			headers: getAuthHeaders(),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to fetch tags');
		}
		return response.json();
	},

	/**
	 * Get notes by tag
	 */
	async getNotesByTag(tag: string): Promise<Note[]> {
		if (!tag || tag.trim() === '') {
			return [];
		}
		const response = await fetch(
			`${API_URL}/notes/by-tag/${encodeURIComponent(tag)}`,
			{
				headers: getAuthHeaders(),
			}
		);
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to fetch notes by tag');
		}
		return response.json();
	},
};
