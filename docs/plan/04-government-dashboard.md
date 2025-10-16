# Feature 04: Government Admin Dashboard

## Overview
Dashboard for GOV users to review submissions, manage parcels, and oversee marketplace listings.

---

## Frontend Tasks

### Pages
- [ ] **/gov** - Main government dashboard (GOV users only)
  - [ ] Protected route (requires auth + type=GOV)
  - [ ] Tabs/sections:
    - [ ] Pending Submissions
    - [ ] All Submissions (history)
    - [ ] Parcel Management
    - [ ] Marketplace Overview

### Components

#### Pending Submissions Section
- [ ] **PendingSubmissionsList** component
  - [ ] Fetch submissions with status=SUBMITTED or UNDER_REVIEW
  - [ ] Display table with:
    - [ ] Submission ID
    - [ ] Submitter name
    - [ ] Proposed Parcel ID
    - [ ] Location (admin_region)
    - [ ] Submitted date
    - [ ] Status badge
    - [ ] Action: Review
  - [ ] Sort by date (newest first)
  - [ ] Pagination
  
- [ ] **SubmissionReviewModal** component
  - [ ] Display submission details:
    - [ ] Submitter info (name, wallet)
    - [ ] Proposed parcel ID
    - [ ] Location details
    - [ ] Notes from submitter
    - [ ] Submission date
  - [ ] Show geometry on map (read-only or editable)
  - [ ] List evidence files with preview/download
  - [ ] Review form:
    - [ ] Dropdown: Action (Approve/Reject/Request More Info)
    - [ ] Textarea: Review notes (required if reject)
    - [ ] If Approve:
      - [ ] Option to edit parcel_id
      - [ ] Option to edit geometry
      - [ ] Confirm creates new Parcel with status=OWNED
    - [ ] Submit button → PATCH /api/submissions/:id/review
  - [ ] Show loading state
  - [ ] Success: close modal, refresh list

#### All Submissions Section
- [ ] **SubmissionHistoryList** component
  - [ ] Fetch all submissions (all statuses)
  - [ ] Display table with:
    - [ ] Submission ID
    - [ ] Submitter name
    - [ ] Proposed Parcel ID
    - [ ] Status badge
    - [ ] Submitted date
    - [ ] Reviewed by (if reviewed)
    - [ ] Reviewed date
    - [ ] Action: View Details
  - [ ] Filter by status, date range, submitter
  - [ ] Search by parcel ID or submitter name
  - [ ] Export to CSV (optional)
  - [ ] Pagination

#### Parcel Management Section
- [ ] **ParcelManagementList** component
  - [ ] Fetch all parcels
  - [ ] Display table with:
    - [ ] Parcel ID
    - [ ] Owner name (if owned)
    - [ ] Status (UNCLAIMED/OWNED)
    - [ ] Location
    - [ ] Area (acres)
    - [ ] Last updated
    - [ ] Actions: View, Edit, Change Status
  - [ ] Filter by status, location
  - [ ] Search by parcel ID or owner
  - [ ] Pagination
  
- [ ] **AddParcelModal** component
  - [ ] For GOV to manually add parcels (from paperwork)
  - [ ] Draw boundary on map OR upload GeoJSON
  - [ ] Form fields:
    - [ ] Parcel ID (required, unique)
    - [ ] Country, State, City
    - [ ] Status (UNCLAIMED/OWNED)
    - [ ] Owner (search user by wallet, optional)
    - [ ] Notes
  - [ ] Submit → POST /api/parcels
  
- [ ] **EditParcelModal** component
  - [ ] Edit existing parcel
  - [ ] Allow edit geometry (map drawing)
  - [ ] Allow edit parcel_id, admin_region, notes
  - [ ] Allow change status (UNCLAIMED ↔ OWNED)
  - [ ] Allow change owner (search user)
  - [ ] Submit → PATCH /api/parcels/:parcel_id
  
- [ ] **ChangeOwnershipModal** component
  - [ ] Quick action to change parcel status
  - [ ] Dropdown: New status (UNCLAIMED/OWNED)
  - [ ] If OWNED: search and select owner (by wallet)
  - [ ] If UNCLAIMED: clear owner_id
  - [ ] Textarea: Reason/notes
  - [ ] Submit → PATCH /api/parcels/:parcel_id/ownership

#### Marketplace Overview Section
- [ ] **MarketplaceListingsList** component
  - [ ] Fetch all listings (SALE and LEASE)
  - [ ] Display table with:
    - [ ] Parcel ID
    - [ ] Owner name
    - [ ] Type (SALE/LEASE)
    - [ ] Price (KES)
    - [ ] Status (Active/Inactive)
    - [ ] Created date
    - [ ] Action: View Details
  - [ ] Filter by type, status
  - [ ] Search by parcel ID or owner
  - [ ] Pagination
  - [ ] Analytics: Total active listings, avg price, etc.

### Layout
- [ ] **GovDashboardLayout** component
  - [ ] Sidebar navigation
  - [ ] Links: Pending Submissions, All Submissions, Parcel Management, Marketplace
  - [ ] User info in header (GOV badge)
  - [ ] Breadcrumbs

---

## Backend Tasks

### API Routes

#### Submission Review
- [ ] **GET /api/submissions**
  - [ ] Auth required (GOV only)
  - [ ] Query params: status, page, limit, submitter_id, date_from, date_to
  - [ ] Return submissions with submitter info
  - [ ] Include evidence count
  
- [ ] **GET /api/submissions/:id**
  - [ ] Auth required (GOV only)
  - [ ] Return full submission details
  - [ ] Include submitter info
  - [ ] Include evidence array
  
- [ ] **PATCH /api/submissions/:id/review**
  - [ ] Auth required (GOV only)
  - [ ] Body: { action: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW', review_notes, parcel_data }
  - [ ] Update submission status
  - [ ] Set reviewed_by, reviewed_at
  - [ ] If APPROVE:
    - [ ] Create new Parcel record (or update if exists)
    - [ ] Set parcel.status = OWNED
    - [ ] Set parcel.owner_id = submission.submitter_id
    - [ ] Copy geometry, admin_region
  - [ ] Return updated submission

#### Parcel Management
- [ ] **GET /api/parcels**
  - [ ] Auth required (GOV only)
  - [ ] Query params: status, owner_id, page, limit, search
  - [ ] Return parcels with owner info
  - [ ] Include listing info if exists
  
- [ ] **POST /api/parcels**
  - [ ] Auth required (GOV only)
  - [ ] Validate parcel_id uniqueness
  - [ ] Validate geometry (GeoJSON)
  - [ ] Insert parcel record
  - [ ] Return created parcel
  
- [ ] **PATCH /api/parcels/:parcel_id**
  - [ ] Auth required (GOV only)
  - [ ] Allow update: geometry, admin_region, notes, status, owner_id
  - [ ] Validate changes
  - [ ] Update parcel record
  - [ ] Return updated parcel
  
- [ ] **PATCH /api/parcels/:parcel_id/ownership**
  - [ ] Auth required (GOV only)
  - [ ] Body: { status, owner_id?, notes }
  - [ ] Update parcel status and owner
  - [ ] Log change (optional audit trail)
  - [ ] Return updated parcel
  
- [ ] **DELETE /api/parcels/:parcel_id**
  - [ ] Auth required (GOV only)
  - [ ] Soft delete or hard delete
  - [ ] Check if parcel has active listings (prevent delete)
  - [ ] Return success

#### Marketplace Oversight
- [ ] **GET /api/listings**
  - [ ] Auth required (GOV only)
  - [ ] Query params: type, active, page, limit, search
  - [ ] Return listings with parcel and owner info
  - [ ] Include analytics data

---

## Testing Checklist
- [ ] GOV user can access dashboard
- [ ] PUBLIC user cannot access /gov
- [ ] Pending submissions list loads
- [ ] GOV can review submission (approve/reject)
- [ ] Approving submission creates parcel
- [ ] Rejecting submission updates status
- [ ] Review notes are saved
- [ ] Submission history shows all submissions
- [ ] Filters and search work correctly
- [ ] GOV can add new parcel manually
- [ ] GOV can edit existing parcel
- [ ] GOV can change parcel ownership
- [ ] Marketplace listings display correctly
- [ ] Analytics data is accurate

---

## Dependencies
- AuthGuard with role check (GOV only)
- Ant Design (Table, Modal, Form, Select)
- Leaflet + Leaflet.draw (map editing)
- React Query or SWR (data fetching)

## Status
🔲 Not Started
