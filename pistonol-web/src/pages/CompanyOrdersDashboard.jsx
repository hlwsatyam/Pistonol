import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Select,
  Input,
  Tag,
  Space,
  Descriptions,
  message,
  Divider
} from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  TruckOutlined,
 
  SubnodeOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';

const { Option } = Select;
const { TextArea } = Input;

const AdminOrders = () => {
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusForm] = Form.useForm();
 

  // Fetch all orders for admin
  const { data: ordersData,refetch, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await axios.get('/orders/admin');
      return response.data;
    }
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, statusData }) => {
      const response = await axios.put(`/orders/${orderId}/status`, statusData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Order status updated successfully!');
      setIsStatusModalVisible(false);
      statusForm.resetFields();
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  });

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Distributor',
      dataIndex: ['distributor', 'businessName'],
      key: 'distributor',
      render: (businessName, record) => businessName || record?.distributor?.username,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount}`,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color={method === 'cash-on-delivery' ? 'blue' : 'green'}>
          {method === 'cash-on-delivery' ? 'Cash on Delivery' : 'Reward Payment'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Pending' },
          approved: { color: 'green', text: 'Approved' },
          rejected: { color: 'red', text: 'Rejected' },
          shipped: { color: 'blue', text: 'Shipped' },
          delivered: { color: 'purple', text: 'Delivered' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record, 'approved')}
                style={{ color: '#52c41a' }}
              >
                Approve
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                onClick={() => handleStatusChange(record, 'rejected')}
                style={{ color: '#ff4d4f' }}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              icon={<TruckOutlined />}
              onClick={() => handleStatusChange(record, 'shipped')}
            >
              Ship
            </Button>
          )}
          {record.status === 'shipped' && (
            <Button
              type="link"
              icon={<SubnodeOutlined />}
              onClick={() => handleStatusChange(record, 'delivered')}
            >
              Deliver
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalVisible(true);
  };

  const handleStatusChange = (order, status) => {
    setSelectedOrder(order);
    
    if (status === 'rejected') {
      setIsStatusModalVisible(true);
      statusForm.setFieldsValue({ status, adminNotes: '' });
    } else {
      updateStatusMutation.mutate({
        orderId: order._id,
        statusData: { status }
      });
    }
  };

  const handleStatusUpdate = (values) => {
    updateStatusMutation.mutate({
      orderId: selectedOrder._id,
      statusData: values
    });
  };

  const getStatusActions = (status) => {
    const actions = {
      pending: ['approve', 'reject'],
      approved: ['ship'],
      shipped: ['deliver'],
      rejected: [],
      delivered: []
    };
    return actions[status] || [];
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Order Management">
        <Table  scroll={{x:true}}
          columns={columns}
          dataSource={ordersData?.data || []}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      {/* View Order Modal */}
      <Modal
        title={`Order Details - ${selectedOrder?.orderNumber}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Order Number" span={2}>
              {selectedOrder.orderNumber}
            </Descriptions.Item>
            
            <Descriptions.Item label="Distributor">
              {selectedOrder?.distributor?.businessName || selectedOrder?.distributor?.username}
            </Descriptions.Item>
            
            <Descriptions.Item label="Contact">
              {selectedOrder.distributor.mobile}
              {selectedOrder.distributor.email && ` | ${selectedOrder.distributor.email}`}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag color={
                selectedOrder.status === 'pending' ? 'orange' :
                selectedOrder.status === 'approved' ? 'green' :
                selectedOrder.status === 'rejected' ? 'red' :
                selectedOrder.status === 'shipped' ? 'blue' : 'purple'
              }>
                {selectedOrder.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Total Amount">
              ₹{selectedOrder.totalAmount}
            </Descriptions.Item>

            <Descriptions.Item label="Payment Method">
              {selectedOrder.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Reward Payment'}
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </Descriptions.Item>

            {selectedOrder.approvedBy && (
              <Descriptions.Item label="Approved By">
                {selectedOrder.approvedBy.username}
              </Descriptions.Item>
            )}

            {selectedOrder.distributorNotes && (
              <Descriptions.Item label="Distributor Notes" span={2}>
                {selectedOrder.distributorNotes}
              </Descriptions.Item>
            )}

            {selectedOrder.adminNotes && (
              <Descriptions.Item label="Admin Notes" span={2}>
                {selectedOrder.adminNotes}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Order Items" span={2}>
              <Table
                size="small"
                dataSource={selectedOrder.items}
                pagination={false}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: ['product', 'name'],
                    key: 'product',
                  },
                  {
                    title: 'Category',
                    dataIndex: ['product', 'category'],
                    key: 'category',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `₹${price}`,
                  },
                  {
                    title: 'Subtotal',
                    key: 'subtotal',
                    render: (_, record) => `₹${record.price * record.quantity}`,
                  },
                ]}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title={`Reject Order - ${selectedOrder?.orderNumber}`}
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={null}
      >
        <Form form={statusForm} onFinish={handleStatusUpdate} layout="vertical">
          <Form.Item
            name="adminNotes"
            label="Rejection Reason"
            rules={[{ required: true, message: 'Please provide a rejection reason' }]}
          >
            <TextArea
              rows={4}
              placeholder="Please explain why this order is being rejected..."
            />
          </Form.Item>

          <Form.Item name="status" hidden>
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateStatusMutation.isLoading}
                danger
              >
                Reject Order
              </Button>
              <Button onClick={() => setIsStatusModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminOrders;