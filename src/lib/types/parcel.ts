export type ParcelStatus = "UNCLAIMED" | "OWNED";

export interface ParcelProps {
  parcel_id: string;
  status: ParcelStatus;
  area_m2?: number;
  updated_at: string;
  owner_id?: string | null;
}

export type ParcelGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;
export type ParcelFeature = GeoJSON.Feature<ParcelGeometry, ParcelProps>;
export type ParcelFC = GeoJSON.FeatureCollection<ParcelGeometry, ParcelProps>;

// Admin region structure
export interface AdminRegion {
  country: string;
  state: string;
  city: string;
}

// Listing data (from listings table)
export interface Listing {
  type: "SALE" | "LEASE";
  price_kes: number;
  active: boolean;
  description?: string;
}

// Full parcel data
export interface Parcel {
  parcel_id: string;
  owner_id?: string | null;
  status: ParcelStatus;
  geometry_geojson: string; // GeoJSON string
  area_m2: number;
  admin_region: AdminRegion;
  notes?: string;
  asset_url?: string[] | null; // Array of image URLs
  created_at?: string;
  updated_at?: string;
  owner?: {
    id: string;
    full_name: string;
    wallet_address: string;
  } | null;
  listing?: Listing | null; // LEFT JOIN from listings table
}

// Form payload for create/update
export interface ParcelFormPayload {
  parcel_id: string;
  geometry_geojson: GeoJSON.Feature<GeoJSON.Polygon>;
  area_m2: number;
  admin_region: AdminRegion;
  status: ParcelStatus;
  owner_id?: string;
  notes?: string;
  asset_url?: string[];
}

// Owner validation response
export interface OwnerValidation {
  valid: boolean;
  user?: {
    id: string;
    full_name: string;
    wallet_address: string;
  };
}
