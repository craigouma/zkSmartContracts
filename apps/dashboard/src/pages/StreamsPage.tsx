import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { streamsApi, Stream, kotaniApi } from '../services/api';
import toast from 'react-hot-toast';

export function StreamsPage() {
  const [currencies, setCurrencies] = useState<string[]>([]);

  const { data: streams, isLoading, error, refetch } = useQuery<Stream[], Error>({
    queryKey: ['streams'],
    queryFn: streamsApi.getAll,
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when user focuses the window
  });

  useEffect(() => {
    // Load currencies on component mount
    kotaniApi.getCurrencies()
      .then(setCurrencies)
      .catch(err => console.error('Failed to load currencies:', err));
  }, []);

  const handleTestPayout = async () => {
    try {
      const result = await kotaniApi.createPayout({
        msisdn: '+254700000007',
        currency: 'KES',
        amount: '1000',
      });
      
      toast.success(`Mock payout created! Status: ${result.status}`);
      console.log('Payout result:', result);
    } catch (error) {
      toast.error('Failed to create payout');
      console.error('Payout error:', error);
    }
  };

  const handleWithdraw = async (streamId: number) => {
    try {
      await streamsApi.withdraw(streamId.toString());
      toast.success('Withdrawal successful!');
      refetch();
    } catch (error) {
      toast.error('Withdrawal failed');
      console.error('Withdrawal error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-4 text-lg text-gray-600">Loading streams...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Mobile Responsive */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">💰</span>
              Salary Streams
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Manage your privacy-preserving salary streams with ZK proofs.
            </p>
          </div>
          
          {/* Mobile-Responsive Action Buttons */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center px-4 py-2 sm:py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              title="Refresh streams list"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh</span>
            </button>
            
            <button
              onClick={handleTestPayout}
              className="inline-flex items-center justify-center px-4 py-2 sm:py-3 border border-purple-300 rounded-xl shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
            >
              <span className="mr-2">🧪</span>
              <span className="hidden sm:inline">Test Mock Payout</span>
              <span className="sm:hidden">Test Payout</span>
            </button>
            
            <Link
              to="/create"
              className="inline-flex items-center justify-center px-4 py-2 sm:py-3 border border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
            >
              <span className="mr-2">➕</span>
              <span className="hidden sm:inline">Create Stream</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </div>
        </div>
      </div>

      {/* API Status Indicators - Mobile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl border-2 border-green-200 shadow-sm">
          <h3 className="text-sm font-semibold text-green-800 flex items-center">
            <span className="mr-2">🔗</span>Backend Status
          </h3>
          <p className="text-xs sm:text-sm text-green-600 mt-1 break-all">
            ✅ Connected to Railway
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-800 flex items-center">
            <span className="mr-2">💱</span>Supported Currencies
          </h3>
          <p className="text-xs sm:text-sm text-blue-600 mt-1">
            {currencies.length > 0 ? currencies.join(', ') : 'Loading...'}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-2xl border-2 border-purple-200 shadow-sm sm:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-semibold text-purple-800 flex items-center">
            <span className="mr-2">🧪</span>MockKotani Status
          </h3>
          <p className="text-xs sm:text-sm text-purple-600 mt-1">
            ✅ Mock payments ready
          </p>
        </div>
      </div>
      
      {/* Error State - Mobile Friendly */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">❌</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-800">
                Unable to load streams
              </h3>
              <div className="mt-2 text-sm text-red-700 space-y-1">
                <p className="break-words">Error: {error.message || 'Unknown error occurred'}</p>
                <p>Make sure the backend is running properly</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Mobile Friendly */}
      {streams && streams.length === 0 && !error && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-8 sm:p-12">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">📄</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No streams yet</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                Get started by creating your first salary stream with zero-knowledge privacy.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105"
              >
                <span className="mr-2">🚀</span>
                Create your first stream
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Streams List - Mobile Responsive Cards */}
      {streams && streams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Active Streams ({streams.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {streams.map((stream) => (
              <div key={stream.streamId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">💰</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Stream #{stream.streamId}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stream.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {stream.active ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Recipient:</span>
                      <p className="text-gray-900 break-all font-mono text-xs mt-1">
                        {stream.employee}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Total Amount:</span>
                      <p className="text-gray-900 font-semibold mt-1">
                        {(parseFloat(stream.amount) / 1e18).toFixed(4)} ETH
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Duration:</span>
                      <p className="text-gray-900 mt-1">{stream.duration} seconds</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Withdrawn:</span>
                      <p className="text-gray-900 font-semibold mt-1">
                        {(parseFloat(stream.withdrawn) / 1e18).toFixed(6)} ETH
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile Responsive */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleWithdraw(stream.streamId)}
                      disabled={!stream.active}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <span className="mr-2">💸</span>
                      Withdraw
                    </button>
                    <Link
                      to={`/cashout/${stream.streamId}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border-2 border-indigo-300 text-sm font-medium rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <span className="mr-2">🏦</span>
                      Cashout
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 