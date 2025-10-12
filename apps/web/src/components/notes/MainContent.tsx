import { Show, createEffect } from 'solid-js';
import { useParams } from '@solidjs/router';
import NotesSection from './NotesSection';
import ItemHeader from '../tree/ItemHeader';
import { useNavigation } from '../../contexts';
import {
	getTypeLabel,
	getTypeColor,
	getTypeIcon,
	formatDate,
} from '../../utils';
import styles from './MainContent.module.css';

export default function MainContent() {
	const params = useParams();
	const navigation = useNavigation();

	// Fetch item when params.id changes
	createEffect(() => {
		const id = params.id;
		if (!id) {
			navigation.clearSelectedItem();
			return;
		}

		void navigation.fetchHierarchyItem(id);
	});

	const handleAddNote = () => {
		// TODO: Implement add note functionality
		// For now, just a placeholder
	};

	return (
		<main class={styles.main}>
			<Show when={navigation.selectedItemLoading()}>
				<div class={styles.centerContent}>
					<div class={styles.loading}>Loading...</div>
				</div>
			</Show>

			<Show when={navigation.error()}>
				<div class={styles.centerContent}>
					<div class={styles.error}>{navigation.error()}</div>
				</div>
			</Show>

			<Show
				when={!navigation.selectedItemLoading() && !navigation.error() && navigation.selectedItem()}
				fallback={
					<Show when={!navigation.selectedItemLoading() && !navigation.error()}>
						<div class={styles.emptyState}>
							<div class={styles.emptyIcon}>
								<i class="fas fa-mouse-pointer text-6xl text-gray-300" />
							</div>
							<h1 class={styles.emptyTitle}>
								Note App
							</h1>
							<p class={styles.emptyText}>
								Select an item from the hierarchy to view its
								details and notes.
							</p>
						</div>
					</Show>
				}
			>
				<div class={styles.contentWrapper}>
					<ItemHeader
						selectedItem={navigation.selectedItem()!}
						getTypeIcon={getTypeIcon}
						getTypeColor={getTypeColor}
						getTypeLabel={getTypeLabel}
						formatDate={formatDate}
					/>

					{/* Notes Section */}
					<NotesSection
						selectedItem={navigation.selectedItem()!}
						formatDate={formatDate}
						onAddNote={handleAddNote}
					/>
				</div>
			</Show>
		</main>
	);
}
