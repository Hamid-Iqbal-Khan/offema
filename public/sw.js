/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Offema Progressive Web App (PWA) Service Worker
 */

const CACHE_NAME = 'offema-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/favicon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
];

// Install: precache app shell and static core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // Individual asset failure should not block install
        console.warn('[SW] Pre-caching partial notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first strategy with cache fallback for HTML/assets; bypass dynamic /api routes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass non-GET requests or backend proxy API endpoints
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Bypass chrome-extension and external analytics
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone and store valid 200 responses in cache for offline support
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache same-origin assets or trusted static CDNs
            if (url.origin === self.location.origin) {
              cache.put(event.request, responseToCache).catch(() => {});
            }
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline fallback: check cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If requesting a navigation page, serve root app shell
        if (event.request.mode === 'navigate') {
          const appShell = await caches.match('/');
          if (appShell) return appShell;
        }

        return new Response('Offline: Content currently unavailable without an internet connection.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        });
      })
  );
});
