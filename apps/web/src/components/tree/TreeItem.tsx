import { For, Show, createSignal } from 'solid-js';
import type { Organisation, Team, Client, Episode } from '../../types';
import { NODE_CONFIG } from '../../utils';
import styles from './TreeItem.module.css';

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
	const [isExpanded, setIsExpanded] = createSignal(true);
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

	const getIconContainerClasses = () => {
		const baseClasses = props.type === 'organisation' ? 'w-10 h-10' : 'w-9 h-9';
		if (props.type === 'organisation') {
			return `${baseClasses} ${styles.orgIcon}`;
		} else if (props.type === 'team') {
			return `${baseClasses} ${styles.teamIcon}`;
		} else if (props.type === 'client') {
			return `${baseClasses} ${styles.clientIcon}`;
		} else if (props.type === 'episode') {
			return `${baseClasses} ${styles.episodeIcon}`;
		}
		return baseClasses;
	};

	const toggleExpanded = (e: Event) => {
		e.stopPropagation();
		setIsExpanded(!isExpanded());
	};

	return (
		<div class={styles.wrapper}>
			<div
				class={`${styles.item} group ${isSelected() ? styles.itemSelected : styles.itemDefault}`}
				style={{ 'padding-left': `${0.5 + paddingLeft()}rem` }}
				onClick={() => props.onNavigate(`/item/${props.item.id}`)}
			>
				<div class={styles.itemContent}>
					<div class={getIconContainerClasses()}>
						<i
							class={config().icon}
							style={{
								'font-size': config().fontSize,
								color: config().color,
							}}
						/>
					</div>
					<span
						class={`${isSelected() ? styles.itemTextSelected : styles.itemText} ${props.type === 'organisation' ? 'font-medium' : ''}`}
					>
						{props.item.name}
					</span>
				</div>
				<div class={styles.itemActions}>
					<Show when={hasChildren()}>
						<button
							onClick={toggleExpanded}
							class={styles.chevronButton}
							title={isExpanded() ? 'Collapse' : 'Expand'}
						>
							<i class={`fa ${isExpanded() ? 'fa-chevron-down' : 'fa-chevron-right'}`} />
						</button>
					</Show>
					<Show when={canAddChild()}>
						<button
							onClick={e => {
								e.stopPropagation();
								props.onAddChild(
									props.item.id,
									config().childType!
								);
							}}
							class={styles.addButton}
							title={`Add ${config().childType}`}
						>
							+
						</button>
					</Show>
				</div>
			</div>
			<Show when={hasChildren() && isExpanded()}>
				<div class={`${styles.childrenContainer} ${props.level === 0 ? styles.orgChildrenContainer : ''}`}>
					<For each={children()}>
						{child => (
							<TreeItem
								item={child}
								type={
									config().childType as
										| 'team'
										| 'client'
										| 'episode'
								}
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
