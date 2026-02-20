// Hook for Push Notifications
// Provides easy-to-use interface for React components

import { useState, useEffect, useCallback } from 'react';
import { 
  pushService, 
  type PushNotificationPermission,
  type PushSubscriptionData 
} from '@/services/pushService';

interface UsePushNotificationsReturn {
  // State
  isSupported: boolean;
  permission: PushNotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  
  // Subscription data
  subscription: PushSubscriptionData | null;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<PushNotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null);

  // Check support on mount
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        // Initialize push service
        await pushService.init();
        
        // Get current permission status
        setPermission(pushService.getPermissionStatus());
        
        // Check if already subscribed
        const subscribed = await pushService.isSubscribed();
        setIsSubscribed(subscribed);
        
        // Get local subscription data
        setSubscription(pushService.getLocalSubscription());
      }
      
      setIsLoading(false);
    };

    checkSupport();
  }, []);

  // Listen for permission changes
  useEffect(() => {
    if (!isSupported) return;

    const handlePermissionChange = () => {
      setPermission(pushService.getPermissionStatus());
    };

    // Check permission periodically (for when user changes it in browser settings)
    const interval = setInterval(() => {
      handlePermissionChange();
    }, 1000);

    return () => clearInterval(interval);
  }, [isSupported]);

  const refreshStatus = useCallback(async () => {
    if (!isSupported) return;
    
    setIsLoading(true);
    try {
      await pushService.init();
      setPermission(pushService.getPermissionStatus());
      const subscribed = await pushService.isSubscribed();
      setIsSubscribed(subscribed);
      setSubscription(pushService.getLocalSubscription());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh status');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications not supported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const granted = await pushService.requestPermission();
      
      if (granted) {
        setPermission(pushService.getPermissionStatus());
        setIsSubscribed(true);
        setSubscription(pushService.getLocalSubscription());
      } else {
        setError('Permission denied');
      }
      
      return granted;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request permission';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      const success = await pushService.unsubscribe();
      
      if (success) {
        setPermission(pushService.getPermissionStatus());
        setIsSubscribed(false);
        setSubscription(null);
      }
      
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    setError(null);

    try {
      return await pushService.sendTestNotification();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(message);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    unsubscribe,
    sendTestNotification,
    refreshStatus,
    subscription
  };
}
