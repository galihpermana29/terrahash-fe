# Feature 01: Authentication & User Management

## Overview

Wallet-based authentication only. 1 wallet = 1 account. Two user types: PUBLIC and GOV.

## User Flow

1. User connects wallet via RainbowKit
2. Check if wallet exists in database
3. If not exists → Register flow (PUBLIC users only)
4. If exists → Login (fetch user data)
5. GOV users must be pre-whitelisted by root admin

---

## Frontend Tasks

### Components

- [x] **ConnectWalletButton** - Implemented in Navbar with RainbowKit
- [x] **RegisterModal** - Form for new PUBLIC users
  - [x] Input: Full Name (required)
  - [x] Auto-capture: wallet_address from connected wallet
  - [x] Submit → POST /api/auth/register
- [x] **AuthGuard** - HOC/wrapper to protect routes
  - [x] Check if user is authenticated
  - [x] Redirect to home if not authenticated
  - [x] Check user type for role-based access
  - [x] Custom redirect paths
  - [x] Custom loading fallback
- [x] **useAuth hook** - Global auth state management with React Query
  - [x] State: user, isAuthenticated, isLoading, userType
  - [x] Methods: login(), logout(), register(), checkWalletExists()
  - [x] Granular loading states: isLoggingIn, isRegistering, isLoggingOut
- [x] **useWalletAuth hook** - Automatic auth on wallet connection
  - [x] State: needsRegistration, isCheckingAuth
  - [x] Auto-login for existing users
  - [x] Show registration modal for new users

### Pages

- [ ] **/auth/register** - Registration page (PUBLIC only) - Not needed (using modal)
- [x] **/unauthorized** - Error page for unauthorized access
- [x] **/dashboard** - PUBLIC user dashboard (placeholder)
- [x] **/gov** - GOV user dashboard (placeholder)

### State Management

- [x] **React Query** - Global state management
  - [x] QueryProvider wraps app in layout.tsx
  - [x] Automatic caching and invalidation
  - [x] Optimistic updates

### Integration

- [x] Update **Navbar** dropdown
  - [x] Show "Register" modal if wallet connected but not in DB
  - [x] Show user name + address if authenticated
  - [x] Logout clears auth state + disconnects wallet
  - [x] Auto-login on wallet connection

---

## Backend Tasks

### Database Schema (Supabase)

- [x] **users table** - Created in `supabase/migrations/001_initial_schema.sql`

  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PUBLIC', 'GOV')),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_users_wallet ON users(wallet_address);
  CREATE INDEX idx_users_type ON users(type);
  ```

- [x] **gov_whitelist table** - Created in `supabase/migrations/001_initial_schema.sql`
  ```sql
  CREATE TABLE gov_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    added_by UUID REFERENCES users(id),
    status TEXT DEFAULT 'ACTIVE',
    added_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_gov_whitelist_wallet ON gov_whitelist(wallet_address);
  ```

### API Routes

- [x] **POST /api/auth/register** - `src/app/api/auth/register/route.ts`
  - [x] Validate wallet address format
  - [x] Check if wallet already exists
  - [x] Insert new user into users table (type=PUBLIC)
  - [x] Create session cookie
  - [x] Return user object
- [x] **POST /api/auth/login** - `src/app/api/auth/login/route.ts`
  - [x] Fetch user by wallet_address
  - [x] If not found, return 404
  - [x] If GOV user, verify still in whitelist
  - [x] Create session cookie
  - [x] Return user object
- [x] **GET /api/auth/me** - `src/app/api/auth/me/route.ts`
  - [x] Get session from cookie
  - [x] Return current user data
  - [x] Return 401 if not authenticated
- [x] **POST /api/auth/logout** - `src/app/api/auth/logout/route.ts`
  - [x] Clear session cookie
  - [x] Return success
- [x] **GET /api/auth/check-wallet/:address** - `src/app/api/auth/check-wallet/[address]/route.ts`
  - [x] Check if wallet exists in DB
  - [x] Check if wallet is whitelisted
  - [x] Return { exists: boolean, userType?: string, isWhitelisted?: boolean }

### Repository & Utilities

- [x] **authRepository** - `src/lib/repository/auth.ts`
  - [x] register() - Create new user
  - [x] findByWallet() - Find user by wallet address
  - [x] isWhitelisted() - Check GOV whitelist
  - [x] findById() - Get user by ID
  - [x] updateProfile() - Update user info
  - [x] isRootAdmin() - Check if wallet is root admin
- [x] **Session utilities** - `src/lib/utils/session.ts`
  - [x] createSession() - Create session cookie
  - [x] getSession() - Get current session
  - [x] destroySession() - Delete session
  - [x] getCurrentUser() - Get user from session
  - [x] requireAuth() - Throw if not authenticated
  - [x] requireUserType() - Throw if wrong type

---

## Testing Checklist

- [x] PUBLIC user can register with wallet
- [ ] Existing user can login
- [ ] GOV user without whitelist is rejected
- [ ] Whitelisted GOV user can login
- [ ] Logout disconnects wallet and clears state
- [ ] Protected routes redirect unauthenticated users
- [ ] Auth state persists on page refresh

---

## Dependencies

- wagmi (wallet connection)
- RainbowKit (wallet UI)
- Supabase client
- JWT library (optional, or use Supabase auth)

## Status

✅ **Completed** - Ready for testing

## Next Steps

1. **Install React Query** (if not installed):

   ```bash
   npm install @tanstack/react-query
   ```

2. **Run database migration**:

   - Execute `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor

3. **Set environment variables** in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ROOT_ADMIN_WALLETS=0xYourWallet1,0xYourWallet2
   ```

4. **Test the authentication flow**:

   - Connect wallet → should auto-login or show register modal
   - Register new user → should create user + session
   - Logout → should disconnect wallet
   - Reconnect → should auto-login

5. **See detailed implementation docs**: `docs/AUTH_IMPLEMENTATION.md`
