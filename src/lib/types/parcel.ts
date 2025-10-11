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
