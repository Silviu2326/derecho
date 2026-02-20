// Push Notification Service
// Handles Service Worker registration and Push subscription

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
}

export interface PushNotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class PushService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private readonly VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

  /**
   * Initialize the push service
   * Call this when the app loads
   */
  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[Push] Service Workers not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.warn('[Push] Push Manager not supported');
      return false;
    }

    try {
      // Register Service Worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[Push] Service Worker registered:', this.registration.scope);

      // Check existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('[Push] Existing subscription found');
      }

      return true;
    } catch (error) {
      console.error('[Push] Registration failed:', error);
      return false;
    }
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): PushNotificationPermission {
    if (!('Notification' in window)) {
      return { granted: false, denied: false, default: true };
    }
    return {
      granted: Notification.permission === 'granted',
      denied: Notification.permission === 'denied',
      default: Notification.permission === 'default'
    };
  }

  /**
   * Request permission for push notifications
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[Push] Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      console.log('[Push] Permission:', permission);
      
      if (granted) {
        await this.subscribe();
      }
      
      return granted;
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) {
      console.error('[Push] No Service Worker registration');
      return null;
    }

    try {
      // Convert VAPID key from base64 to Uint8Array
      const vapidKey = this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY);

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      console.log('[Push] Subscribed:', this.subscription.endpoint);

      // Save subscription to localStorage (for demo)
      // In production, send to your backend
      this.saveSubscriptionLocally(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      try {
        this.subscription = await this.registration?.pushManager.getSubscription() ?? null;
      } catch {
        return true;
      }
    }

    if (!this.subscription) {
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      console.log('[Push] Unsubscribed');
      
      // Remove from localStorage
      localStorage.removeItem('push_subscription');
      
      this.subscription = null;
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      await this.init();
    }

    this.subscription = await this.registration?.pushManager.getSubscription() ?? null;
    return !!this.subscription;
  }

  /**
   * Get current subscription
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Save subscription to localStorage (for demo purposes)
   * In production: send to your backend
   */
  private saveSubscriptionLocally(subscription: PushSubscription): void {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: this.arrayBufferToBase64(subscription.getKey('auth'))
      }
    };
    
    localStorage.setItem('push_subscription', JSON.stringify(subscriptionData));
    console.log('[Push] Subscription saved locally');
  }

  /**
   * Get subscription from localStorage
   */
  getLocalSubscription(): PushSubscriptionData | null {
    const stored = localStorage.getItem('push_subscription');
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Send test notification (demo - requires backend in production)
   * In production, this would call your backend API
   */
  async sendTestNotification(): Promise<boolean> {
    const permission = this.getPermissionStatus();
    
    if (!permission.granted) {
      console.warn('[Push] No permission to send notification');
      return false;
    }

    // In production: call your backend API to send push
    // await fetch('/api/notifications/send', { ... })
    
    // For demo: show a local notification
    if (this.registration) {
      await this.registration.showNotification('Notificaciones Activadas', {
        body: 'Recibirás notificaciones sobre tus casos, facturas y audiencias.',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'welcome',
        data: { url: '/portal-cliente' }
      });
      return true;
    }

    return false;
  }

  // Utility: Convert VAPID key from base64 to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Utility: Convert ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Export singleton instance
export const pushService = new PushService();
