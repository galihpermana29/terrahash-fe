import type { Parcel, ParcelFormPayload } from "@/lib/types/parcel";
import type { ApiResponse } from "@/lib/types/response";

/**
 * Get all parcels
 */
export async function getParcels(params?: {
  status?: "UNCLAIMED" | "OWNED";
  search?: string;
  userId?: string;
}): Promise<ApiResponse<{ parcels: Parcel[] }>> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.userId) queryParams.append("user_id", params.userId);

  const url = `/api/parcels${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return response.json();
}

/**
 * Get parcel by ID
 */
export async function getParcelById(
  parcelId: string
): Promise<ApiResponse<{ parcel: Parcel }>> {
  const response = await fetch(`/api/parcels/${parcelId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return response.json();
}

/**
 * Create new parcel
 */
export async function createParcel(
  data: ParcelFormPayload
): Promise<ApiResponse<{ parcel: Parcel }>> {
  const response = await fetch("/api/parcels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * Update parcel
 */
export async function updateParcel(
  parcelId: string,
  data: Partial<ParcelFormPayload>
): Promise<ApiResponse<{ parcel: Parcel }>> {
  const response = await fetch(`/api/parcels/${parcelId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * Toggle parcel status
 */
export async function toggleParcelStatus(
  parcelId: string,
  status: "UNCLAIMED" | "OWNED",
  ownerId?: string
): Promise<ApiResponse<{ parcel: Parcel }>> {
  const response = await fetch(`/api/parcels/${parcelId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, owner_id: ownerId }),
  });

  return response.json();
}

/**
 * Delete parcel
 */
export async function deleteParcel(
  parcelId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`/api/parcels/${parcelId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  return response.json();
}
