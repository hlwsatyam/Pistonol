import React from 'react';
import { Form, Input, InputNumber, Button, Drawer, message, Select } from 'antd';
import { useGenerateQRCodes, useUpdateQRCode, useQRCodes } from '../../hooks/useQRCodes';
 

const QRCodeForm = ({ visible, onClose, editQRId }) => {
  const [form] = Form.useForm();
  const generateQRCodes = useGenerateQRCodes();
  const updateQRCode = useUpdateQRCode();
  const { data: qrCodes } = useQRCodes();
 
  React.useEffect(() => {
    if (editQRId && qrCodes) {
      const qrToEdit = Array.isArray(qrCodes.data) && qrCodes.data.find((qr) => qr._id === editQRId);
      if (qrToEdit) {
        form.setFieldsValue({
          value: qrToEdit.value,
          quantity: qrToEdit.quantity,
          batchNumber: qrToEdit.batchNumber,
          status: qrToEdit.status,
        });
      }
    } else {
      form.resetFields();
    }
  }, [editQRId, qrCodes, form]);

  const onFinish = async (values) => {
    try {
      if (editQRId) {
        await updateQRCode.mutateAsync({ id: editQRId, qrData: values });
      } else {
        // For bulk generation
        await generateQRCodes.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Drawer
      title={editQRId ? 'Edit QR Code' : 'Generate QR Codes'}
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
            loading={generateQRCodes.isPending || updateQRCode.isPending}
          >
            {editQRId ? 'Update' : 'Generate'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="value"
          label="QR Code Value"

          rules={[{ required: true, message: 'Please enter QR code value' }]}
        >
          <InputNumber   style={{ width: '100%' }} placeholder="Enter value for QR code" />
        </Form.Item>

        {!editQRId && (
          <>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <InputNumber 
                min={1} 
                max={1000} 
                style={{ width: '100%' }} 
                placeholder="How many QR codes to generate?" 
              />
            </Form.Item>

            <Form.Item
              name="batchNumber"
              label="Batch Number"
              rules={[{ required: true, message: 'Please enter batch number' }]}
            >
              <Input placeholder="Enter batch number" />
            </Form.Item>
          </>
        )}

        {editQRId && (
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="used">Used</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default QRCodeForm;