 




import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Drawer, message, Switch, DatePicker, Select } from 'antd';
import { useCreateBanner, useUpdateBanner, useBanners } from '../../hooks/useBanners';
import dayjs from 'dayjs';

const { Option } = Select;

const BannerForm = ({ visible, onClose, editBannerId }) => {
  const [form] = Form.useForm();
  const [imageData, setImageData] = useState(null);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const { data: banners } = useBanners();

  useEffect(() => {
    if (editBannerId && banners) {
      const bannerToEdit = banners.find((b) => b._id === editBannerId);
      if (bannerToEdit) {
        form.setFieldsValue({
          title: bannerToEdit.title,
          link: bannerToEdit.link,
          isActive: bannerToEdit.isActive,
          targetAudience: bannerToEdit.targetAudience,
          startDate: dayjs(bannerToEdit.startDate),
          endDate: dayjs(bannerToEdit.endDate),
          position: bannerToEdit.position,
          imageUrl: bannerToEdit.imageUrl,
          publicId: bannerToEdit.publicId
        });
        setImageData({
          url: bannerToEdit.imageUrl,
          publicId: bannerToEdit.publicId
        });
      }
    } else {
      form.resetFields();
      setImageData(null);
    }
  }, [editBannerId, banners, form]);

  const onFinish = async (values) => {
    if (!editBannerId && !imageData) {
      message.error('Please upload an image first');
      return;
    }

    try {
      const payload = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      if (editBannerId) {
        await updateBanner.mutateAsync({
          id: editBannerId,
          bannerData: payload
        });
      } else {
        await createBanner.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      message.error(error?.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Drawer
      title={editBannerId ? 'Edit Banner' : 'Add New Banner'}
      width={500}
      onClose={onClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={createBanner.isLoading || updateBanner.isLoading}
          >
            {editBannerId ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Banner Title"
          rules={[{ required: true, message: 'Please enter banner title' }]}
        >
          <Input placeholder="Enter banner title" />
        </Form.Item>

        <Form.Item label="Banner Image" required={!editBannerId}>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const isImage = file.type.startsWith('image/');
              const isLt5M = file.size / 1024 / 1024 < 5;

              if (!isImage) {
                message.error('You can only upload image files!');
                return;
              }
              if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
                return;
              }

              const formData = new FormData();
              formData.append('file', file);
              formData.append('upload_preset', 'newsimgupload');

              try {
                const res = await fetch('https://api.cloudinary.com/v1_1/dikxwu8om/image/upload', {
                  method: 'POST',
                  body: formData,
                });

                const data = await res.json();

                const uploadedData = {
                  url: data.secure_url,
                  publicId: data.public_id,
                };

                setImageData(uploadedData);
                form.setFieldsValue({
                  imageUrl: uploadedData.url,
                  publicId: uploadedData.publicId,
                });

                message.success('Image uploaded successfully!');
              } catch (err) {
                console.error(err);
                message.error('Image upload failed');
              }
            }}
          />
          {imageData?.url && (
            <div style={{ marginTop: 16 }}>
              <img
                src={imageData.url}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 200 }}
              />
            </div>
          )}
        </Form.Item>

        <Form.Item name="imageUrl" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item name="publicId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item name="link" label="Banner Link">
          <Input placeholder="Enter link URL (optional)" />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Active Status"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Form.Item
          name="position"
          label="Position"
          rules={[{ required: true, message: 'Please select position' }]}
        >
          <Select placeholder="Select banner position">
            <Option value="top">Top</Option>
            <Option value="middle">Middle</Option>
            <Option value="bottom">Bottom</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="targetAudience"
          label="Target Audience"
          rules={[{ required: true, message: 'Please select target audience' }]}
        >
          <Select placeholder="Select target audience">
            <Option value="company">Company</Option>
            <Option value="company-employee">Company Employee</Option>
            <Option value="distributor">Distributor</Option>
            <Option value="dealer">Dealer</Option>
            <Option value="mechanic">Mechanic</Option>
            <Option value="customer">Customer</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select start date' }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="End Date"
          rules={[{ required: true, message: 'Please select end date' }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default BannerForm;
