import React, { useState, useEffect } from 'react';
import { Popover, Spin, Table, Typography, Card, Descriptions, Tag, Divider, Empty } from 'antd';
import { 
  DollarOutlined, 
  ProfileOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  StockOutlined,
  BankOutlined,
  WalletOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import axios from '../axiosConfig';

const { Title, Text } = Typography;

const DMRReportsPopover = ({ distributorId, children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible && distributorId) {
      fetchDMRReports();
    }
  }, [visible, distributorId]);

  const fetchDMRReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/dmr/admin/reports?distributorId=${distributorId}`);
      if (response.data.success) {
        const dmrReports = response.data.data.monthlySales || [];
        // Sort by year and month (newest first)
        const sortedReports = dmrReports.sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.month - a.month;
        });
        setReports(sortedReports);
      }
    } catch (error) {
      console.error('Error fetching DMR reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹ N/A';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  // DMR Columns
  const dmrColumns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      width: 120,
      render: (month, record) => (
        <div className="font-medium">
          {getMonthName(month)} {record.year}
        </div>
      ),
      sorter: (a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag 
          color={status === 'submitted' ? 'success' : 'warning'} 
          icon={status === 'submitted' ? <CheckCircleOutlined /> : <EditOutlined />}
          className="text-xs"
        >
          {status === 'submitted' ? 'Submitted' : 'Draft'}
        </Tag>
      ),
      filters: [
        { text: 'Submitted', value: 'submitted' },
        { text: 'Draft', value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Monthly Sale',
      dataIndex: 'totalMonthSale',
      key: 'totalMonthSale',
      width: 110,
      render: (value) => (
        <div className="font-semibold text-blue-600">
          {formatCurrency(value)}
        </div>
      ),
      sorter: (a, b) => (a.totalMonthSale || 0) - (b.totalMonthSale || 0),
    },
    {
      title: 'Total Sale Till Date',
      dataIndex: 'totalSaleTillDate',
      key: 'totalSaleTillDate',
      width: 130,
      render: (value) => (
        <div className="text-green-600">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      title: 'Position Date',
      dataIndex: 'positionAsOnDate',
      key: 'positionAsOnDate',
      width: 110,
      render: (date) => (
        <div className="text-xs text-gray-500">
          {formatDate(date)}
        </div>
      ),
    },
  ];

  // Expanded Row Render
  const expandedRowRender = (record) => {
    const details = [
      {
        label: 'Debtors',
        value: formatCurrency(record.debtors),
        icon: <ShoppingOutlined />,
        color: 'text-red-500'
      },
      {
        label: 'Creditors',
        value: formatCurrency(record.creditors),
        icon: <ShoppingOutlined />,
        color: 'text-green-500'
      },
      {
        label: 'Total Stock',
        value: formatCurrency(record.totalStock),
        icon: <StockOutlined />,
        color: 'text-purple-500'
      },
      {
        label: 'Cash at Bank',
        value: formatCurrency(record.cashAtBank),
        icon: <BankOutlined />,
        color: 'text-blue-500'
      },
      {
        label: 'Cash in Hand',
        value: formatCurrency(record.cashInHand),
        icon: <WalletOutlined />,
        color: 'text-orange-500'
      },
      {
        label: 'Business Assets',
        value: formatCurrency(record.purchaseOfBusinessAssets),
        icon: <DollarOutlined />,
        color: 'text-indigo-500'
      },
    ];

    return (
      <div className="p-3 bg-gray-50 rounded">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {details.map((detail, index) => (
            <div key={index} className="bg-white p-3 rounded border">
              <div className="flex items-center space-x-2 mb-1">
                {detail.icon}
                <span className="text-xs text-gray-500">{detail.label}</span>
              </div>
              <div className={`font-semibold ${detail.color}`}>
                {detail.value}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <div>
            <span className="font-medium">Created:</span> {formatDate(record.createdAt)}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {formatDate(record.updatedAt)}
          </div>
        </div>
      </div>
    );
  };

  const content = (
    <div className="w-[800px] max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ProfileOutlined className="text-xl text-blue-500" />
            <Title level={4} className="mb-0">DMR Reports</Title>
          </div>
          <Tag color="blue" icon={<CalendarOutlined />}>
            {reports.length} Reports
          </Tag>
        </div>
        <Text type="secondary" className="text-xs">
          Distributor ID: {distributorId}
        </Text>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" tip="Loading DMR reports..." />
        </div>
      ) : reports.length > 0 ? (
        <div className="p-4">
          {/* Main Table */}
          <Table
            dataSource={reports}
            columns={dmrColumns}
            rowKey="_id"
            size="small"
            pagination={{
              pageSize: 5,
              size: 'small',
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} reports`
            }}
            expandable={{
              expandedRowRender,
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <a onClick={e => onExpand(record, e)} className="text-xs text-gray-500">
                    Hide Details
                  </a>
                ) : (
                  <a onClick={e => onExpand(record, e)} className="text-xs text-blue-500">
                    View Details
                  </a>
                ),
            }}
            scroll={{ x: 600 }}
            className="border rounded"
          />

          {/* Recent Report Preview */}
          {reports.length > 0 && (
            <div className="mt-6">
              <Divider orientation="left" className="text-sm">
                Latest Report Preview
              </Divider>
              <Card size="small" className="shadow-sm">
                <Descriptions 
                  column={2} 
                  size="small" 
                  bordered 
                  className="text-xs"
                >
                  <Descriptions.Item label="Month" span={2}>
                    <div className="font-semibold">
                      {getMonthName(reports[0].month)} {reports[0].year}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Monthly Sale">
                    <div className="font-semibold text-blue-600">
                      {formatCurrency(reports[0].totalMonthSale)}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag 
                      color={reports[0].status === 'submitted' ? 'success' : 'warning'} 
                      className="text-xs"
                    >
                      {reports[0].status === 'submitted' ? 'Submitted' : 'Draft'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Debtors">
                    <div className="text-red-500">
                      {formatCurrency(reports[0].debtors)}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Creditors">
                    <div className="text-green-500">
                      {formatCurrency(reports[0].creditors)}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {formatDate(reports[0].updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 p-4">
          <Empty
            image={<ProfileOutlined className="text-4xl text-gray-300" />}
            description={
              <div className="text-gray-500">
                <p>No DMR reports found</p>
                <p className="text-xs mt-1">This distributor hasn't submitted any monthly sales reports yet.</p>
              </div>
            }
          />
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      placement="rightTop"
      open={visible}
      onOpenChange={setVisible}
      overlayClassName="popover-dmr-reports"
      destroyTooltipOnHide
    >
      {children}
    </Popover>
  );
};

export default DMRReportsPopover;