import { AccountId, AccountInfoQuery, TopicCreateTransaction, TopicUpdateTransaction } from "@hashgraph/sdk";
import { getHederaClient } from "./client";

const client = getHederaClient(); // singleton client

export async function getHederaAccountIdFromEvmAddress(address: string) {
  if (!address) return null;

  try {
    const accountIdFromEvm = AccountId.fromEvmAddress(0, 0, address);
    const info = await new AccountInfoQuery()
      .setAccountId(accountIdFromEvm)
      .execute(client);
    return info.accountId.toString(); 
  } catch (err: any) {
    return null;
  }
}

export async function createTopicWithMemo(memo: string): Promise<string> {
  try {
    const tx = new TopicCreateTransaction().setTopicMemo(memo);
    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);
    return receipt.topicId!.toString();
  } catch (err: any) {
    console.error("Failed to create Hedera topic:", err);
    throw new Error("Could not create Hedera topic");
  }
}

export async function updateTopicMemo(topicId: string, memo: string): Promise<void> {
  try {
    const tx = new TopicUpdateTransaction()
      .setTopicId(topicId)
      .setTopicMemo(memo);

    const response = await tx.execute(client);
    await response.getReceipt(client);
    console.log("[Hedera] Topic memo updated:", topicId);
  } catch (err: any) {
    console.error("[Hedera] Failed to update topic memo:", err);
    throw new Error("Could not update Hedera topic memo");
  }
}