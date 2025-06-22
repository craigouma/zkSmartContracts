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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Salary Stream</h1>
          <p className="mt-4 text-lg text-gray-600">
            Set up a new privacy-preserving salary stream with ZK proof verification
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Recipient Address */}
              <div>
                <label htmlFor="recipient" className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    placeholder="0x742d35Cc6634C0532925a3b8D2F284Cc81F42035"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Ethereum address of the salary recipient
                </p>
              </div>
              
              {/* Total Amount */}
              <div>
                <label htmlFor="totalAmount" className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    placeholder="1.0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">ETH</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Total amount to be streamed over the duration
                </p>
              </div>
              
              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    placeholder="86400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {formData.duration > 0 ? formatDuration(formData.duration) : 'Enter duration in seconds'}
                </p>
                
                {/* Quick duration buttons */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, duration: 3600 }))}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, duration: 86400 }))}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, duration: 604800 }))}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, duration: 2629746 }))}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    1 Month
                  </button>
                </div>
              </div>

              {/* Stream Preview */}
              {formData.totalAmount && formData.duration > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
                    </svg>
                    Stream Preview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-blue-600 font-medium">Hourly Rate</div>
                      <div className="text-gray-900 font-semibold">{(parseFloat(formData.totalAmount || '0') / formData.duration * 3600).toFixed(6)} ETH</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-blue-600 font-medium">Daily Rate</div>
                      <div className="text-gray-900 font-semibold">{(parseFloat(formData.totalAmount || '0') / formData.duration * 86400).toFixed(6)} ETH</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-blue-600 font-medium">Duration</div>
                      <div className="text-gray-900 font-semibold">{formatDuration(formData.duration)}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Stream...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Stream
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/streams')}
                  className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How it works</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-indigo-600 font-semibold text-xs">1</span>
              </div>
              <p>Enter the recipient's Ethereum address and total salary amount</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-indigo-600 font-semibold text-xs">2</span>
              </div>
              <p>Set the streaming duration (how long the salary will be distributed)</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-indigo-600 font-semibold text-xs">3</span>
              </div>
              <p>ZK proofs ensure privacy while maintaining transparency and compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 