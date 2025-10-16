/**
 * Whitelist Client Actions
 *
 * API functions for managing GOV user whitelist
 * Used by root admin hooks
 */

import type {
  AddWhitelistPayload,
  UpdateWhitelistStatusPayload,
} from "@/lib/types/whitelist";

/**
 * Get all whitelisted GOV users
 */
export const getWhitelists = async () => {
  const response = await fetch("/api/wallet/whitelists");
  if (!response.ok) {
    throw new Error("Failed to get whitelists");
  }
  return response.json();
};

/**
 * Add a new GOV user to whitelist
 */
export const addWhitelist = async (data: AddWhitelistPayload) => {
  const response = await fetch("/api/wallet/whitelists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to add whitelist");
  }
  return response.json();
};

/**
 * Update whitelist status (ACTIVE/REVOKED)
 */
export const updateWhitelistStatus = async (
  userId: string,
  data: UpdateWhitelistStatusPayload
) => {
  const response = await fetch(`/api/wallet/whitelists?user_id=${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update whitelist status");
  }
  return response.json();
};
