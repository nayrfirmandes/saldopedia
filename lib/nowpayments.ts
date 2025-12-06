// NOWPayments API Wrapper for Custody Wallet Integration
// Documentation: https://documenter.getpostman.com/view/7907941/2s93JusNJt
// Mass Payouts: https://documenter.getpostman.com/view/7907941/T1DtdF9a

import { authenticator } from 'otplib';

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

interface CreatePaymentParams {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  pay_amount?: number;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
}

interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  created_at: string;
  updated_at: string;
}

interface PaymentStatusResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
}

interface PayoutWithdrawal {
  address: string;
  currency: string;
  amount: number;
  extra_id?: string;
  ipn_callback_url?: string;
  unique_external_id?: string;
}

interface CreatePayoutParams {
  ipn_callback_url?: string;
  withdrawals: PayoutWithdrawal[];
}

interface PayoutResponse {
  id: string;
  status: string;
  withdrawals: {
    id: string;
    address: string;
    currency: string;
    amount: number;
    status: string;
    extra_id?: string;
    hash?: string;
    error?: string;
  }[];
}

interface BalanceResponse {
  [currency: string]: {
    amount: number;
    pendingAmount: number;
  };
}

interface AuthResponse {
  token: string;
}

class NOWPaymentsAPI {
  private apiKey: string;
  private ipnSecret: string;
  private jwtToken: string | null = null;
  private jwtExpiry: number = 0;

  constructor() {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (!apiKey) {
      throw new Error('NOWPAYMENTS_API_KEY environment variable is required');
    }
    if (!ipnSecret) {
      throw new Error('NOWPAYMENTS_IPN_SECRET environment variable is required');
    }

    this.apiKey = apiKey;
    this.ipnSecret = ipnSecret;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${NOWPAYMENTS_API_URL}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NOWPayments API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  private async requestWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
    await this.ensureAuthenticated();
    
    const url = `${NOWPAYMENTS_API_URL}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.jwtToken}`,
      ...options?.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NOWPayments API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  private async ensureAuthenticated(): Promise<void> {
    const now = Date.now();
    if (this.jwtToken && this.jwtExpiry > now) {
      return;
    }

    const email = process.env.NOWPAYMENTS_EMAIL;
    const password = process.env.NOWPAYMENTS_PASSWORD;

    if (!email || !password) {
      throw new Error('NOWPAYMENTS_EMAIL and NOWPAYMENTS_PASSWORD are required for payout operations');
    }

    const response = await fetch(`${NOWPAYMENTS_API_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NOWPayments auth error: ${response.status} ${error}`);
    }

    const data: AuthResponse = await response.json();
    this.jwtToken = data.token;
    this.jwtExpiry = now + 4 * 60 * 1000;
  }

  async getStatus(): Promise<{ message: string }> {
    return this.request('/status');
  }

  async getAvailableCurrencies(): Promise<{ currencies: string[] }> {
    return this.request('/currencies');
  }

  async getMinimumAmount(currency_from: string, currency_to: string): Promise<{ min_amount: number }> {
    return this.request(`/min-amount?currency_from=${currency_from}&currency_to=${currency_to}`);
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    return this.request('/payment', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    return this.request(`/payment/${paymentId}`);
  }

  async getBalance(): Promise<BalanceResponse> {
    return this.requestWithAuth('/balance');
  }

  private generateTOTPCode(): string | null {
    const totpSecret = process.env.NOWPAYMENTS_TOTP_SECRET;
    if (!totpSecret) {
      return null;
    }
    return authenticator.generate(totpSecret);
  }

  async createPayout(params: CreatePayoutParams): Promise<PayoutResponse> {
    return this.requestWithAuth('/payout', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async verifyPayout(batchWithdrawalId: string, verificationCode: string): Promise<PayoutResponse> {
    return this.requestWithAuth(`/payout/${batchWithdrawalId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verification_code: verificationCode }),
    });
  }

  async createAndVerifyPayout(params: CreatePayoutParams): Promise<PayoutResponse> {
    const payout = await this.createPayout(params);
    
    const totpCode = this.generateTOTPCode();
    if (!totpCode) {
      console.log('TOTP not configured, payout created but needs manual verification');
      return payout;
    }

    console.log(`Auto-verifying payout ${payout.id} with TOTP...`);
    
    try {
      const verified = await this.verifyPayout(payout.id, totpCode);
      console.log(`Payout ${payout.id} verified successfully`);
      return verified;
    } catch (verifyError) {
      console.error(`Failed to verify payout ${payout.id}:`, verifyError);
      return payout;
    }
  }

  async getPayoutStatus(payoutId: string): Promise<any> {
    return this.requestWithAuth(`/payout/${payoutId}`);
  }

  async createSinglePayout(
    address: string,
    currency: string,
    amount: number,
    ipnCallbackUrl?: string,
    extraId?: string,
    uniqueExternalId?: string
  ): Promise<PayoutResponse> {
    const withdrawal: PayoutWithdrawal = {
      address,
      currency,
      amount: parseFloat(amount.toFixed(6)),
      ipn_callback_url: ipnCallbackUrl,
      extra_id: extraId,
      unique_external_id: uniqueExternalId,
    };

    return this.createAndVerifyPayout({
      ipn_callback_url: ipnCallbackUrl,
      withdrawals: [withdrawal],
    });
  }

  verifyIPNSignature(data: any, signature: string): boolean {
    const crypto = require('crypto');
    
    const sortObject = (obj: any): any => {
      return Object.keys(obj).sort().reduce((result: any, key) => {
        result[key] = obj[key] && typeof obj[key] === 'object' ? sortObject(obj[key]) : obj[key];
        return result;
      }, {});
    };

    const sortedData = sortObject(data);
    const jsonString = JSON.stringify(sortedData);
    const hmac = crypto.createHmac('sha512', this.ipnSecret);
    hmac.update(jsonString);
    const calculatedSignature = hmac.digest('hex');

    return calculatedSignature === signature;
  }

  hasPayoutCredentials(): boolean {
    return !!(
      process.env.NOWPAYMENTS_EMAIL && 
      process.env.NOWPAYMENTS_PASSWORD
    );
  }
}

export const nowpaymentsClient = new NOWPaymentsAPI();

export type { 
  CreatePaymentParams, 
  PaymentResponse, 
  PaymentStatusResponse,
  CreatePayoutParams,
  PayoutWithdrawal,
  PayoutResponse,
  BalanceResponse 
};
