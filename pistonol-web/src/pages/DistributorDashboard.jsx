import React from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Progress,
  List,
  Avatar,
  Space,
  Typography
} from 'antd';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from '../axiosConfig';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const { Title, Text } = Typography;

const SimpleDistributorDashboard = ({user}) => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['distributor-dashboard'],
    queryFn: async () => {
      const response = await axios.get(`/orders/distributor/simple-dashboard?id=${user._id}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { overview, recentOrders, statusDistribution } = dashboardData?.data || {};

  const statusColors = {
    pending: '#faad14',
    approved: '#1890ff',
    delivered: '#52c41a'
  };

  const recentOrdersColumns = [
    {
      title: 'Order No.',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2}>Dashboard</Title>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={overview?.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Wallet Balance"
              value={overview?.walletBalance || 0}
              prefix={<WalletOutlined />}
            //   prefix="₹"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={overview?.monthlyRevenue || 0}
              prefix={<DollarCircleOutlined />}
            //   prefix="₹"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Delivered Orders"
              value={overview?.deliveredOrders || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Recent Orders */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Order Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              {statusDistribution?.map((item, index) => (
                <Tag 
                  key={index} 
                  color={statusColors[item.name]}
                  style={{ margin: '4px' }}
                >
                  {item.name}: {item.value}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                Recent Orders
              </Space>
            }
          >
            <Table
              columns={recentOrdersColumns}
              dataSource={recentOrders || []}
              pagination={false}
              size="small"
              rowKey="_id"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={8}>
          <Card title="Monthly Performance">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Order Completion</Text>
                <Progress 
                  percent={overview?.totalOrders ? Math.round((overview.deliveredOrders / overview.totalOrders) * 100) : 0} 
                  size="small"
                />
              </div>
              <div>
                <Text>Pending Orders</Text>
                <div style={{ marginTop: '8px' }}>
                  <Text strong style={{ fontSize: '18px', color: '#faad14' }}>
                    {overview?.pendingOrders || 0}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SimpleDistributorDashboard;