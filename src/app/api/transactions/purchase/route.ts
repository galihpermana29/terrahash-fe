import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/session";
import type { ApiResponse } from "@/lib/types/response";
import type { TransactionResponse } from "@/lib/types/transaction";

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

    // Validate listing type (only SALE for now)
    if (listing.type !== "SALE") {
      return NextResponse.json({
        success: false,
        error: {
          code: "INVALID_LISTING_TYPE",
          message: "Only SALE listings are supported currently"
        }
      }, { status: 400 });
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

    // Create transaction with COMPLETED status (web2 only for now)
    // TODO: Web3 engineer should modify this to handle blockchain transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        listing_id: listing.id,
        buyer_id: buyer.id,
        seller_id: listing.parcel.owner_id,
        parcel_id: listing.parcel.parcel_id,
        type: "PURCHASE",
        status: "COMPLETED", // For web2 flow - web3 engineer should change this logic
        amount_kes: listing.price_kes,
        // transaction_hash will be added by web3 integration
      })
      .select()
      .single();

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

    // TODO: Web3 integration point
    // The web3 engineer should:
    // 1. Create transaction with "PENDING" status initially
    // 2. Execute smart contract transaction on Hedera
    // 3. Update transaction with blockchain hash and final status
    console.log("🔗 [WEB3 TODO] Execute blockchain transaction:", {
      transactionId: transaction.id,
      buyerWallet: buyer.wallet_address,
      sellerWallet: listing.parcel.owner.wallet_address,
      amount: listing.price_kes,
      parcelId: listing.parcel.parcel_id
    });

    // Update parcel ownership (for web2 flow)
    // TODO: Web3 engineer should move this to after blockchain confirmation
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
      // Don't fail the transaction, but log the error
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
