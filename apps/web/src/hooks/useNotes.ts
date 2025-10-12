import { createMemo } from 'solid-js';
import type { HierarchyNode, Note } from '../types';

/**
 * Custom hook for working with notes
 */
export const useNotes = (item: HierarchyNode | null) => {
	// Get notes from the item
	const notes = createMemo(() => item?.notes || []);

	// Check if item has notes
	const hasNotes = createMemo(() => notes().length > 0);

	// Get note count
	const noteCount = createMemo(() => notes().length);

	// Get most recent note
	const latestNote = createMemo<Note | null>(() => {
		const allNotes = notes();
		if (allNotes.length === 0) return null;

		return allNotes.reduce((latest, current) => {
			return new Date(current.createdAt) > new Date(latest.createdAt)
				? current
				: latest;
		});
	});

	// Sort notes by date (newest first)
	const sortedNotes = createMemo(() => {
		return [...notes()].sort((a, b) => {
			return (
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
			);
		});
	});

	return {
		notes,
		hasNotes,
		noteCount,
		latestNote,
		sortedNotes,
	};
};
