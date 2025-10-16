# Feature 02: Public User Dashboard

## Overview
Dashboard for PUBLIC users to manage their submissions, listings, and owned parcels.

---

## Frontend Tasks

### Pages
- [ ] **/dashboard** - Main dashboard page (PUBLIC users only)
  - [ ] Protected route (requires auth + type=PUBLIC)
  - [ ] Tabs/sections:
    - [ ] My Submissions
    - [ ] My Parcels (owned)
    - [ ] My Listings (sale/lease)
    - [ ] Profile Settings

### Components

#### My Submissions Section
- [ ] **SubmissionList** component
  - [ ] Fetch user's submissions from API
  - [ ] Display table/cards with:
    - [ ] Proposed Parcel ID
    - [ ] Status badge (SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED)
    - [ ] Submission date
    - [ ] Action: View Details
  - [ ] Filter by status
  - [ ] Pagination
  
- [ ] **SubmissionDetailModal**
  - [ ] Show full submission data
  - [ ] Display geometry on mini map
  - [ ] List attached evidence files
  - [ ] Show review notes (if rejected)
  - [ ] Action: Edit (if SUBMITTED or REJECTED)
  - [ ] Action: Delete (if SUBMITTED or REJECTED)

#### My Parcels Section
- [ ] **OwnedParcelsList** component
  - [ ] Fetch parcels where owner_id = current user
  - [ ] Display cards with:
    - [ ] Parcel ID
    - [ ] Location (admin_region)
    - [ ] Area (acres)
    - [ ] Status (OWNED)
    - [ ] Thumbnail map
    - [ ] Action: View on Map
    - [ ] Action: Create Listing
  - [ ] Search/filter by parcel ID or location

#### My Listings Section
- [ ] **MyListingsList** component
  - [ ] Fetch user's active/inactive listings
  - [ ] Display table with:
    - [ ] Parcel ID
    - [ ] Type (SALE/LEASE)
    - [ ] Price (KES)
    - [ ] Status (Active/Inactive)
    - [ ] Created date
    - [ ] Actions: Edit, Deactivate/Activate, Delete
  - [ ] Toggle active/inactive listings

#### Profile Settings Section
- [ ] **ProfileForm** component
  - [ ] Display current user info
  - [ ] Editable fields: full_name, email, phone
  - [ ] Non-editable: wallet_address, type
  - [ ] Submit → PATCH /api/users/me

### Layout
- [ ] **DashboardLayout** component
  - [ ] Sidebar navigation (mobile: hamburger menu)
  - [ ] Links: My Submissions, My Parcels, My Listings, Profile
  - [ ] Breadcrumbs
  - [ ] User info in header

---

## Backend Tasks

### API Routes

#### Submissions
- [ ] **GET /api/submissions/me**
  - [ ] Auth required
  - [ ] Query params: status, page, limit
  - [ ] Return user's submissions with pagination
  
- [ ] **GET /api/submissions/:id**
  - [ ] Auth required
  - [ ] Verify ownership (submitter_id = current user)
  - [ ] Return submission with evidence array
  
- [ ] **PATCH /api/submissions/:id**
  - [ ] Auth required
  - [ ] Verify ownership
  - [ ] Only allow edit if status = SUBMITTED or REJECTED
  - [ ] Update submission fields
  
- [ ] **DELETE /api/submissions/:id**
  - [ ] Auth required
  - [ ] Verify ownership
  - [ ] Only allow delete if status = SUBMITTED or REJECTED
  - [ ] Soft delete or hard delete

#### Parcels
- [ ] **GET /api/parcels/me**
  - [ ] Auth required
  - [ ] Return parcels where owner_id = current user
  - [ ] Include listing info if exists
  
- [ ] **GET /api/parcels/:parcel_id**
  - [ ] Public or auth required
  - [ ] Return full parcel details
  - [ ] Include owner info (name only, not wallet)
  - [ ] Include active listing if exists

#### Listings
- [ ] **GET /api/listings/me**
  - [ ] Auth required
  - [ ] Return user's listings (via parcel ownership)
  - [ ] Include parcel info
  
- [ ] **PATCH /api/listings/:id**
  - [ ] Auth required
  - [ ] Verify ownership (listing.parcel.owner_id = current user)
  - [ ] Update price, active status
  
- [ ] **DELETE /api/listings/:id**
  - [ ] Auth required
  - [ ] Verify ownership
  - [ ] Soft delete or set active=false

#### User Profile
- [ ] **GET /api/users/me**
  - [ ] Auth required
  - [ ] Return current user data
  
- [ ] **PATCH /api/users/me**
  - [ ] Auth required
  - [ ] Allow update: full_name, email, phone
  - [ ] Validate inputs
  - [ ] Return updated user

---

## Testing Checklist
- [ ] Dashboard loads user's submissions
- [ ] Submissions filtered by status
- [ ] User can view submission details
- [ ] User can edit SUBMITTED/REJECTED submissions
- [ ] User can delete SUBMITTED/REJECTED submissions
- [ ] Dashboard shows owned parcels
- [ ] User can create listing from owned parcel
- [ ] Dashboard shows user's listings
- [ ] User can edit/deactivate listings
- [ ] Profile form updates user info
- [ ] Unauthorized users cannot access dashboard

---

## Dependencies
- AuthGuard (from Feature 01)
- Ant Design (Table, Card, Modal, Form components)
- React Query or SWR (data fetching)

## Status
🔲 Not Started
