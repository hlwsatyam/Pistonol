import { useState } from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import toast from "react-hot-toast";
import axios from "../axiosConfig";

const { Title } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("resetEmail");

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post("/auth/reset-password", { ...values, email });
      toast.success("Password reset successful 🎉");
      setTimeout(() => (window.location.href = "/login"), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reset failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-500 to-pink-600">
      <Card className="w-[400px] shadow-xl">
        <Title level={3} className="text-center">Reset Password</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="OTP"
            name="otp"
            rules={[{ required: true, message: "Enter the OTP" }]}
          >
            <Input placeholder="Enter OTP" />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: "Enter new password" }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
