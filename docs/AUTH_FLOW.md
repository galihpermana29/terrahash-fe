# Authentication Flow

## Overview

TerraHash uses **custom wallet-based authentication** with Supabase for storage and session management via secure httpOnly cookies.

**No JWT package needed** - we use browser cookies with custom session data.

---

## 🔐 Why Custom Auth (Not Supabase Auth)?

Supabase Auth is designed for email/password login. For wallet-based auth:

**Custom Approach:**
- ✅ We control the wallet verification logic
- ✅ No email/password needed
- ✅ Simple session cookies (httpOnly, secure)
- ✅ Works with RainbowKit wallet connection
- ✅ No external auth provider dependencies

**vs Supabase Auth:**
- ❌ Would need to map wallets to fake email addresses
- ❌ Complex integration with wallet signatures
- ❌ Overkill for simple wallet auth

---

## 📊 Session Management

### How Sessions Work

```typescript
// Cookie: terrahash-session (httpOnly, secure, 7 days)
{
  userId: "uuid",
  walletAddress: "0x123...",
  userType: "PUBLIC" | "GOV",
  createdAt: timestamp
}
```

**Storage:** Browser cookie (not localStorage!)
**Expiry:** 7 days
**Security:** httpOnly (can't be accessed by JavaScript), secure (HTTPS only in production)

### Session Functions

```typescript
// Create session after login/register
await createSession(user);

// Get current session
const session = await getSession();

// Get current user (from session + DB lookup)
const user = await getCurrentUser();

// Destroy session (logout)
await destroySession();
```

---

## 🔄 Complete Auth Flow

### 1️⃣ User Connects Wallet (RainbowKit)

```typescript
// Frontend: User clicks "Connect Wallet"
const { address } = useAccount();

// Wallet connects via RainbowKit
// address = "0x123..."
```

### 2️⃣ Check Wallet Status

```typescript
// Frontend: Check if wallet is registered
const response = await fetch(`/api/auth/check-wallet/${address}`);
const { exists, userType, isWhitelisted } = await response.json();

if (exists) {
  // User already registered → Login
  handleLogin(address);
} else if (isWhitelisted) {
  // GOV wallet (whitelisted but not in DB)
  // This shouldn't happen - whitelist creates user
  showError("Contact admin");
} else {
  // New wallet → Register
  showRegisterModal(address);
}
```

**API Route:** `GET /api/auth/check-wallet/[address]`
- Returns: `{ exists: boolean, userType?: string, isWhitelisted?: boolean }`

### 3️⃣ Register (New PUBLIC User)

```typescript
// Frontend: User fills registration form
const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    wallet_address: address,
    full_name: 'John Doe',
  }),
});

const { user } = await response.json();
// user = { id, wallet_address, type: 'PUBLIC', full_name, created_at }

// Session automatically created by backend
// User is now logged in ✓
```

**API Route:** `POST /api/auth/register`
- Validates wallet format
- Checks if wallet already exists
- Checks if wallet is whitelisted (GOV users can't self-register)
- Creates user in `users` table
- Creates session cookie
- Returns user object

### 4️⃣ Login (Existing User)

```typescript
// Frontend: User connects wallet (already registered)
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    wallet_address: address,
  }),
});

const { user } = await response.json();
// Session automatically created
// User is now logged in ✓
```

**API Route:** `POST /api/auth/login`
- Validates wallet format
- Finds user by wallet address
- If GOV user → verifies still whitelisted
- Creates session cookie
- Returns user object

### 5️⃣ Get Current User

```typescript
// Frontend: On page load, check if logged in
const response = await fetch('/api/auth/me');

if (response.ok) {
  const { user } = await response.json();
  // User is logged in
  setAuthState({ user, isAuthenticated: true });
} else {
  // User not logged in
  setAuthState({ user: null, isAuthenticated: false });
}
```

**API Route:** `GET /api/auth/me`
- Reads session cookie
- Looks up user in DB
- Returns user object or 401

### 6️⃣ Logout

```typescript
// Frontend: User clicks "Logout"
await fetch('/api/auth/logout', { method: 'POST' });

// Also disconnect wallet
disconnect();

// Clear auth state
setAuthState({ user: null, isAuthenticated: false });
```

**API Route:** `POST /api/auth/logout`
- Deletes session cookie
- User logged out ✓

---

## 🛡️ Protected Routes (Backend)

### Simple Auth Check

```typescript
// src/app/api/submissions/me/route.ts
import { requireAuth } from '@/lib/utils/session';

export async function GET() {
  const user = await requireAuth(); // Throws if not authenticated

  // User is authenticated, proceed
  const submissions = await getSubmissions(user.id);
  return Response.json({ submissions });
}
```

### Role-Based Access

```typescript
// src/app/api/submissions/[id]/review/route.ts
import { requireUserType } from '@/lib/utils/session';

export async function PATCH() {
  const user = await requireUserType('GOV'); // Throws if not GOV

  // User is GOV admin, proceed
  await reviewSubmission(params.id);
  return Response.json({ success: true });
}
```

### Root Admin Only

```typescript
// src/app/api/admin/whitelist/route.ts
import { requireRootAdmin } from '@/lib/utils/session';

export async function POST() {
  const admin = await requireRootAdmin(); // Throws if not root admin

  // User is root admin, proceed
  await addToWhitelist(wallet);
  return Response.json({ success: true });
}
```

---

## 🎨 Frontend Implementation

### Next Step: Create Auth Context

You'll need to create:

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Wraps app in `layout.tsx`
   - Provides: `{ user, isAuthenticated, isLoading, login, logout, register }`
   - Checks `/api/auth/me` on mount
   - Stores state in React context

2. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - Consumes AuthContext
   - Easy access: `const { user, login, logout } = useAuth()`

3. **Update Navbar** (`src/components/layout/Navbar.tsx`)
   - Use real auth state instead of static "galih permana"
   - Show "Connect Wallet" if not connected
   - Show "Register" if connected but not registered
   - Show user info + dropdown if authenticated

4. **AuthGuard Component** (`src/components/auth/AuthGuard.tsx`)
   - Wrap protected pages: `<AuthGuard><DashboardPage /></AuthGuard>`
   - Redirects to home if not authenticated
   - Shows loading spinner while checking

5. **Register Modal** (`src/components/auth/RegisterModal.tsx`)
   - Form: full_name (optional)
   - Calls `/api/auth/register`
   - Auto-closes and updates auth state on success

---

## 🧪 Testing the Auth Flow

### 1. Test Registration (New Wallet)

```bash
# Start dev server
npm run dev

# Test register endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x1234567890123456789012345678901234567890",
    "full_name": "Test User"
  }'

# Expected: 201 Created
# Response: { success: true, data: { user: {...}, message: "Registration successful" } }
```

### 2. Test Login (Existing Wallet)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x1234567890123456789012345678901234567890"
  }'

# Expected: 200 OK
# Response: { success: true, data: { user: {...}, message: "Login successful" } }
```

### 3. Test Me (Check Session)

```bash
# Note: Won't work with curl (cookies not sent)
# Test in browser: visit http://localhost:3000/api/auth/me
# Or use Thunder Client / Postman with cookie support

# Expected: 200 OK (if logged in) or 401 Unauthorized
```

### 4. Test Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout

# Expected: 200 OK
# Response: { success: true, data: { message: "Logout successful" } }
```

---

## 📝 Summary

✅ **Completed:**
- Auth repository with DB methods
- Session management with httpOnly cookies
- 5 API routes: register, login, logout, me, check-wallet
- Protected route helpers: requireAuth, requireUserType, requireRootAdmin

🔲 **Next Steps:**
1. Create AuthContext + useAuth hook
2. Update Navbar to use real auth
3. Create RegisterModal component
4. Create AuthGuard component
5. Test full flow with RainbowKit

**No JWT package needed** - we're using simple, secure session cookies! 🎉
