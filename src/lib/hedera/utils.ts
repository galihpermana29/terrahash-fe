import { AccountId, AccountInfoQuery } from "@hashgraph/sdk";
import { getHederaClient } from "./client";

export async function getHederaAccountIdFromEvmAddress(address: string) {
  if (!address) return null;

  try {
    const client = getHederaClient();
    const accountIdFromEvm = AccountId.fromEvmAddress(0, 0, address);
    const info = await new AccountInfoQuery()
      .setAccountId(accountIdFromEvm)
      .execute(client);
    return info.accountId.toString(); 
  } catch (err: any) {
    return null;
  }
}
