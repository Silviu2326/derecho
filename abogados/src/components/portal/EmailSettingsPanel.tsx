// Email Settings Component
// Settings panel for email notification preferences

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Bell, FileText, Calendar, MessageSquare, 
  FolderOpen, CreditCard, X, Check, Loader2,
  Send, RotateCcw, Eye, EyeOff
} from 'lucide-react';
import { useEmailNotifications, type EmailPreferences } from '@/hooks/useEmailNotifications';

interface EmailSettingsPanelProps {
  /** Show a test email button */
  allowTestEmail?: boolean;
  /** Callback when settings change */
  onChange?: (prefs: EmailPreferences) => void;
}

export function EmailSettingsPanel({ 
  allowTestEmail = true, 
  onChange 
}: EmailSettingsPanelProps) {
  const {
    preferences,
    isLoading,
    isSending,
    updatePreferences,
    resetPreferences,
    sendTestEmail
  } = useEmailNotifications();

  const [showTestResult, setShowTestResult] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleToggle = (key: keyof EmailPreferences) => {
    updatePreferences({ [key]: !preferences[key] });
    onChange?.({ ...preferences, [key]: !preferences[key] });
  };

  const handleTestEmail = async () => {
    setShowTestResult(true);
    const success = await sendTestEmail();
    setTestSuccess(success);
    
    // Auto-hide result after 5 seconds
    setTimeout(() => setShowTestResult(false), 5000);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-theme-muted" />
      </div>
    );
  }

  const settingItems = [
    {
      key: 'enabled' as keyof EmailPreferences,
      label: 'Notificaciones por email',
      description: 'Activar o desactivar todas las notificaciones',
      icon: Mail,
      color: 'text-accent',
      bgColor: 'bg-accent/20'
    },
    {
      key: 'cases' as keyof EmailPreferences,
      label: 'Actualizaciones de casos',
      description: 'Cambios de estado, hitos, nuevas audiencias',
      icon: FolderOpen,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      key: 'invoices' as keyof EmailPreferences,
      label: 'Facturas y pagos',
      description: 'Nuevas facturas, recordatorios, confirmaciones',
      icon: CreditCard,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20'
    },
    {
      key: 'hearings' as keyof EmailPreferences,
      label: 'Audiencias',
      description: 'Recordatorios de audiencias próximas',
      icon: Calendar,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      key: 'messages' as keyof EmailPreferences,
      label: 'Mensajes',
      description: 'Nuevos mensajes del bufete',
      icon: MessageSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      key: 'documents' as keyof EmailPreferences,
      label: 'Documentos',
      description: 'Documentos nuevos disponibles',
      icon: FileText,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-theme-primary">Notificaciones por email</h3>
            <p className="text-sm text-theme-secondary">Gestiona cómo te notifyamos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {allowTestEmail && (
            <button
              onClick={handleTestEmail}
              disabled={isSending || !preferences.enabled}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-theme-tertiary hover:bg-theme-hover text-theme-secondary rounded-lg transition-colors disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Probar
            </button>
          )}
          <button
            onClick={resetPreferences}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-theme-muted hover:text-theme-secondary transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer
          </button>
        </div>
      </div>

      {/* Test Result Toast */}
      <AnimatePresence>
        {showTestResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl flex items-center gap-2 ${
              testSuccess 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {testSuccess ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span className="text-sm">
              {testSuccess 
                ? 'Email de prueba enviado (revisa la consola)' 
                : 'Error al enviar email de prueba'
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle */}
      <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${preferences.enabled ? 'bg-accent/20' : 'bg-theme-tertiary'} rounded-xl flex items-center justify-center`}>
              {preferences.enabled ? (
                <Bell className="w-5 h-5 text-accent" />
              ) : (
                <Bell className="w-5 h-5 text-theme-muted" />
              )}
            </div>
            <div>
              <p className="font-medium text-theme-primary">Activar notificaciones</p>
              <p className="text-sm text-theme-secondary">
                {preferences.enabled ? 'Recibirás emails según tus preferencias' : 'No recibirás ningún email'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => handleToggle('enabled')}
            className={`
              relative w-14 h-7 rounded-full transition-colors
              ${preferences.enabled ? 'bg-accent' : 'bg-theme-tertiary'}
            `}
          >
            <span
              className={`
                absolute top-1 w-5 h-5 bg-white rounded-full transition-transform
                ${preferences.enabled ? 'translate-x-8' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Individual Toggles */}
      <div className="space-y-2">
        {settingItems.slice(1).map((item) => (
          <div
            key={item.key}
            className={`p-4 border rounded-xl transition-colors ${
              preferences.enabled 
                ? 'bg-theme-secondary/40 border-theme hover:border-theme-hover' 
                : 'bg-theme-tertiary/20 border-transparent opacity-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-theme-primary">{item.label}</p>
                  <p className="text-sm text-theme-secondary">{item.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggle(item.key as keyof EmailPreferences)}
                disabled={!preferences.enabled}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${preferences[item.key as keyof EmailPreferences] && preferences.enabled 
                    ? 'bg-accent' 
                    : 'bg-theme-tertiary'
                  }
                  ${!preferences.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span
                  className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                    ${preferences[item.key as keyof EmailPreferences] && preferences.enabled 
                      ? 'translate-x-7' 
                      : 'translate-x-1'
                    }
                  `}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <p className="text-xs text-theme-muted text-center">
        Los cambios se guardan automáticamente. 
        Revisa la consola del navegador para ver los emails enviados.
      </p>
    </div>
  );
}

export default EmailSettingsPanel;
