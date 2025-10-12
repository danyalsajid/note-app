import { Show, For } from 'solid-js';
import type { HierarchyNode } from '../../types';
import Note from './Note';

interface NotesSectionProps {
	selectedItem: HierarchyNode;
	formatDate: (dateString: string) => string;
	onAddNote: () => void;
}

export default function NotesSection(props: NotesSectionProps) {
	return (
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
					<i class="fas fa-sticky-note text-gray-600" />
					Notes
					<Show
						when={
							props.selectedItem.notes &&
							props.selectedItem.notes!.length > 0
						}
					>
						<span class="text-sm font-normal text-gray-500">
							({props.selectedItem.notes!.length})
						</span>
					</Show>
				</h2>
				<button
					class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
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
					<div class="text-center py-12">
						<i class="fas fa-file-alt text-4xl text-gray-300 mb-3" />
						<p class="text-gray-500">
							No notes yet. Add your first note to get started.
						</p>
					</div>
				}
			>
				<div class="space-y-4">
					<For each={props.selectedItem.notes}>
						{note => (
							<Note note={note} formatDate={props.formatDate} />
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
