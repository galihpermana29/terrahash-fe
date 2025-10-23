import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";

/**
 * GET /api/transactions/gov
 * Get all transactions for government users
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
            message: "Only government users can access all transactions",
          },
        },
        { status: 403 }
      );
    }

    // Get all transactions with full details
    const { data: transactions, error } = await supabaseServer
      .from("transactions")
      .select(
        `
        *,
        listing:listings!listing_id (
          id,
          type,
          price_kes,
          active,
          parcel:parcels!parcel_id (
            parcel_id,
            area_m2,
            admin_region,
            status
          )
        ),
        buyer:users!buyer_id (
          id,
          full_name,
          wallet_address
        ),
        seller:users!seller_id (
          id,
          full_name,
          wallet_address
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching government transactions:", error);
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
      data: { transactions, count: transactions?.length || 0 },
    });
  } catch (error) {
    console.error("Error in GET /api/transactions/gov:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
