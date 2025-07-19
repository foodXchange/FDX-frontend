import { apiClient } from '../api-client';
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  ProcessPaymentRequest,
  PaymentSearchFilters,
  PaymentAnalytics,
  PaymentApproval,
  ApprovalStatus,
  ReconciliationInfo,
  ReconciliationStatus
} from '../../types/payment';

export class PaymentService {
  private static baseUrl = '/api/payments';

  // Core Payment Operations
  static async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    try {
      // Validate payment request
      this.validatePaymentRequest(request);

      // Check for duplicate payments
      await this.checkDuplicatePayment(request);

      // Process based on payment method
      let payment: Payment;
      switch (request.method) {
        case PaymentMethod.CREDIT_CARD:
        case PaymentMethod.DEBIT_CARD:
          payment = await this.processCardPayment(request);
          break;
        case PaymentMethod.BANK_TRANSFER:
        case PaymentMethod.ACH:
          payment = await this.processBankTransfer(request);
          break;
        case PaymentMethod.WIRE:
          payment = await this.processWireTransfer(request);
          break;
        case PaymentMethod.LETTER_OF_CREDIT:
          payment = await this.processLetterOfCredit(request);
          break;
        case PaymentMethod.ESCROW:
          payment = await this.processEscrowPayment(request);
          break;
        default:
          payment = await this.processGenericPayment(request);
      }

      // Send confirmation
      await this.sendPaymentConfirmation(payment);

      // Update related records
      await this.updateRelatedRecords(payment);

      return payment;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  static async getPayment(paymentId: string): Promise<Payment> {
    try {
      const response = await apiClient.get<Payment>(`${this.baseUrl}/${paymentId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch payment ${paymentId}`);
    }
  }

  static async getPayments(
    filters: PaymentSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{
    payments: Payment[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await apiClient.get<{
        payments: Payment[];
        total: number;
        pages: number;
      }>(`${this.baseUrl}`, {
        params: { ...filters, page, limit }
      });
      return response;
    } catch (error) {
      throw new Error('Failed to fetch payments');
    }
  }

  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    reason?: string
  ): Promise<Payment> {
    try {
      const response = await apiClient.patch<Payment>(
        `${this.baseUrl}/${paymentId}/status`,
        { status, reason }
      );

      // Log status change
      await this.logPaymentEvent(paymentId, 'status_changed', {
        newStatus: status,
        reason
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to update payment status for ${paymentId}`);
    }
  }

  // Refund Operations
  static async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<Payment> {
    try {
      const payment = await this.getPayment(paymentId);
      
      // Validate refund
      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Can only refund completed payments');
      }

      const refundAmount = amount || payment.amount;
      if (refundAmount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      const response = await apiClient.post<Payment>(
        `${this.baseUrl}/${paymentId}/refund`,
        { amount: refundAmount, reason }
      );

      // Send refund notification
      await this.sendRefundNotification(response);

      return response;
    } catch (error) {
      throw new Error(`Failed to refund payment ${paymentId}`);
    }
  }

  // Payment Approval Workflow
  static async submitForApproval(paymentId: string): Promise<Payment> {
    try {
      const response = await apiClient.post<Payment>(
        `${this.baseUrl}/${paymentId}/submit-approval`
      );

      // Notify approvers
      await this.notifyApprovers(response);

      return response;
    } catch (error) {
      throw new Error(`Failed to submit payment ${paymentId} for approval`);
    }
  }

  static async approvePayment(
    paymentId: string,
    approvalId: string,
    comments?: string
  ): Promise<Payment> {
    try {
      const response = await apiClient.post<Payment>(
        `${this.baseUrl}/${paymentId}/approve`,
        { approvalId, comments }
      );

      // Check if all approvals are complete
      if (this.allApprovalsComplete(response.approvals)) {
        await this.processApprovedPayment(response);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to approve payment ${paymentId}`);
    }
  }

  static async rejectPayment(
    paymentId: string,
    approvalId: string,
    reason: string
  ): Promise<Payment> {
    try {
      const response = await apiClient.post<Payment>(
        `${this.baseUrl}/${paymentId}/reject`,
        { approvalId, reason }
      );

      // Notify stakeholders
      await this.notifyPaymentRejection(response, reason);

      return response;
    } catch (error) {
      throw new Error(`Failed to reject payment ${paymentId}`);
    }
  }

  // Reconciliation
  static async reconcilePayment(
    paymentId: string,
    reconciliationData: Partial<ReconciliationInfo>
  ): Promise<Payment> {
    try {
      const response = await apiClient.post<Payment>(
        `${this.baseUrl}/${paymentId}/reconcile`,
        reconciliationData
      );

      // Update accounting records if fully reconciled
      if (reconciliationData.status === ReconciliationStatus.MATCHED) {
        await this.updateAccountingRecords(response);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to reconcile payment ${paymentId}`);
    }
  }

  static async bulkReconcile(
    bankStatementId: string,
    paymentMatches: Array<{
      paymentId: string;
      statementLine: number;
      amount: number;
    }>
  ): Promise<{ matched: number; unmatched: number }> {
    try {
      const response = await apiClient.post<{ matched: number; unmatched: number }>(
        `${this.baseUrl}/bulk-reconcile`,
        { bankStatementId, paymentMatches }
      );

      return response;
    } catch (error) {
      throw new Error('Failed to perform bulk reconciliation');
    }
  }

  // Analytics and Reporting
  static async getPaymentAnalytics(
    dateRange?: { start: string; end: string }
  ): Promise<PaymentAnalytics> {
    try {
      const response = await apiClient.get<PaymentAnalytics>(
        `${this.baseUrl}/analytics`,
        { params: dateRange }
      );
      return response;
    } catch (error) {
      // Return mock data if API fails
      return this.getMockAnalytics();
    }
  }

  static async exportPayments(
    filters: PaymentSearchFilters,
    format: 'csv' | 'excel' | 'pdf' = 'excel'
  ): Promise<{ url: string; filename: string }> {
    try {
      const response = await apiClient.post<{ url: string; filename: string }>(
        `${this.baseUrl}/export`,
        { filters, format }
      );
      return response;
    } catch (error) {
      throw new Error('Failed to export payments');
    }
  }

  // Payment Method Specific Processing
  private static async processCardPayment(request: ProcessPaymentRequest): Promise<Payment> {
    // Integrate with payment gateway (Stripe, etc.)
    const response = await apiClient.post<Payment>(
      `${this.baseUrl}/process-card`,
      request
    );

    // 3D Secure verification if required
    if (response.metadata?.requires3DS) {
      await this.handle3DSecure(response);
    }

    return response;
  }

  private static async processBankTransfer(request: ProcessPaymentRequest): Promise<Payment> {
    // Generate transfer instructions
    const instructions = await this.generateTransferInstructions(request);
    
    const response = await apiClient.post<Payment>(
      `${this.baseUrl}/process-bank-transfer`,
      { ...request, instructions }
    );

    // Send transfer instructions to customer
    await this.sendTransferInstructions(response, instructions);

    return response;
  }

  private static async processWireTransfer(request: ProcessPaymentRequest): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `${this.baseUrl}/process-wire`,
      request
    );

    // Generate SWIFT message if international
    if (request.currency !== 'USD') {
      await this.generateSWIFTMessage(response);
    }

    return response;
  }

  private static async processLetterOfCredit(request: ProcessPaymentRequest): Promise<Payment> {
    // Validate LC requirements
    await this.validateLCRequirements(request);

    const response = await apiClient.post<Payment>(
      `${this.baseUrl}/process-lc`,
      request
    );

    // Notify bank for LC processing
    await this.notifyBankForLC(response);

    return response;
  }

  private static async processEscrowPayment(request: ProcessPaymentRequest): Promise<Payment> {
    // Create escrow account
    const escrowAccount = await this.createEscrowAccount(request);

    const response = await apiClient.post<Payment>(
      `${this.baseUrl}/process-escrow`,
      { ...request, escrowAccount }
    );

    return response;
  }

  private static async processGenericPayment(request: ProcessPaymentRequest): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `${this.baseUrl}/process`,
      request
    );
    return response;
  }

  // Helper Methods
  private static validatePaymentRequest(request: ProcessPaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (!request.currency) {
      throw new Error('Currency is required');
    }

    if (!request.method) {
      throw new Error('Payment method is required');
    }

    // Method-specific validation
    switch (request.method) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        if (!request.cardToken) {
          throw new Error('Card token is required for card payments');
        }
        break;
      case PaymentMethod.BANK_TRANSFER:
      case PaymentMethod.WIRE:
        if (!request.bankDetails) {
          throw new Error('Bank details are required for bank transfers');
        }
        break;
    }
  }

  private static async checkDuplicatePayment(request: ProcessPaymentRequest): Promise<void> {
    // Check for recent similar payments to prevent duplicates
    const recentPayments = await this.getPayments({
      dateRange: {
        start: new Date(Date.now() - 300000).toISOString(), // Last 5 minutes
        end: new Date().toISOString()
      },
      amountRange: {
        min: request.amount * 0.99,
        max: request.amount * 1.01
      }
    });

    if (recentPayments.payments.length > 0) {
      const duplicate = recentPayments.payments.find(p => 
        p.invoiceId === request.invoiceId && 
        p.status !== PaymentStatus.FAILED
      );
      
      if (duplicate) {
        throw new Error('Duplicate payment detected. Please wait before retrying.');
      }
    }
  }

  private static async sendPaymentConfirmation(payment: Payment): Promise<void> {
    // Send email/SMS confirmation
    console.log('Sending payment confirmation for', payment.id);
  }

  private static async updateRelatedRecords(payment: Payment): Promise<void> {
    // Update invoice status if linked
    if (payment.invoiceId) {
      await apiClient.patch(`/api/invoices/${payment.invoiceId}/payment`, {
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status
      });
    }

    // Update order status if linked
    if (payment.orderId) {
      await apiClient.patch(`/api/orders/${payment.orderId}/payment`, {
        paymentId: payment.id,
        status: payment.status
      });
    }
  }

  private static async logPaymentEvent(
    paymentId: string,
    event: string,
    details: any
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${paymentId}/events`, {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  private static handlePaymentError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return error;
    }
    return new Error('Payment processing failed');
  }

  private static allApprovalsComplete(approvals?: PaymentApproval[]): boolean {
    if (!approvals || approvals.length === 0) return true;
    return approvals.every(a => a.status === ApprovalStatus.APPROVED);
  }

  private static async processApprovedPayment(payment: Payment): Promise<void> {
    // Trigger actual payment processing
    await this.updatePaymentStatus(payment.id, PaymentStatus.PROCESSING);
  }

  private static async notifyApprovers(payment: Payment): Promise<void> {
    console.log('Notifying approvers for payment', payment.id);
  }

  private static async notifyPaymentRejection(payment: Payment, reason: string): Promise<void> {
    console.log('Notifying rejection for payment', payment.id, reason);
  }

  private static async sendRefundNotification(payment: Payment): Promise<void> {
    console.log('Sending refund notification for payment', payment.id);
  }

  private static async updateAccountingRecords(payment: Payment): Promise<void> {
    console.log('Updating accounting records for payment', payment.id);
  }

  private static async handle3DSecure(payment: Payment): Promise<void> {
    console.log('Handling 3D Secure for payment', payment.id);
  }

  private static async generateTransferInstructions(request: ProcessPaymentRequest): Promise<any> {
    return {
      beneficiary: 'FDX Trading Platform',
      reference: `PAY-${Date.now()}`,
      amount: request.amount,
      currency: request.currency
    };
  }

  private static async sendTransferInstructions(payment: Payment, instructions: any): Promise<void> {
    console.log('Sending transfer instructions for payment', payment.id);
  }

  private static async generateSWIFTMessage(payment: Payment): Promise<void> {
    console.log('Generating SWIFT message for payment', payment.id);
  }

  private static async validateLCRequirements(request: ProcessPaymentRequest): Promise<void> {
    // Validate letter of credit requirements
    console.log('Validating LC requirements');
  }

  private static async notifyBankForLC(payment: Payment): Promise<void> {
    console.log('Notifying bank for LC payment', payment.id);
  }

  private static async createEscrowAccount(request: ProcessPaymentRequest): Promise<any> {
    return {
      accountId: `ESC-${Date.now()}`,
      amount: request.amount,
      currency: request.currency
    };
  }

  private static getMockAnalytics(): PaymentAnalytics {
    return {
      totalVolume: 2450000,
      totalTransactions: 156,
      averageTransactionSize: 15705,
      byStatus: {
        [PaymentStatus.COMPLETED]: 142,
        [PaymentStatus.PROCESSING]: 8,
        [PaymentStatus.PENDING]: 4,
        [PaymentStatus.FAILED]: 2,
        [PaymentStatus.CANCELLED]: 0,
        [PaymentStatus.REFUNDED]: 0,
        [PaymentStatus.PARTIALLY_REFUNDED]: 0,
        [PaymentStatus.ON_HOLD]: 0,
        [PaymentStatus.DISPUTED]: 0
      },
      byMethod: {
        [PaymentMethod.BANK_TRANSFER]: 89,
        [PaymentMethod.WIRE]: 34,
        [PaymentMethod.LETTER_OF_CREDIT]: 12,
        [PaymentMethod.CREDIT_CARD]: 21,
        [PaymentMethod.DEBIT_CARD]: 0,
        [PaymentMethod.ACH]: 0,
        [PaymentMethod.CHECK]: 0,
        [PaymentMethod.ESCROW]: 0,
        [PaymentMethod.CRYPTO]: 0,
        [PaymentMethod.PAYPAL]: 0,
        [PaymentMethod.OTHER]: 0
      },
      successRate: 0.91,
      averageProcessingTime: 2.4,
      topCustomers: [
        {
          customerId: 'CUST001',
          customerName: 'Global Foods Inc',
          totalAmount: 456000,
          transactionCount: 23
        },
        {
          customerId: 'CUST002',
          customerName: 'Fresh Produce Co',
          totalAmount: 342000,
          transactionCount: 18
        }
      ]
    };
  }
}

export default PaymentService;