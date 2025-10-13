import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import { getPendingOperationsCount } from '../utils/offlineSync';
import { isOnline } from '../utils/serviceWorkerRegistration';

/**
 * Offline Indicator Component
 * Shows online/offline status and pending sync operations
 */
const OfflineIndicator: Component = () => {
	const [online, setOnline] = createSignal(isOnline());
	const [pendingCount, setPendingCount] = createSignal(0);
	const [syncing, setSyncing] = createSignal(false);
	const [justSynced, setJustSynced] = createSignal(false);

	const updateStatus = async () => {
		setOnline(isOnline());
		const count = await getPendingOperationsCount();
		setPendingCount(count);
	};

	const handleOnline = () => {
		setSyncing(true);
		updateStatus();
	};

	const handleOffline = () => {
		updateStatus();
	};

	const handleSyncComplete = async () => {
		setSyncing(false);
		await updateStatus();
		
		// Show "Synced!" message briefly
		setJustSynced(true);
		console.log('[OfflineIndicator] Showing synced message');
		
		// Hide after 2 seconds
		window.setTimeout(() => {
			setJustSynced(false);
			console.log('[OfflineIndicator] Hiding synced message');
		}, 2000);
	};

	onMount(() => {
		updateStatus();

		// Listen for online/offline events
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
		window.addEventListener('sw-sync-complete', handleSyncComplete);

		// Update status periodically
		const interval = setInterval(updateStatus, 5000);

		onCleanup(() => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			window.removeEventListener('sw-sync-complete', handleSyncComplete);
			clearInterval(interval);
		});
	});

	// Show indicator when: offline, has pending changes, or just synced (briefly)
	const shouldShow = () => {
		if (!online()) return true; // Always show when offline
		if (pendingCount() > 0) return true; // Show when syncing
		if (justSynced()) return true; // Show briefly after sync
		return false; // Hide when online with no pending changes
	};

	return (
		<div
			class="fixed bottom-4 right-4 z-50"
			style={{
				display: shouldShow() ? 'block' : 'none',
			}}
		>
			<div
				class="rounded-lg shadow-lg px-4 py-3 flex items-center gap-3"
				style={{
					'background-color': justSynced() ? '#10b981' : online() ? '#10b981' : '#ef4444',
					color: 'white',
				}}
			>
				{/* Status Icon */}
				<div class="flex-shrink-0">
					{online() ? (
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					) : (
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
							/>
						</svg>
					)}
				</div>

				{/* Status Text */}
				<div class="flex-1">
					<div class="font-medium text-sm">
						{justSynced() ? 'Synced!' : online() ? 'Back Online' : 'Offline'}
					</div>
					{pendingCount() > 0 && !justSynced() && (
						<div class="text-xs opacity-90">
							{pendingCount()} {pendingCount() === 1 ? 'change' : 'changes'}{' '}
							{syncing() ? 'syncing...' : online() ? 'syncing...' : 'pending'}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default OfflineIndicator;
