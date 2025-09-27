// import React, { useState } from 'react';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { Form, Input, Button, Select, Table, message, Card, Typography, Tag, Space, DatePicker, Spin } from 'antd';
// import axios from '../../axiosConfig';
// import { PlusOutlined, MinusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
// import toast from 'react-hot-toast';
// import dayjs from 'dayjs';

// const { Title, Text } = Typography;
// const { Option } = Select;
// const { RangePicker } = DatePicker;

// function DealerOrderForm({ user }) {
 
//   const [form] = Form.useForm();
//   const [orderForm] = Form.useForm();
//   const [products, setProducts] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [filterParams, setFilterParams] = useState({
//     status: '',
//     dateRange: [],
//     search: ''
//   });
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 5,
//     total: 0
//   });

//   // Fetch available products
//   const { data: productData, isLoading: productsLoading } = useQuery({
//     queryKey: ['products'],
//     queryFn: async () => {
//       const res = await axios.get('/products');
//       return res.data;
//     },
//   });

//   // Fetch dealer's orders with filters and pagination
//   const { data: ordersData, isLoading: ordersLoading, refetch } = useQuery({
//     queryKey: ['dealer-orders', filterParams, pagination.current],
//     queryFn: async () => {
//       const params = {
//         page: pagination.current,
//         limit: pagination.pageSize,
//         status: filterParams.status,
//         search: filterParams.search,
//         _id:user._id,
//       };

//       if (filterParams.dateRange?.length === 2) {
//         params.startDate = dayjs(filterParams.dateRange[0]).format('YYYY-MM-DD');
//         params.endDate = dayjs(filterParams.dateRange[1]).format('YYYY-MM-DD');
//       }

//       const res = await axios.get('/orders/dealer', { params });
//       setPagination(prev => ({
//         ...prev,
//         total: res.data.totalCount || 0
//       }));
//       return res.data.orders;
//     },
//   });

//   // Create order mutation
//   const createOrder = useMutation({
//     mutationFn: async (values) => {
//       const res = await axios.post('/orders', {
//         ...values,
//         dealerId: user._id
//       });
//       return res.data;
//     },
//     onSuccess: () => {
//       toast.success('Order placed successfully!');
//       orderForm.resetFields();
//       setProducts([]);
//       refetch();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to place order');
//     },
//   });

//   const onFinish = (values) => {
//     if (products.length === 0) {
//       toast.error('Please add at least one product');
//       return;
//     }
    
//     createOrder.mutate({
//       products: products.map(p => ({
//         product: p._id,
//         quantity: p.quantity,
//         _id:user._id,
//       }))
//     });
//   };

//   const addProduct = () => {
//     if (!selectedProduct || !orderForm.getFieldValue('quantity') || orderForm.getFieldValue('quantity') < 1) {
//       message.error('Please select a product and quantity');
//       return;
//     }
    
//     const productToAdd = productData.find(p => p._id === selectedProduct);
//     const quantity = orderForm.getFieldValue('quantity');
    
//     setProducts([...products, {
//       ...productToAdd,
//       quantity,
//       total: productToAdd.price * quantity
//     }]);
    
//     orderForm.setFieldsValue({ productId: null, quantity: null });
//     setSelectedProduct(null);
//   };

//   const removeProduct = (productId) => {
//     setProducts(products.filter(p => p._id !== productId));
//   };

//   const handleTableChange = (pagination) => {
//     setPagination(pagination);
//   };

//   const handleFilterChange = (name, value) => {
//     setFilterParams(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setPagination(prev => ({ ...prev, current: 1 }));
//   };

//   const resetFilters = () => {
//     setFilterParams({
//       status: '',
//       dateRange: [],
//       search: ''
//     });
//     setPagination(prev => ({ ...prev, current: 1 }));
//   };

//   const productColumns = [
//     {
//       title: 'Product',
//       dataIndex: 'name',
//       key: 'name'
//     },
//     {
//       title: 'Price',
//       dataIndex: 'price',
//       key: 'price',
//       render: (price) => `₹${price}`
//     },
//     {
//       title: 'Quantity',
//       dataIndex: 'quantity',
//       key: 'quantity'
//     },
//     {
//       title: 'Total',
//       dataIndex: 'total',
//       key: 'total',
//       render: (total) => `₹${total}`
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (_, record) => (
//         <Button
//           icon={<MinusOutlined />}
//           danger
//           onClick={() => removeProduct(record._id)}
//         />
//       )
//     }
//   ];

//   const orderColumns = [
//     {
//       title: 'Order ID',
//       dataIndex: '_id',
//       key: '_id',
//       render: (id) => <Text copyable>{id.slice(-6).toUpperCase()}</Text>
//     },
//     {
//       title: 'Date',
//       dataIndex: 'createdAt',
//       key: 'createdAt',
//       render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A')
//     },
//     {
//       title: 'Products',
//       dataIndex: 'products',
//       key: 'products',
//       render: (products) => (
//         <div>
//           {products.slice(0, 2).map(p => (
//             <div key={p.product}>{p.quantity} x {p.product?.name || 'Product'}</div>
//           ))}
//           {products.length > 2 && <div>+{products.length - 2} more</div>}
//         </div>
//       )
//     },
//     {
//       title: 'Total',
//       dataIndex: 'totalAmount',
//       key: 'totalAmount',
//       render: (amount) => `₹${amount}`
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status) => {
//         let color = '';
//         switch (status) {
//           case 'approved': color = 'green'; break;
//           case 'rejected': color = 'red'; break;
//           case 'pending': color = 'orange'; break;
//           case 'completed': color = 'blue'; break;
//           default: color = 'gray';
//         }
//         return <Tag color={color}>{status.toUpperCase()}</Tag>;
//       }
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (_, record) => (
//         <Space>
//           <Button type="link" size="small">Details</Button>
//         </Space>
//       )
//     }
//   ];

//   const totalAmount = products.reduce((sum, product) => sum + product.total, 0);

//   return (
//     <div className="space-y-6">
//       <Card title={<Title level={4}>Place New Order</Title>}>
//         <Spin spinning={productsLoading}>
//           <Form form={orderForm} layout="vertical" onFinish={onFinish}>
//             <div style={{ marginBottom: 16 }}>
//               <Form.Item
//                 name="productId"
//                 label="Select Product"
//                 style={{ display: 'inline-block', width: 'calc(50% - 8px)', marginRight: 16 }}
//               >
//                 <Select 
//                   placeholder="Select product"
//                   onChange={(value) => setSelectedProduct(value)}
//                   loading={productsLoading}
//                 >
//                   {productData?.map(product => (
//                     <Option key={product._id} value={product._id}>
//                       {product.name} (₹{product.price})
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
              
//               <Form.Item
//                 name="quantity"
//                 label="Quantity"
//                 style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                 
//               >
//                 <Input type="number" min={1} />
//               </Form.Item>
              
//               <Button
//                 type="dashed"
//                 icon={<PlusOutlined />}
//                 onClick={addProduct}
//                 style={{ marginBottom: 16 }}
//               >
//                 Add Product
//               </Button>
//             </div>
            
//             <Table
//               columns={productColumns}
//               dataSource={products}
//               rowKey="_id"
//               pagination={false}
//               footer={() => (
//                 <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
//                   Total Amount: ₹{totalAmount}
//                 </div>
//               )}
//             />
            
//             <Form.Item style={{ marginTop: 16 }}>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 loading={createOrder.isLoading}
//                 disabled={products.length === 0}
//               >
//                 Place Order
//               </Button>
//             </Form.Item>
//           </Form>
//         </Spin>
//       </Card>

//       <Card 
//         title={<Title level={4}>Your Orders</Title>}
//         extra={
//           <Form layout="inline">
//             <Form.Item>
//               <Input
//                 placeholder="Search orders..."
//                 prefix={<SearchOutlined />}
//                 value={filterParams.search}
//                 onChange={(e) => handleFilterChange('search', e.target.value)}
//               />
//             </Form.Item>
//             <Form.Item>
//               <Select
//                 placeholder="Status"
//                 style={{ width: 120 }}
//                 allowClear
//                 value={filterParams.status}
//                 onChange={(value) => handleFilterChange('status', value)}
//               >
//                 <Option value="pending">Pending</Option>
//                 <Option value="approved">Approved</Option>
//                 <Option value="rejected">Rejected</Option>
//                 <Option value="completed">Completed</Option>
//               </Select>
//             </Form.Item>
//             <Form.Item>
//               <RangePicker
//                 value={filterParams.dateRange}
//                 onChange={(dates) => handleFilterChange('dateRange', dates)}
//               />
//             </Form.Item>
//             <Button icon={<FilterOutlined />} onClick={resetFilters}>
//               Reset
//             </Button>
//           </Form>
//         }
//       >
//         <Spin spinning={ordersLoading}>
//           <Table
//             columns={orderColumns}
//             dataSource={ordersData}
//             rowKey="_id"
//             pagination={pagination}
//             onChange={handleTableChange}
//             scroll={{ x: true }}
//           />
//         </Spin>
//       </Card>
//     </div>
//   );
// }

// export default DealerOrderForm;



import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Select, Table, message, Card, Typography, Tag, Space, DatePicker, Spin, Modal, Descriptions, Divider } from 'antd';
import axios from '../../axiosConfig';
import { PlusOutlined, MinusOutlined, SearchOutlined, FilterOutlined, EyeOutlined, PrinterOutlined, DollarOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function DealerOrderForm({ user }) {
  const [form] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterParams, setFilterParams] = useState({
    status: '',
    dateRange: [],
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const invoiceRef = React.useRef();

  // Fetch available products
  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/products');
      return res.data;
    },
  });

  // Fetch dealer's wallet balance
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['dealer-wallet', user._id],
    queryFn: async () => {
      const res = await axios.get(`/wallet/${user._id}`);
      return res.data;
    },
  });

  // Fetch dealer's orders with filters and pagination
  const { data: ordersData, isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ['dealer-orders', filterParams, pagination.current],
    queryFn: async () => {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filterParams.status,
        search: filterParams.search,
        _id: user._id,
      };

      if (filterParams.dateRange?.length === 2) {
        params.startDate = dayjs(filterParams.dateRange[0]).format('YYYY-MM-DD');
        params.endDate = dayjs(filterParams.dateRange[1]).format('YYYY-MM-DD');
      }

      const res = await axios.get('/orders/dealer', { params });
      setPagination(prev => ({
        ...prev,
        total: res.data.totalCount || 0
      }));
      return res.data.orders;
    },
  });

  // Create order mutation
  const createOrder = useMutation({
    mutationFn: async (values) => {
      const res = await axios.post('/orders', {
        ...values,
        dealerId: user._id
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order placed successfully!');
      orderForm.resetFields();
      setProducts([]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });

  // Pay for order mutation
  const payOrder = useMutation({
    mutationFn: async ({ orderId, amount }) => {
      const res = await axios.post('/orders/pay', {
        orderId,
        amount,
        dealerId: user._id
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment successful!');
      setIsPaymentModalVisible(false);
      setPaymentAmount(0);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Payment failed');
    },
  });

  const onFinish = (values) => {
    if (products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    
    createOrder.mutate({
      products: products.map(p => ({
        product: p._id,
        quantity: p.quantity,
        _id: user._id,
      }))
    });
  };

  const addProduct = () => {
    if (!selectedProduct || !orderForm.getFieldValue('quantity') || orderForm.getFieldValue('quantity') < 1) {
      message.error('Please select a product and quantity');
      return;
    }
    
    const productToAdd = productData.find(p => p._id === selectedProduct);
    const quantity = orderForm.getFieldValue('quantity');
    
    setProducts([...products, {
      ...productToAdd,
      quantity,
      total: productToAdd.price * quantity
    }]);
    
    orderForm.setFieldsValue({ productId: null, quantity: null });
    setSelectedProduct(null);
  };

  const removeProduct = (productId) => {
    setProducts(products.filter(p => p._id !== productId));
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleFilterChange = (name, value) => {
    setFilterParams(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const resetFilters = () => {
    setFilterParams({
      status: '',
      dateRange: [],
      search: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handlePayment = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }
    
    payOrder.mutate({
      orderId: selectedOrder._id,
      amount: paymentAmount
    });
  };

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price}`
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `₹${total}`
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          icon={<MinusOutlined />}
          danger
          onClick={() => removeProduct(record._id)}
        />
      )
    }
  ];

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <Text copyable>{id.slice(-6).toUpperCase()}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A')
    },
    {
      title: 'Products',
      dataIndex: 'products',
      key: 'products',
      render: (products) => (
        <div>
          {products.slice(0, 2).map(p => (
            <div key={p.product}>{p.quantity} x {p.product?.name || 'Product'}</div>
          ))}
          {products.length > 2 && <div>+{products.length - 2} more</div>}
        </div>
      )
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Paid',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => `₹${amount || 0}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'approved': color = 'green'; break;
          case 'rejected': color = 'red'; break;
          case 'pending': color = 'orange'; break;
          case 'completed': color = 'blue'; break;
          default: color = 'gray';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showOrderDetails(record)}
          />
          <Button 
            icon={<PrinterOutlined />} 
            onClick={() => {
              setSelectedOrder(record);
              setTimeout(handlePrint, 100);
            }}
          />
          {record.status === 'approved' && record.paidAmount < record.totalAmount && (
            <Button 
              icon={<DollarOutlined />} 
              type="primary" 
              onClick={() => {
                setSelectedOrder(record);
                setIsPaymentModalVisible(true);
              }}
            />
          )}
        </Space>
      )
    }
  ];

  const totalAmount = products.reduce((sum, product) => sum + product.total, 0);

  return (
    <div className="space-y-6">
      <Card title={<Title level={4}>Place New Order</Title>}>
        <Spin spinning={productsLoading}>
          <Form form={orderForm} layout="vertical" onFinish={onFinish}>
            <div style={{ marginBottom: 16 }}>
              <Form.Item
                name="productId"
                label="Select Product"
                style={{ display: 'inline-block', width: 'calc(50% - 8px)', marginRight: 16 }}
              >
                <Select 
                  placeholder="Select product"
                  onChange={(value) => setSelectedProduct(value)}
                  loading={productsLoading}
                >
                  {productData?.map(product => (
                    <Option key={product._id} value={product._id}>
                      {product.name} (₹{product.price})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="quantity"
                label="Quantity"
                style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
              >
                <Input type="number" min={1} />
              </Form.Item>
              
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addProduct}
                style={{ marginBottom: 16 }}
              >
                Add Product
              </Button>
            </div>
            
            <Table
              columns={productColumns}
              dataSource={products}
              rowKey="_id"
              pagination={false}
              footer={() => (
                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  Total Amount: ₹{totalAmount}
                </div>
              )}
            />
            
            <Form.Item style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={createOrder.isLoading}
                disabled={products.length === 0}
              >
                Place Order
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>

      <Card 
        title={<Title level={4}>Your Orders</Title>}
        extra={
          <Form layout="inline">
            <Form.Item>
              <Input
                placeholder="Search orders..."
                prefix={<SearchOutlined />}
                value={filterParams.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Select
                placeholder="Status"
                style={{ width: 120 }}
                allowClear
                value={filterParams.status}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <RangePicker
                value={filterParams.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
              />
            </Form.Item>
            <Button icon={<FilterOutlined />} onClick={resetFilters}>
              Reset
            </Button>
          </Form>
        }
      >
        <Spin spinning={ordersLoading}>
          <Table
            columns={orderColumns}
            dataSource={ordersData}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </Spin>
      </Card>

      {/* Order Details Modal */}
      <Modal
        title="Order Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print Invoice
          </Button>,
          selectedOrder?.status === 'approved' && selectedOrder?.paidAmount < selectedOrder?.totalAmount ? (
            <Button 
              key="pay" 
              type="primary" 
              icon={<DollarOutlined />}
              onClick={() => {
                setIsModalVisible(false);
                setIsPaymentModalVisible(true);
              }}
            >
              Pay Bill
            </Button>
          ) : null,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <div ref={invoiceRef}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>INVOICE</Title>
            <Text type="secondary">Order ID: {selectedOrder?._id}</Text>
          </div>
          
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Order Date">
              {dayjs(selectedOrder?.createdAt).format('DD MMM YYYY, hh:mm A')}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedOrder?.status === 'approved' ? 'green' : 
                selectedOrder?.status === 'rejected' ? 'red' : 
                selectedOrder?.status === 'pending' ? 'orange' : 'blue'
              }>
                {selectedOrder?.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              ₹{selectedOrder?.totalAmount}
            </Descriptions.Item>
            <Descriptions.Item label="Paid Amount">
              ₹{selectedOrder?.paidAmount || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Balance Due">
              ₹{(selectedOrder?.totalAmount - (selectedOrder?.paidAmount || 0))}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider orientation="left">Products</Divider>
          <Table
            columns={[
              { title: 'Product', dataIndex: ['product', 'name'], key: 'name' },
              { title: 'Price', dataIndex: ['product', 'price'], key: 'price', render: (price) => `₹${price}` },
              { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
              { title: 'Total', key: 'total', render: (_, record) => `₹${record.quantity * record.product.price}` }
            ]}
            dataSource={selectedOrder?.products || []}
            rowKey={(record) => record.product._id}
            pagination={false}
          />
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Text strong>Subtotal: ₹{selectedOrder?.totalAmount}</Text><br />
            <Text strong>Paid: ₹{selectedOrder?.paidAmount || 0}</Text><br />
            <Text strong type="danger">Balance Due: ₹{(selectedOrder?.totalAmount - (selectedOrder?.paidAmount || 0))}</Text>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Make Payment"
        visible={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsPaymentModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="pay" 
            type="primary" 
            loading={payOrder.isLoading}
            onClick={handlePayment}
          >
            Confirm Payment
          </Button>
        ]}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Order ID">{selectedOrder?._id}</Descriptions.Item>
          <Descriptions.Item label="Total Amount">₹{selectedOrder?.totalAmount}</Descriptions.Item>
          <Descriptions.Item label="Paid Amount">₹{selectedOrder?.paidAmount || 0}</Descriptions.Item>
          <Descriptions.Item label="Balance Due">
            ₹{(selectedOrder?.totalAmount - (selectedOrder?.paidAmount || 0))}
          </Descriptions.Item>
          <Descriptions.Item label="Your Wallet Balance">
            ₹{walletData?.balance || 0}
          </Descriptions.Item>
        </Descriptions>
        
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Enter Amount">
            <Input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              min={0}
              max={Math.min(
                selectedOrder?.totalAmount - (selectedOrder?.paidAmount || 0),
                walletData?.balance || 0
              )}
            />
          </Form.Item>
          <Text type="secondary">
            Maximum payable: ₹{Math.min(
              selectedOrder?.totalAmount - (selectedOrder?.paidAmount || 0),
              walletData?.balance || 0
            )}
          </Text>
        </Form>
      </Modal>
    </div>
  );
}

export default DealerOrderForm;






