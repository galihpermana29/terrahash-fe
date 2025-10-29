export type TransactionType = 'PURCHASE';

export type TransactionStatus = 'COMPLETED' | 'FAILED';

export interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  parcel_id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount_kes: number;
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  listing: {
    id: string;
    type: 'SALE' | 'LEASE';
    price_kes: number;
    active: boolean;
    parcel: {
      parcel_id: string;
      area_m2: number;
      admin_region: {
        country: string;
        state: string;
        city: string;
      };
      status: string;
    };
  };
  buyer: {
    id: string;
    full_name: string;
    wallet_address: string;
  };
  seller: {
    id: string;
    full_name: string;
    wallet_address: string;
  };
}

export interface CreateTransactionPayload {
  listing_id: string;
  payment_hash: string;
}

export interface CompleteTransactionPayload {
  transaction_hash: string;
}

export interface TransactionResponse {
  transaction: Transaction;
  listing: {
    id: string;
    type: 'SALE' | 'LEASE';
    price_kes: number;
    seller_wallet: string;
    parcel: {
      parcel_id: string;
      area_m2: number;
      admin_region: {
        country: string;
        state: string;
        city: string;
      };
    };
  };
}
