/**
 * Auth Repository
 *
 * Handles wallet-based authentication with Supabase
 * Uses custom auth flow (wallet signature verification)
 */

import type { User } from "../types/user";
import { supabaseServer } from "../supabase/server";

export class AuthRepository {
  /**
   * Register a new PUBLIC user
   * GOV users are created via whitelist (not through this endpoint)
   */
  async register(userData: Omit<User, "id" | "created_at">): Promise<User> {
    // Insert user record
    const { data: user, error } = await supabaseServer
      .from("users")
      .insert({
        wallet_address: userData.wallet_address,
        type: userData.type,
        full_name: userData.full_name || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }

    return user as User;
  }

  /**
   * Check if wallet exists in database
   */
  async findByWallet(walletAddress: string): Promise<User | null> {
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (error) {
      // PGRST116 = not found, which is expected for new users
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return user as User;
  }

  /**
   * Check if wallet is whitelisted (for GOV users)
   */
  async isWhitelisted(walletAddress: string): Promise<boolean> {
    const { data, error } = await supabaseServer
      .from("gov_whitelist")
      .select("id, status")
      .eq("wallet_address", walletAddress)
      .eq("status", "ACTIVE")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false; // Not whitelisted
      }
      throw new Error(`Failed to check whitelist: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Get user by ID
   */
  async findById(userId: string): Promise<User | null> {
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return user as User;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { full_name?: string }
  ): Promise<User> {
    const { data: user, error } = await supabaseServer
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return user as User;
  }

  /**
   * Check if wallet is root admin
   */
  isRootAdmin(walletAddress: string): boolean {
    const rootAdmins =
      process.env.ROOT_ADMIN_WALLETS?.toLowerCase().split(",") || [];
    return rootAdmins.includes(walletAddress.toLowerCase());
  }
}

// Singleton instance
export const authRepository = new AuthRepository();
