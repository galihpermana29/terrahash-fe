# Feature 06: Listing Management (Sale & Lease)

## Overview
PUBLIC users can create, edit, and manage listings for their owned parcels. Off-chain coordination only.

---

## Frontend Tasks

### Pages
- [ ] **/listings/create** - Create new listing page
  - [ ] Protected route (requires auth + type=PUBLIC)
  - [ ] Select owned parcel (dropdown or search)
  - [ ] Form to create listing
  
- [ ] **/listings/:id/edit** - Edit existing listing page
  - [ ] Protected route (requires auth + ownership)
  - [ ] Pre-filled form with current listing data

### Components

#### Create Listing Flow
- [ ] **SelectParcelStep** component
  - [ ] Fetch user's owned parcels (status=OWNED, owner_id=current user)
  - [ ] Display cards with parcel info
  - [ ] Check if parcel already has active listing (show warning)
  - [ ] Select parcel → proceed to form
  
- [ ] **ListingForm** component
  - [ ] Radio: Listing Type (SALE / LEASE)
  - [ ] Input: Price (KES) (required)
  - [ ] Textarea: Description (optional, max 1000 chars)
  - [ ] Textarea: Terms & Conditions (optional)
  - [ ] Checkbox: I agree to terms (required)
  - [ ] Optional: Contact info (phone, email) - auto-fill from user profile
  - [ ] Optional: Transaction Hash field (for future on-chain tracking)
  - [ ] Submit → POST /api/listings
  - [ ] Success: redirect to /dashboard with success message
  
- [ ] **ListingPreview** component
  - [ ] Show how listing will appear on map/marketplace
  - [ ] Display parcel info + listing details
  - [ ] Edit button to go back

#### Edit Listing
- [ ] **EditListingForm** component
  - [ ] Same fields as ListingForm
  - [ ] Pre-filled with current data
  - [ ] Cannot change parcel_id
  - [ ] Can change type, price, description, active status
  - [ ] Submit → PATCH /api/listings/:id
  - [ ] Success: redirect to /dashboard

#### Listing Actions (in Dashboard)
- [ ] **DeactivateListingButton** component
  - [ ] Confirm dialog
  - [ ] PATCH /api/listings/:id { active: false }
  - [ ] Success: refresh list
  
- [ ] **ActivateListingButton** component
  - [ ] PATCH /api/listings/:id { active: true }
  - [ ] Success: refresh list
  
- [ ] **DeleteListingButton** component
  - [ ] Confirm dialog with warning
  - [ ] DELETE /api/listings/:id
  - [ ] Success: refresh list

---

## Backend Tasks

### Database Schema (Supabase)

- [ ] **listings table** (already defined in types)
  ```sql
  CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id TEXT REFERENCES parcels(parcel_id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('SALE', 'LEASE')),
    price_kes NUMERIC,
    description TEXT,
    terms TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    tx_hash TEXT, -- Optional blockchain transaction hash
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_listings_parcel ON listings(parcel_id);
  CREATE INDEX idx_listings_type ON listings(type);
  CREATE INDEX idx_listings_active ON listings(active);
  ```

- [ ] Add constraint: One active listing per parcel
  ```sql
  CREATE UNIQUE INDEX idx_listings_active_parcel 
  ON listings(parcel_id) 
  WHERE active = TRUE;
  ```

### API Routes

- [ ] **POST /api/listings**
  - [ ] Auth required (PUBLIC only)
  - [ ] Validate request body:
    - [ ] parcel_id (must exist, must be owned by user)
    - [ ] type (SALE or LEASE)
    - [ ] price_kes (positive number)
  - [ ] Check if parcel already has active listing (reject if yes)
  - [ ] Insert listing record
  - [ ] Return created listing
  
- [ ] **GET /api/listings/:id**
  - [ ] Public access
  - [ ] Return listing with parcel info
  - [ ] Include owner info (name only)
  
- [ ] **PATCH /api/listings/:id**
  - [ ] Auth required
  - [ ] Verify ownership (listing.parcel.owner_id = current user)
  - [ ] Allow update: type, price_kes, description, terms, active, tx_hash
  - [ ] Validate changes
  - [ ] Update listing record
  - [ ] Return updated listing
  
- [ ] **DELETE /api/listings/:id**
  - [ ] Auth required
  - [ ] Verify ownership
  - [ ] Soft delete (set active=false) OR hard delete
  - [ ] Return success
  
- [ ] **GET /api/listings**
  - [ ] Public access
  - [ ] Query params: type, active, parcel_id, page, limit
  - [ ] Return listings with parcel and owner info
  - [ ] Used for marketplace page

---

## Integration with Map & Landing

### Map Page Updates
- [ ] Update **ParcelMap** component
  - [ ] Show listing badge on markers (SALE/LEASE)
  - [ ] Color-code markers by listing type (optional)
  
- [ ] Update **ParcelCard** component (already done)
  - [ ] Display listing type badge
  - [ ] Display price
  - [ ] Link to listing details

### Landing Page Updates
- [ ] Update **Leased Land** section (already done)
  - [ ] Fetch from LISTINGS with type=LEASE
  - [ ] Display cards with listing info

### New Page (Optional)
- [ ] **/marketplace** - Dedicated marketplace page
  - [ ] Tabs: For Sale, For Lease
  - [ ] Grid of listing cards
  - [ ] Filter by price range, location
  - [ ] Search by parcel ID
  - [ ] Click card → view parcel details

---

## Testing Checklist
- [ ] User can create SALE listing for owned parcel
- [ ] User can create LEASE listing for owned parcel
- [ ] Cannot create listing for parcel with active listing
- [ ] Cannot create listing for parcel not owned by user
- [ ] User can edit own listing
- [ ] User can deactivate listing
- [ ] User can reactivate listing
- [ ] User can delete listing
- [ ] Listing appears on map with badge
- [ ] Listing appears in marketplace
- [ ] Price validation works (positive numbers only)
- [ ] Unauthenticated users cannot create listings
- [ ] PUBLIC users cannot edit others' listings

---

## Dependencies
- AuthGuard (PUBLIC only)
- Ant Design (Form, Radio, Input, Modal)
- React Hook Form (form state)
- Zod (validation)

## Status
🔲 Not Started
