/**
 * useWhitelist Hook
 *
 * React Query hook for managing GOV user whitelist
 * Only accessible by ROOT admin users
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import {
  getWhitelists,
  addWhitelist,
  updateWhitelistStatus,
} from "@/client-action/whitelist";
import type {
  AddWhitelistPayload,
  UpdateWhitelistStatusPayload,
  GetWhitelistsResponse,
  AddWhitelistResponse,
  UpdateWhitelistStatusResponse,
} from "@/lib/types/whitelist";

export function useWhitelist() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Query: Fetch all whitelists
  const {
    data: whitelistData,
    isLoading,
    error,
    refetch,
  } = useQuery<GetWhitelistsResponse>({
    queryKey: ["whitelists"],
    queryFn: async () => {
      const response = await getWhitelists();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || "Failed to fetch whitelists");
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation: Add new whitelist
  const addWhitelistMutation = useMutation({
    mutationFn: addWhitelist,
    onSuccess: (data) => {
      if (data.success) {
        message.success("User added to whitelist successfully!");
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ["whitelists"] });
      } else {
        message.error(data.error?.message || "Failed to add whitelist");
      }
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to add whitelist");
      console.error("Add whitelist error:", error);
    },
  });

  // Mutation: Update whitelist status
  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateWhitelistStatusPayload;
    }) => updateWhitelistStatus(userId, data),
    onSuccess: (data) => {
      if (data.success) {
        message.success("Whitelist status updated successfully!");
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ["whitelists"] });
      } else {
        message.error(data.error?.message || "Failed to update status");
      }
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to update status");
      console.error("Update status error:", error);
    },
  });

  // Helper methods
  const addUser = async (payload: AddWhitelistPayload) => {
    return addWhitelistMutation.mutateAsync(payload);
  };

  const toggleStatus = async (userId: string, status: "ACTIVE" | "REVOKED") => {
    return updateStatusMutation.mutateAsync({
      userId,
      data: { status },
    });
  };

  return {
    // Data
    whitelists: whitelistData?.whitelists || [],
    isLoading,
    error,

    // Methods
    addUser,
    toggleStatus,
    refetch,

    // Mutation states
    isAdding: addWhitelistMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
}
