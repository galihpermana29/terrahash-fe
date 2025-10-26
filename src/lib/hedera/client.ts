import { AccountId, PrivateKey, Client } from "@hashgraph/sdk";

let client: Client | null = null;
let operatorKey: PrivateKey | null = null;

export function getHederaClient() {
  if (!client) {
    const accountId = AccountId.fromString(process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID!);
    operatorKey = PrivateKey.fromStringECDSA(process.env.NEXT_PUBLIC_HEDERA_OPERATOR_KEY!);

    client = Client.forTestnet(); // nanti Client.forMainnet() pas deploy
    client.setOperator(accountId, operatorKey);
  }

  return { client, operatorKey };
}
