# Feature 05: Root Admin Dashboard (Whitelist Management)

## Overview
Super admin dashboard to manage GOV user whitelist. Only accessible by pre-configured root admin wallet(s).

---

## Frontend Tasks

### Pages
- [ ] **/root-admin** - Root admin dashboard (root admin only)
  - [ ] Protected route (requires auth + wallet in root admin list)
  - [ ] Single section: GOV Whitelist Management

### Components

#### GOV Whitelist Management
- [ ] **WhitelistTable** component
  - [ ] Fetch all whitelisted GOV wallets
  - [ ] Display table with:
    - [ ] Wallet Address
    - [ ] Added by (admin name)
    - [ ] Added date
    - [ ] Status (Active/Revoked)
    - [ ] Actions: Revoke, Restore
  - [ ] Search by wallet address
  - [ ] Filter by status
  - [ ] Pagination
  
- [ ] **AddWhitelistModal** component
  - [ ] Input: Wallet Address (validate format)
  - [ ] Button: Add to Whitelist
  - [ ] Submit → POST /api/admin/whitelist
  - [ ] Success: close modal, refresh table
  - [ ] Error: show error message (e.g., already exists)
  
- [ ] **RevokeWhitelistModal** component
  - [ ] Confirm dialog
  - [ ] Display wallet address to revoke
  - [ ] Warning: User will lose GOV access
  - [ ] Submit → DELETE /api/admin/whitelist/:wallet_address
  - [ ] Success: close modal, refresh table

### Layout
- [ ] **RootAdminLayout** component
  - [ ] Simple header with "Root Admin" badge
  - [ ] User info (root admin wallet)
  - [ ] Logout button

### Configuration
- [ ] **Root Admin Wallet List** (environment variable or config file)
  - [ ] Store in `.env.local`: `ROOT_ADMIN_WALLETS=0xABC...,0xDEF...`
  - [ ] Parse comma-separated list
  - [ ] Check on auth: if user.wallet_address in ROOT_ADMIN_WALLETS → grant access

---

## Backend Tasks

### Database Schema (Supabase)

- [ ] **gov_whitelist table** (already defined in Feature 01)
  - [ ] Add `status` column (optional):
  ```sql
  ALTER TABLE gov_whitelist ADD COLUMN status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED'));
  ```

### API Routes

- [ ] **GET /api/admin/whitelist**
  - [ ] Auth required (root admin only)
  - [ ] Return all whitelist entries
  - [ ] Include added_by user info
  - [ ] Sort by added_at DESC
  
- [ ] **POST /api/admin/whitelist**
  - [ ] Auth required (root admin only)
  - [ ] Body: { wallet_address }
  - [ ] Validate wallet address format
  - [ ] Check if already exists
  - [ ] Insert whitelist record
  - [ ] Set added_by = current admin user_id
  - [ ] Return created record
  
- [ ] **DELETE /api/admin/whitelist/:wallet_address**
  - [ ] Auth required (root admin only)
  - [ ] Soft delete: set status = REVOKED
  - [ ] OR hard delete: remove record
  - [ ] Return success
  
- [ ] **POST /api/admin/whitelist/:wallet_address/restore**
  - [ ] Auth required (root admin only)
  - [ ] Set status = ACTIVE
  - [ ] Return updated record

### Middleware
- [ ] **rootAdminMiddleware** - Check if user wallet is in ROOT_ADMIN_WALLETS
  - [ ] Read from env variable
  - [ ] Compare with user.wallet_address
  - [ ] Return 403 if not authorized

---

## Testing Checklist
- [ ] Root admin can access /root-admin
- [ ] Non-root admin cannot access /root-admin
- [ ] GOV user cannot access /root-admin
- [ ] PUBLIC user cannot access /root-admin
- [ ] Root admin can view whitelist
- [ ] Root admin can add wallet to whitelist
- [ ] Duplicate wallet address is rejected
- [ ] Root admin can revoke whitelist entry
- [ ] Revoked GOV user loses access to /gov
- [ ] Root admin can restore revoked entry
- [ ] Search and filter work correctly

---

## Dependencies
- AuthGuard with root admin check
- Ant Design (Table, Modal, Form)
- Environment variables (ROOT_ADMIN_WALLETS)

## Status
🔲 Not Started
