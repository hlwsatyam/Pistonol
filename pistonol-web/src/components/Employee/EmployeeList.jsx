import React, { useState } from "react";
import {
  Table,
  Space,
  Button,
  Tag,
  Popconfirm,
  message,
  Spin,
  Image,
  Badge,
  Typography,
  Modal,
  Descriptions,
  Divider,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  SyncOutlined,
  CalendarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDeleteUser, useUsers } from "../../utils/useUsers";

const { Text, Title } = Typography;

const EmployeeList = ({ setEditUserId, showDrawer }) => {
  const { data: users, isLoading, isError, error, refetch } = useUsers("company-employee");
  const deleteUserMutation = useDeleteUser();
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDelete = async (id) => {
    try {
      await deleteUserMutation.mutateAsync(id);
      message.success("User deleted successfully");
    } catch (error) {
      message.error("Failed to delete user");
    }
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Profile",
      dataIndex: "photo",
      key: "photo",
      width: 80,
      render: (photo, record) => (
        <div
          onClick={() => showUserDetails(record)}
          style={{ cursor: "pointer" }}
        >
          {photo?.url ? (
            <Image
              src={photo.url}
              width={50}
              height={50}
              style={{ borderRadius: "50%", objectFit: "cover" }}
              preview={false}
            />
          ) : (
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: "bold",
                color: "#666",
              }}
            >
              {record.name?.[0]?.toUpperCase() ||
                record.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div
          onClick={() => showUserDetails(record)}
          style={{ cursor: "pointer" }}
        >
          <Text strong>{name || record.username}</Text>
          {record.role === "company" && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              PRIMARY
            </Tag>
          )}
        </div>
      ),
      sorter: (a, b) =>
        (a.name || a.username).localeCompare(b.name || b.username),
    },











{
  title: "Verification",
  dataIndex: "isVerify",
  key: "isVerify",
  render: (_, record) => (
    <div
      onClick={() => showUserDetails(record)}
      style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
    >
      <Text strong>
      
        {record.isVerify ? (
          <Tag color="green" style={{ marginLeft: 8 }}>
            Verified
          </Tag>
        ) : (
          <Tag color="volcano" style={{ marginLeft: 8 }}>
            Not Verified
          </Tag>
        )}
      </Text>

     
    </div>
  ),
  sorter: (a, b) =>
    (a.username || "").localeCompare(b.username || ""),
}
,














    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Company", value: "company" },
        { text: "Employee", value: "company-employee" },
        { text: "Distributor", value: "distributor" },
        { text: "Dealer", value: "dealer" },
        { text: "Mechanic", value: "mechanic" },
        { text: "Customer", value: "customer" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        const roleConfig = {
          company: { color: "volcano", text: "Company" },
          "company-employee": { color: "orange", text: "Employee" },
          distributor: { color: "gold", text: "Distributor" },
          dealer: { color: "green", text: "Dealer" },
          mechanic: { color: "blue", text: "Mechanic" },
          customer: { color: "geekblue", text: "Customer" },
          admin: { color: "purple", text: "Admin" },
        };
        const config = roleConfig[role] || { color: "default", text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      render: (mobile) => mobile || "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditUserId(record._id);
              showDrawer();
            }}
          />
          {record.role !== "company" && (
            <Popconfirm
              title="Are you sure to delete this user?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
              placement="left"
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={
                  deleteUserMutation.isLoading &&
                  deleteUserMutation.variables === record._id
                }
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const UserDetailModal = () => (
    <Modal
      title={<Title level={4}>User Details</Title>}
      visible={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
      width={800}
      closeIcon={<CloseOutlined />}
    >
      {selectedUser && (
        <div>
          <Row gutter={24} align="middle" style={{ marginBottom: 24 }}>
            <Col span={6}>
              {selectedUser.photo?.url ? (
                <Image
                  src={selectedUser.photo.url}
                  width={120}
                  height={120}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                    fontWeight: "bold",
                    color: "#666",
                  }}
                >
                  {selectedUser.name?.[0]?.toUpperCase() ||
                    selectedUser.username?.[0]?.toUpperCase()}
                </div>
              )}
            </Col>
            <Col span={18}>
              <Title level={3}>
                {selectedUser.name || selectedUser.username}
                {selectedUser.role === "company" && (
                  <Tag color="red" style={{ marginLeft: 12, fontSize: 12 }}>
                    PRIMARY COMPANY
                  </Tag>
                )}
              </Title>
              <Tag
                color={
                  selectedUser.role === "company"
                    ? "volcano"
                    : selectedUser.role === "company-employee"
                    ? "orange"
                    : selectedUser.role === "distributor"
                    ? "gold"
                    : selectedUser.role === "dealer"
                    ? "green"
                    : selectedUser.role === "mechanic"
                    ? "blue"
                    : "geekblue"
                }
              >
                {selectedUser.role.toUpperCase()}
              </Tag>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Joined on{" "}
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </Col>
          </Row>

          <Divider orientation="left">Basic Information</Divider>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Username">
              {selectedUser.username}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email || <Text type="secondary">Not provided</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Mobile">
              {selectedUser.mobile}
            </Descriptions.Item>
            <Descriptions.Item label="Wallet Balance">
              <Badge
                count={`₹${selectedUser.wallet.toLocaleString("en-IN")}`}
                style={{
                  backgroundColor:
                    selectedUser.wallet > 0 ? "#52c41a" : "#d9d9d9",
                  color: selectedUser.wallet > 0 ? "#fff" : "#000",
                }}
              />
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Identification</Divider>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="PAN Number">
              {selectedUser.panNumber || (
                <Text type="secondary">Not provided</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Aadhaar Number">
              {selectedUser.aadhaarNumber || (
                <Text type="secondary">Not provided</Text>
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Address</Divider>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Address">
              {selectedUser.address || (
                <Text type="secondary">Not provided</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedUser.district ||
              selectedUser.state ||
              selectedUser.pincode ? (
                <>
                  {selectedUser.district && (
                    <Text>{selectedUser.district}, </Text>
                  )}
                  {selectedUser.state && <Text>{selectedUser.state} </Text>}
                  {selectedUser.pincode && (
                    <Text>- {selectedUser.pincode}</Text>
                  )}
                </>
              ) : (
                <Text type="secondary">Not provided</Text>
              )}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button
              type="primary"
              onClick={() => {
                setEditUserId(selectedUser._id);
                setModalVisible(false);
                showDrawer();
              }}
              icon={<EditOutlined />}
            >
              Edit User
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  if (isLoading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );

  if (isError)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="danger">Error loading users: {error.message}</Text>
        <Button
          type="primary"
          icon={<SyncOutlined />}
          onClick={() => refetch()}
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </div>
    );

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => {
            setEditUserId(null);
            showDrawer();
          }}
        >
          Add Employee
        </Button>
        <Button
          icon={<SyncOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users || []}
        rowKey="_id"
        bordered
        size="middle"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: true }}
        loading={isLoading}
      />

      <UserDetailModal />
    </div>
  );
};

export default EmployeeList;
