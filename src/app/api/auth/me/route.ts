/**
 * GET /api/auth/me
 *
 * Get current authenticated user
 * Returns user data if session is valid
 */

import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/utils/response";
import { getCurrentUser } from "@/lib/utils/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("NOT_AUTHENTICATED", "Not authenticated", null, 401);
    }

    return successResponse({
      user,
    });
  } catch (error) {
    console.error("Error in me route:", error);
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to get user",
      null,
      500
    );
  }
}
