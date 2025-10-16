import { User } from "./user";

export type WhitelistStatus = "ACTIVE" | "REVOKED";

export interface GovWhitelist {
  id: string;
  user_id: string;
  status: WhitelistStatus;
  added_at: string;
  users?: User; // Joined user data
}

// API Payloads
export interface AddWhitelistPayload {
  wallet_address: string;
  full_name: string;
}

export interface UpdateWhitelistStatusPayload {
  status: WhitelistStatus;
}

// API Responses
export interface GetWhitelistsResponse {
  whitelists: GovWhitelist[];
}

export interface AddWhitelistResponse {
  user: User;
}

export interface UpdateWhitelistStatusResponse {
  user: User;
}
