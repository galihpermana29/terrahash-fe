import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";
import type { ApiResponse } from "@/lib/types/response";
import type { Objection } from "@/lib/types/objection";

/**
 * PUT /api/objections/[objection_id]/status
 * Update objection status (Government only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ objection_id: string }> }
): Promise<NextResponse<ApiResponse<{ objection: Objection }>>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Only GOVERNMENT users can update objection status
    if (user.type !== "GOV") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only government officials can update objection status",
          },
        },
        { status: 403 }
      );
    }

    const { objection_id } = await params;
    const { status } = await request.json();

    if (!status || !["PENDING", "REVIEWED", "RESOLVED"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Valid status is required (PENDING, REVIEWED, RESOLVED)",
          },
        },
        { status: 400 }
      );
    }

    // Update objection status
    const { data: objection, error } = await supabaseServer
      .from("objections")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", objection_id)
      .select()
      .single();

    if (error) {
      console.error("Objection status update error:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPDATE_FAILED",
            message: "Failed to update objection status",
          },
        },
        { status: 500 }
      );
    }

    if (!objection) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OBJECTION_NOT_FOUND",
            message: "Objection not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { objection },
    });
  } catch (error) {
    console.error("Objection status update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
