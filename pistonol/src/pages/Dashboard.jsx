// import EmployeeStates from "./Dashboard/EmployeeStates";
// import LeadAnalytics from "./Dashboard/LeadAnalytics";
// // import LeadList from "./Dashboard/LeadList";
// import QRAnalytics from "./Dashboard/QRAnalytics";
// import LeadDashBoardFromEmp from "./LeadDashBoardFromEmp";
 

// const Dashboard = ({ user }) => {
//   console.log(user)
//   return (
//     <div className="">
//        {user.role!=="company-employee" <EmployeeStates />
//       <QRAnalytics />
//       <LeadAnalytics /> }
//      <LeadDashBoardFromEmp/>
  
//     </div>
//   );
// };

// export default Dashboard;


import EmployeeStates from "./Dashboard/EmployeeStates";
import LeadAnalytics from "./Dashboard/LeadAnalytics";
// import LeadList from "./Dashboard/LeadList";
import QRAnalytics from "./Dashboard/QRAnalytics";
import LeadDashBoardFromEmp from "./LeadDashBoardFromEmp";

const Dashboard = ({ user }) => {
   

  return (
    <div>
      {user.role === "company-employee" ? (
        // Employee dashboard
        <LeadDashBoardFromEmp createdBy={user._id}   />
      ) : (
        // Non-employee dashboard
        <>
          <EmployeeStates />
          <QRAnalytics />
          <LeadAnalytics />
          {/* <LeadList/> */}
        </>
      )}
    </div>
  );
};

export default Dashboard;
