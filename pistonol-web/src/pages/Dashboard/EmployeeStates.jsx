import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Select, DatePicker } from 'antd';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserClock, 
  FaUserTie, 
  FaTruck, 
  FaStore, 
  FaTools,
  FaUserShield
} from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from '../../axiosConfig';
import dayjs from 'dayjs';

Chart.register(...registerables);

const { Option } = Select;
const { RangePicker } = DatePicker;

function EmployeeStates() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);

  useEffect(() => {
    fetchStats();
  }, [timeRange, dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let params = {};
      if (timeRange !== 'all') {
        params.timeRange = timeRange;
      }
      
      if (timeRange === 'custom' && dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await axios.get('/analytics/stats', { params });
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const roleData = {
    labels: stats?.roleDistribution ? Object.keys(stats.roleDistribution) : [],
    datasets: [
      {
        label: 'Users by Role',
        data: stats?.roleDistribution ? Object.values(stats.roleDistribution) : [],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#14B8A6'
        ],
        borderWidth: 1,
      },
    ],
  };

  const verificationData = {
    labels: ['Verified', 'Unverified'],
    datasets: [
      {
        data: stats ? [stats.verifiedUsers, stats.totalUsers - stats.verifiedUsers] : [0, 0],
        backgroundColor: ['#10B981', '#F59E0B'],
        hoverBackgroundColor: ['#0D9F6E', '#D97706'],
      },
    ],
  };

  const activityData = {
    labels: ['Active (Last 30 days)', 'Inactive'],
    datasets: [
      {
        label: 'User Activity',
        data: stats ? [stats.activeUsers, stats.totalUsers - stats.activeUsers] : [0, 0],
        backgroundColor: ['#3B82F6', '#9CA3AF'],
      },
    ],
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
        <h1 className="text-2xl font-bold text-gray-800">User Statistics Dashboard</h1>
        
        <div className="flex space-x-4">
          <Select 
            defaultValue="all" 
            style={{ width: 150 }}
            onChange={handleTimeRangeChange}
            disabled={loading}
          >
            <Option value="all">All Time</Option>
            <Option value="today">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
            <Option value="custom">Custom Range</Option>
          </Select>
          
          {timeRange === 'custom' && (
            <RangePicker 
              value={dateRange}
              onChange={handleDateRangeChange}
              disabled={loading}
            />
          )}
        </div>
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
                <FaUsers size={20} />,
                'Total Users',
                stats?.totalUsers || 0,
                'blue',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <FaUserCheck size={20} />,
                'Verified Users',
                stats?.verifiedUsers || 0,
                'green',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <FaUserClock size={20} />,
                'Customer',
                stats?.roleDistribution?.customer  || 0 ,
                'yellow',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <FaUserShield size={20} />,
                'Active Users',
                stats?.activeUsers || 0,
                'indigo',
                loading
              )}
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <FaUserTie size={20} />,
                'Employees',
                stats?.roleDistribution?.['company-employee'] || 0,
                'purple',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <FaTruck size={20} />,
                'Distributors',
                stats?.roleDistribution?.['distributor'] || 0,
                'red',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <FaStore size={20} />,
                'Dealers',
                stats?.roleDistribution?.['dealer'] || 0,
                'pink',
                loading
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                <FaTools size={20} />,
                'Mechanics',
                stats?.roleDistribution?.['mechanic'] || 0,
                'teal',
                loading
              )}
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
           <Col xs={24} md={12}>
              <Card title="Recent Activity" className="h-full">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Last Scanned Users:</span>
                      <span className="font-medium">
                        {stats?.lastScannedCount || 0} (last 7 days)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Transferred Users:</span>
                      <span className="font-medium">
                        {stats?.lastTransferredCount || 0} (last 7 days)
                      </span>
                    </div>
                    
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Verification Status" className="h-full">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Pie 
                    data={verificationData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                )}
              </Card>
            </Col>
          </Row>

           
        </>
      )}
    </div>
  );
}

export default EmployeeStates;