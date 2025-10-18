import { useState } from "react";
import type { ParcelFormPayload, AdminRegion } from "@/lib/types/parcel";

export function useParcelForm() {
  const [geometry, setGeometry] = useState<GeoJSON.Feature<GeoJSON.Polygon> | null>(null);
  const [area, setArea] = useState<number>(0);
  const [ownerWallet, setOwnerWallet] = useState<string>("");
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);

  const reverseGeocode = async (lat: number, lng: number): Promise<AdminRegion | null> => {
    try {
      setIsReverseGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        return {
          country: data.address.country || "",
          state: data.address.state || data.address.region || "",
          city: data.address.city || data.address.town || data.address.village || "",
        };
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleGeometryChange = async (
    newGeometry: GeoJSON.Feature<GeoJSON.Polygon> | null,
    newArea: number,
    onLocationDetected?: (location: AdminRegion) => void
  ) => {
    setGeometry(newGeometry);
    setArea(newArea);

    // Auto-detect location from polygon center
    if (newGeometry && newGeometry.geometry.coordinates[0].length > 0) {
      // Calculate centroid
      const coords = newGeometry.geometry.coordinates[0];
      const lngSum = coords.reduce((sum, coord) => sum + coord[0], 0);
      const latSum = coords.reduce((sum, coord) => sum + coord[1], 0);
      const centerLng = lngSum / coords.length;
      const centerLat = latSum / coords.length;

      // Reverse geocode
      const location = await reverseGeocode(centerLat, centerLng);
      if (location && onLocationDetected) {
        onLocationDetected(location);
      }
    }
  };

  const handleOwnerChange = (wallet: string, userId?: string) => {
    setOwnerWallet(wallet);
    setOwnerId(userId);
  };

  const validateForm = (values: any): boolean => {
    // Validate geometry
    if (!geometry) {
      console.error("Validation failed: No geometry drawn");
      return false;
    }

    // Validate area
    if (area < 10 || area > 100000) {
      console.error("Validation failed: Invalid area");
      return false;
    }

    // Validate admin region
    if (!values.country || !values.state || !values.city) {
      console.error("Validation failed: Missing location fields");
      return false;
    }

    // Validate owner if status is OWNED
    if (values.status === "OWNED" && !ownerId) {
      console.error("Validation failed: Owner required for OWNED status");
      return false;
    }

    return true;
  };

  const buildPayload = (values: any): ParcelFormPayload => {
    const adminRegion: AdminRegion = {
      country: values.country,
      state: values.state,
      city: values.city,
    };

    const payload: ParcelFormPayload = {
      parcel_id: values.parcel_id || `PARCEL-${Date.now()}`, // Auto-generate if not provided
      geometry_geojson: geometry!,
      area_m2: area,
      admin_region: adminRegion,
      status: values.status,
      notes: values.notes,
    };

    // Add owner_id only if status is OWNED and ownerId is valid
    if (values.status === "OWNED" && ownerId) {
      payload.owner_id = ownerId;
    }

    return payload;
  };

  const buildFormPayload = (values: any): ParcelFormPayload | null => {
    if (!validateForm(values)) {
      return null;
    }

    return buildPayload(values);
  };

  return {
    geometry,
    area,
    ownerWallet,
    ownerId,
    isReverseGeocoding,
    handleGeometryChange,
    handleOwnerChange,
    buildFormPayload,
  };
}
