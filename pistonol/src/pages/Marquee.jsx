import React, { useState } from "react";
import { Card } from "antd";
import MarqueeList from "../components/Marquee/MarqueeList";
import MarqueeForm from "../components/Marquee/MarqueeForm";
 

function Marquee() {
  const [visible, setVisible] = useState(false);
  const [editMarqueeId, setEditMarqueeId] = useState(null);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setEditMarqueeId(null);
  };

  return (
    <Card title="Marquee Management" bordered={false}>
      <MarqueeList setEditMarqueeId={setEditMarqueeId} showDrawer={showDrawer} />
      <MarqueeForm
        visible={visible}
        onClose={onClose}
        editMarqueeId={editMarqueeId}
      />
    </Card>
  );
}

export default Marquee;