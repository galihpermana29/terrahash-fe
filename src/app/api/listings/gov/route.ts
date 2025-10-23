import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";

/**
 * GET /api/listings/gov
 * Get all listings for government users only
 * Requires GOV user type
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    // Only GOV users can access this endpoint
    if (user.type !== "GOV") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only government users can access all listings",
          },
        },
        { status: 403 }
      );
    }

    // Get all listings with owner information
    const { data: listings, error } = await supabaseServer
      .from("listings")
      .select(
        `
        *,
        parcel:parcels!parcel_id (
          parcel_id,
          area_m2,
          admin_region,
          status,
          owner:users!owner_id (
            id,
            full_name,
            wallet_address
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching government listings:", error);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: error.message },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { listings },
      count: listings?.length || 0,
    });
  } catch (error) {
    console.error("Error in GET /api/listings/gov:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
