import React, { useState, useEffect, useRef } from 'react';
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
  Statistic,
  AutoComplete,
  Avatar,
  Badge,
  Divider,
  Tooltip,
  Alert,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  WalletOutlined, 
  SearchOutlined,
  HistoryOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  DownOutlined,
  MoneyCollectOutlined,
  SafetyOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';

const WalletTransfer = ({ adminUsername = 'company123' }) => {
  const [form] = Form.useForm();
  const [searching, setSearching] = useState(false);
  const [userData, setUserData] = useState(null);
  const [transferring, setTransferring] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [walletHistory, setWalletHistory] = useState([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Load admin data on component mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fetch admin details
  const fetchAdminData = async () => {
    try {
      const response = await axios.get('/auth/admin-details');
      if (response.data.success) {
        setAdminData(response.data.admin);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      message.error('Failed to load admin data');
    }
  };

  // Refresh admin balance
  const refreshAdminBalance = async () => {
    try {
      const response = await axios.get('/auth/admin-details');
      if (response.data.success) {
        setAdminData(response.data.admin);
        message.success('Admin balance refreshed');
      }
    } catch (error) {
      console.error('Error refreshing admin data:', error);
    }
  };

  // Debounced search for auto-suggestions
  const searchUsers = debounce(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(`/auth/search-users/${query}`);
      if (response.data.success) {
        setSuggestions(response.data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, 300);

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value) {
      setShowSuggestions(true);
      searchUsers(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setUserData(null);
    }
  };

  // Select user from suggestions
  const handleUserSelect = (value, option) => {
    setSearchQuery(option.label);
    setUserData(option.user);
    setShowSuggestions(false);
    message.success(`Selected: ${option.user.name}`);
  };

  // Manual search by username
  const handleManualSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('Please enter a username');
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`/auth/userwallet/${searchQuery}`);
      
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
      setShowSuggestions(false);
    }
  };

  // Handle wallet transfer (FROM ADMIN)
  const handleTransfer = async (values) => {
    if (!userData) {
      toast.error('Please select a user first');
      return;
    }

    if (!adminData) {
      toast.error('Admin data not loaded');
      return;
    }

    const amount = parseFloat(values.amount);
    
    // Check admin balance
    if (adminData.wallet < amount) {
      toast.error(`Insufficient admin balance. Available: ₹${adminData.wallet.toFixed(2)}`);
      return;
    }
 
        await executeTransfer(values, amount);
    
  };

  // Execute the transfer
  const executeTransfer = async (values, amount) => {
    setTransferring(true);
    try {
      const transferData = {
        username: userData.username,
        amount: amount,
        adminName: values.adminName || adminData.name || 'Admin',
        notes: values.notes || 'Direct wallet transfer from admin'
      };

      const response = await axios.post(`/auth/admin-transfer`, transferData);

      if (response.data.success) {
        toast.success(response.data.message);
        
        // Update local data
        setUserData({
          ...userData,
          wallet: response.data.transaction.userNewBalance
        });
        
        // Update admin data
        setAdminData({
          ...adminData,
          wallet: response.data.transaction.adminNewBalance
        });

   

        // Reset form
        form.resetFields(['amount', 'notes']);
        form.setFieldsValue({ adminName: adminData.name || 'Admin' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error transferring amount';
      toast.error(errorMsg);
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
      defaultSortOrder: 'descend',
      width: 150
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'credit' ? 'green' : 'red'}>
          {type.toUpperCase()}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className={`font-bold ${amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {amount > 0 ? '+' : ''}₹{parseFloat(amount).toFixed(2)}
        </span>
      ),
      width: 120
    },
    {
      title: 'Description',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text, record) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'From/To',
      key: 'counterparty',
      render: (_, record) => (
        <span className="text-sm">
          {record.type === 'credit' ? 
            `From: ${record.adminName || 'Admin'}` : 
            `To: ${record.toUser || 'User'}`
          }
        </span>
      ),
      width: 150
    }
  ];

  // Format suggestions for AutoComplete
  const suggestionOptions = suggestions.map(user => ({
    value: user.username,
    label: (
      <div className="flex items-center justify-between p-2 hover:bg-blue-50">
        <div className="flex items-center gap-3">
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            className="bg-blue-100"
          />
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-500">@{user.username}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-green-600">
            ₹{user.wallet.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">{user.role}</div>
        </div>
      </div>
    ),
    user: user
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Admin Info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <MoneyCollectOutlined className="text-green-500" />
                Admin Wallet Transfer
              </h1>
              <p className="text-gray-600">
                Transfer amount from admin wallet to user's wallet
              </p>
            </div>
            
            {adminData ? (
              <div className="bg-white p-4 rounded-xl shadow-lg border border-blue-200 min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Admin Account</p>
                    <p className="font-bold">{adminData.name}</p>
                    <p className="text-gray-600 text-sm">@{adminData.username}</p>
                  </div>
                  <Button 
                    type="text" 
                    icon={<ReloadOutlined />} 
                    onClick={refreshAdminBalance}
                    size="small"
                  />
                </div>
                <Divider className="my-2" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <Statistic
                      value={adminData.wallet}
                      precision={2}
                      prefix="₹"
                      valueStyle={{
                        color: '#1890ff',
                        fontSize: '22px',
                        fontWeight: 'bold'
                      }}
                    />
                  </div>
                  <Tag color="blue" icon={<SafetyOutlined />}>
                    ADMIN
                  </Tag>
                </div>
              </div>
            ) : (
              <Spin tip="Loading admin data..." />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - User Search & Info */}
          <div className="space-y-6">
            {/* Search Card */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <SearchOutlined className="text-blue-500" />
                  <span>Search & Select User</span>
                </div>
              }
              className="shadow-lg"
            >
              <div className="space-y-4">
                <div className="relative" ref={searchRef}>
                  <AutoComplete
                    options={suggestionOptions}
                    onSelect={handleUserSelect}
                    onSearch={handleSearchChange}
                    value={searchQuery}
                    open={showSuggestions && suggestions.length > 0}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full"
                    dropdownClassName="rounded-lg shadow-xl border"
                    dropdownMatchSelectWidth={true}
                    filterOption={false}
                  >
                    <Input
                      placeholder="Search by username, name, email or phone..."
                      size="large"
                      prefix={<SearchOutlined className="text-gray-400" />}
                      suffix={
                        searching ? 
                        <Spin size="small" /> : 
                        <DownOutlined />
                      }
                      onPressEnter={handleManualSearch}
                      allowClear
                      onChange={(e) => {
                        if (!e.target.value) {
                          setUserData(null);
                          setSearchQuery('');
                        }
                      }}
                    />
                  </AutoComplete>
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1">
                      <div className="text-xs text-gray-500 px-3 py-1 bg-gray-50 rounded-t border">
                        Found {suggestions.length} user{suggestions.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  loading={searching}
                  onClick={handleManualSearch}
                  block
                >
                  Search User
                </Button>

                {userData && (
                  <div className="border border-green-200 bg-white rounded-xl p-4 animate-fadeIn shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          size={56} 
                          icon={<UserOutlined />} 
                          className="bg-blue-100"
                        />
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{userData.name || userData.username}</h3>
                          <p className="text-gray-600">@{userData.username}</p>
                          <Tag color="blue" className="mt-1">{userData.role || 'Customer'}</Tag>
                        </div>
                      </div>
                    
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm text-gray-500">Mobile</p>
                        <p className="font-semibold">{userData.mobile || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold truncate">{userData.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">User's Current Balance</p>
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
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Transfer Form */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <ArrowUpOutlined className="text-green-500" />
                <span>Transfer Details</span>
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
                initialValues={{
                  adminName: adminData?.name || 'Admin'
                }}
              >
                <Alert
                  message="Transfer Summary"
                  description={
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span>From Admin:</span>
                        <span className="font-bold">{adminData?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>To User:</span>
                        <span className="font-bold">{userData.name}</span>
                      </div>
                    </div>
                  }
                  type="info"
                  showIcon
                />

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
                        if (!value) return Promise.resolve();
                        
                        const amount = parseFloat(value);
                        if (amount <= 0) {
                          return Promise.reject('Amount must be greater than 0');
                        }
                        
                        if (adminData && amount > adminData.wallet) {
                          return Promise.reject(`Insufficient balance. Available: ₹${adminData.wallet.toFixed(2)}`);
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
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="adminName"
                  label="Admin Name (for transaction record)"
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
                    placeholder="Add notes about this transaction..."
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
                    className="h-12 text-lg font-semibold"
                    icon={<ArrowUpOutlined />}
                    disabled={!adminData}
                  >
                    {transferring ? 'Processing...' : 'Transfer Now'}
                  </Button>
                  
                  <div className="text-center mt-3">
                    <p className="text-xs text-gray-500">
                      Admin balance will be deducted immediately
                    </p>
                  </div>
                </Form.Item>
              </Form>
            ) : (
              <Result
                icon={<SearchOutlined className="text-gray-300 text-5xl" />}
                title="Search for a user"
                subTitle="Search and select a user to begin transfer"
                className="py-8"
              />
            )}
          </Card>
        </div>

        {/* Recent Transactions */}
        {walletHistory.length > 0 && (
          <Card className="mt-6 shadow-lg" title="Recent Transactions">
            <Table
              columns={historyColumns}
              dataSource={walletHistory.slice(0, 5)}
              rowKey={(record, index) => index}
              pagination={false}
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
            <span>Transaction History</span>
            <Tag color="blue">{userData?.name}</Tag>
          </div>
        }
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsHistoryModalVisible(false)}>
            Close
          </Button>
        ]}
        width={900}
      >
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{userData?.name}</p>
              <p className="text-sm text-gray-600">@{userData?.username}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-xl font-bold text-green-600">
                ₹{userData?.wallet?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
        
        <Table
          columns={historyColumns}
          dataSource={walletHistory}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 700 }}
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