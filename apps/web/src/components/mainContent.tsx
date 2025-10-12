import { Show, createSignal, createEffect } from 'solid-js';
import type { Organisation, Team, Client, Episode } from '../types/hierarchy';
import { useParams } from "@solidjs/router";
import { hierarchyService } from '../services/hierarchyService';
import NotesSection from './NotesSection';
import ItemHeader from './ItemHeader';

export default function MainContent() {
	const params = useParams();
	const [selectedItem, setSelectedItem] = createSignal<Organisation | Team | Client | Episode | null>(null);
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	// Fetch item when params.id changes
	createEffect(() => {
		const id = params.id;
		if (!id) {
			setSelectedItem(null);
			return;
		}

		setLoading(true);
		setError(null);
		
		// Use void to handle async properly in createEffect
		void (async () => {
			try {
				const item = await hierarchyService.getHierarchyItem(id);
				setSelectedItem(item as Organisation | Team | Client | Episode);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load item');
				setSelectedItem(null);
			} finally {
				setLoading(false);
			}
		})();
	});

	const getTypeLabel = (type: string) => {
		const labels: Record<string, string> = {
			organisation: 'Organisation',
			team: 'Team',
			client: 'Client',
			episode: 'Episode',
		};
		return labels[type] || type;
	};

	const getTypeColor = (type: string) => {
		const colors: Record<string, string> = {
			organisation: 'bg-red-100 text-red-800',
			team: 'bg-blue-100 text-blue-800',
			client: 'bg-indigo-100 text-indigo-800',
			episode: 'bg-yellow-100 text-yellow-800',
		};
		return colors[type] || 'bg-gray-100 text-gray-800';
	};

	const getTypeIcon = (type: string) => {
		const icons: Record<string, string> = {
			organisation: 'fas fa-building',
			team: 'fas fa-users',
			client: 'fas fa-user',
			episode: 'fas fa-file-alt',
		};
		return icons[type] || 'fas fa-circle';
	};

	const handleAddNote = () => {
		// TODO: Implement add note functionality
		// For now, just a placeholder
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<main class="flex-1 p-8 overflow-auto bg-gray-50">
			<Show when={loading()}>
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
				when={!loading() && !error() && selectedItem()}
				fallback={
					<Show when={!loading() && !error()}>
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
