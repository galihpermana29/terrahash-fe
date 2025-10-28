"use client";

import { useState } from "react";
import { Tag, Typography, Button, Modal, Input, Select, Card, Space } from "antd";
import { EyeOutlined, SearchOutlined, ReloadOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useGovernmentObjections } from "@/hooks/useObjections";
import { updateObjectionStatus } from "@/client-action/objection";
import type { ObjectionWithDetails } from "@/lib/types/objection";
import AuthGuard from "@/components/auth/AuthGuard";
import { GTable } from "@gal-ui/components";
import { submitMessageToTopic } from "@/lib/hedera/h";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const GovernmentObjectionPage = () => {
  const { objections, isLoading, error, refetch } = useGovernmentObjections();
  const [selectedObjection, setSelectedObjection] = useState<ObjectionWithDetails | null>(null);
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleViewDetails = (objection: ObjectionWithDetails) => {
    setSelectedObjection(objection);
    setDetailModalOpen(true);
  };


  const handleStatusUpdate = async (objectionId: string, newStatus: 'PENDING' | 'REVIEWED' | 'RESOLVED') => {
    setUpdatingStatus(objectionId);
    try {
      console.log("Updating status for objection:", selectedObjection);
      const submitResult = await submitMessageToTopic(
        selectedObjection?.ob_topic_id || "",
        `Status Update for Objection ${objectionId}: ${newStatus}`,
        selectedObjection?.parcel.parcel_id || ""
      );

      console.log("Submitted status update to topic with result:", submitResult);

      if (submitResult) {
        const response = await updateObjectionStatus(objectionId, { status: newStatus });

        if (response.success) {
          await refetch(); // Refresh the data
          if (selectedObjection?.id === objectionId) {
            setSelectedObjection({ ...selectedObjection, status: newStatus });
          }
        }
      }
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter objections based on search and status
  const filteredObjections = objections.filter((objection) => {
    const matchesSearch =
      objection.parcel_id?.toLowerCase().includes(searchText.toLowerCase()) ||
      objection.user?.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      objection.message?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === "all" || objection.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  
  const columns = [
    {
      title: "Parcel ID",
      dataIndex: "parcel_id",
      key: "parcel_id",
      render: (parcel_id: string) => (
        <Text strong>{parcel_id}</Text>
      ),
    },
    {
      title: "Submitter",
      dataIndex: ["user", "full_name"],
      key: "submitter",
      render: (name: string, record: ObjectionWithDetails) => (
        <div>
          <div className="font-medium">{name}</div>
          <Text type="secondary" className="text-xs">
            {record.user.wallet_address.slice(0, 10)}...
          </Text>
        </div>
      ),
    },
    {
      title: "Message Preview",
      dataIndex: "message",
      key: "message",
      render: (message: string) => (
        <Text className="text-sm">
          {message.length > 100 ? `${message.substring(0, 100)}...` : message}
        </Text>
      ),
    },
    {
      title: "Location",
      dataIndex: ["parcel", "admin_region"],
      key: "location",
      render: (region: any) => (
        <Text className="text-sm">
          {region.city}, {region.state}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: ObjectionWithDetails) => {
        if (status === 'RESOLVED') {
          return (
            <Tag color="green">Resolved</Tag>
          );
        }
        return (
          <Select
            value={status}
            size="small"
            style={{ width: 120 }}
            loading={updatingStatus === record.id}
            onChange={(newStatus) => handleStatusUpdate(record.id, newStatus as 'PENDING' | 'REVIEWED' | 'RESOLVED')}
            options={[
              { label: "Pending", value: "PENDING" },
              { label: "Reviewed", value: "REVIEWED" },
              { label: "Resolved", value: "RESOLVED" },
            ]}
          />
        );
      },
    },
    {
      title: "Submitted",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: ObjectionWithDetails) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          size="small"
        >
          View Details
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card>
          <div className="text-center py-8">
            <Text type="danger" className="text-lg">
              Error loading objections: {error}
            </Text>
            <br />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={refetch}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard requiredUserType="GOV">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Title level={2} className="!mb-2">
              Land Objections
            </Title>
            <Text type="secondary">
              Review and manage objections submitted by public users regarding land parcels
            </Text>
          </div>

          <Card>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <Search
                placeholder="Search by parcel ID, submitter, or message"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ maxWidth: 400 }}
                prefix={<SearchOutlined />}
              />

              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Reviewed", value: "REVIEWED" },
                  { label: "Resolved", value: "RESOLVED" },
                ]}
              />

              <Button
                icon={<ReloadOutlined />}
                onClick={refetch}
                loading={isLoading}
              >
                Refresh
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Text type="secondary">Total Objections</Text>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredObjections.length}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <Text type="secondary">Pending</Text>
                <div className="text-2xl font-bold text-orange-600">
                  {filteredObjections.filter(o => o.status === "PENDING").length}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Text type="secondary">Reviewed</Text>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredObjections.filter(o => o.status === "REVIEWED").length}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Text type="secondary">Resolved</Text>
                <div className="text-2xl font-bold text-green-600">
                  {filteredObjections.filter(o => o.status === "RESOLVED").length}
                </div>
              </div>
            </div>

            {/* Table */}
            <GTable
              columns={columns}
              dataSource={filteredObjections}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,

                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} objections`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>

          {/* Objection Detail Modal */}
          <Modal
            title="Objection Details"
            open={detailModalOpen}
            onCancel={() => setDetailModalOpen(false)}
            footer={[
              null, null
            ]}
            width={700}
          >
            {selectedObjection && (
              <div className="space-y-6">
                {/* Status and Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Objection id</Text>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {selectedObjection.parcel.ob_topic_id ? selectedObjection.parcel.ob_topic_id : "N/A"}
                      </div>
                      {selectedObjection.parcel.ob_topic_id && (
                        <a
                          href={`https://hashscan.io/testnet/topic/${selectedObjection.parcel.ob_topic_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                          title="View on HashScan"
                        >
                          <svg
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="ml-1"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ display: 'inline' }}
                          >
                            <path
                              d="M14 3h7v7m0-7L10 14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 12v7a2 2 0 0 0 2 2h7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Status</Text>
                    <div className="mt-1">
                      <Tag
                        color={
                          selectedObjection.status === "RESOLVED" ? "green" :
                            selectedObjection.status === "REVIEWED" ? "blue" : "orange"
                        }
                      >
                        {selectedObjection.status}
                      </Tag>
                    </div>
                  </div>
                </div>

                {/* Parcel Information */}
                <div className="border-t pt-4">
                  <Text className="text-lg font-medium">Parcel Information</Text>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Text type="secondary">Parcel ID</Text>
                      <div className="font-medium">{selectedObjection.parcel_id}</div>
                    </div>
                    <div>
                      <Text type="secondary">Area</Text>
                      <div>{selectedObjection.parcel.area_m2.toLocaleString()} m²</div>
                    </div>
                    <div>
                      <Text type="secondary">Location</Text>
                      <div>
                        {selectedObjection.parcel.admin_region.city}, {selectedObjection.parcel.admin_region.state}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Parcel Status</Text>
                      <div>{selectedObjection.parcel.status}</div>
                    </div>
                  </div>
                </div>

                {/* Submitter Information */}
                <div className="border-t pt-4">
                  <Text className="text-lg font-medium">Submitter Information</Text>
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text type="secondary">Full Name</Text>
                        <div className="font-medium">{selectedObjection.user.full_name}</div>
                      </div>
                      <div>
                        <Text type="secondary">Wallet Address</Text>
                        <div className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                          {selectedObjection.user.wallet_address}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <Text className="font-medium text-blue-800">Contact Information</Text>
                      <div className="mt-2 space-y-2">
                        {selectedObjection.user.email && (
                          <div className="flex items-center gap-2">
                            <MailOutlined className="text-blue-600" />
                            <Text>{selectedObjection.user.email}</Text>
                          </div>
                        )}
                        {selectedObjection.user.phone && (
                          <div className="flex items-center gap-2">
                            <PhoneOutlined className="text-blue-600" />
                            <Text>{selectedObjection.user.phone}</Text>
                          </div>
                        )}
                        {!selectedObjection.user.email && !selectedObjection.user.phone && (
                          <Text type="secondary" className="text-sm">
                            No contact information available. You may need to contact the user through their wallet address.
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objection Message */}
                <div className="border-t pt-4">
                  <Text className="text-lg font-medium">Objection Message</Text>
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                    <Paragraph className="whitespace-pre-wrap mb-0">
                      {selectedObjection.message}
                    </Paragraph>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text type="secondary">Submitted</Text>
                      <div>{new Date(selectedObjection.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <Text type="secondary">Last Updated</Text>
                      <div>{new Date(selectedObjection.updated_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="border-t pt-4">
                  <Text className="text-lg font-medium">Update Status</Text>
                  <div className="mt-2">
                    <Space>
                      <Button
                        onClick={() => handleStatusUpdate(selectedObjection.id, "REVIEWED")}
                        loading={updatingStatus === selectedObjection.id}
                        disabled={selectedObjection.status === "REVIEWED"}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => handleStatusUpdate(selectedObjection.id, "RESOLVED")}
                        loading={updatingStatus === selectedObjection.id}
                        disabled={selectedObjection.status === "RESOLVED"}
                      >
                        Mark as Resolved
                      </Button>
                    </Space>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </AuthGuard>
  );
};

export default GovernmentObjectionPage;
