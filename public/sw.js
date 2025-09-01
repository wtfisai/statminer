// Service Worker for StatMiner PWA
const CACHE_NAME = 'statminer-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline use
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before using it
          const responseToCache = response.clone();
          
          // Don't cache non-successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          // Cache successful API responses for 5 minutes
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Try to return cached API response
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-messages') {
    event.waitUntil(sendQueuedMessages());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from StatMiner',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('StatMiner', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(event.data.urls);
    });
  }
});

// Helper function to send queued messages
async function sendQueuedMessages() {
  // Get queued messages from IndexedDB
  const messages = await getQueuedMessages();
  
  for (const message of messages) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      if (response.ok) {
        // Remove message from queue
        await removeFromQueue(message.id);
      }
    } catch (error) {
      console.error('Failed to send queued message:', error);
    }
  }
}

// IndexedDB helpers (simplified)
async function getQueuedMessages() {
  // Implementation would use IndexedDB to get queued messages
  return [];
}

async function removeFromQueue(messageId) {
  // Implementation would remove message from IndexedDB
  return true;
}