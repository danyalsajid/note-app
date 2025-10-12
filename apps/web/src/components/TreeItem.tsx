import { For, Show } from 'solid-js';
import type { Organisation, Team, Client, Episode } from '../types/hierarchy';

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

// Generic Tree Item Component Props
interface TreeItemProps {
	item: Organisation | Team | Client | Episode;
	type: 'organisation' | 'team' | 'client' | 'episode';
	level: number;
	onAddChild: (parentId: string, childType: string) => void;
	selectedItemId: string | null;
	onNavigate: (path: string) => void;
}

export default function TreeItem(props: TreeItemProps) {
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
							<TreeItem
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
