import { AccountId, AccountInfoQuery, TokenMintTransaction, TransferTransaction, TopicCreateTransaction, TopicUpdateTransaction } from "@hashgraph/sdk";
import { getHederaClient } from "./client";

const { client, operatorKey, nftTokenId, treasuryAccountId } = getHederaClient();
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

export async function mintNFT(memo: string, owner_wallet: any): Promise<string> {
  try {
    const mintTransaction = await new TokenMintTransaction()
      .setTokenId(nftTokenId)
      .setMetadata([Buffer.from(memo)])
      .freezeWith(client)
      .sign(operatorKey);

    const mintResponse = await mintTransaction.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);
    const serialNumber = mintReceipt.serials[0].toString();

    const transferTransaction = await new TransferTransaction()
      .addNftTransfer(nftTokenId, serialNumber, treasuryAccountId, AccountId.fromString(owner_wallet))
      .freezeWith(client)
      .sign(operatorKey);

    const transferResponse = await transferTransaction.execute(client);
    await transferResponse.getReceipt(client);
    return serialNumber;
  } catch (err: any) {
    console.error("Failed to mint and transfer NFT:", err);
    throw new Error("Could not mint and transfer NFT");
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