// Hook for Email Notifications
// Manages email preferences and sending

import { useState, useEffect, useCallback } from 'react';
import { 
  emailService, 
  type EmailPayload, 
  type EmailTemplateType,
  type EmailResponse 
} from '@/services/emailService';

export interface EmailPreferences {
  enabled: boolean;
  cases: boolean;
  invoices: boolean;
  hearings: boolean;
  messages: boolean;
  documents: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: EmailPreferences = {
  enabled: true,
  cases: true,
  invoices: true,
  hearings: true,
  messages: true,
  documents: true,
  marketing: false
};

const STORAGE_KEY = 'email_preferences';

interface UseEmailNotificationsReturn {
  // State
  preferences: EmailPreferences;
  isLoading: boolean;
  isSending: boolean;
  lastSentEmail: EmailResponse | null;
  error: string | null;
  
  // Actions
  updatePreferences: (prefs: Partial<EmailPreferences>) => void;
  resetPreferences: () => void;
  sendEmail: (payload: Omit<EmailPayload, 'to'>) => Promise<EmailResponse | null>;
  sendTestEmail: () => Promise<boolean>;
  
  // Helpers
  canSendTemplate: (template: EmailTemplateType) => boolean;
  isEnabled: () => boolean;
}

export function useEmailNotifications(): UseEmailNotificationsReturn {
  const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [lastSentEmail, setLastSentEmail] = useState<EmailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch {
        console.warn('[Email] Failed to parse stored preferences');
      }
    }
    setIsLoading(false);
  }, []);

  // Save preferences to localStorage when changed
  const updatePreferences = useCallback((prefs: Partial<EmailPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...prefs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check if a specific template type can be sent
  const canSendTemplate = useCallback((template: EmailTemplateType): boolean => {
    if (!preferences.enabled) return false;

    const templateMap: Record<EmailTemplateType, keyof Omit<EmailPreferences, 'enabled' | 'marketing'>> = {
      welcome: 'cases',
      invoice_created: 'invoices',
      invoice_paid: 'invoices',
      invoice_overdue: 'invoices',
      case_update: 'cases',
      new_message: 'messages',
      hearing_reminder: 'hearings',
      document_available: 'documents',
      payment_reminder: 'invoices'
    };

    const prefKey = templateMap[template];
    return prefKey ? preferences[prefKey] : false;
  }, [preferences]);

  // Check if emails are enabled
  const isEnabled = useCallback((): boolean => {
    return preferences.enabled;
  }, [preferences]);

  // Send an email (mock)
  const sendEmail = useCallback(async (payload: Omit<EmailPayload, 'to'>): Promise<EmailResponse | null> => {
    if (!preferences.enabled) {
      setError('Email notifications are disabled');
      return null;
    }

    // Check if user wants this type of notification
    if (!canSendTemplate(payload.template)) {
      console.log(`[Email] User has disabled ${payload.template} notifications`);
      return null;
    }

    setIsSending(true);
    setError(null);

    try {
      // Get client email from somewhere (mock for now)
      const clientEmail = localStorage.getItem('client_email') || 'cliente@ejemplo.com';
      
      const response = await emailService.sendEmail({
        ...payload,
        to: clientEmail
      });

      setLastSentEmail(response);
      
      if (!response.success) {
        setError('Failed to send email');
      }

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [preferences.enabled, canSendTemplate]);

  // Send a test email
  const sendTestEmail = useCallback(async (): Promise<boolean> => {
    setIsSending(true);
    setError(null);

    try {
      const testEmail = localStorage.getItem('client_email') || 'cliente@ejemplo.com';
      const response = await emailService.sendTestEmail(testEmail);
      
      setLastSentEmail(response);
      return response.success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    preferences,
    isLoading,
    isSending,
    lastSentEmail,
    error,
    updatePreferences,
    resetPreferences,
    sendEmail,
    sendTestEmail,
    canSendTemplate,
    isEnabled
  };
}

// Helper hook specifically for the Portal Cliente
export function usePortalEmailNotifications(clientEmail?: string) {
  const {
    preferences,
    isLoading,
    isSending,
    updatePreferences,
    sendEmail,
    sendTestEmail,
    canSendTemplate
  } = useEmailNotifications();

  // Store client email
  useEffect(() => {
    if (clientEmail) {
      localStorage.setItem('client_email', clientEmail);
    }
  }, [clientEmail]);

  // Convenience methods for common notifications
  const notifyInvoiceCreated = useCallback(async (invoiceData: {
    invoiceId: string;
    amount: number;
    dueDate: string;
    caseTitle?: string;
  }) => {
    return sendEmail({
      template: 'invoice_created',
      data: invoiceData
    });
  }, [sendEmail]);

  const notifyCaseUpdate = useCallback(async (caseData: {
    caseId: string;
    caseTitle: string;
    newStatus: string;
    updateDescription?: string;
  }) => {
    return sendEmail({
      template: 'case_update',
      data: caseData
    });
  }, [sendEmail]);

  const notifyHearingReminder = useCallback(async (hearingData: {
    hearingDate: string;
    hearingTime: string;
    location: string;
    caseTitle: string;
    hearingType: string;
  }) => {
    return sendEmail({
      template: 'hearing_reminder',
      data: hearingData
    });
  }, [sendEmail]);

  const notifyNewMessage = useCallback(async (messageData: {
    from: string;
    subject: string;
    preview?: string;
  }) => {
    return sendEmail({
      template: 'new_message',
      data: messageData
    });
  }, [sendEmail]);

  return {
    preferences,
    isLoading,
    isSending,
    updatePreferences,
    sendTestEmail,
    canSendTemplate,
    // Convenience methods
    notifyInvoiceCreated,
    notifyCaseUpdate,
    notifyHearingReminder,
    notifyNewMessage
  };
}
