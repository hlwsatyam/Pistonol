import React, { useState } from 'react';
import { Table, Tag, Space, Button, Input, Select, Skeleton, Pagination, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axiosInstance from '../../axiosConfig';

const { Search } = Input;
const { Option } = Select;

const statusColors = {
  New: 'blue',
  Contacted: 'orange',
  Qualified: 'green',
  Lost: 'red',
};

const fetchLeads = async (page = 1, pageSize = 10, search = '', status = '') => {
  const queryParams = new URLSearchParams({
    page,
    limit: pageSize,
    search,
    status,
  }).toString();

  const response = await axiosInstance.get(`/analytics/leads?${queryParams}`);
  
  return response.json();
};

const LeadList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const {
    data: leadsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['leads', currentPage, pageSize, searchText, statusFilter],
    queryFn: () => fetchLeads(currentPage, pageSize, searchText, statusFilter),
    keepPreviousData: true,
  });

  const columns = [
    {
      title: 'Garage Name',
      dataIndex: 'garageName',
      key: 'garageName',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/leads/${record._id}`)}>
          {text}
        </Button>
      ),
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
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <span>
          {record.city}, {record.state} - {record.pincode}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]} key={status}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Feedbacks',
      key: 'feedbacks',
      render: (_, record) => (
        <span>{record.feedbacks?.length || 0} feedbacks</span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => navigate(`/leads/${record._id}/history`)}>
            History
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  if (isError) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Lead Management</h1>
        <Button type="primary" onClick={() => navigate('/leads/new')}>
          Add New Lead
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Search
          placeholder="Search by garage or contact"
          allowClear
          enterButton
          size="large"
          onSearch={handleSearch}
          className="w-full md:w-1/2"
        />
        <Select
          placeholder="Filter by status"
          allowClear
          size="large"
          onChange={handleStatusChange}
          className="w-full md:w-1/4"
        >
          <Option value="New">New</Option>
          <Option value="Contacted">Contacted</Option>
          <Option value="Qualified">Qualified</Option>
          <Option value="Lost">Lost</Option>
        </Select>
      </div>

      <Divider />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} active paragraph={{ rows: 1 }} />
          ))}
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={leadsData?.data || []}
            rowKey="_id"
            pagination={false}
            className="mb-4"
          />
          <div className="flex justify-end">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={leadsData?.total || 0}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Total ${total} leads`}
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LeadList;