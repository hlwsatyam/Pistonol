// components/AdminOrderManagementGlobal.jsx
import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Descriptions,
  Badge,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  CheckSquareOutlined,
  ReloadOutlined,
  UserOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../axiosConfig';

const { Option } = Select;
const { TextArea } = Input;

const AdminOrderManagementGlobal = ({ 
  userType = 'distributor',
  title = 'Orders Management'
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    month: ''
  });

  const queryClient = useQueryClient();

  // User type configuration
  const userTypeConfig = {
    distributor: {
      title: 'Distributor Orders',
      icon: '🏢',
      color: 'blue'
    },
    dealer: {
      title: 'Dealer Orders', 
      icon: '🏪',
      color: 'green'
    },
    mechanic: {
      title: 'Mechanic Orders',
      icon: '🔧',
      color: 'orange'
    },
    'company-employee': {
      title: 'Employee Orders',
      icon: '👨‍💼',
      color: 'purple'
    }
  };

  const config = userTypeConfig[userType] || userTypeConfig.distributor;

  // Fetch orders for specific user type
  const { 
    data: orders, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['adminOrders', userType, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.month) params.append('month', filters.month);
      params.append('role', userType);
      
      const response = await axios.get(`/orders/all-targets?${params.toString()}`);
      return response.data.targets || response.data.data || [];
    }
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }) => {
      const response = await axios.put(`/orders/${orderId}/status`, {
        orderId,
        status,
        adminNotes: notes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminOrders', userType]);
      setStatusModalVisible(false);
      setSelectedOrder(null);
      setAdminNotes('');
      message.success('Order status updated successfully!');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      shipped: 'blue',
      delivered: 'purple'
    };
    return colors[status] || 'default';
  };

  const getStatusActions = (status) => {
    const actions = {
      pending: [
        { status: 'approved', label: 'Approve', icon: <CheckCircleOutlined />, type: 'primary' },
        { status: 'rejected', label: 'Reject', icon: <CloseCircleOutlined />, danger: true }
      ],
      approved: [
        { status: 'shipped', label: 'Mark Shipped', icon: <TruckOutlined />, type: 'primary' }
      ],
      shipped: [
        { status: 'delivered', label: 'Mark Delivered', icon: <CheckSquareOutlined />, type: 'primary' }
      ]
    };
    return actions[status] || [];
  };

  const handleStatusUpdate = (order, status) => {
    setSelectedOrder(order);
    setSelectedStatus(status);
    setStatusModalVisible(true);
  };

  const confirmStatusUpdate = () => {
    if (!selectedOrder) return;

    Modal.confirm({
      title: 'Confirm Status Update',
      content: `Are you sure you want to change order #${selectedOrder.orderNumber} status to ${selectedStatus}?`,
      onOk: () => updateStatusMutation.mutate({
        orderId: selectedOrder._id,
        status: selectedStatus,
        notes: adminNotes
      })
    });
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // Calculate statistics
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(order => order.status === 'pending').length || 0,
    approved: orders?.filter(order => order.status === 'approved').length || 0,
    shipped: orders?.filter(order => order.status === 'shipped').length || 0,
    delivered: orders?.filter(order => order.status === 'delivered').length || 0,
    totalRevenue: orders
      ?.filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <strong>#{text}</strong>,
      width: 150
    },
    {
      title: `${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
      dataIndex: 'userId',
      key: 'user',
      render: (user) => (
        <div>
          <div><strong>{user?.name}</strong></div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {user?.businessName} • {user?.username}
          </div>
          <div style={{ color: '#999', fontSize: '11px' }}>{user?.mobile}</div>
        </div>
      )
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items?.slice(0, 2).map((item, index) => (
            <div key={index} style={{ fontSize: '12px' }}>
              • {item.product?.name} (x{item.quantity})
            </div>
          ))}
          {items?.length > 2 && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              +{items.length - 2} more items
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount?.toLocaleString()}`,
      width: 120
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color={method === 'reward-payment' ? 'purple' : 'blue'}>
          {method === 'reward-payment' ? 'Reward Points' : 'Cash on Delivery'}
        </Tag>
      ),
      width: 140
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={getStatusColor(status)} 
          text={
            <Tag 
              color={getStatusColor(status)}
              style={{ textTransform: 'capitalize', fontWeight: '500' }}
            >
              {status}
            </Tag>
          } 
        />
      ),
      width: 120
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('en-IN'),
      width: 110
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => showOrderDetails(record)}
          >
            View
          </Button>
          
          {getStatusActions(record.status).map((action, index) => (
            <Button 
              key={index}
              type={action.type}
              danger={action.danger}
              size="small"
              icon={action.icon}
              onClick={() => handleStatusUpdate(record, action.status)}
              loading={updateStatusMutation.isLoading}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Header with Stats */}
      <Card>
        <Row gutter={16}>
          <Col span={3}>
            <Statistic 
              title={`Total ${config.title}`} 
              value={stats.total}
              prefix={config.icon}
            />
          </Col>
          <Col span={3}>
            <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Col>
          <Col span={3}>
            <Statistic title="Approved" value={stats.approved} valueStyle={{ color: '#52c41a' }} />
          </Col>
          <Col span={3}>
            <Statistic title="Shipped" value={stats.shipped} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={3}>
            <Statistic title="Delivered" value={stats.delivered} valueStyle={{ color: '#722ed1' }} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Total Revenue" 
              value={stats.totalRevenue} 
              prefix="₹" 
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={3}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
              loading={isLoading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginTop: 16 }}>
        <Space size="large">
          <Form.Item label="Status Filter" style={{ margin: 0 }}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              style={{ width: 150 }}
              allowClear
              placeholder="All Status"
            >
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Month" style={{ margin: 0 }}>
            <Select
              value={filters.month}
              onChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
              style={{ width: 150 }}
              allowClear
              placeholder="All Months"
            >
              <Option value="2024-01">Jan 2024</Option>
              <Option value="2024-02">Feb 2024</Option>
              <Option value="2024-03">Mar 2024</Option>
              <Option value="2024-04">Apr 2024</Option>
              <Option value="2024-05">May 2024</Option>
              <Option value="2024-06">Jun 2024</Option>
              <Option value="2024-07">Jul 2024</Option>
              <Option value="2024-08">Aug 2024</Option>
              <Option value="2024-09">Sep 2024</Option>
              <Option value="2024-10">Oct 2024</Option>
              <Option value="2024-11">Nov 2024</Option>
              <Option value="2024-12">Dec 2024</Option>
            </Select>
          </Form.Item>

          <Button 
            onClick={() => setFilters({ status: '', month: '' })}
            disabled={!filters.status && !filters.month}
          >
            Clear Filters
          </Button>
        </Space>
      </Card>

      {/* Orders Table */}
      <Card 
        title={
          <span>
            <UserOutlined style={{ marginRight: 8, color: config.color }} />
            {config.title}
          </span>
        }
        style={{ marginTop: 16 }}
      >
        <Table
          columns={columns}
          dataSource={orders}
          loading={isLoading}
          rowKey="_id"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} orders`
          }}
        />
      </Card>

      {/* Status Update Modal */}
      <Modal
        title={`Update Order Status - #${selectedOrder?.orderNumber}`}
        open={statusModalVisible}
        onOk={confirmStatusUpdate}
        onCancel={() => setStatusModalVisible(false)}
        confirmLoading={updateStatusMutation.isLoading}
        okText="Update Status"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item label="New Status">
            <Input 
              value={selectedStatus} 
              disabled 
              style={{ textTransform: 'capitalize', fontWeight: 'bold' }}
            />
          </Form.Item>
          <Form.Item label="Admin Notes (Optional)">
            <TextArea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes or comments about this status update..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        title={`Order Details - #${selectedOrder?.orderNumber}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Order Number" span={2}>
              <strong>#{selectedOrder.orderNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Customer">
              <div>
                <strong>{selectedOrder.userId?.name}</strong>
                <br />
                {selectedOrder.userId?.businessName}
                <br />
                {selectedOrder.userId?.mobile}
                <br />
                {selectedOrder.userId?.username}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Order Details">
              <div>
                <strong>Total: ₹{selectedOrder.totalAmount?.toLocaleString()}</strong>
                <br />
                Payment: {selectedOrder.paymentMethod === 'reward-payment' ? 'Reward Points' : 'Cash on Delivery'}
                <br />
                Status: <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status}
                </Tag>
                <br />
                Date: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Order Items" span={2}>
              {selectedOrder.items?.map((item, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <strong>{item.product?.name}</strong>
                  <br />
                  Quantity: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                </div>
              ))}
            </Descriptions.Item>
            {selectedOrder.distributorNotes && (
              <Descriptions.Item label="Customer Notes" span={2}>
                {selectedOrder.distributorNotes}
              </Descriptions.Item>
            )}
            {selectedOrder.adminNotes && (
              <Descriptions.Item label="Admin Notes" span={2}>
                {selectedOrder.adminNotes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrderManagementGlobal;