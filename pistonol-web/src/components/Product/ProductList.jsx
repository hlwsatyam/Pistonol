import React, { useState, useEffect } from "react";
import { 
  Table, 
  Space, 
  Button, 
  Tag, 
  Popconfirm, 
  Spin, 
  Image, 
  Badge, 
  Input, 
  Select, 
  Card,
  Row,
  Col,
  Statistic,
  Slider,
  InputNumber,
  Alert,
  Empty
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SyncOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ShoppingOutlined,
 
} from "@ant-design/icons";
import { useDeleteProduct, useProducts } from "../../utils/useProducts";

const { Option } = Select;

const ProductList = ({ setEditProductId, showDrawer }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 100000,
    minStock: 0,
    maxStock: 1000,
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data: productData, isLoading, isError, error, refetch } = useProducts(filters);
  const deleteProductMutation = useDeleteProduct();

  const handleDelete = (id) => {
    deleteProductMutation.mutate(id, {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error('Delete error:', error);
      }
    });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || 'createdAt',
      sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
    }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handleCategoryFilter = (value) => {
    setFilters(prev => ({
      ...prev,
      category: value,
      page: 1
    }));
  };

  const handleStatusFilter = (value) => {
    setFilters(prev => ({
      ...prev,
      status: value,
      page: 1
    }));
  };

  const handlePriceFilter = (value) => {
    setFilters(prev => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
      page: 1
    }));
  };
 const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
  const handleStockFilter = (value) => {
    setFilters(prev => ({
      ...prev,
      minStock: value[0],
      maxStock: value[1],
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 100000,
      minStock: 0,
      maxStock: 1000,
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div style={{ padding: '20px' }}>
      <Card loading={true}>
        <Table
          columns={columns.map(col => ({
            ...col,
            render: () => <div style={{ height: 20, background: '#f0f0f0', borderRadius: 4 }} />
          }))}
          dataSource={Array(5).fill({})}
          pagination={false}
        />
      </Card>
    </div>
  );

  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      width: 80,
      render: (images, record) => (
        <Image
          width={50}
          height={50}
          src={images?.[0]?.url || '/placeholder-product.png'}
          alt={record.name}
          style={{ 
            objectFit: 'cover',
            borderRadius: 6,
            backgroundColor: '#f5f5f5'
          }}
          preview={{
            mask: <EyeOutlined />,
          }}
          fallback="/placeholder-product.png"
          placeholder={
            <div style={{
              width: 50,
              height: 50,
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6
            }}>
              <Spin size="small" />
            </div>
          }
        />
      )
    },
    {
      title: "Product Details",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text, record) => (
        <div>
          <strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>{text}</strong>
          {record.sku && (
            <Tag color="blue" style={{ fontSize: 10, marginBottom: 4 }}>SKU: {record.sku}</Tag>
          )}
          {record.description && (
            <div style={{ 
              color: '#666', 
              fontSize: 12, 
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: 'Engine Parts', value: 'engine-parts' },
        { text: 'Electrical', value: 'electrical' },
        { text: 'Body Parts', value: 'body-parts' },
        { text: 'Accessories', value: 'accessories' },
        { text: 'Lubricants', value: 'lubricants' },
        { text: 'Tools', value: 'tools' }
      ],
      render: (category) => {
        const categoryConfig = {
          'engine-parts': { color: 'volcano', label: 'Engine Parts' },
          'electrical': { color: 'orange', label: 'Electrical' },
          'body-parts': { color: 'gold', label: 'Body Parts' },
          'accessories': { color: 'green', label: 'Accessories' },
          'lubricants': { color: 'blue', label: 'Lubricants' },
          'tools': { color: 'geekblue', label: 'Tools' }
        };
        
        const config = categoryConfig[category] || { color: 'default', label: category || 'Uncategorized' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Price (₹)",
      dataIndex: "price",
      key: "price",
      align: 'right',
      sorter: true,
      render: (price) => `₹${price?.toLocaleString('en-IN') || '0'}`,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      align: 'center',
      sorter: true,
      render: (stock, record) => (
        <Badge
          count={stock}
          style={{ 
            backgroundColor: stock > 20 ? '#52c41a' : stock > 5 ? '#faad14' : '#f5222d',
          }}
          showZero
        />
      ),
    },
    
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditProductId(record._id);
              showDrawer();
            }}
            disabled={deleteProductMutation.isPending}
          />
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
            disabled={record.stock > 0}
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              loading={deleteProductMutation.isPending && deleteProductMutation.variables === record._id}
              disabled={record.stock > 0}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <SkeletonLoader />;
  
  if (isError) return (
    <div style={{ padding: '20px' }}>
      <Alert
        message="Error Loading Products"
        description={error?.response?.data?.message || error.message}
        type="error"
        showIcon
        action={
          <Button 
            size="small" 
            type="primary" 
            icon={<SyncOutlined />} 
            onClick={() => refetch()}
          >
            Retry
          </Button>
        }
      />
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Filters Section */}
      <Card 
        title="Product Filters" 
        style={{ marginBottom: 20 }}
        extra={
          <Button 
            icon={<FilterOutlined />} 
            onClick={clearFilters}
            size="small"
          >
            Clear All
          </Button>
        }
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by name, description or SKU..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onPressEnter={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          
          <Col xs={24} md={4}>
            <Select
              placeholder="Category"
              value={filters.category || null}
              onChange={handleCategoryFilter}
              style={{ width: '100%' }}
              allowClear
            >
              {productData?.filters?.categories?.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat._id} ({cat.count})
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} md={4}>
            <Select
              placeholder="Status"
              value={filters.status || null}
              onChange={handleStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          
          <Col xs={24} md={8}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Price Range: ₹{filters.minPrice.toLocaleString('en-IN')} - ₹{filters.maxPrice.toLocaleString('en-IN')}</div>
              <Slider
                range
                min={0}
                max={100000}
                value={[filters.minPrice, filters.maxPrice]}
                onChange={handlePriceFilter}
                tipFormatter={value => `₹${value?.toLocaleString('en-IN')}`}
              />
            </div>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Stock Range: {filters.minStock} - {filters.maxStock}</div>
              <Slider
                range
                min={0}
                max={100000}
                value={[filters.minStock, filters.maxStock]}
                onChange={handleStockFilter}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      {productData?.statistics && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Products"
                value={productData.statistics.totalProducts}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="In Stock"
                value={productData.statistics.inStock}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Low Stock"
                value={productData.statistics.lowStock}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Out of Stock"
                value={productData.statistics.outOfStock}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditProductId(null);
            showDrawer();
          }}
          size="large"
        >
          Add New Product
        </Button>
        
        <Space>
          <div style={{ color: '#666', fontSize: 14 }}>
            Showing {productData?.pagination?.total || 0} products
          </div>
          <Button 
            icon={<SyncOutlined />} 
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
        </Space>
      </div>
      
      {/* Products Table */}
      {productData?.data?.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              No products found{Object.values(filters).some(v => v && v !== '' && v !== 0) ? ' matching your filters' : ''}
            </span>
          }
        >
          <Button type="primary" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={productData?.data || []}
          rowKey="_id"
          bordered
          size="middle"
          pagination={{
            current: productData?.pagination?.current || 1,
            pageSize: productData?.pagination?.limit || 10,
            total: productData?.pagination?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Showing ${range[0]}-${range[1]} of ${total} products`,
          }}
          onChange={handleTableChange}
          loading={isLoading}
          scroll={{ x: 1000 }}
        />
      )}
    </div>
  );
};

export default ProductList;