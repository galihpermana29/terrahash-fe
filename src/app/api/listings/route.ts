import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";

/**
 * GET /api/listings
 * Get listings for the authenticated user only
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

    // Get listings for parcels owned by this user only
    const { data: listings, error } = await supabaseServer
      .from("listings")
      .select(
        `
        *,
      parcel:parcels!parcel_id (
        parcel_id,
        area_m2,
        admin_region,
        status
      )
      `
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching listings:", error);
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
    console.error("Error in GET /api/listings:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings
 * Create a new listing (SALE or LEASE)
 * Requires authentication (PUBLIC user type)
 * Only parcel owner can create listing
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

    const body = await request.json();
    const {
      parcel_id,
      type,
      price_kes,
      lease_period,
      description,
      terms,
      contact_phone,
    } = body;

    // Validate required fields
    if (!parcel_id || !type || !price_kes) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required fields: parcel_id, type, price_kes",
          },
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!["SALE", "LEASE"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid listing type" },
        },
        { status: 400 }
      );
    }

    // Validate lease_period for LEASE type
    if (type === "LEASE" && !lease_period) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "lease_period is required for LEASE type",
          },
        },
        { status: 400 }
      );
    }

    if (
      type === "LEASE" &&
      !["1_MONTH", "6_MONTHS", "12_MONTHS"].includes(lease_period)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid lease_period",
          },
        },
        { status: 400 }
      );
    }

    // Validate price
    if (price_kes <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "price_kes must be greater than 0",
          },
        },
        { status: 400 }
      );
    }

    // Check if parcel exists and user is the owner
    const { data: parcel, error: parcelError } = await supabaseServer
      .from("parcels")
      .select("parcel_id, owner_id, status")
      .eq("parcel_id", parcel_id)
      .single();

    if (parcelError || !parcel) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Parcel not found" },
        },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (parcel.owner_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only create listings for your own parcels",
          },
        },
        { status: 403 }
      );
    }

    // Check if parcel is OWNED
    if (parcel.status !== "OWNED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Only OWNED parcels can be listed",
          },
        },
        { status: 400 }
      );
    }

    // Check if there's already an active listing for this parcel
    const { data: existingListing } = await supabaseServer
      .from("listings")
      .select("id")
      .eq("parcel_id", parcel_id)
      .eq("active", true)
      .single();

    if (existingListing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "This parcel already has an active listing",
          },
        },
        { status: 409 }
      );
    }

    // Create listing
    const { data: listing, error } = await supabaseServer
      .from("listings")
      .insert({
        parcel_id,
        type,
        price_kes,
        lease_period: type === "LEASE" ? lease_period : null,
        description: description || null,
        terms: terms || null,
        contact_phone: contact_phone || null,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating listing:", error);
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
      data: { listing },
      message: "Listing created successfully",
    });
  } catch (error) {
    console.error("Error in POST /api/listings:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
