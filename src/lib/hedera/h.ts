import { AccountId, AccountInfoQuery, TokenMintTransaction, TransferTransaction, TokenUpdateNftsTransaction, TokenAssociateTransaction, PrivateKey, NftId } from "@hashgraph/sdk";
import Long from "long";
import { getHederaClient } from "./client";
import { TransactionId } from "@hashgraph/sdk";

const { client, operatorKey, nftTokenId: NFT_TOKEN_ID, treasuryAccountId, metadataKey } = getHederaClient();
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

export function getEvmAddressFromHederaAccountId(accountId: string) {
  if (!accountId) return null;

  try {
    const rawEvm = AccountId.fromString(accountId).toEvmAddress();
    const evmAddress = "0x" + rawEvm;
    return evmAddress;
  } catch (err) {
    return null;
  }
}

export async function TransferToken(serialNumber: string, senderAccountId: AccountId, receiverAccountId: AccountId) {
    try {
      const transferTx = await new TransferTransaction()
        .addNftTransfer(NFT_TOKEN_ID, serialNumber, senderAccountId, receiverAccountId)
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

export async function TransferTokentoBuyer(serialNumber: string, senderAccountId: AccountId, receiverAccountId: AccountId) {
    try {
      const nftId = NftId.fromString(`${NFT_TOKEN_ID}/${serialNumber}`);
      const transferTx = await new TransferTransaction()
        .addApprovedNftTransfer(nftId, senderAccountId, receiverAccountId)
        .setTransactionId(TransactionId.generate(treasuryAccountId))
        .sign(operatorKey);

      const transferResponse = await transferTx.execute(client);
      const receipt = await transferResponse.getReceipt(client);
      return receipt.status.toString();
    } catch (err) {
      console.log(err);
      throw new Error("Could not transfer NFT");
    }
}

export async function mintNFT(memo: string, owner_wallet: any): Promise<string> {
  try {
    const receiverAccountId = AccountId.fromString(owner_wallet);

    const mintTx = await new TokenMintTransaction()
      .setTokenId(NFT_TOKEN_ID)
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
      .setTokenId(NFT_TOKEN_ID)
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

