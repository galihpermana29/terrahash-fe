/**
 * Session Management Utilities
 *
 * Handles custom session creation/validation for wallet-based auth
 * Uses Supabase cookies for session persistence
 */

import { cookies } from "next/headers";
import type { User } from "../types/user";
import { supabaseServer } from "../supabase/server";

const SESSION_COOKIE_NAME = "terrahash-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Create a session for a user (after wallet verification)
 * Stores user data in a secure, httpOnly cookie
 */
export async function createSession(user: User): Promise<void> {
  const cookieStore = await cookies();

  // Store minimal user data in session
  const sessionData = JSON.stringify({
    userId: user.id,
    walletAddress: user.wallet_address,
    userType: user.type,
    createdAt: Date.now(),
  });

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Get current session from cookie
 */
export async function getSession(): Promise<{
  userId: string;
  walletAddress: string;
  userType: "PUBLIC" | "GOV";
  createdAt: number;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);

    // Validate session is not expired (7 days)
    const now = Date.now();
    const sessionAge = now - sessionData.createdAt;
    if (sessionAge > SESSION_MAX_AGE * 1000) {
      await destroySession();
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

/**
 * Destroy current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  if (session.userId === "root") {
    return {
      id: "root",
      wallet_address: session.walletAddress,
      type: "ROOT",
      full_name: "Root User",
      created_at: new Date().toISOString(),
    };
  }

  const { data: user, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", session.userId)
    .single();

  if (error || !user) {
    // Session exists but user not found - clear invalid session
    await destroySession();
    return null;
  }

  return user as User;
}

/**
 * Require authentication (for API routes)
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Require specific user type (for role-based access)
 */
export async function requireUserType(type: "PUBLIC" | "GOV"): Promise<User> {
  const user = await requireAuth();
  if (user.type !== type) {
    throw new Error(`Forbidden: ${type} access required`);
  }
  return user;
}

/**
 * Check if user is root admin
 */
export async function isRootAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const rootAdmins =
    process.env.ROOT_ADMIN_WALLETS?.toLowerCase().split(",") || [];
  return rootAdmins.includes(user.wallet_address.toLowerCase());
}

/**
 * Require root admin access
 */
export async function requireRootAdmin(): Promise<User> {
  const user = await requireAuth();
  if (!isRootAdmin()) {
    throw new Error("Forbidden: Root admin access required");
  }
  return user;
}
