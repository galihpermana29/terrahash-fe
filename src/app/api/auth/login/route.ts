/**
 * POST /api/auth/login
 *
 * Login existing user with wallet address
 * Verifies wallet exists and creates session
 */

import { NextRequest } from "next/server";
import { authRepository } from "@/lib/repository/auth";
import { errorResponse, successResponse } from "@/lib/utils/response";
import { createSession } from "@/lib/utils/session";
import { User } from "@/lib/types/user";
import { getHederaAccountIdFromEvmAddress } from "@/lib/hedera/h";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address } = body;
    console.log(wallet_address, "wallet address?");

    const isRootWallet = wallet_address === process.env.ROOT_ADMIN_WALLETS;

    if (isRootWallet) {
      const rootUser = {
        wallet_address,
        type: "ROOT" as User["type"],
        full_name: "Root User",
        id: "root",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await createSession(rootUser);
      return successResponse(rootUser);
    }

    // Validate wallet address
    if (!wallet_address || typeof wallet_address !== "string") {
      return errorResponse(
        "WALLET_ADDRESS_REQUIRED",
        "wallet_address is required",
        null,
        400
      );
    }

    // // Validate Ethereum address format
    // if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
    //   return errorResponse(
    //     "INVALID_WALLET_ADDRESS",
    //     "Invalid wallet address format",
    //     null,
    //     400
    //   );
    // }

    // Normalize wallet address
    const normalizedWallet = wallet_address.toLowerCase();
    
    // Convert EVM → HEDERA ID
    const hederaAccountId = await getHederaAccountIdFromEvmAddress(normalizedWallet);

    // Find user by wallet
    const user = await authRepository.findByWallet(hederaAccountId || normalizedWallet);

    if (!user) {
      return errorResponse(
        "WALLET_NOT_REGISTERED",
        "Wallet not registered",
        null,
        404
      );
    }

    // If GOV user, verify still whitelisted
    if (user.type === "GOV") {
      const isWhitelisted = await authRepository.isWhitelisted(user.id);
      if (!isWhitelisted) {
        return errorResponse(
          "GOVERNMENT_ACCESS_REVOKED",
          "Government access has been revoked. Please contact an administrator.",
          null,
          403
        );
      }
    }

    // Create session
    await createSession(user);

    return successResponse({
      user,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in login route:", error);
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Login failed",
      null,
      500
    );
  }
}
