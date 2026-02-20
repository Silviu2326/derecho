// LOPDGDD / GDPR Service
// Data protection, consent management, and compliance

export type ConsentType = 
  | 'cookies'
  | 'analytics'
  | 'marketing'
  | 'third_party_sharing'
  | 'personal_data_processing'
  | 'communications';

export type ConsentStatus = 'granted' | 'denied' | 'pending' | 'withdrawn';

export interface Consent {
  id: string;
  type: ConsentType;
  status: ConsentStatus;
  grantedAt?: Date;
  deniedAt?: Date;
  withdrawnAt?: Date;
  version: string;
  ipAddress?: string;
}

export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  data?: unknown;
  notes?: string;
}

export interface RetentionPolicy {
  id: string;
  category: string;
  retentionPeriodMonths: number;
  legalBasis: string;
  autoDelete: boolean;
}

export interface DataBreach {
  id: string;
  detectedAt: Date;
  description: string;
  affectedRecords: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedToAuthority: boolean;
  reportedAt?: Date;
  notifiedAffected: boolean;
}

// Default retention policies
const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  { id: 'p1', category: 'client_data', retentionPeriodMonths: 84, legalBasis: 'contract', autoDelete: true },
  { id: 'p2', category: 'invoices', retentionPeriodMonths: 120, legalBasis: 'legal_obligation', autoDelete: true },
  { id: 'p3', category: 'case_documents', retentionPeriodMonths: 240, legalBasis: 'legal_obligation', autoDelete: true },
  { id: 'p4', category: 'communications', retentionPeriodMonths: 24, legalBasis: 'legitimate_interest', autoDelete: true },
  { id: 'p5', category: 'cookies', retentionPeriodMonths: 12, legalBasis: 'consent', autoDelete: true },
  { id: 'p6', category: 'marketing', retentionPeriodMonths: 24, legalBasis: 'consent', autoDelete: true }
];

class LOPDGDService {
  private consents: Map<string, Consent[]> = new Map();
  private dataRequests: DataSubjectRequest[] = [];
  private retentionPolicies: RetentionPolicy[] = DEFAULT_RETENTION_POLICIES;
  private breaches: DataBreach[] = [];

  /**
   * Record consent from a data subject
   */
  async recordConsent(
    userId: string,
    type: ConsentType,
    status: ConsentStatus,
    version: string = '1.0'
  ): Promise<Consent> {
    const consent: Consent = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status,
      version,
      grantedAt: status === 'granted' ? new Date() : undefined,
      deniedAt: status === 'denied' ? new Date() : undefined,
      withdrawnAt: status === 'withdrawn' ? new Date() : undefined,
      ipAddress: '0.0.0.0' // Would be captured from request in production
    };

    // Save consent
    const userConsents = this.consents.get(userId) || [];
    userConsents.push(consent);
    this.consents.set(userId, userConsents);

    // Also save to localStorage for demo
    localStorage.setItem(`consents_${userId}`, JSON.stringify(userConsents));

    console.log('[LOPD] Consent recorded:', consent);
    return consent;
  }

  /**
   * Get all consents for a user
   */
  async getConsents(userId: string): Promise<Consent[]> {
    return this.consents.get(userId) || [];
  }

  /**
   * Check if user has given specific consent
   */
  async hasConsent(userId: string, type: ConsentType): Promise<boolean> {
    const consents = await this.getConsents(userId);
    const latestConsent = consents.find(c => c.type === type);
    return latestConsent?.status === 'granted';
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(userId: string, type: ConsentType): Promise<boolean> {
    return this.recordConsent(userId, type, 'withdrawn').then(() => true);
  }

  /**
   * Handle data subject access request (DSAR)
   */
  async handleDataRequest(
    userId: string,
    type: DataSubjectRequest['type'],
    notes?: string
  ): Promise<DataSubjectRequest> {
    const request: DataSubjectRequest = {
      id: `dsar_${Date.now()}`,
      type,
      status: 'pending',
      requestedAt: new Date(),
      notes
    };

    this.dataRequests.push(request);

    // In production: queue for processing
    console.log('[LOPD] Data request received:', request);

    // Simulate processing
    setTimeout(() => {
      request.status = 'completed';
      request.completedAt = new Date();
    }, 5000);

    return request;
  }

  /**
   * Export user data (for portability)
   */
  async exportUserData(userId: string): Promise<{
    success: boolean;
    data?: unknown;
    format?: string;
  }> {
    // Mock: collect all user data
    const userData = {
      consents: await this.getConsents(userId),
      profile: { name: 'Demo User', email: 'demo@example.com' },
      cases: [],
      invoices: [],
      exportedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: userData,
      format: 'json'
    };
  }

  /**
   * Delete user data (right to erasure)
   */
  async eraseUserData(userId: string): Promise<{ success: boolean; deletedCategories: string[] }> {
    // In production: delete from all systems
    const deletedCategories = [
      'profile',
      'cases',
      'invoices',
      'communications',
      'consents'
    ];

    console.log('[LOPD] Erasing data for user:', userId, deletedCategories);

    return {
      success: true,
      deletedCategories
    };
  }

  /**
   * Get retention policies
   */
  getRetentionPolicies(): RetentionPolicy[] {
    return this.retentionPolicies;
  }

  /**
   * Update retention policy
   */
  updateRetentionPolicy(policyId: string, updates: Partial<RetentionPolicy>): boolean {
    const index = this.retentionPolicies.findIndex(p => p.id === policyId);
    if (index >= 0) {
      this.retentionPolicies[index] = { ...this.retentionPolicies[index], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Check documents for deletion based on retention policy
   */
  async checkDocumentsForDeletion(): Promise<{
    toDelete: Array<{ id: string; category: string; expiredAt: Date }>;
    processed: number;
  }> {
    // Mock: return empty list
    return {
      toDelete: [],
      processed: 0
    };
  }

  /**
   * Record a data breach
   */
  async recordBreach(
    description: string,
    affectedRecords: number,
    severity: DataBreach['severity']
  ): Promise<DataBreach> {
    const breach: DataBreach = {
      id: `breach_${Date.now()}`,
      detectedAt: new Date(),
      description,
      affectedRecords,
      severity,
      reportedToAuthority: false,
      notifiedAffected: false
    };

    this.breaches.push(breach);

    // In production: notify authority within 72 hours if required
    console.log('[LOPD] Data breach recorded:', breach);

    return breach;
  }

  /**
   * Generate privacy notice (cookie banner content)
   */
  generatePrivacyNotice(locale: string = 'es'): {
    title: string;
    description: string;
    cookies: Array<{ name: string; purpose: string; duration: string }>;
    acceptButton: string;
    rejectButton: string;
    settingsButton: string;
  } {
    return {
      title: locale === 'es' ? 'Aviso de Cookies' : 'Cookie Notice',
      description: locale === 'es' 
        ? 'Utilizamos cookies propias y de terceros para mejorar nuestros servicios y mostrarle publicidad relacionada con sus preferencias.'
        : 'We use own and third-party cookies to improve our services and show you advertising related to your preferences.',
      cookies: [
        { name: 'session', purpose: 'Sesión del usuario', duration: 'Sesión' },
        { name: 'preferences', purpose: 'Preferencias del usuario', duration: '1 año' },
        { name: 'analytics', purpose: 'Análisis anónimo de uso', duration: '1 año' },
        { name: 'marketing', purpose: 'Publicidad personalizada', duration: '1 año' }
      ],
      acceptButton: locale === 'es' ? 'Aceptar todo' : 'Accept all',
      rejectButton: locale === 'es' ? 'Rechazar todo' : 'Reject all',
      settingsButton: locale === 'es' ? 'Personalizar' : 'Customize'
    };
  }

  /**
   * Log data processing activity
   */
  logActivity(
    userId: string,
    activity: string,
    category: string,
    data?: unknown
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      activity,
      category,
      data
    };

    // In production: store in audit log
    console.log('[LOPD] Activity logged:', logEntry);
  }
}

export const lopdgdService = new LOPDGDService();
