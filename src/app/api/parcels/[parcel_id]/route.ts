import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/session";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/parcels/:parcel_id
 * Get parcel by ID (PUBLIC - no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parcel_id: string }> }
) {
  try {
    // No authentication required - public endpoint

    const { parcel_id } = await params;

    const { data: parcel, error } = await supabaseServer
      .from("parcels")
      .select(`
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
      `)
      .eq("parcel_id", parcel_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Parcel not found" } },
          { status: 404 }
        );
      }

      console.error("Error fetching parcel:", error);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    // Normalize listing data (Supabase returns array, we want single object or null)
    const normalizedParcel = {
      ...parcel,
      listing:
        parcel.listing && parcel.listing.length > 0
          ? parcel.listing[0]
          : null,
    };

    return NextResponse.json({
      success: true,
      data: { parcel: normalizedParcel },
    });
  } catch (error) {
    console.error("Error in GET /api/parcels/:parcel_id:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/parcels/:parcel_id
 * Update parcel (GOV only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ parcel_id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    if (user.type !== "GOV") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only GOV users can update parcels" } },
        { status: 403 }
      );
    }

    const { parcel_id } = await params;
    const body = await request.json();
    const { geometry_geojson, area_m2, admin_region, status, owner_id, notes, asset_url } = body;

    // Build update object (only include provided fields)
    const updateData: any = {};

    if (geometry_geojson) {
      updateData.geometry_geojson = JSON.stringify(geometry_geojson);
    }
    if (area_m2 !== undefined) {
      updateData.area_m2 = area_m2;
    }
    if (admin_region) {
      updateData.admin_region = admin_region;
    }
    if (status) {
      if (!["UNCLAIMED", "OWNED"].includes(status)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid status" } },
          { status: 400 }
        );
      }
      updateData.status = status;
      
      // If changing to OWNED, owner_id is required
      if (status === "OWNED" && !owner_id) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Owner is required for OWNED status" } },
          { status: 400 }
        );
      }
      
      // If changing to UNCLAIMED, clear owner_id
      if (status === "UNCLAIMED") {
        updateData.owner_id = null;
      }
    }
    if (owner_id !== undefined) {
      updateData.owner_id = owner_id;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (asset_url !== undefined) {
      updateData.asset_url = asset_url;
    }

    updateData.updated_at = new Date().toISOString();

    // Update parcel
    const { data: parcel, error } = await supabaseServer
      .from("parcels")
      .update(updateData)
      .eq("parcel_id", parcel_id)
      .select(`
        *,
        owner:users!owner_id (
          id,
          full_name,
          wallet_address
        )
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Parcel not found" } },
          { status: 404 }
        );
      }

      console.error("Error updating parcel:", error);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { parcel },
    });
  } catch (error) {
    console.error("Error in PATCH /api/parcels/:parcel_id:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/parcels/:parcel_id
 * Delete parcel (GOV only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ parcel_id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    if (user.type !== "GOV") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only GOV users can delete parcels" } },
        { status: 403 }
      );
    }

    const { parcel_id } = await params;

    const { error } = await supabaseServer
      .from("parcels")
      .delete()
      .eq("parcel_id", parcel_id);

    if (error) {
      console.error("Error deleting parcel:", error);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Parcel deleted successfully" },
    });
  } catch (error) {
    console.error("Error in DELETE /api/parcels/:parcel_id:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
