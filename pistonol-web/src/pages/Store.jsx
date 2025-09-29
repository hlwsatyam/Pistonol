import React, { useState, useEffect } from "react";
import {
  Table, Space, Button, Tag, Popconfirm, Input, Skeleton,
  Drawer, Form, Input as AntInput, Switch, Spin, Select, Row, Col,
  message, Modal
} from "antd";
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  SearchOutlined, EnvironmentOutlined
} from "@ant-design/icons";
import { debounce } from "lodash";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

// Configure axios base URL
const axiosInstance = axios.create({
  baseURL:  import.meta.env.VITE_BackendURL,
});

// ================== API ==================
const fetchStores = async ({ queryKey }) => {
  const [_key, { page, pageSize, search }] = queryKey;
  const res = await axiosInstance.get("/api/v1/stores", {
    params: { page, limit: pageSize, search },
  });
  return res.data;
};

const deleteStore = async (id) => (await axiosInstance.delete(`/api/v1/stores/${id}`)).data;
const createStore = async (values) => (await axiosInstance.post(`/api/v1/stores`, values)).data;
const updateStore = async ({ id, values }) => (await axiosInstance.put(`/api/v1/stores/${id}`, values)).data;

// ================== Component ==================
const StoreList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [editStore, setEditStore] = useState(null);
  const [isOpen, setISOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [form] = Form.useForm();
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["stores", { page, pageSize, search }],
    queryFn: fetchStores,
    placeholderData: (prev) => prev,
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      toast.success("Store deleted successfully");
      queryClient.invalidateQueries(["stores"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.message),
  });

  const [employeeSearchParams, setEmployeeSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });
  
  const handleEmployeeSearch = debounce((value) => {
    setEmployeeSearchParams((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  }, 500);

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees", employeeSearchParams],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/stores/user/staff", {
        params: {
          ...employeeSearchParams,
        },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      toast.success("Store created successfully");
      queryClient.invalidateQueries(["stores"]);
      form.resetFields();
      setEditStore(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateStore,
    onSuccess: () => {
      toast.success("Store updated successfully");
      queryClient.invalidateQueries(["stores"]);
      setEditStore(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.message),
  });

  const handleSearch = debounce((val) => {
    setSearch(val);
    setPage(1);
  }, 500);

  const handleDelete = (id) => deleteMutation.mutate(id);
  
  const handleSubmit = (values) => {
    if (drawerMode === "edit" && editStore?._id) {
      updateMutation.mutate({ id: editStore._id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const openDrawer = (mode, record = null) => {
    setDrawerMode(mode);
    setEditStore(record);
    setISOpen(true)
    if (mode === "edit" && record) {
      form.setFieldsValue({
        ...record,
        clustermanager: record.clustermanager?._id,
        regionalmanager: record.regionalmanager?._id,
      });
    } else {
      form.resetFields();
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          form.setFieldsValue({
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          });
          setMapModalVisible(false);
          toast.success("Location retrieved successfully!");
        },
        (error) => {
          toast.error("Unable to retrieve your location. Please enter manually.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Coordinates",
      key: "coordinates",
      render: (_, record) => (
        <span>{record.latitude}, {record.longitude}</span>
      ),
    },
    {
      title: "Cluster Manager",
      dataIndex: "clustermanager",
      key: "clustermanager",
      render: (manager) => 
        manager ? (
          <div>
            <div>{manager.firstName} {manager.lastName}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{manager.email}</div>
          </div>
        ) : (
          <span>-</span>
        )
    },
    {
      title: "Regional Manager",
      dataIndex: "regionalmanager",
      key: "regionalmanager",
      render: (manager) => 
        manager ? (
          <div>
            <div>{manager.firstName} {manager.lastName}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{manager.email}</div>
          </div>
        ) : (
          <span>-</span>
        )
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
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openDrawer("edit", record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this store?"
            description="Are you sure you want to delete this store? This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="store-management" style={{ padding: '24px' }}>
      <div className="flex justify-between mb-4">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openDrawer("add")}
          >
            Add Store
          </Button>
        </Space>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search stores by name or location"
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="_id"
        bordered
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 1000 }}
      />

      {/* Drawer for Add/Edit */}
      <Drawer
        title={drawerMode === "edit" ? "Edit Store" : "Add Store"}
        width={500}
        
        onClose={() => {
          form.resetFields();
          setEditStore(null);
          setISOpen(false)
        }}
        open={isOpen}
        destroyOnClose
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label="Store Name"
                rules={[{ required: true, message: 'Please enter store name' }]}
              >
                <AntInput placeholder="Enter store name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="location" 
                label="Location"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <AntInput placeholder="Enter location address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="latitude" 
                label="Latitude"
                rules={[
                  { required: true, message: 'Please enter latitude' },
                  { pattern: /^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})?$/, message: 'Please enter a valid latitude' }
                ]}
              >
                <AntInput 
                  placeholder="e.g., 40.7128" 
                  suffix={
                    <EnvironmentOutlined 
                      onClick={() => setMapModalVisible(true)}
                      style={{ color: '#1890ff', cursor: 'pointer' }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="longitude" 
                label="Longitude"
                rules={[
                  { required: true, message: 'Please enter longitude' },
                  { pattern: /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})?$/, message: 'Please enter a valid longitude' }
                ]}
              >
                <AntInput placeholder="e.g., -74.0060" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="clustermanager" label="Cluster Manager">
            <Select
              showSearch
              placeholder="Select cluster manager"
              optionFilterProp="children"
              filterOption={false}
              onSearch={handleEmployeeSearch}
              loading={employeesLoading}
              allowClear
            >
              {employeesData?.data
                ?.filter(emp => emp.role === 'cluster_manager')
                .map((employee) => (
                  <Select.Option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} ({employee.email})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="regionalmanager" label="Regional Manager">
            <Select
              showSearch
              placeholder="Select regional manager"
              optionFilterProp="children"
              filterOption={false}
              onSearch={handleEmployeeSearch}
              loading={employeesLoading}
              allowClear
            >
              {employeesData?.data
                ?.filter(emp => emp.role === 'regional_manager')
                .map((employee) => (
                  <Select.Option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} ({employee.email})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                onClick={() => setEditStore(null)}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createMutation.isLoading || updateMutation.isLoading}
              >
                {drawerMode === "edit" ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Modal for getting current location */}
      <Modal
        title="Get Current Location"
        open={mapModalVisible}
        onOk={getCurrentLocation}
        onCancel={() => setMapModalVisible(false)}
        okText="Get Location"
        cancelText="Cancel"
      >
        <p>Do you want to use your current location for this store?</p>
      </Modal>
    </div>
  );
};

export default StoreList;