import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  Alert, 
  Select, 
  DatePicker,
  Table,
  Tag,Button,
  Timeline,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  ScheduleOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from '../../axiosConfig';
import dayjs from 'dayjs';

Chart.register(...registerables);

const { Option } = Select;
 

const LeadAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
 
  const [timelineData, setTimelineData] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/analytics/lead/stats', {
        params: { timeRange }
      });
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lead statistics');
      console.error('Error fetching lead stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    New: 'blue',
    Contacted: 'purple',
    Qualified: 'green',
    Lost: 'red'
  };

  const fetchLeadTimeline = async (leadId) => {
    try {
      setTimelineLoading(true);
      const response = await axios.get(`/analytics/lead/${leadId}/timeline`);
      setTimelineData(response.data);
      setModalVisible(true);
    } catch (err) {
      message.error('Failed to fetch lead timeline');
      console.error('Error fetching timeline:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const renderStatCard = (icon, title, value, color, isLoading) => (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 mt-1 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-semibold">{value}</p>
          )}
        </div>
      </div>
    </Card>
  );

  // Prepare chart data
  const statusData = {
    labels: stats?.statusCounts ? Object.keys(stats.statusCounts) : [],
    datasets: [{
      data: stats?.statusCounts ? Object.values(stats.statusCounts) : [],
      backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#EF4444'],
      borderWidth: 1
    }]
  };

  const creationChartData = {
    labels: stats?.creationStats ? stats.creationStats.map(item => item._id) : [],
    datasets: [{
      label: 'Leads Created',
      data: stats?.creationStats ? stats.creationStats.map(item => item.count) : [],
      backgroundColor: '#8B5CF6',
      borderColor: '#7C3AED',
      borderWidth: 1
    }]
  };

  const funnelChartData = {
    labels: ['New', 'Contacted', 'Qualified', 'Lost'],
    datasets: [{
      label: 'Leads',
      data: stats?.funnelStats ? [
        stats.funnelStats.new,
        stats.funnelStats.contacted,
        stats.funnelStats.qualified,
        stats.funnelStats.lost
      ] : [0, 0, 0, 0],
      backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#EF4444'],
      borderWidth: 1
    }]
  };

  const stateTableColumns = [
    {
      title: 'State',
      dataIndex: '_id',
      key: 'state'
    },
    {
      title: 'Leads',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count}</Tag>
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_, record) => (
        <span>
          {((record.count / stats?.totalLeads) * 100).toFixed(1)}%
        </span>
      )
    }
  ];

  const userTableColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span>{record.name || record.username}</span>
      )
    },
    {
      title: 'Leads Created',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="purple">{count}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<InfoCircleOutlined />}
          onClick={() => {
            // You could implement a modal to show user-specific lead details
          }}
        />
      )
    }
  ];

  if (error) {
    return (
      <div className="p-4">
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          closable 
          className="mb-4"
        />
        <button 
          onClick={fetchStats}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lead Management Analytics</h1>
        <Select 
          defaultValue="30days" 
          style={{ width: 150 }}
          onChange={setTimeRange}
          disabled={loading}
        >
          <Option value="7days">Last 7 Days</Option>
          <Option value="30days">Last 30 Days</Option>
          <Option value="90days">Last 90 Days</Option>
          <Option value="all">All Time</Option>
        </Select>
      </div>

      {loading && !stats ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <UserOutlined style={{ fontSize: '20px' }} />,
                'Total Leads',
                stats?.totalLeads || 0,
                'blue',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <ScheduleOutlined style={{ fontSize: '20px' }} />,
                'New Leads',
                stats?.statusCounts?.New || 0,
                'blue',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <PhoneOutlined style={{ fontSize: '20px' }} />,
                'Contacted Leads',
                stats?.statusCounts?.Contacted || 0,
                'purple',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <CheckCircleOutlined style={{ fontSize: '20px' }} />,
                'Qualified Leads',
                stats?.statusCounts?.Qualified || 0,
                'green',
                loading
              )}
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card 
                title="Lead Status Distribution" 
                className="h-full"
                extra={<PieChartOutlined />}
              >
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Pie 
                    data={statusData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title="Conversion Funnel" 
                className="h-full"
                extra={<BarChartOutlined />}
              >
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Bar 
                    data={funnelChartData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card 
                title="Daily Lead Creation" 
                className="h-full"
                extra={<LineChartOutlined />}
              >
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Line 
                    data={creationChartData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title="Top States" 
                className="h-full"
              >
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={stateTableColumns}
                    dataSource={stats?.stateStats || []}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24}>
              <Card title="Top Performers (Users)">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={userTableColumns}
                    dataSource={stats?.userStats || []}
                    rowKey="_id"
                    pagination={false}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Modal
            title="Lead Timeline"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={800}
          >
            {timelineLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : (
              <Timeline mode="left">
                {timelineData.map((item, index) => (
                  <Timeline.Item 
                    key={index} 
                    label={dayjs(item.date).format('DD/MM/YYYY HH:mm')}
                  >
                    <strong>{item.event}</strong>
                    <p>{item.description}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default LeadAnalytics;