"use client";

import { useState } from "react";
import { GDropdownButton, GTable } from "@gal-ui/components";
import { Tag } from "antd";
import { useGovernmentListings, useListingMutations } from "@/hooks/useListings";
import type { ListingWithParcel } from "@/client-action/listing";
import AuthGuard from "@/components/auth/AuthGuard";
import ListingFormModal from "@/components/listing/ListingFormModal";

const MarketplaceListingPage = () => {
  const { listings, isLoading } = useGovernmentListings();
  const { deleteListing, updateListing } = useListingMutations();

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
        <h1 className="text-2xl font-bold">Marketplace Listings</h1>
        <div className="text-sm text-gray-600">
          Total: {listings.length} listings
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: "Parcel ID",
      key: "parcel_id",
      width: 180,
      render: (_: any, record: ListingWithParcel) => {
        return record.parcel?.parcel_id || "-";
      },
    },
    {
      title: "Owner",
      key: "owner",
      width: 200,
      render: (_: any, record: ListingWithParcel) => {
        const owner = record.parcel?.owner;
        return (
          <div>
            <div className="font-medium">{owner?.full_name || "Unknown"}</div>
            <div className="text-xs text-gray-500 truncate">
              {owner?.wallet_address ?
                `${owner.wallet_address}`
                : "-"
              }
            </div>
          </div>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      width: 220,
      render: (_: any, record: ListingWithParcel) => {
        const region = record.parcel?.admin_region;
        return `${region?.city}, ${region?.state}, ${region?.country}`;
      },
    },
    {
      title: "Area",
      key: "area",
      width: 120,
      render: (_: any, record: ListingWithParcel) => {
        const area = record.parcel?.area_m2;
        if (!area) return "-";
        const acres = (area * 0.000247105).toFixed(2);
        return (
          <div>
            <div className="font-medium">{area.toLocaleString()} m²</div>
            <div className="text-xs text-gray-500">{acres} acres</div>
          </div>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type: string) => (
        <Tag color={type === "SALE" ? "green" : "blue"}>{type}</Tag>
      ),
    },
    {
      title: "Price",
      key: "price",
      width: 140,
      render: (_: any, record: ListingWithParcel) => {
        return (
          <div>
            <div className="font-medium">
              HBAR {record.price_kes?.toLocaleString() || "0"}
            </div>
            {record.type === "LEASE" && record.lease_period && (
              <div className="text-xs text-gray-500">
                per month • {record.lease_period.replace("_", " ")}
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
      width: 130,
      render: (phone: string) => phone || <span className="text-gray-400">-</span>,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 90,
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
      width: 110,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
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
    <AuthGuard requiredUserType="GOV" redirectTo="/">
      <div className="p-6">
        <GTable
          customHeader={<TableHeader />}
          columns={columns}
          dataSource={listings}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} listings`,
          }}
          scroll={{ x: 1400 }}
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

export default MarketplaceListingPage;