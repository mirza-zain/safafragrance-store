'use client';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.error('Service worker registration failed:', err);
    return null;
  }
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function getPushStatus(): Promise<{
  configured: boolean;
  subscribed: boolean;
  message?: string;
}> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { configured: false, subscribed: false, message: 'Web push notifications are not supported in this browser.' };
  }

  const registration = await registerPushServiceWorker();
  if (!registration) {
    return { configured: false, subscribed: false, message: 'Could not register notification service worker.' };
  }

  const subscription = await registration.pushManager.getSubscription();
  const endpoint = subscription?.endpoint || '';
  const response = await fetch(`/api/notifications/subscribe?endpoint=${encodeURIComponent(endpoint)}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    return { configured: false, subscribed: false, message: 'Unable to verify notification settings.' };
  }

  const data = await response.json() as { configured?: boolean; subscribed?: boolean };
  return {
    configured: Boolean(data.configured),
    subscribed: Boolean(data.subscribed),
    message: data.configured ? undefined : 'VAPID keys are not configured on the server.',
  };
}

export async function subscribeUserToPush(): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, message: 'Web push notifications are not supported in this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Notification permission was denied.' };
    }

    const registration = await registerPushServiceWorker();
    if (!registration) {
      return { success: false, message: 'Could not register notification service worker.' };
    }

    await navigator.serviceWorker.ready;

    // Get public key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    if (!vapidKey) {
      return { success: false, message: 'VAPID public key is not configured on the server.' };
    }

    const convertedKey = urlBase64ToUint8Array(vapidKey);

    let subscription = await registration.pushManager.getSubscription();
    const savedVapidKey = window.localStorage.getItem('safa-vapid-public-key');
    if (subscription && savedVapidKey !== vapidKey) {
      await subscription.unsubscribe();
      subscription = null;
    }
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // Send subscription to server
    const res = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    if (!res.ok) {
      throw new Error('Failed to save subscription on server');
    }
    window.localStorage.setItem('safa-vapid-public-key', vapidKey);

    return {
      success: true,
      message: 'Subscribed to Safa Fragrance concierge notifications.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Subscription error';
    return { success: false, message };
  }
}
