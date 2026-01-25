import { useState } from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "../axiosConfig";
import useAuthStore from "../store/useAuthStore";
 

const { Title } = Typography;

const loginApi = async (data) => {
  const res = await axios.post("/auth/login", data);
  return res.data;
};

const Login = () => {
  const login = useAuthStore((state) => state.login);

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
  
      if (data?.user?.isVerify) {
        login(data.user);
        toast.success("Login Successful 🎉");
        setTimeout(() => (window.location.href = "/dashboard"), 0);
      } else {
        toast.success("Please Verify Details 🎉");
        
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => (window.location.href = "/verification"), 1000);
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Login failed");
    },
  });

  const onFinish = (values) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600">
      <Card className="w-[400px] shadow-2xl" bordered={false}>
        <div className="flex justify-center items-center gap-3">
          <img
            src={
              "https://i.ibb.co/Ld9gxfgT/Whats-App-Image-2026-01-25-at-1-06-36-PM.jpg"
            }
            className="w-[100px]"
          />
        </div>

        <Title level={3} className="text-center mb-6 text-purple-700">
          Login to your account
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="w-full bg-purple-700 hover:bg-purple-600"
            >
              {mutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>
        </Form>
        <a href="/pass-forgot">Forgot Password?</a>
      </Card>
    </div>
  );
};

export default Login;
