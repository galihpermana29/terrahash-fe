import { useState, useEffect } from "react";
import { getGovernmentObjections, getUserObjections, getParcelObjections } from "@/client-action/objection";
import type { ObjectionWithDetails } from "@/lib/types/objection";

interface UseObjectionsResult {
  objections: ObjectionWithDetails[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching government objections (admin only)
 */
export function useGovernmentObjections(): UseObjectionsResult {
  const [objections, setObjections] = useState<ObjectionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getGovernmentObjections();
      
      if (response.success && response.data) {
        setObjections(response.data.objections);
      } else {
        setError(response.error?.message || "Failed to fetch objections");
      }
    } catch (err) {
      setError("An error occurred while fetching objections");
      console.error("Government objections fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObjections();
  }, []);

  return {
    objections,
    isLoading,
    error,
    refetch: fetchObjections,
  };
}

/**
 * Hook for fetching user's objections
 */
export function useUserObjections(): UseObjectionsResult {
  const [objections, setObjections] = useState<ObjectionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getUserObjections();
      
      if (response.success && response.data) {
        setObjections(response.data.objections);
      } else {
        setError(response.error?.message || "Failed to fetch objections");
      }
    } catch (err) {
      setError("An error occurred while fetching objections");
      console.error("User objections fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObjections();
  }, []);

  return {
    objections,
    isLoading,
    error,
    refetch: fetchObjections,
  };
}

/**
 * Hook for fetching objections for a specific parcel
 */
export function useParcelObjections(parcelId: string): UseObjectionsResult {
  const [objections, setObjections] = useState<ObjectionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjections = async () => {
    if (!parcelId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getParcelObjections(parcelId);
      
      if (response.success && response.data) {
        setObjections(response.data.objections);
      } else {
        setError(response.error?.message || "Failed to fetch objections");
      }
    } catch (err) {
      setError("An error occurred while fetching objections");
      console.error("Parcel objections fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObjections();
  }, [parcelId]);

  return {
    objections,
    isLoading,
    error,
    refetch: fetchObjections,
  };
}
