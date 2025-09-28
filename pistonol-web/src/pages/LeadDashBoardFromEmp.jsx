// Dashboard.jsx
import React from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  List,
  Typography,
  Space,
  Spin
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from '../axiosConfig';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { Title: AntTitle } = Typography;

const LeadDashBoardFromEmp = ({ createdBy }) => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get(`/leads/aa/bb/cc/stats/${createdBy}`);
      return response.data;
    }
  });

  // Fetch conversion data
  const { data: conversionData, isLoading: conversionLoading } = useQuery({
    queryKey: ['conversion-data'],
    queryFn: async () => {
      const response = await axios.get(`/leads/aa/bb/cc/conversion/${createdBy}`);
      return response.data;
    }
  });

  if (statsLoading || conversionLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Prepare chart data for leads by status
  const statusChartData = {
    labels: stats?.leadsByStatus?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Leads by Status',
        data: stats?.leadsByStatus?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)', // New - Blue
          'rgba(255, 206, 86, 0.7)', // Contacted - Yellow
          'rgba(75, 192, 192, 0.7)', // Qualified - Green
          'rgba(255, 99, 132, 0.7)', // Lost - Red
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for monthly leads
  const monthlyChartData = {
    labels: stats?.monthlyLeads?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Leads per Month',
        data: stats?.monthlyLeads?.map(item => item.count) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  // Prepare conversion rate chart data
  const conversionChartData = {
    labels: conversionData?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: conversionData?.map(item => item.conversionRate) || [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: 'Total Leads',
        data: conversionData?.map(item => item.total) || [],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const conversionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Conversion Rate (%)',
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Total Leads',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Status color mapping
  const statusColors = {
    New: 'blue',
    Contacted: 'orange',
    Qualified: 'green',
    Lost: 'red'
  };

  // Status icon mapping
  const statusIcons = {
    New: <ClockCircleOutlined />,
    Contacted: <PhoneOutlined />,
    Qualified: <CheckCircleOutlined />,
    Lost: <CloseCircleOutlined />
  };

  // Recent leads columns
  const recentLeadsColumns = [
    {
      title: 'Garage Name',
      dataIndex: 'garageName',
      key: 'garageName',
    },
    {
      title: 'Contact',
      dataIndex: 'contactName',
      key: 'contactName',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag icon={statusIcons[status]} color={statusColors[status]}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <AntTitle level={2}>Lead Management Dashboard</AntTitle>
      
      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Leads"
              value={stats?.totalLeads || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="New Leads"
              value={stats?.leadsByStatus?.find(item => item._id === 'New')?.count || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Qualified Leads"
              value={stats?.leadsByStatus?.find(item => item._id === 'Qualified')?.count || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={conversionData && conversionData.length > 0 
                ? conversionData[conversionData.length - 1].conversionRate 
                : 0}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Leads by Status">
            <Bar data={statusChartData} options={chartOptions} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Monthly Leads Trend">
            <Line data={monthlyChartData} options={chartOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Conversion Rate Over Time">
            <Line data={conversionChartData} options={conversionChartOptions} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top States">
            <List
              dataSource={stats?.leadsByState || []}
              renderItem={item => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item._id}</span>
                      <span>{item.count} leads</span>
                    </div>
                    <Progress 
                      percent={Math.round((item.count / stats.totalLeads) * 100)} 
                      size="small" 
                      showInfo={false}
                    />
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Leads */}
      <Card title="Recent Leads">
        <Table 
          columns={recentLeadsColumns} 
          dataSource={stats?.recentLeads || []} 
          pagination={false}
          size="small"
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default LeadDashBoardFromEmp;