import React, { useState } from "react";
import { Card } from "antd";
import QRCodeList from "../components/Qr/QRCodeList";
import QRCodeForm from "../components/Qr/QRCodeForm";
 

function QRCode() {
  const [visible, setVisible] = useState(false);
  const [editQRId, setEditQRId] = useState(null);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setEditQRId(null);
  };

  return (
    <Card title="QR Code Management" bordered={false}>
      <QRCodeList setEditQRId={setEditQRId} showDrawer={showDrawer} />
      <QRCodeForm
        visible={visible}
        onClose={onClose}
        editQRId={editQRId}
      />
    </Card>
  );
}

export default QRCode;