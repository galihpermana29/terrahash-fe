import type { Listing } from "@/lib/types/parcel";
import type { ApiResponse } from "@/lib/types/response";

export interface ListingWithParcel extends Listing {
  parcel: {
    parcel_id: string;
    area_m2: number;
    admin_region: {
      country: string;
      state: string;
      city: string;
    };
    status: string;
    owner?: {
      id: string;
      full_name: string;
      wallet_address: string;
    };
  };
}

/**
 * Get all listings for the authenticated user
 */
export async function getListings(): Promise<
  ApiResponse<{ listings: ListingWithParcel[]; count: number }>
> {
  const response = await fetch("/api/listings", {
    method: "GET",
  });

  return response.json();
}

/**
 * Get all listings for government users
 */
export async function getGovernmentListings(): Promise<
  ApiResponse<{ listings: ListingWithParcel[]; count: number }>
> {
  const response = await fetch("/api/listings/gov", {
    method: "GET",
  });

  return response.json();
}

export interface CreateListingPayload {
  parcel_id: string;
  type: "SALE" | "LEASE";
  price_kes: number;
  lease_period?: "1_MONTH" | "6_MONTHS" | "12_MONTHS";
  description?: string;
  terms?: string;
  contact_phone?: string;
}

export interface UpdateListingPayload {
  price_kes?: number;
  lease_period?: "1_MONTH" | "6_MONTHS" | "12_MONTHS";
  description?: string;
  terms?: string;
  contact_phone?: string;
  active?: boolean;
}

/**
 * Create a new listing
 */
export async function createListing(
  payload: CreateListingPayload
): Promise<ApiResponse<{ listing: Listing }>> {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Update an existing listing
 */
export async function updateListing(
  listingId: string,
  payload: UpdateListingPayload
): Promise<ApiResponse<{ listing: Listing }>> {
  const response = await fetch(`/api/listings/${listingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Delete (deactivate) a listing
 */
export async function deleteListing(
  listingId: string
): Promise<ApiResponse<null>> {
  const response = await fetch(`/api/listings/${listingId}`, {
    method: "DELETE",
  });

  return response.json();
}
