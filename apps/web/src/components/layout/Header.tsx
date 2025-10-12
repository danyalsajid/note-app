import { createSignal, onCleanup } from 'solid-js';
import styles from './Header.module.css';

interface HeaderProps {
	onSearch: (query: string) => void;
	onLogout: () => void;
}

export default function Header(props: HeaderProps) {
	const [searchQuery, setSearchQuery] = createSignal('');
	let debounceTimeout: any;

	// Cleanup timeout on component unmount
	onCleanup(() => {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}
	});

	const handleSearchInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setSearchQuery(value);

		// Clear existing timeout
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		// Set new timeout for debounced search
		debounceTimeout = setTimeout(() => {
			props.onSearch(value);
		}, 300); // 300ms debounce delay
	};

	const handleSearchSubmit = (e: Event) => {
		e.preventDefault();
		// Clear timeout and execute search immediately on form submit
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}
		props.onSearch(searchQuery());
	};

	return (
		<header class={styles.header}>
			{/* Search Bar */}
			<form onSubmit={handleSearchSubmit} class={styles.searchForm}>
				<div class={styles.searchContainer}>
					<div class={styles.searchIcon}>
						<i class="fas fa-search text-gray-400" />
					</div>
					<input
						type="text"
						value={searchQuery()}
						onInput={handleSearchInput}
						placeholder="Search notes..."
						class={styles.searchInput}
					/>
				</div>
			</form>

			{/* Logout Button */}
			<button
				onClick={() => props.onLogout()}
				class={styles.logoutButton}
				title="Logout"
			>
				<i class="fas fa-sign-out-alt" />
				<span>Logout</span>
			</button>
		</header>
	);
}
