import { createSignal, onMount, For, Show } from 'solid-js';
import type { Organisation, Team, Client, Episode } from '../types/hierarchy';
import { hierarchyService } from '../services/hierarchyService';
import { useNavigate, useParams } from '@solidjs/router';

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
								<TreeNode
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

// Configuration for each node type
const NODE_CONFIG = {
	organisation: {
		icon: 'fas fa-building',
		color: '#ef4444',
		fontSize: '1.25rem',
		childType: 'team',
		childrenKey: 'teams',
	},
	team: {
		icon: 'fas fa-users',
		color: '#3b82f6',
		fontSize: '1.25rem',
		childType: 'client',
		childrenKey: 'clients',
	},
	client: {
		icon: 'fas fa-user',
		color: '#2563eb',
		fontSize: '1.25rem',
		childType: 'episode',
		childrenKey: 'episodes',
	},
	episode: {
		icon: 'fas fa-file-alt',
		color: '#ca8a04',
		fontSize: '1.15rem',
		childType: null,
		childrenKey: null,
	},
} as const;

// Generic Tree Node Component
interface TreeNodeProps {
	item: Organisation | Team | Client | Episode;
	type: 'organisation' | 'team' | 'client' | 'episode';
	level: number;
	onAddChild: (parentId: string, childType: string) => void;
	selectedItemId: string | null;
	onNavigate: (path: string) => void;
}

function TreeNode(props: TreeNodeProps) {
	const config = () => NODE_CONFIG[props.type];
	const paddingLeft = () => props.level * 1.5; // 1.5rem per level for proper indentation
	const hasChildren = () => {
		const cfg = config();
		if (!cfg.childrenKey) return false;
		const item = props.item as unknown as Record<string, unknown>;
		const childArray = item[cfg.childrenKey] as unknown[];
		return childArray && Array.isArray(childArray) && childArray.length > 0;
	};
	const canAddChild = () => config().childType !== null;
	const children = () => {
		const cfg = config();
		if (!cfg.childrenKey) return [];
		const item = props.item as unknown as Record<string, unknown>;
		return (item[cfg.childrenKey] || []) as (Team | Client | Episode)[];
	};

	const isSelected = () => props.selectedItemId === props.item.id;

	return (
		<div class="space-y-1">
			<div
				class={`flex items-center justify-between py-3 pr-2 rounded group cursor-pointer transition-colors ${
					isSelected() ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-gray-50'
				}`}
				style={{ "padding-left": `${0.5 + paddingLeft()}rem` }}
				onClick={() => props.onNavigate(`/item/${props.item.id}`)}
			>
				<div class="flex items-center gap-3">
					<i class={config().icon} style={{ "font-size": config().fontSize, "color": config().color }} />
					<span class={`font-normal ${isSelected() ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
						{props.item.name}
					</span>
				</div>
				<Show when={canAddChild()}>
					<button
						onClick={(e) => {
							e.stopPropagation();
							props.onAddChild(props.item.id, config().childType!);
						}}
						class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition opacity-100"
						title={`Add ${config().childType}`}
					>
						+
					</button>
				</Show>
			</div>
			<Show when={hasChildren()}>
				<div>
					<For each={children()}>
						{(child) => (
							<TreeNode
								item={child}
								type={config().childType as 'team' | 'client' | 'episode'}
								level={props.level + 1}
								onAddChild={props.onAddChild}
								selectedItemId={props.selectedItemId}
								onNavigate={props.onNavigate}
							/>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
