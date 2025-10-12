import { createSignal, onMount, For, Show } from 'solid-js';
import type { Organisation } from '../types/hierarchy';
import { hierarchyService } from '../services/hierarchyService';
import { useNavigate, useParams } from '@solidjs/router';
import TreeItem from './TreeItem';

export default function Sidebar() {
	const navigate = useNavigate();
	const params = useParams();
	const [organisations, setOrganisations] = createSignal<Organisation[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	// Fetch hierarchy on component mount
	onMount(async () => {
		try {
			const data = await hierarchyService.getHierarchyTree();
			setOrganisations(data.organisations);
			setLoading(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load hierarchy');
			setLoading(false);
		}
	});

	const handleAddChild = async (parentId: string, childType: string) => {
		const name = prompt(`Enter name for new ${childType}:`);
		if (!name) return;

		try {
			const id = `${childType}-${Date.now()}`;
			await hierarchyService.createHierarchyItem({
				id,
				type: childType,
				name,
				parentId,
			});
			// Refresh hierarchy
			const data = await hierarchyService.getHierarchyTree();
			setOrganisations(data.organisations);
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to create item');
		}
	};

	const handleAddOrganisation = async () => {
		const name = prompt('Enter name for new organisation:');
		if (!name) return;

		try {
			const id = `organisation-${Date.now()}`;
			await hierarchyService.createHierarchyItem({
				id,
				type: 'organisation',
				name,
			});
			// Refresh hierarchy
			const data = await hierarchyService.getHierarchyTree();
			setOrganisations(data.organisations);
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to create organisation');
		}
	};

	return (
		<div class="w-[432px] h-screen bg-white border-r border-gray-200 overflow-y-auto">
			<div class="p-4">
				{/* Header */}
				<div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
					<div class="flex items-center gap-3">
						<h3 class="text-2xl font-semibold text-gray-900">Organizations</h3>
					</div>
					<button
						onClick={handleAddOrganisation}
						class="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition flex items-center gap-1.5"
						title="Add Organisation"
					>
						<span class="text-base leading-none">+</span>
						<span>Add Org</span>
					</button>
				</div>

				<Show when={loading()}>
					<div class="text-gray-500 text-center py-8">Loading...</div>
				</Show>

				<Show when={error()}>
					<div class="text-red-500 text-center py-8">{error()}</div>
				</Show>

				<Show when={!loading() && !error()}>
					<div class="space-y-1">
						<For each={organisations()}>
							{(org) => (
								<TreeItem
									item={org}
									type="organisation"
									level={0}
									onAddChild={handleAddChild}
									selectedItemId={params.id || null}
									onNavigate={navigate}
								/>
							)}
						</For>
					</div>
				</Show>
			</div>
		</div>
	);
}
