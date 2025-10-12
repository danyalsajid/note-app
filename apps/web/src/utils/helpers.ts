import { TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from './constants';

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
