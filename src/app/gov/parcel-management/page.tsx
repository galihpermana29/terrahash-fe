"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GButton, GDropdownButton, GTable } from "@gal-ui/components";
import { Tag, Popconfirm, Space } from "antd";
import { useParcels } from "@/hooks/gov/useParcels";
import type { Parcel } from "@/lib/types/parcel";
import AuthGuard from "@/components/auth/AuthGuard";

const ParcelManagementPage = () => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"UNCLAIMED" | "OWNED" | undefined>();
  const { parcels, isLoading, toggleStatus, deleteParcel, isTogglingStatus, isDeleting } = useParcels({
    status: statusFilter,
  });

  const TableHeader = () => {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Parcel Management</h1>
        <GButton
          btn_type="primary"
          onClick={() => router.push("/gov/parcel-management/manage")}
        >
          Add Parcel
        </GButton>
      </div>
    );
  };

  const handleToggleStatus = async (parcel: Parcel) => {
    const newStatus = parcel.status === "UNCLAIMED" ? "OWNED" : "UNCLAIMED";

    // If changing to OWNED, would need owner selection - for now just show message
    if (newStatus === "OWNED") {
      // TODO: Open modal to select owner
      alert("Please use Edit to assign an owner");
      return;
    }

    await toggleStatus({
      parcelId: parcel.parcel_id,
      status: newStatus,
    });
  };

  const handleDelete = async (parcelId: string) => {
    await deleteParcel(parcelId);
  };

  const columns = [
    {
      title: "Parcel ID",
      dataIndex: "parcel_id",
      key: "parcel_id",
      width: 200,
    },
    {
      title: "Location",
      key: "location",
      width: 250,
      render: (_: any, record: Parcel) => {
        const region = record.admin_region;
        return `${region.city}, ${region.state}, ${region.country}`;
      },
    },
    {
      title: "Area",
      dataIndex: "area_m2",
      key: "area_m2",
      width: 150,
      render: (area: number) => {
        const acres = (area * 0.000247105).toFixed(2);
        return `${area.toLocaleString()} m² (${acres} acres)`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={status === "OWNED" ? "green" : "orange"}>
          {status}
        </Tag>
      ),
      filters: [
        { text: "Unclaimed", value: "UNCLAIMED" },
        { text: "Owned", value: "OWNED" },
      ],
      onFilter: (value: any, record: Parcel) => record.status === value,
    },
    {
      title: "Owner",
      key: "owner",
      width: 200,
      render: (_: any, record: Parcel) => {
        if (!record.owner) return <span className="text-gray-400">-</span>;
        return (
          <div>
            <div className="font-medium">{record.owner.full_name}</div>
            <div className="text-xs text-gray-500">
              {record.owner.wallet_address.slice(0, 6)}...
              {record.owner.wallet_address.slice(-4)}
            </div>
          </div>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: Parcel) => {
        return (
          <GDropdownButton
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Edit",
                  onClick: () => {
                    router.push(`/gov/parcel-management/manage?parcel_id=${record.parcel_id}`)
                  }
                }, {
                  key: "delete",
                  label: "Delete",
                  onClick: () => {
                    handleDelete(record.parcel_id)
                  }
                }
              ]
            }}
          />
        )
      }
    },
  ];

  return (
    <AuthGuard requiredUserType="GOV" redirectTo="/">
      <div className="p-6">
        <GTable
          customHeader={<TableHeader />}
          columns={columns}
          dataSource={parcels}
          loading={isLoading}
          rowKey="parcel_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} parcels`,
          }}
        />
      </div>
    </AuthGuard>
  );
};

export default ParcelManagementPage;