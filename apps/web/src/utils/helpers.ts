import { TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from './constants';

/**
 * Check if the current screen size is mobile (max-width: 1023px)
 * This matches the Tailwind lg breakpoint
 */
export const isMobileView = (): boolean => {
	if (typeof window === 'undefined') return false; // SSR safety
	return window.innerWidth < 1024; // lg breakpoint is 1024px
};

/**
 * Hook-like function to get mobile view state (for reactive updates)
 * In SolidJS, this would typically be used with createSignal and window resize listeners
 */
export const useIsMobileView = (): boolean => {
	return isMobileView();
};

/**
 * Get human-readable label for a hierarchy type
 */
export const getTypeLabel = (type: string): string => {
	return TYPE_LABELS[type] || type;
};

/**
 * Get color classes for a hierarchy type badge
 */
export const getTypeColor = (type: string): string => {
	return TYPE_COLORS[type] || 'bg-gray-100 text-gray-800';
};

/**
 * Get icon class for a hierarchy type
 */
export const getTypeIcon = (type: string): string => {
	return TYPE_ICONS[type] || 'fas fa-circle';
};

/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirst = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};
