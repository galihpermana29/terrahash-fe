import type { ApiResponse } from "@/lib/types/response";
import type {
  Objection,
  ObjectionWithDetails,
  CreateObjectionPayload,
  UpdateObjectionStatusPayload,
} from "@/lib/types/objection";

/**
 * Submit a new objection for a parcel
 */
export async function createObjection(
  payload: CreateObjectionPayload
): Promise<ApiResponse<{ objection: Objection }>> {
  const response = await fetch("/api/objections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Get objections for a specific parcel
 */
export async function getParcelObjections(
  parcelId: string
): Promise<ApiResponse<{ objections: ObjectionWithDetails[] }>> {
  const response = await fetch(`/api/objections/parcel/${parcelId}`, {
    method: "GET",
  });

  return response.json();
}

/**
 * Get user's objections
 */
export async function getUserObjections(): Promise<
  ApiResponse<{ objections: ObjectionWithDetails[] }>
> {
  const response = await fetch("/api/objections/user", {
    method: "GET",
  });

  return response.json();
}

/**
 * Get all objections (Government only)
 */
export async function getGovernmentObjections(): Promise<
  ApiResponse<{ objections: ObjectionWithDetails[]; count: number }>
> {
  const response = await fetch("/api/objections/gov", {
    method: "GET",
  });

  return response.json();
}

/**
 * Update objection status (Government only)
 */
export async function updateObjectionStatus(
  objectionId: string,
  payload: UpdateObjectionStatusPayload
): Promise<ApiResponse<{ objection: Objection }>> {
  const response = await fetch(`/api/objections/${objectionId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}
