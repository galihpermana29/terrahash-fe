export type UserType = "PUBLIC" | "GOV";

export interface User {
  id: string; // PK
  type: UserType;
  full_name?: string | null;
  wallet_address?: string | null;
  created_at: string;
}
