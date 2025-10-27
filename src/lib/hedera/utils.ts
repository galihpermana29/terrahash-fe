import { AccountId, AccountInfoQuery, TokenMintTransaction, TransferTransaction, TokenUpdateNftsTransaction, TokenAssociateTransaction, PrivateKey } from "@hashgraph/sdk";
import Long from "long";
import { getHederaClient } from "./client";
import { stat } from "fs";

const { client, operatorKey, nftTokenId, treasuryAccountId, metadataKey } = getHederaClient();
const treasuryAccountIdObj = AccountId.fromString(treasuryAccountId);
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
      const transferTx = await new TransferTransaction()
        .addNftTransfer(nftTokenId, serialNumber, treasuryAccountIdObj, receiverAccountId)
        .freezeWith(client)
        .sign(operatorKey);

      const transferResponse = await transferTx.execute(client);
      await transferResponse.getReceipt(client);
    }
    
    return serialNumber;
  } catch (err: any) {
    throw new Error("Could not mint and transfer NFT");
  }
}

export async function updateNFTMetadata(serialNumber: string, newMetadata: string, owner_wallet: any, status : string): Promise<string> {
  try {
    const metadataBuffer = Buffer.from(newMetadata);
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
        const receiverAccountId = AccountId.fromString(owner_wallet);
        const transferTx = await new TransferTransaction()
          .addNftTransfer(nftTokenId, serialNumber, treasuryAccountIdObj, receiverAccountId)
          .freezeWith(client)
          .sign(operatorKey);

        const transferResponse = await transferTx.execute(client);
        await transferResponse.getReceipt(client);
      }
    }
    return receipt.status.toString();
  } catch (err: any) {
    throw new Error("Could not update NFT metadata");
  }
}