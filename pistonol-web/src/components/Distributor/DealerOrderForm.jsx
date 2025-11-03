import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Tag,
  Descriptions,
  Divider,
  Popconfirm
} from 'antd';
import {
  ShoppingCartOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../../axiosConfig';
import { toast } from 'react-hot-toast';

const { Option } = Select;
const { TextArea } = Input;

const DistributorOrders = ({user}) => {
 
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [form] = Form.useForm();
 

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/products');
      return response.data;
    }
  });

  // Fetch distributor orders
  const { data: ordersData, refetch,isLoading } = useQuery({
    queryKey: ['distributor-orders'],
    queryFn: async () => {
      const response = await axios.get(`/orders/distributor?distributorId=${user._id}`);
      return response.data;
    }
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await axios.post('/orders', orderData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Order created successfully!');
      setIsOrderModalVisible(false);
      form.resetFields();
      setSelectedProducts([]);
    refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  });

  useEffect(() => {
    if (productsData?.data) {
      setProducts(productsData.data);
    }
  }, [productsData]);

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
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
        </Space>
      ),
    },
  ];

  const handleCreateOrder = (values) => {
    const orderData = {
      items: selectedProducts,
      paymentMethod: values.paymentMethod,
      distributorNotes: values.distributorNotes,
      distributorId:user._id,
    };
    createOrderMutation.mutate(orderData);
  };
     
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalVisible(true);
  };

  const handleAddProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { product: '', quantity: 1, price: 0 }
    ]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][field] = value;
    
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        updatedProducts[index].price = selectedProduct.price;
      }
    }
    
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <ShoppingCartOutlined /> My Orders
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsOrderModalVisible(true)}
            >
              New Order
            </Button>
          </div>
        }
      >
        <Table
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

      {/* Create Order Modal */}
      <Modal
        title="Create New Order"
        open={isOrderModalVisible}
        onCancel={() => {
          setIsOrderModalVisible(false);
          form.resetFields();
          setSelectedProducts([]);
        }}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleCreateOrder} layout="vertical">
          <Divider orientation="left">Order Items</Divider>
          
          {selectedProducts.map((item, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveProduct(index)}
                >
                  Remove
                </Button>
              }
            >
              <Space wrap>
                <Form.Item label="Product" required>
                  <Select
                    style={{ width: 200 }}
                    placeholder="Select Product"
                    value={item.product}
                    onChange={(value) => handleProductChange(index, 'product', value)}
                  >
                    {products.map(product => (
                      <Option key={product._id} value={product._id}>
                        {product.name} (Stock: {product.stock})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Quantity" required>
                  <InputNumber
                    min={1}
                    max={products.find(p => p._id === item.product)?.stock || 1}
                    value={item.quantity}
                    onChange={(value) => handleProductChange(index, 'quantity', value)}
                  />
                </Form.Item>

                <Form.Item label="Price">
                  <InputNumber
                    value={item.price}
                    disabled
                    prefix="₹"
                  />
                </Form.Item>

                <Form.Item label="Subtotal">
                  <InputNumber
                    value={item.price * item.quantity}
                    disabled
                    prefix="₹"
                  />
                </Form.Item>
              </Space>
            </Card>
          ))}

          <Button
            type="dashed"
            onClick={handleAddProduct}
            block
            icon={<PlusOutlined />}
            style={{ marginBottom: 16 }}
          >
            Add Product
          </Button>

          <Divider orientation="left">Order Summary</Divider>
          
          <Card size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Total Amount">
                <strong>₹{calculateTotal()}</strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
            style={{ marginTop: 16 }}
          >
            <Select placeholder="Select payment method">
              <Option value="cash-on-delivery">Cash on Delivery</Option>
              <Option value="reward-payment">Reward Payment</Option>
            </Select>
          </Form.Item>

          <Form.Item name="distributorNotes" label="Notes">
            <TextArea rows={3} placeholder="Any additional notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createOrderMutation.isPending}
                disabled={selectedProducts.length === 0}
              >
                Create Order
              </Button>
              <Button
                onClick={() => {
                  setIsOrderModalVisible(false);
                  form.resetFields();
                  setSelectedProducts([]);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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
        width={700}
      >
        {selectedOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Order Number">
              {selectedOrder.orderNumber}
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
            {selectedOrder.distributorNotes && (
              <Descriptions.Item label="Distributor Notes">
                {selectedOrder.distributorNotes}
              </Descriptions.Item>
            )}
            {selectedOrder.adminNotes && (
              <Descriptions.Item label="Admin Notes">
                {selectedOrder.adminNotes}
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Order Items">
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
    </div>
  );
};

export default DistributorOrders;