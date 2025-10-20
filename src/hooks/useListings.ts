import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import {
  getListings,
  createListing,
  updateListing,
  deleteListing,
  type CreateListingPayload,
  type UpdateListingPayload,
} from "@/client-action/listing";

export function useListings() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Query: Get all listings
  const {
    data: listingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const response = await getListings();
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to fetch listings");
      }
      return response.data;
    },
  });

  return {
    listings: listingsData?.listings || [],
    listingsCount: listingsData?.count || 0,
    isLoading,
    error,
  };
}

export function useListingMutations() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    queryClient.invalidateQueries({ queryKey: ["parcels"] });
    queryClient.invalidateQueries({ queryKey: ["public-parcels"] });
  };

  // Mutation: Create listing
  const createMutation = useMutation({
    mutationFn: (payload: CreateListingPayload) => createListing(payload),
    onSuccess: (data) => {
      if (data.success) {
        message.success("Listing created successfully!");
        invalidateQueries();
      } else {
        message.error(data.error?.message || "Failed to create listing");
      }
    },
    onError: (error) => {
      console.error("Error creating listing:", error);
      message.error("Failed to create listing");
    },
  });

  // Mutation: Update listing
  const updateMutation = useMutation({
    mutationFn: ({
      listingId,
      payload,
    }: {
      listingId: string;
      payload: UpdateListingPayload;
    }) => updateListing(listingId, payload),
    onSuccess: (data) => {
      if (data.success) {
        message.success("Listing updated successfully!");
        invalidateQueries();
      } else {
        message.error(data.error?.message || "Failed to update listing");
      }
    },
    onError: (error) => {
      console.error("Error updating listing:", error);
      message.error("Failed to update listing");
    },
  });

  // Mutation: Delete listing
  const deleteMutation = useMutation({
    mutationFn: (listingId: string) => deleteListing(listingId),
    onSuccess: (data) => {
      if (data.success) {
        message.success("Listing deleted successfully!");
        invalidateQueries();
      } else {
        message.error(data.error?.message || "Failed to delete listing");
      }
    },
    onError: (error) => {
      console.error("Error deleting listing:", error);
      message.error("Failed to delete listing");
    },
  });

  return {
    createListing: createMutation.mutateAsync,
    updateListing: (listingId: string, payload: UpdateListingPayload) =>
      updateMutation.mutateAsync({ listingId, payload }),
    deleteListing: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
