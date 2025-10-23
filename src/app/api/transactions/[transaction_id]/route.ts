import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";

/**
 * GET /api/transactions/:id
 * Get specific transaction details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transaction_id: string }> }
) {
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

    const { transaction_id } = await params;

    const { data: transaction, error } = await supabaseServer
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
      .eq("id", transaction_id)
      .single();

    if (error || !transaction) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Transaction not found" },
        },
        { status: 404 }
      );
    }

    // Check authorization - user must be buyer, seller, or government
    if (
      user.type !== "GOV" &&
      transaction.buyer_id !== user.id &&
      transaction.seller_id !== user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to view this transaction",
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    console.error("Error in GET /api/transactions/:id:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
