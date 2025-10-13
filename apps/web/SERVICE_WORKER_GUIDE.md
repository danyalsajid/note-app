# Service Worker Implementation Guide

This document explains the service worker implementation for offline functionality in the note-taking app.

## Overview

The service worker provides:
- **Offline note access**: View cached notes when offline
- **Background sync**: Automatically sync changes when connection is restored
- **Optimistic updates**: UI updates immediately, syncs in background
- **Cache management**: Smart caching strategies for better performance

## Files Added

### 1. `/public/sw.js`
The main service worker file that handles:
- Static asset caching (Cache First strategy)
- API request caching (Network First with cache fallback)
- Background sync for pending operations
- Cache version management

### 2. `/src/utils/serviceWorkerRegistration.ts`
Handles service worker registration and lifecycle:
- Registers the service worker on app load
- Monitors for updates
- Handles online/offline events
- Provides utility functions for SW communication

### 3. `/src/utils/offlineSync.ts`
Manages offline operations using IndexedDB:
- Stores pending operations when offline
- Syncs operations when back online
- Provides utilities to check sync status

### 4. `/src/services/notesService.ts` (Enhanced)
Updated to support offline operations:
- Queues create/update/delete operations when offline
- Returns optimistic responses for better UX
- Automatically syncs when connection is restored

### 5. `/src/types/serviceWorker.d.ts`
TypeScript type definitions for service worker APIs

## How It Works

### Caching Strategy

**Static Assets (Cache First)**:
1. Check cache first
2. If not in cache, fetch from network
3. Cache the response for future use

**API Requests (Network First)**:
1. Try network first
2. Cache successful responses
3. If network fails, fall back to cache
4. If no cache, return offline error

### Offline Operations

When you create, update, or delete a note while offline:
1. Operation is stored in IndexedDB
2. UI updates immediately (optimistic update)
3. When back online, operations sync automatically
4. Service worker handles the sync in the background

### Background Sync

The service worker uses the Background Sync API:
- Automatically triggered when connection is restored
- Processes all pending operations from IndexedDB
- Notifies the app when sync is complete

## Usage

### Testing Offline Functionality

1. **Open DevTools** → Application → Service Workers
2. Check "Offline" to simulate offline mode
3. Try creating/updating notes
4. Uncheck "Offline" to see automatic sync

### Monitoring Service Worker

```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
});

// Listen for sync events
window.addEventListener('sw-sync-complete', (event) => {
  console.log('Sync completed:', event.detail);
});
```

### Checking Pending Operations

```typescript
import { getPendingOperationsCount } from './utils/offlineSync';

const count = await getPendingOperationsCount();
console.log(`${count} operations pending sync`);
```

## Configuration

### Cache Version
Update the cache version in `/public/sw.js` when deploying:
```javascript
const CACHE_VERSION = 'v1'; // Increment this on updates
```

### Cache Assets
Modify the assets to cache in `/public/sw.js`:
```javascript
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // Add more assets here
];
```

## Browser Support

Service workers are supported in:
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

The app gracefully degrades if service workers aren't supported.

## Debugging

### Chrome DevTools
1. **Application** → Service Workers: View registration status
2. **Application** → Cache Storage: Inspect cached resources
3. **Application** → IndexedDB: View pending operations
4. **Network** → Offline: Test offline functionality

### Console Logs
The service worker logs all operations:
- `[Service Worker]` prefix for SW logs
- `[SW Registration]` prefix for registration logs

### Common Issues

**Service worker not updating?**
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Or click "Update" in DevTools → Application → Service Workers

**Cache not clearing?**
```typescript
import { clearAllCaches } from './utils/serviceWorkerRegistration';
await clearAllCaches();
```

**Pending operations stuck?**
```typescript
import { clearPendingOperations } from './utils/offlineSync';
await clearPendingOperations();
```

## Production Deployment

1. Ensure `/public/sw.js` is served with correct MIME type
2. Set appropriate cache headers
3. Update cache version on each deployment
4. Test offline functionality before deploying

## Future Enhancements

Potential improvements:
- Push notifications for note updates
- Periodic background sync
- Advanced cache strategies (stale-while-revalidate)
- Offline note search
- Conflict resolution for simultaneous edits
- Cache size management

## Resources

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Workbox (Advanced SW library)](https://developers.google.com/web/tools/workbox)
