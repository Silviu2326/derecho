// Push Notification Prompt Component
// Shows a banner to invite users to enable push notifications

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationPromptProps {
  /**
   * Custom position for the banner
   * @default 'bottom'
   */
  position?: 'top' | 'bottom';
  
  /**
   * Auto-dismiss delay in ms (set to 0 to disable)
   * @default 0 (no auto-dismiss)
   */
  autoDismissMs?: number;
  
  /**
   * Show the prompt even if already subscribed
   * @default false
   */
  showWhenSubscribed?: boolean;
  
  /**
   * Custom title text
   * @default 'Activa las notificaciones'
   */
  title?: string;
  
  /**
   * Custom description text
   * @default 'Recibe alertas sobre tus casos, facturas y audiencias'
   */
  description?: string;
  
  /**
   * Custom accept button text
   * @default 'Activar'
   */
  acceptText?: string;
  
  /**
   * Custom dismiss button text
   * @default 'Ahora no'
   */
  dismissText?: string;
  
  /**
   * Callback when user accepts
   */
  onAccept?: () => void;
  
  /**
   * Callback when user dismisses
   */
  onDismiss?: () => void;
  
  /**
   * Callback when subscription state changes
   */
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export function PushNotificationPrompt({
  position = 'bottom',
  autoDismissMs = 0,
  showWhenSubscribed = false,
  title = 'Activa las notificaciones',
  description = 'Recibe alertas sobre tus casos, facturas y audiencias',
  acceptText = 'Activar',
  dismissText = 'Ahora no',
  onAccept,
  onDismiss,
  onSubscriptionChange
}: PushNotificationPromptProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    sendTestNotification
  } = usePushNotifications();

  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Don't show if:
  // - Not supported
  // - Already dismissed
  // - Already subscribed (unless showWhenSubscribed is true)
  // - Permission denied (user said no)
  if (!isSupported || dismissed || (permission.denied)) {
    return null;
  }

  // If already subscribed and we don't want to show
  if (isSubscribed && !showWhenSubscribed) {
    return null;
  }

  const handleAccept = async () => {
    const granted = await requestPermission();
    
    if (granted) {
      setShowSuccess(true);
      onAccept?.();
      onSubscriptionChange?.(true);
      
      // Send test notification
      await sendTestNotification();
      
      // Auto dismiss after success
      if (autoDismissMs > 0) {
        setTimeout(() => {
          setDismissed(true);
          onDismiss?.();
        }, autoDismissMs);
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
    // Save dismissal to localStorage to not show again
    localStorage.setItem('push_notification_dismissed', 'true');
  };

  // Check if previously dismissed
  if (localStorage.getItem('push_notification_dismissed') === 'true' && !showWhenSubscribed) {
    return null;
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
          className={`
            fixed ${position}-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50
          `}
        >
          <div className="bg-theme-secondary border border-theme rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with icon */}
            <div className="relative bg-gradient-to-r from-accent/20 to-accent/5 p-4 pb-3">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                  {showSuccess ? (
                    <Check className="w-5 h-5 text-accent" />
                  ) : (
                    <Bell className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary">
                    {showSuccess ? '¡Notificaciones activadas!' : title}
                  </h3>
                  {!showSuccess && (
                    <p className="text-sm text-theme-secondary">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Body - Success state */}
            {showSuccess && (
              <div className="p-4 pt-0">
                <p className="text-sm text-theme-secondary">
                  Ahora recibirás notificaciones sobre tus casos, facturas y audiencias.
                  Puedes cambiar esto en cualquier momento desde Configuración.
                </p>
              </div>
            )}

            {/* Body - Default state */}
            {!showSuccess && (
              <div className="p-4 pt-3">
                {error && (
                  <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        {acceptText}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDismiss}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-xl transition-colors"
                  >
                    {dismissText}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simpler version for settings panel
interface PushToggleProps {
  className?: string;
}

export function PushToggle({ className = '' }: PushToggleProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    unsubscribe,
    refreshStatus
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className={`p-4 bg-theme-tertiary/50 rounded-xl ${className}`}>
        <p className="text-sm text-theme-muted">
          Tu navegador no soporta notificaciones push
        </p>
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await requestPermission();
    }
    await refreshStatus();
  };

  return (
    <div className={`flex items-center justify-between p-4 bg-theme-secondary/60 border border-theme rounded-xl ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="font-medium text-theme-primary">Notificaciones push</p>
          <p className="text-sm text-theme-secondary">
            {permission.denied 
              ? 'Bloqueado en configuración del navegador'
              : isSubscribed 
                ? 'Activas' 
                : 'Inactivas'
            }
          </p>
        </div>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={isLoading || permission.denied}
        className={`
          relative w-12 h-6 rounded-full transition-colors
          ${isSubscribed ? 'bg-accent' : 'bg-theme-tertiary'}
          ${permission.denied ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
            ${isSubscribed ? 'translate-x-7' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}

export default PushNotificationPrompt;
