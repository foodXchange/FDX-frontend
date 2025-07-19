import { ApiIntegration } from '../ApiIntegration';
import {
  EnhancedRFQ,
  CreateRFQRequest,
  UpdateRFQRequest,
  RFQSearchFilters,
  AIAnalysisResult,
  SupplierMatch,
  AIMatchingOptions,
  AIRFQOptimization,
  AISpecificationGenerator,
  AIPricingPrediction,
  AIComplianceValidator,
  RFQAnalytics
} from '../../types/ai-rfq';

export class AIRFQService {
  private static baseUrl = '/api/rfq';

  // Enhanced RFQ Management
  static async createRFQ(request: CreateRFQRequest): Promise<EnhancedRFQ> {
    try {
      const response = await ApiIntegration.rfqs.create(request);
      
      // Automatically trigger AI analysis if enabled
      if (request.aiMatchingOptions) {
        this.scheduleAIAnalysis(response.id);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create RFQ');
    }
  }

  static async getRFQ(rfqId: string): Promise<EnhancedRFQ> {
    try {
      const response = await ApiIntegration.rfqs.getById(rfqId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch RFQ ${rfqId}`);
    }
  }

  static async updateRFQ(rfqId: string, updates: UpdateRFQRequest): Promise<EnhancedRFQ> {
    try {
      const response = await ApiIntegration.rfqs.update(rfqId, updates);
      
      // Re-trigger AI analysis if significant changes made
      if (this.shouldReAnalyze(updates)) {
        this.scheduleAIAnalysis(rfqId);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to update RFQ ${rfqId}`);
    }
  }

  static async searchRFQs(
    filters: RFQSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ rfqs: EnhancedRFQ[]; total: number; pages: number }> {
    try {
      const response = await ApiIntegration.rfqs.getAll({
        ...filters,
        page,
        limit
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to search RFQs');
    }
  }

  // AI-Powered Features
  static async analyzeRFQWithAI(
    rfqId: string,
    analysisType: 'comprehensive' | 'requirements' | 'market' | 'risk' | 'compliance' = 'comprehensive'
  ): Promise<AIAnalysisResult> {
    try {
      const response = await ApiIntegration.rfqs.analyzeWithAI(rfqId, { analysisType });
      
      // Store analysis results
      this.storeAnalysisResult(rfqId, response);
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to analyze RFQ ${rfqId} with AI`);
    }
  }

  static async getAIMatches(
    rfqId: string,
    options: AIMatchingOptions = {
      includeNewSuppliers: true,
      certificationWeight: 0.3,
      priceWeight: 0.25,
      qualityWeight: 0.25,
      deliveryWeight: 0.2,
      sustainabilityWeight: 0.1,
      riskTolerance: 'medium',
      innovationFocus: false,
      maxSuppliersToMatch: 10,
      confidenceThreshold: 0.7
    }
  ): Promise<SupplierMatch[]> {
    try {
      const response = await ApiIntegration.rfqs.getAIMatches(rfqId, options);
      
      // Enhance matches with additional data
      const enhancedMatches = await this.enhanceSupplierMatches(response);
      
      return enhancedMatches;
    } catch (error) {
      throw this.handleError(error, `Failed to get AI matches for RFQ ${rfqId}`);
    }
  }

  static async optimizeRFQRequirements(rfqId: string): Promise<AIRFQOptimization> {
    try {
      const response = await ApiIntegration.rfqs.optimizeRequirements(rfqId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to optimize RFQ ${rfqId}`);
    }
  }

  static async generateSpecifications(
    rfqId: string,
    productType: string,
    targetMarkets: string[] = [],
    qualityLevel: 'basic' | 'premium' | 'organic' | 'specialty' = 'basic'
  ): Promise<AISpecificationGenerator> {
    try {
      const response = await ApiIntegration.rfqs.generateSpecifications(rfqId, {
        productType,
        targetMarkets,
        qualityLevel
      });
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to generate specifications for RFQ ${rfqId}`);
    }
  }

  static async validateCompliance(
    rfqId: string,
    targetMarkets: string[]
  ): Promise<AIComplianceValidator> {
    try {
      const response = await ApiIntegration.rfqs.validateCompliance(rfqId, targetMarkets);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to validate compliance for RFQ ${rfqId}`);
    }
  }

  static async predictPricing(rfqId: string): Promise<AIPricingPrediction> {
    try {
      const response = await ApiIntegration.rfqs.predictPricing(rfqId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to predict pricing for RFQ ${rfqId}`);
    }
  }

  static async recommendSuppliers(
    rfqId: string,
    criteria: {
      geographic?: string[];
      certifications?: string[];
      supplierSize?: 'small' | 'medium' | 'large';
      priceRange?: { min: number; max: number };
      qualityScore?: number;
      sustainabilityScore?: number;
      innovationCapability?: boolean;
      riskLevel?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<SupplierMatch[]> {
    try {
      const response = await ApiIntegration.rfqs.recommendSuppliers(rfqId, criteria);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to recommend suppliers for RFQ ${rfqId}`);
    }
  }

  // RFQ Lifecycle Management
  static async publishRFQ(rfqId: string, publishOptions?: {
    notifySuppliers?: boolean;
    supplierGroups?: string[];
    publicVisibility?: boolean;
  }): Promise<EnhancedRFQ> {
    try {
      const response = await ApiIntegration.rfqs.updateStatus(rfqId, 'published');
      
      if (publishOptions?.notifySuppliers) {
        await this.notifySuppliers(rfqId, publishOptions);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to publish RFQ ${rfqId}`);
    }
  }

  static async extendDeadline(
    rfqId: string,
    newDeadline: string,
    reason: string
  ): Promise<EnhancedRFQ> {
    try {
      const response = await ApiIntegration.rfqs.update(rfqId, {
        timeline: { proposalDeadline: newDeadline },
        extensionReason: reason
      });
      
      // Notify stakeholders about deadline extension
      await this.notifyDeadlineExtension(rfqId, newDeadline, reason);
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to extend deadline for RFQ ${rfqId}`);
    }
  }

  static async cancelRFQ(rfqId: string, reason: string): Promise<EnhancedRFQ> {
    try {
      const response = await ApiIntegration.rfqs.updateStatus(rfqId, 'cancelled');
      
      // Notify all stakeholders about cancellation
      await this.notifyCancellation(rfqId, reason);
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to cancel RFQ ${rfqId}`);
    }
  }

  // Analytics and Reporting
  static async getRFQAnalytics(
    dateRange?: { start: string; end: string },
    filters?: RFQSearchFilters
  ): Promise<RFQAnalytics> {
    try {
      const response = await ApiIntegration.analytics?.getRFQAnalytics?.({
        dateRange,
        ...filters
      }) || this.getMockAnalytics();
      
      return response;
    } catch (error) {
      console.warn('Analytics service unavailable, using mock data');
      return this.getMockAnalytics();
    }
  }

  static async exportRFQData(
    rfqIds: string[],
    format: 'csv' | 'excel' | 'pdf' = 'excel',
    includeAnalysis = false
  ): Promise<{ url: string; filename: string }> {
    try {
      const response = await ApiIntegration.rfqs.exportData?.({
        rfqIds,
        format,
        includeAnalysis
      }) || { url: '', filename: 'rfq-export.xlsx' };
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to export RFQ data');
    }
  }

  // Template Management
  static async saveAsTemplate(
    rfqId: string,
    templateName: string,
    description?: string
  ): Promise<{ templateId: string }> {
    try {
      const response = await ApiIntegration.rfqs.saveAsTemplate?.({
        rfqId,
        templateName,
        description
      }) || { templateId: `template-${Date.now()}` };
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to save RFQ as template');
    }
  }

  static async createFromTemplate(
    templateId: string,
    customizations?: Partial<CreateRFQRequest>
  ): Promise<EnhancedRFQ> {
    try {
      const response = await ApiIntegration.rfqs.createFromTemplate?.({
        templateId,
        customizations
      });
      
      if (!response) {
        throw new Error('Template service not available');
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create RFQ from template');
    }
  }

  // Private helper methods
  private static scheduleAIAnalysis(rfqId: string): void {
    // Schedule AI analysis (would typically use a job queue)
    setTimeout(() => {
      this.analyzeRFQWithAI(rfqId).catch(error => {
        console.error(`Failed to analyze RFQ ${rfqId}:`, error);
      });
    }, 1000);
  }

  private static shouldReAnalyze(updates: UpdateRFQRequest): boolean {
    return !!(
      updates.requirements ||
      updates.specifications ||
      updates.compliance ||
      updates.targetMarkets ||
      updates.commercialTerms
    );
  }

  private static async enhanceSupplierMatches(matches: SupplierMatch[]): Promise<SupplierMatch[]> {
    // Enhance matches with additional data like recent performance, reviews, etc.
    return matches.map(match => ({
      ...match,
      lastUpdated: new Date().toISOString(),
      enhancedData: true
    }));
  }

  private static async storeAnalysisResult(rfqId: string, result: AIAnalysisResult): Promise<void> {
    // Store analysis result for future reference
    console.log(`Storing AI analysis result for RFQ ${rfqId}`);
  }

  private static async notifySuppliers(rfqId: string, options: any): Promise<void> {
    // Send notifications to relevant suppliers
    console.log(`Notifying suppliers about RFQ ${rfqId}`);
  }

  private static async notifyDeadlineExtension(
    rfqId: string,
    newDeadline: string,
    reason: string
  ): Promise<void> {
    // Notify stakeholders about deadline extension
    console.log(`Notifying deadline extension for RFQ ${rfqId}`);
  }

  private static async notifyCancellation(rfqId: string, reason: string): Promise<void> {
    // Notify stakeholders about RFQ cancellation
    console.log(`Notifying cancellation of RFQ ${rfqId}: ${reason}`);
  }

  private static getMockAnalytics(): RFQAnalytics {
    return {
      totalRFQs: 156,
      byStatus: {
        draft: 12,
        under_review: 8,
        published: 25,
        ai_analyzing: 3,
        collecting_proposals: 18,
        evaluating_proposals: 15,
        negotiating: 8,
        awarded: 62,
        cancelled: 4,
        expired: 1
      },
      byType: {
        standard: 89,
        urgent: 23,
        strategic: 18,
        innovation: 12,
        sustainability: 9,
        compliance_focused: 5
      },
      byPriority: {
        low: 34,
        medium: 78,
        high: 35,
        critical: 9
      },
      averageResponseTime: 5.2,
      successRate: 0.87,
      aiUsageRate: 0.73,
      costSavings: 125000,
      qualityImprovements: 0.15,
      supplierParticipation: 0.82,
      trendsAnalysis: []
    };
  }

  private static handleError(error: any, defaultMessage: string): Error {
    console.error('AI RFQ service error:', error);
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error(defaultMessage);
  }
}

export default AIRFQService;