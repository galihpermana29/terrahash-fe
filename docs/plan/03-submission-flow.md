# Feature 03: Parcel Submission Flow

## Overview
PUBLIC users can submit new parcel proposals with evidence documents. Requires authentication.

---

## Frontend Tasks

### Pages
- [ ] **/submit** - New submission page (PUBLIC users only)
  - [ ] Protected route (requires auth + type=PUBLIC)
  - [ ] Multi-step form:
    1. Draw parcel boundary on map
    2. Fill parcel details
    3. Upload evidence documents
    4. Review & submit

### Components

#### Step 1: Draw Boundary
- [ ] **DrawableMap** component
  - [ ] Leaflet map with drawing tools
  - [ ] Tools: Polygon, Rectangle
  - [ ] Allow edit/delete drawn shapes
  - [ ] Validate: must have at least one polygon
  - [ ] Export geometry as GeoJSON string
  - [ ] Show area calculation (acres)
  
- [ ] **LocationSearch** component (optional)
  - [ ] Search box to jump to location
  - [ ] Geocoding API integration (Mapbox/Google)

#### Step 2: Parcel Details
- [ ] **SubmissionForm** component
  - [ ] Input: Proposed Parcel ID (auto-suggest format: XX-0000)
  - [ ] Input: Country (dropdown, default: Kenya)
  - [ ] Input: State/Region (text)
  - [ ] Input: City (text)
  - [ ] Textarea: Notes (optional, max 500 chars)
  - [ ] Display: Calculated area from Step 1
  - [ ] Validation: all required fields

#### Step 3: Upload Evidence
- [ ] **EvidenceUploader** component
  - [ ] Drag-and-drop file upload
  - [ ] Accept: PDF, JPG, PNG (max 2MB each)
  - [ ] Multiple files allowed (max 5 files)
  - [ ] Upload to Cloudinary on select
  - [ ] Display upload progress
  - [ ] Show uploaded files list with preview
  - [ ] Allow remove file before submit
  - [ ] Store Cloudinary URLs in state

#### Step 4: Review & Submit
- [ ] **SubmissionReview** component
  - [ ] Display all entered data
  - [ ] Show map with drawn boundary
  - [ ] List evidence files with thumbnails
  - [ ] Edit buttons to go back to previous steps
  - [ ] Submit button → POST /api/submissions
  - [ ] Loading state during submission
  - [ ] Success: redirect to /dashboard with success message
  - [ ] Error: show error message, allow retry

### Layout
- [ ] **SubmissionWizard** component
  - [ ] Step indicator (1/4, 2/4, etc.)
  - [ ] Next/Previous buttons
  - [ ] Save as draft (optional)
  - [ ] Cancel button (confirm dialog)

---

## Backend Tasks

### Database Schema (Supabase)

- [ ] **submissions table** (already defined in types)
  ```sql
  CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_id UUID REFERENCES users(id) NOT NULL,
    geometry_geojson TEXT NOT NULL,
    proposed_parcel_id TEXT NOT NULL,
    admin_region JSONB, -- {country, state, city}
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    review_notes TEXT, -- Added by GOV admin
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_submissions_submitter ON submissions(submitter_id);
  CREATE INDEX idx_submissions_status ON submissions(status);
  ```

- [ ] **evidence table**
  ```sql
  CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL, -- Cloudinary URL
    file_name TEXT,
    file_type TEXT, -- MIME type
    file_size INTEGER, -- bytes
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_evidence_submission ON evidence(submission_id);
  ```

### API Routes

- [ ] **POST /api/submissions**
  - [ ] Auth required (PUBLIC only)
  - [ ] Validate request body:
    - [ ] geometry_geojson (valid GeoJSON)
    - [ ] proposed_parcel_id (format check)
    - [ ] admin_region (country required)
    - [ ] evidence_urls (array of Cloudinary URLs)
  - [ ] Insert submission record
  - [ ] Insert evidence records (bulk)
  - [ ] Return submission ID
  
- [ ] **POST /api/submissions/:id/evidence**
  - [ ] Auth required
  - [ ] Verify ownership
  - [ ] Add additional evidence to existing submission
  - [ ] Only allowed if status = SUBMITTED or REJECTED
  
- [ ] **DELETE /api/submissions/:id/evidence/:evidence_id**
  - [ ] Auth required
  - [ ] Verify ownership
  - [ ] Delete evidence record
  - [ ] Optionally delete from Cloudinary

### File Upload (Cloudinary)
- [ ] **POST /api/upload**
  - [ ] Auth required
  - [ ] Accept multipart/form-data
  - [ ] Validate file size (max 2MB)
  - [ ] Validate file type (PDF, JPG, PNG)
  - [ ] Upload to Cloudinary
  - [ ] Return { url, public_id, file_name, file_size }
  
- [ ] **DELETE /api/upload/:public_id**
  - [ ] Auth required
  - [ ] Delete from Cloudinary
  - [ ] Return success

---

## Testing Checklist
- [ ] User can draw polygon on map
- [ ] Area calculation is accurate
- [ ] Form validation works (required fields)
- [ ] File upload works (single and multiple)
- [ ] File size validation (reject >2MB)
- [ ] File type validation (reject invalid types)
- [ ] Upload progress indicator works
- [ ] User can remove uploaded file
- [ ] Review step shows all data correctly
- [ ] Submission creates DB records
- [ ] Evidence files are linked to submission
- [ ] Success redirects to dashboard
- [ ] Error messages display correctly
- [ ] Unauthenticated users cannot access /submit

---

## Dependencies
- Leaflet + Leaflet.draw (map drawing)
- Cloudinary SDK (file upload)
- Ant Design (Form, Upload, Steps components)
- React Hook Form (form state management)
- Zod (validation)

## Status
🔲 Not Started
