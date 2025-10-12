import { Show, For, createSignal, createEffect } from 'solid-js';
import type { Organisation, Team, Client, Episode } from '../types/hierarchy';
import { useParams } from "@solidjs/router";
import { hierarchyService } from '../services/hierarchyService';

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
					{/* Header Section */}
					<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
						<div class="flex items-start justify-between mb-4">
							<div class="flex items-center gap-4">
								<div class="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
									<i
										class={getTypeIcon(selectedItem()!.type)}
										style={{ "font-size": "1.5rem", "color": "#4b5563" }}
									/>
								</div>
								<div>
									<h1 class="text-3xl font-bold text-gray-900">{selectedItem()!.name}</h1>
									<span
										class={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getTypeColor(selectedItem()!.type)}`}
									>
										{getTypeLabel(selectedItem()!.type)}
									</span>
								</div>
							</div>
						</div>

						{/* Metadata */}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
							<div>
								<p class="text-sm text-gray-500 mb-1">ID</p>
								<p class="text-gray-900 font-mono text-sm">{selectedItem()!.id}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500 mb-1">Type</p>
								<p class="text-gray-900">{getTypeLabel(selectedItem()!.type)}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500 mb-1">Created At</p>
								<p class="text-gray-900">{formatDate(selectedItem()!.createdAt)}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500 mb-1">Updated At</p>
								<p class="text-gray-900">{formatDate(selectedItem()!.updatedAt)}</p>
							</div>
						</div>
					</div>

					{/* Notes Section */}
					<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div class="flex items-center justify-between mb-4">
							<h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
								<i class="fas fa-sticky-note text-gray-600" />
								Notes
								<Show when={selectedItem()!.notes && selectedItem()!.notes!.length > 0}>
									<span class="text-sm font-normal text-gray-500">
										({selectedItem()!.notes!.length})
									</span>
								</Show>
							</h2>
							<button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition">
								<i class="fas fa-plus mr-2" />
								Add Note
							</button>
						</div>

						<Show
							when={selectedItem()!.notes && selectedItem()!.notes!.length > 0}
							fallback={
								<div class="text-center py-12">
									<i class="fas fa-file-alt text-4xl text-gray-300 mb-3" />
									<p class="text-gray-500">No notes yet. Add your first note to get started.</p>
								</div>
							}
						>
							<div class="space-y-4">
								<For each={selectedItem()!.notes}>
									{(note) => (
										<div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
											<div class="flex items-start justify-between mb-2">
												<div class="flex-1">
													<p class="text-gray-800 whitespace-pre-wrap">{note.content}</p>
												</div>
												<button class="ml-2 text-gray-400 hover:text-gray-600 transition">
													<i class="fas fa-ellipsis-v" />
												</button>
											</div>
											<div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
												<span class="text-xs text-gray-500">
													<i class="fas fa-clock mr-1" />
													{formatDate(note.createdAt)}
												</span>
												<Show when={note.tags}>
													<div class="flex gap-1">
														<For each={JSON.parse(note.tags || '[]')}>
															{(tag) => (
																<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
																	{tag}
																</span>
															)}
														</For>
													</div>
												</Show>
											</div>
										</div>
									)}
								</For>
							</div>
						</Show>
					</div>
				</div>
			</Show>
		</main>
	);
}
