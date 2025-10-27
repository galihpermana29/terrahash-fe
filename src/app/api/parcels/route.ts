import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/session";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/parcels
 * Get all parcels (PUBLIC - no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    // No authentication required - public endpoint

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // UNCLAIMED or OWNED
    const search = searchParams.get("search"); // Search by parcel_id
    const userId = searchParams.get("user_id"); // Search by user_id

    let query = supabaseServer
      .from("parcels")
      .select(
        `
        *,
        owner:users!owner_id (
          id,
          full_name,
          wallet_address
        ),
        listing:listings (
          id,
          type,
          price_kes,
          lease_period,
          description,
          terms,
          contact_phone,
          active,
          created_at,
          updated_at
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("parcel_id", `%${search}%`);
    }

    if (userId) {
      query = query.eq("owner_id", userId);
    }

    const { data: parcels, error } = await query;

    if (error) {
      console.error("Error fetching parcels:", error);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: error.message },
        },
        { status: 500 }
      );
    }

    // Normalize listing data (Supabase returns array, we want single object or null)
    const normalizedParcels = (parcels || []).map((parcel: any) => ({
      ...parcel,
      listing:
        parcel.listing && parcel.listing.length > 0
          ? parcel.listing[0]
          : null,
    }));

    return NextResponse.json({
      success: true,
      data: { parcels: normalizedParcels },
    });
  } catch (error) {
    console.error("Error in GET /api/parcels:", error);
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
 * POST /api/parcels
 * Create new parcel (GOV only)
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

    if (user.type !== "GOV") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only GOV users can create parcels",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      parcel_id,
      geometry_geojson,
      area_m2,
      admin_region,
      status,
      owner_id,
      notes,
      asset_url,
      certif_url
    } = body;

    // Validate required fields
    if (
      !parcel_id ||
      !geometry_geojson ||
      !area_m2 ||
      !admin_region ||
      !status
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required fields",
          },
        },
        { status: 400 }
      );
    }

    // Validate status
    if (!["UNCLAIMED", "OWNED"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid status" },
        },
        { status: 400 }
      );
    }

    // If status is OWNED, owner_id is required
    if (status === "OWNED" && !owner_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Owner is required for OWNED status",
          },
        },
        { status: 400 }
      );
    }

    // Convert GeoJSON to string for storage
    const geometryString = JSON.stringify(geometry_geojson);

    // Insert parcel
    const { data: parcel, error } = await supabaseServer
      .from("parcels")
      .insert({
        parcel_id,
        geometry_geojson: geometryString,
        area_m2,
        admin_region,
        status,
        owner_id: status === "OWNED" ? owner_id : null,
        notes,
        asset_url: asset_url || null,
        certif_url: certif_url || null,
      })
      .select(
        `
        *,
        owner:users!owner_id (
          id,
          full_name,
          wallet_address
        )
      `
      )
      .single();

    if (error) {
      console.error("Error creating parcel:", error);

      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_PARCEL",
              message: "Parcel ID already exists",
            },
          },
          { status: 409 }
        );
      }

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
      data: { parcel },
    });
  } catch (error) {
    console.error("Error in POST /api/parcels:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
