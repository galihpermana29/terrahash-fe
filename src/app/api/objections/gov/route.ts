import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";
import type { ApiResponse } from "@/lib/types/response";
import type { ObjectionWithDetails } from "@/lib/types/objection";

/**
 * GET /api/objections/gov
 * Get all objections (Government only)
 */
export async function GET(
  request: NextRequest
): Promise<
  NextResponse<
    ApiResponse<{ objections: ObjectionWithDetails[]; count: number }>
  >
> {
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

    // Only GOVERNMENT users can view all objections
    if (user.type !== "GOV") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only government officials can view all objections",
          },
        },
        { status: 403 }
      );
    }

    // Get objections with parcel and user details
    const { data: objections, error } = await supabaseServer
      .from("objections")
      .select(
        `
        *,
        parcel:parcels!parcel_id (
          parcel_id,
          area_m2,
          admin_region,
          status
        ),
        user:users!user_id (
          id,
          full_name,
          wallet_address
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Government objections fetch error:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FETCH_FAILED",
            message: "Failed to fetch objections",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        objections: objections || [],
        count: objections?.length || 0,
      },
    });
  } catch (error) {
    console.error("Government objections error:", error);
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
