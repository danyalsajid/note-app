/**
 * Application constants
 */

// Node configuration for hierarchy tree
export const NODE_CONFIG = {
	organisation: {
		icon: 'far fa-hospital',
		color: '#ef4444',
		fontSize: '1.25rem',
		childType: 'team',
		childrenKey: 'teams',
	},
	team: {
		icon: 'fa fa-user-friends',
		color: '#3b82f6',
		fontSize: '1.25rem',
		childType: 'client',
		childrenKey: 'clients',
	},
	client: {
		icon: 'far fa-user',
		color: '#2563eb',
		fontSize: '1.25rem',
		childType: 'episode',
		childrenKey: 'episodes',
	},
	episode: {
		icon: 'far fa-file-alt',
		color: '#ca8a04',
		fontSize: '1.15rem',
		childType: null,
		childrenKey: null,
	},
} as const;

// Type labels mapping
export const TYPE_LABELS: Record<string, string> = {
	organisation: 'Organisation',
	team: 'Team',
	client: 'Client',
	episode: 'Episode',
};

// Type colors for badges
export const TYPE_COLORS: Record<string, string> = {
	organisation: 'bg-red-100 text-red-800',
	team: 'bg-blue-100 text-blue-800',
	client: 'bg-indigo-100 text-indigo-800',
	episode: 'bg-yellow-100 text-yellow-800',
};

// Type icons
export const TYPE_ICONS: Record<string, string> = {
	organisation: 'fas fa-building',
	team: 'fas fa-users',
	client: 'fas fa-user',
	episode: 'fas fa-file-alt',
};
