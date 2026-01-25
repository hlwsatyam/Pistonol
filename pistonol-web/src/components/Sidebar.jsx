import { Layout, Menu } from "antd";
import { DashboardOutlined, WalletOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AiOutlineTeam } from "react-icons/ai";
import { useState } from "react";
import { FaLevelDownAlt, FaStore } from "react-icons/fa";

const { Sider } = Layout;

const AppSidebar = ({ permissions ,  collapsed, setCollapsed   }) => {
  const navigate = useNavigate();
  

  const items = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    permissions.includes("employee") && { key: "/employee", icon: <AiOutlineTeam />, label: "Employee" },
    permissions.includes("cus") && { key: "/cus", icon: <AiOutlineTeam />, label: "Customer" },
    permissions.includes("distributor") && { key: "/distributor", icon: <AiOutlineTeam />, label: "Distributor" },
    permissions.includes("dealer") && { key: "/dealer", icon: <AiOutlineTeam />, label: "Dealer" },
    permissions.includes("mechanic") && { key: "/mechanic", icon: <AiOutlineTeam />, label: "Mechanic" },
    permissions.includes("CompanyOrdersDashboard") && { key: "/CompanyOrdersDashboard", icon: <AiOutlineTeam />, label: "Company Orders Dashboard" },
    permissions.includes("DealerOrderForm") && { key: "/DealerOrderForm", icon: <AiOutlineTeam />, label: "Create Order" },
    permissions.includes("wallet") && { key: "/wallet", icon: <WalletOutlined />, label: "Wallet" },
    permissions.includes("store") && { key: "/store", icon: <FaStore />, label: "Store" },
    permissions.includes("leads") && { key: "/leads", icon: <FaLevelDownAlt />, label: "Leads" },
    permissions.includes("marquee") && { key: "/marquee", icon: <WalletOutlined />, label: "Scroll Message" },
    permissions.includes("banner") && { key: "/banner", icon: <WalletOutlined />, label: "Banner" },
    permissions.includes("product") && { key: "/product", icon: <WalletOutlined />, label: "Product" },
    permissions.includes("QRCode") && { key: "/qrcode", icon: <WalletOutlined />, label: "QR Generator" },
  ].filter(Boolean);

  const handleClick = ({ key }) => {
    if (key === "logout") {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate(key);
    }
  };

  return (
    <Sider
      collapsible
      
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      breakpoint="lg" // lg = 992px, auto collapse below this
      collapsedWidth={0} // completely hide on mobile
      style={{ height: "100vh", position: "fixed", left: 0, top: 0, bottom: 0 }}
      className="flex flex-col bg-gray-900 z-50"
    >
      <div className="text-wh   !bg-white  text-center py-4 font-bold flex-shrink-0 border-b border-gray-700">
          
    <img
          src="https://i.ibb.co/Ld9gxfgT/Whats-App-Image-2026-01-25-at-1-06-36-PM.jpg"
          className="w-[100px]  mx-auto"
          alt="Company Logo"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          onClick={handleClick}
          defaultSelectedKeys={["/dashboard"]}
          style={{ borderRight: 0 }}
        />
      </div>
    </Sider>
  );
};

export default AppSidebar;
