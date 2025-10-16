import { getSession } from "@/lib/utils/session";
import { errorResponse, successResponse } from "@/lib/utils/response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    return successResponse({
      session,
    });
  } catch (error) {
    console.error("Error in session route:", error);
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to get session",
      null,
      500
    );
  }
}
