import { useQuery } from "@tanstack/react-query";
import { getLatestUnclaimedParcels } from "@/client-action/parcel";

/**
 * Hook for fetching latest unclaimed parcels for homepage
 */
export function useLatestUnclaimedParcels(limit: number = 6) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["parcels", "latest-unclaimed", limit],
    queryFn: () => getLatestUnclaimedParcels(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    parcels: data?.success ? data.data.parcels : [],
    isLoading,
    error: error?.message || (data?.success === false ? data.error?.message : null),
    refetch,
  };
}
