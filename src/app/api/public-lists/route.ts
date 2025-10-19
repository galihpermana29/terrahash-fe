import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/public-lists
 * Get public parcels list with listings (LEFT JOIN)
 * Query params:
 * - q: Search by parcel_id, country, state, or city (case-insensitive)
 * - status: Filter by status (ALL, UNCLAIMED, OWNED)
 * - listing_type: Filter by listing type (ALL, SALE, LEASE) - only works when status=OWNED
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.toUpperCase() || "ALL";
    const listingType = searchParams.get("listing_type")?.toUpperCase() || "ALL";

    // Build the base query with LEFT JOIN to listings
    let supabaseQuery = supabaseServer
      .from("parcels")
      .select(`
        *,
        owner:users!owner_id (
          id,
          full_name,
          wallet_address
        ),
        listing:listings (
          type,
          price_kes,
          active,
          description
        )
      `);

    // Apply status filter
    if (status !== "ALL") {
      supabaseQuery = supabaseQuery.eq("status", status);
    }

    // Apply search filter (parcel_id, country, state, city)
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `parcel_id.ilike.%${query}%,admin_region->>country.ilike.%${query}%,admin_region->>state.ilike.%${query}%,admin_region->>city.ilike.%${query}%`
      );
    }

    const { data: parcels, error } = await supabaseQuery.order("created_at", {
      ascending: false,
    });

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

    // Client-side filter for listing_type (since it's a LEFT JOIN)
    let filteredParcels = parcels || [];
    
    if (status === "OWNED" && listingType !== "ALL") {
      filteredParcels = filteredParcels.filter((parcel: any) => {
        // Only show parcels that have an active listing of the specified type
        return (
          parcel.listing &&
          parcel.listing.length > 0 &&
          parcel.listing[0].active &&
          parcel.listing[0].type === listingType
        );
      });
    }

    // Normalize listing data (Supabase returns array, we want single object or null)
    const normalizedParcels = filteredParcels.map((parcel: any) => ({
      ...parcel,
      listing:
        parcel.listing && parcel.listing.length > 0
          ? parcel.listing[0]
          : null,
    }));

    return NextResponse.json({
      success: true,
      data: normalizedParcels,
      count: normalizedParcels.length,
    });
  } catch (error) {
    console.error("Error in public-lists API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
