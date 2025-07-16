import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

interface PaymentData {
  bookingId?: string;
  collaborationId?: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

class PaymentService {
  private stripe: Stripe | null = null;
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');
  }

  async initialize(): Promise<void> {
    this.stripe = await this.stripePromise;
    if (!this.stripe) {
      throw new Error('Stripe failed to initialize');
    }
  }

  async createPaymentIntent(paymentData: PaymentData): Promise<PaymentIntent> {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  }

  async confirmPayment(
    clientSecret: string,
    elements: StripeElements,
    paymentData: {
      billing_details: {
        name: string;
        email: string;
        address?: {
          line1: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
        };
      };
    }
  ): Promise<PaymentResult> {
    if (!this.stripe) {
      await this.initialize();
    }

    if (!this.stripe) {
      return { success: false, error: 'Stripe not initialized' };
    }

    const cardElement = elements.getElement('card');
    if (!cardElement) {
      return { success: false, error: 'Card element not found' };
    }

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: paymentData.billing_details,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (paymentIntent?.status === 'succeeded') {
      return { 
        success: true, 
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret!,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        }
      };
    }

    return { success: false, error: 'Payment not completed' };
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await fetch(`/api/payments/intent/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve payment intent');
    }

    return response.json();
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<void> {
    const response = await fetch('/api/payments/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process refund');
    }
  }

  async getPaymentHistory(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<PaymentIntent[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`/api/payments/history?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return response.json();
  }

  async setupPaymentMethod(customerId: string): Promise<{ clientSecret: string }> {
    const response = await fetch('/api/payments/setup-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create setup intent');
    }

    return response.json();
  }

  async getPaymentMethods(customerId: string): Promise<any[]> {
    const response = await fetch(`/api/payments/payment-methods/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return response.json();
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  }

  calculateFees(amount: number): { stripeFee: number; platformFee: number; total: number } {
    const stripeFee = Math.round(amount * 0.029 + 30); // 2.9% + 30¢
    const platformFee = Math.round(amount * 0.05); // 5% platform fee
    const total = amount + stripeFee + platformFee;

    return {
      stripeFee,
      platformFee,
      total,
    };
  }
}

export const paymentService = new PaymentService();