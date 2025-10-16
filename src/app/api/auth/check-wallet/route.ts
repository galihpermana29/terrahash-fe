import { supabaseServer } from "@/lib/supabase/server";
import { User } from "@/lib/types/user";
import { errorResponse, successResponse } from "@/lib/utils/response";
import { NextRequest, NextResponse } from "next/server";

//   const response = await fetch(`/api/auth/check-wallet?address=${address}`);
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return errorResponse(
      "WALLET_ADDRESS_REQUIRED",
      "Wallet address is required",
      null,
      400
    );
  }

  const loweredAddress = address.toLowerCase();

  const isRootWallet = address === process.env.ROOT_ADMIN_WALLETS;

  if (isRootWallet) {
    const rootUser = {
      wallet_address: address,
      type: "ROOT" as User["type"],
      full_name: "Root User",
      id: "root",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return successResponse({
      user: rootUser,
      exists: true,
      message: "Wallet checked successfully",
    });
  }
  console.log(loweredAddress, "checking address?");
  try {
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("wallet_address", loweredAddress);
    if (error) throw error;
    return successResponse({
      user,
      exists: user.length > 0,
      message: "Wallet checked successfully",
    });
  } catch (error) {
    console.error("Error checking wallet:", error);
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to check wallet",
      null,
      500
    );
  }
}
