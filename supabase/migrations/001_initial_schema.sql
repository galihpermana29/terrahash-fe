-- =============================================================================
-- TERRAHASH - INITIAL DATABASE SCHEMA
-- =============================================================================
-- This migration creates all tables for the TerraHash land registry platform
-- Run this in Supabase SQL Editor or via supabase migration
-- =============================================================================

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================
-- Stores both PUBLIC and GOV users
-- Wallet address is the primary authentication method
-- =============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PUBLIC', 'GOV')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'All platform users (PUBLIC and GOV)';
COMMENT ON COLUMN users.wallet_address IS 'Ethereum/Hedera wallet address (0x...)';
COMMENT ON COLUMN users.type IS 'User type: PUBLIC for regular users, GOV for government admins';

-- =============================================================================
-- 2. GOV_WHITELIST TABLE
-- =============================================================================
-- Stores whitelisted wallet addresses for GOV users
-- When root admin whitelists a wallet, it creates both whitelist entry AND user
-- =============================================================================

CREATE TABLE gov_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  added_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gov_whitelist_wallet ON gov_whitelist(wallet_address);
CREATE INDEX idx_gov_whitelist_status ON gov_whitelist(status);
CREATE INDEX idx_gov_whitelist_added_by ON gov_whitelist(added_by);

COMMENT ON TABLE gov_whitelist IS 'Whitelist of government admin wallets';
COMMENT ON COLUMN gov_whitelist.user_id IS 'Reference to the GOV user created when whitelisted';

-- =============================================================================
-- 3. PARCELS TABLE
-- =============================================================================
-- Stores land parcels with geospatial data
-- Uses PostGIS for geometry storage and spatial queries
-- =============================================================================

CREATE TABLE parcels (
  parcel_id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'UNCLAIMED' CHECK (status IN ('UNCLAIMED', 'OWNED')),
  geometry_geojson TEXT NOT NULL, -- GeoJSON string for frontend compatibility
  geometry GEOMETRY(Polygon, 4326), -- PostGIS geometry for spatial queries
  area_m2 NUMERIC,
  admin_region JSONB, -- {country, state, city}
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parcels_owner ON parcels(owner_id);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_created_at ON parcels(created_at);
CREATE INDEX idx_parcels_geometry ON parcels USING GIST(geometry); -- Spatial index

-- Update trigger
CREATE TRIGGER parcels_updated_at
  BEFORE UPDATE ON parcels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE parcels IS 'Land parcels with geospatial boundaries';
COMMENT ON COLUMN parcels.parcel_id IS 'Unique parcel identifier (e.g., TH-0001)';
COMMENT ON COLUMN parcels.geometry_geojson IS 'GeoJSON string for frontend rendering';
COMMENT ON COLUMN parcels.geometry IS 'PostGIS geometry for spatial queries and validation';
COMMENT ON COLUMN parcels.area_m2 IS 'Area in square meters (calculated from geometry)';

-- =============================================================================
-- 4. SUBMISSIONS TABLE
-- =============================================================================
-- Stores parcel ownership proposals from PUBLIC users
-- Reviewed by GOV users and converted to parcels when approved
-- =============================================================================

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID REFERENCES users(id) NOT NULL,
  geometry_geojson TEXT NOT NULL,
  geometry GEOMETRY(Polygon, 4326), -- For spatial validation
  proposed_parcel_id TEXT NOT NULL,
  admin_region JSONB NOT NULL, -- {country, state, city}
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_submitter ON submissions(submitter_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_reviewed_by ON submissions(reviewed_by);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
CREATE INDEX idx_submissions_geometry ON submissions USING GIST(geometry); -- For overlap detection

-- Update trigger
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE submissions IS 'Parcel ownership proposals from PUBLIC users';
COMMENT ON COLUMN submissions.geometry IS 'PostGIS geometry for spatial validation (overlap detection)';
COMMENT ON COLUMN submissions.proposed_parcel_id IS 'User-proposed parcel ID (may be changed by GOV during approval)';

-- =============================================================================
-- 5. EVIDENCE TABLE
-- =============================================================================
-- Stores evidence documents attached to submissions
-- Files are stored in Cloudinary, only URLs stored here
-- =============================================================================

CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT, -- MIME type (e.g., application/pdf, image/jpeg)
  file_size INTEGER, -- bytes
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_submission ON evidence(submission_id);
CREATE INDEX idx_evidence_uploaded_at ON evidence(uploaded_at);

COMMENT ON TABLE evidence IS 'Evidence documents for parcel submissions (stored in Cloudinary)';
COMMENT ON COLUMN evidence.file_url IS 'Cloudinary URL (e.g., https://res.cloudinary.com/...)';
COMMENT ON COLUMN evidence.file_size IS 'File size in bytes (max 2MB enforced at application level)';

-- =============================================================================
-- 6. LISTINGS TABLE
-- =============================================================================
-- Stores marketplace listings for SALE or LEASE
-- Only one active listing per parcel enforced by unique index
-- =============================================================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id TEXT REFERENCES parcels(parcel_id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SALE', 'LEASE')),
  price_kes NUMERIC NOT NULL CHECK (price_kes > 0),
  description TEXT,
  terms TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  tx_hash TEXT, -- Optional blockchain transaction hash (future use)
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_parcel ON listings(parcel_id);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_active ON listings(active);
CREATE INDEX idx_listings_created_at ON listings(created_at);

-- Unique constraint: Only one active listing per parcel
CREATE UNIQUE INDEX idx_listings_active_parcel
ON listings(parcel_id)
WHERE active = TRUE;

-- Update trigger
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE listings IS 'Marketplace listings for land parcels';
COMMENT ON COLUMN listings.type IS 'SALE or LEASE';
COMMENT ON COLUMN listings.price_kes IS 'Price in Kenyan Shillings';
COMMENT ON COLUMN listings.tx_hash IS 'Optional blockchain transaction hash for future on-chain tracking';

-- =============================================================================
-- 7. TRANSFER_LOG TABLE (Optional - for tracking ownership changes)
-- =============================================================================
-- Tracks all parcel ownership transfers
-- Used by GOV to monitor peer-to-peer transfers
-- =============================================================================

CREATE TABLE transfer_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id TEXT REFERENCES parcels(parcel_id) NOT NULL,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id) NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('APPROVAL', 'SALE', 'TRANSFER', 'GOVERNMENT_ACTION')),
  notes TEXT,
  tx_hash TEXT, -- Future: on-chain transaction hash
  transferred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transfer_log_parcel ON transfer_log(parcel_id);
CREATE INDEX idx_transfer_log_from_user ON transfer_log(from_user_id);
CREATE INDEX idx_transfer_log_to_user ON transfer_log(to_user_id);
CREATE INDEX idx_transfer_log_transferred_at ON transfer_log(transferred_at);

COMMENT ON TABLE transfer_log IS 'Audit log of all parcel ownership transfers';
COMMENT ON COLUMN transfer_log.transfer_type IS 'APPROVAL (from submission), SALE (marketplace), TRANSFER (direct), GOVERNMENT_ACTION (manual by GOV)';

-- =============================================================================
-- 8. HELPER FUNCTIONS
-- =============================================================================

-- Function to calculate area from GeoJSON
CREATE OR REPLACE FUNCTION calculate_area_from_geojson(geojson_text TEXT)
RETURNS NUMERIC AS $$
DECLARE
  geom GEOMETRY;
  area_m2 NUMERIC;
BEGIN
  -- Convert GeoJSON to PostGIS geometry
  geom := ST_GeomFromGeoJSON(geojson_text);

  -- Calculate area in square meters (using geography for accuracy)
  area_m2 := ST_Area(geom::geography);

  RETURN area_m2;
END;
$$ LANGUAGE plpgsql;

-- Function to check if geometry overlaps with existing parcels or submissions
CREATE OR REPLACE FUNCTION check_geometry_overlap(geojson_text TEXT, exclude_submission_id UUID DEFAULT NULL)
RETURNS TABLE(overlaps_with TEXT, overlap_type TEXT) AS $$
BEGIN
  -- Check against existing parcels
  RETURN QUERY
  SELECT
    parcel_id::TEXT,
    'parcel'::TEXT
  FROM parcels
  WHERE ST_Intersects(
    geometry,
    ST_GeomFromGeoJSON(geojson_text)
  );

  -- Check against pending submissions
  RETURN QUERY
  SELECT
    id::TEXT,
    'submission'::TEXT
  FROM submissions
  WHERE id != COALESCE(exclude_submission_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND status IN ('SUBMITTED', 'UNDER_REVIEW')
    AND ST_Intersects(
      geometry,
      ST_GeomFromGeoJSON(geojson_text)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_geometry_overlap IS 'Validates if a geometry overlaps with existing parcels or pending submissions';

-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS) - OPTIONAL
-- =============================================================================
-- Uncomment these if you want to use Supabase RLS for auth
-- Note: You may handle auth in API routes instead

/*
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gov_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_log ENABLE ROW LEVEL SECURITY;

-- Example policies (customize as needed)

-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = auth.uid()::UUID);

-- PUBLIC users can create submissions
CREATE POLICY submissions_insert_public ON submissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::UUID AND type = 'PUBLIC')
  );

-- GOV users can read all submissions
CREATE POLICY submissions_select_gov ON submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::UUID AND type = 'GOV')
  );

-- Add more policies as needed...
*/

-- =============================================================================
-- 10. SEED DATA (Optional - for testing)
-- =============================================================================

-- Create a test PUBLIC user
-- INSERT INTO users (wallet_address, type, full_name, email)
-- VALUES ('0x1234567890123456789012345678901234567890', 'PUBLIC', 'Test User', 'test@example.com');

-- Create a test GOV user
-- INSERT INTO users (wallet_address, type, full_name)
-- VALUES ('0x0987654321098765432109876543210987654321', 'GOV', 'Government Admin');

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify all tables created successfully
-- 3. Import existing mock data (parcels.mock.json) if needed
-- 4. Configure environment variables (ROOT_ADMIN_WALLETS)
-- 5. Implement API routes for authentication
-- =============================================================================
