
import React, { useState } from "react";
import { Card } from "antd";
 
 
import DistributorList from "../components/Distributor/DistributorList";
import DistributorForm from "../components/Distributor/DistributorForm";
import AdminTaskAssignmentGlobal from "./AdminTaskAssignmentGlobal.jsx";
import AdminOrderManagementGlobal from "./AdminOrderManagementGlobal.jsx";
import AdminDMRReports from "../components/AdminDMRReports.jsx";

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
    <Card title="mechanic Management" bordered={false}>

      <DistributorList  title={"mechanic"} setEditUserId={setEditUserId} showDrawer={showDrawer} />
      <DistributorForm 
       title={"mechanic"} 
        visible={visible}
        onClose={onClose}
        editUserId={editUserId}
      />
{/* <AdminDMRReports  title={"dealer"}  /> */}

      <AdminTaskAssignmentGlobal EmployeType ={"mechanic"}  />
      <AdminOrderManagementGlobal  userType="mechanic" title="mechanic"  />
    </Card>
  );
}

export default Distributor;
