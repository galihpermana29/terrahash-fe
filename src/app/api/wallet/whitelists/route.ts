import { supabaseServer } from "@/lib/supabase/server";
import { errorResponse, successResponse } from "@/lib/utils/response";
import { getCurrentUser } from "@/lib/utils/session";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("NOT_AUTHENTICATED", "Not authenticated", null, 401);
  }

  if (user.type !== "ROOT") {
    return errorResponse("FORBIDDEN", "Forbidden", null, 403);
  }

  try {
    const { data: whitelists, error } = await supabaseServer
      .from("gov_whitelist")
      .select(
        `*,
        users:user_id (*)`
      )
      .order("added_at", { ascending: false });

    if (error) {
      return errorResponse(
        "SERVER_ERROR",
        "Failed to get whitelists",
        null,
        500
      );
    }

    return successResponse({
      whitelists,
    });
  } catch (error) {
    return errorResponse("SERVER_ERROR", "Failed to get whitelists", null, 500);
  }
}

// create or add whitelisted address
// payload: { wallet_address: string, full_name: string }
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("NOT_AUTHENTICATED", "Not authenticated", null, 401);
  }

  if (user.type !== "ROOT") {
    return errorResponse("FORBIDDEN", "Forbidden", null, 403);
  }

  try {
    const { wallet_address, full_name } = await request.json();

    // check is wallet already in user table
    const { data: userExist, error: userExistError } = await supabaseServer
      .from("users")
      .select("*")
      .eq("wallet_address", wallet_address?.toLowerCase())
      .single();

    if (userExist) {
      return errorResponse("USER_EXISTS", "User already exists", null, 400);
    }

    // add user to table
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .insert({
        wallet_address: wallet_address?.toLowerCase(),
        full_name,
        type: "GOV",
      })
      .select()
      .single();

    if (userError) {
      return errorResponse("SERVER_ERROR", "Failed to add user", null, 500);
    }

    const { error } = await supabaseServer
      .from("gov_whitelist")
      .insert({
        user_id: user.id,
        status: "ACTIVE",
      })
      .select("*")
      .single();

    if (error) {
      return errorResponse(
        "SERVER_ERROR",
        "Failed to add whitelist",
        null,
        500
      );
    }

    return successResponse({
      user,
    });
  } catch (error) {
    return errorResponse("SERVER_ERROR", "Failed to add whitelist", null, 500);
  }
}

// toggle status
// payload: { status: string }
// query user_id?user_id=123
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("NOT_AUTHENTICATED", "Not authenticated", null, 401);
  }

  if (user.type !== "ROOT") {
    return errorResponse("FORBIDDEN", "Forbidden", null, 403);
  }

  try {
    const { status } = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");

    if (!status) {
      return errorResponse("STATUS_REQUIRED", "Status is required", null, 400);
    }

    if (!user_id) {
      return errorResponse(
        "USER_ID_REQUIRED",
        "User ID is required",
        null,
        400
      );
    }

    if (status !== "ACTIVE" && status !== "REVOKED") {
      return errorResponse("INVALID_STATUS", "Invalid status", null, 400);
    }

    const { error } = await supabaseServer
      .from("gov_whitelist")
      .update({
        status,
      })
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.log(error);
      return errorResponse(
        "SERVER_ERROR",
        "Failed to update whitelist",
        null,
        500
      );
    }

    return successResponse({
      user,
    });
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      "Failed to update whitelist",
      null,
      500
    );
  }
}

// update whitelist status
// payload: { wallet_address: string, status: string, full_name: string }
// export async function PUT(request: NextRequest) {
//   const user = await getCurrentUser();

//   if (!user) {
//     return errorResponse("NOT_AUTHENTICATED", "Not authenticated", null, 401);
//   }

//   if (user.type !== "ROOT") {
//     return errorResponse("FORBIDDEN", "Forbidden", null, 403);
//   }

//   try {
//     const { wallet_address, status, full_name } = await request.json();

//     const { data: user, error: userError } = await supabaseServer
//       .from("users")
//       .update({
//         wallet_address,
//         full_name,
//         type: "GOV",
//       })
//       .select("*")
//       .single();

//     if (userError) {
//       return errorResponse("SERVER_ERROR", "Failed to update user", null, 500);
//     }

//     const { error } = await supabaseServer
//       .from("gov_whitelist")
//       .update({
//         wallet_address,
//         user_id: user.id,
//         status,
//       })
//       .select("*")
//       .single();

//     if (error) {
//       return errorResponse(
//         "SERVER_ERROR",
//         "Failed to update whitelist",
//         null,
//         500
//       );
//     }

//     return successResponse({
//       user,
//     });
//   } catch (error) {
//     return errorResponse(
//       "SERVER_ERROR",
//       "Failed to update whitelist",
//       null,
//       500
//     );
//   }
// }
