import React from "react";
import { Table, Space, Button, Tag, Popconfirm, message, Spin } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons";
import { useDeleteMarquee, useMarquees } from "../../hooks/useMarquees";
 
const MarqueeList = ({ setEditMarqueeId, showDrawer }) => {
  const { data: marquees, isLoading, isError, error, refetch } = useMarquees();
  const deleteMarqueeMutation = useDeleteMarquee();

  const handleDelete = (id) => {
    deleteMarqueeMutation.mutate(id);
  };

  const columns = [
    {
      title: "Text",
      dataIndex: "text",
      key: "text",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Audience",
      dataIndex: "targetAudience",
      key: "targetAudience",
      render: (text) => <strong className="uppercase">{text}</strong>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => new Date(date).toLocaleString(),
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
            icon={<EditOutlined />}
            onClick={() => {
              setEditMarqueeId(record._id);
              showDrawer();
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this marquee?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
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
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditMarqueeId(null);
              showDrawer();
            }}
          >
            Add Marquee
          </Button>
          <Button icon={<SyncOutlined />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={Array.isArray(marquees) ? marquees : []}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default MarqueeList;