import React, { useState } from "react";
import { Table, Space, Button, Tag, Popconfirm, message, Spin, Image, Input, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SyncOutlined,
  SearchOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { useDeleteQRCode, useQRCodes } from "../../hooks/useQRCodes";

const { Option } = Select;

const QRCodeList = ({ setEditQRId, showDrawer }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 3,
    search: '',
    status: '',
    batch: ''
  });

  const { data: qrData, isLoading, isError, error, refetch } = useQRCodes(filters);
  const deleteQRCodeMutation = useDeleteQRCode();

  const handleDelete = (id) => {
    deleteQRCodeMutation.mutate(id, {
      onSuccess: () => {
        // Refetch data after successful deletion
        refetch();
      }
    });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize
    }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1 // Reset to first page when searching
    }));
  };

  const handleStatusFilter = (value) => {
    setFilters(prev => ({
      ...prev,
      status: value,
      page: 1 // Reset to first page when filtering
    }));
  };

 

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 4,
      search: '',
      status: '',
      batch: ''
    });
  };

  const columns = [
    {
      title: "QR Code",
      dataIndex: "value",
      key: "value",
      render: (value, record) => (
        <Image
          width={50}
          src={
            record.imageUrl
              ? `${import.meta.env.VITE_BackendURL}${record.imageUrl}`
              : `https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${value}`
          }
          alt={value}
        />
      ),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text  , rec ) => <strong>
        
        
        {text}
    <p>
      {
        rec.client
      }
    </p>
      
      </strong>,
    },
    {
      title: "Batch",
      dataIndex: "batchNumber",
      key: "batchNumber",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color;
        switch (status) {
          case "active":
            color = "green";
            break;
          case "used":
            color = "red";
            break;
          case "inactive":
            color = "gray";
            break;
          default:
            color = "blue";
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            disabled={record.status==="used"}
            icon={<EditOutlined />}
            onClick={() => {
              setEditQRId(record._id);
              showDrawer();
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this QR code?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button   disabled={record.status==="used"} danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <Spin size="large" />;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditQRId(null);
              showDrawer();
            }}
          >
            Generate QR Codes
          </Button>
          <Button icon={<SyncOutlined />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Space>
        
        <Space style={{ marginLeft: 'auto' }}>
        
          
          <Select
            placeholder="Filter by status"
            value={filters.status || undefined}
            onChange={handleStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="active">Active</Option>
            <Option value="used">Used</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
          
          <Button 
            icon={<FilterOutlined />} 
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={qrData?.data || []}
        rowKey="_id"
        bordered
        pagination={{
          current: qrData?.pagination?.current || 1,
          pageSize: qrData?.pagination?.limit || 10,
          total: qrData?.pagination?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
        loading={isLoading}
      />
    </div>
  );
};

export default QRCodeList;