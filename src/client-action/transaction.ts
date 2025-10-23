import type { ApiResponse } from "@/lib/types/response";
import type {
  Transaction,
  TransactionWithDetails,
  CreateTransactionPayload,
  CompleteTransactionPayload,
  TransactionResponse,
} from "@/lib/types/transaction";

/**
 * Initiate a new transaction
 */
export async function initiateTransaction(
  payload: CreateTransactionPayload
): Promise<ApiResponse<TransactionResponse>> {
  const response = await fetch("/api/transactions/initiate", {
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
