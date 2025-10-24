import { useState, useEffect } from "react";
import { getTransactions, getGovernmentTransactions } from "@/client-action/transaction";
import type { TransactionWithDetails } from "@/lib/types/transaction";

interface UseTransactionsResult {
  transactions: TransactionWithDetails[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching user transactions
 */
export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getTransactions();
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      } else {
        setError(response.error?.message || "Failed to fetch transactions");
      }
    } catch (err) {
      setError("An error occurred while fetching transactions");
      console.error("Transaction fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}

/**
 * Hook for fetching government transactions (admin only)
 */
export function useGovernmentTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getGovernmentTransactions();
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      } else {
        setError(response.error?.message || "Failed to fetch government transactions");
      }
    } catch (err) {
      setError("An error occurred while fetching government transactions");
      console.error("Government transaction fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
