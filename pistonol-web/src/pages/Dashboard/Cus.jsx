import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Input, Button, Modal, Skeleton, notification } from 'antd';
import axios from '../../axiosConfig';
import { debounce } from 'lodash';
import { SearchOutlined } from '@ant-design/icons';
 

const { Search } = Input;

const fetchCustomers = async ({ page, pageSize, searchText, sortField, sortOrder }) => {
  const { data } = await axios.get('/customer', {
    params: { page, limit: pageSize, search: searchText, sortField, sortOrder },
  });
  return data;
};

const CustomerTable = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState({ field: 'createdAt', order: 'descend' });
  const [searchText, setSearchText] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', pagination.current, pagination.pageSize, searchText, sorter.field, sorter.order],
    queryFn: () => fetchCustomers({
      page: pagination.current,
      pageSize: pagination.pageSize,
      searchText,
      sortField: sorter.field,
      sortOrder: sorter.order,
    }),
    keepPreviousData: true,
  });

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchText(value);
      setPagination({ ...pagination, current: 1 });
    }, 500),
    [pagination]
  );

  const handleTableChange = (newPagination, _, newSorter) => {
    const sortDetails = {
      field: newSorter.field || 'createdAt',
      order: newSorter.order || 'descend',
    };
    setSorter(sortDetails);
    setPagination(newPagination);
  };

  const showModal = async (id) => {
    setModalOpen(true);
    try {
      const { data } = await axios.get(`/customer/${id}`);
      setSelectedCustomer(data);
    } catch (err) {
      notification.error({
        message: 'Failed to Fetch Details',
        description: 'Could not retrieve customer details.',
      });
    }
  };

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username', sorter: true },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: true },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: true },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', sorter: true },
    { title: 'Wallet', dataIndex: 'wallet', key: 'wallet', sorter: true, render: (wallet) => `₹${wallet}` },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" onClick={() => showModal(record._id)}>
          View
        </Button>
      ),
    },
  ];

  if (error) {
    notification.error({
      message: 'Failed to Fetch Customers',
      description: 'Error fetching customer data. Please try again.',
    });
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Customer Management</h1>
      <div className="mb-4 flex justify-end">
        <Search
          placeholder="Search by username, name, email, or mobile"
          onChange={(e) => debouncedSearch(e.target.value)}
          allowClear
          prefix={<SearchOutlined />}
          className="w-96"
        />
      </div>
      <Skeleton loading={isLoading && !data?.data.length} active paragraph={{ rows: 5 }}>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="_id"
          pagination={{ ...pagination, total: data?.total || 0 }}
          loading={isLoading}
          onChange={handleTableChange}
          bordered
          scroll={{ x: 'max-content' }}
          className="bg-white shadow-md rounded-lg"
        />
      </Skeleton>
      <Modal
        open={modalOpen}
        title="Customer Details"
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
      >
        {selectedCustomer ? (
          <div className="space-y-3 text-gray-700">
            <p><strong>Username:</strong> {selectedCustomer.username}</p>
            <p><strong>Name:</strong> {selectedCustomer.name}</p>
            <p><strong>Email:</strong> {selectedCustomer.email}</p>
            <p><strong>Mobile:</strong> {selectedCustomer.mobile}</p>
            <p><strong>Wallet:</strong> ₹{selectedCustomer.wallet}</p>
            <p><strong>Address:</strong> {selectedCustomer.address || 'N/A'}</p>
            <p><strong>State:</strong> {selectedCustomer.state || 'N/A'}</p>
            <p><strong>District:</strong> {selectedCustomer.district || 'N/A'}</p>
            <p><strong>Pincode:</strong> {selectedCustomer.pincode || 'N/A'}</p>
          </div>
        ) : (
          <Skeleton active />
        )}
      </Modal>
    </div>
  );
};

export default CustomerTable;