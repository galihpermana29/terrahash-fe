-- =============================================================================
-- Migration: Add lease payment period and update listings table
-- Date: 2025-01-20
-- Description: 
--   - Add lease_period column for recurring payment options
--   - Remove contact_email (only use contact_phone)
--   - Add constraint to ensure lease_period is required for LEASE type
--   - Add unique constraint to enforce only one active listing per parcel
-- =============================================================================

-- Add lease_period column
ALTER TABLE listings
  ADD COLUMN lease_period TEXT CHECK (lease_period IN ('1_MONTH', '6_MONTHS', '12_MONTHS'));

-- Drop contact_email column (not needed)
ALTER TABLE listings
  DROP COLUMN IF EXISTS contact_email;

-- Add constraint: lease_period is required when type is LEASE
ALTER TABLE listings
  ADD CONSTRAINT lease_period_required 
  CHECK (
    (type = 'LEASE' AND lease_period IS NOT NULL) OR 
    (type = 'SALE' AND lease_period IS NULL)
  );

-- Add unique constraint: only one active listing per parcel
-- This prevents multiple active listings for the same parcel
CREATE UNIQUE INDEX idx_unique_active_listing_per_parcel 
  ON listings (parcel_id) 
  WHERE active = TRUE;

-- Add comment to clarify price_kes meaning for LEASE type
COMMENT ON COLUMN listings.price_kes IS 'For SALE: one-time price. For LEASE: price per month (multiply by lease_period for total)';

-- Add comment to clarify lease_period
COMMENT ON COLUMN listings.lease_period IS 'Payment recurring period for LEASE type: 1_MONTH (monthly), 6_MONTHS (every 6 months), 12_MONTHS (yearly)';
