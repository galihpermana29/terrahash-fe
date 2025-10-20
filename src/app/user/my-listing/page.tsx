"use client";

import { useState } from "react";
import { GDropdownButton, GTable } from "@gal-ui/components";
import { Tag, Popconfirm } from "antd";
import { useListings, useListingMutations } from "@/hooks/useListings";
import type { ListingWithParcel } from "@/client-action/listing";
import AuthGuard from "@/components/auth/AuthGuard";
import ListingFormModal from "@/components/listing/ListingFormModal";

const MyListingPage = () => {
  const { listings, isLoading } = useListings();
  const { deleteListing, updateListing, isDeleting, isUpdating } = useListingMutations();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingWithParcel | null>(null);

  const handleEdit = (listing: ListingWithParcel) => {
    setSelectedListing(listing);
    setEditModalOpen(true);
  };

  const handleDelete = async (listingId: string) => {
    await deleteListing(listingId);
  };

  const handleToggleActive = async (listing: ListingWithParcel) => {
    await updateListing(listing.id, { active: !listing.active });
  };

  const TableHeader = () => {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
      </div>
    );
  };

  const columns = [
    {
      title: "Parcel ID",
      dataIndex: ["parcel", "parcel_id"],
      key: "parcel_id",
      width: 200,
    },
    {
      title: "Location",
      key: "location",
      width: 250,
      render: (_: any, record: ListingWithParcel) => {
        const region = record.parcel.admin_region;
        return `${region.city}, ${region.state}, ${region.country}`;
      },
    },
    {
      title: "Area",
      dataIndex: ["parcel", "area_m2"],
      key: "area",
      width: 150,
      render: (area: number) => {
        const acres = (area * 0.000247105).toFixed(2);
        return `${area.toLocaleString()} m² (${acres} acres)`;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "SALE" ? "green" : "blue"}>{type}</Tag>
      ),
    },
    {
      title: "Price",
      key: "price",
      width: 150,
      render: (_: any, record: ListingWithParcel) => {
        return (
          <div>
            <div className="font-medium">
              KES {record.price_kes.toLocaleString()}
            </div>
            {record.type === "LEASE" && (
              <div className="text-xs text-gray-500">
                per month • {record.lease_period?.replace("_", " ")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Contact",
      dataIndex: "contact_phone",
      key: "contact_phone",
      width: 150,
      render: (phone: string) => phone || <span className="text-gray-400">-</span>,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
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
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: ListingWithParcel) => {
        const menuItems = [
          {
            key: "edit",
            label: "Edit",
            onClick: () => handleEdit(record),
          },
          {
            key: "toggle",
            label: record.active ? "Deactivate" : "Activate",
            onClick: () => handleToggleActive(record),
          },
          {
            key: "delete",
            label: "Delete",
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];

        return <GDropdownButton menu={{ items: menuItems }} />;
      },
    },
  ];

  // Convert listing to parcel format for modal
  const getParcelFromListing = (listing: ListingWithParcel) => {
    return {
      parcel_id: listing.parcel.parcel_id,
      area_m2: listing.parcel.area_m2,
      admin_region: listing.parcel.admin_region,
      status: listing.parcel.status as "OWNED" | "UNCLAIMED",
      geometry_geojson: "",
      listing: listing,
    };
  };

  return (
    <AuthGuard requiredUserType="PUBLIC" redirectTo="/">
      <div className="p-6">
        <GTable
          customHeader={<TableHeader />}
          columns={columns}
          dataSource={listings}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} listings`,
          }}
        />

        {/* Edit Listing Modal */}
        {selectedListing && (
          <ListingFormModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedListing(null);
            }}
            parcel={getParcelFromListing(selectedListing) as any}
            existingListing={selectedListing}
            mode="edit"
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default MyListingPage;
