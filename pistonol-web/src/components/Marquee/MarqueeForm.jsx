import React from "react";
import {
  Form,
  Input,
  Button,
  Drawer,
  message,
  Switch,
  DatePicker,
  Select,
} from "antd";
import {
  useCreateMarquee,
  useUpdateMarquee,
  useMarquees,
} from "../../hooks/useMarquees";
import dayjs from "dayjs";

const { TextArea } = Input;

const MarqueeForm = ({ visible, onClose, editMarqueeId }) => {
  const [form] = Form.useForm();
  const createMarquee = useCreateMarquee();
  const updateMarquee = useUpdateMarquee();
  const { data: marquees } = useMarquees();

  React.useEffect(() => {
    if (editMarqueeId && marquees) {
      const marqueeToEdit = marquees.find((m) => m._id === editMarqueeId);
      if (marqueeToEdit) {
        form.setFieldsValue({
          text: marqueeToEdit.text,
          isActive: marqueeToEdit.isActive,
          targetAudience: marqueeToEdit.targetAudience,
          startDate: dayjs(marqueeToEdit.startDate),
          endDate: dayjs(marqueeToEdit.endDate),
        });
      }
    } else {
      form.resetFields();
    }
  }, [editMarqueeId, marquees, form]);

  const onFinish = async (values) => {
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      if (editMarqueeId) {
        await updateMarquee.mutateAsync({
          id: editMarqueeId,
          marqueeData: formattedValues,
        });
      } else {
        await createMarquee.mutateAsync(formattedValues);
      }
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <Drawer
      title={editMarqueeId ? "Edit Marquee" : "Add New Marquee"}
      width={500}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={createMarquee.isLoading || updateMarquee.isLoading}
          >
            {editMarqueeId ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="text"
          label="Marquee Text"
          rules={[{ required: true, message: "Please enter marquee text" }]}
        >
          <TextArea rows={4} placeholder="Enter text to display in marquee" />
        </Form.Item>

        <Form.Item
          name="targetAudience"
          label="Target Audience"
          rules={[{ required: true, message: "Please select target audience" }]}
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
          name="isActive"
          label="Active Status"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: "Please select start date" }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="End Date"
          rules={[{ required: true, message: "Please select end date" }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default MarqueeForm;
