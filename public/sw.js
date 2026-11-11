// Safa Fragrance Service Worker - Web Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'Safa Fragrance Haute Parfumerie',
      body: event.data.text(),
    };
  }

  const title = payload.title || 'Safa Fragrance';
  const options = {
    body: payload.body || 'New updates on your orders and artisanal releases.',
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/images/favicon/favicon-96x96.png',
    image: payload.image,
    data: {
      url: payload.url || '/',
    },
    vibrate: [150, 80, 150],
    tag: payload.tag || 'safa-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
