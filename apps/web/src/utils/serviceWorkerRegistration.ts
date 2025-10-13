/**
 * Service Worker Registration Utility
 * Handles registration, updates, and communication with the service worker
 */

export interface ServiceWorkerConfig {
	onSuccess?: (registration: ServiceWorkerRegistration) => void;
	onUpdate?: (registration: ServiceWorkerRegistration) => void;
	onOffline?: () => void;
	onOnline?: () => void;
}

export function registerServiceWorker(config?: ServiceWorkerConfig) {
	// Check if service workers are supported
	if (!('serviceWorker' in navigator)) {
		console.warn('Service workers are not supported in this browser');
		return;
	}

	// Register on load
	window.addEventListener('load', async () => {
		try {
			const registration = await navigator.serviceWorker.register('/sw.js', {
				scope: '/',
			});

			console.log('[SW Registration] Service Worker registered:', registration.scope);

			// Check for updates
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				
				if (!newWorker) return;

				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						// New service worker available
						console.log('[SW Registration] New service worker available');
						config?.onUpdate?.(registration);
					}
				});
			});

			// Success callback
			if (registration.active) {
				config?.onSuccess?.(registration);
			}

			// Check for updates periodically (every hour)
			setInterval(() => {
				registration.update();
			}, 60 * 60 * 1000);

		} catch (error) {
			console.error('[SW Registration] Service worker registration failed:', error);
		}
	});

	// Listen for messages from service worker
	navigator.serviceWorker.addEventListener('message', (event) => {
		console.log('[SW Registration] Message from service worker:', event.data);
		
		if (event.data.type === 'SYNC_COMPLETE') {
			// Trigger a refresh or notification
			window.dispatchEvent(new CustomEvent('sw-sync-complete', {
				detail: event.data,
			}));
		}
	});

	// Handle online/offline events
	window.addEventListener('online', async () => {
		console.log('[SW Registration] Back online');
		config?.onOnline?.();
		
		// Trigger manual sync
		try {
			const { syncPendingOperations } = await import('./offlineSync');
			const result = await syncPendingOperations();
			console.log('[SW Registration] Sync complete:', result);
			
			// Notify app that sync is complete
			window.dispatchEvent(new CustomEvent('sw-sync-complete', {
				detail: { timestamp: Date.now(), ...result },
			}));
		} catch (err) {
			console.error('[SW Registration] Sync failed:', err);
		}
	});

	window.addEventListener('offline', () => {
		console.log('[SW Registration] Gone offline');
		config?.onOffline?.();
	});
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
	if ('serviceWorker' in navigator) {
		const registrations = await navigator.serviceWorker.getRegistrations();
		
		for (const registration of registrations) {
			await registration.unregister();
			console.log('[SW Registration] Service worker unregistered');
		}
	}
}

/**
 * Send a message to the service worker
 */
export function sendMessageToSW(message: any) {
	if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
		navigator.serviceWorker.controller.postMessage(message);
	}
}

/**
 * Check if the app is currently online
 */
export function isOnline(): boolean {
	return navigator.onLine;
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
	if ('caches' in window) {
		const cacheNames = await caches.keys();
		await Promise.all(cacheNames.map((name) => caches.delete(name)));
		console.log('[SW Registration] All caches cleared');
	}
}
