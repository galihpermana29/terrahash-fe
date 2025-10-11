"use client";

import { PARCEL_COLORS } from "@/constants/colors";

export default function MapLegend() {
  const items = [
    { label: "Unclaimed", color: PARCEL_COLORS.UNCLAIMED },
    { label: "Owned", color: PARCEL_COLORS.OWNED },
  ];
  return (
    <div className="absolute left-3 bottom-3 bg-white/90 rounded-md shadow p-3 text-sm space-y-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: it.color }}
          />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
