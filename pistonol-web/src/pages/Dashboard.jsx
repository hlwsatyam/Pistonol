 

// import EmployeeStates from "./Dashboard/EmployeeStates";
// import LeadAnalytics from "./Dashboard/LeadAnalytics";
// // import LeadList from "./Dashboard/LeadList";
// import QRAnalytics from "./Dashboard/QRAnalytics";
// import LeadDashBoardFromEmp from "./LeadDashBoardFromEmp";

// const Dashboard = ({ user }) => {
   

//   return (
//     <div>
//       {user.role === "company-employee" ? (
//         // Employee dashboard
//         <LeadDashBoardFromEmp createdBy={user._id}   />
//       )            
      
      
      
      
      
      
      
      
      
      
//       : (
//         // Non-employee dashboard
//         <>
//           <EmployeeStates />
//           <QRAnalytics />
//           <LeadAnalytics />
//           {/* <LeadList/> */}
//         </>
//       )}
//     </div>
//   );
// };

// export default Dashboard;


 import AllOrdersAdmin from "./Dashboard/AllOrdersAdmin";
import EmployeeStates from "./Dashboard/EmployeeStates";
import LeadAnalytics from "./Dashboard/LeadAnalytics";
// import LeadList from "./Dashboard/LeadList";
import QRAnalytics from "./Dashboard/QRAnalytics";
import DistributorDashboard from "./DistributorDashboard";
import LeadDashBoardFromEmp from "./LeadDashBoardFromEmp";
import ReferralPointsTransfer from "../components/ReferralPointsTransfer";
import AdminTravelDashboard from "./TravelHis";

const Dashboard = ({ user }) => {
  console.log(user);

  return (
    <div>
      {user.role === "company-employee" ? (
        // ✅ Employee dashboard
        <LeadDashBoardFromEmp createdBy={user._id} />
      ) : user.role === "distributor" ? (
        // ✅ Distributor dashboard
        <DistributorDashboard user={user} />
      ) : (
        // ✅ Default (non-employee/non-distributor) dashboard
        <>
          <EmployeeStates />
          <QRAnalytics />
          <LeadAnalytics />

<AllOrdersAdmin/>
<ReferralPointsTransfer/>
<AdminTravelDashboard/>
          {/* <LeadList /> */}
        </>
      )}
    </div>
  );
};

export default Dashboard;
