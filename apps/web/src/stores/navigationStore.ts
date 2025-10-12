import { createSignal } from 'solid-js';
import type { Organisation, HierarchyNode } from '../types';
import { hierarchyService } from '../services/hierarchyService';

/**
 * Navigation store for managing hierarchy tree and selected items
 */

// Organisations list
const [organisations, setOrganisations] = createSignal<Organisation[]>([]);

// Loading state for hierarchy tree
const [loading, setLoading] = createSignal(false);

// Error state
const [error, setError] = createSignal<string | null>(null);

// Selected item
const [selectedItem, setSelectedItem] = createSignal<HierarchyNode | null>(null);

// Selected item loading state
const [selectedItemLoading, setSelectedItemLoading] = createSignal(false);

/**
 * Fetch the complete hierarchy tree
 */
export const fetchHierarchyTree = async () => {
	setLoading(true);
	setError(null);
	try {
		const data = await hierarchyService.getHierarchyTree();
		setOrganisations(data.organisations);
	} catch (err) {
		setError(err instanceof Error ? err.message : 'Failed to load hierarchy');
	} finally {
		setLoading(false);
	}
};

/**
 * Fetch a single hierarchy item by ID
 */
export const fetchHierarchyItem = async (id: string) => {
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
export const createHierarchyItem = async (data: {
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
export const updateHierarchyItem = async (id: string, data: { name?: string; type?: string }) => {
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
export const deleteHierarchyItem = async (id: string) => {
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
export const clearSelectedItem = () => {
	setSelectedItem(null);
};

// Export signals for reactive access
export { organisations, loading, error, selectedItem, selectedItemLoading };
