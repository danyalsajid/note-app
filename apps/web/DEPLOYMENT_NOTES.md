# Deployment Notes - Service Worker

## 📦 Building for Production

### Build Command
```bash
npm run build
```

The service worker (`public/sw.js`) will be automatically copied to the `dist` folder.

## ⚙️ Vite Configuration

The current Vite config works with the service worker. The `public/` folder contents are automatically copied to the build output.

### What Gets Built
```
dist/
├── sw.js              # Service worker (from public/)
├── manifest.json      # PWA manifest (from public/)
├── index.html         # Main HTML
└── assets/            # Bundled JS/CSS
```

## 🌐 Server Configuration

### Required Headers

Your server should serve the service worker with proper headers:

```
# For sw.js
Content-Type: application/javascript
Cache-Control: no-cache, no-store, must-revalidate
```

### HTTPS Required

Service workers only work on:
- `https://` domains (production)
- `localhost` (development)

## 🚀 Deployment Checklist

### Before Each Deploy

1. **Update Cache Version**
   ```javascript
   // In public/sw.js
   const CACHE_VERSION = 'v2'; // Increment this!
   ```

2. **Test Offline Functionality**
   - Build locally: `npm run build`
   - Serve: `npm run serve`
   - Test offline mode in DevTools

3. **Clear Old Caches**
   - The service worker automatically clears old caches
   - Users may need to refresh once to get the update

### Deployment Steps

1. Update cache version in `public/sw.js`
2. Build the app: `npm run build`
3. Test the build: `npm run serve`
4. Deploy the `dist/` folder
5. Verify service worker registers on production

## 🔧 Platform-Specific Notes

### Vercel
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### Netlify
Create `netlify.toml`:
```toml
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

### Railway
The current `railway.toml` should work. Just ensure:
- HTTPS is enabled
- Static files are served correctly

### Nginx
```nginx
location /sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Content-Type "application/javascript";
}
```

## 📊 Monitoring

### Check Service Worker Status

Add to your analytics:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then(reg => {
    console.log('SW Status:', reg ? 'Active' : 'Not registered');
  });
}
```

### Track Offline Usage
```javascript
window.addEventListener('offline', () => {
  // Track offline event
  analytics.track('went_offline');
});

window.addEventListener('online', () => {
  // Track back online
  analytics.track('back_online');
});
```

## 🐛 Common Production Issues

### Issue: Service Worker Not Updating

**Solution:**
1. Increment cache version
2. Users need to refresh twice (once to get new SW, once to activate)
3. Or add "skip waiting" prompt

### Issue: HTTPS Required Error

**Solution:**
- Deploy to HTTPS domain
- Service workers don't work on HTTP (except localhost)

### Issue: Scope Problems

**Solution:**
- Service worker must be at root: `/sw.js`
- Don't put it in subdirectories

### Issue: Caching Too Aggressive

**Solution:**
- Serve `sw.js` with `Cache-Control: no-cache`
- Update cache version on each deploy

## 🔄 Update Strategy

### Automatic Updates
The service worker checks for updates:
- On page load
- Every hour (configurable in `serviceWorkerRegistration.ts`)

### Manual Update
Users can force update:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

### Skip Waiting
To activate new SW immediately:
```javascript
// In sw.js
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

## 📈 Performance Tips

1. **Minimize Cache Size**
   - Only cache essential assets
   - Set cache limits

2. **Use Network First for Dynamic Content**
   - Already implemented for API calls
   - Ensures fresh data when online

3. **Preload Critical Resources**
   - Add to `STATIC_ASSETS` in sw.js

4. **Monitor Cache Hit Rate**
   - Check DevTools → Network
   - Look for "(from ServiceWorker)" entries

## 🔐 Security

1. **HTTPS Only**: Service workers require HTTPS
2. **Same-Origin**: SW can only control same-origin requests
3. **No Sensitive Data**: Don't cache sensitive information
4. **Validate Responses**: Check response.ok before caching

## 📱 PWA Features

Your app is now a PWA! Users can:
- Install to home screen
- Use offline
- Get app-like experience

### PWA Checklist
- ✅ Service worker registered
- ✅ Manifest.json present
- ✅ HTTPS (in production)
- ✅ Responsive design
- ⚠️ Icons needed (add to public/)

## 🎯 Next Deploy

1. Increment cache version: `v1` → `v2`
2. Test locally
3. Deploy
4. Verify on production
5. Test offline functionality

---

**Ready to deploy!** Your service worker implementation is production-ready. 🚀
