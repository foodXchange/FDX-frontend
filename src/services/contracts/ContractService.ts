import {
  Contract,
  ContractStatus,
  ContractType,
  CreateContractRequest,
  UpdateContractRequest,
  ContractSearchParams,
  ContractAnalytics,
  ContractTemplate,
  ContractApprovalRequest,
  ContractPerformanceReport,
  ContractMilestone,
  ContractObligation,
  ContractAmendment,
  DeliveryTerms,
  ContractPaymentTerms
} from '../../types/contract';
import { ApiIntegration } from '../ApiIntegration';
import { notificationService } from '../NotificationService';

export class ContractService {
  private static contracts: Map<string, Contract> = new Map();
  private static templates: Map<string, ContractTemplate> = new Map();
  private static contractCounter = 0;

  // Create a new contract
  static async createContract(request: CreateContractRequest): Promise<Contract> {
    try {
      // Generate contract number
      this.contractCounter++;
      const contractNumber = `CNT-${new Date().getFullYear()}-${String(this.contractCounter).padStart(5, '0')}`;
      
      // Create contract
      const contract: Contract = {
        id: `contract-${Date.now()}`,
        contractNumber,
        version: 1,
        type: request.type,
        title: request.title,
        description: request.description,
        status: ContractStatus.DRAFT,
        parties: request.parties.map((party, index) => ({
          ...party,
          id: `party-${index}-${Date.now()}`
        })),
        effectiveDate: request.effectiveDate,
        expirationDate: request.expirationDate,
        totalValue: request.totalValue,
        currency: request.currency,
        paymentTerms: request.paymentTerms,
        deliveryTerms: request.deliveryTerms,
        terms: request.terms?.map((term, index) => ({
          ...term,
          id: `term-${index}-${Date.now()}`,
          version: 1,
          lastModified: new Date().toISOString(),
          modifiedBy: 'system'
        })) || [],
        priceSchedule: request.priceSchedule?.map((schedule, index) => ({
          ...schedule,
          id: `price-${index}-${Date.now()}`
        })) || [],
        milestones: request.milestones?.map((milestone, index) => ({
          ...milestone,
          id: `milestone-${index}-${Date.now()}`,
          status: 'pending'
        })) || [],
        obligations: request.obligations?.map((obligation, index) => ({
          ...obligation,
          id: `obligation-${index}-${Date.now()}`,
          completionStatus: 'pending'
        })) || [],
        documents: [],
        amendments: [],
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        lastModifiedBy: 'current-user',
        lastModifiedAt: new Date().toISOString()
      };

      // Apply template if specified
      if (request.templateId) {
        const template = this.templates.get(request.templateId);
        if (template) {
          contract.terms = [
            ...template.standardTerms.map((term, index) => ({
              ...term,
              id: `term-${index}-${Date.now()}`,
              version: 1,
              lastModified: new Date().toISOString(),
              modifiedBy: 'system'
            })),
            ...contract.terms
          ];
        }
      }

      // Save to storage
      this.contracts.set(contract.id, contract);

      // Set up alerts
      this.setupContractAlerts(contract);

      // Create notification
      notificationService.createNotification({
        type: 'success',
        category: 'system',
        title: 'Contract Created',
        message: `Contract ${contract.contractNumber} has been created`,
        actionUrl: `/contracts/${contract.id}`
      });

      // Call API if available
      try {
        const apiResponse = await ApiIntegration.contracts.create(contract);
        if (apiResponse.id) {
          contract.id = apiResponse.id;
        }
      } catch (error) {
        console.log('Using local contract creation');
      }

      return contract;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  // Get contract by ID
  static async getContract(contractId: string): Promise<Contract> {
    try {
      // Try API first
      const apiContract = await ApiIntegration.contracts.get(contractId);
      if (apiContract) {
        return apiContract;
      }
    } catch (error) {
      console.log('Falling back to local data');
    }

    // Fallback to local data
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }

    return contract;
  }

  // Update contract
  static async updateContract(contractId: string, updates: UpdateContractRequest): Promise<Contract> {
    const contract = await this.getContract(contractId);

    // Track changes for amendment
    const changes: any[] = [];

    // Update fields
    if (updates.status && updates.status !== contract.status) {
      changes.push({
        field: 'status',
        previousValue: contract.status,
        newValue: updates.status
      });
      contract.status = updates.status;

      // Handle status-specific actions
      this.handleStatusChange(contract, updates.status);
    }

    if (updates.parties) {
      contract.parties = updates.parties;
    }

    if (updates.terms) {
      contract.terms = updates.terms;
    }

    if (updates.priceSchedule) {
      contract.priceSchedule = updates.priceSchedule;
    }

    if (updates.milestones) {
      contract.milestones = updates.milestones;
    }

    if (updates.obligations) {
      contract.obligations = updates.obligations;
    }

    if (updates.customFields) {
      contract.customFields = { ...contract.customFields, ...updates.customFields };
    }

    // Create amendment if significant changes
    if (changes.length > 0 && contract.status === ContractStatus.ACTIVE) {
      const amendment: ContractAmendment = {
        id: `amend-${Date.now()}`,
        amendmentNumber: `AMD-${contract.contractNumber}-${(contract.amendments?.length || 0) + 1}`,
        effectiveDate: new Date().toISOString(),
        description: 'Contract updated',
        changes,
        reason: 'Business requirement change',
        approvedBy: 'current-user',
        approvedDate: new Date().toISOString()
      };

      contract.amendments = [...(contract.amendments || []), amendment];
      contract.version++;
    }

    contract.lastModifiedBy = 'current-user';
    contract.lastModifiedAt = new Date().toISOString();

    // Save updates
    this.contracts.set(contractId, contract);

    // Call API if available
    try {
      await ApiIntegration.contracts.update(contractId, contract);
    } catch (error) {
      console.log('Using local contract update');
    }

    return contract;
  }

  // Search contracts
  static async searchContracts(params: ContractSearchParams): Promise<{
    contracts: Contract[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // Try API first
      const apiResult = await ApiIntegration.contracts.search(params);
      if (apiResult) {
        return apiResult;
      }
    } catch (error) {
      console.log('Falling back to local search');
    }

    // Local search implementation
    let contracts = Array.from(this.contracts.values());

    // Apply filters
    if (params.status && params.status.length > 0) {
      contracts = contracts.filter(c => params.status!.includes(c.status));
    }

    if (params.type && params.type.length > 0) {
      contracts = contracts.filter(c => params.type!.includes(c.type));
    }

    if (params.partyId) {
      contracts = contracts.filter(c => 
        c.parties.some(p => p.organizationId === params.partyId)
      );
    }

    if (params.dateRange) {
      const { start, end, dateType } = params.dateRange;
      contracts = contracts.filter(c => {
        let date: string;
        switch (dateType) {
          case 'effective':
            date = c.effectiveDate;
            break;
          case 'expiration':
            date = c.expirationDate;
            break;
          case 'created':
            date = c.createdAt;
            break;
          default:
            date = c.effectiveDate;
        }
        return date >= start && date <= end;
      });
    }

    if (params.valueRange) {
      contracts = contracts.filter(c => 
        c.totalValue >= params.valueRange!.min && 
        c.totalValue <= params.valueRange!.max
      );
    }

    if (params.searchTerm) {
      const searchLower = params.searchTerm.toLowerCase();
      contracts = contracts.filter(c => 
        c.contractNumber.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.parties.some(p => p.organizationName.toLowerCase().includes(searchLower))
      );
    }

    if (!params.includeExpired) {
      contracts = contracts.filter(c => 
        c.status !== ContractStatus.EXPIRED && 
        c.status !== ContractStatus.TERMINATED
      );
    }

    // Sort
    const sortBy = params.sortBy || 'contractNumber';
    const sortOrder = params.sortOrder || 'desc';
    contracts.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'contractNumber':
          aVal = a.contractNumber;
          bVal = b.contractNumber;
          break;
        case 'effectiveDate':
          aVal = new Date(a.effectiveDate).getTime();
          bVal = new Date(b.effectiveDate).getTime();
          break;
        case 'expirationDate':
          aVal = new Date(a.expirationDate).getTime();
          bVal = new Date(b.expirationDate).getTime();
          break;
        case 'value':
          aVal = a.totalValue;
          bVal = b.totalValue;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a.contractNumber;
          bVal = b.contractNumber;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Paginate
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContracts = contracts.slice(startIndex, endIndex);

    return {
      contracts: paginatedContracts,
      total: contracts.length,
      page,
      totalPages: Math.ceil(contracts.length / limit)
    };
  }

  // Get contract analytics
  static async getAnalytics(params?: {
    dateRange?: { start: string; end: string };
    partyId?: string;
  }): Promise<ContractAnalytics> {
    try {
      // Try API first
      const apiAnalytics = await ApiIntegration.contracts.getAnalytics(params);
      if (apiAnalytics) {
        return apiAnalytics;
      }
    } catch (error) {
      console.log('Falling back to local analytics');
    }

    // Local analytics calculation
    let contracts = Array.from(this.contracts.values());

    if (params?.partyId) {
      contracts = contracts.filter(c => 
        c.parties.some(p => p.organizationId === params.partyId)
      );
    }

    const now = new Date();
    const activeContracts = contracts.filter(c => c.status === ContractStatus.ACTIVE);
    
    // Calculate status distribution
    const byStatus: any = {};
    const byType: any = {};
    
    contracts.forEach(c => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byType[c.type] = (byType[c.type] || 0) + 1;
    });

    // Find expiring contracts
    const expiringInDays = [30, 60, 90].map(days => {
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const expiringContracts = activeContracts.filter(c => {
        const expDate = new Date(c.expirationDate);
        return expDate <= futureDate && expDate > now;
      });

      return {
        days,
        count: expiringContracts.length,
        contracts: expiringContracts.map(c => ({
          id: c.id,
          contractNumber: c.contractNumber,
          title: c.title,
          expirationDate: c.expirationDate,
          value: c.totalValue
        }))
      };
    });

    // Find upcoming milestones
    const upcomingMilestones: any[] = [];
    activeContracts.forEach(contract => {
      contract.milestones
        .filter(m => m.status === 'pending' || m.status === 'in_progress')
        .forEach(milestone => {
          if (new Date(milestone.dueDate) > now) {
            upcomingMilestones.push({
              contractId: contract.id,
              contractNumber: contract.contractNumber,
              milestone
            });
          }
        });
    });

    // Find overdue obligations
    const overdueObligations: any[] = [];
    activeContracts.forEach(contract => {
      contract.obligations
        .filter(o => o.completionStatus === 'overdue' || 
          (o.dueDate && new Date(o.dueDate) < now && o.completionStatus !== 'completed'))
        .forEach(obligation => {
          overdueObligations.push({
            contractId: contract.id,
            contractNumber: contract.contractNumber,
            obligation
          });
        });
    });

    // Find renewal opportunities
    const renewalOpportunities = activeContracts
      .filter(c => {
        const expDate = new Date(c.expirationDate);
        const daysToExpiry = (expDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
        return daysToExpiry <= 90 && daysToExpiry > 0;
      })
      .map(c => ({
        contractId: c.id,
        contractNumber: c.contractNumber,
        title: c.title,
        expirationDate: c.expirationDate,
        value: c.totalValue,
        performanceScore: Math.random() * 30 + 70 // Mock score 70-100
      }));

    return {
      totalContracts: contracts.length,
      activeContracts: activeContracts.length,
      totalValue: contracts.reduce((sum, c) => sum + c.totalValue, 0),
      averageValue: contracts.length > 0 ? 
        contracts.reduce((sum, c) => sum + c.totalValue, 0) / contracts.length : 0,
      byStatus,
      byType,
      expiringInDays,
      upcomingMilestones: upcomingMilestones.slice(0, 10),
      overdueObligations: overdueObligations.slice(0, 10),
      renewalOpportunities: renewalOpportunities.slice(0, 10)
    };
  }

  // Approve contract
  static async approveContract(request: ContractApprovalRequest): Promise<Contract> {
    const contract = await this.getContract(request.contractId);

    // Update approver status
    if (!contract.approvers) {
      contract.approvers = [];
    }

    const approverIndex = contract.approvers.findIndex(a => a.userId === request.approverId);
    
    if (approverIndex >= 0) {
      contract.approvers[approverIndex] = {
        ...contract.approvers[approverIndex],
        approvedAt: new Date().toISOString(),
        comments: request.comments,
        status: request.conditionalApproval ? 'approved' : 'approved'
      };
    } else {
      contract.approvers.push({
        userId: request.approverId,
        role: 'approver',
        approvedAt: new Date().toISOString(),
        comments: request.comments,
        status: 'approved'
      });
    }

    // Check if all required approvals are complete
    const allApproved = contract.approvers.every(a => a.status === 'approved');
    
    if (allApproved && contract.status === ContractStatus.PENDING_APPROVAL) {
      contract.status = ContractStatus.APPROVED;
      contract.executionDate = new Date().toISOString();

      // Create notification
      notificationService.createNotification({
        type: 'success',
        category: 'system',
        title: 'Contract Approved',
        message: `Contract ${contract.contractNumber} has been fully approved`,
        actionUrl: `/contracts/${contract.id}`
      });
    }

    return await this.updateContract(contract.id, { status: contract.status });
  }

  // Generate performance report
  static async generatePerformanceReport(
    contractId: string, 
    periodStart: string, 
    periodEnd: string
  ): Promise<ContractPerformanceReport> {
    const contract = await this.getContract(contractId);

    // Calculate milestone completion
    const relevantMilestones = contract.milestones.filter(m => {
      const dueDate = new Date(m.dueDate);
      return dueDate >= new Date(periodStart) && dueDate <= new Date(periodEnd);
    });

    const completedMilestones = relevantMilestones.filter(m => m.status === 'completed');
    const onTimeMilestones = completedMilestones.filter(m => 
      m.completedDate && new Date(m.completedDate) <= new Date(m.dueDate)
    );

    // Calculate obligation compliance
    const relevantObligations = contract.obligations.filter(o => {
      if (!o.dueDate) return false;
      const dueDate = new Date(o.dueDate);
      return dueDate >= new Date(periodStart) && dueDate <= new Date(periodEnd);
    });

    const completedObligations = relevantObligations.filter(o => o.completionStatus === 'completed');
    const overdueObligations = relevantObligations.filter(o => o.completionStatus === 'overdue');

    // Calculate financial performance
    const plannedPayments = contract.paymentSchedule?.filter(p => {
      const dueDate = new Date(p.dueDate);
      return dueDate >= new Date(periodStart) && dueDate <= new Date(periodEnd);
    }) || [];

    const paidPayments = plannedPayments.filter(p => p.status === 'paid');
    const plannedValue = plannedPayments.reduce((sum, p) => sum + p.amount, 0);
    const actualValue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate overall score
    const milestoneScore = relevantMilestones.length > 0 ? 
      (completedMilestones.length / relevantMilestones.length) * 100 : 100;
    const obligationScore = relevantObligations.length > 0 ?
      (completedObligations.length / relevantObligations.length) * 100 : 100;
    const paymentScore = plannedPayments.length > 0 ?
      (paidPayments.length / plannedPayments.length) * 100 : 100;
    
    const overallScore = (milestoneScore + obligationScore + paymentScore) / 3;

    const report: ContractPerformanceReport = {
      contractId,
      reportingPeriod: {
        start: periodStart,
        end: periodEnd
      },
      milestoneCompletion: {
        total: relevantMilestones.length,
        completed: completedMilestones.length,
        onTime: onTimeMilestones.length,
        delayed: relevantMilestones.length - completedMilestones.length
      },
      obligationCompliance: {
        total: relevantObligations.length,
        completed: completedObligations.length,
        overdue: overdueObligations.length,
        complianceRate: relevantObligations.length > 0 ? 
          (completedObligations.length / relevantObligations.length) * 100 : 100
      },
      financialPerformance: {
        plannedValue,
        actualValue,
        variance: actualValue - plannedValue,
        paymentCompliance: plannedPayments.length > 0 ?
          (paidPayments.length / plannedPayments.length) * 100 : 100
      },
      overallScore,
      recommendations: overallScore < 80 ? [
        'Review and address overdue obligations',
        'Implement milestone tracking improvements',
        'Consider contract renegotiation for better terms'
      ] : []
    };

    return report;
  }

  // Handle status changes
  private static handleStatusChange(contract: Contract, newStatus: ContractStatus): void {
    switch (newStatus) {
      case ContractStatus.ACTIVE:
        // Start monitoring obligations and milestones
        this.startContractMonitoring(contract);
        break;
      
      case ContractStatus.EXPIRED:
        // Check for renewal options
        this.checkRenewalOptions(contract);
        break;
      
      case ContractStatus.TERMINATED:
        // Handle termination procedures
        this.handleTermination(contract);
        break;
    }
  }

  // Set up contract alerts
  private static setupContractAlerts(contract: Contract): void {
    const alerts = [];
    const now = new Date();

    // Expiration alerts
    const expirationDate = new Date(contract.expirationDate);
    const daysToExpiration = (expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);

    [90, 60, 30, 14, 7].forEach(days => {
      if (daysToExpiration > days) {
        const alertDate = new Date(expirationDate.getTime() - days * 24 * 60 * 60 * 1000);
        alerts.push({
          type: 'expiration' as const,
          triggerDate: alertDate.toISOString(),
          message: `Contract ${contract.contractNumber} expires in ${days} days`,
          recipients: contract.parties.map(p => p.representativeEmail),
          sent: false
        });
      }
    });

    // Milestone alerts
    contract.milestones.forEach(milestone => {
      const dueDate = new Date(milestone.dueDate);
      const alertDate = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      if (alertDate > now) {
        alerts.push({
          type: 'milestone' as const,
          triggerDate: alertDate.toISOString(),
          message: `Milestone "${milestone.name}" due in 7 days`,
          recipients: contract.parties.map(p => p.representativeEmail),
          sent: false
        });
      }
    });

    contract.alerts = alerts;
  }

  // Monitor contract obligations and milestones
  private static startContractMonitoring(contract: Contract): void {
    // In a real implementation, this would set up scheduled jobs
    console.log(`Starting monitoring for contract ${contract.contractNumber}`);
  }

  // Check renewal options
  private static checkRenewalOptions(contract: Contract): void {
    notificationService.createNotification({
      type: 'warning',
      category: 'system',
      title: 'Contract Expired',
      message: `Contract ${contract.contractNumber} has expired. Consider renewal options.`,
      actionUrl: `/contracts/${contract.id}/renew`
    });
  }

  // Handle contract termination
  private static handleTermination(contract: Contract): void {
    contract.terminationDate = new Date().toISOString();
    
    notificationService.createNotification({
      type: 'warning',
      category: 'system',
      title: 'Contract Terminated',
      message: `Contract ${contract.contractNumber} has been terminated`,
      actionUrl: `/contracts/${contract.id}`
    });
  }

  // Create contract template
  static async createTemplate(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate> {
    const newTemplate: ContractTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  // Get all templates
  static async getTemplates(type?: ContractType): Promise<ContractTemplate[]> {
    const templates = Array.from(this.templates.values());
    
    if (type) {
      return templates.filter(t => t.type === type && t.isActive);
    }
    
    return templates.filter(t => t.isActive);
  }

  // Renew contract
  static async renewContract(contractId: string, newExpirationDate: string): Promise<Contract> {
    const originalContract = await this.getContract(contractId);
    
    // Create new contract based on original
    const renewalRequest: CreateContractRequest = {
      type: originalContract.type,
      title: `${originalContract.title} - Renewal`,
      description: `Renewal of contract ${originalContract.contractNumber}`,
      parties: originalContract.parties.map(p => ({
        type: p.type,
        organizationId: p.organizationId,
        organizationName: p.organizationName,
        representativeName: p.representativeName,
        representativeTitle: p.representativeTitle,
        representativeEmail: p.representativeEmail,
        address: p.address
      })),
      effectiveDate: originalContract.expirationDate,
      expirationDate: newExpirationDate,
      totalValue: originalContract.totalValue,
      currency: originalContract.currency,
      paymentTerms: originalContract.paymentTerms,
      deliveryTerms: originalContract.deliveryTerms,
      terms: originalContract.terms,
      priceSchedule: originalContract.priceSchedule
    };

    const renewedContract = await this.createContract(renewalRequest);
    
    // Link to original
    renewedContract.parentContractId = originalContract.id;
    renewedContract.renewalHistory = [{
      previousContractId: originalContract.id,
      renewalDate: new Date().toISOString(),
      changes: 'Standard renewal with updated expiration date'
    }];

    // Update original contract status
    await this.updateContract(originalContract.id, { status: ContractStatus.RENEWED });

    return renewedContract;
  }
}

export default ContractService;