import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/session";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * PATCH /api/parcels/:parcel_id/status
 * Toggle parcel status (UNCLAIMED <-> OWNED) (GOV only)
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
        { success: false, error: { code: "FORBIDDEN", message: "Only GOV users can update parcel status" } },
        { status: 403 }
      );
    }

    const { parcel_id } = await params;
    const body = await request.json();
    const { status, owner_id } = body;

    // Validate status
    if (!status || !["UNCLAIMED", "OWNED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid status. Must be UNCLAIMED or OWNED" } },
        { status: 400 }
      );
    }

    // If changing to OWNED, owner_id is required
    if (status === "OWNED" && !owner_id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Owner is required when status is OWNED" } },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set or clear owner_id based on status
    if (status === "OWNED") {
      updateData.owner_id = owner_id;
    } else {
      updateData.owner_id = null;
    }

    // Update parcel status
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

      console.error("Error updating parcel status:", error);
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
    console.error("Error in PATCH /api/parcels/:parcel_id/status:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
