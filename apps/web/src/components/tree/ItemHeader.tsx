import { createSignal, onMount, onCleanup } from 'solid-js';
import type { HierarchyNode } from '../../types';
import styles from './ItemHeader.module.css';

interface ItemHeaderProps {
	selectedItem: HierarchyNode;
	getTypeIcon: (type: string) => string;
	getTypeColor: (type: string) => string;
	getTypeLabel: (type: string) => string;
	formatDate: (dateString: string) => string;
	onEdit?: (item: HierarchyNode) => void;
	onDelete?: (item: HierarchyNode) => void;
}

export default function ItemHeader(props: ItemHeaderProps) {
	const [showMenu, setShowMenu] = createSignal(false);
	let menuContainerRef: HTMLDivElement | undefined;

	const handleEdit = () => {
		setShowMenu(false);
		if (props.onEdit) {
			props.onEdit(props.selectedItem);
		}
	};

	const handleDelete = () => {
		setShowMenu(false);
		if (props.onDelete) {
			props.onDelete(props.selectedItem);
		}
	};

	const handleClickOutside = (event: Event) => {
		if (menuContainerRef && !menuContainerRef.contains(event.target as Node)) {
			setShowMenu(false);
		}
	};

	onMount(() => {
		if (typeof window !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onCleanup(() => {
		if (typeof window !== 'undefined') {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	return (
		<div class={styles.container}>
			<div class={styles.topSection}>
				<div class={styles.titleArea}>
					<div class={styles.iconBox}>
						<i
							class={props.getTypeIcon(props.selectedItem.type)}
							style={{ 'font-size': '1.5rem', color: '#4b5563' }}
						/>
					</div>
					<div>
						<h1 class={styles.title}>
							{props.selectedItem.name}
						</h1>
						<span
							class={`${styles.badge} ${props.getTypeColor(props.selectedItem.type)}`}
						>
							{props.getTypeLabel(props.selectedItem.type)}
						</span>
					</div>
				</div>
				{(props.onEdit || props.onDelete) && (
					<div class={styles.menuContainer} ref={menuContainerRef}>
						<button
							class={styles.menuButton}
							onClick={() => setShowMenu(!showMenu())}
						>
							<i class="fas fa-ellipsis-v" />
						</button>
						{showMenu() && (
							<div class={styles.dropdown}>
								{props.onEdit && (
									<button
										class={styles.dropdownItem}
										onClick={handleEdit}
									>
										<i class="fas fa-edit" />
										Edit
									</button>
								)}
								{props.onDelete && (
									<button
										class={styles.dropdownItem}
										onClick={handleDelete}
									>
										<i class="fas fa-trash" />
										Delete
									</button>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Metadata */}
			<div class={styles.metadata}>
				<div>
					<p class={styles.metadataLabel}>ID</p>
					<p class={styles.metadataValueMono}>
						{props.selectedItem.id}
					</p>
				</div>
				<div>
					<p class={styles.metadataLabel}>Type</p>
					<p class={styles.metadataValue}>
						{props.getTypeLabel(props.selectedItem.type)}
					</p>
				</div>
				<div>
					<p class={styles.metadataLabel}>Created At</p>
					<p class={styles.metadataValue}>
						{props.formatDate(props.selectedItem.createdAt)}
					</p>
				</div>
				<div>
					<p class={styles.metadataLabel}>Updated At</p>
					<p class={styles.metadataValue}>
						{props.formatDate(props.selectedItem.updatedAt)}
					</p>
				</div>
			</div>
		</div>
	);
}
