import { Test, TestingModule } from '@nestjs/testing';
import { MockKotaniService } from './mock-kotani.service';

describe('MockKotaniService', () => {
  let service: MockKotaniService;

  beforeEach(async () => {
    jest.useFakeTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockKotaniService],
    }).compile();

    service = module.get<MockKotaniService>(MockKotaniService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuote', () => {
    it('should return a valid FX quote', async () => {
      const quote = await service.getQuote('KES', '1.0');
      
      expect(quote).toHaveProperty('rate');
      expect(quote).toHaveProperty('fee', '0.5%');
      expect(quote).toHaveProperty('expiresIn', 120);
      expect(quote).toHaveProperty('currency', 'KES');
      expect(quote).toHaveProperty('amount', '1.0');
      expect(quote).toHaveProperty('quoteId');
      expect(quote.quoteId).toMatch(/^QUOTE-\d+-[a-z0-9]+$/);
    });

    it('should return different rates for different currencies', async () => {
      const kesQuote = await service.getQuote('KES', '1.0');
      const usdQuote = await service.getQuote('USD', '1.0');
      
      expect(kesQuote.rate).not.toBe(usdQuote.rate);
      expect(kesQuote.currency).toBe('KES');
      expect(usdQuote.currency).toBe('USD');
    });

    it('should default to USD rate for unknown currencies', async () => {
      const unknownQuote = await service.getQuote('XYZ', '1.0');
      const usdQuote = await service.getQuote('USD', '1.0');
      
      expect(unknownQuote.rate).toBe(usdQuote.rate);
    });
  });

  describe('createPayout', () => {
    it('should return DELIVERED status for numbers ending 0-7', async () => {
      const testNumbers = [
        '+254700000000',
        '+254700000001',
        '+254700000007',
      ];

      for (const msisdn of testNumbers) {
        const receipt = await service.createPayout(msisdn, '1000', 'KES');
        
        expect(receipt.status).toBe('DELIVERED');
        expect(receipt.msisdn).toBe(msisdn);
        expect(receipt.amount).toBe('1000');
        expect(receipt.currency).toBe('KES');
        expect(receipt.reference).toMatch(/^MOCK-\d+-[a-z0-9]+$/);
        expect(receipt.transactionFee).toBe('25.00'); // 2.5% of 1000
      }
    });

    it('should return PENDING status for numbers ending 8', async () => {
      const receipt = await service.createPayout('+254700000008', '1000', 'KES');
      expect(receipt.status).toBe('PENDING');
    });

    it('should return FAILED status for numbers ending 9', async () => {
      const receipt = await service.createPayout('+254700000009', '1000', 'KES');
      expect(receipt.status).toBe('FAILED');
    });

    it('should format MSISDN with + prefix if missing', async () => {
      const receipt = await service.createPayout('254700000001', '1000', 'KES');
      expect(receipt.msisdn).toBe('+254700000001');
    });

    it('should calculate transaction fee correctly', async () => {
      const receipt = await service.createPayout('+254700000001', '2000', 'KES');
      expect(receipt.transactionFee).toBe('50.00'); // 2.5% of 2000
    });

    it('should default to KES currency if not specified', async () => {
      const receipt = await service.createPayout('+254700000001', '1000');
      expect(receipt.currency).toBe('KES');
    });

    it('should throw error for expired quote', async () => {
      await expect(
        service.createPayout('+254700000001', '1000', 'KES', 'invalid-quote-id')
      ).rejects.toThrow('Quote expired or invalid');
    });

    it('should accept valid quote', async () => {
      const quote = await service.getQuote('KES', '1000');
      const receipt = await service.createPayout('+254700000001', '1000', 'KES', quote.quoteId);
      
      expect(receipt.status).toBe('DELIVERED');
    });
  });

  describe('getPayoutStatus', () => {
    it('should return mock delivered status', async () => {
      const status = await service.getPayoutStatus('MOCK-123-test');
      
      expect(status.reference).toBe('MOCK-123-test');
      expect(status.status).toBe('DELIVERED');
      expect(status.msisdn).toBe('+254700000000');
      expect(status.amount).toBe('1000');
      expect(status.currency).toBe('KES');
      expect(status.transactionFee).toBe('25.00');
    });
  });

  describe('validateQuote', () => {
    it('should return false for non-existent quote', () => {
      const isValid = service.validateQuote('non-existent-quote-id');
      expect(isValid).toBe(false);
    });

    it('should return true for existing quote', async () => {
      const quote = await service.getQuote('KES', '1000');
      const isValid = service.validateQuote(quote.quoteId);
      expect(isValid).toBe(true);
    });

    it('should return false for expired quote', async () => {
      const quote = await service.getQuote('KES', '1000');
      
      // Wait for quote to expire (mock the expiration)
      jest.advanceTimersByTime(121000); // 2 minutes + 1 second
      
      const isValid = service.validateQuote(quote.quoteId);
      expect(isValid).toBe(false);
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of supported currencies', () => {
      const currencies = service.getSupportedCurrencies();
      
      expect(currencies).toContain('KES');
      expect(currencies).toContain('USD');
      expect(currencies).toContain('NGN');
      expect(currencies).toContain('GHS');
      expect(currencies).toContain('ZAR');
    });
  });
});
 