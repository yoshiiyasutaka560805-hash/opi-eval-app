// Web Push / browser notification utility
// No external dependencies — uses the native Notifications API and Service Worker API.

/**
 * Request permission to show browser notifications.
 * Returns true if granted, false otherwise.
 * Always returns false in non-browser environments.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * Register the service worker located at /sw.js.
 * Returns the ServiceWorkerRegistration on success, null on failure.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch {
    return null;
  }
}

/**
 * Send a browser notification for a trade signal.
 *
 * If a service worker is registered and active it is used (enabling
 * background-capable push); otherwise falls back to the basic
 * Notification constructor.
 *
 * @param signal     - Trade signal label (e.g. "LONG", "SHORT", "WAIT")
 * @param confidence - Confidence score 0-100
 * @param entry      - Entry price
 * @param sl         - Stop-loss price
 * @param tp1        - Take-profit 1 price
 */
export async function sendTradeNotification(
  signal: string,
  confidence: number,
  entry: number,
  sl: number,
  tp1: number,
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const title = `GOLD ${signal} シグナル 🏅`;
  const body =
    `信頼度: ${confidence}% | エントリー: $${entry.toFixed(2)}\n` +
    `SL: $${sl.toFixed(2)} | TP1: $${tp1.toFixed(2)}`;

  const options: NotificationOptions = {
    body,
    icon: '/gold-icon.png',
    badge: '/gold-badge.png',
    tag: `gold-signal-${Date.now()}`,
    requireInteraction: signal !== 'WAIT',
  };

  try {
    // Prefer service worker notification for background-capable delivery
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration?.active) {
        await registration.showNotification(title, options);
        return;
      }
    }

    // Fallback: basic Notification constructor
    new Notification(title, options);
  } catch {
    // Notification may fail silently in some browser configurations
  }
}

/**
 * Check whether the browser supports notifications and the user has granted
 * permission (i.e. notifications are ready to use right now).
 */
export function isNotificationEnabled(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}
