import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";

/**
 * PATCH /api/listings/:listing_id
 * Update an existing listing
 * Requires authentication (PUBLIC user type)
 * Only listing owner can update
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ listing_id: string }> }
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

    if (user.type !== "PUBLIC") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only PUBLIC users can update listings",
          },
        },
        { status: 403 }
      );
    }

    const { listing_id } = await params;

    // Get existing listing
    const { data: existingListing, error: fetchError } = await supabaseServer
      .from("listings")
      .select(
        `
        *,
        parcel:parcels!parcel_id (
          owner_id
        )
      `
      )
      .eq("id", listing_id)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Listing not found" },
        },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (existingListing.parcel.owner_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only update your own listings",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { price_kes, lease_period, description, terms, contact_phone, active } =
      body;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (price_kes !== undefined) {
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
      updateData.price_kes = price_kes;
    }

    if (lease_period !== undefined) {
      // Validate lease_period for LEASE type
      if (existingListing.type === "LEASE") {
        if (!["1_MONTH", "6_MONTHS", "12_MONTHS"].includes(lease_period)) {
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
        updateData.lease_period = lease_period;
      }
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    if (terms !== undefined) {
      updateData.terms = terms || null;
    }

    if (contact_phone !== undefined) {
      updateData.contact_phone = contact_phone || null;
    }

    if (active !== undefined) {
      updateData.active = active;
    }

    // Update listing
    const { data: listing, error } = await supabaseServer
      .from("listings")
      .update(updateData)
      .eq("id", listing_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating listing:", error);
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
      message: "Listing updated successfully",
    });
  } catch (error) {
    console.error("Error in PATCH /api/listings/:listing_id:", error);
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
 * DELETE /api/listings/:listing_id
 * Delete (deactivate) a listing
 * Requires authentication (PUBLIC user type)
 * Only listing owner can delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listing_id: string }> }
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

    if (user.type !== "PUBLIC") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only PUBLIC users can delete listings",
          },
        },
        { status: 403 }
      );
    }

    const { listing_id } = await params;

    // Get existing listing
    const { data: existingListing, error: fetchError } = await supabaseServer
      .from("listings")
      .select(
        `
        *,
        parcel:parcels!parcel_id (
          owner_id
        )
      `
      )
      .eq("id", listing_id)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Listing not found" },
        },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (existingListing.parcel.owner_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only delete your own listings",
          },
        },
        { status: 403 }
      );
    }

    // Hard delete: remove from database
    const { error } = await supabaseServer
      .from("listings")
      .delete()
      .eq("id", listing_id);

    if (error) {
      console.error("Error deleting listing:", error);
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
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/listings/:listing_id:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
