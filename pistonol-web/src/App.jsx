import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Layout, Spin } from "antd";
import AppHeader from "./components/Header";
import AppSidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import "antd/dist/reset.css";
import Employee from "./pages/Employee";
import QRCode from "./pages/QRCode";
import Product from "./pages/Product";
import useAuthStore from "./store/useAuthStore";
import Marquee from "./pages/Marquee";
import Banner from "./pages/Banner";
import Distributor from "./pages/Distributor";
import Verification from "./pages/Verification";
import ChangePassword from "./pages/ChangePassword";
import CompanyOrdersDashboard from "./pages/CompanyOrdersDashboard";
import DealerOrderForm from "./components/Distributor/DealerOrderForm";
import Cus from "./pages/Dashboard/Cus";
import ForgotPassword from "./pages/PassForgot";
import ResetPassword from "./pages/ResetPassword";
import LeadManagement from "./pages/LeadManagement";
import Store from "./pages/Store";

const { Content } = Layout;

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Wallet = lazy(() => import("./pages/Wallet"));

 
const AppRoutes = () => {
  const { user,checkAuth, isAuthenticated } = useAuthStore();
 
  const [collapsed, setCollapsed] = useState(false);
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];


  useEffect(() => {
    checkAuth(); // refresh ke time auto call hoga
  }, []);
  // Always accessible (public routes)
  const publicRoutes = (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/pass-forgot" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verification" element={<Verification />} />

      {/* Example extra public routes */}
      <Route path="/about" element={<div>About Page</div>} />
      <Route path="/contact" element={<div>Contact Page</div>} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  // Authenticated (private routes)
  const privateRoutes = (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar
        permissions={permissions}
        setCollapsed={setCollapsed}
        collapsed={collapsed}
      />
      <Layout
        style={{ marginLeft: collapsed ? 0 : 240, transition: "all 0.2s" }}
      >
        <AppHeader user={user} />
        <Content style={{ margin: "24px 16px",  background: "#f0f2f5" }}>
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
              </div>
            }
          >
            <Routes>
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              {permissions.includes("wallet") && (
                <Route path="/wallet" element={<Wallet />} />
              )}
              {permissions.includes("employee") && (
                <Route path="/employee" element={<Employee />} />
              )}
              {permissions.includes("leads") && (
                <Route path="/leads" element={<LeadManagement createdBy={user} />} />
              )}
              {permissions.includes("cus") && (
                <Route path="/cus" element={<Cus />} />
              )}





              {permissions.includes("store") && (
                <Route path="/store" element={<Store />} />
              )}



              {permissions.includes("distributor") && (
                <Route path="/distributor" element={<Distributor />} />
              )}
              {permissions.includes("product") && (
                <Route path="/product" element={<Product />} />
              )}
              {permissions.includes("CompanyOrdersDashboard") && (
                <Route path="/CompanyOrdersDashboard" element={<CompanyOrdersDashboard />} />
              )}
              {permissions.includes("DealerOrderForm") && (
                <Route
                  path="/DealerOrderForm"
                  element={<DealerOrderForm user={user} />}
                />
              )}
              {permissions.includes("QRCode") && (
                <Route path="/qrcode" element={<QRCode />} />
              )}
              {permissions.includes("marquee") && (
                <Route path="/marquee" element={<Marquee />} />
              )}
              {permissions.includes("banner") && (
                <Route path="/banner" element={<Banner />} />
              )}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );

  // Render logic
  return (
    <Suspense
      fallback={
        <Spin
          size="large"
          className="flex h-screen items-center justify-center"
        />
      }
    >
      {isAuthenticated ? privateRoutes : publicRoutes}
    </Suspense>
  );
};










const App = () => (
  <Router>
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  </Router>
);

export default App;
