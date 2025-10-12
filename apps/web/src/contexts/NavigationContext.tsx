import { createContext, useContext, ParentComponent } from 'solid-js';
import { createSignal } from 'solid-js';
import type { Organisation, HierarchyNode, Note } from '../types';
import { hierarchyService } from '../services/hierarchyService';
import { notesService } from '../services/notesService';

/**
 * Navigation Context Type Definition
 */
type NavigationContextType = {
	// State
	organisations: () => Organisation[];
	loading: () => boolean;
	error: () => string | null;
	selectedItem: () => HierarchyNode | null;
	selectedItemLoading: () => boolean;
	searchResults: () => Note[];
	searchQuery: () => string;
	isSearching: () => boolean;
	
	// Actions
	fetchHierarchyTree: () => Promise<void>;
	fetchHierarchyItem: (id: string) => Promise<void>;
	createHierarchyItem: (data: {
		id: string;
		type: string;
		name: string;
		parentId?: string;
	}) => Promise<void>;
	updateHierarchyItem: (
		id: string,
		data: { name?: string; type?: string }
	) => Promise<void>;
	deleteHierarchyItem: (id: string) => Promise<void>;
	clearSelectedItem: () => void;
	searchNotes: (query: string) => Promise<void>;
	clearSearch: () => void;
};

/**
 * Create the Navigation Context
 */
const NavigationContext = createContext<NavigationContextType>();

/**
 * Navigation Provider Component
 */
export const NavigationProvider: ParentComponent = (props) => {
	// State signals
	const [organisations, setOrganisations] = createSignal<Organisation[]>([]);
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const [selectedItem, setSelectedItem] = createSignal<HierarchyNode | null>(null);
	const [selectedItemLoading, setSelectedItemLoading] = createSignal(false);
	const [searchResults, setSearchResults] = createSignal<Note[]>([]);
	const [searchQuery, setSearchQuery] = createSignal('');
	const [isSearching, setIsSearching] = createSignal(false);

	/**
	 * Fetch the complete hierarchy tree
	 */
	const fetchHierarchyTree = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await hierarchyService.getHierarchyTree();
			setOrganisations(data.organisations);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to load hierarchy'
			);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Fetch a single hierarchy item by ID
	 */
	const fetchHierarchyItem = async (id: string) => {
		setSelectedItemLoading(true);
		setError(null);
		try {
			const item = await hierarchyService.getHierarchyItem(id);
			setSelectedItem(item);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load item');
			setSelectedItem(null);
		} finally {
			setSelectedItemLoading(false);
		}
	};

	/**
	 * Create a new hierarchy item
	 */
	const createHierarchyItem = async (data: {
		id: string;
		type: string;
		name: string;
		parentId?: string;
	}) => {
		await hierarchyService.createHierarchyItem(data);
		// Refresh hierarchy tree
		await fetchHierarchyTree();
	};

	/**
	 * Update a hierarchy item
	 */
	const updateHierarchyItem = async (
		id: string,
		data: { name?: string; type?: string }
	) => {
		await hierarchyService.updateHierarchyItem(id, data);
		// Refresh hierarchy tree
		await fetchHierarchyTree();
		// Refresh selected item if it's the one being updated
		if (selectedItem()?.id === id) {
			await fetchHierarchyItem(id);
		}
	};

	/**
	 * Delete a hierarchy item
	 */
	const deleteHierarchyItem = async (id: string) => {
		await hierarchyService.deleteHierarchyItem(id);
		// Refresh hierarchy tree
		await fetchHierarchyTree();
		// Clear selected item if it was deleted
		if (selectedItem()?.id === id) {
			setSelectedItem(null);
		}
	};

	/**
	 * Clear selected item
	 */
	const clearSelectedItem = () => {
		setSelectedItem(null);
	};

	/**
	 * Search notes by query
	 */
	const searchNotes = async (query: string) => {
		setSearchQuery(query);
		
		if (!query || query.trim() === '') {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}

		setIsSearching(true);
		setError(null);
		try {
			const results = await notesService.searchNotes(query);
			setSearchResults(results);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to search notes');
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	/**
	 * Clear search results
	 */
	const clearSearch = () => {
		setSearchQuery('');
		setSearchResults([]);
		setIsSearching(false);
	};

	// Context value
	const contextValue: NavigationContextType = {
		// State
		organisations,
		loading,
		error,
		selectedItem,
		selectedItemLoading,
		searchResults,
		searchQuery,
		isSearching,
		
		// Actions
		fetchHierarchyTree,
		fetchHierarchyItem,
		createHierarchyItem,
		updateHierarchyItem,
		deleteHierarchyItem,
		clearSelectedItem,
		searchNotes,
		clearSearch,
	};

	return (
		<NavigationContext.Provider value={contextValue}>
			{props.children}
		</NavigationContext.Provider>
	);
};

/**
 * Custom hook to use the Navigation Context
 */
export const useNavigation = () => {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error('useNavigation must be used within a NavigationProvider');
	}
	return context;
};
