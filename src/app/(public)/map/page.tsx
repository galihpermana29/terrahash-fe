"use client";

import { useState } from "react";
import { Card, Typography, Button, Select, Spin } from "antd";
import { GInput } from "@gal-ui/components";
import dynamic from "next/dynamic";
import MapLegend from "@/components/map/MapLegend";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePublicParcels } from "@/hooks/usePublicParcels";
import ParcelCard from "@/components/parcel/ParcelCard";

// Dynamic import to disable SSR for Leaflet-based component
const ParcelMap = dynamic(() => import("@/components/map/ParcelMap"), {
  ssr: false,
});

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = (searchParams?.get("q") || "").trim();
  const initialStatus = (searchParams?.get("status") || "ALL").toUpperCase() as "ALL" | "UNCLAIMED" | "OWNED";
  const initialListingType = (searchParams?.get("listing_type") || "ALL").toUpperCase() as "ALL" | "SALE" | "LEASE";

  const [query, setQuery] = useState(initialQ);
  const [statusSelect, setStatusSelect] = useState<"ALL" | "UNCLAIMED" | "OWNED">(initialStatus);
  const [listingTypeSelect, setListingTypeSelect] = useState<"ALL" | "SALE" | "LEASE">(initialListingType);

  // Fetch parcels with filters
  const { data: parcels = [], isLoading, error } = usePublicParcels({
    q: query,
    status: statusSelect,
    listing_type: listingTypeSelect,
  });

  const statusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "UNCLAIMED", label: "Unclaimed" },
    { value: "OWNED", label: "Owned" },
  ];

  const listingTypeOptions = [
    { value: "ALL", label: "All Listings" },
    { value: "SALE", label: "For Sale" },
    { value: "LEASE", label: "For Lease" },
  ];

  // Convert parcels to GeoJSON for map
  const mapData = {
    type: "FeatureCollection" as const,
    features: parcels.map((parcel) => {
      // Parse the geometry_geojson which is a full GeoJSON Feature
      const feature = JSON.parse(parcel.geometry_geojson);

      // Return the feature with updated properties
      return {
        type: "Feature" as const,
        geometry: feature.geometry || feature, // Handle both Feature and Geometry formats
        properties: {
          parcel_id: parcel.parcel_id,
          status: parcel.status,
          area_m2: parcel.area_m2,
          owner_id: parcel.owner_id,
          updated_at: parcel.updated_at,
        },
      };
    }),
  };

  const updateUrl = (nextQ: string, nextStatus: string, nextListingType: string) => {
    const params = new URLSearchParams();
    if (nextQ?.trim()) params.set("q", nextQ.trim());
    params.set("status", nextStatus);
    if (nextStatus === "OWNED" && nextListingType !== "ALL") {
      params.set("listing_type", nextListingType);
    }
    const qs = params.toString();
    router.replace(`/map${qs ? `?${qs}` : ""}`);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    updateUrl(val, statusSelect, listingTypeSelect);
  };

  const handleStatusChange = (value: "ALL" | "UNCLAIMED" | "OWNED") => {
    setStatusSelect(value);
    // Reset listing type when changing status
    if (value !== "OWNED") {
      setListingTypeSelect("ALL");
    }
    updateUrl(query, value, "ALL");
  };

  const handleListingTypeChange = (value: "ALL" | "SALE" | "LEASE") => {
    setListingTypeSelect(value);
    updateUrl(query, statusSelect, value);
  };

  return (
    <div className="">

      <div className="relative">
        <ParcelMap
          data={mapData}
          filterStatuses={statusSelect === "ALL" ? ["UNCLAIMED", "OWNED"] : [statusSelect]}
          query={query}
        />
        <MapLegend />
      </div>
      <div className="max-w-7xl mx-auto p-4">


        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 py-8">
            Error loading parcels. Please try again.
          </div>
        )}

        {/* Map */}
        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap mt-[25px]">
              <Typography.Title level={3} className="!mb-0">Find Land</Typography.Title>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <GInput
                placeholder="Search by Parcel ID, Country, State, or City"
                value={query}
                onChange={(e: any) => handleQueryChange(e?.target?.value || "")}
              />
              <Select
                size="large"
                className="w-full sm:w-56"
                value={statusSelect}
                onChange={handleStatusChange}
                options={statusOptions}
              />
              <Select
                size="large"
                className="w-full sm:w-56"
                value={listingTypeSelect}
                onChange={handleListingTypeChange}
                options={listingTypeOptions}
                disabled={statusSelect !== "OWNED"}
              />
            </div>
            {/* Results List */}
            <section className="mt-6 pb-10">
              <div className="flex items-end justify-between mb-3">
                <Typography.Title level={4} className="!mb-0">
                  Results ({parcels.length})
                </Typography.Title>
              </div>

              {parcels.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No parcels found matching your criteria.
                </div>
              ) : (
                <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
                  {parcels.map((parcel) => (
                    <ParcelCard
                      key={parcel.parcel_id}
                      parcel={parcel}
                      onViewMap={() => {
                        setQuery(parcel.parcel_id);
                        updateUrl(parcel.parcel_id, statusSelect, listingTypeSelect);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
