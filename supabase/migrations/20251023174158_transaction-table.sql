-- Migration: Create transactions table for Web3 land purchases
-- Created: 2025-10-24

BEGIN;

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core transaction data
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parcel_id VARCHAR NOT NULL REFERENCES parcels(parcel_id) ON DELETE CASCADE,
  
  -- Transaction details
  type VARCHAR NOT NULL DEFAULT 'PURCHASE' CHECK (type IN ('PURCHASE')),
  status VARCHAR NOT NULL CHECK (status IN ('INITIATED', 'COMPLETED', 'FAILED')),
  amount_kes DECIMAL(15,2) NOT NULL CHECK (amount_kes > 0),
  
  -- Web3 essentials
  transaction_hash VARCHAR,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_parcel_id ON transactions(parcel_id);
CREATE INDEX idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX idx_transactions_tx_hash ON transactions(transaction_hash) WHERE transaction_hash IS NOT NULL;
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at_trigger
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_updated_at();

-- Add constraints for business logic
ALTER TABLE transactions 
ADD CONSTRAINT check_buyer_seller_different 
CHECK (buyer_id != seller_id);

-- Ensure transaction_hash is unique when not null
CREATE UNIQUE INDEX idx_transactions_tx_hash_unique 
ON transactions(transaction_hash) 
WHERE transaction_hash IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE transactions IS 'Web3 cryptocurrency transactions for land purchases';
COMMENT ON COLUMN transactions.listing_id IS 'Reference to the listing being purchased';
COMMENT ON COLUMN transactions.buyer_id IS 'User who is purchasing the land';
COMMENT ON COLUMN transactions.seller_id IS 'User who owns/is selling the land';
COMMENT ON COLUMN transactions.parcel_id IS 'Parcel being purchased';
COMMENT ON COLUMN transactions.type IS 'Transaction type (currently only PURCHASE)';
COMMENT ON COLUMN transactions.status IS 'Transaction status: INITIATED, COMPLETED, or FAILED';
COMMENT ON COLUMN transactions.amount_kes IS 'Transaction amount in Kenyan Shillings';
COMMENT ON COLUMN transactions.transaction_hash IS 'Blockchain transaction hash for verification';

COMMIT;
