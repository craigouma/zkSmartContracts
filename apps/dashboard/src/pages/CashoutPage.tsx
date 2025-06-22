import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { kotaniApi, PayoutRequest, PayoutResponse } from '../services/api';
import toast from 'react-hot-toast';

export function CashoutPage() {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [payoutData, setPayoutData] = useState<PayoutRequest>({
    msisdn: '',
    currency: 'KES',
    amount: '0',
  });
  const [lastPayout, setLastPayout] = useState<PayoutResponse | null>(null);

  useEffect(() => {
    kotaniApi.getCurrencies()
      .then(setCurrencies)
      .catch(err => console.error('Failed to load currencies:', err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPayoutData(prev => ({
      ...prev,
      [name]: value  // Keep all values as strings, including amount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payoutData.msisdn || !payoutData.currency || parseFloat(payoutData.amount) <= 0) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!payoutData.msisdn.match(/^\+\d{10,15}$/)) {
      toast.error('Please enter a valid phone number (e.g., +254700000000)');
      return;
    }

    setLoading(true);
    
    try {
      const result = await kotaniApi.createPayout(payoutData);
      
      setLastPayout(result);
      
      if (result.status === 'DELIVERED') {
        toast.success(`Payout successful! ${result.amount} ${result.currency} delivered to ${result.msisdn}`);
      } else if (result.status === 'PENDING') {
        toast.success(`Payout pending. Reference: ${result.reference}`);
      } else {
        toast.error(`Payout failed. Reference: ${result.reference}`);
      }
      
      console.log('Payout result:', result);
    } catch (error: any) {
      console.error('Payout error:', error);
      toast.error(error.response?.data?.message || 'Payout failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Cashout Stream</h1>
          <p className="mt-2 text-sm text-gray-700">
            Convert your stream earnings to local currency via MockKotani Pay.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/streams')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ← Back to Streams
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cashout Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Stream #{streamId} Cashout
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="msisdn" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="msisdn"
                  id="msisdn"
                  required
                  value={payoutData.msisdn}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="+254700000007"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include country code (e.g., +254 for Kenya)
                </p>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency *
                </label>
                <select
                  name="currency"
                  id="currency"
                  value={payoutData.currency}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  step="0.01"
                  min="0"
                  value={payoutData.amount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="1000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Amount in the selected currency
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Cashout Now'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Payout Result */}
        {lastPayout && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payout Result
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lastPayout.status)}`}>
                    {lastPayout.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Reference:</span>
                  <span className="text-sm text-gray-900 font-mono">{lastPayout.reference}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Amount:</span>
                  <span className="text-sm text-gray-900">{lastPayout.amount} {lastPayout.currency}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fee:</span>
                  <span className="text-sm text-gray-900">{lastPayout.transactionFee} {lastPayout.currency}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Phone:</span>
                  <span className="text-sm text-gray-900">{lastPayout.msisdn}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Time:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(lastPayout.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MockKotani Testing Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 lg:col-span-2">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">MockKotani Testing Guide</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>Phone number endings determine the result:</strong></p>
            <p>• Ending in 0-7: ✅ DELIVERED status</p>
            <p>• Ending in 8: ⏳ PENDING status</p>
            <p>• Ending in 9: ❌ FAILED status</p>
            <p><strong>Examples:</strong> +254700000007 (success), +254700000008 (pending), +254700000009 (failed)</p>
          </div>
        </div>
      </div>
    </div>
  );
} 