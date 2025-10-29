import { AccountId, PrivateKey, Client } from "@hashgraph/sdk";

let client: Client | null = null;
let operatorKey: PrivateKey | null = null;
let nftTokenId: string | null = null;
let metadataKey: PrivateKey | null = null;
let treasuryAccountId: string | null = null;

export function getHederaClient() {
  if (!client) {
    const operatorId = AccountId.fromString(process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID!);
    operatorKey = PrivateKey.fromStringECDSA(process.env.NEXT_PUBLIC_HEDERA_OPERATOR_KEY!);
    metadataKey = PrivateKey.fromStringED25519(process.env.NEXT_PUBLIC_HEDERA_METADATA_KEY!);
    treasuryAccountId = process.env.NEXT_PUBLIC_HEDERA_TREASURY_ID!;
    
    nftTokenId = process.env.NEXT_PUBLIC_HEDERA_NFT_ID!;
    client = Client.forTestnet(); 
    client.setOperator(operatorId, operatorKey);
  }

  return { client, operatorKey, nftTokenId, treasuryAccountId, metadataKey };
}
