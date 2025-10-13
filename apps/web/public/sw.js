// Service Worker for Note App
// Provides offline functionality and background sync

const CACHE_VERSION = 'v1';
const CACHE_NAME = `note-app-${CACHE_VERSION}`;
const API_CACHE_NAME = `note-app-api-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
	'/',
	'/index.html',
	'/src/index.tsx',
	'/src/App.tsx',
];

// API endpoints to cache
const API_ENDPOINTS = [
	'/api/notes',
	'/api/notes/search',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	console.log('[Service Worker] Installing...');
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('[Service Worker] Caching static assets');
			return cache.addAll(STATIC_ASSETS).catch((err) => {
				console.warn('[Service Worker] Failed to cache some assets:', err);
			});
		}).then(() => {
			// Force the waiting service worker to become the active service worker
			return self.skipWaiting();
		})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	console.log('[Service Worker] Activating...');
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
						console.log('[Service Worker] Deleting old cache:', cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		}).then(() => {
			// Take control of all pages immediately
			return self.clients.claim();
		})
	);
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Handle API requests
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(handleApiRequest(request));
		return;
	}

	// Handle static assets
	event.respondWith(handleStaticRequest(request));
});

// Network First strategy for API requests (with cache fallback)
async function handleApiRequest(request) {
	const cache = await caches.open(API_CACHE_NAME);

	try {
		// Try network first
		const networkResponse = await fetch(request);
		
		// Cache successful GET requests
		if (request.method === 'GET' && networkResponse.ok) {
			cache.put(request, networkResponse.clone());
		}
		
		return networkResponse;
	} catch (error) {
		console.log('[Service Worker] Network request failed, trying cache:', request.url);
		
		// Fall back to cache
		const cachedResponse = await cache.match(request);
		
		if (cachedResponse) {
			return cachedResponse;
		}
		
		// If no cache, return offline response
		return new Response(
			JSON.stringify({ 
				error: 'Offline', 
				message: 'You are currently offline. Please check your connection.' 
			}),
			{
				status: 503,
				statusText: 'Service Unavailable',
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}

// Cache First strategy for static assets (with network fallback)
async function handleStaticRequest(request) {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(request);

	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const networkResponse = await fetch(request);
		
		// Cache the new resource
		if (networkResponse.ok) {
			cache.put(request, networkResponse.clone());
		}
		
		return networkResponse;
	} catch (error) {
		console.log('[Service Worker] Failed to fetch:', request.url);
		
		// Return a basic offline page for navigation requests
		if (request.mode === 'navigate') {
			return cache.match('/index.html');
		}
		
		return new Response('Offline', { status: 503 });
	}
}

// Background Sync - sync pending changes when back online
self.addEventListener('sync', (event) => {
	console.log('[Service Worker] Background sync triggered:', event.tag);
	
	if (event.tag === 'sync-notes') {
		event.waitUntil(syncPendingNotes());
	}
});

// Sync pending notes from IndexedDB
async function syncPendingNotes() {
	try {
		// Get pending operations from IndexedDB
		const db = await openDB();
		const tx = db.transaction('pending-operations', 'readonly');
		const store = tx.objectStore('pending-operations');
		const pendingOps = await store.getAll();
		
		console.log('[Service Worker] Syncing pending operations:', pendingOps.length);
		
		// Process each pending operation
		for (const op of pendingOps) {
			try {
				const response = await fetch(op.url, {
					method: op.method,
					headers: op.headers,
					body: op.body,
				});
				
				if (response.ok) {
					// Remove from pending operations
					const deleteTx = db.transaction('pending-operations', 'readwrite');
					const deleteStore = deleteTx.objectStore('pending-operations');
					await deleteStore.delete(op.id);
					console.log('[Service Worker] Synced operation:', op.id);
				}
			} catch (error) {
				console.error('[Service Worker] Failed to sync operation:', op.id, error);
			}
		}
		
		// Notify clients that sync is complete
		const clients = await self.clients.matchAll();
		clients.forEach((client) => {
			client.postMessage({
				type: 'SYNC_COMPLETE',
				timestamp: Date.now(),
			});
		});
	} catch (error) {
		console.error('[Service Worker] Sync failed:', error);
		throw error;
	}
}

// Helper to open IndexedDB
function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('note-app-db', 1);
		
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		
		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			
			if (!db.objectStoreNames.contains('pending-operations')) {
				db.createObjectStore('pending-operations', { keyPath: 'id', autoIncrement: true });
			}
		};
	});
}

// Message handler for communication with the app
self.addEventListener('message', (event) => {
	console.log('[Service Worker] Message received:', event.data);
	
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	
	if (event.data && event.data.type === 'CLEAR_CACHE') {
		event.waitUntil(
			caches.keys().then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => caches.delete(cacheName))
				);
			})
		);
	}
});
