// LeadManagement.jsx
import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Row,
  Col,
  Pagination,
  Skeleton,
  message,
  Descriptions,
  List,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../axiosConfig';
import TextArea from 'antd/es/input/TextArea';
import LeadStats from './Dashboard/LeadStats';
 

const { Option } = Select;

const LeadManagement = ({ createdBy }) => {
 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    state: '',
    city: '',
    search: ''
  });
  
  const queryClient = useQueryClient();
  
   const [enabled, setEnabled] = useState(false);
 

// Fetch leads with filters
const { data, isLoading, error } = useQuery({
  queryKey: ['leads',enabled, filters],
  queryFn: async () => {
    const params = new URLSearchParams();

    // Add filters dynamically
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    // Add extra parameters if needed
   
     createdBy?.role!=="company"  &&  params.append('id', createdBy?._id   );
     enabled  &&  params.append('getOrderSeparate', enabled   );
 

    const response = await axios.get(`/leads/all/lead/list?${params.toString()}`);
    return response.data;
  },
  keepPreviousData: true
});
  
  // Create lead mutation
  const createMutation = useMutation({
    mutationFn: (newLead) => axios.post('/leads/all/lead/list', {...newLead ,    

   ...(createdBy?.role !== "company" && { createdBy: createdBy._id }),


     } ),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      message.success('Lead created successfully');
      setIsModalVisible(false);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create lead');
    }
  });
  
  // Update lead mutation
  const updateMutation = useMutation({
    mutationFn: (updatedLead) => 
      axios.put(`/leads/all/lead/list/${updatedLead._id}`, updatedLead),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      message.success('Lead updated successfully');
      setIsModalVisible(false);
      setEditingLead(null);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update lead');
    }
  });
  
  // Delete lead mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/leads/all/lead/list/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      message.success('Lead deleted successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete lead');
    }
  });
  
  const handleCreate = () => {
    setEditingLead(null);
    setIsModalVisible(true);
  };
  
  const handleEdit = (lead) => {
    setEditingLead(lead);
    setIsModalVisible(true);
  };
  
  const handleView = (lead) => {
    setViewingLead(lead);
    setIsDetailModalVisible(true);
  };
  
  const handleDelete = (lead) => {
  
        deleteMutation.mutate(lead._id);
   
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };
  
  const handleTableChange = (pagination) => {
    setFilters(prev => ({ ...prev, page: pagination.current }));
  };
  
  const columns = [
    {
      title: 'Garage Name',
      dataIndex: 'garageName',
      key: 'garageName',
    },
    {
      title: 'Contact Name',
      dataIndex: 'contactName',
      key: 'contactName',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'New') color = 'blue';
        if (status === 'Contacted') color = 'orange';
        if (status === 'Qualified') color = 'green';
        if (status === 'Lost') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <div>
      <Card 
        title="Lead Management" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            Add New Lead
          </Button>
        }
      >







<LeadStats/>





        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="Search by name or mobile"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Col>


 
        



          <Col span={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={filters.status || null}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="New">New</Option>
              <Option value="Contacted">Contacted</Option>
              <Option value="Qualified">Qualified</Option>
              <Option value="Lost">Lost</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="Filter by state"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="Filter by city"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </Col>
    <Col span={6} className="mt-4 flex items-center gap-2">
      <span className="font-medium">
        {enabled ? "Enabled Order Separation" : "Disabled Order Separation"}
      </span>

      <Switch
        checked={enabled}
        onChange={(checked) => setEnabled(checked)}
      />
    </Col>


        
    
        </Row>
        
        {/* Leads Table */}
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={data?.leads || []}
              rowKey="_id"
              scroll={{x:true}}
              pagination={false}
              onChange={handleTableChange}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination
                current={filters.page}
                total={data?.totalLeads || 0}
                pageSize={filters.limit}
                onChange={(page) => setFilters(prev => ({ ...prev, page }))}
                showSizeChanger
                onShowSizeChange={(_, size) => 
                  setFilters(prev => ({ ...prev, limit: size, page: 1 }))
                }
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} items`
                }
              />
            </div>
          </>
        )}
      </Card>
      
      {/* Create/Edit Modal */}
      <Modal
        title={editingLead ? 'Edit Lead' : 'Create New Lead'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingLead(null);
        }}
        footer={null}
        width={800}
      >
        <LeadForm
          lead={editingLead}
          onSubmit={(values) => {
            if (editingLead) {
              updateMutation.mutate({ ...values, _id: editingLead._id });
            } else {
              createMutation.mutate(values);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
      
      {/* View Details Modal */}
      <Modal
        title="Lead Details"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setViewingLead(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setIsDetailModalVisible(false);
              setViewingLead(null);
            }}
          >
            Close
          </Button>
        ]}
        width={800}
      >
        <LeadDetails lead={viewingLead} />
      </Modal>
    </div>
  );
};

export default LeadManagement;





 

const LeadForm = ({ lead, onSubmit, isLoading }) => {
  const [form] = Form.useForm();
  
  React.useEffect(() => {
    if (lead) {
      form.setFieldsValue(lead);
    } else {
      form.resetFields();
    }
  }, [lead, form]);
  
  const handleSubmit = (values) => {
    onSubmit(values);
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: 'New'
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="garageName"
            label="Garage Name"
            rules={[{ required: true, message: 'Please enter garage name' }]}
          >
            <Input placeholder="Enter garage name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="businessCardNumber"
            label="Business Card Number"
          >
            <Input placeholder="Enter business card number" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="contactName"
            label="Contact Name"
            rules={[{ required: true, message: 'Please enter contact name' }]}
          >
            <Input placeholder="Enter contact name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="mobile"
            label="Mobile"
            rules={[{ required: true, message: 'Please enter mobile number' }]}
          >
            <Input placeholder="Enter mobile number" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="address"
        label="Address"
      >
        <TextArea rows={2} placeholder="Enter address" />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="state"
            label="State"
          >
            <Input placeholder="Enter state" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="city"
            label="City"
          >
            <Input placeholder="Enter city" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="pincode"
            label="Pincode"
          >
            <Input placeholder="Enter pincode" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="servicesOffered"
        label="Services Offered"
      >
        <TextArea rows={2} placeholder="Enter services offered" />
      </Form.Item>
      
      <Form.Item
        name="status"
        label="Status"
      >
        <Select>
          <Option value="New">New</Option>
          <Option value="Contacted">Contacted</Option>
          <Option value="Qualified">Qualified</Option>
          <Option value="Lost">Lost</Option>
        </Select>
      </Form.Item>
      
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {lead ? 'Update Lead' : 'Create Lead'}
          </Button>
          <Button 
            htmlType="button" 
            onClick={() => form.resetFields()}
          >
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
 


const LeadDetails = ({ lead }) => {
  if (!lead) return null;
  
  const statusColors = {
    New: 'blue',
    Contacted: 'orange',
    Qualified: 'green',
    Lost: 'red'
  };
  
  return (
    <div>
      <Descriptions title="Lead Information" bordered column={1}>
        <Descriptions.Item label="Garage Name">
          {lead.garageName}
        </Descriptions.Item>
        <Descriptions.Item label="Current Location Of Employee">
           

<a
  href={`https://www.google.com/maps?q=${lead.currentLocation.latitude},${lead.currentLocation.longitude}`}
  target="_blank"
  rel="noopener noreferrer"
>
  <strong>Location:</strong>{" "}
  {lead.currentLocation.latitude}, {lead.currentLocation.longitude}
</a>




        </Descriptions.Item>







        <Descriptions.Item label="Business Card Number">
          {lead.businessCardNumber || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Contact Name">
          {lead.contactName}
        </Descriptions.Item>
        <Descriptions.Item label="Mobile">
          {lead.mobile}
        </Descriptions.Item>
        <Descriptions.Item label="Address">
          {lead.address || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="State">
          {lead.state || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="City">
          {lead.city || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Pincode">
          {lead.pincode || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Services Offered">
          {lead.servicesOffered || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusColors[lead.status]}>
            {lead.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {new Date(lead.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {new Date(lead.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

<p className='!mt-4' >Garage Image: </p>

 <img
  src={lead.proofImageUrl}
  alt="Proof"
  style={{
    width: "140px",
    height: "140px",
    objectFit: "cover",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    cursor: "pointer",
    transition: "transform 0.3s ease"
  }}
  onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
  onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
 />







      {lead.feedbacks && lead.feedbacks.length > 0 && (
        <Card title="Feedback History" style={{ marginTop: 16 }}>
          <List
            dataSource={lead.feedbacks}
            renderItem={(feedback, index) => (
              <List.Item>
                <List.Item.Meta
                  title={`Feedback #${index + 1}`}
                  description={feedback.message}
                />
                <div>{new Date(feedback.createdAt).toLocaleString()}</div>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};
