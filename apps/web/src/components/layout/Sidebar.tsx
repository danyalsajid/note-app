import { onMount, For, Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import TreeItem from '../tree/TreeItem';
import AddItemModal from '../ui/AddItemModal';
import { useNavigation } from '../../contexts';
import styles from './Sidebar.module.css';

interface SidebarProps {
	isOpen?: boolean;
	onClose?: () => void;
}

export default function Sidebar(props: SidebarProps) {
	const navigate = useNavigate();
	const params = useParams();
	const navigation = useNavigation();

	// Modal state management
	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [modalItemType, setModalItemType] = createSignal('');
	const [modalParentId, setModalParentId] = createSignal<string | undefined>(
		undefined
	);

	// Fetch hierarchy on component mount
	onMount(() => {
		navigation.fetchHierarchyTree();
	});

	const openModal = (itemType: string, parentId?: string) => {
		setModalItemType(itemType);
		setModalParentId(parentId);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setModalItemType('');
		setModalParentId(undefined);
	};

	const handleModalSubmit = async (name: string) => {
		try {
			const itemType = modalItemType();
			const parentId = modalParentId();
			const id = `${itemType}-${Date.now()}`;

			await navigation.createHierarchyItem({
				id,
				type: itemType,
				name,
				parentId,
			});

			closeModal();

			// Navigate to the newly created item
			navigate(`/item/${id}`);
		} catch (err) {
			console.error('Failed to create item:', err);
			// Modal will stay open, and the error will be logged
		}
	};

	const handleAddOrganisation = () => {
		openModal('organisation');
	};

	const handleAddChild = (parentId: string, childType: string) => {
		openModal(childType, parentId);
	};

	const getItemNameById = (id: string): string | null => {
		if (!id) return null;

		// Helper function to recursively search through hierarchy
		const findItemName = (items: any[]): string | null => {
			for (const item of items) {
				if (item.id === id) {
					return item.name;
				}

				// Check children based on item type
				if (item.teams) {
					const teamResult = findItemName(item.teams);
					if (teamResult) return teamResult;
				}
				if (item.clients) {
					const clientResult = findItemName(item.clients);
					if (clientResult) return clientResult;
				}
				if (item.episodes) {
					const episodeResult = findItemName(item.episodes);
					if (episodeResult) return episodeResult;
				}
			}
			return null;
		};

		// Search through all organisations
		for (const org of navigation.organisations()) {
			if (org.id === id) {
				return org.name;
			}
			const result = findItemName([org]);
			if (result) return result;
		}

		return null;
	};

	const getItemTypeById = (id: string): string | null => {
		if (!id) return null;

		// Helper function to recursively search through hierarchy
		const findItemType = (items: any[]): string | null => {
			for (const item of items) {
				if (item.id === id) {
					return item.type;
				}

				// Check children based on item type
				if (item.teams) {
					const teamResult = findItemType(item.teams);
					if (teamResult) return teamResult;
				}
				if (item.clients) {
					const clientResult = findItemType(item.clients);
					if (clientResult) return clientResult;
				}
				if (item.episodes) {
					const episodeResult = findItemType(item.episodes);
					if (episodeResult) return episodeResult;
				}
			}
			return null;
		};

		// Search through all organisations
		for (const org of navigation.organisations()) {
			if (org.id === id) {
				return org.type;
			}
			const result = findItemType([org]);
			if (result) return result;
		}

		return null;
	};

		return (
		<>
			{/* Mobile Overlay */}
			<Show when={props.isOpen}>
				<div 
					class={styles.overlay}
					onClick={() => props.onClose?.()}
				/>
			</Show>

			<div class={`${styles.container} ${props.isOpen ? styles.open : ''}`}>
				<div class={styles.padding}>
					{/* Header */}
					<div class={styles.header}>
						{/* Mobile Close Button */}
						<button
							onClick={() => props.onClose?.()}
							class={styles.closeButton}
							title="Close Menu"
						>
							<i class="fas fa-times" />
						</button>
						
						<div class={styles.headerContent}>
							<h3 class={styles.title}>
								Organizations
							</h3>
						</div>
						<button
							onClick={handleAddOrganisation}
							class={styles.addButton}
							title="Add Organisation"
						>
							<span class={styles.addButtonIcon}>+</span>
							<span>Add Org</span>
						</button>
					</div>

					<Show when={navigation.loading()}>
						<div class={styles.loading}>
							Loading...
						</div>
					</Show>

					<Show when={navigation.error()}>
						<div class={styles.error}>
							{navigation.error()}
						</div>
					</Show>

					<Show when={!navigation.loading() && !navigation.error()}>
						<div class={styles.content}>
							<For each={navigation.organisations()}>
								{org => (
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

			{/* Add Item Modal */}
			<AddItemModal
				isOpen={isModalOpen()}
				onClose={closeModal}
				onSubmit={handleModalSubmit}
				itemType={modalItemType()}
				parentName={
					modalParentId() ? getItemNameById(modalParentId()!) : null
				}
				parentType={
					modalParentId() ? getItemTypeById(modalParentId()!) : null
				}
			/>
		</>
	);
}
