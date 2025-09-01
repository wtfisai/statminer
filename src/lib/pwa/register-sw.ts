export async function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              showUpdateNotification();
            }
          });
        }
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

export async function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      console.log('Service Workers unregistered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }
  return false;
}

export async function checkForUpdates() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        await registration.update();
        return true;
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }
  return false;
}

function showUpdateNotification() {
  // Show user that an update is available
  const updateBanner = document.createElement('div');
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    ">
      <span>A new version of StatMiner is available!</span>
      <button onclick="window.location.reload()" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
      ">
        Update Now
      </button>
      <button onclick="this.parentElement.remove()" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
      ">
        Later
      </button>
    </div>
  `;
  
  document.body.appendChild(updateBanner);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    updateBanner.remove();
  }, 10000);
}

// Request persistent storage
export async function requestPersistentStorage() {
  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log('Persistent storage:', isPersisted ? 'granted' : 'denied');
      return isPersisted;
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
      return false;
    }
  }
  return false;
}

// Check storage estimate
export async function getStorageEstimate() {
  if (typeof window !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
      };
    } catch (error) {
      console.error('Failed to get storage estimate:', error);
      return null;
    }
  }
  return null;
}

// Background sync registration
export async function registerBackgroundSync(tag: string) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
}

// Push notification permission
export async function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }
  return false;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(vapidPublicKey: string) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }
      
      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }
  return null;
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Cache management
export async function clearAppCache() {
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear caches:', error);
      return false;
    }
  }
  return false;
}

// Network status monitoring
export function setupNetworkStatusMonitoring(
  onOnline?: () => void,
  onOffline?: () => void
) {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Network: Online');
      onOnline?.();
    });
    
    window.addEventListener('offline', () => {
      console.log('Network: Offline');
      onOffline?.();
    });
    
    // Initial status
    if (navigator.onLine) {
      console.log('Network: Initially online');
    } else {
      console.log('Network: Initially offline');
    }
    
    return navigator.onLine;
  }
  return true;
}