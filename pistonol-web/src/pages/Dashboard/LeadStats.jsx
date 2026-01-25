// components/LeadStats.jsx
import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Statistic,
  Table,
  Tag,
  Progress,
  Space,
  Button,
  Tooltip,
  Divider,
  Empty,
  Skeleton,
  Alert
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from '../../axiosConfig';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const LeadStats = () => {
  const [filters, setFilters] = useState({
    status: '',
    state: '',
    city: '',
    dateRange: [moment().startOf('month'), moment().endOf('day')],
    timePeriod: 'monthly' // daily, weekly, monthly, yearly
  });

  // Fetch lead statistics
  const { data: statsData, isLoading, error, refetch } = useQuery({
    queryKey: ['leadStats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add filters
      if (filters.status) params.append('status', filters.status);
      if (filters.state) params.append('state', filters.state);
      if (filters.city) params.append('city', filters.city);
      if (filters.timePeriod) params.append('timePeriod', filters.timePeriod);
      
      // Date range
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.append('startDate', filters.dateRange[0].format('YYYY-MM-DD'));
        params.append('endDate', filters.dateRange[1].format('YYYY-MM-DD'));
      }
      
      const response = await axios.get(`/leads/stats/by/all?${params.toString()}`);
      return response.data;
    }
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      state: '',
      city: '',
      dateRange: [moment().startOf('month'), moment().endOf('day')],
      timePeriod: 'monthly'
    });
  };

  // Export data (placeholder)
  const handleExport = () => {
     
    alert('Export feature would be implemented here');
  };

  // Status colors
  const statusColors = {
    'New': 'blue',
    'Contacted': 'orange',
    'Qualified': 'green',
    'Lost': 'red'
  };

  // Progress bar colors
  const getProgressColor = (percent) => {
    if (percent >= 75) return 'green';
    if (percent >= 50) return 'orange';
    if (percent >= 25) return 'blue';
    return 'red';
  };

  if (error) {
    return (
      <Alert
        message="Error Loading Statistics"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header with Filters */}
      <Card className="mb-6 shadow-sm" title={
        <div className="flex items-center gap-2">
          <BarChartOutlined className="text-blue-500" />
          <span>Lead Tracking Dashboard</span>
        </div>
      } extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
        </Space>
      }>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Status"
              style={{ width: '100%' }}
              value={filters.status || null}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              suffixIcon={<FilterOutlined />}
            >
              <Option value="New">New</Option>
              <Option value="Contacted">Contacted</Option>
              <Option value="Qualified">Qualified</Option>
              <Option value="Lost">Lost</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by State"
              style={{ width: '100%' }}
              value={filters.state || null}
              onChange={(value) => handleFilterChange('state', value)}
              allowClear
              suffixIcon={<EnvironmentOutlined />}
            >
              {statsData?.states?.map(state => (
                <Option key={state._id} value={state._id}>
                  {state._id} ({state.count})
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by City"
              style={{ width: '100%' }}
              value={filters.city || null}
              onChange={(value) => handleFilterChange('city', value)}
              allowClear
              suffixIcon={<EnvironmentOutlined />}
            >
              {statsData?.cities?.map(city => (
                <Option key={city._id} value={city._id}>
                  {city._id} ({city.count})
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              suffixIcon={<CalendarOutlined />}
            />
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Time Period"
              style={{ width: '100%' }}
              value={filters.timePeriod}
              onChange={(value) => handleFilterChange('timePeriod', value)}
              suffixIcon={<ClockCircleOutlined />}
            >
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Button 
              onClick={resetFilters} 
              block
              danger
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(item => (
            <Col xs={24} sm={12} lg={6} key={item}>
              <Skeleton active />
            </Col>
          ))}
        </Row>
      ) : (
        <>
          {/* Key Metrics */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Total Leads"
                  value={statsData?.totalLeads || 0}
                  prefix={<TeamOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  All time lead count
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Conversion Rate"
                  value={statsData?.conversionRate || 0}
                  suffix="%"
                  prefix={statsData?.conversionRate >= 50 ? 
                    <RiseOutlined className="text-green-500" /> : 
                    <FallOutlined className="text-red-500" />
                  }
                  valueStyle={{ 
                    color: statsData?.conversionRate >= 50 ? '#52c41a' : '#f5222d' 
                  }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Qualified / Total Leads
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="New Leads (This Month)"
                  value={statsData?.newLeadsThisMonth || 0}
                  prefix={<TeamOutlined className="text-green-500" />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {moment(filters.dateRange?.[0]).format('MMM DD')} - {moment(filters.dateRange?.[1]).format('MMM DD')}
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Avg Response Time"
                  value={statsData?.avgResponseTime || 0}
                  suffix="hours"
                  prefix={<ClockCircleOutlined className="text-orange-500" />}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Time to first contact
                </div>
              </Card>
            </Col>
          </Row>

          {/* Status Distribution & State Distribution */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <AppstoreOutlined className="text-blue-500" />
                    <span>Lead Status Distribution</span>
                  </div>
                }
                className="shadow-sm h-full"
              >
                {statsData?.statusDistribution?.length > 0 ? (
                  <div className="space-y-4">
                    {statsData.statusDistribution.map((status, index) => {
                      const percent = (status.count / statsData.totalLeads) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <Tag color={statusColors[status._id] || 'default'}>
                                {status._id}
                              </Tag>
                              <span className="font-medium">{status.count}</span>
                            </div>
                            <span className="text-gray-600">
                              {percent.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            percent={percent} 
                            strokeColor={statusColors[status._id]}
                            showInfo={false}
                            size="small"
                          />
                        </div>
                      );
                    })}
                    
                    <Divider />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {statsData?.qualifiedLeads || 0}
                        </div>
                        <div className="text-sm text-gray-600">Qualified Leads</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {statsData?.lostLeads || 0}
                        </div>
                        <div className="text-sm text-gray-600">Lost Leads</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Empty description="No status data available" />
                )}
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-green-500" />
                    <span>State-wise Distribution</span>
                  </div>
                }
                className="shadow-sm h-full"
              >
                {statsData?.stateDistribution?.length > 0 ? (
                  <Table
                    dataSource={statsData.stateDistribution}
                    pagination={false}
                    size="small"
                    scroll={{ y: 300 }}
                    columns={[
                      {
                        title: 'State',
                        dataIndex: '_id',
                        key: 'state',
                        render: (state) => (
                          <Tag color="geekblue">{state || 'Unknown'}</Tag>
                        )
                      },
                      {
                        title: 'Leads',
                        dataIndex: 'count',
                        key: 'count',
                        render: (count) => (
                          <span className="font-bold">{count}</span>
                        )
                      },
                      {
                        title: 'Percentage',
                        key: 'percentage',
                        render: (_, record) => {
                          const percent = (record.count / statsData.totalLeads) * 100;
                          return (
                            <Progress 
                              percent={percent} 
                              size="small" 
                              strokeColor={getProgressColor(percent)}
                              format={() => `${percent.toFixed(1)}%`}
                            />
                          );
                        }
                      }
                    ]}
                  />
                ) : (
                  <Empty description="No state data available" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Time-based Analysis & Top Cities */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-purple-500" />
                    <span>Lead Growth Trend ({filters.timePeriod})</span>
                  </div>
                }
                className="shadow-sm"
              >
                {statsData?.timeSeries?.length > 0 ? (
                  <div className="space-y-3">
                    {statsData.timeSeries.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="w-32">
                          <span className="font-medium">{item._id}</span>
                        </div>
                        <div className="flex-1 mx-4">
                          <Progress 
                            percent={(item.count / Math.max(...statsData.timeSeries.map(t => t.count))) * 100} 
                            showInfo={false}
                            strokeColor="#722ed1"
                          />
                        </div>
                        <div className="w-16 text-right">
                          <span className="font-bold">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="No time series data available" />
                )}
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-orange-500" />
                    <span>Top Cities</span>
                  </div>
                }
                className="shadow-sm"
              >
                {statsData?.cityDistribution?.length > 0 ? (
                  <div className="space-y-3">
                    {statsData.cityDistribution.slice(0, 8).map((city, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <span>{city._id || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{city.count}</span>
                          <Tag color="blue">
                            {((city.count / statsData.totalLeads) * 100).toFixed(1)}%
                          </Tag>
                        </div>
                      </div>
                    ))}
                    
                    {statsData.cityDistribution.length > 8 && (
                      <div className="text-center mt-3">
                        <Button type="link">
                          View All {statsData.cityDistribution.length} Cities
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Empty description="No city data available" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Performance Metrics */}
          <Card 
            title="Performance Metrics" 
            className="mt-6 shadow-sm"
            extra={
              <Tooltip title="Based on selected filters">
                <span className="text-xs text-gray-500">Performance Score</span>
              </Tooltip>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {statsData?.contactRate || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Contact Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Leads contacted / New leads
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {statsData?.qualificationRate || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Qualification Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Qualified / Contacted leads
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {statsData?.lossRate || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Loss Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Lost leads / Total leads
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {statsData?.avgLeadValue || 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Lead Score</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on engagement
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}

      {/* Summary */}
      {statsData && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Summary</h3>
              <p className="text-sm text-gray-600">
                Showing data for {statsData.totalLeads} leads from{' '}
                {moment(filters.dateRange?.[0]).format('MMM DD, YYYY')} to{' '}
                {moment(filters.dateRange?.[1]).format('MMM DD, YYYY')}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statsData.newLeadsToday || 0}
                </div>
                <div className="text-sm text-gray-600">Today's Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statsData.avgDailyLeads?.toFixed(1) || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Daily</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadStats;