import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export interface Stream {
  streamId: number;
  employee: string;
  employer: string;
  amount: string;
  duration: number;
  startTime: Date;
  withdrawn: string;
  active: boolean;
  zkProofHash: string;
  msisdn?: string;
  payoutCurrency: string;
  payoutHistory: string[];
  totalPayouts: number;
  lastPayoutAt?: Date;
  createdAt: string;
}

export interface CreateStreamRequest {
  recipient: string;
  totalAmount: string;
  duration: number;
}

export interface QuoteRequest {
  fiat: string;
  amount: string;
}

export interface Quote {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  expiresAt: string;
}

export interface PayoutRequest {
  msisdn: string;
  amount: string;
  currency?: string;
  quoteId?: string;
}

export interface PayoutResponse {
  reference: string;
  status: 'DELIVERED' | 'PENDING' | 'FAILED';
  msisdn: string;
  amount: string;
  currency: string;
  timestamp: string;
  transactionFee: string;
}

// Streams API
export const streamsApi = {
  create: (data: CreateStreamRequest): Promise<Stream> => {
    // Transform frontend data to backend format
    const backendData = {
      employee: data.recipient,                           // Map recipient to employee
      amount: (parseFloat(data.totalAmount) * 1e18).toString(), // Convert ETH to wei
      duration: data.duration,                           // Keep duration as-is
      zkProofHash: `0x${Math.random().toString(16).slice(2)}`, // Generate mock ZK proof hash
      employer: '0x1234567890123456789012345678901234567890',  // Mock employer address
    };
    return api.post('/api/api/streams', backendData).then(res => res.data);
  },
  
  getAll: (): Promise<Stream[]> =>
    api.get('/api/api/streams').then(res => res.data),
  
  getById: (id: string): Promise<Stream> =>
    api.get(`/api/api/streams/${id}`).then(res => res.data),
  
  withdraw: (id: string): Promise<any> =>
    api.put(`/api/api/streams/${id}/withdraw`).then(res => res.data),
  
  getAvailable: (id: string): Promise<{ amount: string }> =>
    api.get(`/api/api/streams/${id}/available`).then(res => res.data),
  
  cancel: (id: string): Promise<any> =>
    api.delete(`/api/api/streams/${id}`).then(res => res.data),
};

// Kotani API
export const kotaniApi = {
  getCurrencies: (): Promise<string[]> =>
    api.get('/api/kotani/currencies').then(res => res.data),
  
  getQuote: (data: QuoteRequest): Promise<Quote> =>
    api.post('/api/kotani/quote', data).then(res => res.data),
  
  createPayout: (data: PayoutRequest): Promise<PayoutResponse> =>
    api.post('/api/kotani/payout', data).then(res => res.data),
  
  getPayoutStatus: (reference: string): Promise<PayoutResponse> =>
    api.get(`/api/kotani/payout/${reference}/status`).then(res => res.data),
  
  validateQuote: (quoteId: string): Promise<{ valid: boolean }> =>
    api.get(`/api/kotani/quote/${quoteId}/validate`).then(res => res.data),
};

// ZK API
export const zkApi = {
  verifyProof: (proof: any): Promise<{ valid: boolean }> =>
    api.post('/api/api/zk/verify', proof).then(res => res.data),
  
  validateFormat: (proof: any): Promise<{ valid: boolean }> =>
    api.post('/api/api/zk/validate-format', proof).then(res => res.data),
};

export default api; 