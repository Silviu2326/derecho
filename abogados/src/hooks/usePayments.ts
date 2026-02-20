// Hook for Payment Processing
// Manages payment state and operations

import { useState, useCallback } from 'react';
import { 
  paymentService, 
  type InvoicePayment, 
  type PaymentResult,
  type PaymentStatus 
} from '@/services/paymentService';

type PaymentState = 'idle' | 'processing' | 'success' | 'error';

interface UsePaymentsReturn {
  // State
  paymentState: PaymentState;
  lastPayment: PaymentResult | null;
  error: string | null;
  isProcessing: boolean;
  
  // Actions
  processPayment: (payment: InvoicePayment, options?: { mode?: 'hosted' | 'embedded' }) => Promise<PaymentResult>;
  resetState: () => void;
  
  // Helpers
  validateAmount: (amount: number) => { valid: boolean; error?: string };
  formatAmount: (amount: number, currency?: string) => string;
}

export function usePayments(): UsePaymentsReturn {
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [lastPayment, setLastPayment] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async (
    payment: InvoicePayment,
    options?: { mode?: 'hosted' | 'embedded' }
  ): Promise<PaymentResult> => {
    // Reset state
    setPaymentState('processing');
    setError(null);
    setLastPayment(null);

    try {
      // Validate amount
      const validation = paymentService.validateAmount(payment.amount);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Process payment
      const result = await paymentService.processPayment(payment, options);

      if (result.success) {
        setPaymentState('success');
        setLastPayment(result);
      } else {
        setPaymentState('error');
        setError(result.error || 'Payment failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setPaymentState('error');
      setError(errorMessage);
      
      return {
        success: false,
        status: 'failed',
        error: errorMessage
      };
    }
  }, []);

  const resetState = useCallback(() => {
    setPaymentState('idle');
    setLastPayment(null);
    setError(null);
  }, []);

  const validateAmount = useCallback((amount: number) => {
    return paymentService.validateAmount(amount);
  }, []);

  const formatAmount = useCallback((amount: number, currency?: string) => {
    return paymentService.formatAmount(amount, currency);
  }, []);

  return {
    paymentState,
    lastPayment,
    error,
    isProcessing: paymentState === 'processing',
    processPayment,
    resetState,
    validateAmount,
    formatAmount
  };
}

// Convenience hook specifically for invoice payments in Portal Cliente
export function useInvoicePayments() {
  const {
    paymentState,
    lastPayment,
    error,
    isProcessing,
    processPayment,
    resetState,
    formatAmount
  } = usePayments();

  // Pay a single invoice
  const payInvoice = useCallback(async (
    invoice: {
      id: string;
      amount: number;
      caseTitle?: string;
    },
    client: {
      email: string;
      name: string;
    }
  ) => {
    const payment: InvoicePayment = {
      invoiceId: invoice.id,
      amount: invoice.amount,
      currency: 'eur',
      description: `Factura ${invoice.id}`,
      caseTitle: invoice.caseTitle,
      clientEmail: client.email,
      clientName: client.name
    };

    return processPayment(payment, { mode: 'hosted' });
  }, [processPayment]);

  // Pay multiple invoices (batch)
  const payInvoices = useCallback(async (
    invoices: Array<{
      id: string;
      amount: number;
      caseTitle?: string;
    }>,
    client: {
      email: string;
      name: string;
    }
  ) => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    const payment: InvoicePayment = {
      invoiceId: invoices.map(i => i.id).join(','),
      amount: totalAmount,
      currency: 'eur',
      description: `Facturas: ${invoices.map(i => i.id).join(', ')}`,
      caseTitle: invoices[0]?.caseTitle,
      clientEmail: client.email,
      clientName: client.name
    };

    return processPayment(payment, { mode: 'hosted' });
  }, [processPayment]);

  return {
    paymentState,
    lastPayment,
    error,
    isProcessing,
    payInvoice,
    payInvoices,
    resetState,
    formatAmount
  };
}
