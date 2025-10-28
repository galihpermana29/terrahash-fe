-- Create objections table for land parcel objections
-- This allows public users to submit objections about land parcels
-- Government officials can view and manage these objections

CREATE TABLE IF NOT EXISTS objections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    message TEXT NOT NULL CHECK (length(message) >= 10 AND length(message) <= 1000),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_objections_parcel_id 
        FOREIGN KEY (parcel_id) 
        REFERENCES parcels(parcel_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_objections_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Prevent duplicate pending objections from same user for same parcel
    CONSTRAINT unique_pending_objection_per_user_parcel 
        UNIQUE (parcel_id, user_id, status) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_objections_parcel_id ON objections(parcel_id);
CREATE INDEX IF NOT EXISTS idx_objections_user_id ON objections(user_id);
CREATE INDEX IF NOT EXISTS idx_objections_status ON objections(status);
CREATE INDEX IF NOT EXISTS idx_objections_created_at ON objections(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_objections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_objections_updated_at
    BEFORE UPDATE ON objections
    FOR EACH ROW
    EXECUTE FUNCTION update_objections_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE objections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own objections
CREATE POLICY "Users can view their own objections" ON objections
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can insert their own objections
CREATE POLICY "Users can create their own objections" ON objections
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Government officials can view all objections
CREATE POLICY "Government officials can view all objections" ON objections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.type = 'GOV'
        )
    );

-- Policy: Government officials can update objection status
CREATE POLICY "Government officials can update objection status" ON objections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.type = 'GOV'
        )
    );

-- Add comments for documentation
COMMENT ON TABLE objections IS 'Stores objections submitted by public users regarding land parcels';
COMMENT ON COLUMN objections.id IS 'Unique identifier for the objection';
COMMENT ON COLUMN objections.parcel_id IS 'Reference to the parcel being objected to';
COMMENT ON COLUMN objections.user_id IS 'Reference to the user who submitted the objection';
COMMENT ON COLUMN objections.message IS 'The objection message (10-1000 characters)';
COMMENT ON COLUMN objections.status IS 'Current status: PENDING, REVIEWED, or RESOLVED';
COMMENT ON COLUMN objections.created_at IS 'When the objection was submitted';
COMMENT ON COLUMN objections.updated_at IS 'When the objection was last updated';

-- Insert some sample data for testing (optional - remove in production)
-- INSERT INTO objections (parcel_id, user_id, message, status) VALUES
-- ('SAMPLE_PARCEL_001', (SELECT id FROM users WHERE type = 'PUBLIC' LIMIT 1), 'This land appears to be in a protected wetland area. I believe this should be investigated before any development proceeds.', 'PENDING'),
-- ('SAMPLE_PARCEL_002', (SELECT id FROM users WHERE type = 'PUBLIC' LIMIT 1), 'There seems to be an access road issue with this parcel. The current road shown on the map does not exist in reality.', 'REVIEWED');

-- Grant necessary permissions
GRANT SELECT, INSERT ON objections TO authenticated;
GRANT UPDATE (status, updated_at) ON objections TO authenticated;
