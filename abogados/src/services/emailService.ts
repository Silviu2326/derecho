// Email Service - Mock Implementation
// Frontend service for email notifications (demo mode)

export type EmailTemplateType = 
  | 'welcome'
  | 'invoice_created'
  | 'invoice_paid'
  | 'invoice_overdue'
  | 'case_update'
  | 'new_message'
  | 'hearing_reminder'
  | 'document_available'
  | 'payment_reminder';

export interface EmailPayload {
  to: string;
  template: EmailTemplateType;
  subject?: string; // Optional - will be generated from template if not provided
  data: Record<string, unknown>;
}

export interface EmailResponse {
  success: boolean;
  messageId: string;
  timestamp: Date;
  preview?: string;
}

// Template definitions with subject and body
const EMAIL_TEMPLATES: Record<EmailTemplateType, { subject: string; getBody: (data: Record<string, unknown>) => string }> = {
  welcome: {
    subject: 'Bienvenido al Portal del Cliente - Tu bufete digital',
    getBody: (data) => `
      ¡Bienvenido ${data.clientName || 'Cliente'}!
      
      Has sido dado de alta en el Portal del Cliente de tu bufete.
      
      Desde ahora podrás:
      - Consultar tus casos y expedientes
      - Ver y pagar tus facturas online
      - Descargar documentos
      - Recibir notificaciones sobre audiencias
      
      Accede aquí: ${data.portalUrl || 'https://tu bufete.com/portal-cliente'}
      
      Un saludo,
      El equipo de tu bufete
    `
  },

  invoice_created: {
    subject: 'Nueva factura disponible',
    getBody: (data) => `
      Hola ${data.clientName || 'Cliente'},
      
      Se ha emitido una nueva factura para tu caso.
      
      📄 Factura: ${data.invoiceId}
      💰 Importe: ${data.amount}€
      📅 Vencimiento: ${data.dueDate}
      
      Puedes verla y pagarla desde tu portal del cliente.
      
      ${data.caseTitle ? `Caso relacionado: ${data.caseTitle}` : ''}
    `
  },

  invoice_paid: {
    subject: 'Factura pagada - Confirmación',
    getBody: (data) => `
      Hola ${data.clientName || 'Cliente'},
      
      We've received your payment. Thank you!
      
      ✅ Factura: ${data.invoiceId}
      💵 Importe: ${data.amount}€
      📅 Fecha de pago: ${data.paidDate}
      
      Puedes descargar el recibo desde tu portal.
      
      Un saludo,
      El equipo de tu bufete
    `
  },

  invoice_overdue: {
    subject: '⚠️ Factura vencida - Acción requerida',
    getBody: (data) => `
      Hola ${data.clientName || 'Cliente'},
      
      Tu factura ha vencido.
      
      🚨 Factura: ${data.invoiceId}
      💰 Importe: ${data.amount}€
      📅 Fecha de vencimiento: ${data.dueDate}
      ⚠️ Días de retraso: ${data.daysOverdue}
      
      Por favor, regulariza el pago lo antes posible.
      Puedes hacerlo desde tu portal del cliente.
      
      ¿Tienes dudas? Contáctanos.
    `
  },

  case_update: {
    subject: 'Actualización de tu caso',
    getBody: (data) => `
      Hola ${data.clientName || 'Cliente'},
      
      Hay actualizaciones en tu caso.
      
      📋 Caso: ${data.caseId}
      📌 Título: ${data.caseTitle}
      🔄 Nuevo estado: ${data.newStatus}
      
      ${data.updateDescription ? `Detalles: ${data.updateDescription}` : ''}
      
      Consulta todos los detalles en tu portal.
    `
  },

  new_message: {
    subject: 'Nuevo mensaje de tu bufete',
    getBody: (data) => `
      Hola ${data.clientName || 'Cliente'},
      
      Tienes un nuevo mensaje.
      
      📬 De: ${data.from}
      📝 Asunto: ${data.subject}
      
      "${data.preview || 'Haz clic para ver el mensaje completo'}"
      
      Responde desde tu portal del cliente.
    `
  },

  hearing_reminder: {
    subject: '📅 Recordatorio de audiencia',
    getBody: (data) => `
      Hola ${data.clientName || 'Cliente'},
      
      Te recordamos que tienes una audiencia próxima.
      
      📅 Fecha: ${data.hearingDate}
      ⏰ Hora: ${data.hearingTime}
      📍 Ubicación: ${data.location}
      
      Caso: ${data.caseTitle}
      Tipo: ${data.hearingType}
      
      Recomendamos llegar 30 minutos antes.
      Trae tu identificación oficial.
      
      ¿Necesitas ayuda? Contáctanos.
    `
  },

  document_available: {
    subject: 'Nuevo documento disponible',
    getBody: (data) => `
      Hola ${data.clientName || 'Cliente'},
      
      Hay un nuevo documento disponible para ti.
      
      📄 Documento: ${data.documentName}
      📂 Tipo: ${data.documentType}
      ${data.caseTitle ? `📋 Caso: ${data.caseTitle}` : ''}
      
      Descárgalo desde tu portal del cliente.
    `
  },

  payment_reminder: {
    subject: '⏰ Recordatorio de pago - Factura pendiente',
    getBody: (data) => `
      Hola ${data.clientName || 'Cliente'},
      
      Te recordamos que tienes una factura pendiente.
      
      📄 Factura: ${data.invoiceId}
      💰 Importe: ${data.amount}€
      ⏰ Vence el: ${data.dueDate}
      
      ${data.daysUntilDue ? `Quedan ${data.daysUntilDue} días` : 'Vence pronto'}
      
      Paga ahora desde tu portal y evita recargos.
    `
  }
};

class EmailService {
  private isEnabled: boolean = true;

  /**
   * Enable or disable the email service
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if service is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Send an email (mock - logs to console)
   * In production, this would call your backend API
   */
  async sendEmail(payload: EmailPayload): Promise<EmailResponse> {
    if (!this.isEnabled) {
      console.warn('[EmailService] Service is disabled');
      return {
        success: false,
        messageId: '',
        timestamp: new Date()
      };
    }

    const template = EMAIL_TEMPLATES[payload.template];
    
    if (!template) {
      console.error(`[EmailService] Unknown template: ${payload.template}`);
      return {
        success: false,
        messageId: '',
        timestamp: new Date()
      };
    }

    const subject = payload.subject || template.subject;
    const body = template.getBody(payload.data);

    // Mock: Log to console instead of sending
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL SIMULADO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Para: ${payload.to}`);
    console.log(`Asunto: ${subject}`);
    console.log('──────────────────────────────────');
    console.log(body);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock response
    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      preview: body
    };
  }

  /**
   * Get available email templates
   */
  getTemplates(): { type: EmailTemplateType; subject: string }[] {
    return Object.entries(EMAIL_TEMPLATES).map(([type, template]) => ({
      type: type as EmailTemplateType,
      subject: template.subject
    }));
  }

  /**
   * Preview an email template without sending
   */
  async previewTemplate(template: EmailTemplateType, data: Record<string, unknown>): Promise<{ subject: string; body: string }> {
    const templateDef = EMAIL_TEMPLATES[template];
    
    if (!templateDef) {
      throw new Error(`Unknown template: ${template}`);
    }

    return {
      subject: templateDef.subject,
      body: templateDef.getBody(data)
    };
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(to: string): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      template: 'welcome',
      data: {
        clientName: 'Test User',
        portalUrl: window.location.origin + '/portal-cliente'
      }
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
