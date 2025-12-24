import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../axiosConfig';
import {
  Card,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Spin,
  Alert,
  Button,
  Tooltip,
  Avatar,
  Typography
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  QrcodeOutlined,
  BankOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const CompanyWalletTransactions = ({ companyId = '6922847591757cdd37316509' }) => {
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    dateRange: null,
    page: 1,
    limit: 10
  });

  // Fetch transactions
  const { 
    data: transactionsData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['companyTransactions', companyId, filters],
    queryFn: async () => {
      const response = await axios.get(`/transactions/user-transactions/${companyId}`);
      return response.data;
    },
    keepPreviousData: true,
  });

  const transactions = transactionsData?.transactions || [];
  const success = transactionsData?.success || false;

  // Calculate statistics
  const calculateStats = () => {
    if (!transactions.length) return {};
    
    let totalSent = 0;
    let totalReceived = 0;
    let totalScans = 0;
    let totalDeposits = 0;
    
    transactions.forEach(txn => {
      const isSender = txn.sender._id === companyId;
      
      if (txn.type === 'transfer') {
        if (isSender) totalSent += txn.amount;
        else totalReceived += txn.amount;
      } else if (txn.type === 'scan') {
        totalScans += txn.amount;
      } else if (txn.type === 'deposit') {
        totalDeposits += txn.amount;
      }
    });

    return {
      totalSent,
      totalReceived,
      totalScans,
      totalDeposits,
      netFlow: totalReceived - totalSent
    };
  };

  const stats = calculateStats();

  // Filter transactions based on filters
  const filteredTransactions = transactions.filter(txn => {
    // Type filter
    if (filters.type !== 'all' && txn.type !== filters.type) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        txn.description?.toLowerCase().includes(searchLower) ||
        txn.sender?.name?.toLowerCase().includes(searchLower) ||
        txn.sender?.username?.toLowerCase().includes(searchLower) ||
        txn.receiver?.name?.toLowerCase().includes(searchLower) ||
        txn.receiver?.username?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const txnDate = moment(txn.createdAt);
      const [start, end] = filters.dateRange;
      if (!txnDate.isBetween(start, end, 'day', '[]')) return false;
    }
    
    return true;
  });

  // Table columns
  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'date',
      width: 180,
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type, record) => {
        const isSender = record.sender._id === companyId;
        
        const typeConfig = {
          transfer: {
            label: isSender ? 'Sent' : 'Received',
            icon: isSender ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
            color: isSender ? 'volcano' : 'green'
          },
          scan: {
            label: 'QR Scan',
            icon: <QrcodeOutlined />,
            color: 'blue'
          },
          deposit: {
            label: 'Deposit',
            icon: <BankOutlined />,
            color: 'purple'
          }
        };
        
        const config = typeConfig[type] || { label: type, icon: null, color: 'default' };
        
        return (
          <Tag 
            icon={config.icon} 
            color={config.color}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            {config.label}
          </Tag>
        );
      },
      filters: [
        { text: 'Sent', value: 'transfer:sent' },
        { text: 'Received', value: 'transfer:received' },
        { text: 'QR Scan', value: 'scan' },
        { text: 'Deposit', value: 'deposit' },
      ],
      onFilter: (value, record) => {
        if (value === 'transfer:sent') {
          return record.type === 'transfer' && record.sender._id === companyId;
        }
        if (value === 'transfer:received') {
          return record.type === 'transfer' && record.receiver._id === companyId;
        }
        return record.type === value;
      },
    },
    {
      title: 'From / To',
      dataIndex: 'sender',
      key: 'participant',
      width: 200,
      render: (sender, record) => {
        const isSender = sender._id === companyId;
        const otherParty = isSender ? record.receiver : sender;
        
        return (
          <div className="flex items-center space-x-2">
            <Avatar 
              size="small" 
              style={{ 
                backgroundColor: isSender ? '#f56a00' : '#7265e6',
                fontSize: '12px'
              }}
            >
              {otherParty.name?.charAt(0) || otherParty.username?.charAt(0) || 'U'}
            </Avatar>
            <div>
              <div className="font-medium text-sm">
                {otherParty.name || otherParty.username || 'Unknown User'}
              </div>
              <div className="text-xs text-gray-500">
                {otherParty.role ? `${otherParty.role.charAt(0).toUpperCase() + otherParty.role.slice(1)}` : 'User'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => (
        <Tooltip title={desc}>
          <span className="text-sm">{desc || 'No description'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount, record) => {
        const isSender = record.sender._id === companyId;
        const isCredit = record.type === 'scan' || record.type === 'deposit' || !isSender;
        
        return (
          <div className={`text-right ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
            <span className="font-bold text-lg">
              {isCredit ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
            </span>
            <div className="text-xs text-gray-500">
              {isCredit ? 'Credit' : 'Debit'}
            </div>
          </div>
        );
      },
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetails(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // Handlers
  const handleTypeFilter = (value) => {
    setFilters(prev => ({ ...prev, type: value }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleDateRange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const handleViewDetails = (transaction) => {
    // Implement modal or detail view
    console.log('View transaction:', transaction);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Export transactions');
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isError) {
    return (
      <div className="p-6">
        <Alert
          message="Error Loading Transactions"
          description={error?.message || 'Failed to load transaction history'}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={3} className="mb-2">Company Wallet Transactions</Title>
            <Text type="secondary">
              Monitor all financial transactions for your company
            </Text>
          </div>
          <div className="flex space-x-2">
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              disabled={!transactions.length}
            >
              Export
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Sent"
                value={stats.totalSent}
                precision={2}
                prefix="₹"
                valueStyle={{ color: '#cf1322' }}
             
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Received"
                value={stats.totalReceived}
                precision={2}
                prefix="₹"
                valueStyle={{ color: '#3f8600' }}
       
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="QR Scan Revenue"
                value={stats.totalScans}
                precision={2}
                prefix="₹"
                valueStyle={{ color: '#1890ff' }}
              
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Net Flow"
                value={stats.netFlow}
                precision={2}
                prefix="₹"
                valueStyle={{ color: stats.netFlow >= 0 ? '#3f8600' : '#cf1322' }}
              />
              <div className="mt-2 text-sm text-gray-500">
                {stats.netFlow >= 0 ? 'Positive' : 'Negative'} balance
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card bordered={false} className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <Search
                placeholder="Search by description or user..."
                allowClear
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex space-x-4">
              <Select
                placeholder="Filter by type"
                style={{ width: 150 }}
                value={filters.type}
                onChange={handleTypeFilter}
              >
                <Option value="all">All Types</Option>
                <Option value="transfer">Transfers</Option>
                <Option value="scan">QR Scans</Option>
                <Option value="deposit">Deposits</Option>
              </Select>
              
              <RangePicker
                placeholder={['Start Date', 'End Date']}
                onChange={handleDateRange}
                style={{ width: 250 }}
              />
              
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setFilters({
                  type: 'all',
                  search: '',
                  dateRange: null,
                  page: 1,
                  limit: 10
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card 
          bordered={false} 
          className="shadow-lg"
          title={
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                Transaction History {filteredTransactions.length > 0 && 
                  <span className="text-gray-500 text-sm ml-2">
                    ({filteredTransactions.length} records)
                  </span>
                }
              </span>
              {isLoading && <Spin size="small" />}
            </div>
          }
        >
          {filteredTransactions.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredTransactions}
              rowKey="_id"
              loading={isLoading}
              pagination={{
                pageSize: filters.limit,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} transactions`,
              }}
              scroll={{ x: 800 }}
              size="middle"
            />
          ) : (
            <div className="text-center py-12">
              {isLoading ? (
                <Spin size="large" />
              ) : (
                <>
                  <div className="text-4xl mb-4">📊</div>
                  <Title level={4} className="mb-2">No Transactions Found</Title>
                  <Text type="secondary">
                    {transactions.length === 0 
                      ? "No transactions have been made yet." 
                      : "No transactions match your filters."}
                  </Text>
                  {transactions.length === 0 ? (
                    <div className="mt-4">
                      <Button type="primary">
                        Create First Transaction
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Button onClick={() => setFilters({
                        type: 'all',
                        search: '',
                        dateRange: null,
                        page: 1,
                        limit: 10
                      })}>
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <Card bordered={false} className="mt-6 shadow-sm">
            <Title level={5} className="mb-4">Summary</Title>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {filteredTransactions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Transactions</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{filteredTransactions
                      .filter(t => t.type === 'scan' || t.type === 'deposit' || t.receiver._id === companyId)
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-600">Total Credits</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    ₹{filteredTransactions
                      .filter(t => t.type === 'transfer' && t.sender._id === companyId)
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-600">Total Debits</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ₹{filteredTransactions
                      .reduce((sum, t) => {
                        const isCredit = t.type === 'scan' || t.type === 'deposit' || t.receiver._id === companyId;
                        return isCredit ? sum + t.amount : sum - t.amount;
                      }, 0)
                      .toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-600">Net Total</div>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyWalletTransactions;