import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  
  // Mock transaction data - in real app this would come from API
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-001',
      type: 'withdrawal',
      streamId: 1,
      amount: '0.1',
      status: 'completed',
      timestamp: new Date('2025-06-22T10:30:00'),
    },
    {
      id: 'tx-002',
      type: 'cashout',
      streamId: 1,
      amount: '1000',
      currency: 'KES',
      recipient: '+254700000007',
      reference: 'KTN-12345',
      status: 'completed',
      timestamp: new Date('2025-06-22T15:45:00'),
      fee: '50',
    },
    {
      id: 'tx-003',
      type: 'withdrawal',
      streamId: 2,
      amount: '0.05',
      status: 'pending',
      timestamp: new Date('2025-06-22T18:20:00'),
    },
    {
      id: 'tx-004',
      type: 'cashout',
      streamId: 2,
      amount: '500',
      currency: 'KES',
      recipient: '+254700000008',
      reference: 'KTN-12346',
      status: 'failed',
      timestamp: new Date('2025-06-22T20:15:00'),
      fee: '25',
    },
  ];

  const filteredTransactions = mockTransactions.filter(tx => 
    filter === 'all' || tx.type === filter
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
              View all your withdrawals and cashouts in one place.
            </p>
          </div>
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
            📋 All Transactions ({mockTransactions.length})
          </button>
          <button
            onClick={() => setFilter('withdrawal')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              filter === 'withdrawal'
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            💸 Withdrawals ({mockTransactions.filter(tx => tx.type === 'withdrawal').length})
          </button>
          <button
            onClick={() => setFilter('cashout')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              filter === 'cashout'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            🏦 Cashouts ({mockTransactions.filter(tx => tx.type === 'cashout').length})
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
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-sm sm:text-base text-gray-500">
              Your transaction history will appear here once you start making withdrawals and cashouts.
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
            {mockTransactions
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
            {mockTransactions
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