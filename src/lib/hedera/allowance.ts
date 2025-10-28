export type HederaNetwork = 'mainnet' | 'testnet' | 'previewnet'

const SNAP_ID = 'npm:@hashgraph/hedera-wallet-snap'

interface ApproveNftAllowanceParams {
  network?: HederaNetwork
  spenderAccountId: string
  nftTokenId: string   // e.g. "0.0.57894"
  serialNumbers?: number[]
  approveAll?: boolean
}

export async function connectHederaSnap() {
  try {
    await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: {
        [SNAP_ID]: {
          version: '*', // atau versi spesifik
        },
      },
    })
    console.log('Hedera Snap connected')
  } catch (error) {
    console.error('Failed to connect Snap:', error)
    throw new Error('Please install Hedera Wallet Snap in MetaMask')
  }
}
export async function approveNftAllowance({
  network = 'testnet',
  spenderAccountId,
  nftTokenId,
  approveAll = true,
}: ApproveNftAllowanceParams) {
  if (!window.ethereum) throw new Error('MetaMask is not available')
  if (!spenderAccountId) throw new Error('Missing spenderAccountId')
  if (!nftTokenId) throw new Error('Missing nftTokenId')

  const params = {
    network,
    spenderAccountId,
    assetType: 'NFT',
    amount: 1, 
    assetDetail: {
      assetId: nftTokenId,
      all: approveAll,
    },
  }

  try {
    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: SNAP_ID,
        request: {
          method: 'approveAllowance',
          params,
        },
      },
    })

    console.log('[Hedera] ✅ NFT allowance approved:', result)
    return result
  } catch (error: any) {
    console.error('[Hedera] ❌ approveNftAllowance error:', error)
    throw new Error(error?.message || 'Failed to approve NFT allowance')
  }
}
