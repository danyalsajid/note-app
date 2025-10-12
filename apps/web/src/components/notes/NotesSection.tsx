import { Show, For } from 'solid-js';
import type { HierarchyNode, Note as NoteType } from '../../types';
import Note from './Note';
import styles from './NotesSection.module.css';

interface NotesSectionProps {
	selectedItem: HierarchyNode;
	formatDate: (dateString: string) => string;
	onAddNote: () => void;
	onEditNote: (note: NoteType) => void;
	onDeleteNote: (note: NoteType) => void;
}

export default function NotesSection(props: NotesSectionProps) {
	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<h2 class={styles.title}>
					<i class="fas fa-sticky-note text-gray-600" />
					Notes
					<Show
						when={
							props.selectedItem.notes &&
							props.selectedItem.notes!.length > 0
						}
					>
						<span class={styles.count}>
							({props.selectedItem.notes!.length})
						</span>
					</Show>
				</h2>
				<button
					class={styles.addButton}
					onClick={() => props.onAddNote()}
				>
					<i class="fas fa-plus mr-2" />
					Add Note
				</button>
			</div>

			<Show
				when={
					props.selectedItem.notes &&
					props.selectedItem.notes!.length > 0
				}
				fallback={
					<div class={styles.empty}>
						<i class={`fas fa-file-alt ${styles.emptyIcon}`} />
						<p class={styles.emptyText}>
							No notes yet. Add your first note to get started.
						</p>
					</div>
				}
			>
				<div class={styles.notesList}>
					<For each={props.selectedItem.notes}>
						{note => (
							<Note 
								note={note} 
								formatDate={props.formatDate}
								onEdit={props.onEditNote}
								onDelete={props.onDeleteNote}
							/>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
