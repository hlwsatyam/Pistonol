// components/AdminDMRReports.jsx
import React, { useState } from 'react';
import { Table, Card, Statistic, DatePicker, Select, Space, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from '../axiosConfig';
import dayjs from 'dayjs';
import DistributorReportsPopover from './DistributorReportsPopover';

const { Title } = Typography;
const { Option } = Select;

const AdminDMRReports = ({title="distributor"}) => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  const { data: reports, isLoading } = useQuery({
    queryKey: ['adminDMRReports', selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await axios.get(`/dmr/admin/reports?month=${selectedMonth}&year=${selectedYear}`);
      return response.data.data;
    },
  });

  const monthlySales = reports?.monthlySales || [];
  const stockReports = reports?.stockReports || [];

  const monthlySaleColumns = [
    {
      title: 'Distributor',
      dataIndex: ['distributor', 'businessName'],
      key: 'distributor',
      render: (text, record) => (
        <div>
          <div><strong>{text || record.distributor.name}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.distributor.mobile}</div>


        {record.distributor?._id && (
          <DistributorReportsPopover isDMR={true} distributorId={record.distributor._id}>
            <a className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer ml-2">
              View Reports
            </a>
          </DistributorReportsPopover>
        )}




        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'submitted' ? 'green' : 'orange'}>
          {status === 'submitted' ? 'Submitted' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Total Month Sale',
      dataIndex: 'totalMonthSale',
      key: 'totalMonthSale',
      render: (value) => value ? `₹${value.toLocaleString()}` : '-',
    },
    {
      title: 'Total Stock',
      dataIndex: 'totalStock',
      key: 'totalStock',
      render: (value) => value ? `₹${value.toLocaleString()}` : '-',
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
  ];

  const stockReportColumns = [
    {
      title: 'Distributor',
      dataIndex: ['distributor', 'businessName'],
      key: 'distributor',
      render: (text, record) => (
        <div>
          <div><strong>{text || record.distributor.name}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.distributor.mobile}</div>





      {record.distributor?._id && (
          <DistributorReportsPopover isDMR={false} distributorId={record.distributor._id}>
            <a className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer ml-2">
              View Reports
            </a>
          </DistributorReportsPopover>
        )}



        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'submitted' ? 'green' : 'orange'}>
          {status === 'submitted' ? 'Submitted' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Total Products',
      dataIndex: 'stockItems',
      key: 'totalProducts',
      render: (items) => items ? items.length : 0,
    },
    {
      title: 'Stock Items',
      dataIndex: 'stockItems',
      key: 'stockItems',
      render: (items) => (
        <div>
          {items?.slice(0, 2).map((item, index) => (
            <div key={index} style={{ fontSize: '12px' }}>
              {item.productName} - {item.quantityInBox} boxes
            </div>
          ))}
          {items?.length > 2 && <div style={{ fontSize: '12px', color: '#666' }}>+{items.length - 2} more</div>}
        </div>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
  ];

  const submittedMonthlySales = monthlySales.filter(r => r.status === 'submitted').length;
  const submittedStockReports = stockReports.filter(r => r.status === 'submitted').length;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Distributor Monthly Reports</Title>
      
      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 120 }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={i + 1}>
                {dayjs().month(i).format('MMMM')}
              </Option>
            ))}
          </Select>
          
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 120 }}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = dayjs().year() - 2 + i;
              return <Option key={year} value={year}>{year}</Option>;
            })}
          </Select>
        </Space>
      </Card>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <Statistic
            title="Monthly Sale Reports Submitted"
            value={submittedMonthlySales}
            suffix={`/ ${monthlySales.length}`}
            valueStyle={{ color: submittedMonthlySales === monthlySales.length ? '#3f8600' : '#cf1322' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Stock Reports Submitted"
            value={submittedStockReports}
            suffix={`/ ${stockReports.length}`}
            valueStyle={{ color: submittedStockReports === stockReports.length ? '#3f8600' : '#cf1322' }}
          />
        </Card>
      </div>

      {/* Tables */}
      {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}> */}
        <Card title="Monthly Sale Reports" loading={isLoading}>
          <Table
            dataSource={monthlySales}
            columns={monthlySaleColumns}
            rowKey="_id"
            pagination={false}
            size="small"
          />
        </Card>

        <Card title="Stock Reports" loading={isLoading}>
          <Table
            dataSource={stockReports}
            columns={stockReportColumns}
            rowKey="_id"
            pagination={false}
            size="small"
          />
        </Card>
      {/* </div> */}
    </div>
  );
};

export default AdminDMRReports;