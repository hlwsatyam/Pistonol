 
import EmployeeForm from "../components/Employee/EmployeeForm";
import EmployeeList from "../components/Employee/EmployeeList";
 
function Employee() {
  const [visible, setVisible] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setEditUserId(null);
  };

  return (
    <Card title="Employee Management" bordered={false}>
      <EmployeeList setEditUserId={setEditUserId} showDrawer={showDrawer} />
      <EmployeeForm
        visible={visible}
        onClose={onClose}
        editUserId={editUserId}
      />




{/* <AdminTaskAssignment  /> */}


<AdminTaskAssignmentGlobal EmployeType="company-employee" />



    </Card>
  );
}

// // export default Employee;





// AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Spin,
  Image,
  Pagination,
  Row,
  Col,
  Badge,
  Avatar
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast'; 
import AdminTaskAssignment from "./TargetManagement";
import AdminTaskAssignmentGlobal from "./AdminTaskAssignmentGlobal";
 
 

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    dateRange: []
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        status: filters.status,
        startDate: filters.dateRange[0] || '',
        endDate: filters.dateRange[1] || ''
      });

      const response = await fetch(`${import.meta.env.VITE_BackendURL}/api/admin/attendance?${queryParams}`);
      const data = await response.json();
      
      setAttendanceData(data.attendance);
      setPagination({
        current: data.currentPage,
        pageSize: data.perPage,
        total: data.totalCount
      });
    } catch (error) {
      toast.error('Failed to fetch attendance data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch leave data
  const fetchLeaveData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        status: filters.status,
        startDate: filters.dateRange[0] || '',
        endDate: filters.dateRange[1] || ''
      });

      const response = await fetch(`${import.meta.env.VITE_BackendURL}/api/admin/leaves?${queryParams}`);
      const data = await response.json();
      
      setLeaveData(data.leaves);
      setPagination({
        current: data.currentPage,
        pageSize: data.perPage,
        total: data.totalCount
      });
    } catch (error) {
      toast.error('Failed to fetch leave data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceData();
    } else {
      fetchLeaveData();
    }
  }, [activeTab, filters, fetchAttendanceData, fetchLeaveData]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      dateRange: []
    });
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (value) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates, page: 1 }));
  };

  const handleTableChange = (pagination) => {
    setFilters(prev => ({ ...prev, page: pagination.current, limit: pagination.pageSize }));
  };

  const showDetails = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleApprove = async (id) => {
    setApprovalLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BackendURL}/api/admin/leaves/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('Leave approved successfully');
        fetchLeaveData();
        setDetailModalVisible(false);
      } else {
        toast.error('Failed to approve leave');
      }
    } catch (error) {
      toast.error('Error approving leave');
      console.error('Error:', error);
    } finally {
      setApprovalLoading(false);
    }
  };
 
  const handleReject = async (id) => {
    setApprovalLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BackendURL}/api/admin/leaves/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('Leave rejected successfully');
        fetchLeaveData();
        setDetailModalVisible(false);
      } else {
        toast.error('Failed to reject leave');
      }
    } catch (error) {
      toast.error('Error rejecting leave');
      console.error('Error:', error);
    } finally {
      setApprovalLoading(false);
    }
  };

  const attendanceColumns = [
    {
      title: 'Employee',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div className="flex items-center">
          <Avatar src={user?.avatar} icon={<UserOutlined />} className="mr-2" />
          <span>{user?.name}</span>
        </div>
      )
    },
    {
      title: 'Store',
      dataIndex: 'store',
      key: 'store',
      render: (store) => store?.name
    },
    {
      title: 'Check In',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (checkIn) => (
        <div>
          <div>{checkIn?.time ? new Date(checkIn.time).toLocaleString() : 'N/A'}</div>
          {checkIn?.address && (
            <div className="text-xs text-gray-500">
              <EnvironmentOutlined className="mr-1" />
              {checkIn.address}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (checkOut) => (
        <div>
          <div>{checkOut?.time ? new Date(checkOut.time).toLocaleString() : 'N/A'}</div>
          {checkOut?.address && (
            <div className="text-xs text-gray-500">
              <EnvironmentOutlined className="mr-1" />
              {checkOut.address}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Working Hours',
      dataIndex: 'workingHours',
      key: 'workingHours',
      render: (hours) => `${hours} hours`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        if (status === 'absent') color = 'red';
        if (status === 'half-day') color = 'orange';
        if (status === 'leave') color = 'blue';
        
        return (
          <Tag color={color} className="capitalize">
            {status.replace('-', ' ')}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => showDetails(record)}
        >
          View Details
        </Button>
      )
    }
  ];

  const leaveColumns = [
    {
      title: 'Employee',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div className="flex items-center">
          <Avatar src={user?.avatar} icon={<UserOutlined />} className="mr-2" />
          <span>{user?.name}</span>
        </div>
      )
    },
    {
      title: 'Leave Period',
      dataIndex: ['startDate', 'endDate'],
      key: 'period',
      render: (_, record) => (
        <div>
          <CalendarOutlined className="mr-1" />
          {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          'sick': 'Sick Leave',
          'casual': 'Casual Leave',
          'earned': 'Earned Leave',
          'without-pay': 'Without Pay'
        };
        return <Tag color="blue">{typeMap[type] || type}</Tag>;
      }
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === 'approved') color = 'green';
        if (status === 'rejected') color = 'red';
        if (status === 'cancelled') color = 'gray';
        
        return (
          <Tag color={color} className="capitalize">
            {status}
          </Tag>
        );
      }
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showDetails(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                icon={<CheckCircleOutlined />} 
                type="primary" 
                onClick={() => handleApprove(record._id)}
              >
                Approve
              </Button>
              <Button 
                icon={<CloseCircleOutlined />} 
                danger
                onClick={() => handleReject(record._id)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="admin-panel-container p-6">
      <h1 className="text-2xl font-bold mb-6">Employee Management System</h1>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Attendance Records" key="attendance">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search by employee or store"
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
              <Space>
                <Select
                  placeholder="Filter by status"
                  style={{ width: 150 }}
                  onChange={handleStatusFilter}
                  allowClear
                >
                  <Option value="present">Present</Option>
                  <Option value="absent">Absent</Option>
                  <Option value="half-day">Half Day</Option>
                  <Option value="leave">Leave</Option>
                </Select>
                <RangePicker onChange={handleDateRangeChange} />
                <Button icon={<FilterOutlined />}>More Filters</Button>
              </Space>
            </div>
            
            <Table
              columns={attendanceColumns}
              dataSource={attendanceData}
              rowKey="_id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          
          <TabPane tab="Leave Requests" key="leaves">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search by employee"
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
              <Space>
                <Select
                  placeholder="Filter by status"
                  style={{ width: 150 }}
                  onChange={handleStatusFilter}
                  allowClear
                >
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
                <RangePicker onChange={handleDateRangeChange} />
                <Button icon={<FilterOutlined />}>More Filters</Button>
              </Space>
            </div>
            
            <Table
              columns={leaveColumns}
              dataSource={leaveData}
              rowKey="_id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={activeTab === 'attendance' ? 'Attendance Details' : 'Leave Application Details'}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedRecord && activeTab === 'attendance' ? (
          <AttendanceDetails record={selectedRecord} />
        ) : (
          <LeaveDetails 
            record={selectedRecord} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            loading={approvalLoading}
          />
        )}
      </Modal>



<Employee/>


    </div>
  );
};

const AttendanceDetails = ({ record }) => {
  return (
    <div className="attendance-details">
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <h3 className="font-semibold">Employee Information</h3>
          <div className="flex items-center mt-2">
            <Avatar src={record.user?.avatar} size={64} icon={<UserOutlined />} />
            <div className="ml-4">
              <div className="text-lg font-medium">{record.user?.name}</div>
              <div className="text-gray-500">{record.user?.email}</div>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <h3 className="font-semibold">Store Information</h3>
          <div className="mt-2">
            <div className="text-lg">{record.store?.name}</div>
            <div className="text-gray-500">{record.store?.address}</div>
          </div>
        </Col>
      </Row>
      
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <Card title="Check-In Details" size="small">
            <div className="space-y-2">
              <div>
                <strong>Time:</strong> {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleString() : 'N/A'}
              </div>
              {record.checkIn?.address && (
                <div>
                  <strong>Location:</strong> {record.checkIn.address}
                </div>
              )}
              {record.checkIn?.image?.url && (
                <div>
                  <strong>Check-in Image:</strong>
                  <Image
                    width={200}
                    src={record.checkIn.image.url}
                    alt="Check-in proof"
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Check-Out Details" size="small">
            <div className="space-y-2">
              <div>
                <strong>Time:</strong> {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleString() : 'N/A'}
              </div>
              {record.checkOut?.address && (
                <div>
                  <strong>Location:</strong> {record.checkOut.address}
                </div>
              )}
              {record.checkOut?.image?.url && (
                <div>
                  <strong>Check-out Image:</strong>
                  <Image
                    width={200}
                    src={record.checkOut.image.url}
                    alt="Check-out proof"
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Working Hours" size="small">
            <div className="text-2xl font-bold text-center">{record.workingHours} hours</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Status" size="small">
            <div className="text-center">
              <Tag 
                color={
                  record.status === 'present' ? 'green' : 
                  record.status === 'absent' ? 'red' : 
                  record.status === 'half-day' ? 'orange' : 'blue'
                } 
                className="capitalize text-lg"
              >
                {record.status.replace('-', ' ')}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Date" size="small">
            <div className="text-center">
              {new Date(record.checkIn?.time || record.createdAt).toLocaleDateString()}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const LeaveDetails = ({ record, onApprove, onReject, loading }) => {
  return (
    <div className="leave-details">
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <h3 className="font-semibold">Employee Information</h3>
          <div className="flex items-center mt-2">
            <Avatar src={record.user?.avatar} size={64} icon={<UserOutlined />} />
            <div className="ml-4">
              <div className="text-lg font-medium">{record.user?.name}</div>
              <div className="text-gray-500">{record.user?.email}</div>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <h3 className="font-semibold">Leave Details</h3>
          <div className="mt-2 space-y-2">
            <div>
              <strong>Type:</strong> 
              <Tag color="blue" className="ml-2 capitalize">
                {record.type.replace('-', ' ')}
              </Tag>
            </div>
            <div>
              <strong>Status:</strong> 
              <Tag 
                color={
                  record.status === 'approved' ? 'green' : 
                  record.status === 'rejected' ? 'red' : 
                  record.status === 'cancelled' ? 'gray' : 'blue'
                } 
                className="ml-2 capitalize"
              >
                {record.status}
              </Tag>
            </div>
            <div>
              <strong>Period:</strong> 
              <span className="ml-2">
                {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <strong>Applied on:</strong> 
              <span className="ml-2">
                {new Date(record.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Col>
      </Row>
      
      <Card title="Reason for Leave" className="mb-4">
        <p>{record.reason}</p>
      </Card>
      
      {record.status === 'pending' && (
        <div className="flex justify-end space-x-2">
          <Button 
            icon={<CheckCircleOutlined />} 
            type="primary" 
            loading={loading}
            onClick={() => onApprove(record._id)}
          >
            Approve
          </Button>
          <Button 
            icon={<CloseCircleOutlined />} 
            danger
            loading={loading}
            onClick={() => onReject(record._id)}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;











