// // LeadManagement.jsx
// import React, { useState } from 'react';
// import {
//   Table,
//   Card,
//   Button,
//   Space,
//   Modal,
//   Form,
//   Input,
//   Select,
//   Tag,
//   Row,
//   Col,
//   Pagination,
//   Skeleton,
//   message,
//   Descriptions,
//   List,
//   Switch
// } from 'antd';
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   EyeOutlined,
//   SearchOutlined
// } from '@ant-design/icons';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axios from '../axiosConfig';
// import TextArea from 'antd/es/input/TextArea';

 

// const { Option } = Select;

// const LeadManagement = ({ createdBy }) => {
 
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
//   const [editingLead, setEditingLead] = useState(null);
//   const [viewingLead, setViewingLead] = useState(null);
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//     status: '',
//     state: '',
//     city: '',
//     search: ''
//   });
  
//   const queryClient = useQueryClient();
  
//    const [enabled, setEnabled] = useState(false);
 

// // Fetch leads with filters
// const { data, isLoading, error } = useQuery({
//   queryKey: ['leads',enabled, filters],
//   queryFn: async () => {
//     const params = new URLSearchParams();

//     // Add filters dynamically
//     Object.keys(filters).forEach(key => {
//       if (filters[key]) params.append(key, filters[key]);
//     });

//     // Add extra parameters if needed
   
//      createdBy?.role!=="company"  &&  params.append('id', createdBy?._id   );
//      enabled  &&  params.append('getOrderSeparate', enabled   );
 

//     const response = await axios.get(`/leads/all/lead/list?${params.toString()}`);
//     return response.data;
//   },
//   keepPreviousData: true
// });
  
//   // Create lead mutation
//   const createMutation = useMutation({
//     mutationFn: (newLead) => axios.post('/leads/all/lead/list', {...newLead ,    

//    ...(createdBy?.role !== "company" && { createdBy: createdBy._id }),


//      } ),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['leads']);
//       message.success('Lead created successfully');
//       setIsModalVisible(false);
//     },
//     onError: (error) => {
//       message.error(error.response?.data?.message || 'Failed to create lead');
//     }
//   });
  
//   // Update lead mutation
//   const updateMutation = useMutation({
//     mutationFn: (updatedLead) => 
//       axios.put(`/leads/all/lead/list/${updatedLead._id}`, updatedLead),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['leads']);
//       message.success('Lead updated successfully');
//       setIsModalVisible(false);
//       setEditingLead(null);
//     },
//     onError: (error) => {
//       message.error(error.response?.data?.message || 'Failed to update lead');
//     }
//   });
  
//   // Delete lead mutation
//   const deleteMutation = useMutation({
//     mutationFn: (id) => axios.delete(`/leads/all/lead/list/${id}`),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['leads']);
//       message.success('Lead deleted successfully');
//     },
//     onError: (error) => {
//       message.error(error.response?.data?.message || 'Failed to delete lead');
//     }
//   });
  
//   const handleCreate = () => {
//     setEditingLead(null);
//     setIsModalVisible(true);
//   };
  
//   const handleEdit = (lead) => {
//     setEditingLead(lead);
//     setIsModalVisible(true);
//   };
  
//   const handleView = (lead) => {
//     setViewingLead(lead);
//     setIsDetailModalVisible(true);
//   };
  
//   const handleDelete = (lead) => {
  
//         deleteMutation.mutate(lead._id);
   
//   };
  
//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
//   };
  
//   const handleTableChange = (pagination) => {
//     setFilters(prev => ({ ...prev, page: pagination.current }));
//   };
  
//   const columns = [
//     {
//       title: 'Garage Name',
//       dataIndex: 'garageName',
//       key: 'garageName',
//     },
//     {
//       title: 'Contact Name',
//       dataIndex: 'contactName',
//       key: 'contactName',
//     },
//     {
//       title: 'Mobile',
//       dataIndex: 'mobile',
//       key: 'mobile',
//     },
//     {
//       title: 'State',
//       dataIndex: 'state',
//       key: 'state',
//     },
//     {
//       title: 'City',
//       dataIndex: 'city',
//       key: 'city',
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status) => {
//         let color = 'default';
//         if (status === 'New') color = 'blue';
//         if (status === 'Contacted') color = 'orange';
//         if (status === 'Qualified') color = 'green';
//         if (status === 'Lost') color = 'red';
//         return <Tag color={color}>{status.toUpperCase()}</Tag>;
//       },
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: (_, record) => (
//         <Space size="middle">
//           <Button 
//             icon={<EyeOutlined />} 
//             size="small"
//             onClick={() => handleView(record)}
//           >
//             View
//           </Button>
//           <Button 
//             icon={<EditOutlined />} 
//             size="small"
//             onClick={() => handleEdit(record)}
//           >
//             Edit
//           </Button>
//           <Button 
//             icon={<DeleteOutlined />} 
//             size="small" 
//             danger
//             onClick={() => handleDelete(record)}
//           >
//             Delete
//           </Button>
//         </Space>
//       ),
//     },
//   ];
  
//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }
  
//   return (
//     <div>
//       <Card 
//         title="Lead Management" 
//         extra={
//           <Button 
//             type="primary" 
//             icon={<PlusOutlined />} 
//             onClick={handleCreate}
//           >
//             Add New Lead
//           </Button>
//         }
//       >






 





//         {/* Filters */}
//         <Row gutter={16} style={{ marginBottom: 16 }}>
//           <Col span={6}>
//             <Input
//               placeholder="Search by name or mobile"
//               prefix={<SearchOutlined />}
//               value={filters.search}
//               onChange={(e) => handleFilterChange('search', e.target.value)}
//             />
//           </Col>


 
        



//           <Col span={6}>
//             <Select
//               placeholder="Filter by status"
//               style={{ width: '100%' }}
//               value={filters.status || null}
//               onChange={(value) => handleFilterChange('status', value)}
//               allowClear
//             >
//               <Option value="New">New</Option>
//               <Option value="Contacted">Contacted</Option>
//               <Option value="Qualified">Qualified</Option>
//               <Option value="Lost">Lost</Option>
//             </Select>
//           </Col>
//           <Col span={6}>
//             <Input
//               placeholder="Filter by state"
//               value={filters.state}
//               onChange={(e) => handleFilterChange('state', e.target.value)}
//             />
//           </Col>
//           <Col span={6}>
//             <Input
//               placeholder="Filter by city"
//               value={filters.city}
//               onChange={(e) => handleFilterChange('city', e.target.value)}
//             />
//           </Col>
//     <Col span={6} className="mt-4 flex items-center gap-2">
//       <span className="font-medium">
//         {enabled ? "Enabled Order Separation" : "Disabled Order Separation"}
//       </span>

//       <Switch
//         checked={enabled}
//         onChange={(checked) => setEnabled(checked)}
//       />
//     </Col>


        
    
//         </Row>
        
//         {/* Leads Table */}
//         {isLoading ? (
//           <Skeleton active paragraph={{ rows: 10 }} />
//         ) : (
//           <>
//             <Table
//               columns={columns}
//               dataSource={data?.leads || []}
//               rowKey="_id"
//               scroll={{x:true}}
//               pagination={false}
//               onChange={handleTableChange}
//             />
//             <div style={{ marginTop: 16, textAlign: 'right' }}>
//               <Pagination
//                 current={filters.page}
//                 total={data?.totalLeads || 0}
//                 pageSize={filters.limit}
//                 onChange={(page) => setFilters(prev => ({ ...prev, page }))}
//                 showSizeChanger
//                 onShowSizeChange={(_, size) => 
//                   setFilters(prev => ({ ...prev, limit: size, page: 1 }))
//                 }
//                 showTotal={(total, range) => 
//                   `${range[0]}-${range[1]} of ${total} items`
//                 }
//               />
//             </div>
//           </>
//         )}
//       </Card>
      
//       {/* Create/Edit Modal */}
//       <Modal
//         title={editingLead ? 'Edit Lead' : 'Create New Lead'}
//         open={isModalVisible}
//         onCancel={() => {
//           setIsModalVisible(false);
//           setEditingLead(null);
//         }}
//         footer={null}
//         width={800}
//       >
//         <LeadForm
//           lead={editingLead}
//           onSubmit={(values) => {
//             if (editingLead) {
//               updateMutation.mutate({ ...values, _id: editingLead._id });
//             } else {
//               createMutation.mutate(values);
//             }
//           }}
//           isLoading={createMutation.isPending || updateMutation.isPending}
//         />
//       </Modal>
      
//       {/* View Details Modal */}
//       <Modal
//         title="Lead Details"
//         open={isDetailModalVisible}
//         onCancel={() => {
//           setIsDetailModalVisible(false);
//           setViewingLead(null);
//         }}
//         footer={[
//           <Button 
//             key="close" 
//             onClick={() => {
//               setIsDetailModalVisible(false);
//               setViewingLead(null);
//             }}
//           >
//             Close
//           </Button>
//         ]}
//         width={800}
//       >
//         <LeadDetails lead={viewingLead} />
//       </Modal>
//     </div>
//   );
// };

// export default LeadManagement;





 

// const LeadForm = ({ lead, onSubmit, isLoading }) => {
//   const [form] = Form.useForm();
  
//   React.useEffect(() => {
//     if (lead) {
//       form.setFieldsValue(lead);
//     } else {
//       form.resetFields();
//     }
//   }, [lead, form]);
  
//   const handleSubmit = (values) => {
//     onSubmit(values);
//   };
  
//   return (
//     <Form
//       form={form}
//       layout="vertical"
//       onFinish={handleSubmit}
//       initialValues={{
//         status: 'New'
//       }}
//     >
//       <Row gutter={16}>
//         <Col span={12}>
//           <Form.Item
//             name="garageName"
//             label="Garage Name"
//             rules={[{ required: true, message: 'Please enter garage name' }]}
//           >
//             <Input placeholder="Enter garage name" />
//           </Form.Item>
//         </Col>
//         <Col span={12}>
//           <Form.Item
//             name="businessCardNumber"
//             label="Business Card Number"
//           >
//             <Input placeholder="Enter business card number" />
//           </Form.Item>
//         </Col>
//       </Row>
      
//       <Row gutter={16}>
//         <Col span={12}>
//           <Form.Item
//             name="contactName"
//             label="Contact Name"
//             rules={[{ required: true, message: 'Please enter contact name' }]}
//           >
//             <Input placeholder="Enter contact name" />
//           </Form.Item>
//         </Col>
//         <Col span={12}>
//           <Form.Item
//             name="mobile"
//             label="Mobile"
//             rules={[{ required: true, message: 'Please enter mobile number' }]}
//           >
//             <Input placeholder="Enter mobile number" />
//           </Form.Item>
//         </Col>
//       </Row>
      
//       <Form.Item
//         name="address"
//         label="Address"
//       >
//         <TextArea rows={2} placeholder="Enter address" />
//       </Form.Item>
      
//       <Row gutter={16}>
//         <Col span={8}>
//           <Form.Item
//             name="state"
//             label="State"
//           >
//             <Input placeholder="Enter state" />
//           </Form.Item>
//         </Col>
//         <Col span={8}>
//           <Form.Item
//             name="city"
//             label="City"
//           >
//             <Input placeholder="Enter city" />
//           </Form.Item>
//         </Col>
//         <Col span={8}>
//           <Form.Item
//             name="pincode"
//             label="Pincode"
//           >
//             <Input placeholder="Enter pincode" />
//           </Form.Item>
//         </Col>
//       </Row>
      
//       <Form.Item
//         name="servicesOffered"
//         label="Services Offered"
//       >
//         <TextArea rows={2} placeholder="Enter services offered" />
//       </Form.Item>
      
//       <Form.Item
//         name="status"
//         label="Status"
//       >
//         <Select>
//           <Option value="New">New</Option>
//           <Option value="Contacted">Contacted</Option>
//           <Option value="Qualified">Qualified</Option>
//           <Option value="Lost">Lost</Option>
//         </Select>
//       </Form.Item>
      
//       <Form.Item>
//         <Space>
//           <Button type="primary" htmlType="submit" loading={isLoading}>
//             {lead ? 'Update Lead' : 'Create Lead'}
//           </Button>
//           <Button 
//             htmlType="button" 
//             onClick={() => form.resetFields()}
//           >
//             Reset
//           </Button>
//         </Space>
//       </Form.Item>
//     </Form>
//   );
// };
 


// const LeadDetails = ({ lead }) => {
//   if (!lead) return null;
  
//   const statusColors = {
//     New: 'blue',
//     Contacted: 'orange',
//     Qualified: 'green',
//     Lost: 'red'
//   };
  
//   return (
//     <div>
//       <Descriptions title="Lead Information" bordered column={1}>
//         <Descriptions.Item label="Garage Name">
//           {lead.garageName}
//         </Descriptions.Item>
//         <Descriptions.Item label="Current Location Of Employee">
           

// <a
//   href={`https://www.google.com/maps?q=${lead.currentLocation.latitude},${lead.currentLocation.longitude}`}
//   target="_blank"
//   rel="noopener noreferrer"
// >
//   <strong>Location:</strong>{" "}
//   {lead.currentLocation.latitude}, {lead.currentLocation.longitude}
// </a>




//         </Descriptions.Item>







//         <Descriptions.Item label="Business Card Number">
//           {lead.businessCardNumber || 'N/A'}
//         </Descriptions.Item>
//         <Descriptions.Item label="Contact Name">
//           {lead.contactName}
//         </Descriptions.Item>
//         <Descriptions.Item label="Mobile">
//           {lead.mobile}
//         </Descriptions.Item>
//         <Descriptions.Item label="Address">
//           {lead.address || 'N/A'}
//         </Descriptions.Item>
//         <Descriptions.Item label="State">
//           {lead.state || 'N/A'}
//         </Descriptions.Item>
//         <Descriptions.Item label="City">
//           {lead.city || 'N/A'}
//         </Descriptions.Item>
//         <Descriptions.Item label="Pincode">
//           {lead.pincode || 'N/A'}
//         </Descriptions.Item>
//         <Descriptions.Item label="Services Offered">
//           {lead.servicesOffered || 'N/A'}
//         </Descriptions.Item>
//         <Descriptions.Item label="Status">
//           <Tag color={statusColors[lead.status]}>
//             {lead.status.toUpperCase()}
//           </Tag>
//         </Descriptions.Item>
//         <Descriptions.Item label="Created At">
//           {new Date(lead.createdAt).toLocaleString()}
//         </Descriptions.Item>
//         <Descriptions.Item label="Last Updated">
//           {new Date(lead.updatedAt).toLocaleString()}
//         </Descriptions.Item>
//       </Descriptions>

// <p className='!mt-4' >Garage Image: </p>

//  <img
//   src={lead.proofImageUrl}
//   alt="Proof"
//   style={{
//     width: "140px",
//     height: "140px",
//     objectFit: "cover",
//     borderRadius: "12px",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//     cursor: "pointer",
//     transition: "transform 0.3s ease"
//   }}
//   onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
//   onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
//  />







//       {lead.feedbacks && lead.feedbacks.length > 0 && (
//         <Card title="Feedback History" style={{ marginTop: 16 }}>
//           <List
//             dataSource={lead.feedbacks}
//             renderItem={(feedback, index) => (
//               <List.Item>
//                 <List.Item.Meta
//                   title={`Feedback #${index + 1}`}
//                   description={feedback.message}
//                 />
//                 <div>{new Date(feedback.createdAt).toLocaleString()}</div>
//               </List.Item>
//             )}
//           />
//         </Card>
//       )}
//     </div>
//   );
// };










import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Statistic,
  Progress,
  Typography,
  Modal,
  Descriptions,
  Spin,
  Alert,
  message,
  Tooltip,
  Switch
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  LineChartOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from '../axiosConfig';
import dayjs from 'dayjs';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const { Title: AntTitle, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminLeadManagement = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    isOnlyServiceOffer:false,
    status: '',
    state: '',
    city: '',
    startDate: null,
    endDate: null
  });
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch leads with filters
  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ['adminLeads', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          if (key === 'startDate' || key === 'endDate') {
            params.append(key, filters[key]?.format('YYYY-MM-DD'));
          } else {
            params.append(key, filters[key]);
          }
        }
      });

      const response = await axios.get(`/leads1/admin/leads?${params.toString()}`);
      return response.data;
    }
  });

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminLeadStats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      ['status', 'state', 'city', 'startDate', 'endDate'].forEach(key => {
        if (filters[key]) {
          if (key === 'startDate' || key === 'endDate') {
            params.append(key, filters[key]?.format('YYYY-MM-DD'));
          } else {
            params.append(key, filters[key]);
          }
        }
      });

      const response = await axios.get(`/leads1/admin/stats?${params.toString()}`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setStates(data.filters?.states || []);
        setCities(data.filters?.cities || []);
      }
    }
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle date range change
  const handleDateChange = (dates) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0],
        endDate: dates[1],
        page: 1
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: null,
        endDate: null,
        page: 1
      }));
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      state: '',
      city: '',
      startDate: null,
      endDate: null
    });
  };

  // Export to Excel
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      
      ['status', 'state', 'city', 'startDate', 'endDate', 'search'].forEach(key => {
        if (filters[key]) {
          if (key === 'startDate' || key === 'endDate') {
            params.append(key, filters[key]?.format('YYYY-MM-DD'));
          } else {
            params.append(key, filters[key]);
          }
        }
      });

      const response = await axios.get(`/leads1/admin/export?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Export started successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export leads');
    }
  };

  // View lead details
  const handleViewLead = async (leadId) => {
    try {
      const response = await axios.get(`/leads1/admin/leads/${leadId}`);
      if (response.data.success) {
        setSelectedLead(response.data.lead);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch lead details');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Garage Name',
      dataIndex: 'garageName',
      key: 'garageName',
      width: 200,
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.contactName}
          </div>
        </div>
      )
    },
    {
      title: 'Contact',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 120
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.city}</div>
          <Text type="secondary">{record.state}</Text>
        </div>
      )
    },
    {
      title: 'Created By',
      key: 'createdBy',
      width: 180,
      render: (_, record) => (
        record.createdBy ? (
          <div>
            <div><UserOutlined /> {record.createdBy.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <MailOutlined /> {record.createdBy.email}
            </div>
          </div>
        ) : 'N/A'
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          New: 'blue',
          Contacted: 'orange',
          Qualified: 'green',
          Lost: 'red'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewLead(record._id)}
        >
          View
        </Button>
      )
    }
  ];

  // Chart data for status distribution
  const statusChartData = {
    labels: statsData?.distributions?.status?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Leads by Status',
        data: statsData?.distributions?.status?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart data for monthly trend
  const monthlyChartData = {
    labels: statsData?.trends?.monthly?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Monthly Leads',
        data: statsData?.trends?.monthly?.map(item => item.count) || [],
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Page Title */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <AntTitle level={2}>Admin Lead Management</AntTitle>
          <Text type="secondary">View and analyze all leads in the system</Text>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={false}
            >
              Export to Excel
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Leads"
              value={statsData?.stats?.totalLeads || 0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Leads"
              value={statsData?.stats?.todaysLeads || 0}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        {/* <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="This Week"
              value={statsData?.stats?.thisWeekLeads || 0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col> */}
      
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Leads by Status">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin />
              </div>
            ) : (
              <Bar 
                data={statusChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            )}
          </Card>
        </Col>
      
      </Row>

      {/* Filters */}
      <Card
        title="Filters"
        extra={
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={refetchLeads}
              loading={leadsLoading || statsLoading}
            >
              Apply
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </Space>
        }
        style={{ marginBottom: '20px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by name, mobile, or business card"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
         
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={[filters.startDate, filters.endDate]}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
            />
          </Col>
        <Col xs={24} md={8}>
        <p>Service Offered</p>
  <Switch
    checked={filters.isOnlyServiceOffer}
    onChange={(checked) =>
      handleFilterChange('isOnlyServiceOffer', checked)
    }
  />
</Col>  
       
        </Row>
      </Card>

      {/* Leads Table */}
      <Card title="Leads List">
        <Table
          columns={columns}
          dataSource={leadsData?.leads || []}
          rowKey="_id"
          loading={leadsLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: leadsData?.totalLeads || 0,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} leads`,
            onChange: (page, pageSize) => {
              setFilters(prev => ({
                ...prev,
                page,
                limit: pageSize
              }));
            }
          }}
        />
      </Card>

      {/* Lead Details Modal */}
      <Modal
        title="Lead Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedLead(null);
        }}
        width={800}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedLead(null);
            }}
          >
            Close
          </Button>
        ]}
      >
        {selectedLead ? (
          <LeadDetailView lead={selectedLead} />
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
};

// Lead Detail View Component
const LeadDetailView = ({ lead }) => {
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
          <strong>{lead.garageName}</strong>
        </Descriptions.Item>
        
        <Descriptions.Item label="Contact Information">
          <div>
            <div><UserOutlined /> {lead.contactName}</div>
            <div><PhoneOutlined /> {lead.mobile}</div>
            {lead.businessCardNumber && (
              <div>Business Card: {lead.businessCardNumber}</div>
            )}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Location">
          <div>
            <div><EnvironmentOutlined /> {lead.address}</div>
            <div>{lead.city}, {lead.state} - {lead.pincode}</div>
            {lead.currentLocation && (
              <div style={{ marginTop: '8px' }}>
                <a
                  href={`https://www.google.com/maps?q=${lead.currentLocation.latitude},${lead.currentLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Services Offered">
          {lead.servicesOffered || 'N/A'}
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag color={statusColors[lead.status]}>
            {lead.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Created By">
          {lead.createdBy ? (
            <div>
              <div><UserOutlined /> {lead.createdBy.name}</div>
              <div><MailOutlined /> {lead.createdBy.email}</div>
              {lead.createdBy.phone && (
                <div><PhoneOutlined /> {lead.createdBy.phone}</div>
              )}
            </div>
          ) : 'N/A'}
        </Descriptions.Item>

        <Descriptions.Item label="Created Date">
          {dayjs(lead.createdAt).format('DD/MM/YYYY HH:mm')}
        </Descriptions.Item>

        <Descriptions.Item label="Last Updated">
          {dayjs(lead.updatedAt).format('DD/MM/YYYY HH:mm')}
        </Descriptions.Item>

        <Descriptions.Item label="Proof Image">
          {lead.proofImageUrl ? (
            <img
              src={lead.proofImageUrl}
              alt="Proof"
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          ) : 'No image provided'}
        </Descriptions.Item>

        <Descriptions.Item label="Comments">
          {lead.comment || 'No comments'}
        </Descriptions.Item>
      </Descriptions>

      {/* Feedback Section */}
      {lead.feedbacks && lead.feedbacks.length > 0 && (
        <Card title="Feedback History" style={{ marginTop: '16px' }}>
          {lead.feedbacks.map((feedback, index) => (
            <Card
              key={index}
              type="inner"
              style={{ marginBottom: '8px' }}
              title={`Feedback #${index + 1}`}
              extra={
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {dayjs(feedback.createdAt).format('DD/MM/YYYY HH:mm')}
                </span>
              }
            >
              {feedback.message}
            </Card>
          ))}
        </Card>
      )}
    </div>
  );
};

export default AdminLeadManagement;