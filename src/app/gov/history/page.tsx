"use client";

import { useState } from "react";
import { Table, Tag, Typography, Button, Modal, Input, Select, Space, Card } from "antd";
import { EyeOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useGovernmentTransactions } from "@/hooks/useTransactions";
import type { TransactionWithDetails } from "@/lib/types/transaction";
import AuthGuard from "@/components/auth/AuthGuard";
import { GTable } from "@gal-ui/components";

const { Title, Text } = Typography;
const { Search } = Input;

const GovernmentTransactionHistoryPage = () => {
  const { transactions, isLoading, error, refetch } = useGovernmentTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleViewDetails = (transaction: TransactionWithDetails) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  // Filter transactions based on search and status
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.parcel_id?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.buyer?.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.seller?.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.transaction_hash?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <Text code className="text-xs">
          {id.slice(0, 8)}...
        </Text>
      ),
    },
    {
      title: "Parcel ID",
      dataIndex: "parcel_id",
      key: "parcel_id",
      render: (parcel_id: string) => (
        <Text strong>{parcel_id}</Text>
      ),
    },
    {
      title: "Buyer",
      dataIndex: ["buyer", "full_name"],
      key: "buyer",
      render: (name: string, record: TransactionWithDetails) => (
        <div>
          <div className="font-medium">{name}</div>
          <Text type="secondary" className="text-xs">
            {record.buyer.wallet_address}
          </Text>
        </div>
      ),
    },
    {
      title: "Seller",
      dataIndex: ["seller", "full_name"],
      key: "seller",
      render: (name: string, record: TransactionWithDetails) => (
        <div>
          <div className="font-medium">{name}</div>
          <Text type="secondary" className="text-xs">
            {record.seller.wallet_address}
          </Text>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount_kes",
      key: "amount_kes",
      render: (amount: number) => (
        <Text strong className="text-green-600">
          KES {amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "COMPLETED" ? "green" : status === "FAILED" ? "red" : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: TransactionWithDetails) => (
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
              Error loading transactions: {error}
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
              Transaction History
            </Title>
            <Text type="secondary">
              Monitor all land purchase transactions in the system
            </Text>
          </div>

          <Card>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <Search
                placeholder="Search by parcel ID, buyer, seller, or transaction hash"
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
                  { label: "Completed", value: "COMPLETED" },
                  { label: "Failed", value: "FAILED" },
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Text type="secondary">Total Transactions</Text>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredTransactions.length}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Text type="secondary">Completed</Text>
                <div className="text-2xl font-bold text-green-600">
                  {filteredTransactions.filter(t => t.status === "COMPLETED").length}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <Text type="secondary">Failed</Text>
                <div className="text-2xl font-bold text-red-600">
                  {filteredTransactions.filter(t => t.status === "FAILED").length}
                </div>
              </div>
            </div>

            {/* Table */}
            <GTable
              columns={columns}
              dataSource={filteredTransactions}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} transactions`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>

          {/* Transaction Detail Modal */}
          <Modal
            title="Transaction Details"
            open={detailModalOpen}
            onCancel={() => setDetailModalOpen(false)}
            footer={[
              <Button key="close" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>,
            ]}
            width={600}
          >
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Transaction ID</Text>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedTransaction.id}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Status</Text>
                    <div>
                      <Tag
                        color={selectedTransaction.status === "COMPLETED" ? "green" : "red"}
                        className="mt-1"
                      >
                        {selectedTransaction.status}
                      </Tag>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Parcel ID</Text>
                    <div className="font-medium">{selectedTransaction.parcel_id}</div>
                  </div>
                  <div>
                    <Text type="secondary">Amount</Text>
                    <div className="font-medium text-green-600">
                      KES {selectedTransaction.amount_kes.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Buyer</Text>
                    <div className="font-medium">{selectedTransaction.buyer.full_name}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {selectedTransaction.buyer.wallet_address}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Seller</Text>
                    <div className="font-medium">{selectedTransaction.seller.full_name}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {selectedTransaction.seller.wallet_address}
                    </div>
                  </div>
                </div>

                {selectedTransaction.transaction_hash && (
                  <div>
                    <Text type="secondary">Blockchain Transaction Hash</Text>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                      {selectedTransaction.transaction_hash}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Created</Text>
                    <div>{new Date(selectedTransaction.created_at).toLocaleString()}</div>
                  </div>
                  <div>
                    <Text type="secondary">Updated</Text>
                    <div>{new Date(selectedTransaction.updated_at).toLocaleString()}</div>
                  </div>
                </div>

                {/* Parcel Details */}
                <div className="border-t pt-4">
                  <Text type="secondary" className="text-lg font-medium">Parcel Information</Text>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>Area:</span>
                      <span>{selectedTransaction.listing.parcel.area_m2.toLocaleString()} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>
                        {selectedTransaction.listing.parcel.admin_region.city}, {selectedTransaction.listing.parcel.admin_region.state}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span>{selectedTransaction.listing.parcel.status}</span>
                    </div>
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

export default GovernmentTransactionHistoryPage;
