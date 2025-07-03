// File: /src/services/complianceService.ts

interface ComplianceCheckRequest {
  productType: string;
  specifications: Record<string, any>;
  targetMarkets: string[];
  certifications?: string[];
  allergens?: string[];
}

interface ComplianceCheckResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  score: number;
  issues: ComplianceIssue[];
  recommendations: ComplianceRecommendation[];
  marketRequirements: MarketCompliance[];
  timestamp: string;
  expiresAt?: string;
}

interface ComplianceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'specification' | 'certification' | 'regulatory' | 'allergen';
  title: string;
  description: string;
  market?: string;
  suggestedFix?: string;
  historicalContext?: string;
}

interface ComplianceRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost?: number;
  timeframe?: string;
  markets: string[];
}

interface MarketCompliance {
  market: string;
  marketName: string;
  overallStatus: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  requirements: MarketRequirement[];
}

interface MarketRequirement {
  id: string;
  name: string;
  type: 'regulation' | 'certification' | 'standard' | 'labeling';
  status: 'met' | 'not_met' | 'partial' | 'unknown';
  mandatory: boolean;
  description: string;
  evidence?: string[];
}

interface CertificationStatus {
  id: string;
  name: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'missing';
  issueDate?: string;
  expiryDate?: string;
  issuer?: string;
  markets: string[];
  documentUrl?: string;
}

class ComplianceService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  private wsConnection: WebSocket | null = null;

  // Real-time compliance checking
  async startComplianceCheck(request: ComplianceCheckRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compliance/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Compliance check failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Start WebSocket connection for real-time updates
      this.setupRealtimeUpdates(data.checkId);
      
      return data.checkId;
    } catch (error) {
      console.error('Compliance check error:', error);
      throw error;
    }
  }

  async getComplianceResult(checkId: string): Promise<ComplianceCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compliance/check/${checkId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get compliance result: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get compliance result error:', error);
      throw error;
    }
  }

  // Market-specific compliance validation
  async validateMarketCompliance(productType: string, market: string, specifications: any): Promise<MarketCompliance> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compliance/markets/${market}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ productType, specifications })
      });

      if (!response.ok) {
        throw new Error(`Market validation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Market validation error:', error);
      throw error;
    }
  }

  // Certification management
  async getCertifications(): Promise<CertificationStatus[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compliance/certifications`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get certifications: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get certifications error:', error);
      throw error;
    }
  }

  async uploadCertification(file: File, metadata: any): Promise<CertificationStatus> {
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${this.baseUrl}/api/compliance/certifications/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Certificate upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Certificate upload error:', error);
      throw error;
    }
  }

  // Allergen compliance checking
  async validateAllergens(productType: string, allergens: string[], targetMarkets: string[]): Promise<ComplianceIssue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compliance/allergens/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ productType, allergens, targetMarkets })
      });

      if (!response.ok) {
        throw new Error(`Allergen validation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Allergen validation error:', error);
      throw error;
    }
  }

  // Specification validation with historical context
  async validateSpecifications(productType: string, specifications: any): Promise<ComplianceIssue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compliance/specifications/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ productType, specifications })
      });

      if (!response.ok) {
        throw new Error(`Specification validation failed: ${response.statusText}`);
      }

      const issues = await response.json();
      
      // Add historical context for critical issues
      return issues.map((issue: ComplianceIssue) => {
        if (issue.severity === 'critical' && issue.type === 'specification') {
          issue.historicalContext = this.getHistoricalContext(productType, issue.title);
        }
        return issue;
      });
    } catch (error) {
      console.error('Specification validation error:', error);
      throw error;
    }
  }

  // Generate compliance report
  async generateComplianceReport(checkId: string, format: 'pdf' | 'json' | 'csv' = 'pdf'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compliance/reports/${checkId}?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  // Real-time updates via WebSocket
  private setupRealtimeUpdates(checkId: string): void {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/compliance/${checkId}`;
    
    this.wsConnection = new WebSocket(wsUrl);
    
    this.wsConnection.onopen = () => {
      console.log('Compliance WebSocket connected');
    };
    
    this.wsConnection.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleComplianceUpdate(update);
    };
    
    this.wsConnection.onerror = (error) => {
      console.error('Compliance WebSocket error:', error);
    };
    
    this.wsConnection.onclose = () => {
      console.log('Compliance WebSocket disconnected');
      this.wsConnection = null;
    };
  }

  private handleComplianceUpdate(update: any): void {
    // Emit custom event for components to listen to
    const event = new CustomEvent('complianceUpdate', { detail: update });
    window.dispatchEvent(event);
  }

  // Utility methods
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  private getHistoricalContext(productType: string, issueTitle: string): string {
    const historicalContexts: Record<string, Record<string, string>> = {
      'cornflakes': {
        'Invalid color': 'Historical failure: A 9-month cornflakes project was terminated in 2024 due to dark brown color specification error, resulting in $2.3M loss and damaged supplier relationships.',
        'Packaging issue': 'Common packaging failures in cereal products include moisture ingress and contamination. Ensure proper barrier materials.',
      },
      'bread': {
        'Color specification': 'Bread color variations can indicate improper baking or ingredient substitution. Critical for consumer acceptance.',
      }
    };

    return historicalContexts[productType]?.[issueTitle] || '';
  }

  // Cleanup
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

// File: /src/hooks/useCompliance.ts

import { useState, useEffect, useCallback } from 'react';

interface UseComplianceOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useCompliance = (options: UseComplianceOptions = {}) => {
  const [complianceService] = useState(() => new ComplianceService());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCheck, setCurrentCheck] = useState<ComplianceCheckResponse | null>(null);
  const [certifications, setCertifications] = useState<CertificationStatus[]>([]);

  // Listen for real-time compliance updates
  useEffect(() => {
    const handleComplianceUpdate = (event: CustomEvent) => {
      const update = event.detail;
      if (update.type === 'progress') {
        setCurrentCheck(prev => prev ? { ...prev, ...update.data } : null);
      }
    };

    window.addEventListener('complianceUpdate', handleComplianceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('complianceUpdate', handleComplianceUpdate as EventListener);
      complianceService.disconnect();
    };
  }, [complianceService]);

  // Auto-refresh certifications
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(() => {
        loadCertifications();
      }, options.refreshInterval || 300000); // 5 minutes default

      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval]);

  const startComplianceCheck = useCallback(async (request: ComplianceCheckRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const checkId = await complianceService.startComplianceCheck(request);
      
      // Poll for results
      const pollResult = async () => {
        const result = await complianceService.getComplianceResult(checkId);
        setCurrentCheck(result);
        
        if (result.status === 'pending') {
          setTimeout(pollResult, 2000);
        } else {
          setIsLoading(false);
        }
      };
      
      pollResult();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compliance check failed');
      setIsLoading(false);
    }
  }, [complianceService]);

  const loadCertifications = useCallback(async () => {
    try {
      const certs = await complianceService.getCertifications();
      setCertifications(certs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certifications');
    }
  }, [complianceService]);

  const uploadCertification = useCallback(async (file: File, metadata: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cert = await complianceService.uploadCertification(file, metadata);
      setCertifications(prev => [...prev, cert]);
      setIsLoading(false);
      return cert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Certificate upload failed');
      setIsLoading(false);
      throw err;
    }
  }, [complianceService]);

  const validateMarket = useCallback(async (productType: string, market: string, specifications: any) => {
    try {
      return await complianceService.validateMarketCompliance(productType, market, specifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Market validation failed');
      throw err;
    }
  }, [complianceService]);

  const generateReport = useCallback(async (checkId: string, format: 'pdf' | 'json' | 'csv' = 'pdf') => {
    setIsLoading(true);
    try {
      const report = await complianceService.generateComplianceReport(checkId, format);
      setIsLoading(false);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed');
      setIsLoading(false);
      throw err;
    }
  }, [complianceService]);

  return {
    // State
    isLoading,
    error,
    currentCheck,
    certifications,
    
    // Actions
    startComplianceCheck,
    loadCertifications,
    uploadCertification,
    validateMarket,
    generateReport,
    
    // Utilities
    clearError: () => setError(null),
    resetCheck: () => setCurrentCheck(null)
  };
};

export default ComplianceService;