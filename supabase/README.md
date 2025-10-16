# Supabase Database Setup

This directory contains SQL migrations for the TerraHash database schema.

## Prerequisites

1. Supabase account created at [supabase.com](https://supabase.com)
2. Project created in Supabase dashboard
3. API credentials added to `.env.local`

## Running Migrations

### Method 1: Supabase SQL Editor (Recommended for first setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `migrations/001_initial_schema.sql`
5. Paste into the query editor
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. Verify success: You should see "Success. No rows returned"

### Method 2: Supabase CLI (For version control)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize local Supabase (if not done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
supabase db push
```

## Verifying Migration

After running the migration, verify tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see 7 tables:
   - `users`
   - `gov_whitelist`
   - `parcels`
   - `submissions`
   - `evidence`
   - `listings`
   - `transfer_log`

3. Check PostGIS extension:
   - Go to **SQL Editor**
   - Run: `SELECT PostGIS_version();`
   - Should return version info (e.g., "3.3 USE_GEOS=1...")

## Post-Migration Steps

### 1. Configure Root Admin Wallet

Add your wallet address to `.env.local`:

```env
ROOT_ADMIN_WALLETS=0xYourWalletAddressHere
```

### 2. (Optional) Import Mock Data

If you want to migrate existing `parcels.mock.json` to the database:

```sql
-- Example: Insert a test parcel
INSERT INTO parcels (parcel_id, status, geometry_geojson, geometry, area_m2, admin_region)
VALUES (
  'TH-0001',
  'UNCLAIMED',
  '{"type":"Polygon","coordinates":[[[36.8219,-1.2921],[36.8229,-1.2921],[36.8229,-1.2911],[36.8219,-1.2911],[36.8219,-1.2921]]]}',
  ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[36.8219,-1.2921],[36.8229,-1.2921],[36.8229,-1.2911],[36.8219,-1.2911],[36.8219,-1.2921]]]}'),
  111320.0,
  '{"country":"Kenya","state":"Nairobi","city":"Nairobi"}'::jsonb
);
```

### 3. Test Database Connection

Create a simple API route to test:

```typescript
// src/app/api/health/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').select('count');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ status: 'ok', database: 'connected' });
}
```

Test: Visit `http://localhost:3000/api/health`

## Database Schema Overview

### Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | All platform users (PUBLIC & GOV) | Wallet-based auth |
| `gov_whitelist` | GOV user whitelist | Created by root admin |
| `parcels` | Land parcels with boundaries | PostGIS geometry, spatial index |
| `submissions` | Parcel proposals from users | Reviewed by GOV |
| `evidence` | Documents for submissions | Cloudinary URLs |
| `listings` | Marketplace (SALE/LEASE) | One active listing per parcel |
| `transfer_log` | Ownership transfer audit | Tracks all changes |

### Helper Functions

- `update_updated_at_column()` - Auto-updates `updated_at` timestamp
- `calculate_area_from_geojson(text)` - Calculates area from GeoJSON
- `check_geometry_overlap(text, uuid)` - Validates geometry overlaps

## Troubleshooting

### Error: "extension postgis does not exist"

PostGIS is not installed. Enable it:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Error: "permission denied for schema public"

You may need service role key. Update your Supabase client:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for migrations
);
```

### Error: "relation already exists"

Tables already created. To reset:
```sql
-- WARNING: This deletes ALL data
DROP TABLE IF EXISTS transfer_log CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS parcels CASCADE;
DROP TABLE IF EXISTS gov_whitelist CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run migration
```

## Next Steps

After successful migration:

1. ✅ Database tables created
2. 🔲 Configure root admin wallet in `.env.local`
3. 🔲 Test API routes (start with `/api/health`)
4. 🔲 Implement Feature 01: Authentication
5. 🔲 Create first GOV user via root admin dashboard

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [GeoJSON Spec](https://geojson.org/)
