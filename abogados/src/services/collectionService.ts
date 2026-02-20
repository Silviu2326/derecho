// Collection/Reminders Service
// Automated payment reminders and debt collection

import { emailService } from './emailService';

export type ReminderType = 'due_soon' | 'overdue_1' | 'overdue_7' | 'overdue_14' | 'overdue_30' | 'final_warning';
export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export interface ReminderConfig {
  daysBeforeDue: number[];        // [3, 1] = reminder 3 days before and 1 day before
  daysAfterDue: number[];         // [1, 7, 14, 30] = reminders 1, 7, 14, 30 days after
  enableEmail: boolean;
  enablePush: boolean;
  maxReminders: number;
}

export interface Reminder {
  id: string;
  invoiceId: string;
  clientId: string;
  clientEmail: string;
  type: ReminderType;
  scheduledFor: Date;
  sentAt?: Date;
  status: ReminderStatus;
  template: string;
}

export interface InvoiceReminderData {
  invoiceId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  caseTitle?: string;
}

// Default reminder configuration
const DEFAULT_CONFIG: ReminderConfig = {
  daysBeforeDue: [3, 1],
  daysAfterDue: [1, 7, 14, 30],
  enableEmail: true,
  enablePush: true,
  maxReminders: 5
};

class CollectionService {
  private config: ReminderConfig = DEFAULT_CONFIG;
  private reminders: Map<string, Reminder[]> = new Map();

  /**
   * Update reminder configuration
   */
  setConfig(config: Partial<ReminderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ReminderConfig {
    return this.config;
  }

  /**
   * Calculate which reminders should be sent for an invoice
   */
  calculateReminders(invoice: InvoiceReminderData): Reminder[] {
    const reminders: Reminder[] = [];
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Reminders before due date
    for (const days of this.config.daysBeforeDue) {
      if (daysUntilDue >= days) {
        const scheduledFor = new Date(today);
        scheduledFor.setDate(scheduledFor.getDate() + (daysUntilDue - days));
        
        reminders.push({
          id: `rem_${invoice.invoiceId}_before_${days}`,
          invoiceId: invoice.invoiceId,
          clientId: invoice.clientId,
          clientEmail: invoice.clientEmail,
          type: 'due_soon',
          scheduledFor,
          status: 'pending',
          template: daysUntilDue <= 1 ? 'payment_reminder_urgent' : 'payment_reminder'
        });
      }
    }

    // Reminders after due date
    for (const days of this.config.daysAfterDue) {
      const daysAfterDue = days;
      
      if (daysUntilDue < -daysAfterDue) { // Already past this reminder date
        let type: ReminderType = 'overdue_1';
        if (days >= 7) type = 'overdue_7';
        if (days >= 14) type = 'overdue_14';
        if (days >= 30) type = 'overdue_30';

        const scheduledFor = new Date(dueDate);
        scheduledFor.setDate(scheduledFor.getDate() + daysAfterDue);

        reminders.push({
          id: `rem_${invoice.invoiceId}_after_${days}`,
          invoiceId: invoice.invoiceId,
          clientId: invoice.clientId,
          clientEmail: invoice.clientEmail,
          type,
          scheduledFor,
          status: 'pending',
          template: days >= 30 ? 'final_warning' : 'invoice_overdue'
        });
      }
    }

    return reminders.slice(0, this.config.maxReminders);
  }

  /**
   * Send a reminder (mock - would call backend in production)
   */
  async sendReminder(reminder: Reminder, invoice: InvoiceReminderData): Promise<boolean> {
    console.log(`[Collection] Sending ${reminder.type} reminder for ${invoice.invoiceId}`);

    const templateMap: Record<ReminderType, string> = {
      due_soon: 'payment_reminder',
      overdue_1: 'invoice_overdue',
      overdue_7: 'invoice_overdue',
      overdue_14: 'invoice_overdue',
      overdue_30: 'final_warning',
      final_warning: 'final_warning'
    };

    if (this.config.enableEmail) {
      await emailService.sendEmail({
        to: invoice.clientEmail,
        template: templateMap[reminder.type] as any,
        data: {
          clientName: invoice.clientName,
          invoiceId: invoice.invoiceId,
          amount: invoice.amount,
          dueDate: new Date(invoice.dueDate).toLocaleDateString('es-ES'),
          caseTitle: invoice.caseTitle,
          daysOverdue: Math.abs(Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        }
      });
    }

    // Update reminder status
    reminder.status = 'sent';
    reminder.sentAt = new Date();

    return true;
  }

  /**
   * Process pending reminders (would be called by cron job in production)
   */
  async processPendingReminders(invoices: InvoiceReminderData[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const invoice of invoices) {
      const reminders = this.calculateReminders(invoice);
      
      for (const reminder of reminders) {
        if (reminder.status === 'pending' && new Date() >= reminder.scheduledFor) {
          try {
            const success = await this.sendReminder(reminder, invoice);
            if (success) sent++;
            else failed++;
          } catch (error) {
            console.error(`[Collection] Failed to send reminder:`, error);
            failed++;
          }
        }
      }
    }

    return { sent, failed };
  }

  /**
   * Generate debt collection letter (mock)
   */
  generateDebtLetter(invoice: InvoiceReminderData, template: 'friendly' | 'formal' | 'legal' = 'formal'): string {
    const date = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const templates = {
      friendly: `
        Estimado/a ${invoice.clientName},

        Hope you are doing well. We wanted to remind you that invoice ${invoice.invoiceId} 
        for €${invoice.amount.toFixed(2)} is past due.

        Please contact us to arrange payment.

        Un saludo,
        El equipo de tu bufete
      `,
      formal: `
        Estimado/a ${invoice.clientName},

        Por la presente le informamos que la factura ${invoice.invoiceId} por importe de 
        €${invoice.amount.toFixed(2)} ha vencido el ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}.

        Le rogamos proceda al pago lo antes posible para evitar acciones adicionales.

        Atentamente,
        El equipo de tu bufete
      `,
      legal: `
        En ${date}, se notifica por la presente que la factura ${invoice.invoiceId} 
        por €${invoice.amount.toFixed(2)} se encuentra en situación de mora.

        En caso de no recibir el pago en un plazo de 10 días, se procederán a iniciar 
        las acciones legales pertinentes.

        ${invoice.caseTitle ? `Asunto relacionado: ${invoice.caseTitle}` : ''}

        Atentamente,
        Departamento de Cobranza
      `
    };

    return templates[template];
  }

  /**
   * Schedule SEPA direct debit (mock)
   */
  async createSEPADirectDebit(clientId: string, invoiceId: string, amount: number): Promise<{
    success: boolean;
    mandateId?: string;
    error?: string;
  }> {
    console.log(`[Collection] Creating SEPA direct debit for ${invoiceId}: €${amount}`);

    // In production: call backend to create mandate and schedule debit
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      mandateId: `MANDATE_${Date.now()}`
    };
  }

  /**
   * Check SEPA direct debit status
   */
  async getSEPADebitStatus(mandateId: string): Promise<{
    status: 'pending' | 'submitted' | 'accepted' | 'failed' | 'refunded';
    collectedAmount?: number;
    collectionDate?: Date;
  }> {
    // Mock: return accepted
    return {
      status: 'accepted',
      collectedAmount: 0,
      collectionDate: new Date()
    };
  }
}

// Export singleton
export const collectionService = new CollectionService();
