// Reports & KPIs Service
// Analytics, profitability metrics, and custom reports

export interface DateRange {
  start: Date;
  end: Date;
}

export interface LawyerKPIs {
  lawyerId: string;
  lawyerName: string;
  period: DateRange;
  
  // Revenue metrics
  totalBilled: number;
  totalCollected: number;
  averageInvoiceValue: number;
  
  // Time metrics
  totalHoursWorked: number;
  hourlyRate: number;
  effectiveHourlyRate: number; // Billed / Hours
  
  // Efficiency metrics
  casesHandled: number;
  casesClosed: number;
  averageCaseDuration: number; // days
  
  // Performance
  collectionRate: number; // % collected vs billed
  profitabilityIndex: number; // (billed - costs) / billed
}

export interface CaseKPIs {
  caseId: string;
  caseTitle: string;
  clientName: string;
  lawyerName: string;
  
  // Financial
  totalBilled: number;
  totalCosts: number;
  estimatedCost: number;
  deviation: number; // % over/under estimate
  
  // Time
  totalHours: number;
  estimatedHours: number;
  timeDeviation: number;
  
  // Status
  status: string;
  startedAt: Date;
  closedAt?: Date;
  duration: number;
  
  // Profitability
  profitMargin: number;
  profitabilityScore: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'lawyer' | 'case' | 'financial' | 'operational';
  filters: Record<string, unknown>;
  columns: string[];
  groupBy?: string;
  createdAt: Date;
  lastRunAt?: Date;
}

export interface Benchmark {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: 'percentage' | 'currency' | 'hours';
  status: 'above' | 'below' | 'on_track';
}

class ReportsService {
  private customReports: CustomReport[] = [];

  /**
   * Get KPIs for a specific lawyer
   */
  async getLawyerKPIs(
    lawyerId: string,
    dateRange: DateRange
  ): Promise<LawyerKPIs> {
    // Mock data - in production, aggregate from database
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockData: LawyerKPIs = {
      lawyerId,
      lawyerName: 'María González',
      period: dateRange,
      
      // Revenue
      totalBilled: 45000,
      totalCollected: 38500,
      averageInvoiceValue: 2500,
      
      // Time
      totalHoursWorked: 320,
      hourlyRate: 150,
      effectiveHourlyRate: 140.63,
      
      // Efficiency
      casesHandled: 18,
      casesClosed: 12,
      averageCaseDuration: 45,
      
      // Performance
      collectionRate: 85.5,
      profitabilityIndex: 0.72
    };

    return mockData;
  }

  /**
   * Get KPIs for a specific case
   */
  async getCaseKPIs(caseId: string): Promise<CaseKPIs> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      caseId,
      caseTitle: 'Demanda contractual - Constructora XYZ',
      clientName: 'Constructora XYZ S.L.',
      lawyerName: 'María González',
      
      // Financial
      totalBilled: 8500,
      totalCosts: 2100,
      estimatedCost: 5000,
      deviation: -58, // Over budget (negative = worse)
      
      // Time
      totalHours: 62,
      estimatedHours: 40,
      timeDeviation: 55, // % over estimate
      
      // Status
      status: 'active',
      startedAt: new Date('2026-01-10'),
      closedAt: undefined,
      duration: 41,
      
      // Profitability
      profitMargin: 0.75,
      profitabilityScore: 'excellent'
    };
  }

  /**
   * Compare lawyer performance vs targets
   */
  async getLawyerBenchmarks(
    lawyerId: string
  ): Promise<Benchmark[]> {
    const kpis = await this.getLawyerKPIs(lawyerId, {
      start: new Date('2026-01-01'),
      end: new Date('2026-12-31')
    });

    return [
      {
        id: 'b1',
        name: 'Facturación objetivo',
        target: 60000,
        actual: kpis.totalBilled,
        unit: 'currency',
        status: kpis.totalBilled >= 60000 ? 'above' : 'below'
      },
      {
        id: 'b2',
        name: 'Horas facturables',
        target: 400,
        actual: kpis.totalHoursWorked,
        unit: 'hours',
        status: kpis.totalHoursWorked >= 400 ? 'above' : 'below'
      },
      {
        id: 'b3',
        name: 'Tasa de cobro',
        target: 90,
        actual: kpis.collectionRate,
        unit: 'percentage',
        status: kpis.collectionRate >= 90 ? 'on_track' : 'below'
      },
      {
        id: 'b4',
        name: 'Rentabilidad',
        target: 75,
        actual: kpis.profitabilityIndex * 100,
        unit: 'percentage',
        status: kpis.profitabilityIndex * 100 >= 75 ? 'above' : 'below'
      }
    ];
  }

  /**
   * Get all lawyers performance summary
   */
  async getAllLawyersPerformance(dateRange: DateRange): Promise<LawyerKPIs[]> {
    // Mock: return array of lawyers
    return [
      await this.getLawyerKPIs('lawyer_1', dateRange),
      {
        ...await this.getLawyerKPIs('lawyer_1', dateRange),
        lawyerId: 'lawyer_2',
        lawyerName: 'Carlos Ruiz',
        totalBilled: 38000,
        totalCollected: 34200,
        totalHoursWorked: 280,
        effectiveHourlyRate: 135.71,
        casesHandled: 15,
        casesClosed: 10,
        collectionRate: 90,
        profitabilityIndex: 0.68
      }
    ];
  }

  /**
   * Create custom report
   */
  createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt'>): CustomReport {
    const newReport: CustomReport = {
      ...report,
      id: `report_${Date.now()}`,
      createdAt: new Date()
    };

    this.customReports.push(newReport);
    
    // Save to localStorage
    localStorage.setItem('custom_reports', JSON.stringify(this.customReports));

    return newReport;
  }

  /**
   * Get saved reports
   */
  getCustomReports(): CustomReport[] {
    const stored = localStorage.getItem('custom_reports');
    if (stored) {
      this.customReports = JSON.parse(stored);
    }
    return this.customReports;
  }

  /**
   * Execute a custom report
   */
  async executeCustomReport(reportId: string): Promise<{
    columns: string[];
    rows: Record<string, unknown>[];
    summary: Record<string, number>;
  }> {
    const report = this.customReports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');

    // Mock data based on report type
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockRows = [
      { id: 1, name: 'María González', billed: 45000, hours: 320, rate: 140 },
      { id: 2, name: 'Carlos Ruiz', billed: 38000, hours: 280, rate: 136 },
      { id: 3, name: 'Ana López', billed: 52000, hours: 350, rate: 149 }
    ];

    return {
      columns: report.columns,
      rows: mockRows,
      summary: {
        totalBilled: 135000,
        totalHours: 950,
        averageRate: 142
      }
    };
  }

  /**
   * Delete custom report
   */
  deleteCustomReport(reportId: string): boolean {
    const index = this.customReports.findIndex(r => r.id === reportId);
    if (index >= 0) {
      this.customReports.splice(index, 1);
      localStorage.setItem('custom_reports', JSON.stringify(this.customReports));
      return true;
    }
    return false;
  }

  /**
   * Export report to file
   */
  async exportReport(
    reportId: string,
    format: 'csv' | 'xlsx' | 'pdf'
  ): Promise<{ success: boolean; filename: string }> {
    const report = this.customReports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');

    console.log(`[Reports] Exporting ${report.name} as ${format}`);

    return {
      success: true,
      filename: `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`
    };
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(): Promise<{
    revenue: { current: number; previous: number; change: number };
    cases: { active: number; closed: number; pending: number };
    collection: { rate: number; overdue: number };
    topLawyers: Array<{ name: string; billed: number }>;
  }> {
    return {
      revenue: {
        current: 135000,
        previous: 118000,
        change: 14.4
      },
      cases: {
        active: 45,
        closed: 28,
        pending: 12
      },
      collection: {
        rate: 87.5,
        overdue: 15200
      },
      topLawyers: [
        { name: 'Ana López', billed: 52000 },
        { name: 'María González', billed: 45000 },
        { name: 'Carlos Ruiz', billed: 38000 }
      ]
    };
  }
}

export const reportsService = new ReportsService();
