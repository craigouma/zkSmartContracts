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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-900">💰 Cashout Stream</h1>
              <p className="mt-2 text-lg text-gray-600">
                Convert your stream earnings to local currency via MockKotani Pay.
              </p>
            </div>
            <div className="mt-6 sm:mt-0">
              <button
                onClick={() => navigate('/streams')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ← Back to Streams
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Cashout Form */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  🏦 Stream #{streamId} Cashout
                </h3>
              </div>
              
              <div className="px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Phone Number Input */}
                  <div className="group">
                    <label htmlFor="msisdn" className="block text-sm font-semibold text-gray-700 mb-3">
                      📱 Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="msisdn"
                        id="msisdn"
                        required
                        value={payoutData.msisdn}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300"
                        placeholder="+254700000007"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <span className="text-gray-400 text-2xl">📞</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <span className="mr-1">💡</span>
                      Include country code (e.g., +254 for Kenya)
                    </p>
                  </div>

                  {/* Currency Select */}
                  <div className="group">
                    <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-3">
                      💱 Currency *
                    </label>
                    <div className="relative">
                      <select
                        name="currency"
                        id="currency"
                        value={payoutData.currency}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300 appearance-none bg-white"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-xl">🔽</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="group">
                    <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-3">
                      💰 Amount *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        required
                        step="0.01"
                        min="0"
                        value={payoutData.amount}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300"
                        placeholder="1000.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <span className="text-gray-400 text-xl">{payoutData.currency}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <span className="mr-1">📊</span>
                      Amount in the selected currency
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Cashout Now
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Payout Result */}
            {lastPayout && (
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    📋 Payout Result
                  </h3>
                </div>
                
                <div className="px-6 py-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-600 flex items-center">
                        <span className="mr-2">📊</span>Status:
                      </span>
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(lastPayout.status)}`}>
                        {lastPayout.status === 'DELIVERED' && '✅'}
                        {lastPayout.status === 'PENDING' && '⏳'}
                        {lastPayout.status === 'FAILED' && '❌'}
                        {lastPayout.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-600 flex items-center">
                        <span className="mr-2">🔗</span>Reference:
                      </span>
                      <span className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-lg">{lastPayout.reference}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-600 flex items-center">
                        <span className="mr-2">💰</span>Amount:
                      </span>
                      <span className="text-lg font-bold text-gray-900">{lastPayout.amount} {lastPayout.currency}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-600 flex items-center">
                        <span className="mr-2">💳</span>Fee:
                      </span>
                      <span className="text-sm text-gray-900">{lastPayout.transactionFee} {lastPayout.currency}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-600 flex items-center">
                        <span className="mr-2">📱</span>Phone:
                      </span>
                      <span className="text-sm text-gray-900 font-mono">{lastPayout.msisdn}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-semibold text-gray-600 flex items-center">
                        <span className="mr-2">⏰</span>Time:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(lastPayout.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MockKotani Testing Info */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 lg:col-span-2 shadow-lg">
              <h4 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                <span className="mr-2">🧪</span>MockKotani Testing Guide
              </h4>
              <div className="text-sm text-amber-700 space-y-3">
                <p className="font-semibold">📱 Phone number endings determine the result:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="font-semibold text-green-800">SUCCESS</div>
                    <div className="text-xs text-green-700">Ending in 0-7</div>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">⏳</div>
                    <div className="font-semibold text-yellow-800">PENDING</div>
                    <div className="text-xs text-yellow-700">Ending in 8</div>
                  </div>
                  <div className="bg-red-100 border border-red-300 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">❌</div>
                    <div className="font-semibold text-red-800">FAILED</div>
                    <div className="text-xs text-red-700">Ending in 9</div>
                  </div>
                </div>
                <p className="mt-4 text-xs">
                  <strong>Examples:</strong> +254700000007 (success), +254700000008 (pending), +254700000009 (failed)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 