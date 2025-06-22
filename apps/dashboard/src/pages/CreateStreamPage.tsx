import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { streamsApi, CreateStreamRequest } from '../services/api';
import toast from 'react-hot-toast';

export function CreateStreamPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStreamRequest>({
    recipient: '',
    totalAmount: '',
    duration: 86400, // Default to 1 day
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipient || !formData.totalAmount || !formData.duration) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!formData.recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    if (parseFloat(formData.totalAmount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (formData.duration <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }

    setLoading(true);
    
    try {
      const stream = await streamsApi.create(formData);
      toast.success('Stream created successfully!');
      console.log('Created stream:', stream);
      
      // Invalidate and refetch streams to show the new stream
      await queryClient.invalidateQueries({ queryKey: ['streams'] });
      navigate('/streams');
    } catch (error: any) {
      console.error('Create stream error:', error);
      toast.error(error.response?.data?.message || 'Failed to create stream');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} (${seconds} seconds)`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} (${seconds} seconds)`;
    } else {
      return `${seconds} seconds`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header - Mobile Optimized */}
          <div className="text-center mb-6 sm:mb-8">
            <button
              onClick={() => navigate('/streams')}
              className="inline-flex items-center mb-4 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <span className="mr-2">←</span>
              Back to Streams
            </button>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center justify-center">
              <span className="mr-3">➕</span>
              Create Salary Stream
            </h1>
            <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-gray-600 px-4">
              Set up a new privacy-preserving salary stream with ZK proof verification
            </p>
          </div>

          {/* Main Form Card - Mobile Enhanced */}
          <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-2">🏦</span>
                Stream Configuration
              </h2>
            </div>
            
            <div className="px-4 sm:px-8 py-6 sm:py-8">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Recipient Address - Mobile Enhanced */}
                <div className="space-y-2">
                  <label htmlFor="recipient" className="block text-sm font-semibold text-gray-700 flex items-center">
                    <span className="mr-2">👤</span>
                    Recipient Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="recipient"
                      id="recipient"
                      required
                      value={formData.recipient}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="0x742d35Cc6634C0532925a3b8D2F284Cc81F42035"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">🔗</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <span className="mr-1">💡</span>
                    Ethereum address of the salary recipient
                  </p>
                </div>
                
                {/* Total Amount - Mobile Enhanced */}
                <div className="space-y-2">
                  <label htmlFor="totalAmount" className="block text-sm font-semibold text-gray-700 flex items-center">
                    <span className="mr-2">💰</span>
                    Total Amount (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="totalAmount"
                      id="totalAmount"
                      required
                      step="0.001"
                      min="0"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="1.0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm sm:text-base font-medium">ETH</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <span className="mr-1">📊</span>
                    Total amount to be streamed over the duration
                  </p>
                </div>
                
                {/* Duration - Mobile Enhanced */}
                <div className="space-y-2">
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 flex items-center">
                    <span className="mr-2">⏰</span>
                    Duration (seconds)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="86400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">⏱️</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <span className="mr-1">🔍</span>
                    {formData.duration > 0 ? formatDuration(formData.duration) : 'Enter duration in seconds'}
                  </p>
                  
                  {/* Quick duration buttons - Mobile Grid */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration: 3600 }))}
                      className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration: 86400 }))}
                      className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      1 Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration: 604800 }))}
                      className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      1 Week
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration: 2629746 }))}
                      className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      1 Month
                    </button>
                  </div>
                </div>

                {/* Stream Preview - Mobile Friendly */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    Stream Preview
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-indigo-700">Recipient:</span>
                      <span className="text-indigo-900 break-all font-mono text-xs sm:text-sm mt-1 sm:mt-0">
                        {formData.recipient || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-indigo-700">Total Amount:</span>
                      <span className="text-indigo-900 font-semibold mt-1 sm:mt-0">
                        {formData.totalAmount || '0'} ETH
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-indigo-700">Duration:</span>
                      <span className="text-indigo-900 mt-1 sm:mt-0">
                        {formData.duration ? formatDuration(formData.duration) : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-indigo-700">Rate per Second:</span>
                      <span className="text-indigo-900 font-semibold mt-1 sm:mt-0">
                        {formData.totalAmount && formData.duration 
                          ? `${(parseFloat(formData.totalAmount) / formData.duration).toFixed(8)} ETH/sec`
                          : 'Calculating...'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/streams')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 sm:py-4 border-2 border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    <span className="mr-2">❌</span>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 sm:py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Creating Stream...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Create Stream
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Card - Mobile Friendly */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
            <h4 className="text-base sm:text-lg font-bold text-amber-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              How It Works
            </h4>
            <div className="text-xs sm:text-sm text-amber-700 space-y-2">
              <p className="flex items-start">
                <span className="mr-2 mt-0.5">1️⃣</span>
                <span>Your salary stream is created with zero-knowledge proof verification</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2 mt-0.5">2️⃣</span>
                <span>Recipients can withdraw their earned amount at any time</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2 mt-0.5">3️⃣</span>
                <span>Payments can be converted to local currency via MockKotani Pay</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}