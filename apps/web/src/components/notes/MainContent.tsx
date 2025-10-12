import { Show, createEffect } from 'solid-js';
import { useParams } from '@solidjs/router';
import NotesSection from './NotesSection';
import ItemHeader from '../tree/ItemHeader';
import {
	selectedItem,
	selectedItemLoading,
	error,
	fetchHierarchyItem,
	clearSelectedItem,
} from '../../stores';
import { getTypeLabel, getTypeColor, getTypeIcon, formatDate } from '../../utils';

export default function MainContent() {
	const params = useParams();

	// Fetch item when params.id changes
	createEffect(() => {
		const id = params.id;
		if (!id) {
			clearSelectedItem();
			return;
		}

		void fetchHierarchyItem(id);
	});

	const handleAddNote = () => {
		// TODO: Implement add note functionality
		// For now, just a placeholder
	};

	return (
		<main class="flex-1 p-8 overflow-auto bg-gray-50">
			<Show when={selectedItemLoading()}>
				<div class="flex items-center justify-center h-full">
					<div class="text-gray-500 text-lg">Loading...</div>
				</div>
			</Show>

			<Show when={error()}>
				<div class="flex items-center justify-center h-full">
					<div class="text-red-500 text-lg">{error()}</div>
				</div>
			</Show>

			<Show
				when={!selectedItemLoading() && !error() && selectedItem()}
				fallback={
					<Show when={!selectedItemLoading() && !error()}>
						<div class="flex flex-col items-center justify-center h-full text-center">
							<div class="mb-4">
								<i class="fas fa-mouse-pointer text-6xl text-gray-300" />
							</div>
							<h1 class="text-3xl text-gray-800 font-bold mb-2">Note App</h1>
							<p class="text-gray-600 text-lg">
								Select an item from the hierarchy to view its details and notes.
							</p>
						</div>
					</Show>
				}
			>
				<div class="max-w-4xl mx-auto">
					<ItemHeader
						selectedItem={selectedItem()!}
						getTypeIcon={getTypeIcon}
						getTypeColor={getTypeColor}
						getTypeLabel={getTypeLabel}
						formatDate={formatDate}
					/>

					{/* Notes Section */}
					<NotesSection
						selectedItem={selectedItem()!}
						formatDate={formatDate}
						onAddNote={handleAddNote}
					/>
				</div>
			</Show>
		</main>
	);
}
