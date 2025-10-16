import { Show, For, createEffect, createSignal, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import NotesSection from './NotesSection';
import ItemHeader from '../tree/ItemHeader';
import NoteModal from '../ui/NoteModal';
import HierarchyItemModal from '../ui/HierarchyItemModal';
import { useNavigation } from '../../contexts';
import { notesService } from '../../services/notesService';
import { hierarchyService } from '../../services/hierarchyService';
import { offlineStorage } from '../../services/offlineStorage';
import { syncService } from '../../services/syncService';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
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
	const isOnline = useOnlineStatus();
	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [isHierarchyModalOpen, setIsHierarchyModalOpen] = createSignal(false);
	const [editingNote, setEditingNote] = createSignal<Note | null>(null);
	const [editingHierarchyItem, setEditingHierarchyItem] = createSignal<HierarchyNode | null>(null);
	const [isSaving, setIsSaving] = createSignal(false);
	const [isHierarchySaving, setIsHierarchySaving] = createSignal(false);
	const [isSyncing, setIsSyncing] = createSignal(false);

	// Sync pending notes when coming back online
	createEffect(() => {
		if (isOnline() && syncService.hasPendingNotes() && !isSyncing()) {
			void syncPendingNotes();
		}
	});

	// Initial sync check on mount
	onMount(() => {
		if (isOnline() && syncService.hasPendingNotes()) {
			void syncPendingNotes();
		}
	});

	const syncPendingNotes = async () => {
		setIsSyncing(true);
		try {
			const result = await syncService.syncPendingNotes();
			if (result.synced > 0) {
				// Refresh current item to show synced notes
				const currentId = params.id;
				if (currentId) {
					await navigation.fetchHierarchyItem(currentId);
				}
				// Refresh tags to reflect synced changes
				await navigation.fetchAllTags();
			}
		} catch {
			// Silently handle sync errors
		} finally {
			setIsSyncing(false);
		}
	};

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
			// Refresh tags to reflect changes
			await navigation.fetchAllTags();
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
			
			// Check if this is a voice note (should not be saved offline)
			const hasVoiceNote = voiceNoteFilename !== null && voiceNoteFilename !== undefined;
			
			// If offline and it's a typed note (no voice), save to localStorage
			if (!isOnline() && !hasVoiceNote) {
				if (currentNote) {
					// Update existing note offline
					offlineStorage.addPendingNote({
						id: offlineStorage.generateTempId(),
						type: 'update',
						data: {
							noteId: currentNote.id,
							content,
							tags,
							voiceNoteFilename: null,
							voiceNoteDuration: null,
						},
						timestamp: Date.now(),
					});
				} else {
					// Create new note offline
					offlineStorage.addPendingNote({
						id: offlineStorage.generateTempId(),
						type: 'create',
						data: {
							content,
							attachedToId: selectedItem.id,
							attachedToType: selectedItem.type,
							tags,
							voiceNoteFilename: null,
							voiceNoteDuration: null,
						},
						timestamp: Date.now(),
					});
				}
				
				setIsModalOpen(false);
				setEditingNote(null);
				alert('You are offline. Note saved locally and will be synced when you are back online.');
				return;
			}
			
			// If offline and has voice note, show error
			if (!isOnline() && hasVoiceNote) {
				alert('Cannot save voice notes while offline. Please connect to the internet.');
				setIsSaving(false);
				return;
			}
			
			// Online - save normally
			if (currentNote) {
				// Update existing note
				await notesService.updateNote(currentNote.id, {
					content,
					tags,
					voiceNoteFilename,
					voiceNoteDuration,
				});
			} else {
				// Create new note
				await notesService.createNote({
					content,
					attachedToId: selectedItem.id,
					attachedToType: selectedItem.type,
					tags,
					voiceNoteFilename,
					voiceNoteDuration,
				});
			}

			// Refresh the current item to update the notes list
			const currentId = params.id;
			if (currentId) {
				await navigation.fetchHierarchyItem(currentId);
			}
			// Refresh tags to reflect changes
			await navigation.fetchAllTags();

			setIsModalOpen(false);
			setEditingNote(null);
		} catch {
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

			{/* Show tag filtered results when filtering by tag */}
			<Show when={navigation.selectedTag() && !navigation.isFilteringByTag() && !navigation.error()}>
				<div class={styles.contentWrapper}>
					<div class={styles.searchHeader}>
						<h1 class={styles.searchTitle}>
							<i class="fas fa-tag text-gray-600 mr-3" />
							Notes tagged with "{navigation.selectedTag()}"
						</h1>
						<button
							class={styles.clearButton}
							onClick={() => navigation.clearTagFilter()}
						>
							<i class="fas fa-times mr-2" />
							Clear Filter
						</button>
					</div>
					<Show
						when={navigation.tagFilteredNotes().length > 0}
						fallback={
							<div class={styles.emptyState}>
								<div class={styles.emptyIcon}>
									<i class="fas fa-tag text-6xl text-gray-300" />
								</div>
								<p class={styles.emptyText}>
									No notes found with tag "{navigation.selectedTag()}"
								</p>
							</div>
						}
					>
						<div class={styles.searchResults}>
							<For each={navigation.tagFilteredNotes()}>
								{(note: Note) => (
									<div 
										class={styles.searchResultItem}
										onClick={() => {
											navigation.clearTagFilter();
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

			{/* Show regular content when not searching or filtering */}
			<Show
				when={!navigation.searchQuery() && !navigation.selectedTag() && !navigation.selectedItemLoading() && !navigation.error() && navigation.selectedItem()}
				fallback={
					<Show when={!navigation.searchQuery() && !navigation.selectedTag() && !navigation.selectedItemLoading() && !navigation.error()}>
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
