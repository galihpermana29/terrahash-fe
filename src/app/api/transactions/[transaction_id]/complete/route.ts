import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";

/**
 * PUT /api/transactions/:id/complete
 * Complete a transaction with blockchain hash and transfer ownership
 */
export async function PUT(
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
    const body = await request.json();
    const { transaction_hash } = body;

    if (!transaction_hash) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "transaction_hash is required",
          },
        },
        { status: 400 }
      );
    }

    // Get transaction with related data
    const { data: transaction, error: transactionError } = await supabaseServer
      .from("transactions")
      .select(
        `
        *,
        listing:listings!listing_id (
          id,
          active,
          parcel_id
        )
      `
      )
      .eq("id", transaction_id)
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Transaction not found" },
        },
        { status: 404 }
      );
    }

    // Only buyer can complete the transaction
    if (transaction.buyer_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only the buyer can complete this transaction",
          },
        },
        { status: 403 }
      );
    }

    // Transaction must be in INITIATED status
    if (transaction.status !== "INITIATED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Transaction is already ${transaction.status.toLowerCase()}`,
          },
        },
        { status: 400 }
      );
    }

    // Check if transaction hash is already used
    const { data: existingTx } = await supabaseServer
      .from("transactions")
      .select("id")
      .eq("transaction_hash", transaction_hash)
      .neq("id", transaction_id)
      .single();

    if (existingTx) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Transaction hash already used",
          },
        },
        { status: 400 }
      );
    }

    // Perform atomic ownership transfer
    const { error: updateError } = await supabaseServer.rpc(
      "complete_land_purchase",
      {
        p_transaction_id: transaction_id,
        p_transaction_hash: transaction_hash,
        p_buyer_id: transaction.buyer_id,
        p_parcel_id: transaction.parcel_id,
        p_listing_id: transaction.listing_id,
      }
    );

    if (updateError) {
      console.error("Error completing transaction:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: updateError.message },
        },
        { status: 500 }
      );
    }

    // Get updated transaction
    const { data: updatedTransaction, error: fetchError } = await supabaseServer
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .single();

    if (fetchError) {
      console.error("Error fetching updated transaction:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: fetchError.message },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { transaction: updatedTransaction },
    });
  } catch (error) {
    console.error("Error in PUT /api/transactions/:id/complete:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
