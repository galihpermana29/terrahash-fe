# Feature 07: Parcel Details Page

## Overview
Public page to view full details of a parcel, including ownership, listing info, and location.

---

## Frontend Tasks

### Pages
- [ ] **/parcels/:parcel_id** - Parcel details page
  - [ ] Public access (no auth required)
  - [ ] Fetch parcel data by parcel_id
  - [ ] Display full parcel information
  - [ ] Show listing info if exists
  - [ ] Show owner info (name only, not wallet)

### Components

#### Parcel Details Layout
- [ ] **ParcelDetailsHeader** component
  - [ ] Display parcel ID (large, prominent)
  - [ ] Status badge (UNCLAIMED/OWNED)
  - [ ] Listing badge (SALE/LEASE) if active listing exists
  - [ ] Breadcrumbs: Home > Map > Parcel ID
  
- [ ] **ParcelMap** component
  - [ ] Leaflet map showing parcel boundary
  - [ ] Centered on parcel geometry
  - [ ] Read-only (no editing)
  - [ ] Zoom controls
  - [ ] Fullscreen button (optional)
  
- [ ] **ParcelInfo** component
  - [ ] Display:
    - [ ] Parcel ID
    - [ ] Status (UNCLAIMED/OWNED)
    - [ ] Area (acres and m²)
    - [ ] Location (Country, State, City)
    - [ ] Coordinates (centroid lat/lng)
    - [ ] Last updated date
  - [ ] If OWNED:
    - [ ] Owner name (not wallet address)
    - [ ] Ownership date (created_at)
  
- [ ] **ListingInfo** component (if listing exists)
  - [ ] Display:
    - [ ] Listing type (SALE/LEASE)
    - [ ] Price (KES)
    - [ ] Description
    - [ ] Terms & Conditions
    - [ ] Contact info (if provided)
    - [ ] Listed date
  - [ ] Action buttons:
    - [ ] "Contact Owner" (opens modal or email)
    - [ ] "Report Issue" (optional)
  
- [ ] **ContactOwnerModal** component
  - [ ] Form:
    - [ ] Input: Your name (required)
    - [ ] Input: Your email (required)
    - [ ] Input: Your phone (optional)
    - [ ] Textarea: Message (required)
    - [ ] Checkbox: I agree to terms
  - [ ] Submit → POST /api/contact (sends email to owner)
  - [ ] Success: show confirmation message
  
- [ ] **RelatedParcels** component (optional)
  - [ ] Show nearby parcels (within X km)
  - [ ] Display as cards
  - [ ] Link to their detail pages

### SEO & Metadata
- [ ] Dynamic meta tags
  - [ ] Title: "Parcel {parcel_id} - TerraHash"
  - [ ] Description: Location and status
  - [ ] OG image: Map thumbnail (optional)
  
- [ ] Structured data (JSON-LD)
  - [ ] Schema.org/Place or RealEstateListing

---

## Backend Tasks

### API Routes

- [ ] **GET /api/parcels/:parcel_id**
  - [ ] Public access
  - [ ] Return parcel data:
    - [ ] Parcel info (id, status, geometry, admin_region, area, dates)
    - [ ] Owner info (name only, not wallet)
    - [ ] Active listing info (if exists)
  - [ ] Return 404 if parcel not found
  
- [ ] **POST /api/contact**
  - [ ] Public access (no auth required)
  - [ ] Body: { parcel_id, sender_name, sender_email, sender_phone?, message }
  - [ ] Validate inputs
  - [ ] Fetch parcel owner email
  - [ ] Send email to owner (via SendGrid, Resend, or similar)
  - [ ] Return success
  - [ ] Rate limit: max 5 requests per IP per hour

### Email Template
- [ ] **Contact Owner Email**
  - [ ] Subject: "Inquiry about Parcel {parcel_id}"
  - [ ] Body:
    - [ ] Sender name, email, phone
    - [ ] Message
    - [ ] Link to parcel page
    - [ ] Reply-to: sender email

---

## Integration with Map Page

### Map Page Updates
- [ ] Update **ParcelCard** component
  - [ ] Add "View Details" button
  - [ ] Link to /parcels/:parcel_id
  
- [ ] Update **ParcelPopup** component (map marker popup)
  - [ ] Add "View Details" link
  - [ ] Link to /parcels/:parcel_id

---

## Testing Checklist
- [ ] Parcel details page loads for valid parcel_id
- [ ] 404 page shows for invalid parcel_id
- [ ] Map displays parcel boundary correctly
- [ ] Parcel info displays all fields
- [ ] Owner name shows for OWNED parcels
- [ ] Listing info shows if active listing exists
- [ ] Contact form validates inputs
- [ ] Contact form sends email to owner
- [ ] Rate limiting prevents spam
- [ ] SEO meta tags are correct
- [ ] Page is accessible without auth
- [ ] Related parcels display (if implemented)

---

## Dependencies
- Leaflet (map display)
- Ant Design (Card, Descriptions, Modal, Form)
- Email service (SendGrid, Resend, or Nodemailer)
- Next.js metadata API (for SEO)

## Status
🔲 Not Started
