// Payment Service - Stripe Integration
// Frontend service for payment processing

export type PaymentProvider = 'stripe' | 'redsys';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'sepa' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface InvoicePayment {
  invoiceId: string;
  amount: number;
  currency: string;
  description: string;
  caseId?: string;
  caseTitle?: string;
  clientEmail: string;
  clientName: string;
}

export interface PaymentSession {
  id: string;
  url?: string; // For hosted checkout
  status: PaymentStatus;
  amount: number;
  currency: string;
  clientSecret?: string; // For embedded checkout
  expiresAt?: Date;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status: PaymentStatus;
  error?: string;
  receiptUrl?: string;
}

// Stripe configuration (replace with your keys)
const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
  currency: 'eur'
};

class PaymentService {
  private provider: PaymentProvider = 'stripe';
  private isTestMode: boolean = true;

  /**
   * Set payment provider
   */
  setProvider(provider: PaymentProvider): void {
    this.provider = provider;
  }

  /**
   * Set test/live mode
   */
  setTestMode(testMode: boolean): void {
    this.isTestMode = testMode;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      provider: this.provider,
      isTestMode: this.isTestMode,
      stripeKey: STRIPE_CONFIG.publishableKey
    };
  }

  /**
   * Create a Stripe Checkout session
   * In production, this calls your backend to create the session
   */
  async createCheckoutSession(payment: InvoicePayment): Promise<PaymentSession> {
    console.log('[Payment] Creating checkout session for:', payment.invoiceId);

    // In production: call your backend API
    // const response = await fetch('/api/payments/create-session', {
    //   method: 'POST',
    //   body: JSON.stringify(payment)
    // });

    // Mock response for demo
    await new Promise(resolve => setTimeout(resolve, 800));

    const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: sessionId,
      url: this.isTestMode 
        ? `https://checkout.stripe.com/c/pay/cs_demo_${sessionId}#fidkdWxOYHwnPyd1blpxYHZxWjA0TjE8YGRhZz1DMnVsMTQ1MDVVN2huWSc` 
        : undefined,
      status: 'pending',
      amount: payment.amount,
      currency: STRIPE_CONFIG.currency,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };
  }

  /**
   * Process payment with Stripe Elements (embedded)
   * For more customized checkout experience
   */
  async createPaymentIntent(payment: InvoicePayment): Promise<{ clientSecret: string; paymentIntentId: string }> {
    console.log('[Payment] Creating payment intent for:', payment.invoiceId);

    // In production: call your backend API
    // const response = await fetch('/api/payments/create-intent', {
    //   method: 'POST',
    //   body: JSON.stringify(payment)
    // });

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      paymentIntentId: `pi_${Date.now()}`
    };
  }

  /**
   * Confirm payment (for embedded checkout)
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    console.log('[Payment] Confirming payment:', paymentIntentId);

    // In production: verify with backend
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      return {
        success: true,
        paymentId: paymentIntentId,
        status: 'completed',
        receiptUrl: `https://dashboard.stripe.com/receipts/${paymentIntentId}`
      };
    } else {
      return {
        success: false,
        paymentId: paymentIntentId,
        status: 'failed',
        error: 'Payment declined. Please try another card.'
      };
    }
  }

  /**
   * Process payment (main method)
   * Handles both hosted and embedded checkout
   */
  async processPayment(
    payment: InvoicePayment,
    options: {
      mode?: 'hosted' | 'embedded';
      onSuccess?: (result: PaymentResult) => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<PaymentResult> {
    const { mode = 'hosted' } = options;

    try {
      if (mode === 'hosted') {
        // Create checkout session and redirect
        const session = await this.createCheckoutSession(payment);
        
        if (session.url) {
          // In production, redirect to Stripe
          // window.location.href = session.url;
          
          console.log('[Payment] Would redirect to:', session.url);
          
          // For demo, simulate success after delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          return {
            success: true,
            paymentId: session.id,
            status: 'completed',
            receiptUrl: `https://dashboard.stripe.com/receipts/${session.id}`
          };
        }
      } else {
        // Embedded payment
        const { clientSecret, paymentIntentId } = await this.createPaymentIntent(payment);
        
        // In production: use Stripe Elements to confirm payment
        // For demo: simulate confirmation
        return await this.confirmPayment(paymentIntentId);
      }

      return {
        success: false,
        status: 'failed',
        error: 'Failed to create payment session'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Payment] Error:', errorMessage);
      
      return {
        success: false,
        status: 'failed',
        error: errorMessage
      };
    }
  }

  /**
   * Get payment status from backend
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    // In production: call your backend API
    // const response = await fetch(`/api/payments/${paymentId}/status`);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock: return completed
    return 'completed';
  }

  /**
   * Request refund
   */
  async requestRefund(paymentId: string, amount?: number, reason?: string): Promise<PaymentResult> {
    console.log('[Payment] Requesting refund for:', paymentId, { amount, reason });
    
    // In production: call your backend API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      paymentId,
      status: 'refunded'
    };
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'El importe debe ser mayor a 0' };
    }
    if (amount > 999999.99) {
      return { valid: false, error: 'El importe excede el límite permitido' };
    }
    return { valid: true };
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'eur'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
