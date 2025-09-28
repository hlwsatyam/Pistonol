import React, { useState } from "react";
import { Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadToCloudinary } from "../../utils/cloudinary";
import toast from "react-hot-toast";

const ImageUploader = ({ onSuccess, maxWidth = 1024, maxHeight = 1024 }) => {
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("You can only upload image files!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      toast.error("Image must be smaller than 5MB!");
      return false;
    }

    return true;
  };

  const handleChange = async (info) => {
    if (info.file.status === "removed") {
      onSuccess(null);
      return;
    }

    if (info.file.status === "done") {
      setLoading(true);
      try {
        const result = await uploadToCloudinary(info.file.originFileObj);
        if (result.success) {
          onSuccess(result.data);
          toast.success("Image uploaded successfully");
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Upload failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Upload
      name="image"
      listType="picture"
      showUploadList={true}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      maxCount={1}
      accept="image/*"
      disabled={loading}
    >
      <Button icon={<UploadOutlined />} loading={loading}>
        Upload Image
      </Button>
    </Upload>
  );
};

export default ImageUploader;
