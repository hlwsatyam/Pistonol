
import React, { useState } from "react";
import { Card } from "antd";
 
 
import DistributorList from "../components/Distributor/DistributorList";
import DistributorForm from "../components/Distributor/DistributorForm";
import AdminTaskAssignmentGlobal from "./AdminTaskAssignmentGlobal.jsx";
import AdminOrderManagementGlobal from "./AdminOrderManagementGlobal.jsx";
import AdminDMRReports from "../components/AdminDMRReports.jsx";
import NotificationCreate from "../components/NotificationCreate.jsx";

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
    <Card title="dealer Management" bordered={false}>

      <DistributorList  title={"dealer"} setEditUserId={setEditUserId} showDrawer={showDrawer} />
      <DistributorForm 
       title={"dealer"} 
        visible={visible}
        onClose={onClose}
        editUserId={editUserId}
      />
         <NotificationCreate role="dealer"/>
{/* <AdminDMRReports  title={"dealer"}  /> */}

      <AdminTaskAssignmentGlobal EmployeType ={"dealer"}  />
      <AdminOrderManagementGlobal  userType="dealer" title="Dealer"  />
    </Card>
  );
}

export default Distributor;
