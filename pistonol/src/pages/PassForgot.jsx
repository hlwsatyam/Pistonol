import { useState } from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import toast from "react-hot-toast";
import axios from "../axiosConfig";

const { Title } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", values);
      toast.success("OTP sent to your email 🎉");
      localStorage.setItem("resetEmail", values.email);
      window.location.href = "/reset-password";
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error sending OTP");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-600">
      <Card className="w-[400px] shadow-xl">
        <Title level={3} className="text-center">Forgot Password</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email", message: "Enter valid email" }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Send OTP
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
