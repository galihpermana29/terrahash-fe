# Feature 05: Root Admin Dashboard (Whitelist Management)

## Overview
Super admin dashboard to manage GOV user whitelist. Only accessible by pre-configured root admin wallet(s).

---

## Frontend Tasks

### Pages
- [x] **/root-admin** - Root admin dashboard (root admin only)
  - [x] Protected route (requires auth + wallet in root admin list)
  - [x] Single section: GOV Whitelist Management
  - [x] Uses AuthGuard with `requiredUserType="ROOT"`

### Components

#### GOV Whitelist Management
- [x] **WhitelistTable** component
  - [x] Fetch all whitelisted GOV wallets
  - [x] Display table with:
    - [x] Wallet Address (truncated)
    - [x] Full Name
    - [x] Added date
    - [x] Status (Active/Revoked) with color tags
    - [x] Actions: Revoke, Activate
  - [ ] Search by wallet address
  - [ ] Filter by status
  - [x] Pagination (with page size options)
  
- [x] **AddWhitelistModal** component
  - [x] Input: Wallet Address (validate format with regex)
  - [x] Input: Full Name (required)
  - [x] Button: Add to Whitelist
  - [x] Submit → POST /api/wallet/whitelists
  - [x] Success: close modal, refresh table
  - [x] Error: show error message via toast
  - [x] Loading state during submission
  
- [x] **RevokeWhitelistModal** component (integrated as Popconfirm)
  - [x] Confirm dialog (using Ant Design Popconfirm)
  - [x] Display action confirmation
  - [x] Warning message
  - [x] Submit → PATCH /api/wallet/whitelists?user_id=xxx
  - [x] Success: refresh table with toast message
  - [x] Toggle between Revoke/Activate

### Layout
- [x] **RootAdminLayout** component (integrated in page)
  - [x] Header with "GOV User Whitelist" title
  - [x] Add User button
  - [x] User info available in Navbar dropdown
  - [x] Logout button in Navbar

### Configuration
- [x] **Root Admin Wallet List** (environment variable)
  - [x] Store in `.env.local`: `ROOT_ADMIN_WALLETS=0xABC...`
  - [x] Check on auth: if wallet_address === ROOT_ADMIN_WALLETS → grant ROOT type
  - [x] Implemented in `/api/auth/check-wallet` and `/api/auth/login`
  - [x] Session handling for ROOT user in `session.ts`

---

## Backend Tasks

### Database Schema (Supabase)

- [x] **gov_whitelist table** (already defined in Feature 01)
  - [x] Migration created: `20251016173645_update_gov_whitelist.sql`
  - [x] Removed `added_by` and `wallet_address` columns
  - [x] Table structure: `id`, `user_id`, `status`, `added_at`
  - [x] Status column exists with CHECK constraint

### API Routes

- [x] **GET /api/wallet/whitelists**
  - [x] Auth required (root admin only)
  - [x] Return all whitelist entries
  - [x] Include joined user info via `users:user_id (*)`
  - [x] Sort by added_at DESC
  - [x] Returns 403 if user.type !== "ROOT"
  
- [x] **POST /api/wallet/whitelists**
  - [x] Auth required (root admin only)
  - [x] Body: { wallet_address, full_name }
  - [x] Creates user in `users` table with type='GOV'
  - [x] Creates entry in `gov_whitelist` table
  - [x] Status defaults to 'ACTIVE'
  - [x] Return created user
  - [x] Returns 403 if user.type !== "ROOT"
  
- [x] **PATCH /api/wallet/whitelists?user_id=xxx**
  - [x] Auth required (root admin only)
  - [x] Body: { status: "ACTIVE" | "REVOKED" }
  - [x] Soft delete: set status = REVOKED
  - [x] Or restore: set status = ACTIVE
  - [x] Validates status enum
  - [x] Return success
  - [x] Returns 403 if user.type !== "ROOT"
  
- [ ] **DELETE /api/wallet/whitelists/:id** (not implemented - using PATCH instead)
  - [ ] Hard delete functionality (optional future enhancement)

### Middleware
- [x] **Root Admin Auth Check** (implemented in API routes)
  - [x] Uses `getCurrentUser()` from session utils
  - [x] Checks if `user.type === "ROOT"`
  - [x] Returns 401 if not authenticated
  - [x] Returns 403 if not ROOT user
  - [x] Applied to all whitelist endpoints

---

## Additional Implementation Details

### Hooks
- [x] **useWhitelist** (`src/hooks/root-admin/useWhitelist.tsx`)
  - [x] React Query integration
  - [x] Query for fetching whitelists
  - [x] Mutation for adding users
  - [x] Mutation for toggling status
  - [x] Automatic cache invalidation
  - [x] Toast notifications using `App.useApp()`
  - [x] Loading states

### Types
- [x] **Whitelist Types** (`src/lib/types/whitelist.ts`)
  - [x] `GovWhitelist` interface
  - [x] `WhitelistStatus` type
  - [x] `AddWhitelistPayload` interface
  - [x] `UpdateWhitelistStatusPayload` interface
  - [x] API response types

### Client Actions
- [x] **Whitelist Client Actions** (`src/client-action/whitelist.ts`)
  - [x] `getWhitelists()` - Fetch all whitelists
  - [x] `addWhitelist(data)` - Add new GOV user
  - [x] `updateWhitelistStatus(userId, data)` - Toggle status

### User Type System
- [x] **ROOT User Type** added to system
  - [x] Updated `UserType` in `src/lib/types/user.ts`
  - [x] Updated `AuthGuard` to support ROOT type
  - [x] Updated Navbar to show "Root Admin" link for ROOT users
  - [x] ROOT user redirect logic in AuthGuard

### Auth Integration
- [x] **ROOT Admin Authentication**
  - [x] Check in `/api/auth/check-wallet` route
  - [x] Check in `/api/auth/login` route
  - [x] Session handling in `getCurrentUser()`
  - [x] Environment variable: `ROOT_ADMIN_WALLETS`

### UI/UX Features
- [x] Table with columns: Full Name, Wallet Address, Status, Added At, Actions
- [x] Wallet address truncation (0x1234...5678)
- [x] Status color tags (green for ACTIVE, red for REVOKED)
- [x] Popconfirm for status toggle
- [x] Form validation with regex for wallet address
- [x] Loading states on buttons
- [x] Toast notifications for success/error
- [x] Modal auto-close on success
- [x] Form reset after submission

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
- [ ] Search and filter work correctly (not implemented yet)
- [ ] Toast messages show correctly
- [ ] Table pagination works
- [ ] Form validation works

---

## Dependencies
- [x] AuthGuard with root admin check
- [x] Ant Design (Table, Modal, Form, Popconfirm, Tag, App)
- [x] React Query (@tanstack/react-query)
- [x] Environment variables (ROOT_ADMIN_WALLETS)
- [x] Custom UI components (@gal-ui/components)

## Status
✅ **Mostly Complete** - Core functionality implemented

### Completed
- ✅ Root admin page with table
- ✅ Add user functionality
- ✅ Toggle status (Revoke/Activate)
- ✅ API endpoints (GET, POST, PATCH)
- ✅ Authentication and authorization
- ✅ React Query integration
- ✅ Toast notifications
- ✅ Form validation
- ✅ Loading states
- ✅ Database migration

### Pending
- ⏳ Search by wallet address
- ⏳ Filter by status
- ⏳ Manual testing
- ⏳ Hard delete functionality (optional)
