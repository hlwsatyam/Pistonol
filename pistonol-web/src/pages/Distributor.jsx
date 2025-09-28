
import React, { useState } from "react";
import { Card } from "antd";
 
 
import DistributorList from "../components/Distributor/DistributorList";
import DistributorForm from "../components/Distributor/DistributorForm";

function Distributor() {
  const [visible, setVisible] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setEditUserId(null);
  };

  return (
    <Card title="Distributor Management" bordered={false}>
      <DistributorList setEditUserId={setEditUserId} showDrawer={showDrawer} />
      <DistributorForm
        visible={visible}
        onClose={onClose}
        editUserId={editUserId}
      />
    </Card>
  );
}

export default Distributor;
