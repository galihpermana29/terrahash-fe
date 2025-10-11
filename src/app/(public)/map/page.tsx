"use client";

import { useMemo, useState } from "react";
import { Card, Typography, Button, Select } from "antd";
import { GInput } from "@gal-ui/components";
import dynamic from "next/dynamic";
import MapLegend from "@/components/map/MapLegend";
import type { ParcelFC } from "@/lib/types/parcel";
import raw from "@/data/parcels.mock.json";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { USERS } from "@/data/users.mock";
import { LISTINGS } from "@/data/listings.mock";

const data = raw as ParcelFC;
// Dynamic import to disable SSR for Leaflet-based component
const ParcelMap = dynamic(() => import("@/components/map/ParcelMap"), {
  ssr: false,
});
const ALL = ["UNCLAIMED", "OWNED"] as const;

// Using mock data from /data folder

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = (searchParams?.get("q") || "").trim();
  const initialStatus = (searchParams?.get("status") || "ALL").toUpperCase();

  const [query, setQuery] = useState(initialQ);
  const [statusSelect, setStatusSelect] = useState<string>(
    ["ALL", ...ALL].includes(initialStatus as any) ? initialStatus : "ALL"
  );
  const [statuses, setStatuses] = useState<string[]>(
    initialStatus === "ALL" ? [...ALL] : [initialStatus]
  );

  const statusOptions = [
    { value: "ALL", label: "All" },
    { value: "UNCLAIMED", label: "Unclaimed" },
    { value: "OWNED", label: "Owned" },
  ];

  const selected = useMemo(() => new Set(statuses), [statuses]);

  const filtered = useMemo(() => {
    return (data.features || []).filter((f: any) => {
      const statusOk = selected.has(f?.properties?.status);
      const q = query?.trim().toLowerCase();
      const queryOk = !q || f?.properties?.parcel_id?.toLowerCase().includes(q);
      return statusOk && queryOk;
    });
  }, [data, selected, query]);

  const toAcres = (m2: number) => (m2 ? (m2 / 4046.8564224).toFixed(1) : "-");

  const updateUrl = (nextQ: string, nextStatus: string) => {
    const params = new URLSearchParams();
    if (nextQ?.trim()) params.set("q", nextQ.trim());
    params.set("status", nextStatus);
    const qs = params.toString();
    router.replace(`/map${qs ? `?${qs}` : ""}`);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    updateUrl(val, statusSelect);
  };

  const handleStatusChange = (value: string) => {
    setStatusSelect(value);
    setStatuses(value === "ALL" ? [...ALL] : [value]);
    updateUrl(query, value);
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <Typography.Title level={3} className="!mb-0">Find Land</Typography.Title>
          <Link href="/">
            <Button type="link">Home</Button>
          </Link>
        </div>

        <Card className="mb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <GInput
              placeholder="Search by Parcel ID (e.g., TH-0001)"
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
          </div>
        </Card>

        <div className="relative">
          <ParcelMap data={data} filterStatuses={statuses as any} query={query} />
          <MapLegend />
        </div>

        {/* Results List (Landing-style cards) */}
        <section className="mt-6 pb-10">
          <div className="flex items-end justify-between mb-3">
            <Typography.Title level={4} className="!mb-0">Results ({filtered.length})</Typography.Title>
            <Typography.Text type="secondary">Showing filtered parcels below the map</Typography.Text>
          </div>
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
            {filtered.map((f: any, idx: number) => {
              const id = f.properties.parcel_id;
              const status = f.properties.status;
              const area = toAcres(f.properties.area_m2);
              const updated = new Date(f.properties.updated_at).toLocaleDateString();
              const owner = f.properties.owner_id ? USERS[f.properties.owner_id] : undefined;
              const listing = LISTINGS[id];
              const image = [
                'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192851/murad-swaleh-7tDidSXbgD8-unsplash_hn17iq.jpg',
                'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192855/sam-szuchan-_wqjX4MauzA-unsplash_u4almv.jpg',
                'https://res.cloudinary.com/dqipjpy1w/image/upload/v1760192859/fabricio-sakai-oyQD2wngBDM-unsplash_uamshk.jpg',
              ][idx % 3];
              const priceKes = (listing?.price_kes ?? (25000 + (idx % 3) * 5000));
              return (
                <div key={id} className="rounded-xl border border-gray-200 bg-cream shadow-sm overflow-hidden">
                  <div className="relative h-40">
                    <Image src={image} alt={id} fill className="object-cover" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-gold text-text-dark shadow">
                        {status}
                      </span>
                      {listing?.active && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-700 shadow border border-gray-200">
                          {listing.type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-brand-primary">{id}</h3>
                      <span className="text-brand-gold font-medium">KES {priceKes.toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">Kenya • {area} acres</p>
                    <p className="text-xs text-gray-600">
                      Owner: {owner ? (owner.type === 'GOV' ? 'GOV' : owner.full_name || 'Public') : 'Unclaimed'}
                    </p>
                    <p className="text-xs text-gray-500">Updated: {updated}</p>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/map?q=${id}`} className="inline-flex">
                        <button className="h-10 px-4 rounded-full bg-brand-primary text-white hover:bg-brand-primary-dark">View on Map</button>
                      </Link>
                      <Link href={`/map?q=${id}`} className="inline-flex">
                        <button className="h-10 px-4 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">Details</button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
