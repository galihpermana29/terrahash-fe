export type ListingType = "SALE" | "LEASE";

export interface Listing {
  id: string; // PK
  parcel_id: string; // FK -> Parcel.parcel_id
  type: ListingType;
  price_kes?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
