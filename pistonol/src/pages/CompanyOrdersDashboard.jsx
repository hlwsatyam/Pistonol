import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Card, Typography } from 'antd';
import axios from '../axiosConfig';

const { Title } = Typography;
const { Option } = Select;

function CompanyOrdersDashboard() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Fetch pending orders
  const { data: orders, refetch } = useQuery(['company-orders'], async () => {
    const res = await axios.get('/orders/company/pending');
    return res.data;
  });
  
  // Update order status
  const updateOrderStatus = useMutation(async (values) => {
    const res = await axios.patch(`/orders/${selectedOrder._id}/status`, values);
    return res.data;
  }, {
    onSuccess: () => {
      message.success('Order status updated');
      setModalVisible(false);
      refetch();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update order');
    }
  });
  
  const handleApproveReject = (order, status) => {
    setSelectedOrder(order);
    form.setFieldsValue({ status });
    setModalVisible(true);
  };
  
  const onFinish = (values) => {
    updateOrderStatus.mutate(values);
  };
  
  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id.slice(-6).toUpperCase()
    },
    {
      title: 'Dealer',
      dataIndex: ['dealer', 'businessName'],
      key: 'dealer'
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button 
            type="link" 
            onClick={() => handleApproveReject(record, 'approved')}
            style={{ color: 'green' }}
          >
            Approve
          </Button>
          <Button 
            type="link" 
            onClick={() => handleApproveReject(record, 'rejected')}
            danger
          >
            Reject
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <Card>
      <Title level={3}>Pending Orders</Title>
      
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="_id"
      />
      
      <Modal
        title={`${selectedOrder?.status === 'approved' ? 'Approve' : 'Reject'} Order`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {selectedOrder?.status === 'approved' && (
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select placeholder="Select payment method">
                <Option value="wallet">Wallet</Option>
                <Option value="bank-transfer">Bank Transfer</Option>
                <Option value="upi">UPI</Option>
                <Option value="cash">Cash</Option>
              </Select>
            </Form.Item>
          )}
          
          <Form.Item
            name="companyMessage"
            label="Message to Dealer"
            rules={[{ required: true, message: 'Please add a message' }]}
          >
            <Input.TextArea placeholder="Enter message for dealer" />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateOrderStatus.isLoading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default CompanyOrdersDashboard;