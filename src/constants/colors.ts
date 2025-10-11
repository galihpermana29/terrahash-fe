export const PARCEL_COLORS = {
  UNCLAIMED: "#94a3b8",
  OWNED: "#22c55e",
} as const;

export type ParcelStatus = keyof typeof PARCEL_COLORS;
