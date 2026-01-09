// import React, { useState, useEffect, useRef } from 'react';
// import axios from '../axiosConfig';
// import {
//   Table,
//   Card,
//   Statistic,
//   DatePicker,
//   Input,
//   Button,
//   Tag,
//   message,
//   Empty,
//   Space,
//   Select,
//   Row,
//   Col,
//   Modal,
//   Form,
//   InputNumber,
//   Tooltip,
//   Badge,
//   Tabs
// } from 'antd';
// import {
//   CarOutlined,
//   UserOutlined,
//   CalendarOutlined,
//   ReloadOutlined,
//   SearchOutlined,
//   FilterOutlined,
//   DownloadOutlined,
//   EyeOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   BarChartOutlined,
//   TeamOutlined,
//   DashboardOutlined
// } from '@ant-design/icons';
// import moment from 'moment';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';

// const { Option } = Select;
// const { RangePicker } = DatePicker;
// const { TabPane } = Tabs;

// const AdminTravelDashboard = () => {
//   const [travels, setTravels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 20,
//     search: '',
//     startDate: null,
//     endDate: null,
//     minDistance: null,
//     maxDistance: null,
//     userId: '',
//     sortBy: 'date',
//     sortOrder: 'desc'
//   });
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 1
//   });
//   const [stats, setStats] = useState({
//     totalDistance: 0,
//     averageDistance: 0,
//     totalRecords: 0
//   });
//   const [todaySummary, setTodaySummary] = useState(null);
//   const [chartData, setChartData] = useState([]);
//   const [userModalVisible, setUserModalVisible] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userTravels, setUserTravels] = useState([]);
//   const [activeTab, setActiveTab] = useState('overview');

//   const API_URL = '/v1/travel';

//   // Fetch travels data
//   const fetchTravels = async () => {
//     setLoading(true);
//     try {
//       const params = {
//         ...filters,
//         startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : '',
//         endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : ''
//       };

//       const response = await axios.get(`${API_URL}/admin/all`, { params });
      
//       if (response.data.success) {
//         setTravels(response.data.data);
//         setPagination(response.data.pagination);
//         setStats(response.data.stats);
        
//         // Prepare chart data
//         if (response.data.data.length > 0) {
//           prepareChartData(response.data.data);
//         }
//       }
//     } catch (error) {
//       message.error('Failed to load travel data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch today's summary
//   const fetchTodaySummary = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/admin/today-summary`);
//       if (response.data.success) {
//         setTodaySummary(response.data.summary);
//       }
//     } catch (error) {
//       console.error('Error fetching today summary:', error);
//     }
//   };

//   // Fetch user details
//   const fetchUserDetails = async (userId) => {
//     try {
//       const response = await axios.get(`${API_URL}/user-history/${userId}?limit=50`);
//       if (response.data.success) {
//         setUserTravels(response.data.data);
//         setUserModalVisible(true);
//       }
//     } catch (error) {
//       message.error('Failed to load user details');
//     }
//   };

//   const prepareChartData = (data) => {
//     // Group by date
//     const grouped = data.reduce((acc, item) => {
//       const date = moment(item.date).format('DD/MM');
//       if (!acc[date]) {
//         acc[date] = {
//           distance: 0,
//           count: 0
//         };
//       }
//       acc[date].distance += item.distance;
//       acc[date].count += 1;
//       return acc;
//     }, {});

//     const chartData = Object.entries(grouped).map(([date, data]) => ({
//       date,
//       distance: data.distance,
//       average: data.distance / data.count
//     }));

//     setChartData(chartData);
//   };

//   const handleTableChange = (pagination, filters, sorter) => {
//     setFilters(prev => ({
//       ...prev,
//       page: pagination.current,
//       sortBy: sorter.field || 'date',
//       sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
//     }));
//   };

//   const handleSearch = () => {
//     setFilters(prev => ({ ...prev, page: 1 }));
//   };

//   const handleReset = () => {
//     setFilters({
//       page: 1,
//       limit: 20,
//       search: '',
//       startDate: null,
//       endDate: null,
//       minDistance: null,
//       maxDistance: null,
//       userId: '',
//       sortBy: 'date',
//       sortOrder: 'desc'
//     });
//   };

//   const handleExport = () => {
//     message.info('Export feature coming soon!');
//   };

//   // Initial load
//   useEffect(() => {
//     fetchTravels();
//     fetchTodaySummary();
//   }, [filters]);

//   // Auto-refresh
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchTravels();
//       fetchTodaySummary();
//     }, 30000); // 30 seconds

//     return () => clearInterval(interval);
//   }, []);

//   // Chart options
//   const chartOptions = {
//     chart: {
//       type: 'column',
//       backgroundColor: 'transparent'
//     },
//     title: {
//       text: 'Travel Distance Distribution',
//       style: { color: '#1F2937', fontSize: '16px' }
//     },
//     xAxis: {
//       categories: chartData.map(d => d.date),
//       crosshair: true,
//       labels: {
//         style: { color: '#6B7280' }
//       }
//     },
//     yAxis: {
//       min: 0,
//       title: {
//         text: 'Distance (km)',
//         style: { color: '#6B7280' }
//       },
//       labels: {
//         style: { color: '#6B7280' }
//       }
//     },
//     tooltip: {
//       headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
//       pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
//         '<td style="padding:0"><b>{point.y:.1f} km</b></td></tr>',
//       footerFormat: '</table>',
//       shared: true,
//       useHTML: true
//     },
//     plotOptions: {
//       column: {
//         pointPadding: 0.2,
//         borderWidth: 0
//       }
//     },
//     series: [{
//       name: 'Total Distance',
//       data: chartData.map(d => d.distance),
//       color: '#3B82F6'
//     }, {
//       name: 'Average per User',
//       data: chartData.map(d => d.average),
//       color: '#10B981',
//       type: 'spline'
//     }]
//   };

//   const columns = [
//     {
//       title: 'User',
//       dataIndex: ['userId', 'username'],
//       key: 'username',
//       width: 150,
//       render: (username, record) => (
//         <div className="flex items-center gap-2">
//           <UserOutlined className="text-blue-500" />
//           <div>
//             <div className="font-medium">{username}</div>
//             <div className="text-xs text-gray-500">
//               {record.userId?.name || 'N/A'}
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       width: 120,
//       render: (date) => moment(date).format('DD/MM/YYYY'),
//       sorter: true
//     },
//     {
//       title: 'Time',
//       dataIndex: 'createdAt',
//       key: 'time',
//       width: 100,
//       render: (time) => moment(time).format('HH:mm')
//     },
//     {
//       title: 'Distance',
//       dataIndex: 'distance',
//       key: 'distance',
//       width: 120,
//       render: (distance) => (
//         <Tag color="green" className="font-bold">
//           {distance} km
//         </Tag>
//       ),
//       sorter: true
//     },
//     {
//       title: 'Last Updated',
//       dataIndex: 'updatedAt',
//       key: 'updatedAt',
//       width: 150,
//       render: (time) => moment(time).fromNow()
//     },
//     {
//       title: 'Status',
//       key: 'status',
//       width: 100,
//       render: (_, record) => {
//         const isToday = moment(record.date).isSame(moment(), 'day');
//         return (
//           <Badge
//             status={isToday ? "processing" : "default"}
//             text={isToday ? "Today" : "Past"}
//           />
//         );
//       }
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       width: 120,
//       render: (_, record) => (
//         <Space size="small">
//           <Tooltip title="View User Details">
//             <Button
//               type="link"
//               icon={<EyeOutlined />}
//               onClick={() => {
//                 setSelectedUser(record.userId);
//                 fetchUserDetails(record.userId._id);
//               }}
//             />
//           </Tooltip>
//           <Tooltip title="Edit (if today)">
//             <Button
//               type="link"
//               icon={<EditOutlined />}
//               disabled={!moment(record.date).isSame(moment(), 'day')}
//             />
//           </Tooltip>
//           <Tooltip title="Delete">
//             <Button
//               type="link"
//               danger
//               icon={<DeleteOutlined />}
//               onClick={() => {
//                 Modal.confirm({
//                   title: 'Delete Travel Record',
//                   content: 'Are you sure you want to delete this record?',
//                   onOk: async () => {
//                     try {
//                       await axios.delete(`${API_URL}/${record._id}`);
//                       message.success('Record deleted successfully');
//                       fetchTravels();
//                     } catch (error) {
//                       message.error('Failed to delete record');
//                     }
//                   }
//                 });
//               }}
//             />
//           </Tooltip>
//         </Space>
//       )
//     }
//   ];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
//               <DashboardOutlined className="text-blue-500" />
//               Travel Management Dashboard
//             </h1>
//             <p className="text-gray-600">
//               Manage and monitor all users' travel activities
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <Button
//               icon={<DownloadOutlined />}
//               onClick={handleExport}
//             >
//               Export
//             </Button>
//             <Button
//               type="primary"
//               icon={<ReloadOutlined />}
//               onClick={() => {
//                 fetchTravels();
//                 fetchTodaySummary();
//               }}
//             >
//               Refresh
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
//         <TabPane tab={<span><DashboardOutlined /> Overview</span>} key="overview" />
//         <TabPane tab={<span><BarChartOutlined /> Analytics</span>} key="analytics" />
//         <TabPane tab={<span><TeamOutlined /> Users</span>} key="users" />
//       </Tabs>

//       {/* Overview Tab */}
//       {activeTab === 'overview' && (
//         <>
//           {/* Today's Summary */}
//           <Row gutter={[16, 16]} className="mb-6">
//             <Col span={6}>
//               <Card className="shadow-lg">
//                 <Statistic
//                   title="Today's Users"
//                   value={todaySummary?.totalUsers || 0}
//                   prefix={<TeamOutlined />}
//                   valueStyle={{ color: '#3B82F6' }}
//                 />
//               </Card>
//             </Col>
//             <Col span={6}>
//               <Card className="shadow-lg">
//                 <Statistic
//                   title="Today's Distance"
//                   value={todaySummary?.totalDistance || 0}
//                   suffix="km"
//                   prefix={<CarOutlined />}
//                   valueStyle={{ color: '#059669' }}
//                 />
//               </Card>
//             </Col>
//             <Col span={6}>
//               <Card className="shadow-lg">
//                 <Statistic
//                   title="Average Today"
//                   value={todaySummary?.averageDistance || 0}
//                   suffix="km"
//                   precision={2}
//                   valueStyle={{ color: '#8B5CF6' }}
//                 />
//               </Card>
//             </Col>
//             <Col span={6}>
//               <Card className="shadow-lg">
//                 <Statistic
//                   title="Total Records"
//                   value={stats.totalRecords}
//                   prefix={<BarChartOutlined />}
//                   valueStyle={{ color: '#F59E0B' }}
//                 />
//               </Card>
//             </Col>
//           </Row>

//           {/* Filters */}
//           <Card className="mb-6 shadow-lg">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//               <Input
//                 placeholder="Search by username, name, mobile"
//                 prefix={<SearchOutlined />}
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//                 allowClear
//               />
              
//               <RangePicker
//                 style={{ width: '100%' }}
//                 value={[filters.startDate, filters.endDate]}
//                 onChange={(dates) => setFilters({
//                   ...filters,
//                   startDate: dates?.[0] || null,
//                   endDate: dates?.[1] || null
//                 })}
//               />
              
//               <InputNumber
//                 placeholder="Min Distance"
//                 style={{ width: '100%' }}
//                 value={filters.minDistance}
//                 onChange={(value) => setFilters({ ...filters, minDistance: value })}
//                 min={0}
//               />
              
//               <InputNumber
//                 placeholder="Max Distance"
//                 style={{ width: '100%' }}
//                 value={filters.maxDistance}
//                 onChange={(value) => setFilters({ ...filters, maxDistance: value })}
//                 min={0}
//               />
//             </div>
            
//             <div className="flex justify-between">
//               <div className="flex gap-3">
//                 <Button
//                   type="primary"
//                   icon={<FilterOutlined />}
//                   onClick={handleSearch}
//                 >
//                   Apply Filters
//                 </Button>
//                 <Button onClick={handleReset}>
//                   Reset
//                 </Button>
//               </div>
              
//               <div className="flex items-center gap-3">
//                 <span className="text-gray-600">Show:</span>
//                 <Select
//                   value={filters.limit}
//                   style={{ width: 100 }}
//                   onChange={(value) => setFilters({ ...filters, limit: value })}
//                 >
//                   <Option value={10}>10 rows</Option>
//                   <Option value={20}>20 rows</Option>
//                   <Option value={50}>50 rows</Option>
//                   <Option value={100}>100 rows</Option>
//                 </Select>
//               </div>
//             </div>
//           </Card>

//           {/* Travels Table */}
//           <Card 
//             className="shadow-lg" 
//             title={
//               <div className="flex items-center justify-between">
//                 <span className="text-lg font-semibold">
//                   Travel Records ({pagination.total})
//                 </span>
//                 <div className="text-sm text-gray-500">
//                   Page {pagination.page} of {pagination.pages}
//                 </div>
//               </div>
//             }
//           >
//             <Table
//               columns={columns}
//               dataSource={travels}
//               rowKey="_id"
//               loading={loading}
//               pagination={{
//                 current: pagination.page,
//                 pageSize: pagination.limit,
//                 total: pagination.total,
//                 showSizeChanger: true,
//                 showQuickJumper: true,
//                 showTotal: (total) => `Total ${total} records`
//               }}
//               onChange={handleTableChange}
//               scroll={{ x: 1200 }}
//             />
//           </Card>
//         </>
//       )}

//       {/* Analytics Tab */}
//       {activeTab === 'analytics' && (
//         <Card className="shadow-lg">
//           <div className="mb-6">
//             <h3 className="text-xl font-semibold mb-4">Travel Analytics</h3>
//             <Row gutter={[16, 16]}>
//               <Col span={12}>
//                 <Card>
//                   <Statistic
//                     title="Total Distance"
//                     value={stats.totalDistance}
//                     suffix="km"
//                     valueStyle={{ color: '#059669', fontSize: '28px' }}
//                   />
//                 </Card>
//               </Col>
//               <Col span={12}>
//                 <Card>
//                   <Statistic
//                     title="Average Distance"
//                     value={stats.averageDistance}
//                     suffix="km"
//                     precision={2}
//                     valueStyle={{ color: '#3B82F6', fontSize: '28px' }}
//                   />
//                 </Card>
//               </Col>
//             </Row>
//           </div>
          
//           {chartData.length > 0 ? (
//             <div className="mt-6">
//               <HighchartsReact
//                 highcharts={Highcharts}
//                 options={chartOptions}
//               />
//             </div>
//           ) : (
//             <Empty
//               image={Empty.PRESENTED_IMAGE_SIMPLE}
//               description="No data available for chart"
//             />
//           )}
//         </Card>
//       )}

//       {/* Users Tab */}
//       {activeTab === 'users' && (
//         <Card className="shadow-lg">
//           <h3 className="text-xl font-semibold mb-4">Users Overview</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {travels.slice(0, 12).map((travel, index) => (
//               <Card key={index} size="small" className="hover:shadow-md transition-shadow">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="font-semibold">{travel.userId?.username}</div>
//                     <div className="text-sm text-gray-500">{travel.userId?.name}</div>
//                   </div>
//                   <Button
//                     type="link"
//                     icon={<EyeOutlined />}
//                     onClick={() => {
//                       setSelectedUser(travel.userId);
//                       fetchUserDetails(travel.userId._id);
//                     }}
//                   />
//                 </div>
//                 <div className="mt-3">
//                   <div className="flex justify-between text-sm">
//                     <span>Today:</span>
//                     <span className="font-semibold">{travel.distance} km</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span>Mobile:</span>
//                     <span>{travel.userId?.mobile || 'N/A'}</span>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </Card>
//       )}

//       {/* User Details Modal */}
//       <Modal
//         title={
//           <div className="flex items-center gap-3">
//             <UserOutlined />
//             <div>
//               <div className="font-bold">{selectedUser?.username}</div>
//               <div className="text-sm text-gray-500">{selectedUser?.name}</div>
//             </div>
//           </div>
//         }
//         open={userModalVisible}
//         onCancel={() => setUserModalVisible(false)}
//         footer={null}
//         width={800}
//       >
//         {userTravels.length > 0 ? (
//           <Table
//             dataSource={userTravels}
//             columns={[
//               {
//                 title: 'Date',
//                 dataIndex: 'date',
//                 render: (date) => moment(date).format('DD/MM/YYYY')
//               },
//               {
//                 title: 'Distance',
//                 dataIndex: 'distance',
//                 render: (distance) => `${distance} km`
//               },
//               {
//                 title: 'Status',
//                 render: (record) => (
//                   <Tag color={moment(record.date).isSame(moment(), 'day') ? 'green' : 'default'}>
//                     {moment(record.date).isSame(moment(), 'day') ? 'Editable' : 'Read Only'}
//                   </Tag>
//                 )
//               }
//             ]}
//             pagination={false}
//             size="small"
//           />
//         ) : (
//           <Empty description="No travel history found" />
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default AdminTravelDashboard;





import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import {
  Table,
  Card,
  Statistic,
  DatePicker,
  Input,
  Button,
  Tag,
  message,
  Empty,
  Space,
  Select,
  Row,
  Col,
  Modal,
  Tooltip,
  Badge,
  Tabs,
  Progress
} from 'antd';
import {
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  BarChartOutlined,
  TeamOutlined,
  DashboardOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AdminTravelDashboard = () => {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    startDate: null,
    endDate: null,
    userId: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalDistanceIn: 0,
    totalDistanceOut: 0,
    totalTravelDistance: 0,
    netDistance: 0,
    uniqueUsersCount: 0,
    completedEntries: 0,
    completionRate: 0,
    averageTravelPerEntry: 0
  });
  const [todaySummary, setTodaySummary] = useState(null);
  const [monthlyOverview, setMonthlyOverview] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTravels, setUserTravels] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const API_URL = '/v1/travel';

  // Calculate total travel for display
  const calculateTotalTravel = (inDist, outDist) => {
    return Math.max(0, (outDist || 0) - (inDist || 0));
  };

  // Fetch travels data
  const fetchTravels = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : '',
        endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : ''
      };

      const response = await axios.get(`${API_URL}/admin/all`, { params });
      
      if (response.data.success) {
        setTravels(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      }
    } catch (error) {
      message.error('Failed to load travel data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's summary
  const fetchTodaySummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/today-summary`);
      if (response.data.success) {
        setTodaySummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching today summary:', error);
    }
  };

  // Fetch monthly overview
  const fetchMonthlyOverview = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/monthly-overview`);
      if (response.data.success) {
        setMonthlyOverview(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly overview:', error);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user-history/${userId}?limit=50`);
      if (response.data.success) {
        setUserTravels(response.data.data);
        setUserModalVisible(true);
      }
    } catch (error) {
      message.error('Failed to load user details');
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      sortBy: sorter.field || 'date',
      sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      startDate: null,
      endDate: null,
      userId: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  // Initial load
  useEffect(() => {
    fetchTravels();
    fetchTodaySummary();
    fetchMonthlyOverview();
  }, [filters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTravels();
      fetchTodaySummary();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Chart options for monthly data
  const getChartOptions = () => {
    if (!monthlyOverview || !monthlyOverview.dailyData) {
      return null;
    }

    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent'
      },
      title: {
        text: `Monthly Travel - ${monthlyOverview.monthName}`,
        style: { color: '#1F2937', fontSize: '16px' }
      },
      subtitle: {
        text: `Total Travel: ${monthlyOverview.stats.totalTravelDistance.toFixed(1)} km | Net: ${monthlyOverview.stats.netDistance.toFixed(1)} km`,
        style: { color: '#6B7280' }
      },
      xAxis: {
        categories: monthlyOverview.dailyData.map(d => d.day),
        crosshair: true,
        title: {
          text: 'Day of Month',
          style: { color: '#6B7280' }
        },
        labels: {
          style: { color: '#6B7280' }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Distance (km)',
          style: { color: '#6B7280' }
        },
        labels: {
          style: { color: '#6B7280' }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">Day {point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f} km</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: false
          }
        }
      },
      series: [{
        name: 'Starting Point (In)',
        data: monthlyOverview.dailyData.map(d => d.totalDistanceIn),
        color: '#059669'
      }, {
        name: 'Travel Distance',
        data: monthlyOverview.dailyData.map(d => d.totalTravelDistance),
        color: '#3B82F6'
      }]
    };
  };

  const columns = [
    {
      title: 'User',
      dataIndex: ['userId', 'username'],
      key: 'username',
      width: 150,
      render: (username, record) => (
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
          onClick={() => {
            setSelectedUser(record.userId);
            fetchUserDetails(record.userId._id);
          }}
        >
          <UserOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">{username}</div>
            <div className="text-xs text-gray-500">
              {record.userId?.name || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: true
    },
    {
      title: 'Start (In)',
      dataIndex: 'distanceIn',
      key: 'distanceIn',
      width: 100,
      render: (distance) => (
        <div className="flex items-center gap-1">
          <HomeOutlined className="text-green-500" />
          <span className="font-medium">{distance || 0} km</span>
        </div>
      )
    },
    {
      title: 'End (Out)',
      dataIndex: 'distanceOut',
      key: 'distanceOut',
      width: 100,
      render: (distance) => (
        <div className="flex items-center gap-1">
          <EnvironmentOutlined className="text-red-500" />
          <span className="font-medium">{distance || 0} km</span>
        </div>
      )
    },
    {
      title: 'Total Travel',
      dataIndex: 'totalDistance',
      key: 'totalDistance',
      width: 120,
      render: (distance, record) => {
        const calculated = calculateTotalTravel(record.distanceIn, record.distanceOut);
        return (
          <div className="flex flex-col">
            <Tag color="blue" className="font-bold mb-1">
              {calculated.toFixed(1)} km
            </Tag>
            <div className="text-xs text-gray-500">
              {record.distanceOut || 0} - {record.distanceIn || 0}
            </div>
          </div>
        );
      },
      sorter: true
    },
    {
      title: 'Net',
      key: 'net',
      width: 100,
      render: (_, record) => {
        const net = (record.distanceOut || 0) - (record.distanceIn || 0);
        return (
          <Tag color={net >= 0 ? 'green' : 'red'}>
            {net.toFixed(1)} km
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const isToday = moment(record.date).isSame(moment(), 'day');
        const completed = record.inEntered && record.outEntered;
        
        let status, icon, color;
        
        if (completed) {
          status = 'Completed';
          icon = <CheckCircleOutlined />;
          color = 'success';
        } else if (isToday) {
          status = 'In Progress';
          icon = <ClockCircleOutlined />;
          color = 'processing';
        } else {
          status = 'Incomplete';
          icon = <ClockCircleOutlined />;
          color = 'warning';
        }
        
        return (
          <Badge
            status={color}
            text={
              <span className="flex items-center gap-1">
                {icon}
                {status}
              </span>
            }
          />
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Tooltip title="View User Details">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedUser(record.userId);
              fetchUserDetails(record.userId._id);
            }}
          />
        </Tooltip>
      )
    }
  ];

  const chartOptions = getChartOptions();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <DashboardOutlined className="text-blue-500" />
              Travel Management Dashboard (Admin View)
            </h1>
            <p className="text-gray-600">
              View only - Users can add, Admin can view
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchTravels();
                fetchTodaySummary();
                fetchMonthlyOverview();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
        <TabPane tab={<span><DashboardOutlined /> Overview</span>} key="overview" />
        <TabPane tab={<span><BarChartOutlined /> Analytics</span>} key="analytics" />
        <TabPane tab={<span><TeamOutlined /> Users</span>} key="users" />
      </Tabs>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Today's Summary */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={6}>
              <Card className="shadow-lg">
                <Statistic
                  title="Today's Users"
                  value={todaySummary?.totalUsers || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3B82F6' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="shadow-lg">
                <Statistic
                  title="Today's Travel"
                  value={todaySummary?.totalTravelDistance || 0}
                  suffix="km"
                  prefix={<CarOutlined />}
                  valueStyle={{ color: '#059669' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="shadow-lg">
                <Statistic
                  title="Completion Rate"
                  value={todaySummary?.completionRate || 0}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#8B5CF6' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="shadow-lg">
                <Statistic
                  title="Today's Net"
                  value={todaySummary?.netDistance || 0}
                  suffix="km"
                  prefix={<CalculatorOutlined />}
                  valueStyle={{ 
                    color: todaySummary?.netDistance >= 0 ? '#10B981' : '#EF4444'
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Overall Stats */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={8}>
              <Card className="shadow-lg">
                <Statistic
                  title="Total Travel (All Time)"
                  value={stats.totalTravelDistance}
                  suffix="km"
                  precision={1}
                  valueStyle={{ color: '#8B5CF6', fontSize: '24px' }}
                />
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Start Total:</span>
                    <span>{stats.totalDistanceIn.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Total:</span>
                    <span>{stats.totalDistanceOut.toFixed(1)} km</span>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <Statistic
                    title="Completion Rate"
                    value={stats.completionRate}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: '#F59E0B', fontSize: '24px' }}
                  />
                  <Progress
                    type="circle"
                    percent={stats.completionRate}
                    width={60}
                    strokeColor="#F59E0B"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span>{stats.completedEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Entries:</span>
                    <span>{stats.totalRecords}</span>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-lg">
                <Statistic
                  title="Net Distance"
                  value={stats.netDistance}
                  suffix="km"
                  precision={1}
                  valueStyle={{ 
                    color: stats.netDistance >= 0 ? '#10B981' : '#EF4444',
                    fontSize: '24px'
                  }}
                />
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">Calculation:</div>
                  <div className="text-lg font-medium">
                    End ({stats.totalDistanceOut.toFixed(1)}) - Start ({stats.totalDistanceIn.toFixed(1)}) = {stats.netDistance.toFixed(1)} km
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card className="mb-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                placeholder="Search by username, name, mobile"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
              />
              
              <RangePicker
                style={{ width: '100%' }}
                value={[filters.startDate, filters.endDate]}
                onChange={(dates) => setFilters({
                  ...filters,
                  startDate: dates?.[0] || null,
                  endDate: dates?.[1] || null
                })}
              />
              
              <div className="flex gap-3">
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={handleSearch}
                >
                  Apply Filters
                </Button>
                <Button onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Show:</span>
                <Select
                  value={filters.limit}
                  style={{ width: 100 }}
                  onChange={(value) => setFilters({ ...filters, limit: value })}
                >
                  <Option value={10}>10 rows</Option>
                  <Option value={20}>20 rows</Option>
                  <Option value={50}>50 rows</Option>
                  <Option value={100}>100 rows</Option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Travels Table */}
          <Card 
            className="shadow-lg" 
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  Travel Records ({pagination.total})
                </span>
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </div>
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={travels}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} records`
              }}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
            />
          </Card>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          <Card className="shadow-lg mb-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Monthly Analytics</h3>
              {monthlyOverview && monthlyOverview.stats && (
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Monthly Travel"
                        value={monthlyOverview.stats.totalTravelDistance}
                        suffix="km"
                        valueStyle={{ color: '#8B5CF6' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Monthly Start"
                        value={monthlyOverview.stats.totalDistanceIn}
                        suffix="km"
                        valueStyle={{ color: '#10B981' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Monthly End"
                        value={monthlyOverview.stats.totalDistanceOut}
                        suffix="km"
                        valueStyle={{ color: '#EF4444' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Monthly Net"
                        value={monthlyOverview.stats.netDistance}
                        suffix="km"
                        valueStyle={{ 
                          color: monthlyOverview.stats.netDistance >= 0 ? '#10B981' : '#EF4444'
                        }}
                      />
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
            
            {chartOptions ? (
              <div className="mt-6">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartOptions}
                />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No data available for chart"
              />
            )}
          </Card>

          {/* Top Users */}
          {monthlyOverview && monthlyOverview.topUsers && monthlyOverview.topUsers.length > 0 && (
            <Card className="shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Top Travelers This Month</h3>
              <Row gutter={[16, 16]}>
                {monthlyOverview.topUsers.map((user, index) => (
                  <Col span={8} key={user.userId}>
                    <Card size="small" className="hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <UserOutlined className="text-blue-500" />
                        </div>
                        <div>
                          <div className="font-semibold">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.name}</div>
                        </div>
                        <div className="ml-auto">
                          <Badge 
                            count={index + 1} 
                            style={{ backgroundColor: index < 3 ? '#3B82F6' : '#6B7280' }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Travel:</span>
                          <span className="font-semibold">{user.totalTravelDistance.toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Net:</span>
                          <span className={`font-semibold ${user.netDistance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {user.netDistance.toFixed(1)} km
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Days:</span>
                          <span>{user.daysCompleted}</span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Active Users</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {travels.slice(0, 12).map((travel, index) => {
              const total = calculateTotalTravel(travel.distanceIn, travel.distanceOut);
              const net = (travel.distanceOut || 0) - (travel.distanceIn || 0);
              
              return (
                <Card key={index} size="small" className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <UserOutlined className="text-blue-500" />
                      </div>
                      <div>
                        <div className="font-semibold">{travel.userId?.username}</div>
                        <div className="text-sm text-gray-500">{travel.userId?.name}</div>
                      </div>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedUser(travel.userId);
                        fetchUserDetails(travel.userId._id);
                      }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Today's Travel</div>
                      <div className="font-semibold">{total.toFixed(1)} km</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Start</div>
                      <div className="font-semibold text-green-600">{travel.distanceIn || 0} km</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">End</div>
                      <div className="font-semibold text-red-600">{travel.distanceOut || 0} km</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs">
                    <div className="flex justify-between">
                      <span>Net:</span>
                      <span className={net >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {net.toFixed(1)} km
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Calculation:</span>
                      <span>{travel.distanceOut || 0} - {travel.distanceIn || 0}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* User Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <UserOutlined />
            <div>
              <div className="font-bold text-lg">{selectedUser?.username}</div>
              <div className="text-sm text-gray-500">{selectedUser?.name}</div>
            </div>
          </div>
        }
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={900}
      >
        {userTravels.length > 0 ? (
          <>
            {/* User Summary */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Travel Summary</h4>
              <Row gutter={16}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Records"
                      value={userTravels.length}
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Travel"
                      value={userTravels.reduce((sum, t) => sum + calculateTotalTravel(t.distanceIn, t.distanceOut), 0)}
                      suffix="km"
                      precision={1}
                      valueStyle={{ fontSize: '18px', color: '#059669' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Net Distance"
                      value={userTravels.reduce((sum, t) => sum + ((t.distanceOut || 0) - (t.distanceIn || 0)), 0)}
                      suffix="km"
                      precision={1}
                      valueStyle={{ fontSize: '18px', color: '#3B82F6' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Completion Rate"
                      value={(userTravels.filter(t => t.inEntered && t.outEntered).length / userTravels.length * 100)}
                      suffix="%"
                      precision={1}
                      valueStyle={{ fontSize: '18px', color: '#F59E0B' }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
            
            {/* Travel History Table */}
            <Table
              dataSource={userTravels}
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'date',
                  render: (date) => moment(date).format('DD/MM/YYYY'),
                  width: 100
                },
                {
                  title: 'Start (In)',
                  dataIndex: 'distanceIn',
                  render: (distance) => (
                    <div className="flex items-center gap-1">
                      <HomeOutlined className="text-green-500" />
                      <span className="font-medium">{distance} km</span>
                    </div>
                  ),
                  width: 100
                },
                {
                  title: 'End (Out)',
                  dataIndex: 'distanceOut',
                  render: (distance) => (
                    <div className="flex items-center gap-1">
                      <EnvironmentOutlined className="text-red-500" />
                      <span className="font-medium">{distance} km</span>
                    </div>
                  ),
                  width: 100
                },
                {
                  title: 'Travel Calculation',
                  render: (record) => {
                    const total = calculateTotalTravel(record.distanceIn, record.distanceOut);
                    return (
                      <div className="font-mono text-sm">
                        {record.distanceOut} - {record.distanceIn} = {total.toFixed(1)} km
                      </div>
                    );
                  },
                  width: 150
                },
                {
                  title: 'Net',
                  render: (record) => {
                    const net = (record.distanceOut || 0) - (record.distanceIn || 0);
                    return (
                      <Tag color={net >= 0 ? 'green' : 'red'}>
                        {net.toFixed(1)} km
                      </Tag>
                    );
                  },
                  width: 100
                },
                {
                  title: 'Status',
                  render: (record) => {
                    const isToday = moment(record.date).isSame(moment(), 'day');
                    const completed = record.inEntered && record.outEntered;
                    
                    if (completed) {
                      return <Tag color="success">Completed</Tag>;
                    } else if (isToday) {
                      return <Tag color="processing">In Progress</Tag>;
                    } else {
                      return <Tag color="warning">Incomplete</Tag>;
                    }
                  },
                  width: 100
                },
                {
                  title: 'Notes',
                  dataIndex: 'notes',
                  render: (notes) => (
                    <div className="max-w-xs truncate" title={notes}>
                      {notes || '-'}
                    </div>
                  )
                }
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              rowKey="_id"
              scroll={{ x: 800 }}
            />
          </>
        ) : (
          <Empty description="No travel history found for this user" />
        )}
      </Modal>
    </div>
  );
};

export default AdminTravelDashboard;