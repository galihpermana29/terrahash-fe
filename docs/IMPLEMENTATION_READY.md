# Implementation Ready Checklist

**Date:** Oct 15, 2025
**Status:** ✅ Ready to proceed with Feature 01 (Authentication)

---

## ✅ Completed Setup

### 1. Project Planning
- ✅ Reviewed all feature plans (01-08)
- ✅ Clarified ambiguous flows (see `docs/plan/09-clarifications.md`)
- ✅ Documented design decisions
- ✅ Updated PROJECT_PLAN.md with recent progress

### 2. Database Schema
- ✅ Created comprehensive SQL migration: `supabase/migrations/001_initial_schema.sql`
- ✅ 7 tables defined with proper relationships
- ✅ PostGIS enabled for spatial validation
- ✅ Helper functions created (geometry overlap, area calculation)
- ✅ Indexes and triggers configured
- ✅ Migration guide created: `supabase/README.md`

### 3. Utility Functions
- ✅ Geometry validation utilities: `src/lib/utils/geometry.ts`
  - GeoJSON validation
  - Area calculation (m² and acres)
  - Centroid calculation
  - Simple overlap detection (client-side)
  - Parcel ID validation/generation
- ✅ API route for geometry validation: `src/app/api/submissions/validate-geometry/route.ts`

### 4. Environment Configuration
- ✅ Supabase credentials configured in `.env.local`
- ✅ Cloudinary placeholder in env file
- ✅ Root admin wallet configuration defined

---

## 🔄 Next Steps (In Order)

### Step 1: Run Database Migration
```bash
# Option A: Supabase SQL Editor (Recommended)
1. Open Supabase dashboard
2. Go to SQL Editor
3. Copy/paste contents of supabase/migrations/001_initial_schema.sql
4. Run the query

# Option B: Supabase CLI
supabase db push
```

**Verification:**
- Check Table Editor - should see 7 tables
- Run: `SELECT PostGIS_version();` - should return version info

### Step 2: Configure Root Admin Wallet
```env
# Add to .env.local
ROOT_ADMIN_WALLETS=0xYourActualWalletAddress
```

### Step 3: Test Database Connection
```bash
npm run dev
# Visit: http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

### Step 4: Implement Feature 01 - Authentication
**Priority tasks:**
1. Create auth context/hooks
2. Implement wallet registration flow (PUBLIC users)
3. Implement login flow (check wallet in DB)
4. Create AuthGuard component
5. Update Navbar to use real auth state

**Files to create:**
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`
- `src/components/auth/AuthGuard.tsx`
- `src/components/auth/RegisterModal.tsx`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/me/route.ts`

See: `docs/plan/01-authentication.md` for detailed checklist

### Step 5: Implement Feature 05 - Root Admin Dashboard
**Why before other features?**
- Need to create GOV users before they can review submissions
- Root admin creates GOV users via whitelist

**Files to create:**
- `src/app/root-admin/page.tsx`
- `src/components/admin/WhitelistTable.tsx`
- `src/components/admin/AddWhitelistModal.tsx`
- `src/app/api/admin/whitelist/route.ts`
- `src/lib/middleware/rootAdmin.ts`

See: `docs/plan/05-root-admin.md` for detailed checklist

### Step 6: Implement Feature 03 - Submission Flow
**Core user journey:**
- PUBLIC users submit parcel proposals
- Validates geometry overlaps (already have utility)
- Uploads evidence to Cloudinary

**Files to create:**
- `src/app/submit/page.tsx`
- `src/components/submission/DrawableMap.tsx`
- `src/components/submission/SubmissionForm.tsx`
- `src/components/submission/EvidenceUploader.tsx`
- `src/app/api/submissions/route.ts`
- `src/app/api/upload/route.ts`

See: `docs/plan/03-submission-flow.md` for detailed checklist

### Step 7: Implement Feature 04 - Government Dashboard
**GOV users review submissions:**
- View pending submissions
- Approve/reject with notes
- Approval creates parcel + transfers ownership

**Files to create:**
- `src/app/gov/page.tsx`
- `src/components/gov/PendingSubmissionsList.tsx`
- `src/components/gov/SubmissionReviewModal.tsx`
- `src/app/api/submissions/[id]/review/route.ts`

See: `docs/plan/04-government-dashboard.md` for detailed checklist

### Step 8: Implement Remaining Features
- Feature 02: Public Dashboard
- Feature 06: Listing Management
- Feature 07: Parcel Details Page
- Feature 08: Map Enhancements

---

## 📋 Key Design Decisions

### 1. GOV User Registration
- **Decision:** Whitelisting = Registration
- **Implementation:** Root admin creates both `gov_whitelist` + `users` entries atomically
- **File:** `src/app/api/admin/whitelist/route.ts`

### 2. Submission Overlap Validation
- **Decision:** NO overlaps allowed (hard reject)
- **Implementation:** PostGIS `ST_Intersects` + `check_geometry_overlap()` function
- **Files:**
  - `src/lib/utils/geometry.ts` (client-side preview)
  - `src/app/api/submissions/validate-geometry/route.ts` (server validation)

### 3. Ownership Transfers
- **Decision:** Web2 (manual) now, Web3 (on-chain) later
- **Implementation:**
  - Phase 1: GOV manually updates in admin dashboard
  - Phase 2: Smart contract peer-to-peer transfers
- **Table:** `transfer_log` tracks all changes

### 4. Listing Rules
- **Decision:** ONE active listing per parcel
- **Implementation:** Unique index `idx_listings_active_parcel WHERE active = TRUE`
- **Validation:** Check before INSERT in `src/app/api/listings/route.ts`

### 5. Root Admin Config
- **Decision:** Environment variable `ROOT_ADMIN_WALLETS`
- **Implementation:** Comma-separated list, checked in middleware
- **File:** `src/lib/middleware/rootAdmin.ts`

### 6. File Storage
- **Decision:** Cloudinary only (Phase 1)
- **Implementation:** Direct upload to Cloudinary, store URLs in `evidence` table
- **File:** `src/app/api/upload/route.ts`

---

## 🛠️ Developer Notes

### Database Access Patterns

**Public routes (no auth):**
- GET `/api/parcels/:parcel_id` - View parcel details
- GET `/api/listings` - Browse marketplace

**PUBLIC user routes (auth required):**
- POST `/api/auth/register` - Register new PUBLIC user
- GET `/api/submissions/me` - User's submissions
- POST `/api/submissions` - Create submission
- POST `/api/listings` - Create listing

**GOV user routes (auth + type=GOV):**
- GET `/api/submissions` - All submissions (filtered)
- PATCH `/api/submissions/:id/review` - Approve/reject
- GET `/api/parcels` - All parcels (with filters)
- POST `/api/parcels` - Manually add parcel

**Root admin routes (auth + wallet in ROOT_ADMIN_WALLETS):**
- GET `/api/admin/whitelist` - View GOV whitelist
- POST `/api/admin/whitelist` - Add GOV user
- DELETE `/api/admin/whitelist/:wallet` - Revoke GOV access

### Authentication Flow

```
1. User connects wallet (RainbowKit)
   ↓
2. Frontend calls: POST /api/auth/login { wallet_address }
   ↓
3. Backend checks: SELECT * FROM users WHERE wallet_address = ?
   ↓
4. If found → return user + token
   If not found (PUBLIC) → redirect to /auth/register
   If not found (GOV) → check whitelist, error if not whitelisted
   ↓
5. Store user in AuthContext + localStorage
   ↓
6. Navbar shows user info
```

### Submission Flow

```
1. PUBLIC user goes to /submit
   ↓
2. Draw polygon on map (Leaflet.draw)
   ↓
3. Client-side validation:
   - Valid GeoJSON? ✓
   - Area > 0? ✓
   - Simple overlap check (warning) ⚠️
   ↓
4. Fill form (parcel_id, location, notes)
   ↓
5. Upload evidence (Cloudinary)
   ↓
6. Review & submit
   ↓
7. POST /api/submissions
   - Server validation (overlap with PostGIS) ✓
   - Insert submission + evidence records ✓
   - Return submission_id
   ↓
8. Redirect to /dashboard with success message
```

### GOV Review Flow

```
1. GOV user goes to /gov
   ↓
2. View pending submissions (status=SUBMITTED)
   ↓
3. Click "Review" → SubmissionReviewModal
   - View geometry on map
   - View evidence files
   - Add review notes
   ↓
4. Approve:
   - Create parcel record
   - Set parcel.owner_id = submission.submitter_id
   - Set submission.status = APPROVED
   - Log transfer (type=APPROVAL)
   OR
   Reject:
   - Set submission.status = REJECTED
   - Add review_notes
   ↓
5. PATCH /api/submissions/:id/review
   ↓
6. Refresh list
```

---

## 📦 File Structure Overview

```
hedera-fe/
├── docs/
│   ├── plan/
│   │   ├── 00-completed.md
│   │   ├── 01-authentication.md
│   │   ├── 02-public-dashboard.md
│   │   ├── 03-submission-flow.md
│   │   ├── 04-government-dashboard.md
│   │   ├── 05-root-admin.md
│   │   ├── 06-listing-management.md
│   │   ├── 07-parcel-details.md
│   │   ├── 08-map-enhancements.md
│   │   └── 09-clarifications.md ⭐
│   └── IMPLEMENTATION_READY.md ⭐ (this file)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql ⭐
│   └── README.md ⭐
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts (existing)
│   │   │   └── submissions/
│   │   │       └── validate-geometry/route.ts ⭐
│   │   ├── (public)/
│   │   │   └── map/page.tsx (existing)
│   │   └── page.tsx (existing - landing)
│   ├── components/
│   │   ├── layout/Navbar.tsx (existing)
│   │   ├── map/ (existing - ParcelMap, etc.)
│   │   └── wallet/WalletProvider.tsx (existing)
│   ├── lib/
│   │   ├── supabase/ (existing)
│   │   ├── types/ (existing - modular types)
│   │   └── utils/
│   │       ├── errors.ts (existing)
│   │       ├── response.ts (existing)
│   │       └── geometry.ts ⭐
│   └── data/ (existing mock data)
└── PROJECT_PLAN.md (updated ⭐)
```

**⭐ = Created in this session**

---

## 🚀 Ready to Build!

You now have:
- ✅ Complete database schema
- ✅ Geometry validation utilities
- ✅ Clear design decisions documented
- ✅ Step-by-step implementation plan
- ✅ Detailed feature checklists

**Recommended Order:**
1. Run database migration
2. Implement Authentication (Feature 01)
3. Implement Root Admin Dashboard (Feature 05)
4. Implement Submission Flow (Feature 03)
5. Implement Government Dashboard (Feature 04)
6. Implement remaining features (02, 06, 07, 08)

**Estimated Timeline:**
- Feature 01 (Auth): 2-3 days
- Feature 05 (Root Admin): 1-2 days
- Feature 03 (Submissions): 3-4 days
- Feature 04 (GOV Dashboard): 3-4 days
- Features 02, 06, 07: 2-3 days each
- Total: ~3-4 weeks for full implementation

Good luck! 🎉
