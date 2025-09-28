import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import axios from '../axiosConfig';
import toast from 'react-hot-toast';

const { Title } = Typography;

function ChangePassword() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  const changePasswordMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.patch(`/auth/change-password/${user._id}`, values);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully! Redirecting to login...');
      // Clear user data from localStorage
      localStorage.removeItem('user');
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href='/login'
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Password change failed');
    },
  });

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await changePasswordMutation.mutateAsync(values);
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('newPassword') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('The two passwords do not match!'));
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600">
      <Card style={{ width: '100%', maxWidth: 500 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Change Your Password
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              validatePassword
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || changePasswordMutation.isLoading}
              block
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ChangePassword;