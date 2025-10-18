/**
 * useWalletAuth Hook
 *
 * Handles automatic authentication when wallet connects
 * Checks if user exists and triggers login or registration flow
 */

import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";

interface WalletAuthState {
  needsRegistration: boolean;
  isCheckingAuth: boolean;
}

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { checkWalletExists, login, isAuthenticated, isLoading } = useAuth();

  const [walletAuthState, setWalletAuthState] = useState<WalletAuthState>({
    needsRegistration: false,
    isCheckingAuth: false,
  });

  // Track which addresses we've already checked to prevent re-checking
  const checkedAddresses = useRef<Set<string>>(new Set());
  // Track if user manually logged out to prevent auto-login
  const hasLoggedOut = useRef<boolean>(false);

  // Auto-check and authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticated && !isLoading) {
      // Only check if we haven't checked this address yet AND user didn't just logout
      if (!checkedAddresses.current.has(address.toLowerCase()) && !hasLoggedOut.current) {
        checkedAddresses.current.add(address.toLowerCase());
        handleWalletConnection(address);
      }
    } else if (!isConnected) {
      // Reset state when wallet disconnects
      checkedAddresses.current.clear();
      hasLoggedOut.current = false; // Reset logout flag when wallet disconnects
      setWalletAuthState({
        needsRegistration: false,
        isCheckingAuth: false,
      });
    }
  }, [isConnected, address, isAuthenticated, isLoading]);

  // Detect when user logs out (was authenticated, now not authenticated, but wallet still connected)
  useEffect(() => {
    if (!isAuthenticated && isConnected && address) {
      // User logged out while wallet is still connected
      hasLoggedOut.current = true;
    }
  }, [isAuthenticated, isConnected, address]);

  const handleWalletConnection = async (walletAddress: string) => {
    try {
      setWalletAuthState((prev) => ({ ...prev, isCheckingAuth: true }));

      const result = await checkWalletExists(walletAddress);
      console.log(result, "result");
      if (result.success && result.data.exists) {
        const loginData = await login(walletAddress);
        setWalletAuthState({
          needsRegistration: false,
          isCheckingAuth: false,
        });

        console.log(loginData, "result");
      } else {
        setWalletAuthState({
          needsRegistration: true,
          isCheckingAuth: false,
        });
      }
    } catch (error) {
      console.error("[useWalletAuth] Error during wallet auth:", error);
      setWalletAuthState({
        needsRegistration: false,
        isCheckingAuth: false,
      });
    }
  };

  const dismissRegistration = () => {
    setWalletAuthState((prev) => ({ ...prev, needsRegistration: false }));
  };

  return {
    needsRegistration: walletAuthState.needsRegistration,
    isCheckingAuth: walletAuthState.isCheckingAuth,
    dismissRegistration,
  };
}
