// Compliance service for regulatory checks, certifications, and audit management
import { api } from './api';
import { ApiResponse, ComplianceValidation, ComplianceStatus, Certification } from '../shared/types';

export interface ComplianceOverview {
  totalProducts: number;
  compliantProducts: number;
  pendingChecks: number;
  expiringCertifications: number;
  averageComplianceScore: number;
  recentChecks: ComplianceCheck[];
  upcomingDeadlines: Certification[];
  regionalCompliance: RegionalCompliance[];
}

export interface ComplianceCheck {
  id: string;
  productName: string;
  checkType: string;
  status: ComplianceStatus;
  score: number;
  checkedAt: Date;
  checkedBy: string;
  region: string;
  notes?: string;
  issues?: ComplianceIssue[];
}

export interface ComplianceIssue {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation?: string;
  dueDate?: Date;
  resolved: boolean;
}

export interface RegionalCompliance {
  region: string;
  compliant: number;
  total: number;
  percentage: number;
}

export interface ComplianceReport {
  id: string;
  title: string;
  type: string;
  generatedAt: Date;
  products: string[];
  status: string;
  summary: ComplianceReportSummary;
  downloadUrl?: string;
}

export interface ComplianceReportSummary {
  totalProducts: number;
  compliantProducts: number;
  nonCompliantProducts: number;
  pendingProducts: number;
  averageScore: number;
  criticalIssues: number;
  recommendations: string[];
}

export interface ComplianceAlert {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedProducts: string[];
  actionRequired: string;
  dueDate?: Date;
  acknowledged: boolean;
  createdAt: Date;
}

class ComplianceService {
  async getComplianceOverview(): Promise<ComplianceOverview> {
    try {
      const response = await api.get<ApiResponse<ComplianceOverview>>('/compliance/overview');
      return response.data || this.getMockOverview();
    } catch (error) {
      console.error('Failed to fetch compliance overview:', error);
      return this.getMockOverview();
    }
  }

  async getComplianceChecks(filters?: {
    status?: ComplianceStatus;
    region?: string;
    productId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ComplianceCheck[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/compliance/checks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<ApiResponse<ComplianceCheck[]>>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch compliance checks:', error);
      return [];
    }
  }

  async runComplianceCheck(productId: string, checkType: string, region?: string): Promise<ComplianceCheck> {
    try {
      const response = await api.post<ApiResponse<ComplianceCheck>>('/compliance/checks', {
        productId,
        checkType,
        region
      });

      if (!response.data) {
        throw new Error('Failed to run compliance check');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to run compliance check:', error);
      throw error;
    }
  }

  async validateProduct(productId: string, regulations: string[]): Promise<ComplianceValidation> {
    try {
      const response = await api.post<ApiResponse<ComplianceValidation>>('/compliance/validate', {
        productId,
        regulations
      });

      if (!response.data) {
        throw new Error('Failed to validate product');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to validate product:', error);
      throw error;
    }
  }

  async getCertifications(filters?: {
    status?: string;
    expiringWithin?: number; // days
    issuingBody?: string;
  }): Promise<Certification[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/compliance/certifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<ApiResponse<Certification[]>>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
      return [];
    }
  }

  async renewCertification(certificationId: string): Promise<Certification> {
    try {
      const response = await api.post<ApiResponse<Certification>>(`/compliance/certifications/${certificationId}/renew`, {});

      if (!response.data) {
        throw new Error('Failed to renew certification');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to renew certification:', error);
      throw error;
    }
  }

  async getComplianceIssues(filters?: {
    severity?: string;
    resolved?: boolean;
    productId?: string;
  }): Promise<ComplianceIssue[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/compliance/issues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<ApiResponse<ComplianceIssue[]>>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch compliance issues:', error);
      return [];
    }
  }

  async resolveIssue(issueId: string, resolution: string): Promise<ComplianceIssue> {
    try {
      const response = await api.post<ApiResponse<ComplianceIssue>>(`/compliance/issues/${issueId}/resolve`, {
        resolution
      });

      if (!response.data) {
        throw new Error('Failed to resolve issue');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to resolve issue:', error);
      throw error;
    }
  }

  async generateComplianceReport(options: {
    productIds?: string[];
    regions?: string[];
    reportType: string;
    includeDetails?: boolean;
  }): Promise<ComplianceReport> {
    try {
      const response = await api.post<ApiResponse<ComplianceReport>>('/compliance/reports', options);

      if (!response.data) {
        throw new Error('Failed to generate report');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  async getComplianceAlerts(filters?: {
    severity?: string;
    acknowledged?: boolean;
    limit?: number;
  }): Promise<ComplianceAlert[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/compliance/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<ApiResponse<ComplianceAlert[]>>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch compliance alerts:', error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: string): Promise<ComplianceAlert> {
    try {
      const response = await api.post<ApiResponse<ComplianceAlert>>(`/compliance/alerts/${alertId}/acknowledge`, {});

      if (!response.data) {
        throw new Error('Failed to acknowledge alert');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  }

  async getRegionalCompliance(region?: string): Promise<RegionalCompliance[]> {
    try {
      const endpoint = region ? `/compliance/regional/${region}` : '/compliance/regional';
      const response = await api.get<ApiResponse<RegionalCompliance[]>>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch regional compliance:', error);
      return [];
    }
  }

  // Mock data for development/fallback
  private getMockOverview(): ComplianceOverview {
    return {
      totalProducts: 156,
      compliantProducts: 142,
      pendingChecks: 8,
      expiringCertifications: 3,
      averageComplianceScore: 94.2,
      recentChecks: [
        {
          id: '1',
          productName: 'Organic Cornflakes',
          checkType: 'Food Safety',
          status: ComplianceStatus.VALID,
          score: 98,
          checkedAt: new Date('2024-01-15'),
          checkedBy: 'John Doe',
          region: 'US'
        },
        {
          id: '2',
          productName: 'Premium Olive Oil',
          checkType: 'Labeling',
          status: ComplianceStatus.WARNING,
          score: 85,
          checkedAt: new Date('2024-01-14'),
          checkedBy: 'Jane Smith',
          region: 'EU'
        }
      ],
      upcomingDeadlines: [
        {
          id: '1',
          name: 'Organic Certification',
          issuingBody: 'USDA',
          certificateNumber: 'ORG-2024-001',
          issueDate: new Date('2023-06-01'),
          expiryDate: new Date('2024-06-01'),
          status: 'active'
        }
      ],
      regionalCompliance: [
        {
          region: 'US',
          compliant: 89,
          total: 95,
          percentage: 93.7
        },
        {
          region: 'EU',
          compliant: 53,
          total: 61,
          percentage: 86.9
        }
      ]
    };
  }
}

export const complianceService = new ComplianceService();