# Clarifications & Design Decisions

This document captures clarifications on ambiguous flows and design decisions made during planning.

**Last Updated:** Oct 15, 2025

---

## 1. GOV User Registration Flow

### Question
What happens when a GOV wallet (that IS whitelisted) connects for the first time but isn't in the users table yet?

### Decision
**When root admin whitelists a GOV wallet, it creates BOTH:**
1. Entry in `gov_whitelist` table
2. Entry in `users` table with `type='GOV'`

**Implementation:**
- POST /api/admin/whitelist creates both records atomically
- The whitelist action IS the registration for GOV users
- No separate registration flow needed for GOV users
- Frontend checks: if wallet whitelisted → automatic login (user already exists)

**Database Schema:**
```sql
-- gov_whitelist.user_id references the created GOV user
CREATE TABLE gov_whitelist (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  added_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'ACTIVE',
  added_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Submission Geometry Validation

### Question
Can submissions overlap with existing parcels or other pending submissions?

### Decision
**NO - Submissions CANNOT duplicate existing geometries.**

**Validation Rules:**
1. Check if geometry overlaps with existing parcels → REJECT
2. Check if geometry overlaps with pending submissions (SUBMITTED/UNDER_REVIEW) → REJECT
3. Use PostGIS `ST_Intersects()` for spatial validation
4. Show clear error message: "This area overlaps with [parcel_id/submission_id]"

**Implementation:**
- Add `geometry` column (PostGIS) to both `parcels` and `submissions` tables
- Create helper function: `check_geometry_overlap(geojson_text)`
- Validate on frontend (soft warning) AND backend (hard reject)
- API endpoint: GET /api/submissions/validate-geometry

**SQL Function:**
```sql
CREATE FUNCTION check_geometry_overlap(geojson_text TEXT, exclude_submission_id UUID DEFAULT NULL)
RETURNS TABLE(overlaps_with TEXT, overlap_type TEXT);
```

---

## 3. Ownership Transfer Flow

### Question
What's the workflow for transferring ownership between PUBLIC users?

### Decision
**Two-phase approach: Web2 now, Web3 later**

**Current Implementation (Phase 1 - Off-chain):**
- Transfers happen via marketplace SALE listings
- Buyer contacts seller off-platform (email/phone)
- After agreement, GOV manually updates ownership in admin dashboard
- GOV logs transfer in `transfer_log` table with type='SALE'
- GOV dashboard shows transfer history (read-only for GOV)

**Future Implementation (Phase 2 - On-chain):**
- Smart contract handles peer-to-peer transfers
- User initiates transfer → signs transaction → ownership changes on-chain
- Backend syncs with blockchain and updates `parcels.owner_id`
- `tx_hash` field stores blockchain transaction reference

**Database Schema:**
```sql
CREATE TABLE transfer_log (
  id UUID PRIMARY KEY,
  parcel_id TEXT REFERENCES parcels(parcel_id),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  transfer_type TEXT CHECK (transfer_type IN ('APPROVAL', 'SALE', 'TRANSFER', 'GOVERNMENT_ACTION')),
  notes TEXT,
  tx_hash TEXT, -- Future: on-chain transaction hash
  transferred_at TIMESTAMPTZ DEFAULT NOW()
);
```

**GOV Dashboard Feature:**
- Read-only view: "Recent Transfers" section
- Displays: parcel_id, from_user, to_user, date, type
- Filter by date range, parcel, user

---

## 4. Listing Status Rules

### Question
Can a parcel have multiple active listings (e.g., SALE and LEASE simultaneously)?

### Decision
**NO - Only ONE active listing per parcel at a time.**

**Rules:**
1. A parcel can be listed for SALE OR LEASE, not both
2. Only one active listing per parcel (enforced by unique index)
3. User can deactivate current listing and create a new one
4. When ownership transfers, active listings are automatically deactivated

**Database Constraint:**
```sql
CREATE UNIQUE INDEX idx_listings_active_parcel
ON listings(parcel_id)
WHERE active = TRUE;
```

**Validation:**
- Frontend: Check if parcel has active listing before showing "Create Listing" button
- Backend: Check uniqueness before INSERT
- Error message: "This parcel already has an active listing. Please deactivate it first."

---

## 5. Root Admin Wallet Configuration

### Question
How should the initial root admin wallet be configured?

### Decision
**Store in environment variable: `ROOT_ADMIN_WALLETS`**

**Configuration:**
```env
# .env.local
ROOT_ADMIN_WALLETS=0xYourWalletAddress1,0xYourWalletAddress2
```

**Implementation:**
- Comma-separated list of wallet addresses
- Parse in auth middleware: `process.env.ROOT_ADMIN_WALLETS.split(',')`
- Check on every /root-admin and /api/admin/* request
- Return 403 Forbidden if not in list

**Deployment:**
- Set in Vercel/deployment platform environment variables
- Keep separate for dev/staging/production
- Document in README which wallet is root admin

**Middleware:**
```typescript
export function isRootAdmin(walletAddress: string): boolean {
  const rootAdmins = process.env.ROOT_ADMIN_WALLETS?.split(',') || [];
  return rootAdmins.includes(walletAddress.toLowerCase());
}
```

---

## 6. File Upload Strategy

### Question
Should we use Cloudinary or IPFS for evidence documents?

### Decision
**Cloudinary ONLY (Phase 1)**

**Rationale:**
- Simpler integration (Cloudinary SDK)
- No need for IPFS pinning service
- Faster upload/retrieval
- Built-in transformations (thumbnails, previews)
- Max 2MB per file enforced at application level

**Future Consideration (Phase 2):**
- Migrate to IPFS for decentralization
- Store IPFS CID in `evidence.file_url`
- Use Pinata or NFT.storage for pinning
- Keep Cloudinary for temporary uploads during submission flow

**Configuration:**
```env
# .env.local (remove IPFS config for now)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Validation:**
- Max file size: 2MB (2,097,152 bytes)
- Allowed types: PDF, JPG, JPEG, PNG
- Max files per submission: 5
- Check in frontend AND backend

---

## 7. Database Setup

### Question
Do existing database tables exist, or should we create them from scratch?

### Decision
**Create from scratch using migration file.**

**Deliverables:**
- ✅ Created: `supabase/migrations/001_initial_schema.sql`
- Includes all 7 tables:
  1. `users`
  2. `gov_whitelist`
  3. `parcels`
  4. `submissions`
  5. `evidence`
  6. `listings`
  7. `transfer_log`
- Helper functions for geometry validation
- Indexes for performance
- Triggers for `updated_at` timestamps

**Next Steps:**
1. Run migration in Supabase SQL Editor
2. Verify tables created successfully
3. Optionally migrate existing `parcels.mock.json` data to `parcels` table
4. Update API routes to use real database instead of mock data

---

## Summary of Key Decisions

| Topic | Decision |
|-------|----------|
| GOV Registration | Whitelist action creates both `gov_whitelist` + `users` entries |
| Submission Overlap | Hard validation - NO overlaps allowed |
| Ownership Transfer | Web2 (manual by GOV) now, Web3 (on-chain) later |
| Listing Rules | ONE active listing per parcel (SALE OR LEASE) |
| Root Admin Config | Environment variable `ROOT_ADMIN_WALLETS` |
| File Upload | Cloudinary only (IPFS in Phase 2) |
| Database | Created from scratch with migration SQL |

---

## Open Questions (if any)

*None at this time. All critical flows have been clarified.*

---

**Next Steps:**
1. ✅ Database schema created
2. 🔲 Run migration in Supabase
3. 🔲 Implement Feature 01: Authentication & User Management
4. 🔲 Create geometry validation utility
5. 🔲 Update existing mock data pages to use real database
