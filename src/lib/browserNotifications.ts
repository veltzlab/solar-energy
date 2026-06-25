export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, options?: NotificationOptions): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(title, options);
  } catch {
    // Alguns navegadores podem bloquear a criação fora de um contexto de interação
  }
}
