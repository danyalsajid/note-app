import { Show, createEffect, createSignal } from 'solid-js';
import { useParams } from '@solidjs/router';
import NotesSection from './NotesSection';
import ItemHeader from '../tree/ItemHeader';
import NoteModal from '../ui/NoteModal';
import { useNavigation } from '../../contexts';
import { notesService } from '../../services/notesService';
import type { Note } from '../../types';
import {
	getTypeLabel,
	getTypeColor,
	getTypeIcon,
	formatDate,
} from '../../utils';
import styles from './MainContent.module.css';

export default function MainContent() {
	const params = useParams();
	const navigation = useNavigation();
	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [editingNote, setEditingNote] = createSignal<Note | null>(null);
	const [isSaving, setIsSaving] = createSignal(false);

	// Fetch item when params.id changes
	createEffect(() => {
		const id = params.id;
		if (!id) {
			navigation.clearSelectedItem();
			return;
		}

		void navigation.fetchHierarchyItem(id);
	});

	const handleAddNote = () => {
		setEditingNote(null);
		setIsModalOpen(true);
	};

	const handleEditNote = (note: Note) => {
		setEditingNote(note);
		setIsModalOpen(true);
	};

	const handleDeleteNote = async (note: Note) => {
		try {
			await notesService.deleteNote(note.id);
			// Refresh the current item to update the notes list
			const currentId = params.id;
			if (currentId) {
				await navigation.fetchHierarchyItem(currentId);
			}
		} catch (error) {
			console.error('Failed to delete note:', error);
			alert('Failed to delete note. Please try again.');
		}
	};

	const handleSaveNote = async (content: string, tags: string[]) => {
		setIsSaving(true);
		try {
			const selectedItem = navigation.selectedItem();
			if (!selectedItem) return;

			const currentNote = editingNote();
			
			if (currentNote) {
				// Update existing note
				await notesService.updateNote(currentNote.id, {
					content,
					tags,
				});
			} else {
				// Create new note
				await notesService.createNote({
					content,
					attachedToId: selectedItem.id,
					attachedToType: selectedItem.type,
					tags,
				});
			}

			// Refresh the current item to update the notes list
			const currentId = params.id;
			if (currentId) {
				await navigation.fetchHierarchyItem(currentId);
			}

			setIsModalOpen(false);
			setEditingNote(null);
		} catch (error) {
			console.error('Failed to save note:', error);
			alert('Failed to save note. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingNote(null);
	};

	return (
		<main class={styles.main}>
			<Show when={navigation.selectedItemLoading()}>
				<div class={styles.centerContent}>
					<div class={styles.loading}>Loading...</div>
				</div>
			</Show>

			<Show when={navigation.error()}>
				<div class={styles.centerContent}>
					<div class={styles.error}>{navigation.error()}</div>
				</div>
			</Show>

			<Show
				when={!navigation.selectedItemLoading() && !navigation.error() && navigation.selectedItem()}
				fallback={
					<Show when={!navigation.selectedItemLoading() && !navigation.error()}>
						<div class={styles.emptyState}>
							<div class={styles.emptyIcon}>
								<i class="fas fa-mouse-pointer text-6xl text-gray-300" />
							</div>
							<h1 class={styles.emptyTitle}>
								Note App
							</h1>
							<p class={styles.emptyText}>
								Select an item from the hierarchy to view its
								details and notes.
							</p>
						</div>
					</Show>
				}
			>
				<div class={styles.contentWrapper}>
					<ItemHeader
						selectedItem={navigation.selectedItem()!}
						getTypeIcon={getTypeIcon}
						getTypeColor={getTypeColor}
						getTypeLabel={getTypeLabel}
						formatDate={formatDate}
					/>

					{/* Notes Section */}
					<NotesSection
						selectedItem={navigation.selectedItem()!}
						formatDate={formatDate}
						onAddNote={handleAddNote}
						onEditNote={handleEditNote}
						onDeleteNote={handleDeleteNote}
					/>
				</div>
			</Show>

			{/* Note Modal */}
			<NoteModal
				isOpen={isModalOpen()}
				onClose={handleCloseModal}
				onSave={handleSaveNote}
				note={editingNote()}
				isLoading={isSaving()}
			/>
		</main>
	);
}
