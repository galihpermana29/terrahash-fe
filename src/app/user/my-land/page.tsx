"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GButton, GDropdownButton, GSelect, GTable } from "@gal-ui/components";
import { Tag } from "antd";
import { useParcels } from "@/hooks/gov/useParcels";
import { useListingMutations } from "@/hooks/useListings";
import type { Parcel } from "@/lib/types/parcel";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import ListingFormModal from "@/components/listing/ListingFormModal";
import Title from "antd/es/typography/Title";

const MyLandPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [listingMode, setListingMode] = useState<"create" | "edit">("create");
  const [listingType, setListingType] = useState<"SALE" | "LEASE">("SALE");

  const { parcels, isLoading, deleteParcel } = useParcels({
    userId: user?.id,
  });

  const { deleteListing } = useListingMutations();

  const handleOpenListingModal = (parcel: Parcel, type: "SALE" | "LEASE") => {
    setSelectedParcel(parcel);
    setListingType(type);

    // Check if parcel already has a listing
    if (parcel.listing && parcel.listing.active) {
      setListingMode("edit");
    } else {
      setListingMode("create");
    }

    setListingModalOpen(true);
  };

  const handleCloseListingModal = () => {
    setListingModalOpen(false);
    setSelectedParcel(null);
  };

  const handleRemoveListing = async (parcel: Parcel) => {
    if (parcel.listing) {
      await deleteListing(parcel.listing.id);
    }
  };

  const TableHeader = () => {
    return (
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">  My Land </Title>      </div>
    );
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
              {record.owner.wallet_address}
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
      title: "Listing",
      key: "listing",
      width: 150,
      render: (_: any, record: Parcel) => {
        if (record.listing && record.listing.active) {
          return (
            <div>
              <Tag color={record.listing.type === "SALE" ? "green" : "blue"}>
                {record.listing.type}
              </Tag>
              <div className="text-xs text-gray-600 mt-1">
                KES {record.listing.price_kes.toLocaleString()}
                {record.listing.type === "LEASE" && "/mo"}
              </div>
            </div>
          );
        }
        return <span className="text-gray-400">Not listed</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: Parcel) => {
        const hasActiveListing = record.listing && record.listing.active;

        const menuItems = hasActiveListing
          ? [
            {
              key: "edit-listing",
              label: "Edit Listing",
              onClick: () => {
                handleOpenListingModal(record, record.listing!.type);
              },
            },
            {
              key: "remove-listing",
              label: "Remove Listing",
              danger: true,
              onClick: () => {
                handleRemoveListing(record);
              },
            },
          ]
          : [
            {
              key: "sale",
              label: "List for Sale",
              onClick: () => {
                handleOpenListingModal(record, "SALE");
              },
            },
            {
              key: "lease",
              label: "List for Lease",
              onClick: () => {
                handleOpenListingModal(record, "LEASE");
              },
            },
          ];

        return <GDropdownButton menu={{ items: menuItems }} />;
      },
    },
  ];

  return (
    <AuthGuard requiredUserType="PUBLIC" redirectTo="/">
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

        {/* Listing Form Modal */}
        {selectedParcel && (
          <ListingFormModal
            open={listingModalOpen}
            onClose={handleCloseListingModal}
            parcel={selectedParcel}
            existingListing={selectedParcel.listing}
            mode={listingMode}
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default MyLandPage;