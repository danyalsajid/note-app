import { Show, For, createEffect, onMount } from 'solid-js';
import { useNavigation } from '../../contexts';
import styles from './TagFilter.module.css';

export default function TagFilter() {
	const navigation = useNavigation();

	// Fetch tags when component mounts
	onMount(() => {
		navigation.fetchAllTags();
	});

	// Refetch tags when notes might have changed
	createEffect(() => {
		// Trigger refetch when search or filter changes
		if (!navigation.searchQuery() && !navigation.selectedTag()) {
			navigation.fetchAllTags();
		}
	});

	const handleTagClick = (tag: string) => {
		if (navigation.selectedTag() === tag) {
			// Deselect if clicking the same tag
			navigation.clearTagFilter();
		} else {
			// Clear search when filtering by tag
			if (navigation.searchQuery()) {
				navigation.clearSearch();
			}
			navigation.filterByTag(tag);
		}
	};

	return (
		<Show when={navigation.availableTags().length > 0}>
			<div class={styles.container}>
				<div class={styles.header}>
					<i class="fas fa-tags text-gray-600 mr-2" />
					<span class={styles.title}>Filter by Tags:</span>
				</div>
				<div class={styles.tagsList}>
					<For each={navigation.availableTags()}>
						{(tag) => (
							<button
								class={`${styles.tag} ${
									navigation.selectedTag() === tag ? styles.tagActive : ''
								}`}
								onClick={() => handleTagClick(tag)}
							>
								<i class="fas fa-tag mr-1" />
								{tag}
								<Show when={navigation.selectedTag() === tag}>
									<i class="fas fa-times ml-2" />
								</Show>
							</button>
						)}
					</For>
				</div>
			</div>
		</Show>
	);
}
