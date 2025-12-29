import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Input, Select, Button, Space, Tooltip, Statistic, Row, Col, Modal } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from '../../axiosConfig';

const { Option } = Select;

const AllOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    paymentMethod: 'all',
    userType: 'all',
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pending: 0,
    approved: 0,
    delivered: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await axios.get('/ordersforDM/all', { params });
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination({
          ...pagination,
          total: response.data.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/orders/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Load data on component mount and when filters/pagination changes
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      ...newPagination,
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to page 1
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      paymentMethod: 'all',
      userType: 'all',
    });
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      shipped: 'blue',
      delivered: 'purple',
      rejected: 'red',
    };
    return colors[status] || 'default';
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  // Columns configuration
  const columns = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      fixed: 'left',
      render: (orderNumber) => (
        <div className="font-semibold text-blue-600">{orderNumber}</div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      width: 100,
      render: (date) => (
        <div className="text-sm">
          <CalendarOutlined className="mr-1 text-gray-400" />
          {formatDate(date)}
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Sender',
      dataIndex: 'user',
      key: 'sender',
      width: 180,
      render: (user) => (
        <div>
          <div className="font-medium">{user?.name || user?.username}</div>
          <div className="text-xs text-gray-500">{user?.mobile}</div>
          <div className="text-xs text-gray-400">{user?.role}</div>
        </div>
      ),
    },
    {
      title: 'Receiver',
      dataIndex: 'reciever',
      key: 'receiver',
      width: 180,
      render: (reciever) => (
        <div>
          <div className="font-medium">{reciever?.name || reciever?.username}</div>
          <div className="text-xs text-gray-500">{reciever?.mobile}</div>
          <div className="text-xs text-gray-400">{reciever?.role}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      width: 120,
      render: (amount) => (
        <div className="font-bold text-green-600">
          {formatCurrency(amount)}
        </div>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'payment',
      width: 100,
      render: (method) => (
        <Tag color={method === 'cash-on-delivery' ? 'green' : 'orange'}>
          {method === 'cash-on-delivery' ? 'COD' : 'Wallet'}
        </Tag>
      ),
      filters: [
        { text: 'COD', value: 'cash-on-delivery' },
        { text: 'Wallet', value: 'reward-payment' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="uppercase font-semibold">
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Items',
      key: 'items',
      width: 80,
      render: (_, record) => (
        <div className="text-center font-medium">
          {record.items?.length || 0}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setShowDetails(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  // Order details modal
  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        title={`Order Details - ${selectedOrder.orderNumber}`}
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        width={700}
        footer={null}
      >
        <div className="space-y-4">
          {/* Basic Info */}
          <Card size="small">
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">{formatDate(selectedOrder.createdAt)}</div>
              </Col>
              <Col span={8}>
                <div className="text-sm text-gray-500">Status</div>
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.toUpperCase()}
                </Tag>
              </Col>
              <Col span={8}>
                <div className="text-sm text-gray-500">Payment</div>
                <div className="font-medium">
                  {selectedOrder.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Wallet Payment'}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Users Info */}
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="Sender">
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">
                      {selectedOrder.user?.name || selectedOrder.user?.username}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Mobile</div>
                    <div>{selectedOrder.user?.mobile}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Business</div>
                    <div>{selectedOrder.user?.businessName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Role</div>
                    <div>{selectedOrder.user?.role}</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Receiver">
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">
                      {selectedOrder.reciever?.name || selectedOrder.reciever?.username}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Mobile</div>
                    <div>{selectedOrder.reciever?.mobile}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Business</div>
                    <div>{selectedOrder.reciever?.businessName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Role</div>
                    <div>{selectedOrder.reciever?.role}</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Order Items */}
          <Card size="small" title={`Items (${selectedOrder.items?.length || 0})`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.product?.name || 'Product'}</td>
                    <td className="text-right p-2">{formatCurrency(item.price)}</td>
                    <td className="text-right p-2">{item.quantity}</td>
                    <td className="text-right p-2 font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan="3" className="p-2 text-right">Total Amount:</td>
                  <td className="p-2 text-right text-green-600">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Notes */}
          {(selectedOrder.userNotes || selectedOrder.adminNotes) && (
            <Card size="small" title="Notes">
              <div className="space-y-2">
                {selectedOrder.userNotes && (
                  <div>
                    <div className="text-sm text-gray-500">User Notes</div>
                    <div className="text-sm">{selectedOrder.userNotes}</div>
                  </div>
                )}
                {selectedOrder.adminNotes && (
                  <div>
                    <div className="text-sm text-gray-500">Admin Notes</div>
                    <div className="text-sm text-orange-600">{selectedOrder.adminNotes}</div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <ShoppingCartOutlined className="mr-2 text-blue-500" />
          All Orders
        </h1>
        <p className="text-gray-600">View all orders with pagination and filters</p>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <Statistic
              title="Total Amount"
              value={stats.totalAmount}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <Statistic
              title="Pending Orders"
              value={stats.pending}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <Statistic
              title="Approved Orders"
              value={stats.approved}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Search */}
          <Input
            placeholder="Search by order number, name, or mobile"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-64"
            allowClear
          />

          {/* Status Filter */}
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            className="w-40"
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="rejected">Rejected</Option>
          </Select>

          {/* Payment Method Filter */}
          <Select
            placeholder="Payment Method"
            value={filters.paymentMethod}
            onChange={(value) => handleFilterChange('paymentMethod', value)}
            className="w-40"
          >
            <Option value="all">All Payments</Option>
            <Option value="cash-on-delivery">Cash on Delivery</Option>
            <Option value="reward-payment">Wallet Payment</Option>
          </Select>

          {/* User Type Filter */}
          <Select
            placeholder="User Type"
            value={filters.userType}
            onChange={(value) => handleFilterChange('userType', value)}
            className="w-40"
          >
            <Option value="all">All Users</Option>
            <Option value="distributor">Distributor</Option>
            <Option value="dealer">Dealer</Option>
            <Option value="mechanic">Mechanic</Option>
            <Option value="company-employee">Company Employee</Option>
          </Select>

          {/* Action Buttons */}
          <Space>
            <Button 
              icon={<FilterOutlined />}
              onClick={fetchOrders}
              loading={loading}
            >
              Apply Filters
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </Space>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <div>
            Showing {pagination.total > 0 ? ((pagination.current - 1) * pagination.pageSize) + 1 : 0} 
            {' to '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} 
            {' of '} {pagination.total} orders
          </div>
          <div>
            Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => (
              <div className="text-sm">
                Showing {range[0]}-{range[1]} of {total} orders
              </div>
            ),
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
          className="shadow-sm"
        />
      </Card>

      {/* Order Details Modal */}
      {renderOrderDetails()}
    </div>
  );
};

export default AllOrdersView;