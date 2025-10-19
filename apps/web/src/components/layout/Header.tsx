import { createSignal, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import OnlineStatusIndicator from '../ui/OnlineStatusIndicator';
import { isMobileView } from '../../utils';
import styles from './Header.module.css';

interface HeaderProps {
	onSearch: (query: string) => void;
	onLogout: () => void;
	onMenuToggle?: () => void;
}

export default function Header(props: HeaderProps) {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = createSignal('');
	const [isSearchFocused, setIsSearchFocused] = createSignal(false);
	let debounceTimeout: ReturnType<typeof setTimeout>;

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
			{/* Mobile Menu Toggle - only show on mobile */}
			{isMobileView() && (
				<button
					onClick={() => props.onMenuToggle?.()}
					class={styles.menuToggle}
					title="Toggle Menu"
				>
					<i class="fas fa-bars" />
				</button>
			)}

			{/* Logo/Brand */}
			<div
				class={`${styles.brand} cursor-pointer`}
				onClick={() => navigate('/')}
				title="Go to Home"
			>
				<div class={styles.brandIcon}>
					<i class="fas fa-sticky-note" />
				</div>
				<h1 class={styles.brandTitle}>NoteApp</h1>
			</div>

			{/* Search Bar */}
			<form onSubmit={handleSearchSubmit} class={styles.searchForm}>
				<div class={`${styles.searchContainer} ${isSearchFocused() ? styles.searchContainerFocused : ''}`}>
					<div class={styles.searchIcon}>
						<i class={`fas fa-search ${isSearchFocused() ? 'text-blue-500' : 'text-gray-400'}`} />
					</div>
					<input
						type="text"
						value={searchQuery()}
						onInput={handleSearchInput}
						onFocus={() => setIsSearchFocused(true)}
						onBlur={() => setIsSearchFocused(false)}
						placeholder="Search notes..."
						class={styles.searchInput}
					/>
				</div>
			</form>

			{/* Right Section */}
			<div class={styles.rightSection}>
				{/* Online Status Indicator */}
				<OnlineStatusIndicator />

				{/* User Profile */}
				<div class={styles.userProfile}>
					<div class={styles.userAvatar}>
						<i class="fas fa-user" />
					</div>
					<div class={styles.userInfo}>
						<span class={styles.userName}>Welcome back!</span>
					</div>
				</div>

				{/* Logout Button */}
				<button
					onClick={() => props.onLogout()}
					class={styles.logoutButton}
					title="Logout"
				>
					<i class="fas fa-sign-out-alt" />
					<span class={styles.logoutText}>Logout</span>
				</button>
			</div>
		</header>
	);
}
