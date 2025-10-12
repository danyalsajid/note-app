import { createSignal } from 'solid-js';
import type { Note } from '../types';

/**
 * Notes store for managing note-related state and operations
 */

// Currently editing note ID
const [editingNoteId, setEditingNoteId] = createSignal<string | null>(null);

// Note being created/edited
const [draftNote, setDraftNote] = createSignal<Partial<Note> | null>(null);

// Loading state for note operations
const [notesLoading, setNotesLoading] = createSignal(false);

// Error state for note operations
const [notesError, setNotesError] = createSignal<string | null>(null);

/**
 * Start editing a note
 */
export const startEditingNote = (noteId: string, note: Note) => {
	setEditingNoteId(noteId);
	setDraftNote({ ...note });
};

/**
 * Cancel editing
 */
export const cancelEditing = () => {
	setEditingNoteId(null);
	setDraftNote(null);
};

/**
 * Update draft note content
 */
export const updateDraftNote = (updates: Partial<Note>) => {
	setDraftNote((prev) => (prev ? { ...prev, ...updates } : updates));
};

/**
 * Start creating a new note
 */
export const startCreatingNote = (attachedToId: string, attachedToType: string) => {
	setDraftNote({
		content: '',
		attachedToId,
		attachedToType,
		tags: null,
	});
};

/**
 * Save note (create or update)
 * TODO: Implement API calls when note endpoints are available
 */
export const saveNote = async () => {
	if (!draftNote()) return;

	setNotesLoading(true);
	setNotesError(null);

	try {
		// TODO: Implement API call to create/update note
		// if (editingNoteId()) {
		//   await notesService.updateNote(editingNoteId()!, draftNote()!);
		// } else {
		//   await notesService.createNote(draftNote()!);
		// }

		// Clear draft and editing state
		setEditingNoteId(null);
		setDraftNote(null);
	} catch (err) {
		setNotesError(err instanceof Error ? err.message : 'Failed to save note');
	} finally {
		setNotesLoading(false);
	}
};

/**
 * Delete a note
 * TODO: Implement API call when note endpoints are available
 */
export const deleteNote = async (_noteId: string) => {
	setNotesLoading(true);
	setNotesError(null);

	try {
		// TODO: Implement API call to delete note
		// await notesService.deleteNote(_noteId);
	} catch (err) {
		setNotesError(err instanceof Error ? err.message : 'Failed to delete note');
	} finally {
		setNotesLoading(false);
	}
};

// Export signals for reactive access
export { editingNoteId, draftNote, notesLoading, notesError };
