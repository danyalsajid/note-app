import { Show, createEffect, createSignal } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import NotesSection from './NotesSection';
import ItemHeader from '../tree/ItemHeader';
import NoteModal from '../ui/NoteModal';
import HierarchyItemModal from '../ui/HierarchyItemModal';
import { useNavigation } from '../../contexts';
import { notesService } from '../../services/notesService';
import { hierarchyService } from '../../services/hierarchyService';
import type { Note, HierarchyNode } from '../../types';
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
	const navigate = useNavigate();
	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [isHierarchyModalOpen, setIsHierarchyModalOpen] = createSignal(false);
	const [editingNote, setEditingNote] = createSignal<Note | null>(null);
	const [editingHierarchyItem, setEditingHierarchyItem] = createSignal<HierarchyNode | null>(null);
	const [isSaving, setIsSaving] = createSignal(false);
	const [isHierarchySaving, setIsHierarchySaving] = createSignal(false);

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

	const handleEditHierarchyItem = (item: HierarchyNode) => {
		setEditingHierarchyItem(item);
		setIsHierarchyModalOpen(true);
	};

	const handleDeleteHierarchyItem = (item: HierarchyNode) => {
		if (confirm(`Are you sure you want to delete this ${item.type}? This action cannot be undone.`)) {
			handleConfirmDelete(item);
		}
	};

	const handleConfirmDelete = async (item: HierarchyNode) => {
		try {
			await navigation.deleteHierarchyItem(item.id);
			// Navigate back to home page
			navigate('/');
		} catch (error) {
			console.error('Failed to delete hierarchy item:', error);
			alert('Failed to delete item. Please try again.');
		}
	};

	const handleSaveHierarchyItem = async (name: string) => {
		const item = editingHierarchyItem();
		if (!item) return;

		setIsHierarchySaving(true);
		try {
			await hierarchyService.updateHierarchyItem(item.id, { name });
			// Refresh the current item to update the name
			const currentId = params.id;
			if (currentId) {
				await navigation.fetchHierarchyItem(currentId);
			}
			setIsHierarchyModalOpen(false);
			setEditingHierarchyItem(null);
		} catch (error) {
			console.error('Failed to save hierarchy item:', error);
			alert('Failed to save item. Please try again.');
		} finally {
			setIsHierarchySaving(false);
		}
	};

	const handleCloseHierarchyModal = () => {
		setIsHierarchyModalOpen(false);
		setEditingHierarchyItem(null);
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
						onEdit={handleEditHierarchyItem}
						onDelete={handleDeleteHierarchyItem}
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

			{/* Hierarchy Item Modal */}
			<HierarchyItemModal
				isOpen={isHierarchyModalOpen()}
				onClose={handleCloseHierarchyModal}
				onSave={handleSaveHierarchyItem}
				item={editingHierarchyItem()}
				isLoading={isHierarchySaving()}
			/>
		</main>
	);
}
