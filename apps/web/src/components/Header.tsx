import { createSignal } from 'solid-js';

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
		<header class="bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm h-16">
			{/* Search Bar */}
			<form onSubmit={handleSearchSubmit} class="flex-1 max-w-2xl">
				<div class="relative">
					<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<i class="fas fa-search text-gray-400" />
					</div>
					<input
						type="text"
						value={searchQuery()}
						onInput={handleSearchInput}
						placeholder="Search notes..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</form>

			{/* Logout Button */}
			<button
				onClick={() => props.onLogout()}
				class="px-4 py-2 border border-gray-400 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 hover:border-gray-500 transition flex items-center gap-2 ml-4"
				title="Logout"
			>
				<i class="fas fa-sign-out-alt" />
				<span>Logout</span>
			</button>
		</header>
	);
}
