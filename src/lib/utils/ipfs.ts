import { PinataSDK } from "pinata";

export async function uploadMemoDataToIPFS(memoData: Record<string, any>) {
  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT!;
  const pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

  if (!pinataJwt) throw new Error("Missing Pinata JWT in .env");

  const pinata = new PinataSDK({
    pinataJwt,
    pinataGateway,
  });

  try {
    // upload metadata JSON ke IPFS (public)
    const upload = await pinata.upload.public.json(memoData);

    const cid = upload.cid || upload.id;
    return {
      metadataIpfsUri: `ipfs://${cid}`,
      metadataGatewayUrl: `https://${pinataGateway}/ipfs/${cid}`,
    };
  } catch (err) {
    console.error("[uploadMemoDataToIPFS] Error uploading:", err);
    throw new Error("Failed to upload metadata to IPFS via Pinata SDK");
  }
}
