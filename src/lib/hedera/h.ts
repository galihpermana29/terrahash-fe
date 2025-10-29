import { AccountId, AccountInfoQuery, TokenMintTransaction, TransferTransaction, TokenUpdateNftsTransaction, TokenAssociateTransaction, PrivateKey, NftId, TopicCreateTransaction, TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import Long from "long";
import { getHederaClient } from "./client";
import { TransactionId } from "@hashgraph/sdk";

const { client, operatorKey, nftTokenId, treasuryAccountId, metadataKey } = getHederaClient();
const TREASURY_ID = AccountId.fromString(treasuryAccountId);
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

export function getEvmAddressFromHederaAccountId(accountId: string): string | null {
  if (!accountId) return null;

  try {
    const evmAddress = AccountId.fromString(accountId).toEvmAddress();
    // Add 0x prefix for standard EVM address format
    return `0x${evmAddress}`;
  } catch (err) {
    return null;
  }
}


export async function TransferToken(serialNumber: string, senderAccountId: AccountId, receiverAccountId: AccountId) {
    try {
      const transferTx = await new TransferTransaction()
        .addNftTransfer(nftTokenId, serialNumber, senderAccountId, receiverAccountId)
        .freezeWith(client)
        .sign(operatorKey);

      const transferResponse = await transferTx.execute(client);
      const receipt = await transferResponse.getReceipt(client);
      return receipt.status.toString();
    } catch (err) {
      console.log(err);
      throw new Error("Could not transfer NFT");
    }
}

export async function TransferTokentoBuyer(serialNumber: string, senderAccountId: string, receiverAccountId: string) {
    try {
      const nftId = NftId.fromString(`${nftTokenId}/${serialNumber}`);
      const sender = AccountId.fromString(senderAccountId);
      const receiver = AccountId.fromString(receiverAccountId);
      const transferTx = await new TransferTransaction()
        .addApprovedNftTransfer(nftId, sender, receiver)
        .setTransactionId(TransactionId.generate(TREASURY_ID))
        .freezeWith(client)
        .sign(operatorKey);

      const transferResponse = await transferTx.execute(client);
      const receipt = await transferResponse.getReceipt(client);
      const hash = transferResponse.transactionId.toString();
      const status = receipt.status.toString();
      return { status_hash: hash, status };
    } catch (err) {
      console.log(err);
      throw new Error("Could not transfer NFT");
    }
}

export async function mintNFT(memo: string, owner_wallet: any): Promise<string> {
  try {
    const receiverAccountId = AccountId.fromString(owner_wallet);

    const mintTx = await new TokenMintTransaction()
      .setTokenId(nftTokenId)
      .setMetadata([Buffer.from(memo)])
      .freezeWith(client)
      .sign(operatorKey);

    const mintResponse = await mintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);
    const serialNumber = mintReceipt.serials[0].toString();

    if (receiverAccountId.toString() !== treasuryAccountId) {
      await TransferToken(serialNumber, TREASURY_ID, receiverAccountId);
    }
    
    return serialNumber;
  } catch (err: any) {
    throw new Error("Could not mint and transfer NFT");
  }
}

export async function updateNFTMetadata(serialNumber: string, newMetadata: string, owner_wallet: any, status : string): Promise<string> {
  try {
    const metadataBuffer = Buffer.from(newMetadata);
    const receiverAccountId = AccountId.fromString(owner_wallet);

    const tx = new TokenUpdateNftsTransaction()
      .setTokenId(nftTokenId)
      .setSerialNumbers([Long.fromString(serialNumber)])
      .setMetadata(metadataBuffer)
      .freezeWith(client);

    const signedTx = await tx.sign(metadataKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);
  
    if (status === 'OWNED') {
      if (owner_wallet && owner_wallet !== treasuryAccountId) {
        await TransferToken(serialNumber, TREASURY_ID, receiverAccountId);
      }
    }
    return receipt.status.toString();
  } catch (err: any) {
    throw new Error("Could not update NFT metadata");
  }
}

export async function createTopicWithMemo(memo: string) {
  try {
    const tx = new TopicCreateTransaction()
      .setTopicMemo(memo)
      .setAdminKey(operatorKey.publicKey);
    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);
    const topicId = receipt.topicId.toString();
    return topicId;
  } catch (err: any) {
    console.error("Failed to create Hedera topic:", err);
    throw new Error("Could not create Hedera topic");
  }
}

export async function submitMessageToTopic(topicId: string, message: string, parcelId: string) {
  try {
    const tx = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .setTransactionMemo(`Land : ${parcelId}`);

    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);

    return {
      transactionId: response.transactionId.toString(),
      status: receipt.status.toString(),
    };
  } catch (err: any) {
    console.error(`Failed to submit message to topic ${topicId}:`, err);
    throw new Error("Could not submit message to Hedera topic");
  }
}