 
import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Drawer, 
  message, 
  Upload, 
  Image,
  Row,
  Col,
  InputNumber
} from 'antd';
import { 
  UploadOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useCreateUser, useUpdateUser, useUsers } from '../../utils/useUsers';

const { Option } = Select;
const { TextArea } = Input;

const EmployeeForm = ({ visible, onClose, editUserId }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: users } = useUsers();

  React.useEffect(() => {
    if (editUserId && users) {
      const userToEdit = users.find((user) => user._id === editUserId);
      if (userToEdit) {
        form.setFieldsValue({
          username: userToEdit.username,
          mobile: userToEdit.mobile,
          role: userToEdit.role,
          // Optional fields
          name: userToEdit.name,
          email: userToEdit.email,
          panNumber: userToEdit.panNumber,
          aadhaarNumber: userToEdit.aadhaarNumber,
          address: userToEdit.address,
          state: userToEdit.state,
          district: userToEdit.district,
          pincode: userToEdit.pincode
        });
        
        if (userToEdit.photo) {
          setFileList([{
            uid: '-1',
            name: 'profile-photo',
            status: 'done',
            url: userToEdit.photo.url,
            public_id: userToEdit.photo.public_id
          }]);
        }
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [editUserId, users, form]);

  const handlePreview = async file => {
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
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'newsimgupload');
    
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dikxwu8om/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      return { url: data.secure_url, public_id: data.public_id };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onFinish = async (values) => {
    try {
      let photoData = null;
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        photoData = await uploadImageToCloudinary(fileList[0].originFileObj);
      } else if (fileList.length > 0 && fileList[0].url) {
        photoData = {
          url: fileList[0].url,
          public_id: fileList[0].public_id
        };
      }

      const userData = {
        username: values.username,
        mobile: values.mobile,
        role: values.role,
        ...(values.name && { name: values.name }),
        ...(values.email && { email: values.email }),
        ...(values.panNumber && { panNumber: values.panNumber }),
        ...(values.aadhaarNumber && { aadhaarNumber: values.aadhaarNumber }),
        ...(values.address && { address: values.address }),
        ...(values.state && { state: values.state }),
        ...(values.district && { district: values.district }),
        ...(values.pincode && { pincode: values.pincode }),
        ...(photoData && { photo: photoData })
      };

      if (editUserId) {
        await updateUser.mutateAsync({ 
          id: editUserId, 
          userData 
        });
        message.success('Employee updated successfully!');
      } else {
        await createUser.mutateAsync({
          ...userData,
          password: values.password // Password only required for new users
        });
        message.success('Employee created successfully!');
      }
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Drawer
      title={editUserId ? 'Edit Employee' : 'Add Employee'}
      width={600}
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
            loading={createUser.isPending || updateUser.isPending}
          >
            Submit
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
           
          <Col span={12}>
            <Form.Item
              name="mobile"
              label="Mobile Number"
              rules={[
                { required: true, message: 'Please enter mobile number' },
                { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10 digit mobile number' }
              ]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                prefix={<PhoneOutlined />} 
                placeholder="Enter mobile number"
              />
            </Form.Item>
          </Col>
        </Row>

        {!editUserId && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
        )}

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select role' }]}
        >
          <Select placeholder="Select role">
            {/* <Option value="company">Company</Option> */}
            <Option value="company-employee">Company Employee</Option>
            {/* <Option value="distributor">Distributor</Option>
            <Option value="dealer">Dealer</Option>
            <Option value="mechanic">Mechanic</Option>
            <Option value="customer">Customer</Option> */}
          </Select>
        </Form.Item>

        {/* Optional Fields */}
        <Form.Item
          name="name"
          label="Full Name"
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: 'email', message: 'Please enter valid email' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter email" />
        </Form.Item>

        <Form.Item label="Profile Photo">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            onPreview={handlePreview}
            beforeUpload={beforeUpload}
            maxCount={1}
            accept="image/*"
          >
            {fileList.length >= 1 ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          name="panNumber"
          label="PAN Number"
          rules={[
            { pattern: /[A-Z]{5}[0-9]{4}[A-Z]{1}/, message: 'Please enter valid PAN number' }
          ]}
        >
          <Input prefix={<IdcardOutlined />} placeholder="Enter PAN number" />
        </Form.Item>

        <Form.Item
          name="aadhaarNumber"
          label="Aadhaar Number"
          rules={[
            { pattern: /^[0-9]{12}$/, message: 'Please enter valid 12 digit Aadhaar number' }
          ]}
        >
          <InputNumber 
            style={{ width: '100%' }}
            prefix={<IdcardOutlined />} 
            placeholder="Enter Aadhaar number"
          />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
        >
          <TextArea rows={3} prefix={<HomeOutlined />} placeholder="Enter full address" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
           <Form.Item name="state" label="State">
  <Select placeholder="Select state" showSearch optionFilterProp="children">
    <Select.Option value="Andhra Pradesh">Andhra Pradesh</Select.Option>
    <Select.Option value="Arunachal Pradesh">Arunachal Pradesh</Select.Option>
    <Select.Option value="Assam">Assam</Select.Option>
    <Select.Option value="Bihar">Bihar</Select.Option>
    <Select.Option value="Chhattisgarh">Chhattisgarh</Select.Option>
    <Select.Option value="Goa">Goa</Select.Option>
    <Select.Option value="Gujarat">Gujarat</Select.Option>
    <Select.Option value="Haryana">Haryana</Select.Option>
    <Select.Option value="Himachal Pradesh">Himachal Pradesh</Select.Option>
    <Select.Option value="Jharkhand">Jharkhand</Select.Option>
    <Select.Option value="Karnataka">Karnataka</Select.Option>
    <Select.Option value="Kerala">Kerala</Select.Option>
    <Select.Option value="Madhya Pradesh">Madhya Pradesh</Select.Option>
    <Select.Option value="Maharashtra">Maharashtra</Select.Option>
    <Select.Option value="Manipur">Manipur</Select.Option>
    <Select.Option value="Meghalaya">Meghalaya</Select.Option>
    <Select.Option value="Mizoram">Mizoram</Select.Option>
    <Select.Option value="Nagaland">Nagaland</Select.Option>
    <Select.Option value="Odisha">Odisha</Select.Option>
    <Select.Option value="Punjab">Punjab</Select.Option>
    <Select.Option value="Rajasthan">Rajasthan</Select.Option>
    <Select.Option value="Sikkim">Sikkim</Select.Option>
    <Select.Option value="Tamil Nadu">Tamil Nadu</Select.Option>
    <Select.Option value="Telangana">Telangana</Select.Option>
    <Select.Option value="Tripura">Tripura</Select.Option>
    <Select.Option value="Uttar Pradesh">Uttar Pradesh</Select.Option>
    <Select.Option value="Uttarakhand">Uttarakhand</Select.Option>
    <Select.Option value="West Bengal">West Bengal</Select.Option>

    {/* Union Territories */}
    <Select.Option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</Select.Option>
    <Select.Option value="Chandigarh">Chandigarh</Select.Option>
    <Select.Option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</Select.Option>
    <Select.Option value="Delhi">Delhi</Select.Option>
    <Select.Option value="Jammu and Kashmir">Jammu and Kashmir</Select.Option>
    <Select.Option value="Ladakh">Ladakh</Select.Option>
    <Select.Option value="Lakshadweep">Lakshadweep</Select.Option>
    <Select.Option value="Puducherry">Puducherry</Select.Option>
  </Select>
</Form.Item>

          </Col>
          <Col span={12}>
            <Form.Item
              name="district"
              label="District"
            >
              <Input placeholder="Enter district" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="pincode"
          label="Pincode"
          rules={[
            { pattern: /^[0-9]{6}$/, message: 'Please enter valid 6 digit pincode' }
          ]}
        >
          <InputNumber 
            style={{ width: '100%' }}
            placeholder="Enter pincode" 
          />
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

export default EmployeeForm;