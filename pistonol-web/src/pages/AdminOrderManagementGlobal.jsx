// // components/AdminOrderManagementGlobal.jsx
// import React, { useState } from 'react';
// import {
//   Table,
//   Card,
//   Button,
//   Tag,
//   Modal,
//   Form,
//   Input,
//   Select,
//   message,
//   Space,
//   Descriptions,
//   Badge,
//   Row,
//   Col,
//   Statistic
// } from 'antd';
// import {
//   EyeOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
//   TruckOutlined,
//   CheckSquareOutlined,
//   ReloadOutlined,
//   UserOutlined,
//   ShoppingCartOutlined
// } from '@ant-design/icons';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axios from '../axiosConfig';

// const { Option } = Select;
// const { TextArea } = Input;

// const AdminOrderManagementGlobal = ({ 
//   userType = 'distributor',
//   title = 'Orders Management'
// }) => {
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [statusModalVisible, setStatusModalVisible] = useState(false);
//   const [detailModalVisible, setDetailModalVisible] = useState(false);
//   const [adminNotes, setAdminNotes] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState('');
//   const [filters, setFilters] = useState({
//     status: '',
//     month: ''
//   });

//   const queryClient = useQueryClient();

//   // User type configuration
//   const userTypeConfig = {
//     distributor: {
//       title: 'Distributor Orders',
//       icon: '🏢',
//       color: 'blue'
//     },
//     dealer: {
//       title: 'Dealer Orders', 
//       icon: '🏪',
//       color: 'green'
//     },
//     mechanic: {
//       title: 'Mechanic Orders',
//       icon: '🔧',
//       color: 'orange'
//     },
//     'company-employee': {
//       title: 'Employee Orders',
//       icon: '👨‍💼',
//       color: 'purple'
//     }
//   };

//   const config = userTypeConfig[userType] || userTypeConfig.distributor;

//   // Fetch orders for specific user type
//   const { 
//     data: orders, 
//     isLoading, 
//     error,
//     refetch 
//   } = useQuery({
//     queryKey: ['adminOrders', userType, filters],
//     queryFn: async () => {
//       const params = new URLSearchParams();
//       if (filters.status) params.append('status', filters.status);
//       if (filters.month) params.append('month', filters.month);
//       params.append('role', userType);
      
//       const response = await axios.get(`/orders/all-targets?${params.toString()}`);
//       return response.data.targets || response.data.data || [];
//     }
//   });

//   // Status update mutation
//   const updateStatusMutation = useMutation({
//     mutationFn: async ({ orderId, status, notes }) => {
//       const response = await axios.put(`/orders/${orderId}/status`, {
//         orderId,
//         status,
//         adminNotes: notes
//       });
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(['adminOrders', userType]);
//       setStatusModalVisible(false);
//       setSelectedOrder(null);
//       setAdminNotes('');
//       message.success('Order status updated successfully!');
//     },
//     onError: (error) => {
//       message.error(error.response?.data?.message || 'Failed to update status');
//     }
//   });

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'orange',
//       approved: 'green',
//       rejected: 'red',
//       shipped: 'blue',
//       delivered: 'purple'
//     };
//     return colors[status] || 'default';
//   };

//   const getStatusActions = (status) => {
//     const actions = {
//       pending: [
//         { status: 'approved', label: 'Approve', icon: <CheckCircleOutlined />, type: 'primary' },
//         { status: 'rejected', label: 'Reject', icon: <CloseCircleOutlined />, danger: true }
//       ],
//       approved: [
//         { status: 'shipped', label: 'Mark Shipped', icon: <TruckOutlined />, type: 'primary' }
//       ],
//       shipped: [
//         { status: 'delivered', label: 'Mark Delivered', icon: <CheckSquareOutlined />, type: 'primary' }
//       ]
//     };
//     return actions[status] || [];
//   };

//   const handleStatusUpdate = (order, status) => {
//     setSelectedOrder(order);
//     setSelectedStatus(status);
//     setStatusModalVisible(true);
//   };

//   const confirmStatusUpdate = () => {
//     if (!selectedOrder) return;

//     Modal.confirm({
//       title: 'Confirm Status Update',
//       content: `Are you sure you want to change order #${selectedOrder.orderNumber} status to ${selectedStatus}?`,
//       onOk: () => updateStatusMutation.mutate({
//         orderId: selectedOrder._id,
//         status: selectedStatus,
//         notes: adminNotes
//       })
//     });
//   };

//   const showOrderDetails = (order) => {
//     setSelectedOrder(order);
//     setDetailModalVisible(true);
//   };

//   // Calculate statistics
//   const stats = {
//     total: orders?.length || 0,
//     pending: orders?.filter(order => order.status === 'pending').length || 0,
//     approved: orders?.filter(order => order.status === 'approved').length || 0,
//     shipped: orders?.filter(order => order.status === 'shipped').length || 0,
//     delivered: orders?.filter(order => order.status === 'delivered').length || 0,
//     totalRevenue: orders
//       ?.filter(order => order.status === 'delivered')
//       .reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0
//   };

//   const columns = [
//     {
//       title: 'Order Number',
//       dataIndex: 'orderNumber',
//       key: 'orderNumber',
//       render: (text) => <strong>#{text}</strong>,
//       width: 150
//     },
//     {
//       title: `${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
//       dataIndex: 'userId',
//       key: 'user',
//       render: (user) => (
//         <div>
//           <div><strong>{user?.name}</strong></div>
//           <div style={{ color: '#666', fontSize: '12px' }}>
//             {user?.businessName} • {user?.username}
//           </div>
//           <div style={{ color: '#999', fontSize: '11px' }}>{user?.mobile}</div>
//         </div>
//       )
//     },
//     {
//       title: 'Items',
//       dataIndex: 'items',
//       key: 'items',
//       render: (items) => (
//         <div>
//           {items?.slice(0, 2).map((item, index) => (
//             <div key={index} style={{ fontSize: '12px' }}>
//               • {item.product?.name} (x{item.quantity})
//             </div>
//           ))}
//           {items?.length > 2 && (
//             <div style={{ fontSize: '11px', color: '#666' }}>
//               +{items.length - 2} more items
//             </div>
//           )}
//         </div>
//       )
//     },
//     {
//       title: 'Total Amount',
//       dataIndex: 'totalAmount',
//       key: 'totalAmount',
//       render: (amount) => `₹${amount?.toLocaleString()}`,
//       width: 120
//     },
//     {
//       title: 'Payment Method',
//       dataIndex: 'paymentMethod',
//       key: 'paymentMethod',
//       render: (method) => (
//         <Tag color={method === 'reward-payment' ? 'purple' : 'blue'}>
//           {method === 'reward-payment' ? 'Reward Points' : 'Cash on Delivery'}
//         </Tag>
//       ),
//       width: 140
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status) => (
//         <Badge 
//           status={getStatusColor(status)} 
//           text={
//             <Tag 
//               color={getStatusColor(status)}
//               style={{ textTransform: 'capitalize', fontWeight: '500' }}
//             >
//               {status}
//             </Tag>
//           } 
//         />
//       ),
//       width: 120
//     },
//     {
//       title: 'Order Date',
//       dataIndex: 'createdAt',
//       key: 'createdAt',
//       render: (date) => new Date(date).toLocaleDateString('en-IN'),
//       width: 110
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       fixed: 'right',
//       width: 200,
//       render: (_, record) => (
//         <Space size="small">
//           <Button 
//             icon={<EyeOutlined />} 
//             size="small"
//             onClick={() => showOrderDetails(record)}
//           >
//             View
//           </Button>
          
//           {getStatusActions(record.status).map((action, index) => (
//             <Button 
//               key={index}
//               type={action.type}
//               danger={action.danger}
//               size="small"
//               icon={action.icon}
//               onClick={() => handleStatusUpdate(record, action.status)}
//               loading={updateStatusMutation.isLoading}
//             >
//               {action.label}
//             </Button>
//           ))}
//         </Space>
//       )
//     }
//   ];

//   return (
//     <div>
//       {/* Header with Stats */}
//       <Card>
//         <Row gutter={16}>
//           <Col span={3}>
//             <Statistic 
//               title={`Total ${config.title}`} 
//               value={stats.total}
//               prefix={config.icon}
//             />
//           </Col>
//           <Col span={3}>
//             <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#faad14' }} />
//           </Col>
//           <Col span={3}>
//             <Statistic title="Approved" value={stats.approved} valueStyle={{ color: '#52c41a' }} />
//           </Col>
//           <Col span={3}>
//             <Statistic title="Shipped" value={stats.shipped} valueStyle={{ color: '#1890ff' }} />
//           </Col>
//           <Col span={3}>
//             <Statistic title="Delivered" value={stats.delivered} valueStyle={{ color: '#722ed1' }} />
//           </Col>
//           <Col span={6}>
//             <Statistic 
//               title="Total Revenue" 
//               value={stats.totalRevenue} 
//               prefix="₹" 
//               valueStyle={{ color: '#cf1322' }}
//             />
//           </Col>
//           <Col span={3}>
//             <Button 
//               icon={<ReloadOutlined />} 
//               onClick={() => refetch()}
//               loading={isLoading}
//             >
//               Refresh
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {/* Filters */}
//       <Card style={{ marginTop: 16 }}>
//         <Space size="large">
//           <Form.Item label="Status Filter" style={{ margin: 0 }}>
//             <Select
//               value={filters.status}
//               onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
//               style={{ width: 150 }}
//               allowClear
//               placeholder="All Status"
//             >
//               <Option value="pending">Pending</Option>
//               <Option value="approved">Approved</Option>
//               <Option value="shipped">Shipped</Option>
//               <Option value="delivered">Delivered</Option>
//               <Option value="rejected">Rejected</Option>
//             </Select>
//           </Form.Item>

//           <Form.Item label="Month" style={{ margin: 0 }}>
//             <Select
//               value={filters.month}
//               onChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
//               style={{ width: 150 }}
//               allowClear
//               placeholder="All Months"
//             >
//               <Option value="2024-01">Jan 2024</Option>
//               <Option value="2024-02">Feb 2024</Option>
//               <Option value="2024-03">Mar 2024</Option>
//               <Option value="2024-04">Apr 2024</Option>
//               <Option value="2024-05">May 2024</Option>
//               <Option value="2024-06">Jun 2024</Option>
//               <Option value="2024-07">Jul 2024</Option>
//               <Option value="2024-08">Aug 2024</Option>
//               <Option value="2024-09">Sep 2024</Option>
//               <Option value="2024-10">Oct 2024</Option>
//               <Option value="2024-11">Nov 2024</Option>
//               <Option value="2024-12">Dec 2024</Option>
//             </Select>
//           </Form.Item>

//           <Button 
//             onClick={() => setFilters({ status: '', month: '' })}
//             disabled={!filters.status && !filters.month}
//           >
//             Clear Filters
//           </Button>
//         </Space>
//       </Card>

//       {/* Orders Table */}
//       <Card 
//         title={
//           <span>
//             <UserOutlined style={{ marginRight: 8, color: config.color }} />
//             {config.title}
//           </span>
//         }
//         style={{ marginTop: 16 }}
//       >
//         <Table
//           columns={columns}
//           dataSource={orders}
//           loading={isLoading}
//           rowKey="_id"
//           scroll={{ x: 1000 }}
//           pagination={{
//             pageSize: 10,
//             showSizeChanger: true,
//             showQuickJumper: true,
//             showTotal: (total, range) => 
//               `${range[0]}-${range[1]} of ${total} orders`
//           }}
//         />
//       </Card>

//       {/* Status Update Modal */}
//       <Modal
//         title={`Update Order Status - #${selectedOrder?.orderNumber}`}
//         open={statusModalVisible}
//         onOk={confirmStatusUpdate}
//         onCancel={() => setStatusModalVisible(false)}
//         confirmLoading={updateStatusMutation.isLoading}
//         okText="Update Status"
//         cancelText="Cancel"
//       >
//         <Form layout="vertical">
//           <Form.Item label="New Status">
//             <Input 
//               value={selectedStatus} 
//               disabled 
//               style={{ textTransform: 'capitalize', fontWeight: 'bold' }}
//             />
//           </Form.Item>
//           <Form.Item label="Admin Notes (Optional)">
//             <TextArea
//               rows={4}
//               value={adminNotes}
//               onChange={(e) => setAdminNotes(e.target.value)}
//               placeholder="Add any notes or comments about this status update..."
//             />
//           </Form.Item>
//         </Form>
//       </Modal>

//       {/* Order Details Modal */}
//       <Modal
//         title={`Order Details - #${selectedOrder?.orderNumber}`}
//         open={detailModalVisible}
//         onCancel={() => setDetailModalVisible(false)}
//         footer={[
//           <Button key="close" onClick={() => setDetailModalVisible(false)}>
//             Close
//           </Button>
//         ]}
//         width={700}
//       >
//         {selectedOrder && (
//           <Descriptions bordered column={2}>
//             <Descriptions.Item label="Order Number" span={2}>
//               <strong>#{selectedOrder.orderNumber}</strong>
//             </Descriptions.Item>
//             <Descriptions.Item label="Customer">
//               <div>
//                 <strong>{selectedOrder.userId?.name}</strong>
//                 <br />
//                 {selectedOrder.userId?.businessName}
//                 <br />
//                 {selectedOrder.userId?.mobile}
//                 <br />
//                 {selectedOrder.userId?.username}
//               </div>
//             </Descriptions.Item>
//             <Descriptions.Item label="Order Details">
//               <div>
//                 <strong>Total: ₹{selectedOrder.totalAmount?.toLocaleString()}</strong>
//                 <br />
//                 Payment: {selectedOrder.paymentMethod === 'reward-payment' ? 'Reward Points' : 'Cash on Delivery'}
//                 <br />
//                 Status: <Tag color={getStatusColor(selectedOrder.status)}>
//                   {selectedOrder.status}
//                 </Tag>
//                 <br />
//                 Date: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
//               </div>
//             </Descriptions.Item>
//             <Descriptions.Item label="Order Items" span={2}>
//               {selectedOrder.items?.map((item, index) => (
//                 <div key={index} style={{ marginBottom: 8 }}>
//                   <strong>{item.product?.name}</strong>
//                   <br />
//                   Quantity: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
//                 </div>
//               ))}
//             </Descriptions.Item>
//             {selectedOrder.distributorNotes && (
//               <Descriptions.Item label="Customer Notes" span={2}>
//                 {selectedOrder.distributorNotes}
//               </Descriptions.Item>
//             )}
//             {selectedOrder.adminNotes && (
//               <Descriptions.Item label="Admin Notes" span={2}>
//                 {selectedOrder.adminNotes}
//               </Descriptions.Item>
//             )}
//           </Descriptions>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default AdminOrderManagementGlobal;



// components/AdminOrderManagementGlobal.jsx
import React, { useState, useMemo } from 'react';
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
  Statistic,
  Tabs,
  DatePicker,
  InputNumber,
  Tooltip,
  Popconfirm,
  Avatar,
  Divider
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  CheckSquareOutlined,
  ReloadOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  FilterOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DollarOutlined,
  ShoppingOutlined,
 
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../axiosConfig';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AdminOrderManagementGlobal = ({ 
  userType = 'all',
  showFilters = true,
  title = 'Orders Management',
  compactMode = false
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    userType: userType !== 'all' ? userType : '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    paymentMethod: ''
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const queryClient = useQueryClient();

  // User type configuration with role-specific details
  const userTypeConfig = {
    distributor: {
      title: 'Distributor Orders',
      icon: '🏢',
      color: 'blue',
      role: 'distributor',
      description: 'Orders from distributors'
    },
    dealer: {
      title: 'Dealer Orders', 
      icon: '🏪',
      color: 'green',
      role: 'dealer',
      description: 'Orders from dealers'
    },
    mechanic: {
      title: 'Mechanic Orders',
      icon: '🔧',
      color: 'orange',
      role: 'mechanic',
      description: 'Orders from mechanics'
    },
    'company-employee': {
      title: 'Employee Orders',
      icon: '👨‍💼',
      color: 'purple',
      role: 'company-employee',
      description: 'Orders from company employees'
    },
    customer: {
      title: 'Customer Orders',
      icon: '👥',
      color: 'cyan',
      role: 'customer',
      description: 'Orders from direct customers'
    },
    all: {
      title: 'All Orders',
      icon: '📦',
      color: 'default',
      role: 'all',
      description: 'All orders across all user types'
    }
  };

  const config = userTypeConfig[userType] || userTypeConfig.all;

  // Fetch orders with filters
  const { 
    data: orders, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['adminOrders', userType, filters, pagination.current],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add all filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      // Add pagination
      params.append('page', pagination.current);
      params.append('limit', pagination.pageSize);
      
      // Add search if present
      if (searchText) params.append('search', searchText);
      
      const response = await axios.get(`/orders/admin/orders?${params.toString()}`);
      
      // Update pagination total
      if (response.data.total) {
        setPagination(prev => ({ ...prev, total: response.data.total }));
      }
      
      return response.data.data || [];
    },
    keepPreviousData: true
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
      toast.success('Order status updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  // Edit order mutation
  const editOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }) => {
      const response = await axios.put(`/orders/${orderId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminOrders', userType]);
      setEditModalVisible(false);
      toast.success('Order updated successfully!');
    }
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await axios.delete(`/orders/${orderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminOrders', userType]);
      toast.success('Order deleted successfully!');
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      shipped: 'blue',
      delivered: 'purple',
      cancelled: 'gray'
    };
    return colors[status] || 'default';
  };

  const getStatusActions = (status) => {
    const actions = {
      pending: [
        { 
          status: 'approved', 
          label: 'Approve', 
          icon: <CheckCircleOutlined />, 
          type: 'primary',
          confirm: true,
          confirmMessage: 'Approve this order?'
        },
        { 
          status: 'rejected', 
          label: 'Reject', 
          icon: <CloseCircleOutlined />, 
          danger: true,
          confirm: true,
          confirmMessage: 'Reject this order?'
        }
      ],
      approved: [
        { 
          status: 'shipped', 
          label: 'Mark Shipped', 
          icon: <TruckOutlined />, 
          type: 'primary',
          confirm: true,
          confirmMessage: 'Mark as shipped?'
        },
        {
          status: 'cancelled',
          label: 'Cancel',
          icon: <CloseCircleOutlined />,
          danger: true,
          confirm: true,
          confirmMessage: 'Cancel this order?'
        }
      ],
      shipped: [
        { 
          status: 'delivered', 
          label: 'Mark Delivered', 
          icon: <CheckSquareOutlined />, 
          type: 'primary',
          confirm: true,
          confirmMessage: 'Mark as delivered?'
        }
      ]
    };
    return actions[status] || [];
  };

  const handleStatusUpdate = (order, status, action) => {
    setSelectedOrder(order);
    setSelectedStatus(status);
    
    if (action?.confirm) {
      
          setStatusModalVisible(true);
        
    } else {
      setStatusModalVisible(true);
    }
  };

  const confirmStatusUpdate = () => {
    if (!selectedOrder) return;

    updateStatusMutation.mutate({
      orderId: selectedOrder._id,
      status: selectedStatus,
      notes: adminNotes
    });
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    editForm.setFieldsValue({
      totalAmount: order.totalAmount,
      adminNotes: order.adminNotes || '',
      userNotes: order.userNotes || ''
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = (values) => {
    editOrderMutation.mutate({
      orderId: editingOrder._id,
      updates: values
    });
  };

  const handleDeleteOrder = (orderId) => {
    deleteOrderMutation.mutate(orderId);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD')
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: '',
        endDate: ''
      }));
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!orders) return {
      total: 0,
      pending: 0,
      approved: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
      averageOrder: 0
    };

    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrder = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

    return {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      approved: orders.filter(order => order.status === 'approved').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: deliveredOrders.length,
      cancelled: orders.filter(order => order.status === 'cancelled' || order.status === 'rejected').length,
      totalRevenue,
      averageOrder
    };
  }, [orders]);

  const columns = [
    {
      title: 'Order Info',
      dataIndex: 'orderNumber',
      key: 'orderInfo',
      fixed: 'left',
      width: 180,
      render: (text, record) => (
        <div>
          <div><strong>#{text}</strong></div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {dayjs(record.createdAt).format('DD/MM/YYYY')}
          </div>
          {record.userType !== 'customer' && (
            <Tag color={config.color} style={{ fontSize: '10px', marginTop: 2 }}>
              {record.userType}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Customer',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              style={{ backgroundColor: config.color }}
            />
            <div>
              <div><strong>{user?.name || 'N/A'}</strong></div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {user?.businessName || user?.username}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>
                {user?.mobile} • {user?.role}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 200,
      render: (items) => (
        <div>
          {items?.slice(0, 3).map((item, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: 2 }}>
              <div>• {item.product?.name || 'Unknown'}</div>
              <div style={{ fontSize: '11px', color: '#666', marginLeft: 10 }}>
                Qty: {item.quantity} × ₹{item.price}
              </div>
            </div>
          ))}
          {items?.length > 3 && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
              +{items.length - 3} more items
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <div>
          <div><strong>₹{amount?.toLocaleString()}</strong></div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {record.paymentMethod === 'reward-payment' ? 'Reward' : 'COD'}
          </div>
        </div>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status, record) => (
        <div>
          <Badge 
            status={getStatusColor(status)} 
            text={
              <Tag 
                color={getStatusColor(status)}
                style={{ 
                  textTransform: 'capitalize', 
                  fontWeight: '500',
                  fontSize: '12px',
                  padding: '2px 8px'
                }}
              >
                {status}
              </Tag>
            } 
          />
          {record.adminNotes && (
            <Tooltip title={record.adminNotes}>
              <FileTextOutlined style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }} />
            </Tooltip>
          )}
        </div>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Cancelled', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => showOrderDetails(record)}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <Tooltip title="Edit">
              <Button 
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEditOrder(record)}
              />
            </Tooltip>
          )}
          
          {getStatusActions(record.status).map((action, index) => (
            <Tooltip key={index} title={action.label}>
              <Button 
                type={action.type}
                danger={action.danger}
                size="small"
                icon={action.icon}
                onClick={() => handleStatusUpdate(record, action.status, action)}
                loading={updateStatusMutation.isPending}
              />
            </Tooltip>
          ))}
          
          {record.status === 'pending' && (
            <Popconfirm
              title="Delete this order?"
              description="Are you sure you want to delete this pending order?"
              onConfirm={() => handleDeleteOrder(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button 
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  if (compactMode) {
    return (
      <Card 
        title={
          <span>
            <ShoppingOutlined style={{ marginRight: 8, color: config.color }} />
            {config.title} ({stats.total})
          </span>
        }
        size="small"
      >
        <Table
          columns={columns}
          dataSource={orders}
          loading={isLoading}
          rowKey="_id"
          size="small"
          pagination={{
            size: 'small',
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total}`
          }}
          onChange={(pagination) => setPagination(pagination)}
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Header Stats Card */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic 
                title="Total Orders" 
                value={stats.total}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: config.color }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic 
                title="Pending" 
                value={stats.pending} 
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic 
                title="Revenue" 
                value={stats.totalRevenue} 
                prefix="₹"
                valueStyle={{ color: '#52c41a' }}
              
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic 
                title="Delivered" 
                value={stats.delivered} 
                valueStyle={{ color: '#722ed1' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Filters Card */}
      {showFilters && (
        <Card 
          title={
            <span>
              <FilterOutlined /> Filters
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search order/customer..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={() => refetch()}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                style={{ width: '100%' }}
                allowClear
                placeholder="All Status"
              >
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="shipped">Shipped</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                value={filters.paymentMethod}
                onChange={(value) => handleFilterChange('paymentMethod', value)}
                style={{ width: '100%' }}
                allowClear
                placeholder="Payment Method"
              >
                <Option value="cod">Cash on Delivery</Option>
                <Option value="reward-payment">Reward Points</Option>
                <Option value="online">Online Payment</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
              />
            </Col>
            {userType === 'all' && (
              <Col xs={24} sm={12} md={6}>
                <Select
                  value={filters.userType}
                  onChange={(value) => handleFilterChange('userType', value)}
                  style={{ width: '100%' }}
                  allowClear
                  placeholder="All User Types"
                >
                  <Option value="distributor">Distributor</Option>
                  <Option value="dealer">Dealer</Option>
                  <Option value="mechanic">Mechanic</Option>
                  <Option value="company-employee">Employee</Option>
                  <Option value="customer">Customer</Option>
                </Select>
              </Col>
            )}
            <Col xs={24} sm={12} md={6}>
              <Input.Group compact>
                <InputNumber
                  style={{ width: '45%' }}
                  placeholder="Min Amount"
                  value={filters.minAmount}
                  onChange={(value) => handleFilterChange('minAmount', value)}
                />
                <InputNumber
                  style={{ width: '45%' }}
                  placeholder="Max Amount"
                  value={filters.maxAmount}
                  onChange={(value) => handleFilterChange('maxAmount', value)}
                />
              </Input.Group>
            </Col>
            <Col xs={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => refetch()} icon={<ReloadOutlined />}>
                  Refresh
                </Button>
                <Button 
                  onClick={() => {
                    setFilters({
                      status: '',
                      userType: userType !== 'all' ? userType : '',
                      startDate: '',
                      endDate: '',
                      minAmount: '',
                      maxAmount: '',
                      paymentMethod: ''
                    });
                    setSearchText('');
                    setPagination({ current: 1, pageSize: 10, total: 0 });
                  }}
                >
                  Clear All
                </Button>
                <Button type="primary" icon={<DownloadOutlined />}>
                  Export
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Orders Table */}
      <Card 
        title={
          <span>
            {config.icon} {config.title}
            <span style={{ fontSize: '14px', color: '#666', marginLeft: 8 }}>
              ({stats.total} orders)
            </span>
          </span>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refetch}
            loading={isLoading}
            size="small"
          >
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          loading={isLoading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} orders`,
            pageSizeOptions: ['10', '25', '50', '100']
          }}
          onChange={(pagination) => setPagination(pagination)}
        />
      </Card>

      {/* Status Update Modal */}
      <Modal
        title={
          <span>
            Update Status for Order <strong>#{selectedOrder?.orderNumber}</strong>
          </span>
        }
        open={statusModalVisible}
        onOk={confirmStatusUpdate}
        onCancel={() => setStatusModalVisible(false)}
        confirmLoading={updateStatusMutation.isPending}
        okText="Update Status"
        cancelText="Cancel"
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Current Status">
            <Input 
              value={selectedOrder?.status} 
              disabled 
              style={{ 
                textTransform: 'capitalize', 
                fontWeight: 'bold',
                color: getStatusColor(selectedOrder?.status)
              }}
            />
          </Form.Item>
          <Form.Item label="New Status">
            <Input 
              value={selectedStatus} 
              disabled 
              style={{ 
                textTransform: 'capitalize', 
                fontWeight: 'bold',
                color: getStatusColor(selectedStatus)
              }}
            />
          </Form.Item>
          <Form.Item label="Admin Notes (Optional)">
            <TextArea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes or comments about this status update..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        title={
          <span>
            Order Details: <strong>#{selectedOrder?.orderNumber}</strong>
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Order Number" span={2}>
                <Tag color="blue">#{selectedOrder.orderNumber}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Customer Information">
                <div>
                  <strong>{selectedOrder.user?.name || 'N/A'}</strong>
                  <br />
                  <small>@{selectedOrder.user?.username}</small>
                  <br />
                  {selectedOrder.user?.businessName && (
                    <>
                      <strong>Business:</strong> {selectedOrder.user.businessName}
                      <br />
                    </>
                  )}
                  <strong>Mobile:</strong> {selectedOrder.user?.mobile}
                  <br />
                  <strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}
                  <br />
                  <Tag color={config.color}>{selectedOrder.userType}</Tag>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Order Information">
                <div>
                  <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount?.toLocaleString()}
                  <br />
                  <strong>Payment Method:</strong> 
                  <Tag color={selectedOrder.paymentMethod === 'reward-payment' ? 'purple' : 'blue'}>
                    {selectedOrder.paymentMethod === 'reward-payment' ? 'Reward Points' : 'Cash on Delivery'}
                  </Tag>
                  <br />
                  <strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedOrder.status)} style={{ marginLeft: 8 }}>
                    {selectedOrder.status}
                  </Tag>
                  <br />
                  <strong>Order Date:</strong> {dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}
                  {selectedOrder.approvedAt && (
                    <>
                      <br />
                      <strong>Approved:</strong> {dayjs(selectedOrder.approvedAt).format('DD/MM/YYYY HH:mm')}
                    </>
                  )}
                  {selectedOrder.deliveredAt && (
                    <>
                      <br />
                      <strong>Delivered:</strong> {dayjs(selectedOrder.deliveredAt).format('DD/MM/YYYY HH:mm')}
                    </>
                  )}
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Shipping Address" span={2}>
                {selectedOrder.shippingAddress || selectedOrder.user?.address || 'No address provided'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Order Items</Divider>
            
            <Table
              dataSource={selectedOrder.items}
              rowKey={(record, index) => index}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Product',
                  dataIndex: ['product', 'name'],
                  key: 'product',
                  render: (text, record) => (
                    <div>
                      <strong>{text || 'Unknown Product'}</strong>
                      {record.product?.category && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {record.product.category}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 100
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => `₹${price}`,
                  width: 100
                },
                {
                  title: 'Subtotal',
                  key: 'subtotal',
                  render: (_, record) => `₹${record.quantity * record.price}`,
                  width: 100
                }
              ]}
              summary={(pageData) => {
                const total = pageData.reduce((sum, record) => sum + record.quantity * record.price, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2}>
                      <strong>₹{total}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />

            {(selectedOrder.userNotes || selectedOrder.adminNotes) && (
              <>
                <Divider>Notes</Divider>
                {selectedOrder.userNotes && (
                  <Card size="small" title="Customer Notes" style={{ marginBottom: 16 }}>
                    {selectedOrder.userNotes}
                  </Card>
                )}
                {selectedOrder.adminNotes && (
                  <Card size="small" title="Admin Notes">
                    {selectedOrder.adminNotes}
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        title={`Edit Order #${editingOrder?.orderNumber}`}
        open={editModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={editOrderMutation.isLoading}
        okText="Save Changes"
        cancelText="Cancel"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            label="Total Amount"
            name="totalAmount"
            rules={[{ required: true, message: 'Please enter total amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="₹"
              min={0}
              step={100}
            />
          </Form.Item>
          
          <Form.Item
            label="User Notes"
            name="userNotes"
          >
            <TextArea rows={3} placeholder="Customer notes" />
          </Form.Item>
          
          <Form.Item
            label="Admin Notes"
            name="adminNotes"
          >
            <TextArea rows={3} placeholder="Admin notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminOrderManagementGlobal;