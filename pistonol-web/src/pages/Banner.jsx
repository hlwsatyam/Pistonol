import React, { useState } from "react";
import { Card } from "antd";
import BannerList from "../components/Banner/BannerList";
import BannerForm from "../components/Banner/BannerForm";
 
function Banner() {
  const [visible, setVisible] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setEditBannerId(null);
  };

  return (
    <Card title="Banner Management" bordered={false}>
      <BannerList setEditBannerId={setEditBannerId} showDrawer={showDrawer} />
      <BannerForm
        visible={visible}
        onClose={onClose}
        editBannerId={editBannerId}
      />
    </Card>
  );
}

export default Banner;