-- Migration: Add owner_id to listings table with sync trigger
-- Created: 2025-10-24

BEGIN;

-- Step 1: Add owner_id column (nullable initially to allow data population)
ALTER TABLE listings 
ADD COLUMN owner_id UUID;

-- Step 2: Create index for performance (before populating data)
CREATE INDEX idx_listings_owner_id ON listings(owner_id);

-- Step 3: Populate owner_id from parcels table
UPDATE listings 
SET owner_id = parcels.owner_id 
FROM parcels 
WHERE listings.parcel_id = parcels.parcel_id;

-- Step 4: Make owner_id NOT NULL and add foreign key constraint
ALTER TABLE listings 
ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE listings 
ADD CONSTRAINT fk_listings_owner 
FOREIGN KEY (owner_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Step 5: Create function to automatically sync owner_id when parcel_id changes
CREATE OR REPLACE FUNCTION sync_listing_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Get owner_id from parcels table
  SELECT owner_id INTO NEW.owner_id 
  FROM parcels 
  WHERE parcel_id = NEW.parcel_id;
  
  -- Raise error if parcel doesn't exist or has no owner
  IF NEW.owner_id IS NULL THEN
    RAISE EXCEPTION 'Cannot create/update listing: parcel_id % not found or has no owner', NEW.parcel_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to sync owner_id on INSERT or UPDATE
CREATE TRIGGER sync_listing_owner_trigger
BEFORE INSERT OR UPDATE OF parcel_id ON listings
FOR EACH ROW
EXECUTE FUNCTION sync_listing_owner();

-- Step 7: Add comment for documentation
COMMENT ON COLUMN listings.owner_id IS 'Denormalized owner_id from parcels table for query performance. Automatically synced via trigger.';

COMMIT;