// components/WalletTransfer.jsx
import React, { useState } from 'react';
import axios from '../axiosConfig';
import { 
  message, 
  Card, 
  Form, 
  Input, 
  Button, 
  Result, 
  Table,
  Tag,
  Modal,
  Statistic 
} from 'antd';
import { 
  UserOutlined, 
  WalletOutlined, 
  SearchOutlined,
  HistoryOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

const WalletTransfer = () => {
  const [form] = Form.useForm();
  const [searching, setSearching] = useState(false);
  const [userData, setUserData] = useState(null);
  const [transferring, setTransferring] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [walletHistory, setWalletHistory] = useState([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  // Search user by username for wallet
  const searchUser = async (username) => {
    if (!username.trim()) {
      message.warning('Please enter a username');
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`/auth/userwallet/${username}`);
      
      if (response.data.success) {
        setUserData(response.data.user);
        message.success('User found successfully');
      } else {
        message.error(response.data.message || 'User not found');
        setUserData(null);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Error searching user');
      setUserData(null);
    } finally {
      setSearching(false);
    }
  };

  // Handle wallet transfer
  const handleTransfer = async (values) => {
    if (!userData) {
      message.warning('Please search for a user first');
      return;
    }

    setTransferring(true);
    try {
      const transferData = {
        username: userData.username,
        amount: parseFloat(values.amount),
        adminName: values.adminName || 'Admin',
        notes: values.notes || 'Direct wallet transfer'
      };

      const response = await axios.post(`/auth/transfer-wallet`, transferData);

      if (response.data.success) {
        message.success(response.data.message);
        
        // Update local user data
        setUserData({
          ...userData,
          wallet: response.data.transaction.newBalance
        });

        // Show success modal
        Modal.success({
          title: 'Transfer Successful',
          content: (
            <div className="space-y-3">
              <p><strong>Amount:</strong> ₹{response.data.transaction.amount}</p>
              <p><strong>To:</strong> {userData.name} (@{userData.username})</p>
              <p><strong>Previous Balance:</strong> ₹{response.data.transaction.previousBalance}</p>
              <p><strong>New Balance:</strong> ₹{response.data.transaction.newBalance}</p>
              <p><strong>Date:</strong> {moment(response.data.transaction.transferDate).format('DD/MM/YYYY HH:mm:ss')}</p>
            </div>
          ),
          icon: <CheckCircleOutlined className="text-green-500" />,
          okText: 'Done'
        });

        // Reset form
        form.resetFields(['amount', 'adminName', 'notes']);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Error transferring amount');
    } finally {
      setTransferring(false);
    }
  };

  // Fetch wallet history
  const fetchWalletHistory = async () => {
    if (!userData) return;
    
    setHistoryLoading(true);
    try {
      const response = await axios.get(`/auth/wallet-history/${userData.username}`);
      
      if (response.data.success) {
        setWalletHistory(response.data.walletHistory);
        setIsHistoryModalVisible(true);
      }
    } catch (error) {
      message.error('Error fetching wallet history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Table columns for wallet history
  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'credit' ? 'green' : 'red'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className="font-bold">
          ₹{parseFloat(amount).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Admin',
      dataIndex: 'adminName',
      key: 'adminName'
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true
    },
    {
      title: 'Balance',
      key: 'balance',
      render: (_, record) => (
        <div>
          <div className="text-xs text-gray-500">
            Prev: ₹{record.previousBalance}
          </div>
          <div className="font-bold">
            New: ₹{record.newBalance}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <WalletOutlined className="text-green-500" />
            Wallet Transfer System
            <WalletOutlined className="text-green-500" />
          </h1>
          <p className="text-gray-600">
            Transfer amount directly to user's wallet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - User Search & Info */}
          <div className="space-y-6">
            {/* Search Card */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <SearchOutlined className="text-blue-500" />
                  <span>Search User</span>
                </div>
              }
              className="shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter username"
                    size="large"
                    onChange={(e) => {
                      if (!e.target.value) setUserData(null);
                    }}
                    onPressEnter={(e) => searchUser(e.target.value)}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<SearchOutlined />}
                    loading={searching}
                    onClick={() => {
                      const username = document.querySelector('input[placeholder="Enter username"]').value;
                      searchUser(username);
                    }}
                  >
                    Search
                  </Button>
                </div>

                {userData && (
                  <>
                    {/* User Info Card */}
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4 animate-fadeIn">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserOutlined className="text-blue-500 text-xl" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{userData.name || userData.username}</h3>
                            <p className="text-gray-600">@{userData.username}</p>
                          </div>
                        </div>
                        <Button
                          icon={<HistoryOutlined />}
                          onClick={fetchWalletHistory}
                          loading={historyLoading}
                        >
                          History
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-sm text-gray-500">Mobile</p>
                          <p className="font-semibold">{userData.mobile || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold truncate">{userData.email || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Wallet Balance Card */}
                      <div className="mt-4 bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border border-green-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Current Wallet Balance</p>
                            <Statistic
                              value={userData.wallet}
                              precision={2}
                              prefix="₹"
                              valueStyle={{
                                color: '#059669',
                                fontSize: '24px',
                                fontWeight: 'bold'
                              }}
                            />
                          </div>
                          <WalletOutlined className="text-green-500 text-3xl" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Instructions Card */}
            <Card className="shadow-lg">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">How it works</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-blue-600">1</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">Search User</h4>
                      <p className="text-sm text-gray-600">Enter username to find recipient</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-green-600">2</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">Enter Amount</h4>
                      <p className="text-sm text-gray-600">Specify amount to transfer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-purple-600">3</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">Transfer</h4>
                      <p className="text-sm text-gray-600">Complete the transfer</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Transfer Form */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <ArrowUpOutlined className="text-green-500" />
                <span>Wallet Transfer</span>
              </div>
            }
            className="shadow-lg"
          >
            {userData ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleTransfer}
                className="space-y-4"
              >
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-500 mb-1">Transferring to:</p>
                  <p className="font-bold text-lg">{userData.name || userData.username}</p>
                  <p className="text-gray-600">@{userData.username}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <WalletOutlined className="text-gray-400" />
                    <span className="font-semibold text-green-600">
                      Current Balance: ₹{userData.wallet}
                    </span>
                  </div>
                </div>

                <Form.Item
                  name="amount"
                  label="Amount to Transfer (₹)"
                  rules={[
                    { required: true, message: 'Please enter amount' },
                    { 
                      pattern: /^\d+(\.\d{1,2})?$/,
                      message: 'Please enter a valid amount (e.g., 100 or 100.50)' 
                    },
                    {
                      validator: (_, value) => {
                        if (value && parseFloat(value) <= 0) {
                          return Promise.reject('Amount must be greater than 0');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter amount in ₹"
                    size="large"
                    prefix={<span className="text-gray-400">₹</span>}
                    suffix={<span className="text-gray-400">INR</span>}
                  />
                </Form.Item>

                <Form.Item
                  name="adminName"
                  label="Your Name (Optional)"
                >
                  <Input
                    placeholder="Enter admin name"
                    size="large"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label="Transaction Notes (Optional)"
                >
                  <Input.TextArea
                    placeholder="Add notes about this transaction"
                    rows={2}
                    maxLength={200}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={transferring}
                    block
                    className="bg-green-500 hover:bg-green-600 border-green-500 h-12 text-lg font-semibold"
                    icon={<ArrowUpOutlined />}
                  >
                    Transfer to Wallet
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <Result
                icon={<SearchOutlined className="text-gray-300" />}
                title="Search for a user first"
                subTitle="Enter a username in the search box to begin wallet transfer"
                className="py-8"
              />
            )}
          </Card>
        </div>

        {/* Recent Transfers Table (Optional) */}
        {walletHistory.length > 0 && (
          <Card className="mt-6 shadow-lg" title="Recent Wallet Transactions">
            <Table
              columns={historyColumns}
              dataSource={walletHistory}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        )}
      </div>

      {/* Wallet History Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined />
            Wallet History - {userData?.name}
          </div>
        }
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsHistoryModalVisible(false)}>
            Close
          </Button>
        ]}
        width={1000}
      >
        <Table
          columns={historyColumns}
          dataSource={walletHistory}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default WalletTransfer;