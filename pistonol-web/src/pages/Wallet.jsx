import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FaWallet, FaQrcode, FaMoneyBillWave, FaHistory, FaExchangeAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import {QRCodeSVG} from 'qrcode.react';

const Wallet = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('balance');
  const [amount, setAmount] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);

  // Fetch user wallet data
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users/wallet');
      return data;
    }
  });

  // Fetch QR codes associated with the user
  const { data: qrCodes, isLoading: qrLoading } = useQuery({
    queryKey: ['qrcodes'],
    queryFn: async () => {
      const { data } = await axios.get('/api/qrcodes');
      return data;
    }
  });

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await axios.get('/api/transactions');
      return data;
    }
  });

  // Mutation for adding funds
  const addFundsMutation = useMutation({
    mutationFn: async (amount) => {
      const { data } = await axios.post('/api/wallet/deposit', { amount });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wallet']);
      queryClient.invalidateQueries(['transactions']);
      toast.success('Funds added successfully!');
      setAmount('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add funds');
    }
  });

  // Mutation for generating QR code
  const generateQrMutation = useMutation({
    mutationFn: async (qrData) => {
      const { data } = await axios.post('/api/qrcodes/generate', qrData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['qrcodes']);
      queryClient.invalidateQueries(['wallet']);
      setQrCodeData(data);
      toast.success('QR Code generated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    }
  });

  const handleAddFunds = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    addFundsMutation.mutate(parseFloat(amount));
  };

  const handleGenerateQr = () => {
    generateQrMutation.mutate({
      value: 100, // Default value, can be made configurable
      quantity: 1,
      batchNumber: `BATCH-${Date.now()}`
    });
  };

  if (walletLoading || qrLoading || transactionsLoading) {
    return <div className="text-center py-8">Loading wallet data...</div>;
  }

  return (
    <div className="  mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Wallet Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <FaWallet className="mr-2" /> My Wallet
              </h1>
              <p className="text-blue-100">Manage your funds and QR codes</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200">Current Balance</p>
              <p className="text-3xl font-bold">
                ₹{walletData?.balance?.toLocaleString() || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-6 py-3 font-medium ${activeTab === 'balance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <FaMoneyBillWave className="inline mr-2" /> Balance
          </button>
          <button
            onClick={() => setActiveTab('qrcodes')}
            className={`px-6 py-3 font-medium ${activeTab === 'qrcodes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <FaQrcode className="inline mr-2" /> QR Codes
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-medium ${activeTab === 'transactions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <FaHistory className="inline mr-2" /> Transactions
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Balance Tab */}
          {activeTab === 'balance' && (
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Add Funds</h2>
                <form onSubmit={handleAddFunds} className="flex gap-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <button
                    type="submit"
                    disabled={addFundsMutation.isLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                  >
                    {addFundsMutation.isLoading ? 'Processing...' : (
                      <>
                        <FaExchangeAlt className="mr-2" /> Add Funds
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Total Deposits</h3>
                  <p className="text-2xl font-bold">₹{walletData?.totalDeposits?.toLocaleString() || '0.00'}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Total Withdrawals</h3>
                  <p className="text-2xl font-bold">₹{walletData?.totalWithdrawals?.toLocaleString() || '0.00'}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">QR Codes Value</h3>
                  <p className="text-2xl font-bold">₹{walletData?.qrCodeValue?.toLocaleString() || '0.00'}</p>
                </div>
              </div>
            </div>
          )}

          {/* QR Codes Tab */}
          {activeTab === 'qrcodes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your QR Codes</h2>
                <button
                  onClick={handleGenerateQr}
                  disabled={generateQrMutation.isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center"
                >
                  {generateQrMutation.isLoading ? 'Generating...' : (
                    <>
                      <FaQrcode className="mr-2" /> Generate QR Code
                    </>
                  )}
                </button>
              </div>

              {qrCodeData && (
                <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-2">New QR Code Generated</h3>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-2 bg-white rounded">
                      <QRCode value={qrCodeData.value} size={128} />
                    </div>
                    <div>
                      <p><strong>Value:</strong> ₹{qrCodeData.value}</p>
                      <p><strong>Batch Number:</strong> {qrCodeData.batchNumber}</p>
                      <p><strong>Status:</strong> <span className="capitalize">{qrCodeData.status}</span></p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {  Array.isArray(qrCodes) &&  qrCodes?.map((qr) => (
                  <div key={qr._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-center mb-3">
                      <QRCode value={qr.value} size={120} />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">₹{qr.value}</p>
                      <p className="text-sm text-gray-600">Batch: {qr.batchNumber}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        qr.status === 'active' ? 'bg-green-100 text-green-800' :
                        qr.status === 'used' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {qr.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {qrCodes?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaQrcode className="mx-auto text-4xl mb-2" />
                  <p>No QR codes found</p>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {  Array.isArray(transactions ) &&   transactions?.map((txn) => (
                      <tr key={txn._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(txn.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            txn.type === 'deposit' ? 'bg-green-100 text-green-800' :
                            txn.type === 'withdrawal' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{txn.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {txn.description || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                            txn.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {transactions?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaHistory className="mx-auto text-4xl mb-2" />
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;