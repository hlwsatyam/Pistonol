import React from "react";
import { Table, Space, Button, Tag, Popconfirm, message, Spin, Image } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons";
import { useDeleteBanner, useBanners } from "../../hooks/useBanners";

const BannerList = ({ setEditBannerId, showDrawer }) => {
  const { data: banners, isLoading, isError, error, refetch } = useBanners();
  const deleteBannerMutation = useDeleteBanner();

  const handleDelete = (id) => {
    deleteBannerMutation.mutate(id);
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        <Image
          width={100}
          src={imageUrl}
          alt="Banner"
          style={{ borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Audience",
      dataIndex: "targetAudience",
      key: "targetAudience",
      render: (text) => <strong className="uppercase">{text}</strong>,
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (link) => link || '-',
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
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (position) => position.toUpperCase(),
    },
    {
      title: "Date Range",
      key: "dateRange",
      render: (_, record) => (
        <div>
          <div>Start: {new Date(record.startDate).toLocaleDateString()}</div>
          <div>End: {new Date(record.endDate).toLocaleDateString()}</div>
        </div>
      ),
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
              setEditBannerId(record._id);
              showDrawer();
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this banner?"
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
              setEditBannerId(null);
              showDrawer();
            }}
          >
            Add Banner
          </Button>
          <Button 
            icon={<SyncOutlined />} 
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={banners || []}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default BannerList;