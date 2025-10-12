import { onMount, For, Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import TreeItem from '../tree/TreeItem';
import AddItemModal from '../ui/AddItemModal';
import {
	organisations,
	loading,
	error,
	fetchHierarchyTree,
	createHierarchyItem,
} from '../../stores';
import styles from './Sidebar.module.css';

export default function Sidebar() {
	const navigate = useNavigate();
	const params = useParams();

	// Modal state management
	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [modalItemType, setModalItemType] = createSignal('');
	const [modalParentId, setModalParentId] = createSignal<string | undefined>(
		undefined
	);

	// Fetch hierarchy on component mount
	onMount(() => {
		fetchHierarchyTree();
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

			await createHierarchyItem({
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
		for (const org of organisations()) {
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
		for (const org of organisations()) {
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
			<div class={styles.container}>
				<div class={styles.padding}>
					{/* Header */}
					<div class={styles.header}>
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

					<Show when={loading()}>
						<div class={styles.loading}>
							Loading...
						</div>
					</Show>

					<Show when={error()}>
						<div class={styles.error}>
							{error()}
						</div>
					</Show>

					<Show when={!loading() && !error()}>
						<div class={styles.content}>
							<For each={organisations()}>
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
