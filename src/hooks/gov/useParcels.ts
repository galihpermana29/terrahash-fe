import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import {
  getParcels,
  getParcelById,
  createParcel,
  updateParcel,
  toggleParcelStatus,
  deleteParcel,
} from "@/client-action/parcel";
import type { ParcelFormPayload } from "@/lib/types/parcel";

export function useParcels(params?: {
  status?: "UNCLAIMED" | "OWNED";
  search?: string;
  userId?: string;
}) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Query: Get all parcels
  const {
    data: parcelsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["parcels", params],
    queryFn: () => getParcels(params),
  });

  // Mutation: Create parcel
  const createMutation = useMutation({
    mutationFn: createParcel,
    onSuccess: (data) => {
      if (data.success) {
        message.success("Parcel created successfully!");
        queryClient.invalidateQueries({ queryKey: ["parcels"] });
      } else {
        message.error(data.error?.message || "Failed to create parcel");
      }
    },
    onError: (error: Error) => {
      message.error("Failed to create parcel");
      console.error("Create parcel error:", error);
    },
  });

  // Mutation: Update parcel
  const updateMutation = useMutation({
    mutationFn: ({
      parcelId,
      data,
    }: {
      parcelId: string;
      data: Partial<ParcelFormPayload>;
    }) => updateParcel(parcelId, data),
    onSuccess: (data) => {
      if (data.success) {
        message.success("Parcel updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["parcels"] });
      } else {
        message.error(data.error?.message || "Failed to update parcel");
      }
    },
    onError: (error: Error) => {
      message.error("Failed to update parcel");
      console.error("Update parcel error:", error);
    },
  });

  // Mutation: Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: ({
      parcelId,
      status,
      ownerId,
    }: {
      parcelId: string;
      status: "UNCLAIMED" | "OWNED";
      ownerId?: string;
    }) => toggleParcelStatus(parcelId, status, ownerId),
    onSuccess: (data) => {
      if (data.success) {
        message.success("Parcel status updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["parcels"] });
      } else {
        message.error(data.error?.message || "Failed to update status");
      }
    },
    onError: (error: Error) => {
      message.error("Failed to update status");
      console.error("Toggle status error:", error);
    },
  });

  // Mutation: Delete parcel
  const deleteMutation = useMutation({
    mutationFn: deleteParcel,
    onSuccess: (data) => {
      if (data.success) {
        message.success("Parcel deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["parcels"] });
      } else {
        message.error(data.error?.message || "Failed to delete parcel");
      }
    },
    onError: (error: Error) => {
      message.error("Failed to delete parcel");
      console.error("Delete parcel error:", error);
    },
  });

  return {
    parcels: parcelsData?.success ? parcelsData.data.parcels : [],
    isLoading,
    refetch,
    createParcel: createMutation.mutateAsync,
    updateParcel: updateMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    deleteParcel: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useParcelDetail(parcelId: string | null) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["parcel", parcelId],
    queryFn: () => getParcelById(parcelId!),
    enabled: !!parcelId,
  });

  return {
    parcel: data?.success ? data.data.parcel : null,
    isLoading,
    refetch,
  };
}
