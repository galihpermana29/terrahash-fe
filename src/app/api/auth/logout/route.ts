/**
 * POST /api/auth/logout
 *
 * Logout current user and destroy session
 */

import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/utils/response";
import { destroySession } from "@/lib/utils/session";

export async function POST(request: NextRequest) {
  try {
    await destroySession();

    return successResponse({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error in logout route:", error);
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Logout failed",
      null,
      500
    );
  }
}
