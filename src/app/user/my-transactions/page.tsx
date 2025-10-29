"use client";

import { useState } from "react";
import { Table, Tag, Typography, Button, Modal, Input, Card, Empty } from "antd";
import { EyeOutlined, SearchOutlined, ReloadOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useTransactions } from "@/hooks/useTransactions";
import type { TransactionWithDetails } from "@/lib/types/transaction";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { GTable } from "@gal-ui/components";

const { Title, Text } = Typography;
const { Search } = Input;

const UserTransactionHistoryPage = () => {
  const { user } = useAuth();
  const { transactions, isLoading, error, refetch } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleViewDetails = (transaction: TransactionWithDetails) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  // Filter transactions based on search
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.parcel_id?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.transaction_hash?.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  // Separate transactions by type
  const purchaseTransactions = filteredTransactions.filter(t => t.buyer_id === user?.id);
  const saleTransactions = filteredTransactions.filter(t => t.seller_id === user?.id);

  const purchaseColumns = [
    {
      title: "Parcel ID",
      dataIndex: "parcel_id",
      key: "parcel_id",
      render: (parcel_id: string) => (
        <Text strong>{parcel_id}</Text>
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
      title: "Amount Paid",
      dataIndex: "amount_kes",
      key: "amount_kes",
      render: (amount: number) => (
        <Text strong className="text-red-600">
          -HBAR {amount.toLocaleString()}
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

  const saleColumns = [
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
      title: "Amount Received",
      dataIndex: "amount_kes",
      key: "amount_kes",
      render: (amount: number) => (
        <Text strong className="text-green-600">
          +HBAR {amount.toLocaleString()}
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
    <AuthGuard requiredUserType="PUBLIC">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Title level={2} className="!mb-2">
              My Transactions
            </Title>
            <Text type="secondary">
              View your land purchase and sale history
            </Text>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Search
              placeholder="Search by parcel ID or transaction hash"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
              prefix={<SearchOutlined />}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={refetch}
              loading={isLoading}
              className="ml-4"
            >
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Text type="secondary">Total Transactions</Text>
              <div className="text-2xl font-bold text-blue-600">
                {filteredTransactions.length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <Text type="secondary">Purchases</Text>
              <div className="text-2xl font-bold text-red-600">
                {purchaseTransactions.length}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Text type="secondary">Sales</Text>
              <div className="text-2xl font-bold text-green-600">
                {saleTransactions.length}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <Text type="secondary">Total Spent</Text>
              <div className="text-2xl font-bold text-purple-600">
                HBAR {purchaseTransactions
                  .filter(t => t.status === "COMPLETED")
                  .reduce((sum, t) => sum + t.amount_kes, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>


          <div className="mt-[24px]">
            <GTable
              customHeader={
                <Title level={4} className="!mb-0">
                  My Purchases
                </Title>
              }
              columns={purchaseColumns}
              dataSource={purchaseTransactions}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
              size="small"
            />
          </div>

          <div className="mt-[24px]">
            <GTable
              customHeader={
                <Title level={4} className="!mb-0">
                  My Sales
                </Title>
              }
              columns={saleColumns}
              dataSource={saleTransactions}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
              size="small"
            />
          </div>

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
                      HBAR {selectedTransaction.amount_kes.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">
                      {selectedTransaction.buyer_id === user?.id ? "Seller" : "Buyer"}
                    </Text>
                    <div className="font-medium">
                      {selectedTransaction.buyer_id === user?.id
                        ? selectedTransaction.seller.full_name
                        : selectedTransaction.buyer.full_name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {selectedTransaction.buyer_id === user?.id
                        ? selectedTransaction.seller.wallet_address
                        : selectedTransaction.buyer.wallet_address}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Transaction Type</Text>
                    <div className="font-medium">
                        {
                          selectedTransaction.type === "PURCHASE"
                            ? (selectedTransaction.buyer_id === user?.id ? "Purchase" : "Sale")
                            : (selectedTransaction.buyer_id === user?.id ? "Lease" : "Lessee")
                        }
                    </div>
                  </div>
                  
                </div>


                {selectedTransaction.transaction_hash && (
                  <div>
                  <Text type="secondary">Blockchain Transaction Hash</Text>
                  <div className="flex items-center gap-2 font-mono text-sm bg-gray-100 p-2 rounded break-all">
                    <span>{selectedTransaction.transaction_hash}</span>
                    <Button
                    type="link"
                    href={`https://hashscan.io/testnet/transaction/${selectedTransaction.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={
                      <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.5 2H14v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 9.5L14 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    aria-label="Open Hashscan"
                    />
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

export default UserTransactionHistoryPage;
