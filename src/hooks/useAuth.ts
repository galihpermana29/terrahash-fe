/**
 * useAuth Hook
 *
 * Global authentication state management with React Query
 * Handles wallet-based auth, login, register, and logout
 */

import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import type { User } from "@/lib/types/user";
import {
  checkWallet,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  type RegisterData,
  type LoginData,
} from "@/client-action/auth";

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();

  // Query: Fetch current user session on mount
  // This persists auth state across page refreshes
  const {
    data: sessionData,
    isLoading: isLoadingSession,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Derive auth state from query data
  const user = sessionData?.success ? sessionData.data.user : null;
  const isAuthenticated = !!user;
  const userType = user?.type || null;

  // Reset session when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      queryClient.setQueryData(["currentUser"], null);
    }
  }, [isConnected, isAuthenticated, queryClient]);

  // Mutation: Check wallet (to determine if user exists)
  const checkWalletMutation = useMutation({
    mutationFn: checkWallet,
    onSuccess: (data) => {
      return data;
    },
    onError: (error: Error) => {
      message.error("Failed to check wallet status");
      console.error("Check wallet error:", error);
    },
  });

  // Mutation: Login
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.success) {
        // Update query cache with new user data
        queryClient.setQueryData(["currentUser"], data);
        message.success("Login successful!");
      } else {
        message.error(data.error?.message || "Login failed");
      }
    },
    onError: (error: Error) => {
      message.error("Login failed");
      console.error("Login error:", error);
    },
  });

  // Mutation: Register
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.success) {
        // Update query cache with new user data
        queryClient.setQueryData(["currentUser"], data);
        message.success("Registration successful!");
      } else {
        message.error(data.error?.message || "Registration failed");
      }
    },
    onError: (error: Error) => {
      message.error("Registration failed");
      console.error("Registration error:", error);
    },
  });

  // Mutation: Logout
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear query cache
      queryClient.setQueryData(["currentUser"], null);
      disconnect?.();
      message.success("Logged out successfully");
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      // Still disconnect wallet even if API fails
      disconnect?.();
      queryClient.setQueryData(["currentUser"], null);
    },
  });

  // Helper methods
  const login = async (walletAddress: string) => {
    return loginMutation.mutateAsync({ wallet_address: walletAddress });
  };

  const register = async (walletAddress: string, fullName: string) => {
    return registerMutation.mutateAsync({
      wallet_address: walletAddress,
      full_name: fullName,
    });
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  const checkWalletExists = async (walletAddress: string) => {
    return checkWalletMutation.mutateAsync(walletAddress);
  };

  return {
    // State (derived from query)
    user,
    isAuthenticated,
    isLoading:
      isLoadingSession ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending ||
      checkWalletMutation.isPending,
    userType,

    // Methods
    login,
    register,
    logout,
    checkWalletExists,
    refetchSession, // Expose refetch for manual session refresh

    // Mutation states (for granular loading states)
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isCheckingWallet: checkWalletMutation.isPending,
  };
}
