/**
 * Offline Sync Utility
 * Manages pending operations when offline and syncs when back online
 */

export interface PendingOperation {
	id?: number;
	url: string;
	method: string;
	headers: Record<string, string>;
	body?: string;
	timestamp: number;
}

const DB_NAME = 'note-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'pending-operations';

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, {
					keyPath: 'id',
					autoIncrement: true,
				});
				store.createIndex('timestamp', 'timestamp', { unique: false });
			}
		};
	});
}

/**
 * Add a pending operation to IndexedDB
 */
export async function addPendingOperation(
	url: string,
	method: string,
	headers: Record<string, string>,
	body?: any
): Promise<void> {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, 'readwrite');
	const store = tx.objectStore(STORE_NAME);

	const operation: PendingOperation = {
		url,
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
		timestamp: Date.now(),
	};

	return new Promise((resolve, reject) => {
		const request = store.add(operation);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Get all pending operations
 */
export async function getPendingOperations(): Promise<PendingOperation[]> {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, 'readonly');
	const store = tx.objectStore(STORE_NAME);

	return new Promise((resolve, reject) => {
		const request = store.getAll();
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Remove a pending operation
 */
export async function removePendingOperation(id: number): Promise<void> {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, 'readwrite');
	const store = tx.objectStore(STORE_NAME);

	return new Promise((resolve, reject) => {
		const request = store.delete(id);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Clear all pending operations
 */
export async function clearPendingOperations(): Promise<void> {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, 'readwrite');
	const store = tx.objectStore(STORE_NAME);

	return new Promise((resolve, reject) => {
		const request = store.clear();
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Sync all pending operations
 */
export async function syncPendingOperations(): Promise<{
	success: number;
	failed: number;
}> {
	const operations = await getPendingOperations();
	console.log(`[offlineSync] Starting sync of ${operations.length} pending operations`);
	
	let success = 0;
	let failed = 0;

	for (const op of operations) {
		try {
			console.log(`[offlineSync] Syncing operation ${op.id}:`, op.method, op.url);
			
			const response = await fetch(op.url, {
				method: op.method,
				headers: op.headers,
				body: op.body,
			});

			if (response.ok) {
				await removePendingOperation(op.id!);
				success++;
				console.log(`[offlineSync] Successfully synced operation ${op.id}`);
			} else {
				failed++;
				console.error(`[offlineSync] Failed to sync operation ${op.id}:`, response.status, response.statusText);
			}
		} catch (error) {
			console.error(`[offlineSync] Error syncing operation ${op.id}:`, error);
			failed++;
		}
	}

	console.log(`[offlineSync] Sync complete: ${success} success, ${failed} failed`);
	return { success, failed };
}

/**
 * Check if there are pending operations
 */
export async function hasPendingOperations(): Promise<boolean> {
	const operations = await getPendingOperations();
	return operations.length > 0;
}

/**
 * Get count of pending operations
 */
export async function getPendingOperationsCount(): Promise<number> {
	const operations = await getPendingOperations();
	return operations.length;
}
