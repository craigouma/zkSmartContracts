import { Injectable, Logger } from '@nestjs/common';

export interface FXQuote {
  rate: string;
  fee: string;
  expiresIn: number;
  currency: string;
  amount: string;
  quoteId: string;
}

export interface PayoutReceipt {
  reference: string;
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  msisdn: string;
  amount: string;
  currency: string;
  timestamp: string;
  transactionFee: string;
}

@Injectable()
export class MockKotaniService {
  private readonly logger = new Logger(MockKotaniService.name);
  private quotes: Map<string, FXQuote> = new Map();

  /**
   * Get mock FX quote for fiat conversion
   */
  async getQuote(fiat: string, amount: string): Promise<FXQuote> {
    this.logger.log(`Getting mock quote for ${amount} ${fiat}`);
    
    // Mock exchange rates (ETH to various currencies)
    const mockRates = {
      KES: '324156.25', // Kenyan Shilling
      USD: '2156.75',   // US Dollar
      NGN: '2847382.50', // Nigerian Naira
      GHS: '25489.30',   // Ghanaian Cedi
      ZAR: '40234.80',   // South African Rand
    };

    const rate = mockRates[fiat.toUpperCase()] || mockRates.USD;
    const quoteId = `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const quote: FXQuote = {
      rate,
      fee: '0.5%',
      expiresIn: 120, // 2 minutes
      currency: fiat.toUpperCase(),
      amount,
      quoteId,
    };

    // Store quote for later validation
    this.quotes.set(quoteId, quote);
    
    // Auto-expire quote after 2 minutes
    setTimeout(() => {
      this.quotes.delete(quoteId);
    }, 120000);

    return quote;
  }

  /**
   * Create mock payout to mobile money
   */
  async createPayout(msisdn: string, amount: string, currency: string = 'KES', quoteId?: string): Promise<PayoutReceipt> {
    this.logger.log(`Creating mock payout of ${amount} ${currency} to ${msisdn}`);
    
    // Validate quote if provided
    if (quoteId && !this.quotes.has(quoteId)) {
      throw new Error('Quote expired or invalid');
    }

    // Simulate different outcomes based on phone number patterns
    const status = this.determinePayoutStatus(msisdn);
    
    const reference = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const receipt: PayoutReceipt = {
      reference,
      status,
      msisdn: this.formatMsisdn(msisdn),
      amount,
      currency: currency.toUpperCase(),
      timestamp: new Date().toISOString(),
      transactionFee: this.calculateTransactionFee(amount),
    };

    // Simulate processing delay
    await this.delay(1000 + Math.random() * 2000); // 1-3 seconds

    this.logger.log(`Payout ${reference} completed with status: ${status}`);
    return receipt;
  }

  /**
   * Get mock payout status
   */
  async getPayoutStatus(reference: string): Promise<PayoutReceipt> {
    this.logger.log(`Getting mock payout status for ${reference}`);
    
    // For demo purposes, return a successful status
    // In real implementation, this would query the actual payout status
    return {
      reference,
      status: 'DELIVERED',
      msisdn: '+254700000000',
      amount: '1000',
      currency: 'KES',
      timestamp: new Date().toISOString(),
      transactionFee: '25.00',
    };
  }

  /**
   * Validate a quote
   */
  validateQuote(quoteId: string): boolean {
    return this.quotes.has(quoteId);
  }

  /**
   * Get all available currencies for mock payouts
   */
  getSupportedCurrencies(): string[] {
    return ['KES', 'USD', 'NGN', 'GHS', 'ZAR'];
  }

  private determinePayoutStatus(msisdn: string): 'PENDING' | 'DELIVERED' | 'FAILED' {
    // Use phone number patterns to simulate different outcomes
    const lastDigit = parseInt(msisdn.slice(-1));
    
    if (lastDigit <= 7) return 'DELIVERED';
    if (lastDigit === 8) return 'PENDING';
    return 'FAILED'; // lastDigit === 9
  }

  private formatMsisdn(msisdn: string): string {
    // Ensure proper formatting (add + if missing)
    if (!msisdn.startsWith('+')) {
      return `+${msisdn}`;
    }
    return msisdn;
  }

  private calculateTransactionFee(amount: string): string {
    // Mock transaction fee calculation (2.5% of amount)
    const amountNum = parseFloat(amount);
    const fee = amountNum * 0.025;
    return fee.toFixed(2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 