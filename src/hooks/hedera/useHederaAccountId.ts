import useSWR from "swr";
import { getHederaAccountIdFromEvmAddress } from "@/lib/hedera/h";

export function useHederaAccountId(address?: string) {
  const shouldFetch = typeof address === "string" && address.startsWith("0x");

  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/hedera/account/${address.toLowerCase()}` : null,
    async () => {
      const id = await getHederaAccountIdFromEvmAddress(address.toLowerCase());
      return id;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    }
  );

  return {
    hederaAccountId: data ?? null,
    isLoading,
    error,
  };
}
