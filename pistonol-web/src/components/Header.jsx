import { Layout, Avatar, Dropdown, message } from "antd";
import { UserOutlined, WalletOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const { Header } = Layout;

const AppHeader = ({ user }) => {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key === "3") {
      // Logout logic
      localStorage.clear(); // or remove specific token if preferred
      sessionStorage.clear();
      toast.success("Logged out successfully");
      navigate("/login"); 
      window.location.reload()
    }
  };

  const menuItems = [
    {
      key: "1",
      label: "Profile",
    },
    {
      key: "2",
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: "Logout",
    },
  ];

  return (
    <Header className="!bg-white px-6  flex items-center justify-between border-b border-gray-200 h-16">
      {/* Left side - Logo */}
      <div className="flex items-center gap-3">
        <img
          src="https://pistonol.com/wp-content/uploads/2023/04/Pistonol-letter-Logo-3D-effect-1536x458.png"
          className="w-[100px]"
          alt="Company Logo"
        />
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
          <WalletOutlined className="text-gray-600" />
          <span className="font-medium text-gray-700">
           ₹{user.wallet.toFixed(2)}
          </span>
        </div>

        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow={{ pointAtCenter: true }}
        >
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-full">
            <Avatar
              size={32}
              icon={<UserOutlined />}
              className="bg-blue-100 text-blue-600"
            />
            <div className="hidden md:flex flex-col">
              <span className="font-medium text-sm text-gray-800">
                {user.username}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
