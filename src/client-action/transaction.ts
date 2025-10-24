import type { ApiResponse } from "@/lib/types/response";
import type {
  Transaction,
  TransactionWithDetails,
  CreateTransactionPayload,
  CompleteTransactionPayload,
  TransactionResponse,
} from "@/lib/types/transaction";

/**
 * Create a new purchase transaction (web2 + web3 placeholder)
 */
export async function createPurchaseTransaction(
  payload: CreateTransactionPayload
): Promise<ApiResponse<TransactionResponse>> {
  const response = await fetch("/api/transactions/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Complete a transaction with blockchain hash
 */
export async function completeTransaction(
  transactionId: string,
  payload: CompleteTransactionPayload
): Promise<ApiResponse<{ transaction: Transaction }>> {
  const response = await fetch(`/api/transactions/${transactionId}/complete`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Mark transaction as failed
 */
export async function failTransaction(
  transactionId: string,
  reason?: string
): Promise<ApiResponse<{ transaction: Transaction }>> {
  const response = await fetch(`/api/transactions/${transactionId}/fail`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  return response.json();
}

/**
 * Get user transactions
 */
export async function getTransactions(): Promise<
  ApiResponse<{ transactions: TransactionWithDetails[]; count: number }>
> {
  const response = await fetch("/api/transactions", {
    method: "GET",
  });

  return response.json();
}

/**
 * Get specific transaction
 */
export async function getTransaction(
  transactionId: string
): Promise<ApiResponse<{ transaction: TransactionWithDetails }>> {
  const response = await fetch(`/api/transactions/${transactionId}`, {
    method: "GET",
  });

  return response.json();
}

/**
 * Get all transactions (Government only)
 */
export async function getGovernmentTransactions(): Promise<
  ApiResponse<{ transactions: TransactionWithDetails[]; count: number }>
> {
  const response = await fetch("/api/transactions/gov", {
    method: "GET",
  });

  return response.json();
}

// ============================================================================
// WEB3 INTEGRATION PLACEHOLDERS
// ============================================================================
// TODO: These functions should be implemented by the web3 engineer
// They will handle Hedera smart contract interactions

/**
 * PLACEHOLDER: Connect to user's wallet
 * @returns Promise<{address: string, connected: boolean}>
 */
export async function connectWallet(): Promise<{address: string, connected: boolean}> {
  // TODO: Implement Hedera wallet connection (HashPack, Blade, etc.)
  console.log("🔗 [WEB3 PLACEHOLDER] Connect wallet");
  throw new Error("Web3 integration not implemented yet");
}

/**
 * PLACEHOLDER: Execute smart contract purchase transaction
 * @param listingId - The listing to purchase
 * @param buyerWallet - Buyer's wallet address
 * @param sellerWallet - Seller's wallet address
 * @param amountKes - Purchase amount in KES
 * @returns Promise<{transactionHash: string, success: boolean}>
 */
export async function executeWeb3Purchase(
  listingId: string,
  buyerWallet: string,
  sellerWallet: string,
  amountKes: number
): Promise<{transactionHash: string, success: boolean}> {
  // TODO: Implement Hedera smart contract call for land purchase
  console.log("💰 [WEB3 PLACEHOLDER] Execute purchase:", {
    listingId,
    buyerWallet,
    sellerWallet,
    amountKes
  });
  throw new Error("Web3 smart contract integration not implemented yet");
}

/**
 * PLACEHOLDER: Verify transaction on blockchain
 * @param transactionHash - Hash to verify
 * @returns Promise<{verified: boolean, status: 'completed' | 'failed'}>
 */
export async function verifyWeb3Transaction(
  transactionHash: string
): Promise<{verified: boolean, status: 'completed' | 'failed'}> {
  // TODO: Verify transaction on Hedera network
  console.log("✅ [WEB3 PLACEHOLDER] Verify transaction:", transactionHash);
  throw new Error("Web3 verification not implemented yet");
}
