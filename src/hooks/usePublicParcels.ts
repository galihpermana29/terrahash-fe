import { useQuery } from "@tanstack/react-query";
import { Parcel } from "@/lib/types/parcel";

interface PublicParcelsFilters {
  q?: string; // Search query
  status?: "ALL" | "UNCLAIMED" | "OWNED";
  listing_type?: "ALL" | "SALE" | "LEASE";
}

interface PublicParcelsResponse {
  success: boolean;
  data: Parcel[];
  count: number;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetch public parcels list with optional filters
 */
export function usePublicParcels(filters: PublicParcelsFilters = {}) {
  const { q = "", status = "ALL", listing_type = "ALL" } = filters;

  return useQuery({
    queryKey: ["public-parcels", q, status, listing_type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (listing_type) params.set("listing_type", listing_type);

      const response = await fetch(`/api/public-lists?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch parcels");
      }

      const result: PublicParcelsResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch parcels");
      }

      return result.data;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
