import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";

/**
 * POST /api/transactions/initiate
 * Initiate a new transaction for land purchase
 */
export async function POST(request: NextRequest) {
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

    // Only PUBLIC users can buy land
    if (user.type !== "PUBLIC") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only public users can purchase land",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { listing_id } = body;

    if (!listing_id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "listing_id is required" },
        },
        { status: 400 }
      );
    }

    // Get listing with parcel and owner details
    const { data: listing, error: listingError } = await supabaseServer
      .from("listings")
      .select(
        `
        *,
        parcel:parcels!parcel_id (
          parcel_id,
          area_m2,
          admin_region,
          status,
          owner_id,
          owner:users!owner_id (
            id,
            full_name,
            wallet_address
          )
        )
      `
      )
      .eq("id", listing_id)
      .eq("active", true)
      .eq("type", "SALE")
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Active sale listing not found",
          },
        },
        { status: 404 }
      );
    }

    // Validate business rules
    if (listing.parcel.owner_id === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Cannot purchase your own land",
          },
        },
        { status: 400 }
      );
    }

    if (listing.parcel.status !== "OWNED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parcel must be owned to be sold",
          },
        },
        { status: 400 }
      );
    }

    // Check for existing pending transaction
    const { data: existingTransaction } = await supabaseServer
      .from("transactions")
      .select("id")
      .eq("listing_id", listing_id)
      .eq("buyer_id", user.id)
      .eq("status", "INITIATED")
      .single();

    if (existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "You already have a pending transaction for this listing",
          },
        },
        { status: 400 }
      );
    }

    // Create transaction
    const { data: transaction, error: transactionError } = await supabaseServer
      .from("transactions")
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.parcel.owner_id,
        parcel_id: listing.parcel_id,
        type: "PURCHASE",
        status: "INITIATED",
        amount_kes: listing.price_kes,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: transactionError.message },
        },
        { status: 500 }
      );
    }

    // Return transaction with listing details
    return NextResponse.json({
      success: true,
      data: {
        transaction,
        listing: {
          id: listing.id,
          type: listing.type,
          price_kes: listing.price_kes,
          seller_wallet: listing.parcel.owner.wallet_address,
          parcel: {
            parcel_id: listing.parcel.parcel_id,
            area_m2: listing.parcel.area_m2,
            admin_region: listing.parcel.admin_region,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in POST /api/transactions/initiate:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
