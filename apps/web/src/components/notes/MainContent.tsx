import { Show, For, createEffect, createSignal } from 'solid-js';
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
			// Remove from UI immediately (optimistic update)
			navigation.removeNoteFromSelectedItem(note.id);
			
			await notesService.deleteNote(note.id);
			
			// Try to refresh from server (will work when online, fail silently when offline)
			const currentId = params.id;
			if (currentId) {
				try {
					await navigation.fetchHierarchyItem(currentId);
				} catch {
					// Ignore fetch errors when offline - we already updated the UI optimistically
					console.log('[MainContent] Could not refresh from server (offline?)');
				}
			}
		} catch (error) {
			console.error('Failed to delete note:', error);
			alert('Failed to delete note. Please try again.');
		}
	};

	const handleSaveNote = async (content: string, tags: string[], voiceNoteFilename?: string | null, voiceNoteDuration?: number | null) => {
		setIsSaving(true);
		try {
			const selectedItem = navigation.selectedItem();
			if (!selectedItem) return;

			const currentNote = editingNote();
			
			if (currentNote) {
				// Update existing note
				const updatedNote = await notesService.updateNote(currentNote.id, {
					content,
					tags,
					voiceNoteFilename,
					voiceNoteDuration,
				});
				
				// Update the note in the selected item's notes array
				navigation.updateNoteInSelectedItem(updatedNote);
			} else {
				// Create new note
				console.log('[MainContent] Creating new note for item:', selectedItem.id);
				const newNote = await notesService.createNote({
					content,
					attachedToId: selectedItem.id,
					attachedToType: selectedItem.type,
					tags,
					voiceNoteFilename,
					voiceNoteDuration,
				});
				console.log('[MainContent] Note created:', newNote);
				
				// Add the new note to the selected item's notes array
				console.log('[MainContent] Adding note to UI');
				navigation.addNoteToSelectedItem(newNote);
				console.log('[MainContent] Note added to UI');
			}

			// Try to refresh from server (will work when online, fail silently when offline)
			const currentId = params.id;
			if (currentId) {
				try {
					await navigation.fetchHierarchyItem(currentId);
				} catch (error) {
					// Ignore fetch errors when offline - we already updated the UI optimistically
					console.log('[MainContent] Could not refresh from server (offline?)');
				}
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
			<Show when={navigation.selectedItemLoading() || navigation.isSearching()}>
				<div class={styles.centerContent}>
					<div class={styles.loading}>Loading...</div>
				</div>
			</Show>

			<Show when={navigation.error()}>
				<div class={styles.centerContent}>
					<div class={styles.error}>{navigation.error()}</div>
				</div>
			</Show>

			{/* Show search results when searching */}
			<Show when={navigation.searchQuery() && !navigation.isSearching() && !navigation.error()}>
				<div class={styles.contentWrapper}>
					<div class={styles.searchHeader}>
						<h1 class={styles.searchTitle}>
							<i class="fas fa-search text-gray-600 mr-3" />
							Search Results for "{navigation.searchQuery()}"
						</h1>
						<button
							class={styles.clearButton}
							onClick={() => navigation.clearSearch()}
						>
							<i class="fas fa-times mr-2" />
							Clear Search
						</button>
					</div>
					<Show
						when={navigation.searchResults().length > 0}
						fallback={
							<div class={styles.emptyState}>
								<div class={styles.emptyIcon}>
									<i class="fas fa-search text-6xl text-gray-300" />
								</div>
								<p class={styles.emptyText}>
									No notes found matching "{navigation.searchQuery()}"
								</p>
							</div>
						}
					>
						<div class={styles.searchResults}>
							<For each={navigation.searchResults()}>
								{(note: Note) => (
									<div 
										class={styles.searchResultItem}
										onClick={() => {
											navigation.clearSearch();
											navigate(`/item/${note.attachedToId}`);
										}}
									>
										<div class={styles.noteCard}>
											<div class={styles.noteContent}>
												{note.content}
											</div>
											<div class={styles.noteMeta}>
												<span class={styles.noteDate}>
													<i class="fas fa-calendar-alt mr-2" />
													{formatDate(note.createdAt)}
												</span>
												<Show when={note.tags}>
													<div class={styles.noteTags}>
														<For each={JSON.parse(note.tags || '[]')}>
															{(tag: string) => (
																<span class={styles.noteTag}>
																	{tag}
																</span>
															)}
														</For>
													</div>
												</Show>
											</div>
										</div>
									</div>
								)}
							</For>
						</div>
					</Show>
				</div>
			</Show>

			{/* Show regular content when not searching */}
			<Show
				when={!navigation.searchQuery() && !navigation.selectedItemLoading() && !navigation.error() && navigation.selectedItem()}
				fallback={
					<Show when={!navigation.searchQuery() && !navigation.selectedItemLoading() && !navigation.error()}>
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
						selectedItem={() => navigation.selectedItem()!}
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
