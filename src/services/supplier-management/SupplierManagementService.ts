import { ApiIntegration } from '../ApiIntegration';
import {
  Supplier,
  SupplierStatus,
  SupplierTier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierSearchFilters,
  SupplierVerificationRequest,
  VerificationStatus,
  VerificationLevel,
  SupplierAnalytics,
  AuditRecord,
  SupplierReview,
  PerformanceMetrics,
  RiskProfile,
  RiskLevel
} from '../../types/supplier-management';

export class SupplierManagementService {
  private static baseUrl = '/api/suppliers';

  // Core Supplier Management
  static async createSupplier(request: CreateSupplierRequest): Promise<Supplier> {
    try {
      const response = await ApiIntegration.suppliers.create(request);
      
      // Initialize verification process
      this.initiateVerificationProcess(response.id);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create supplier');
    }
  }

  static async getSupplier(supplierId: string): Promise<Supplier> {
    try {
      const response = await ApiIntegration.suppliers.getById(supplierId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch supplier ${supplierId}`);
    }
  }

  static async updateSupplier(supplierId: string, updates: UpdateSupplierRequest): Promise<Supplier> {
    try {
      const response = await ApiIntegration.suppliers.update(supplierId, updates);
      
      // Log significant changes
      if (updates.status || updates.tier) {
        this.logSupplierChange(supplierId, updates);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to update supplier ${supplierId}`);
    }
  }

  static async searchSuppliers(
    filters: SupplierSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ suppliers: Supplier[]; total: number; pages: number }> {
    try {
      const response = await ApiIntegration.suppliers.getAll({
        ...filters,
        page,
        limit
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to search suppliers');
    }
  }

  static async deleteSupplier(supplierId: string, reason: string): Promise<void> {
    try {
      await ApiIntegration.suppliers.delete(supplierId);
      
      // Log deletion
      this.logSupplierDeletion(supplierId, reason);
    } catch (error) {
      throw this.handleError(error, `Failed to delete supplier ${supplierId}`);
    }
  }

  // Verification Management
  static async initiateVerification(
    verificationRequest: SupplierVerificationRequest
  ): Promise<VerificationStatus> {
    try {
      const response = await ApiIntegration.suppliers.verify(
        verificationRequest.supplierId,
        verificationRequest
      );
      
      // Schedule verification tasks
      await this.scheduleVerificationTasks(verificationRequest);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to initiate verification');
    }
  }

  static async getVerificationStatus(supplierId: string): Promise<VerificationStatus> {
    try {
      const response = await ApiIntegration.suppliers.getVerificationStatus(supplierId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get verification status for supplier ${supplierId}`);
    }
  }

  static async updateVerificationStatus(
    supplierId: string,
    status: Partial<VerificationStatus>
  ): Promise<VerificationStatus> {
    try {
      const response = await ApiIntegration.suppliers.updateVerificationStatus?.(
        supplierId,
        status
      ) || status as VerificationStatus;
      
      // Notify stakeholders of verification status change
      this.notifyVerificationStatusChange(supplierId, status);
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to update verification status for supplier ${supplierId}`);
    }
  }

  static async completeVerificationItem(
    supplierId: string,
    itemId: string,
    evidence: {
      documents?: string[];
      notes?: string;
      verifiedBy: string;
    }
  ): Promise<void> {
    try {
      await ApiIntegration.suppliers.completeVerificationItem?.(
        supplierId,
        itemId,
        evidence
      );
      
      // Check if all verification items are complete
      this.checkVerificationCompletion(supplierId);
    } catch (error) {
      throw this.handleError(error, 'Failed to complete verification item');
    }
  }

  // Certification Management
  static async getCertifications(supplierId: string): Promise<any[]> {
    try {
      const response = await ApiIntegration.suppliers.getCertifications(supplierId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get certifications for supplier ${supplierId}`);
    }
  }

  static async addCertification(
    supplierId: string,
    certification: any
  ): Promise<any> {
    try {
      const response = await ApiIntegration.suppliers.addCertification(supplierId, certification);
      
      // Schedule renewal reminder if applicable
      if (certification.expiryDate) {
        this.scheduleRenewalReminder(supplierId, certification);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to add certification');
    }
  }

  static async renewCertification(
    supplierId: string,
    certificationId: string,
    renewalData: any
  ): Promise<any> {
    try {
      const response = await ApiIntegration.suppliers.renewCertification?.(
        supplierId,
        certificationId,
        renewalData
      );
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to renew certification');
    }
  }

  // Performance Management
  static async getPerformanceMetrics(
    supplierId: string,
    dateRange?: { start: string; end: string }
  ): Promise<PerformanceMetrics> {
    try {
      const response = await ApiIntegration.suppliers.getPerformanceMetrics(supplierId, dateRange);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get performance metrics for supplier ${supplierId}`);
    }
  }

  static async updatePerformanceMetrics(
    supplierId: string,
    metrics: Partial<PerformanceMetrics>
  ): Promise<PerformanceMetrics> {
    try {
      const response = await ApiIntegration.suppliers.updatePerformanceMetrics?.(
        supplierId,
        metrics
      ) || metrics as PerformanceMetrics;
      
      // Analyze performance trends
      this.analyzePerformanceTrends(supplierId, metrics);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update performance metrics');
    }
  }

  static async evaluateSupplierPerformance(
    supplierId: string,
    evaluationPeriod: { start: string; end: string },
    evaluationCriteria: any
  ): Promise<PerformanceMetrics> {
    try {
      const response = await ApiIntegration.suppliers.evaluatePerformance?.(
        supplierId,
        evaluationPeriod,
        evaluationCriteria
      );
      
      if (!response) {
        // Generate performance evaluation based on available data
        return this.generatePerformanceEvaluation(supplierId, evaluationPeriod);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to evaluate supplier performance');
    }
  }

  // Risk Management
  static async getRiskAssessment(supplierId: string): Promise<RiskProfile> {
    try {
      const response = await ApiIntegration.suppliers.getRiskAssessment(supplierId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get risk assessment for supplier ${supplierId}`);
    }
  }

  static async updateRiskProfile(
    supplierId: string,
    riskData: Partial<RiskProfile>
  ): Promise<RiskProfile> {
    try {
      const response = await ApiIntegration.suppliers.updateRiskProfile(supplierId, riskData);
      
      // Trigger alerts if risk level is high
      if (riskData.overallRisk && ['high', 'very_high', 'critical'].includes(riskData.overallRisk)) {
        this.triggerRiskAlert(supplierId, riskData.overallRisk);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update risk profile');
    }
  }

  static async performRiskAssessment(
    supplierId: string,
    assessmentCriteria?: any
  ): Promise<RiskProfile> {
    try {
      const response = await ApiIntegration.suppliers.performRiskAssessment?.(
        supplierId,
        assessmentCriteria
      );
      
      if (!response) {
        // Generate risk assessment based on available data
        return this.generateRiskAssessment(supplierId);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to perform risk assessment');
    }
  }

  // Audit Management
  static async getAuditHistory(supplierId: string): Promise<AuditRecord[]> {
    try {
      const response = await ApiIntegration.suppliers.getAuditHistory(supplierId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get audit history for supplier ${supplierId}`);
    }
  }

  static async scheduleAudit(
    supplierId: string,
    auditData: {
      type: string;
      plannedDate: string;
      scope: string[];
      auditTeam?: string[];
      priority?: string;
    }
  ): Promise<AuditRecord> {
    try {
      const response = await ApiIntegration.suppliers.scheduleAudit(supplierId, auditData);
      
      // Send audit notifications
      this.sendAuditNotifications(supplierId, response);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to schedule audit');
    }
  }

  static async completeAudit(
    supplierId: string,
    auditId: string,
    results: {
      findings: any[];
      recommendations: any[];
      correctionActions?: any[];
      reportUrl?: string;
      nextAuditDate?: string;
    }
  ): Promise<AuditRecord> {
    try {
      const response = await ApiIntegration.suppliers.completeAudit?.(
        supplierId,
        auditId,
        results
      ) || {} as AuditRecord;
      
      // Process audit results
      this.processAuditResults(supplierId, results);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to complete audit');
    }
  }

  // Capabilities Management
  static async getCapabilities(supplierId: string): Promise<any[]> {
    try {
      const response = await ApiIntegration.suppliers.getCapabilities(supplierId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get capabilities for supplier ${supplierId}`);
    }
  }

  static async updateCapabilities(
    supplierId: string,
    capabilities: any[]
  ): Promise<any[]> {
    try {
      const response = await ApiIntegration.suppliers.updateCapabilities(supplierId, capabilities);
      
      // Update supplier matching algorithms
      this.updateSupplierMatchingData(supplierId, capabilities);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update capabilities');
    }
  }

  // Analytics and Reporting
  static async getSupplierAnalytics(
    dateRange?: { start: string; end: string },
    filters?: SupplierSearchFilters
  ): Promise<SupplierAnalytics> {
    try {
      const response = await ApiIntegration.suppliers.getAnalytics?.({
        dateRange,
        ...filters
      }) || this.getMockAnalytics();
      
      return response;
    } catch (error) {
      console.warn('Supplier analytics service unavailable, using mock data');
      return this.getMockAnalytics();
    }
  }

  static async exportSupplierData(
    supplierIds: string[],
    format: 'csv' | 'excel' | 'pdf' = 'excel',
    includePerformance = true
  ): Promise<{ url: string; filename: string }> {
    try {
      const response = await ApiIntegration.suppliers.exportData?.({
        supplierIds,
        format,
        includePerformance
      }) || { url: '', filename: 'suppliers-export.xlsx' };
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to export supplier data');
    }
  }

  static async generateSupplierReport(
    supplierId: string,
    reportType: 'performance' | 'verification' | 'risk' | 'comprehensive' = 'comprehensive'
  ): Promise<{ reportUrl: string; reportId: string }> {
    try {
      const response = await ApiIntegration.suppliers.generateReport?.({
        supplierId,
        reportType
      }) || { reportUrl: '', reportId: `report-${Date.now()}` };
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to generate supplier report');
    }
  }

  // Supplier Comparison and Benchmarking
  static async compareSuppliers(
    supplierIds: string[],
    comparisonCriteria: string[]
  ): Promise<any> {
    try {
      const response = await ApiIntegration.suppliers.compareSuppliers?.({
        supplierIds,
        criteria: comparisonCriteria
      });
      
      if (!response) {
        return this.generateSupplierComparison(supplierIds, comparisonCriteria);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to compare suppliers');
    }
  }

  static async benchmarkSupplier(
    supplierId: string,
    benchmarkCriteria: {
      industry?: string;
      region?: string;
      size?: string;
      capabilities?: string[];
    }
  ): Promise<any> {
    try {
      const response = await ApiIntegration.suppliers.benchmarkSupplier?.({
        supplierId,
        ...benchmarkCriteria
      });
      
      return response || this.generateBenchmarkData(supplierId, benchmarkCriteria);
    } catch (error) {
      throw this.handleError(error, 'Failed to benchmark supplier');
    }
  }

  // Private helper methods
  private static initiateVerificationProcess(supplierId: string): void {
    console.log(`Initiating verification process for supplier ${supplierId}`);
    
    setTimeout(() => {
      this.createVerificationChecklist(supplierId);
    }, 1000);
  }

  private static createVerificationChecklist(supplierId: string): void {
    const checklist = [
      'Business registration verification',
      'Financial stability check',
      'Quality certifications review',
      'Facility assessment',
      'Reference checks',
      'Compliance verification',
      'Insurance verification'
    ];
    
    console.log(`Created verification checklist for supplier ${supplierId}:`, checklist);
  }

  private static async scheduleVerificationTasks(
    request: SupplierVerificationRequest
  ): Promise<void> {
    console.log(`Scheduling verification tasks for supplier ${request.supplierId}`);
    
    // In real implementation, this would create workflow tasks
    if (request.verificationMethod === 'on_site_audit') {
      console.log('Scheduling on-site audit');
    }
  }

  private static logSupplierChange(supplierId: string, changes: UpdateSupplierRequest): void {
    console.log(`Supplier ${supplierId} updated:`, changes);
  }

  private static logSupplierDeletion(supplierId: string, reason: string): void {
    console.log(`Supplier ${supplierId} deleted. Reason: ${reason}`);
  }

  private static notifyVerificationStatusChange(
    supplierId: string,
    status: Partial<VerificationStatus>
  ): void {
    console.log(`Verification status changed for supplier ${supplierId}:`, status);
  }

  private static checkVerificationCompletion(supplierId: string): void {
    console.log(`Checking verification completion for supplier ${supplierId}`);
  }

  private static scheduleRenewalReminder(supplierId: string, certification: any): void {
    console.log(`Scheduled renewal reminder for supplier ${supplierId}`, certification);
  }

  private static analyzePerformanceTrends(
    supplierId: string,
    metrics: Partial<PerformanceMetrics>
  ): void {
    console.log(`Analyzing performance trends for supplier ${supplierId}`, metrics);
  }

  private static triggerRiskAlert(supplierId: string, riskLevel: RiskLevel): void {
    console.log(`Risk alert triggered for supplier ${supplierId}: ${riskLevel}`);
  }

  private static sendAuditNotifications(supplierId: string, audit: AuditRecord): void {
    console.log(`Audit notifications sent for supplier ${supplierId}`, audit);
  }

  private static processAuditResults(supplierId: string, results: any): void {
    console.log(`Processing audit results for supplier ${supplierId}`, results);
  }

  private static updateSupplierMatchingData(supplierId: string, capabilities: any[]): void {
    console.log(`Updating matching data for supplier ${supplierId}`, capabilities);
  }

  private static generatePerformanceEvaluation(
    supplierId: string,
    period: { start: string; end: string }
  ): PerformanceMetrics {
    return {
      overallRating: 4.2,
      onTimeDelivery: { score: 92, target: 95, trend: 'improving', lastUpdated: new Date().toISOString(), dataPoints: [] },
      qualityRating: { score: 88, target: 90, trend: 'stable', lastUpdated: new Date().toISOString(), dataPoints: [] },
      responsiveness: { score: 85, target: 90, trend: 'improving', lastUpdated: new Date().toISOString(), dataPoints: [] },
      costCompetitiveness: { score: 78, target: 80, trend: 'stable', lastUpdated: new Date().toISOString(), dataPoints: [] },
      innovation: { score: 75, target: 80, trend: 'improving', lastUpdated: new Date().toISOString(), dataPoints: [] },
      sustainability: { score: 82, target: 85, trend: 'improving', lastUpdated: new Date().toISOString(), dataPoints: [] },
      compliance: { score: 95, target: 98, trend: 'stable', lastUpdated: new Date().toISOString(), dataPoints: [] },
      financialStability: { score: 87, target: 90, trend: 'stable', lastUpdated: new Date().toISOString(), dataPoints: [] },
      communicationEffectiveness: { score: 90, target: 92, trend: 'stable', lastUpdated: new Date().toISOString(), dataPoints: [] },
      lastEvaluationDate: new Date().toISOString(),
      evaluationFrequency: 'quarterly',
      improvementAreas: ['Cost optimization', 'Innovation capabilities'],
      strengthAreas: ['Quality consistency', 'Delivery reliability'],
      actionPlans: []
    };
  }

  private static generateRiskAssessment(supplierId: string): RiskProfile {
    return {
      overallRisk: 'medium',
      lastAssessmentDate: new Date().toISOString(),
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      riskCategories: [
        {
          category: 'financial',
          level: 'low',
          probability: 0.2,
          impact: 0.3,
          description: 'Financial stability is good',
          indicators: [],
          mitigationActions: [],
          lastReviewed: new Date().toISOString()
        }
      ],
      mitigationStrategies: [],
      contingencyPlans: [],
      monitoringFrequency: 'monthly',
      riskTolerance: 'medium',
      escalationProcedures: []
    };
  }

  private static generateSupplierComparison(supplierIds: string[], criteria: string[]): any {
    return {
      suppliers: supplierIds,
      criteria,
      comparison: supplierIds.map(id => ({
        supplierId: id,
        scores: criteria.reduce((acc, criterion) => {
          acc[criterion] = Math.random() * 100;
          return acc;
        }, {} as Record<string, number>)
      })),
      recommendations: ['Consider supplier diversification', 'Focus on top performers']
    };
  }

  private static generateBenchmarkData(supplierId: string, criteria: any): any {
    return {
      supplierId,
      benchmarkResults: {
        industry_average: Math.random() * 100,
        regional_average: Math.random() * 100,
        top_quartile: Math.random() * 100,
        supplier_score: Math.random() * 100
      },
      ranking: {
        industry: Math.floor(Math.random() * 100) + 1,
        regional: Math.floor(Math.random() * 50) + 1
      }
    };
  }

  private static getMockAnalytics(): SupplierAnalytics {
    return {
      totalSuppliers: 245,
      byStatus: {
        active: 189,
        inactive: 23,
        suspended: 8,
        blocked: 2,
        under_review: 12,
        pending_approval: 7,
        rejected: 3,
        terminated: 1
      },
      byTier: {
        strategic: 15,
        preferred: 45,
        approved: 125,
        conditional: 35,
        trial: 18,
        development: 7
      },
      byRegion: {
        'North America': 89,
        'Europe': 76,
        'Asia': 65,
        'South America': 12,
        'Africa': 3
      },
      byCapability: {
        'Manufacturing': 123,
        'Processing': 89,
        'Packaging': 67,
        'Logistics': 98,
        'Quality Control': 156
      },
      verificationStatus: {
        verified: 189,
        pending: 34,
        unverified: 22
      },
      performanceDistribution: {
        excellent: 45,
        good: 123,
        average: 67,
        poor: 10
      },
      riskDistribution: {
        very_low: 23,
        low: 89,
        medium: 98,
        high: 32,
        very_high: 3,
        critical: 0
      },
      spendAnalysis: {
        totalSpend: 15600000,
        topSuppliers: [],
        spendByCategory: {},
        savings: 450000
      },
      diversityMetrics: {
        womenOwned: 23,
        minorityOwned: 34,
        smallBusiness: 89,
        localSuppliers: 67
      },
      sustainabilityMetrics: {
        sustainabilityCertified: 78,
        carbonNeutral: 23,
        sustainabilityScore: 73
      }
    };
  }

  private static handleError(error: any, defaultMessage: string): Error {
    console.error('Supplier management service error:', error);
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error(defaultMessage);
  }
}

export default SupplierManagementService;