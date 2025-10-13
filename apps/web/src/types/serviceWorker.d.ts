/**
 * Service Worker Type Definitions
 */

interface ServiceWorkerGlobalScope {
	addEventListener(
		type: 'install',
		listener: (event: ExtendableEvent) => void
	): void;
	addEventListener(
		type: 'activate',
		listener: (event: ExtendableEvent) => void
	): void;
	addEventListener(
		type: 'fetch',
		listener: (event: FetchEvent) => void
	): void;
	addEventListener(
		type: 'sync',
		listener: (event: SyncEvent) => void
	): void;
	addEventListener(
		type: 'message',
		listener: (event: ExtendableMessageEvent) => void
	): void;
	skipWaiting(): Promise<void>;
	clients: Clients;
}

interface ExtendableEvent extends Event {
	waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
	request: Request;
	respondWith(response: Promise<Response> | Response): void;
}

interface SyncEvent extends ExtendableEvent {
	tag: string;
}

interface ExtendableMessageEvent extends ExtendableEvent {
	data: any;
	source: Client | ServiceWorker | MessagePort | null;
}

interface Clients {
	claim(): Promise<void>;
	matchAll(options?: ClientQueryOptions): Promise<Client[]>;
}

interface ClientQueryOptions {
	includeUncontrolled?: boolean;
	type?: 'window' | 'worker' | 'sharedworker' | 'all';
}

interface Client {
	postMessage(message: any, transfer?: Transferable[]): void;
	id: string;
	type: 'window' | 'worker' | 'sharedworker';
	url: string;
}

interface SyncManager {
	register(tag: string): Promise<void>;
	getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
	sync: SyncManager;
}

declare const self: ServiceWorkerGlobalScope;
declare const caches: CacheStorage;
