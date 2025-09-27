 

import React, { useState } from 'react';
import { Form, Input, Select, Button, Drawer, message, InputNumber, Upload, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useCreateProduct, useUpdateProduct, useProducts } from '../../utils/useProducts';

const { Option } = Select;
const { TextArea } = Input;

const ProductForm = ({ visible, onClose, editProductId }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: products } = useProducts();

  React.useEffect(() => {
    if (editProductId && products) {
      const productToEdit = Array.isArray(products.data) &&  products.data.find((product) => product._id === editProductId);
      if (productToEdit) {
        form.setFieldsValue({
          name: productToEdit.name,
          description: productToEdit.description,
          price: productToEdit.price,
          category: productToEdit.category,
          stock: productToEdit.stock,
        });
        
        if (productToEdit.images && productToEdit.images.length > 0) {
          setFileList(productToEdit.images.map((img, index) => ({
            uid: `-${index}`,
            name: `image-${index}`,
            status: 'done',
            url: img.url,
            public_id: img.public_id
          })));
        }
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [editProductId, products, form]);

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'newsimgupload'); // Replace with your upload preset
    formData.append('cloud_name', 'dikxwu8om'); // Replace with your cloud name
    
    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dikxwu8om/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );
      
      const data = await response.json();
      return { 
        url: data.secure_url, 
        public_id: data.public_id 
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onFinish = async (values) => {
    try {
      setUploading(true);
      
      // Upload new images to Cloudinary
      const uploadedImages = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          // New image - upload to Cloudinary
          const result = await uploadImageToCloudinary(file.originFileObj);
          uploadedImages.push({
            url: result.url,
            public_id: result.public_id
          });
        } else if (file.url) {
          // Existing image - keep as is
          uploadedImages.push({
            url: file.url,
            public_id: file.public_id
          });
        }
      }

      // Prepare product data with Cloudinary URLs
      const productData = {
        ...values,
        images: uploadedImages
      };

      if (editProductId) {
        await updateProduct.mutateAsync({ 
          id: editProductId, 
          productData 
        });
      } else {
        await createProduct.mutateAsync(productData);
      }
      
      message.success(
        editProductId 
          ? 'Product updated successfully!' 
          : 'Product created successfully!'
      );
      onClose();
    } catch (error) {
      console.error('Error:', error);
      message.error(
        error.response?.data?.message || 
        'An error occurred while saving the product'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Drawer
      title={editProductId ? 'Edit Product' : 'Add Product'}
      width={500}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={uploading || createProduct.isPending || updateProduct.isPending}
          >
            {editProductId ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={4} placeholder="Enter product description" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
            placeholder="Enter price"
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select category' }]}
        >
          <Select placeholder="Select product category">
            <Option value="engine-parts">Engine Parts</Option>
            <Option value="electrical">Electrical</Option>
            <Option value="body-parts">Body Parts</Option>
            <Option value="accessories">Accessories</Option>
            <Option value="lubricants">Lubricants</Option>
            <Option value="tools">Tools</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="stock"
          label="Stock Quantity"
          rules={[{ required: true, message: 'Please enter stock quantity' }]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} 
            placeholder="Enter stock quantity" 
          />
        </Form.Item>

        <Form.Item 
          label="Product Images"
          extra="Upload up to 5 images (JPEG/PNG, max 5MB each)"
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            onPreview={handlePreview}
            beforeUpload={beforeUpload}
            multiple
            accept="image/*"
          >
            {fileList.length >= 5 ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>

      {previewVisible && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewVisible,
            onVisibleChange: (visible) => setPreviewVisible(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </Drawer>
  );
};

export default ProductForm;