import type { Note } from '../types';

const API_BASE_URL =
	import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CreateNoteBody {
	content: string;
	attachedToId: string;
	attachedToType: string;
	tags?: string[];
}

export interface UpdateNoteBody {
	content: string;
	tags?: string[];
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
};
