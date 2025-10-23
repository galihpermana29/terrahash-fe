-- Migration: Create transaction completion function
-- Created: 2025-10-24

BEGIN;

-- Function to atomically complete land purchase transaction
CREATE OR REPLACE FUNCTION complete_land_purchase(
  p_transaction_id UUID,
  p_transaction_hash VARCHAR,
  p_buyer_id UUID,
  p_parcel_id VARCHAR,
  p_listing_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Update transaction with hash and status
  UPDATE transactions 
  SET 
    transaction_hash = p_transaction_hash,
    status = 'COMPLETED',
    updated_at = NOW()
  WHERE id = p_transaction_id;

  -- Transfer parcel ownership
  UPDATE parcels 
  SET 
    owner_id = p_buyer_id,
    updated_at = NOW()
  WHERE parcel_id = p_parcel_id;

  -- Deactivate the listing
  UPDATE listings 
  SET 
    active = false,
    updated_at = NOW()
  WHERE id = p_listing_id;

  -- Verify all updates succeeded
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to complete land purchase transaction';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION complete_land_purchase IS 'Atomically complete land purchase: update transaction, transfer ownership, deactivate listing';

COMMIT;
