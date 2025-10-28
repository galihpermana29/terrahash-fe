import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";
import type { ApiResponse } from "@/lib/types/response";
import type { TransactionResponse } from "@/lib/types/transaction";
import {  submitMessageToTopic, TransferTokentoBuyer } from "@/lib/hedera/h";
/**
 * Create a new purchase transaction
 * This endpoint handles the complete purchase flow for web2
 * Web3 integration should be added by the web3 engineer
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TransactionResponse>>> {
  try {
    const supabase = supabaseServer;
    
    // Get authenticated user
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

    // Only PUBLIC users can buy land
    if (user.type !== "PUBLIC") {
      return NextResponse.json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only public users can purchase land"
        }
      }, { status: 403 });
    }

    // Parse request body
    const { listing_id } = await request.json();
    if (!listing_id) {
      return NextResponse.json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "listing_id is required"
        }
      }, { status: 400 });
    }

    // Get listing details with parcel and seller info
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select(`
        *,
        parcel:parcels!inner(
          parcel_id,
          area_m2,
          admin_region,
          owner_id,
          owner:users!parcels_owner_id_fkey(
            id,
            full_name,
            wallet_address
          )
        )
      `)
      .eq("id", listing_id)
      .eq("active", true)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({
        success: false,
        error: {
          code: "LISTING_NOT_FOUND",
          message: "Active listing not found"
        }
      }, { status: 404 });
    }

    // Check if user is not the owner
    if (listing.parcel.owner_id === user.id) {
      return NextResponse.json({
        success: false,
        error: {
          code: "INVALID_PURCHASE",
          message: "Cannot purchase your own land"
        }
      }, { status: 400 });
    }

    // Get buyer details
    const { data: buyer, error: buyerError } = await supabase
      .from("users")
      .select("id, full_name, wallet_address")
      .eq("id", user.id)
      .single();

    if (buyerError || !buyer) {
      return NextResponse.json({
        success: false,
        error: {
          code: "BUYER_NOT_FOUND",
          message: "Buyer information not found"
        }
      }, { status: 404 });
    }

    let txStatus = "SKIPPED";
    let status_hash: string | null = null;
    let transactionType = "PURCHASE"; // default for SALE

    if (listing.type === "SALE") {
      const result = await TransferTokentoBuyer(
        listing.parcel.parcel_id.split('-').pop()!,
        listing.parcel.owner.wallet_address,
        user.wallet_address
      );

      status_hash = result.status_hash;
      txStatus = result.status === "SUCCESS" ? "COMPLETED" : "FAILED";
      transactionType = "PURCHASE";
    }
    if (listing.type === "LEASE") {
      const leasePeriod = listing.lease_period;
      const startDate = new Date();

      // Defensive check for leasePeriod 
      let monthsToAdd = 0;
      switch (leasePeriod) {
      case "1_MONTH":
        monthsToAdd = 1;
        break;
      case "6_MONTHS":
        monthsToAdd = 6;
        break;
      case "12_MONTHS":
        monthsToAdd = 12;
        break;
      default:
        return NextResponse.json({
        success: false,
        error: {
          code: "INVALID_LEASE_PERIOD",
          message: `Unknown lease period: ${leasePeriod}`
        }
        }, { status: 400 });
      }

      // Calculate end date safely
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + monthsToAdd);

      // Defensive: listing.topic_id and listing.parcel.parcel_id existence
      if (!listing.parcel?.parcel_id) {
        return NextResponse.json({
          success: false,
          error: {
          code: "MISSING_PARCEL",
          message: "Lease topic or parcel id missing"
          }
        }, { status: 400 });
      }

      if (!listing.topic_id ) {
      return NextResponse.json({
        success: false,
        error: {
        code: "MISSING_TOPIC",
        message: "Lease topic or parcel id missing"
        }
      }, { status: 400 });
    }
      // For hedera submit
      const message = `Lease started by buyer ${buyer.wallet_address} from ${startDate.toISOString().replace('T', ' ').replace('Z', '').split('.')[0]} until ${endDate.toISOString().replace('T', ' ').replace('Z', '').split('.')[0]}`;

      let result;
      try {
      result = await submitMessageToTopic(
        listing.topic_id,
        message,
        listing.parcel.parcel_id
      );
      } catch (e) {
      console.error("submitMessageToTopic error:", e);
      return NextResponse.json({
        success: false,
        error: {
        code: "HEDERA_SUBMIT_FAILED",
        message: "Failed to submit lease message to Hedera"
        }
      }, { status: 500 });
      }

      status_hash = result?.transactionId || null;
      txStatus = result?.status === "SUCCESS" ? "COMPLETED" : "FAILED";
      transactionType = "LEASE";
    }

    // Save transaction in Supabase
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        listing_id: listing.id,
        buyer_id: buyer.id,
        seller_id: listing.parcel.owner_id,
        parcel_id: listing.parcel.parcel_id,
        type: transactionType,
        status: txStatus,
        amount_kes: listing.price_kes,
        transaction_hash: status_hash
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Supabase insert error:", transactionError);
      throw new Error("Transaction recording failed");
    }


    if (transactionError) {
      console.error("Transaction creation error:", transactionError);
      return NextResponse.json({
        success: false,
        error: {
          code: "TRANSACTION_FAILED",
          message: "Failed to create transaction"
        }
      }, { status: 500 });
    }

    if (txStatus === "COMPLETED" && listing.type === "SALE") {
      const { error: parcelUpdateError } = await supabase
        .from("parcels")
        .update({ 
          owner_id: buyer.id,
          status: "OWNED",
          updated_at: new Date().toISOString()
        })
        .eq("parcel_id", listing.parcel.parcel_id);

      if (parcelUpdateError) {
        console.error("Parcel update error:", parcelUpdateError);
      }
    }

    // Deactivate the listing
    const { error: listingUpdateError } = await supabase
      .from("listings")
      .update({ 
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", listing.id);

    if (listingUpdateError) {
      console.error("Listing update error:", listingUpdateError);
      // Don't fail the transaction, but log the error
    }

    // Return transaction response
    const response: TransactionResponse = {
      transaction,
      listing: {
        id: listing.id,
        type: listing.type,
        price_kes: listing.price_kes,
        seller_wallet: listing.parcel.owner.wallet_address,
        parcel: {
          parcel_id: listing.parcel.parcel_id,
          area_m2: listing.parcel.area_m2,
          admin_region: listing.parcel.admin_region
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("Purchase transaction error:", error);
    return NextResponse.json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred"
      }
    }, { status: 500 });
  }
}
