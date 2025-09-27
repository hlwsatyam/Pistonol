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
  Tag
} from 'antd';
import { 
  QrcodeOutlined, 
  ScanOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from '../../axiosConfig';
import dayjs from 'dayjs';

Chart.register(...registerables);

const { Option } = Select;
const { RangePicker } = DatePicker;

const QRAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/analytics/qr/stats', {
        params: { timeRange }
      });
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch QR statistics');
      console.error('Error fetching QR stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    active: 'green',
    used: 'blue',
    inactive: 'red'
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
      backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
      borderWidth: 1
    }]
  };

  const scanData = {
    labels: ['Scanned', 'Unscanned'],
    datasets: [{
      data: stats ? [stats.scannedCount, stats.unscannedCount] : [0, 0],
      backgroundColor: ['#3B82F6', '#9CA3AF'],
    }]
  };

  const creationChartData = {
    labels: stats?.creationStats ? stats.creationStats.map(item => item._id) : [],
    datasets: [{
      label: 'QR Codes Created',
      data: stats?.creationStats ? stats.creationStats.map(item => item.count) : [],
      backgroundColor: '#8B5CF6',
      borderColor: '#7C3AED',
      borderWidth: 1
    }]
  };

  const scanChartData = {
    labels: stats?.scanActivity ? stats.scanActivity.map(item => item._id) : [],
    datasets: [{
      label: 'QR Codes Scanned',
      data: stats?.scanActivity ? stats.scanActivity.map(item => item.count) : [],
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      borderWidth: 1
    }]
  };

  const batchTableColumns = [
    {
      title: 'Batch Number',
      dataIndex: '_id',
      key: 'batch'
    },
    {
      title: 'QR Codes',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count}</Tag>
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_, record) => (
        <span>
          {((record.count / stats?.totalQRCodes) * 100).toFixed(1)}%
        </span>
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
        <h1 className="text-2xl font-bold text-gray-800">QR Code Analytics Dashboard</h1>
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
                <QrcodeOutlined style={{ fontSize: '20px' }} />,
                'Total QR Codes',
                stats?.totalQRCodes || 0,
                'purple',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <ScanOutlined style={{ fontSize: '20px' }} />,
                'Scanned QR Codes',
                stats?.scannedCount || 0,
                'blue',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <CheckCircleOutlined style={{ fontSize: '20px' }} />,
                'Active QR Codes',
                stats?.statusCounts?.active || 0,
                'green',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <CloseCircleOutlined style={{ fontSize: '20px' }} />,
                'Inactive QR Codes',
                stats?.statusCounts?.inactive || 0,
                'red',
                loading
              )}
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card 
                title="QR Code Status Distribution" 
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
                title="Scan Status" 
                className="h-full"
                extra={<PieChartOutlined />}
              >
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Pie 
                    data={scanData}
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
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card 
                title="Daily QR Code Creation" 
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
                title="Daily Scan Activity" 
                className="h-full"
                extra={<BarChartOutlined />}
              >
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Bar 
                    data={scanChartData}
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
            <Col xs={24}>
              <Card 
                title="Top Batch Numbers" 
                className="h-full"
              >
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={batchTableColumns}
                    dataSource={stats?.batchStats || []}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title="Value Distribution">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {stats?.valueStats?.map(item => (
                      <div key={item._id} className="flex items-center">
                        <span className="font-medium mr-2">₹{item._id}:</span>
                        <Tag color="blue">{item.count}</Tag>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default QRAnalytics;