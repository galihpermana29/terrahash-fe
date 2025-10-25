import { AccountId, PrivateKey, Client } from "@hashgraph/sdk";

let client: Client | null = null;

export function getHederaClient() {
  if (!client) {
    const accountId = AccountId.fromString(process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID!);
    const privateKey = PrivateKey.fromStringECDSA(process.env.NEXT_PUBLIC_HEDERA_OPERATOR_KEY!);

    client = Client.forTestnet(); // Ganti jadi Client.forMainnet() kalau lo deploy nanti
    client.setOperator(accountId, privateKey);
  }

  return client;
}
