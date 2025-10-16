/**
 * POST /api/auth/register
 *
 * Register a new PUBLIC user with wallet address
 * GOV users are created via root admin whitelist, not through this endpoint
 */

import { NextRequest } from "next/server";
import { authRepository } from "@/lib/repository/auth";
import { errorResponse, successResponse } from "@/lib/utils/response";
import { createSession } from "@/lib/utils/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, full_name } = body;

    // Validate wallet address
    if (!wallet_address || typeof wallet_address !== "string") {
      return errorResponse(
        "EMPTY_WALLET_ADDRESS",
        "wallet_address is required",
        null,
        400
      );
    }

    // Validate Ethereum address format (0x + 40 hex chars)
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return errorResponse(
        "INVALID_WALLET_ADDRESS",
        "Invalid wallet address format",
        null,
        400
      );
    }

    // Normalize wallet address (lowercase)
    const normalizedWallet = wallet_address.toLowerCase();

    // Check if wallet already exists
    const existingUser = await authRepository.findByWallet(normalizedWallet);
    if (existingUser) {
      return errorResponse(
        "WALLET_ALREADY_REGISTERED",
        "Wallet already registered",
        null,
        409
      );
    }

    // Check if wallet is whitelisted (would be a GOV user)
    // const isWhitelisted = await authRepository.isWhitelisted(normalizedWallet);
    // if (isWhitelisted) {
    //   return errorResponse(
    //     "GOV_WALLET_ALREADY_WHITELISTED",
    //     "This wallet is whitelisted for government access. Please contact an administrator.",
    //     null,
    //     403
    //   );
    // }

    // Validate full_name if provided
    if (full_name && typeof full_name !== "string") {
      return errorResponse(
        "INVALID_FULL_NAME",
        "full_name must be a string",
        null,
        400
      );
    }

    if (full_name && (full_name.length < 2 || full_name.length > 100)) {
      return errorResponse(
        "INVALID_FULL_NAME_LENGTH",
        "full_name must be between 2 and 100 characters",
        400
      );
    }

    // Create new PUBLIC user
    const newUser = await authRepository.register({
      wallet_address: normalizedWallet,
      type: "PUBLIC",
      full_name: full_name || null,
    });

    // Create session
    await createSession(newUser);

    return successResponse(
      {
        user: newUser,
        message: "Registration successful",
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("Error in register route:", error);
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Registration failed",
      null,
      500
    );
  }
}
