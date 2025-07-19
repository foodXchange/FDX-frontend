import { apiClient } from '../api-client';
import {
  Invoice,
  InvoiceStatus,
  InvoiceType,
  CreateInvoiceRequest,
  InvoiceSearchFilters,
  InvoiceAnalytics,
  InvoiceLineItem,
  TaxDetail,
  TaxType,
  InvoiceReminder,
  InvoiceDispute,
  PaymentTerms,
  PaymentTermType
} from '../../types/payment';

export class InvoiceService {
  private static baseUrl = '/api/invoices';

  // Core Invoice Operations
  static async createInvoice(request: CreateInvoiceRequest): Promise<Invoice> {
    try {
      // Calculate totals and taxes
      const calculatedInvoice = this.calculateInvoiceTotals(request);

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      const response = await apiClient.post<Invoice>(this.baseUrl, {
        ...request,
        ...calculatedInvoice,
        invoiceNumber,
        status: InvoiceStatus.DRAFT,
        issueDate: new Date().toISOString()
      });

      // Create PDF version
      await this.generateInvoicePDF(response);

      return response;
    } catch (error) {
      throw this.handleInvoiceError(error);
    }
  }

  static async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await apiClient.get<Invoice>(`${this.baseUrl}/${invoiceId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch invoice ${invoiceId}`);
    }
  }

  static async getInvoices(
    filters: InvoiceSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{
    invoices: Invoice[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await apiClient.get<{
        invoices: Invoice[];
        total: number;
        pages: number;
      }>(`${this.baseUrl}`, {
        params: { ...filters, page, limit }
      });
      return response;
    } catch (error) {
      throw new Error('Failed to fetch invoices');
    }
  }

  static async updateInvoice(
    invoiceId: string,
    updates: Partial<Invoice>
  ): Promise<Invoice> {
    try {
      // Validate invoice can be updated
      const invoice = await this.getInvoice(invoiceId);
      if (invoice.status !== InvoiceStatus.DRAFT) {
        throw new Error('Only draft invoices can be updated');
      }

      // Recalculate totals if line items changed
      if (updates.lineItems) {
        const recalculated = this.calculateInvoiceTotals({
          lineItems: updates.lineItems,
          paymentTerms: invoice.paymentTerms
        } as CreateInvoiceRequest);
        updates = { ...updates, ...recalculated };
      }

      const response = await apiClient.patch<Invoice>(
        `${this.baseUrl}/${invoiceId}`,
        updates
      );

      // Regenerate PDF if needed
      if (updates.lineItems || updates.taxDetails) {
        await this.generateInvoicePDF(response);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to update invoice ${invoiceId}`);
    }
  }

  static async sendInvoice(invoiceId: string, recipients: string[]): Promise<Invoice> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      
      // Validate invoice is ready to send
      if (invoice.status === InvoiceStatus.DRAFT) {
        // Finalize the invoice
        await this.updateInvoiceStatus(invoiceId, InvoiceStatus.SENT);
      }

      // Send via email
      const response = await apiClient.post<Invoice>(
        `${this.baseUrl}/${invoiceId}/send`,
        { recipients }
      );

      // Log sent event
      await this.logInvoiceEvent(invoiceId, 'sent', { recipients });

      return response;
    } catch (error) {
      throw new Error(`Failed to send invoice ${invoiceId}`);
    }
  }

  static async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    reason?: string
  ): Promise<Invoice> {
    try {
      const response = await apiClient.patch<Invoice>(
        `${this.baseUrl}/${invoiceId}/status`,
        { status, reason }
      );

      // Handle status-specific actions
      switch (status) {
        case InvoiceStatus.SENT:
          await this.scheduleReminders(response);
          break;
        case InvoiceStatus.PAID:
          await this.markAsPaid(response);
          break;
        case InvoiceStatus.OVERDUE:
          await this.handleOverdueInvoice(response);
          break;
        case InvoiceStatus.CANCELLED:
          await this.handleCancelledInvoice(response);
          break;
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to update invoice status for ${invoiceId}`);
    }
  }

  // Invoice Actions
  static async duplicateInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const original = await this.getInvoice(invoiceId);
      
      const request: CreateInvoiceRequest = {
        type: original.type,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        paymentTerms: original.paymentTerms,
        lineItems: original.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          tax: item.tax,
          discount: item.discount,
          total: item.total
        })),
        billingAddress: original.billingAddress,
        shippingAddress: original.shippingAddress,
        notes: original.notes,
        customFields: original.customFields
      };

      return await this.createInvoice(request);
    } catch (error) {
      throw new Error(`Failed to duplicate invoice ${invoiceId}`);
    }
  }

  static async createCreditNote(
    invoiceId: string,
    lineItems: InvoiceLineItem[],
    reason: string
  ): Promise<Invoice> {
    try {
      const original = await this.getInvoice(invoiceId);
      
      const creditNote = await apiClient.post<Invoice>(`${this.baseUrl}/credit-note`, {
        originalInvoiceId: invoiceId,
        type: InvoiceType.CREDIT_NOTE,
        lineItems: lineItems.map(item => ({
          ...item,
          unitPrice: -Math.abs(item.unitPrice), // Negative amounts
          subtotal: -Math.abs(item.subtotal),
          total: -Math.abs(item.total)
        })),
        reason,
        billingAddress: original.billingAddress
      });

      // Link credit note to original invoice
      await this.linkCreditNote(invoiceId, creditNote.id);

      return creditNote;
    } catch (error) {
      throw new Error(`Failed to create credit note for invoice ${invoiceId}`);
    }
  }

  // Payment Recording
  static async recordPayment(
    invoiceId: string,
    amount: number,
    paymentId: string,
    paymentDate: string
  ): Promise<Invoice> {
    try {
      const response = await apiClient.post<Invoice>(
        `${this.baseUrl}/${invoiceId}/payments`,
        { amount, paymentId, paymentDate }
      );

      // Update invoice status based on payment
      if (response.balanceDue === 0) {
        await this.updateInvoiceStatus(invoiceId, InvoiceStatus.PAID);
      } else if (response.balanceDue < response.totalAmount) {
        await this.updateInvoiceStatus(invoiceId, InvoiceStatus.PARTIALLY_PAID);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to record payment for invoice ${invoiceId}`);
    }
  }

  // Reminders and Follow-ups
  static async sendReminder(invoiceId: string, template?: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${invoiceId}/reminder`, {
        template: template || 'default',
        timestamp: new Date().toISOString()
      });

      await this.logInvoiceEvent(invoiceId, 'reminder_sent', { template });
    } catch (error) {
      throw new Error(`Failed to send reminder for invoice ${invoiceId}`);
    }
  }

  static async scheduleReminders(invoice: Invoice): Promise<void> {
    if (invoice.paymentTerms.type === PaymentTermType.IMMEDIATE) {
      return; // No reminders for immediate payment
    }

    // Schedule reminders based on payment terms
    const reminderSchedule = this.calculateReminderSchedule(invoice);
    
    for (const schedule of reminderSchedule) {
      await apiClient.post(`${this.baseUrl}/${invoice.id}/schedule-reminder`, schedule);
    }
  }

  // Disputes
  static async raiseDispute(
    invoiceId: string,
    reason: string,
    disputedAmount?: number
  ): Promise<InvoiceDispute> {
    try {
      const response = await apiClient.post<InvoiceDispute>(
        `${this.baseUrl}/${invoiceId}/dispute`,
        { reason, disputedAmount }
      );

      // Update invoice status
      await this.updateInvoiceStatus(invoiceId, InvoiceStatus.DISPUTED);

      // Notify relevant parties
      await this.notifyDisputeParties(invoiceId, response);

      return response;
    } catch (error) {
      throw new Error(`Failed to raise dispute for invoice ${invoiceId}`);
    }
  }

  static async resolveDispute(
    invoiceId: string,
    disputeId: string,
    resolution: string
  ): Promise<InvoiceDispute> {
    try {
      const response = await apiClient.patch<InvoiceDispute>(
        `${this.baseUrl}/${invoiceId}/disputes/${disputeId}/resolve`,
        { resolution }
      );

      // Update invoice status if all disputes resolved
      const invoice = await this.getInvoice(invoiceId);
      const hasOpenDisputes = invoice.disputes?.some(d => d.status === 'open');
      
      if (!hasOpenDisputes) {
        await this.updateInvoiceStatus(invoiceId, InvoiceStatus.SENT);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to resolve dispute ${disputeId}`);
    }
  }

  // Analytics and Reporting
  static async getInvoiceAnalytics(
    dateRange?: { start: string; end: string }
  ): Promise<InvoiceAnalytics> {
    try {
      const response = await apiClient.get<InvoiceAnalytics>(
        `${this.baseUrl}/analytics`,
        { params: dateRange }
      );
      return response;
    } catch (error) {
      // Return mock data if API fails
      return this.getMockAnalytics();
    }
  }

  static async getAgingReport(
    asOfDate?: string
  ): Promise<Array<{
    customerId: string;
    customerName: string;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
  }>> {
    try {
      const response = await apiClient.get<any[]>(
        `${this.baseUrl}/aging-report`,
        { params: { asOfDate } }
      );
      return response;
    } catch (error) {
      throw new Error('Failed to generate aging report');
    }
  }

  static async exportInvoices(
    filters: InvoiceSearchFilters,
    format: 'csv' | 'excel' | 'pdf' = 'excel'
  ): Promise<{ url: string; filename: string }> {
    try {
      const response = await apiClient.post<{ url: string; filename: string }>(
        `${this.baseUrl}/export`,
        { filters, format }
      );
      return response;
    } catch (error) {
      throw new Error('Failed to export invoices');
    }
  }

  // Tax Calculation
  static async calculateTax(
    lineItems: InvoiceLineItem[],
    taxConfig: {
      jurisdiction: string;
      exemptions?: string[];
    }
  ): Promise<TaxDetail[]> {
    try {
      const response = await apiClient.post<TaxDetail[]>(
        `${this.baseUrl}/calculate-tax`,
        { lineItems, taxConfig }
      );
      return response;
    } catch (error) {
      // Fallback to simple calculation
      return this.calculateSimpleTax(lineItems, taxConfig.jurisdiction);
    }
  }

  // Helper Methods
  private static calculateInvoiceTotals(request: CreateInvoiceRequest): Partial<Invoice> {
    let subtotal = 0;
    let totalTax = 0;
    const taxDetails: TaxDetail[] = [];

    // Calculate line items
    const calculatedLineItems = request.lineItems.map(item => {
      const lineSubtotal = item.quantity * item.unitPrice;
      let lineTax = 0;
      
      if (item.tax) {
        lineTax = lineSubtotal * (item.tax.rate / 100);
      }

      const lineTotal = lineSubtotal + lineTax - (item.discount?.amount || 0);
      
      subtotal += lineSubtotal;
      totalTax += lineTax;

      return {
        ...item,
        subtotal: lineSubtotal,
        total: lineTotal
      };
    });

    // Apply invoice-level discount if any
    let discountAmount = 0;
    if (request.customFields?.discount) {
      discountAmount = request.customFields.discount.type === 'percentage'
        ? subtotal * (request.customFields.discount.value / 100)
        : request.customFields.discount.value;
    }

    const totalAmount = subtotal + totalTax - discountAmount;

    // Calculate due date based on payment terms
    const dueDate = this.calculateDueDate(request.paymentTerms);

    return {
      lineItems: calculatedLineItems,
      subtotal,
      taxDetails,
      totalTax,
      shipping: 0,
      handling: 0,
      totalAmount,
      balanceDue: totalAmount,
      dueDate
    };
  }

  private static async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get next sequence number
    const sequence = await apiClient.get<{ next: number }>(
      `${this.baseUrl}/next-sequence`
    );
    
    return `INV-${year}${month}-${String(sequence.next).padStart(5, '0')}`;
  }

  private static calculateDueDate(terms: PaymentTerms): string {
    const today = new Date();
    let dueDate = new Date(today);

    switch (terms.type) {
      case PaymentTermType.IMMEDIATE:
        // Due immediately
        break;
      case PaymentTermType.NET_15:
        dueDate.setDate(today.getDate() + 15);
        break;
      case PaymentTermType.NET_30:
        dueDate.setDate(today.getDate() + 30);
        break;
      case PaymentTermType.NET_45:
        dueDate.setDate(today.getDate() + 45);
        break;
      case PaymentTermType.NET_60:
        dueDate.setDate(today.getDate() + 60);
        break;
      case PaymentTermType.NET_90:
        dueDate.setDate(today.getDate() + 90);
        break;
      case PaymentTermType.EOM:
        // End of month
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      default:
        if (terms.netDays) {
          dueDate.setDate(today.getDate() + terms.netDays);
        }
    }

    return dueDate.toISOString();
  }

  private static calculateSimpleTax(
    lineItems: InvoiceLineItem[],
    jurisdiction: string
  ): TaxDetail[] {
    // Simple tax calculation fallback
    const taxRate = this.getDefaultTaxRate(jurisdiction);
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    return [{
      type: TaxType.SALES_TAX,
      rate: taxRate,
      amount: subtotal * (taxRate / 100),
      jurisdiction
    }];
  }

  private static getDefaultTaxRate(jurisdiction: string): number {
    // Default tax rates by jurisdiction
    const rates: Record<string, number> = {
      'US-CA': 7.25,
      'US-NY': 8.875,
      'US-TX': 6.25,
      'UK': 20,
      'EU': 21,
      'default': 10
    };
    
    return rates[jurisdiction] || rates.default;
  }

  private static calculateReminderSchedule(invoice: Invoice): any[] {
    const schedule = [];
    const dueDate = new Date(invoice.dueDate);
    
    // 7 days before due
    const reminder1 = new Date(dueDate);
    reminder1.setDate(dueDate.getDate() - 7);
    if (reminder1 > new Date()) {
      schedule.push({
        date: reminder1.toISOString(),
        template: 'friendly_reminder'
      });
    }

    // On due date
    schedule.push({
      date: dueDate.toISOString(),
      template: 'due_today'
    });

    // 3 days after due
    const reminder3 = new Date(dueDate);
    reminder3.setDate(dueDate.getDate() + 3);
    schedule.push({
      date: reminder3.toISOString(),
      template: 'overdue_notice'
    });

    return schedule;
  }

  private static async generateInvoicePDF(invoice: Invoice): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${invoice.id}/generate-pdf`);
    } catch (error) {
      console.error('Failed to generate PDF for invoice', invoice.id);
    }
  }

  private static async markAsPaid(invoice: Invoice): Promise<void> {
    // Update related records
    await apiClient.post(`${this.baseUrl}/${invoice.id}/mark-paid`, {
      paidAt: new Date().toISOString()
    });
  }

  private static async handleOverdueInvoice(invoice: Invoice): Promise<void> {
    // Send overdue notification
    await this.sendReminder(invoice.id, 'overdue_notice');
    
    // Apply late fees if configured
    if (invoice.paymentTerms.lateFeePercentage) {
      await this.applyLateFee(invoice);
    }
  }

  private static async handleCancelledInvoice(invoice: Invoice): Promise<void> {
    // Release any reserved inventory
    // Update order status if linked
    if (invoice.orderId) {
      await apiClient.patch(`/api/orders/${invoice.orderId}/invoice-cancelled`);
    }
  }

  private static async applyLateFee(invoice: Invoice): Promise<void> {
    const lateFee = invoice.totalAmount * (invoice.paymentTerms.lateFeePercentage! / 100);
    
    await apiClient.post(`${this.baseUrl}/${invoice.id}/apply-late-fee`, {
      amount: lateFee,
      appliedAt: new Date().toISOString()
    });
  }

  private static async linkCreditNote(invoiceId: string, creditNoteId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${invoiceId}/link-credit-note`, {
      creditNoteId
    });
  }

  private static async notifyDisputeParties(invoiceId: string, dispute: InvoiceDispute): Promise<void> {
    console.log('Notifying parties about dispute', invoiceId, dispute.id);
  }

  private static async logInvoiceEvent(invoiceId: string, event: string, details: any): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${invoiceId}/events`, {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  private static handleInvoiceError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return error;
    }
    return new Error('Invoice operation failed');
  }

  private static getMockAnalytics(): InvoiceAnalytics {
    return {
      totalIssued: 234,
      totalAmount: 3456000,
      totalOutstanding: 892000,
      averageDaysToPayment: 28.5,
      overdueAmount: 234000,
      overdueCount: 12,
      byStatus: {
        [InvoiceStatus.DRAFT]: 8,
        [InvoiceStatus.SENT]: 45,
        [InvoiceStatus.VIEWED]: 23,
        [InvoiceStatus.PARTIALLY_PAID]: 15,
        [InvoiceStatus.PAID]: 134,
        [InvoiceStatus.OVERDUE]: 12,
        [InvoiceStatus.CANCELLED]: 3,
        [InvoiceStatus.DISPUTED]: 2,
        [InvoiceStatus.WRITTEN_OFF]: 0
      },
      agingReport: [
        { range: '0-30 days', count: 45, amount: 567000 },
        { range: '31-60 days', count: 23, amount: 234000 },
        { range: '61-90 days', count: 8, amount: 67000 },
        { range: '90+ days', count: 4, amount: 24000 }
      ]
    };
  }
}

export default InvoiceService;