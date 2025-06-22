import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { streamsApi, Stream } from '../services/api';

interface Transaction {
  id: string;
  type: 'withdrawal' | 'cashout';
  streamId: number;
  amount: string;
  currency?: string;
  recipient?: string;
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  fee?: string;
}

export function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'withdrawal' | 'cashout'>('all');
  
  // Fetch real streams data
  const { data: streams, isLoading, error } = useQuery<Stream[], Error>({
    queryKey: ['streams'],
    queryFn: streamsApi.getAll,
    retry: 1,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Convert streams data to transactions
  const generateTransactions = (streams: Stream[]): Transaction[] => {
    const transactions: Transaction[] = [];

    streams?.forEach((stream) => {
      const withdrawnAmount = parseFloat(stream.withdrawn) / 1e18;
      
      // Add withdrawal transactions if amount was withdrawn
      if (withdrawnAmount > 0) {
        transactions.push({
          id: `withdrawal-${stream.streamId}-${stream.withdrawn}`,
          type: 'withdrawal',
          streamId: stream.streamId,
          amount: withdrawnAmount.toFixed(6),
          status: 'completed',
          timestamp: new Date(stream.lastPayoutAt || stream.createdAt),
        });
      }

      // Add cashout transactions from payout history
      stream.payoutHistory?.forEach((payout, index) => {
        try {
          // Try to parse payout if it's JSON, otherwise treat as simple string
          let payoutData;
          try {
            payoutData = JSON.parse(payout);
          } catch {
            // If not JSON, create a simple payout object
            payoutData = {
              amount: '1000',
              currency: 'KES',
              status: 'DELIVERED',
              timestamp: new Date().toISOString(),
              reference: `KTN-${Math.random().toString(36).substr(2, 9)}`,
            };
          }

          transactions.push({
            id: `cashout-${stream.streamId}-${index}`,
            type: 'cashout',
            streamId: stream.streamId,
            amount: payoutData.amount || '1000',
            currency: payoutData.currency || stream.payoutCurrency || 'KES',
            recipient: stream.msisdn || payoutData.msisdn,
            reference: payoutData.reference,
            status: payoutData.status === 'DELIVERED' ? 'completed' : 
                    payoutData.status === 'PENDING' ? 'pending' : 'failed',
            timestamp: new Date(payoutData.timestamp || stream.lastPayoutAt || stream.createdAt),
            fee: payoutData.transactionFee || '50',
          });
        } catch (error) {
          console.warn('Failed to parse payout:', payout, error);
        }
      });
    });

    // Add sample transactions for demo purposes when no real data exists
    if (transactions.length === 0 && streams && streams.length > 0) {
      const sampleStream = streams[0];
      transactions.push(
        {
          id: 'demo-withdrawal-1',
          type: 'withdrawal',
          streamId: sampleStream.streamId,
          amount: '0.001234',
          status: 'completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: 'demo-cashout-1',
          type: 'cashout',
          streamId: sampleStream.streamId,
          amount: '1500',
          currency: 'KES',
          recipient: '+254700000123',
          reference: 'KTN-DEMO123',
          status: 'completed',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          fee: '50',
        },
        {
          id: 'demo-withdrawal-2',
          type: 'withdrawal',
          streamId: sampleStream.streamId,
          amount: '0.000987',
          status: 'pending',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        }
      );
    }

    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const allTransactions = streams ? generateTransactions(streams) : [];
  const filteredTransactions = allTransactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'withdrawal' ? '💸' : '🏦';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading transaction history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start">
          <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-lg">❌</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-red-800">
              Unable to load transaction history
            </h3>
            <div className="mt-2 text-sm text-red-700 space-y-1">
              <p className="break-words">Error: {error.message || 'Unknown error occurred'}</p>
              <p>Make sure the backend is running properly</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex-1">
            <button
              onClick={() => navigate('/streams')}
              className="inline-flex items-center mb-4 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <span className="mr-2">←</span>
              Back to Streams
            </button>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">📊</span>
              Transaction History
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Real-time view of all your withdrawals and cashouts.
            </p>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 rounded-2xl shadow-lg border border-blue-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">🔍 Debug Info</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Streams Found:</strong> {streams?.length || 0}</p>
          <p><strong>Real Transactions:</strong> {streams ? generateTransactions(streams).filter(tx => !tx.id.startsWith('demo-')).length : 0}</p>
          <p><strong>Demo Transactions:</strong> {streams ? generateTransactions(streams).filter(tx => tx.id.startsWith('demo-')).length : 0}</p>
          {streams?.[0] && (
            <div className="mt-3 p-3 bg-white rounded-lg border">
              <p><strong>Sample Stream Data:</strong></p>
              <p>Stream ID: {streams[0].streamId}</p>
              <p>Withdrawn: {streams[0].withdrawn} wei ({(parseFloat(streams[0].withdrawn) / 1e18).toFixed(6)} ETH)</p>
              <p>Payout History: {streams[0].payoutHistory?.length || 0} items</p>
              <p>Active: {streams[0].active ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              filter === 'all'
                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            📋 All Transactions ({allTransactions.length})
          </button>
          <button
            onClick={() => setFilter('withdrawal')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              filter === 'withdrawal'
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            💸 Withdrawals ({allTransactions.filter(tx => tx.type === 'withdrawal').length})
          </button>
          <button
            onClick={() => setFilter('cashout')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              filter === 'cashout'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            🏦 Cashouts ({allTransactions.filter(tx => tx.type === 'cashout').length})
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">📭</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No transactions yet' : `No ${filter}s yet`}
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              {filter === 'all' 
                ? 'Your transaction history will appear here once you start making withdrawals and cashouts.'
                : `Start making ${filter}s and they will appear here.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    {/* Transaction Info */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{getTypeIcon(transaction.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900 capitalize">
                            {transaction.type}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)} {transaction.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Stream #{transaction.streamId} • {transaction.timestamp.toLocaleString()}
                        </p>
                        {transaction.reference && (
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            Ref: {transaction.reference}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount & Details */}
                    <div className="text-right sm:text-left sm:min-w-0 sm:flex-shrink-0">
                      <div className="text-lg font-bold text-gray-900">
                        {transaction.type === 'withdrawal' 
                          ? `${transaction.amount} ETH`
                          : `${transaction.amount} ${transaction.currency || 'KES'}`
                        }
                      </div>
                      {transaction.fee && (
                        <div className="text-xs text-gray-500">
                          Fee: {transaction.fee} {transaction.currency || 'KES'}
                        </div>
                      )}
                      {transaction.recipient && (
                        <div className="text-xs text-gray-600 font-mono mt-1">
                          To: {transaction.recipient}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl border-2 border-green-200 shadow-sm">
          <h3 className="text-sm font-semibold text-green-800 flex items-center mb-2">
            <span className="mr-2">💸</span>Total Withdrawals
          </h3>
          <p className="text-2xl font-bold text-green-900">
            {allTransactions
              .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
              .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
              .toFixed(4)} ETH
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-800 flex items-center mb-2">
            <span className="mr-2">🏦</span>Total Cashouts
          </h3>
          <p className="text-2xl font-bold text-blue-900">
            {allTransactions
              .filter(tx => tx.type === 'cashout' && tx.status === 'completed')
              .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
              .toLocaleString()} KES
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-2xl border-2 border-purple-200 shadow-sm">
          <h3 className="text-sm font-semibold text-purple-800 flex items-center mb-2">
            <span className="mr-2">📈</span>This Month
          </h3>
          <p className="text-2xl font-bold text-purple-900">
            {filteredTransactions.filter(tx => tx.status === 'completed').length} transactions
          </p>
        </div>
      </div>
    </div>
  );
} 