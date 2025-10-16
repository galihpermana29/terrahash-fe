export type UserType = "PUBLIC" | "GOV" | "ROOT";

export interface User {
  id: string; // PK
  type: UserType;
  full_name?: string | null;
  wallet_address: string;
  created_at: string;
}
