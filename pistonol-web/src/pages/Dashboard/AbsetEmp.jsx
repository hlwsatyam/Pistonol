// CompleteAttendanceDashboard.jsx
import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Table,
  Statistic,
  Tag,
  Space,
  Button,
  Modal,
  Descriptions,
  Avatar,
  Input,
  Select,
  Divider,
  Progress,
  Spin,
  Alert,
  message,
  Badge,
  Tooltip,
  Radio,
  Typography,
  Empty
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  BarChartOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  MobileOutlined,
  MailOutlined,
  ExportOutlined,
  WarningOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from '../../axiosConfig';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;
const { Title, Text } = Typography;

const CompleteAttendanceDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewType, setViewType] = useState('all'); // 'all', 'present', 'absent'
  const [loading, setLoading] = useState(false);

  // Single API call for everything
  const fetchAllData = async () => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const response = await axios.get(`/attendance/complete-data?date=${dateStr}`);
    return response.data;
  };

  const { data: allData, isLoading, refetch } = useQuery({
    queryKey: ['completeAttendance', selectedDate.format('YYYY-MM-DD')],
    queryFn: fetchAllData,
    keepPreviousData: true
  });

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date || dayjs());
  };

  // View employee details
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setDetailModalVisible(true);
  };

  // Refresh data
  const handleRefresh = () => {
    refetch();
    message.success('Data refreshed');
  };

  // Export to Excel
  const handleExport = () => {
    if (!allData?.employees) {
      message.warning('No data to export');
      return;
    }

    const dataForExport = allData.employees.map(emp => ({
      'Employee ID': emp._id,
      'Name': emp.name || 'N/A',
      'Mobile': emp.mobile || 'N/A',
      'Email': emp.email || 'N/A',
      'Role': emp.role || 'N/A',
      'Attendance Status': emp.attendance?.status || 'Absent',
      'Check-in Time': emp.attendance?.checkIn?.time ? 
        dayjs(emp.attendance.checkIn.time).format('DD/MM/YYYY HH:mm:ss') : 'Not Checked In',
      'Check-out Time': emp.attendance?.checkOut?.time ? 
        dayjs(emp.attendance.checkOut.time).format('DD/MM/YYYY HH:mm:ss') : 'Not Checked Out',
      'Working Hours': emp.attendance?.workingHours?.toFixed(2) || '0',
      'Location': emp.attendance?.checkIn?.address || 'N/A',
      'Check-in Image': emp.attendance?.checkIn?.image?.url ? 'Yes' : 'No',
      'Is Late': emp.attendance?.isLate ? 'Yes' : 'No',
      'Store': emp.store?.name || 'N/A',
      'Employee Created': dayjs(emp.createdAt).format('DD/MM/YYYY'),
      'Last Updated': dayjs(emp.updatedAt).format('DD/MM/YYYY HH:mm')
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    
    // Auto-size columns
    const wscols = [
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 12 },
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 30 },
      { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    ws['!cols'] = wscols;

    // Style header
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } }
    };
    
    for (let col = 0; col < wscols.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }

    XLSX.writeFile(wb, `attendance_report_${selectedDate.format('YYYY-MM-DD')}.xlsx`);
    message.success('Export completed');
  };

  // Get absent employees
  const absentEmployees = allData?.employees?.filter(emp => 
    !emp.attendance || emp.attendance.status === 'absent'
  ) || [];

  // Get present employees
  const presentEmployees = allData?.employees?.filter(emp => 
    emp.attendance?.status === 'present'
  ) || [];

  // Filter employees based on search and view type
  const filteredEmployees = (viewType === 'absent' ? absentEmployees : 
                            viewType === 'present' ? presentEmployees : 
                            allData?.employees || []).filter(emp => {
    const matchesSearch = searchText === '' || 
      (emp.name?.toLowerCase().includes(searchText.toLowerCase()) ||
       emp.mobile?.includes(searchText) ||
       emp.email?.toLowerCase().includes(searchText.toLowerCase()));
    
    return matchesSearch;
  });

  // Statistics
  const totalEmployees = allData?.employees?.length || 0;
  const presentCount = presentEmployees.length;
  const absentCount = absentEmployees.length;
  const attendanceRate = totalEmployees > 0 ? 
    ((presentCount / totalEmployees) * 100).toFixed(1) : 0;

  // Table columns
  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <Avatar 
            src={record.photo?.url} 
            icon={<UserOutlined />}
            size="small"
            style={{ backgroundColor: record.attendance?.status === 'present' ? '#52c41a' : '#f5222d' }}
          />
          <div>
            <div style={{ fontWeight: '500' }}>{text || 'No Name'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.role || 'N/A'}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MobileOutlined style={{ fontSize: '12px' }} />
            {record.mobile || 'N/A'}
          </div>
          {record.email && (
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
              <MailOutlined style={{ fontSize: '10px' }} /> {record.email}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Attendance Status',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const attendance = record.attendance;
        
        if (!attendance) {
          return (
            <Tag 
              color="red" 
              icon={<CloseCircleOutlined />}
              style={{ margin: 0, padding: '2px 8px', fontWeight: '500' }}
            >
              ABSENT
            </Tag>
          );
        }

        const statusConfig = {
          present: { color: 'green', icon: <CheckCircleOutlined />, text: 'PRESENT' },
          'half-day': { color: 'orange', icon: <ClockCircleOutlined />, text: 'HALF DAY' },
          leave: { color: 'blue', icon: <WarningOutlined />, text: 'LEAVE' },
          absent: { color: 'red', icon: <CloseCircleOutlined />, text: 'ABSENT' }
        };

        const config = statusConfig[attendance.status] || statusConfig.absent;

        return (
          <div>
            <Tag 
              color={config.color} 
              icon={config.icon}
              style={{ margin: 0, padding: '2px 8px', fontWeight: '500' }}
            >
              {config.text}
            </Tag>
            {attendance.isLate && (
              <Tag 
                color="orange" 
                style={{ marginTop: '4px', fontSize: '11px' }}
              >
                Late
              </Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Check-in / Check-out',
      key: 'timings',
      width: 160,
      render: (_, record) => {
        const attendance = record.attendance;
        
        if (!attendance) {
          return (
            <div style={{ color: '#999', fontStyle: 'italic' }}>
              No attendance
            </div>
          );
        }

        return (
          <div>
            <div style={{ fontSize: '12px' }}>
              <strong>IN:</strong>{' '}
              {attendance.checkIn?.time ? 
                dayjs(attendance.checkIn.time).format('HH:mm') : '--:--'}
            </div>
            <div style={{ fontSize: '12px' }}>
              <strong>OUT:</strong>{' '}
              {attendance.checkOut?.time ? 
                dayjs(attendance.checkOut.time).format('HH:mm') : '--:--'}
            </div>
            {attendance.workingHours > 0 && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                <ClockCircleOutlined /> {attendance.workingHours.toFixed(1)} hrs
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Location',
      key: 'location',
      width: 180,
      render: (_, record) => {
        const attendance = record.attendance;
        
        if (!attendance?.checkIn?.address) {
          return <span style={{ color: '#999' }}>N/A</span>;
        }

        const shortAddress = attendance.checkIn.address.length > 25 
          ? attendance.checkIn.address.substring(0, 25) + '...'
          : attendance.checkIn.address;

        return (
          <Tooltip title={attendance.checkIn.address}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontSize: '12px'
            }}>
              <EnvironmentOutlined style={{ color: '#1890ff' }} />
              <span>{shortAddress}</span>
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Store',
      key: 'store',
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          {record.store?.name || 'N/A'}
        </div>
      )
    },
    {
      title: 'Proof',
      key: 'proof',
      width: 80,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {record.attendance?.checkIn?.image?.url ? (
            <CheckOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
          ) : (
            <CloseOutlined style={{ color: '#f5222d', fontSize: '16px' }} />
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="View details">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewEmployee(record)}
            size="small"
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Employee Attendance Dashboard
            </Title>
            <Text type="secondary">
              Complete attendance management for all company employees
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                Export Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics and Filters Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {/* Statistics Cards */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card 
                bordered={false}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <Statistic
                  title="Total Employees"
                  value={totalEmployees}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '28px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                bordered={false}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <Statistic
                  title="Present Today"
                  value={presentCount}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                bordered={false}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <Statistic
                  title="Absent Today"
                  value={absentCount}
                  prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
                  valueStyle={{ color: '#f5222d', fontSize: '28px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                bordered={false}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <Statistic
                  title="Attendance Rate"
                  value={attendanceRate}
                  suffix="%"
                  prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1', fontSize: '28px' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Filters Card */}
        <Col span={24}>
          <Card 
            title="Filters & Controls"
            style={{ borderRadius: '8px' }}
            extra={
              <Text type="secondary">
                {selectedDate.format('DD MMMM YYYY')}
              </Text>
            }
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '8px', fontWeight: '500' }}>
                  <CalendarOutlined /> Select Date
                </div>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  size="large"
                  allowClear={false}
                />
              </Col>
              
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '8px', fontWeight: '500' }}>
                  <FilterOutlined /> View Type
                </div>
                <Radio.Group 
                  value={viewType} 
                  onChange={(e) => setViewType(e.target.value)}
                  style={{ width: '100%' }}
                  buttonStyle="solid"
                >
                  <Radio.Button value="all" style={{ width: '33.33%', textAlign: 'center' }}>
                    All
                  </Radio.Button>
                  <Radio.Button value="present" style={{ width: '33.33%', textAlign: 'center' }}>
                    Present
                  </Radio.Button>
                  <Radio.Button value="absent" style={{ width: '33.33%', textAlign: 'center' }}>
                    Absent
                  </Radio.Button>
                </Radio.Group>
              </Col>
              
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '8px', fontWeight: '500' }}>
                  <SearchOutlined /> Search Employee
                </div>
                <Input
                  placeholder="Name, mobile, or email"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  prefix={<SearchOutlined />}
                />
              </Col>
              
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '8px', fontWeight: '500' }}>
                  &nbsp;
                </div>
                <Button
                  type="primary"
                  block
                  onClick={handleRefresh}
                  loading={isLoading}
                  size="large"
                  icon={<ReloadOutlined />}
                >
                  Update Data
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Title level={5} style={{ margin: 0 }}>
            Attendance Progress - {selectedDate.format('DD MMMM YYYY')}
          </Title>
        </div>
        <Progress
          percent={parseFloat(attendanceRate)}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          strokeWidth={20}
          format={(percent) => `${percent?.toFixed(1)}%`}
          style={{ marginBottom: '16px' }}
        />
        <Row justify="space-between">
          <Col>
            <Badge color="green" text={`Present: ${presentCount} employees`} />
          </Col>
          <Col>
            <Badge color="red" text={`Absent: ${absentCount} employees`} />
          </Col>
          <Col>
            <Text type="secondary">
              Total: {totalEmployees} employees
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main Table Card */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>
              Employee List {viewType !== 'all' && `(${viewType.toUpperCase()})`}
            </span>
            <Tag color={viewType === 'absent' ? 'red' : viewType === 'present' ? 'green' : 'blue'}>
              {filteredEmployees.length} employees
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Text type="secondary">
              Showing {filteredEmployees.length} of {totalEmployees}
            </Text>
          </Space>
        }
        style={{ borderRadius: '8px' }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading attendance data...</div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <div>No employees found</div>
                <Text type="secondary">
                  {searchText ? 'Try a different search term' : 
                   viewType === 'absent' ? 'No absent employees for today' :
                   viewType === 'present' ? 'No present employees for today' :
                   'No employees found in the system'}
                </Text>
              </div>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="_id"
            scroll={{ x: 1300 }}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} employees`,
              size: 'default',
              style: { marginTop: '16px' }
            }}
            size="middle"
            bordered
            loading={isLoading}
            rowClassName={(record) => 
              !record.attendance ? 'absent-row' : 
              record.attendance.status === 'present' ? 'present-row' : ''
            }
          />
        )}
      </Card>

      {/* Absent Employees Summary Card */}
      {absentCount > 0 && (
        <Card 
          title={
            <Space>
              <WarningOutlined style={{ color: '#f5222d' }} />
              <span>Absent Employees Summary</span>
              <Tag color="red">{absentCount} employees</Tag>
            </Space>
          }
          style={{ marginTop: '24px', borderRadius: '8px', borderColor: '#ffccc7' }}
        >
          <Row gutter={[16, 16]}>
            {absentEmployees.slice(0, 6).map(emp => (
              <Col xs={24} sm={12} md={8} lg={6} key={emp._id}>
                <Card 
                  size="small"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewEmployee(emp)}
                  hoverable
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar 
                        src={emp.photo?.url} 
                        icon={<UserOutlined />}
                        size="small"
                        style={{ backgroundColor: '#f5222d' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>{emp.name || 'No Name'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {emp.mobile || 'No contact'}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      Role: {emp.role || 'N/A'}
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
            {absentEmployees.length > 6 && (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <Text type="secondary">
                    And {absentEmployees.length - 6} more absent employees...
                  </Text>
                </div>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

// Employee Detail Modal Component
const EmployeeDetailModal = ({ employee, visible, onClose }) => {
  const attendance = employee.attendance;
  const statusColors = {
    present: 'green',
    'half-day': 'orange',
    leave: 'blue',
    absent: 'red'
  };

  return (
    <Modal
      title={
        <Space>
          <Avatar 
            src={employee.photo?.url} 
            icon={<UserOutlined />}
            size="small"
          />
          <span>Employee Details</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      centered
    >
      <Row gutter={[24, 24]}>
        {/* Employee Info */}
        <Col span={24}>
          <Card size="small">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Avatar 
                    src={employee.photo?.url} 
                    icon={<UserOutlined />}
                    size={64}
                    style={{ 
                      backgroundColor: attendance?.status === 'present' ? '#52c41a' : '#f5222d' 
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: 0 }}>
                      {employee.name || 'No Name'}
                    </Title>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color="blue">{employee.role || 'N/A'}</Tag>
                      {employee.email && (
                        <Tag color="cyan" style={{ marginLeft: '8px' }}>
                          <MailOutlined /> {employee.email}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Mobile">
                    {employee.mobile || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Store">
                    {employee.store?.name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {dayjs(employee.createdAt).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              
              <Col xs={24} sm={12}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Status">
                    <Tag 
                      color={statusColors[attendance?.status] || 'default'}
                      style={{ fontWeight: 'bold' }}
                    >
                      {(attendance?.status || 'ABSENT').toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  {attendance?.isLate && (
                    <Descriptions.Item label="Late Mark">
                      <Tag color="orange">LATE</Tag>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Working Hours">
                    {attendance?.workingHours?.toFixed(2) || '0'} hours
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Attendance Details */}
        {attendance && (
          <>
            <Col span={24}>
              <Divider orientation="left">Attendance Details</Divider>
            </Col>
            
            <Col xs={24} sm={12}>
              <Card title="Check-in" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>Time:</strong>{' '}
                    {dayjs(attendance.checkIn?.time).format('DD/MM/YYYY HH:mm:ss')}
                  </div>
                  <div>
                    <strong>Location:</strong>{' '}
                    {attendance.checkIn?.address || 'N/A'}
                  </div>
                  {attendance.checkIn?.location && (
                    <div>
                      <strong>Coordinates:</strong>{' '}
                      {attendance.checkIn.location.latitude}, {attendance.checkIn.location.longitude}
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} sm={12}>
              <Card title="Check-out" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>Time:</strong>{' '}
                    {attendance.checkOut?.time ? 
                      dayjs(attendance.checkOut.time).format('DD/MM/YYYY HH:mm:ss') : 
                      'Not checked out'}
                  </div>
                  {attendance.checkOut?.address && (
                    <div>
                      <strong>Location:</strong>{' '}
                      {attendance.checkOut.address}
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
            
            {attendance.checkIn?.image?.url && (
              <Col span={24}>
                <Card title="Check-in Proof Image" size="small">
                  <img
                    src={attendance.checkIn.image.url}
                    alt="Check-in proof"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9'
                    }}
                  />
                </Card>
              </Col>
            )}
          </>
        )}

        {!attendance && (
          <Col span={24}>
            <Alert
              message="No Attendance Record"
              description="This employee has not marked attendance for today."
              type="warning"
              showIcon
            />
          </Col>
        )}
      </Row>
    </Modal>
  );
};

export default CompleteAttendanceDashboard;