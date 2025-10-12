import { createSignal } from 'solid-js';
import styles from './Header.module.css';

interface HeaderProps {
	onSearch: (query: string) => void;
	onLogout: () => void;
}

export default function Header(props: HeaderProps) {
	const [searchQuery, setSearchQuery] = createSignal('');

	const handleSearchInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setSearchQuery(value);
		props.onSearch(value);
	};

	const handleSearchSubmit = (e: Event) => {
		e.preventDefault();
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
