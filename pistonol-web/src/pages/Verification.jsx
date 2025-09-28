import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Form, Select, Button, Card, Skeleton, message } from "antd";
import axios from "../axiosConfig";
import toast from "react-hot-toast";

const { Option } = Select;

function Verification() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const roleOptions = [
    { value: "distributor", label: "Distributor" },
    { value: "dealer", label: "Dealer" },
    { value: "mechanic", label: "Mechanic" },
    { value: "company-employee", label: "Company Employee" },
  ];

  const verifyMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.patch(
        `/auth/verify/${user._id}`,
        values
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
      toast.success("Verification successful! Redirecting...");
      navigate("/change-password");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Verification failed");
    },
  });

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await verifyMutation.mutateAsync(values);
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card style={{ width: "100%", maxWidth: 500, margin: "0 auto" }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600">
      <Card
        title="Complete Your Registration"
        style={{ width: "100%", maxWidth: 500 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            username: user.username,
          }}
        >
          <Form.Item label="Username" name="username">
            <input className="ant-input" disabled value={user.username} />
          </Form.Item>

          <Form.Item
            label="Select Your Role"
            name="role"
            rules={[{ required: true, message: "Please select your role!" }]}
          >
            <Select placeholder="Select your role" loading={loading}>
              {roleOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || verifyMutation.isLoading}
              block
            >
              Complete Registration
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Verification;
