"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { GButton, GInput, GModalWrapper, GTable } from "@gal-ui/components";
import { Form, Tag, Space, Popconfirm } from "antd";
import { useState } from "react";
import { useWhitelist } from "@/hooks/root-admin/useWhitelist";
import type { AddWhitelistPayload, GovWhitelist } from "@/lib/types/whitelist";

function RootAdminContent() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState<{
    open: boolean;
    type: string | null;
  }>({
    open: false,
    type: null,
  });

  const { whitelists, isLoading, addUser, toggleStatus, isAdding, isUpdating } =
    useWhitelist();

  const toggleModal = (type: string | null) => {
    setIsModalVisible({
      open: !isModalVisible.open,
      type,
    });
    if (!type) {
      form.resetFields();
    }
  };

  const handleAddUser = async (values: AddWhitelistPayload) => {
    try {
      await addUser(values);
      toggleModal(null);
      form.resetFields();
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "REVOKED" : "ACTIVE";
    try {
      await toggleStatus(userId, newStatus);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const CustomHeader = () => {
    return (
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">GOV User Whitelist</h1>
        <GButton btn_type="primary" onClick={() => toggleModal("addUser")}>
          Add User
        </GButton>
      </div>
    );
  };

  const AddUserModal = () => {
    return (
      <Form form={form} layout="vertical" onFinish={handleAddUser}>
        <Form.Item
          rules={[
            { required: true, message: "Wallet Address is required" },
            {
              pattern: /^0x[a-fA-F0-9]{40}$/,
              message: "Invalid wallet address format",
            },
          ]}
          label="Wallet Address"
          name="wallet_address"
        >
          <GInput placeholder="0x..." />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Full Name is required" }]}
          label="Full Name"
          name="full_name"
        >
          <GInput placeholder="Enter full name" />
        </Form.Item>
        <div className="flex justify-end gap-[10px]">
          <GButton
            btn_type="secondary-gray"
            onClick={() => toggleModal(null)}
            disabled={isAdding}
          >
            Cancel
          </GButton>
          <GButton btn_type="primary" htmlType="submit" loading={isAdding}>
            Add User
          </GButton>
        </div>
      </Form>
    );
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: ["users", "full_name"],
      key: "full_name",
      render: (text: string) => text || "-",
    },
    {
      title: "Wallet Address",
      dataIndex: ["users", "wallet_address"],
      key: "wallet_address",
      render: (address: string) => (
        <span className="font-mono text-sm">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "-"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Added At",
      dataIndex: "added_at",
      key: "added_at",
      render: (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: GovWhitelist) => (
        <Space>
          <Popconfirm
            title={`${
              record.status === "ACTIVE" ? "Revoke" : "Activate"
            } this user?`}
            description={`Are you sure you want to ${
              record.status === "ACTIVE" ? "revoke" : "activate"
            } this user's whitelist access?`}
            onConfirm={() => handleToggleStatus(record.user_id, record.status)}
            okText="Yes"
            cancelText="No"
          >
            <GButton
              btn_type={record.status === "ACTIVE" ? "destructive" : "primary"}
              size="small"
              loading={isUpdating}
            >
              {record.status === "ACTIVE" ? "Revoke" : "Activate"}
            </GButton>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const modalObject = {
    addUser: <AddUserModal />,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-[20px]">
      <GTable
        customHeader={<CustomHeader />}
        columns={columns}
        dataSource={whitelists}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
        }}
      />
      <GModalWrapper
        footer={null}
        titleText="Add User to Whitelist"
        open={isModalVisible.open}
        onCancel={() => toggleModal(null)}
      >
        {modalObject[isModalVisible?.type as keyof typeof modalObject]}
      </GModalWrapper>
    </div>
  );
}

export default function RootAdmin() {
  return (
    <AuthGuard requiredUserType="ROOT" redirectTo="/">
      <RootAdminContent />
    </AuthGuard>
  );
}