import React from "react";
import { Card, Statistic, Typography, Tag } from "antd";
import { AiOutlineWallet, AiOutlineCheckCircle } from "react-icons/ai";
import { MdSpaceDashboard } from "react-icons/md";

const { Title, Text } = Typography;

const UserDetails = ({ user }) => {
  return (
    <div className="p-6   bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="!text-gray-800">
              <MdSpaceDashboard className="inline-block mr-2 text-blue-600" />
              Welcome, <span className="text-blue-600">{user.username}</span>
            </Title>
            <Text type="secondary">Manage your company operations here.</Text>
          </div>
          <div className="text-right">
            <Statistic
              title="Wallet Balance"
              value={user.wallet}
              prefix={<AiOutlineWallet className="text-lg text-green-600" />}
              valueStyle={{
                color: user.wallet >= 0 ? "green" : "red",
                fontWeight: 600,
              }}
              suffix="₹"
            />
          </div>
        </div>

        {/* Verification */}
        {user.isVerify && (
          <Tag icon={<AiOutlineCheckCircle />} color="success">
            Verified Account
          </Tag>
        )}

        {/* Permissions Grid */}
        <Card title="Your Access Permissions" className="shadow-xl rounded-2xl">
          {user.permissions.map((perm, index) => (
            <Card.Grid
              key={index}
              style={{
                width: "25%",
                textAlign: "center",
                padding: 20,
                borderRadius: 12,
              }}
              className="hover:shadow-md transition-all duration-200"
            >
              <span className="text-blue-600 font-semibold capitalize">{perm}</span>
            </Card.Grid>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default UserDetails;
