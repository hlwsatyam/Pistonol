import React, { useState, useEffect } from 'react';
import { Popover, Spin, Table, Typography, Card, Descriptions, Tag, Divider, Empty } from 'antd';
import { 
  BoxPlotOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from '../axiosConfig';

const { Title, Text } = Typography;

const StockReportsPopover = ({ distributorId, children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible && distributorId) {
      fetchStockReports();
    }
  }, [visible, distributorId]);

  const fetchStockReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/dmr/admin/reports?distributorId=${distributorId}`);
      if (response.data.success) {
        const stockReports = response.data.data.stockReports || [];
        // Sort by year and month (newest first)
        const sortedReports = stockReports.sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.month - a.month;
        });
        setReports(sortedReports);
      }
    } catch (error) {
      console.error('Error fetching stock reports:', error);
    } finally {
      setLoading(false);
    }
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

  // Calculate total boxes for a report
  const getTotalBoxes = (stockItems) => {
    if (!stockItems || !Array.isArray(stockItems)) return 0;
    return stockItems.reduce((sum, item) => sum + (item.quantityInBox || 0), 0);
  };

  // Stock Reports Columns
  const stockColumns = [
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
      title: 'Products',
      key: 'products',
      width: 100,
      render: (_, record) => (
        <div className="font-semibold text-blue-600">
          {record.stockItems?.length || 0}
        </div>
      ),
      sorter: (a, b) => (a.stockItems?.length || 0) - (b.stockItems?.length || 0),
    },
    {
      title: 'Total Boxes',
      key: 'boxes',
      width: 110,
      render: (_, record) => (
        <div className="font-semibold text-orange-500">
          {getTotalBoxes(record.stockItems)}
        </div>
      ),
      sorter: (a, b) => getTotalBoxes(a.stockItems) - getTotalBoxes(b.stockItems),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 110,
      render: (date) => (
        <div className="text-xs text-gray-500">
          {formatDate(date)}
        </div>
      ),
    },
  ];

  // Expanded Row Render for Stock Items
  const expandedRowRender = (record) => {
    const stockItems = record.stockItems || [];
    
    if (stockItems.length === 0) {
      return (
        <div className="p-3 bg-gray-50 rounded text-center text-gray-500 text-sm">
          No stock items recorded for this month
        </div>
      );
    }

    return (
      <div className="p-3 bg-gray-50 rounded">
        <div className="mb-2">
          <div className="flex items-center space-x-2 mb-3">
            <AppstoreOutlined className="text-blue-500" />
            <span className="font-medium">Stock Items ({stockItems.length})</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {stockItems.map((item, index) => (
            <Card 
              key={index} 
              size="small" 
              className="shadow-sm hover:shadow transition-shadow"
              bodyStyle={{ padding: '12px' }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1 truncate">
                    {item.productName || 'Unnamed Product'}
                  </div>
                  {item.volumeSize && (
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <InfoCircleOutlined className="mr-1" />
                      Size: {item.volumeSize}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <Tag color="blue" className="text-xs">
                    <div className="flex items-center">
                      <ContainerOutlined className="mr-1" />
                      {item.quantityInBox || 0} boxes
                    </div>
                  </Tag>
                </div>
              </div>
              <div className="mt-2 text-right text-xs text-gray-400">
                Item #{index + 1}
              </div>
            </Card>
          ))}
        </div>

        <Divider className="my-3" />
        
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
            <BoxPlotOutlined className="text-xl text-green-500" />
            <Title level={4} className="mb-0">Stock Reports</Title>
          </div>
          <Tag color="green" icon={<CalendarOutlined />}>
            {reports.length} Reports
          </Tag>
        </div>
        <Text type="secondary" className="text-xs">
          Distributor ID: {distributorId}
        </Text>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" tip="Loading stock reports..." />
        </div>
      ) : reports.length > 0 ? (
        <div className="p-4">
          {/* Main Table */}
          <Table
            dataSource={reports}
            columns={stockColumns}
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
                    Hide Items
                  </a>
                ) : (
                  <a onClick={e => onExpand(record, e)} className="text-xs text-blue-500">
                    View Items
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
                  <Descriptions.Item label="Products Count">
                    <div className="font-semibold text-blue-600">
                      {reports[0].stockItems?.length || 0}
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
                  <Descriptions.Item label="Total Boxes">
                    <div className="font-semibold text-orange-500">
                      {getTotalBoxes(reports[0].stockItems)}
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
            image={<BoxPlotOutlined className="text-4xl text-gray-300" />}
            description={
              <div className="text-gray-500">
                <p>No stock reports found</p>
                <p className="text-xs mt-1">This distributor hasn't submitted any stock reports yet.</p>
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
      overlayClassName="popover-stock-reports"
      destroyTooltipOnHide
    >
      {children}
    </Popover>
  );
};

export default StockReportsPopover;