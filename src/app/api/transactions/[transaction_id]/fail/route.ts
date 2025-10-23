import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";

/**
 * PUT /api/transactions/:id/fail
 * Mark a transaction as failed
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

    // Get transaction
    const { data: transaction, error: transactionError } = await supabaseServer
      .from("transactions")
      .select("*")
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

    // Only buyer can mark transaction as failed
    if (transaction.buyer_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only the buyer can mark this transaction as failed",
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

    // Update transaction status to FAILED
    const { data: updatedTransaction, error: updateError } = await supabaseServer
      .from("transactions")
      .update({
        status: "FAILED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: updateError.message },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { transaction: updatedTransaction },
    });
  } catch (error) {
    console.error("Error in PUT /api/transactions/:id/fail:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}
