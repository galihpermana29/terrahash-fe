import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";
import type { ApiResponse } from "@/lib/types/response";
import type { Objection } from "@/lib/types/objection";

/**
 * POST /api/objections
 * Create a new objection for a parcel
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ objection: Objection }>>> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required"
        }
      }, { status: 401 });
    }

    // Only PUBLIC users can submit objections
    if (user.type !== "PUBLIC") {
      return NextResponse.json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only public users can submit objections"
        }
      }, { status: 403 });
    }

    const { parcel_id, message } = await request.json();

    if (!parcel_id || !message) {
      return NextResponse.json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "parcel_id and message are required"
        }
      }, { status: 400 });
    }

    // Validate message length
    if (message.length < 10 || message.length > 1000) {
      return NextResponse.json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Message must be between 10 and 1000 characters"
        }
      }, { status: 400 });
    }

    // Check if parcel exists
    const { data: parcel, error: parcelError } = await supabaseServer
      .from("parcels")
      .select("parcel_id")
      .eq("parcel_id", parcel_id)
      .single();

    if (parcelError || !parcel) {
      return NextResponse.json({
        success: false,
        error: {
          code: "PARCEL_NOT_FOUND",
          message: "Parcel not found"
        }
      }, { status: 404 });
    }

    // Check if user already has a pending objection for this parcel
    const { data: existingObjection } = await supabaseServer
      .from("objections")
      .select("id")
      .eq("parcel_id", parcel_id)
      .eq("user_id", user.id)
      .eq("status", "PENDING")
      .single();

    if (existingObjection) {
      return NextResponse.json({
        success: false,
        error: {
          code: "DUPLICATE_OBJECTION",
          message: "You already have a pending objection for this parcel"
        }
      }, { status: 400 });
    }

    // Create objection
    const { data: objection, error: objectionError } = await supabaseServer
      .from("objections")
      .insert({
        parcel_id,
        user_id: user.id,
        message,
        status: "PENDING"
      })
      .select()
      .single();

    if (objectionError) {
      console.error("Objection creation error:", objectionError);
      return NextResponse.json({
        success: false,
        error: {
          code: "CREATION_FAILED",
          message: "Failed to create objection"
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { objection }
    });

  } catch (error) {
    console.error("Objection creation error:", error);
    return NextResponse.json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred"
      }
    }, { status: 500 });
  }
}
