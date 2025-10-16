# Authentication Implementation Summary

## 🎯 Overview

Refactored authentication logic from Navbar component into reusable hooks with React Query pattern for better state management, caching, and error handling.

---

## 📁 File Structure

```
src/
├── hooks/
│   ├── useAuth.ts           # Main auth hook with React Query
│   └── useWalletAuth.ts     # Wallet connection + auto-auth hook
├── components/
│   ├── providers/
│   │   └── QueryProvider.tsx # React Query provider
│   └── layout/
│       └── Navbar.tsx        # Refactored to use hooks
├── lib/
│   ├── repository/
│   │   └── auth.ts           # Auth repository (Supabase)
│   └── utils/
│       └── session.ts        # Session management utilities
└── app/
    ├── layout.tsx            # Added QueryProvider
    └── api/auth/
        ├── register/route.ts
        ├── login/route.ts
        ├── logout/route.ts
        ├── me/route.ts
        └── check-wallet/[address]/route.ts
```

---

## 🔧 Core Hooks

### 1. **useAuth** (`src/hooks/useAuth.ts`)

Main authentication hook using React Query for API calls.

**State:**
```typescript
{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: 'PUBLIC' | 'GOV' | null;
}
```

**Methods:**
- `login(walletAddress: string)` - Login existing user
- `register(walletAddress: string, fullName: string)` - Register new user
- `logout()` - Logout and disconnect wallet
- `checkWalletExists(walletAddress: string)` - Check if wallet is registered

**Granular Loading States:**
- `isLoggingIn` - Login mutation pending
- `isRegistering` - Register mutation pending
- `isLoggingOut` - Logout mutation pending
- `isCheckingWallet` - Check wallet mutation pending

**React Query Features:**
- ✅ Automatic caching (5 min stale time)
- ✅ Query invalidation after mutations
- ✅ Optimistic updates
- ✅ Error handling with toast messages
- ✅ Retry logic

---

### 2. **useWalletAuth** (`src/hooks/useWalletAuth.ts`)

Handles automatic authentication when wallet connects.

**State:**
```typescript
{
  needsRegistration: boolean;
  isCheckingAuth: boolean;
}
```

**Methods:**
- `dismissRegistration()` - Close registration modal

**Flow:**
1. Watches wallet connection state
2. When wallet connects → checks if user exists
3. If exists → auto-login
4. If not exists → sets `needsRegistration = true`
5. Navbar shows registration modal

---

## 🔄 Authentication Flow

### **New User Registration**

```
1. User clicks "Connect Wallet"
   ↓
2. RainbowKit modal opens
   ↓
3. User connects wallet
   ↓
4. useWalletAuth detects connection
   ↓
5. Calls checkWalletExists(address)
   ↓
6. User not found → needsRegistration = true
   ↓
7. Registration modal appears
   ↓
8. User enters full name
   ↓
9. Calls register(address, fullName)
   ↓
10. User created + session created
   ↓
11. Modal closes, user dropdown appears
```

### **Returning User Login**

```
1. User clicks "Connect Wallet"
   ↓
2. RainbowKit modal opens
   ↓
3. User connects wallet
   ↓
4. useWalletAuth detects connection
   ↓
5. Calls checkWalletExists(address)
   ↓
6. User found → auto-login
   ↓
7. Calls login(address)
   ↓
8. Session created
   ↓
9. User dropdown appears immediately
```

### **Logout**

```
1. User clicks "Logout" in dropdown
   ↓
2. Calls logout()
   ↓
3. POST /api/auth/logout (destroys session)
   ↓
4. Disconnects wallet via wagmi
   ↓
5. Clears user state
   ↓
6. Back to "Connect Wallet" button
```

---

## 🎨 UI States in Navbar

| State | Condition | Display |
|-------|-----------|---------|
| **Not Connected** | `!isConnected` | "Connect Wallet" button |
| **Checking Auth** | `isCheckingAuth` | "Loading..." (gray button) |
| **Authenticated** | `isAuthenticated && user` | User dropdown with name + address |
| **Needs Registration** | `needsRegistration` | Registration modal |

---

## 📡 API Endpoints

### **POST /api/auth/register**
- Creates new PUBLIC user
- Validates wallet address format
- Checks for duplicates
- Creates session
- Returns user object

### **POST /api/auth/login**
- Finds user by wallet address
- Verifies GOV users are still whitelisted
- Creates session
- Returns user object

### **POST /api/auth/logout**
- Destroys session cookie
- Returns success

### **GET /api/auth/me**
- Returns current authenticated user
- 401 if not authenticated

### **GET /api/auth/check-wallet/:address**
- Checks if wallet exists in DB
- Returns `{ exists: boolean, userType?: string }`
- Also checks if wallet is whitelisted (for GOV users)

---

## 🗄️ Database Schema

### **users table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PUBLIC', 'GOV')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **gov_whitelist table**
```sql
CREATE TABLE gov_whitelist (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  added_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'ACTIVE',
  added_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 Session Management

**Cookie-based sessions** (not JWT):
- Cookie name: `terrahash-session`
- Max age: 7 days
- HttpOnly: true
- Secure: true (production only)
- SameSite: lax

**Session data:**
```typescript
{
  userId: string;
  walletAddress: string;
  userType: 'PUBLIC' | 'GOV';
  createdAt: number;
}
```

**Utilities** (`src/lib/utils/session.ts`):
- `createSession(user)` - Create session cookie
- `getSession()` - Get current session
- `destroySession()` - Delete session cookie
- `getCurrentUser()` - Get user from session
- `requireAuth()` - Throw if not authenticated
- `requireUserType(type)` - Throw if wrong user type

---

## ✅ Benefits of Refactoring

### **Before (Navbar with inline logic)**
- ❌ 120+ lines of auth logic in component
- ❌ Manual state management
- ❌ No caching
- ❌ Repeated API calls
- ❌ Hard to test
- ❌ Can't reuse in other components

### **After (Hooks + React Query)**
- ✅ Clean, focused component (45 lines)
- ✅ Reusable hooks
- ✅ Automatic caching & invalidation
- ✅ Optimistic updates
- ✅ Better error handling
- ✅ Loading states per action
- ✅ Easy to test
- ✅ Can use auth in any component

---

## 🚀 Usage in Other Components

```typescript
// In any component
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please connect wallet</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.full_name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 📋 Checklist Updates

From `docs/plan/01-authentication.md`:

### Frontend
- [x] **useAuth hook** - Global auth state management
- [x] **useWalletAuth hook** - Wallet connection handler
- [x] **RegisterModal** - Form for new PUBLIC users
- [x] **QueryProvider** - React Query setup
- [x] **Navbar integration** - Connect wallet + dropdown

### Backend
- [x] **users table** - Created in migration
- [x] **gov_whitelist table** - Created in migration
- [x] **POST /api/auth/register** - Register endpoint
- [x] **POST /api/auth/login** - Login endpoint
- [x] **POST /api/auth/logout** - Logout endpoint
- [x] **GET /api/auth/me** - Current user endpoint
- [x] **GET /api/auth/check-wallet/:address** - Check wallet endpoint
- [x] **authRepository** - Supabase data access layer
- [x] **Session utilities** - Cookie-based sessions

---

## 🔜 Next Steps

1. **Install React Query** (if not already):
   ```bash
   npm install @tanstack/react-query
   ```

2. **Test the flow**:
   - Connect wallet → should auto-login or show register modal
   - Register new user → should create user + session
   - Logout → should disconnect wallet
   - Reconnect → should auto-login

3. **Add protected routes** (Feature 02: Public Dashboard):
   ```typescript
   // In dashboard page
   const { isAuthenticated, userType } = useAuth();
   
   if (!isAuthenticated) {
     redirect('/');
   }
   
   if (userType !== 'PUBLIC') {
     redirect('/unauthorized');
   }
   ```

4. **Add GOV dashboard** (Feature 04):
   - Use same hooks
   - Check `userType === 'GOV'`
   - Implement root admin whitelist management

---

## 🐛 Troubleshooting

**Issue: "Cannot find module '@tanstack/react-query'"**
- Solution: `npm install @tanstack/react-query`

**Issue: User not auto-logging in**
- Check: Is session cookie being set?
- Check: Is QueryProvider wrapping the app?
- Check: Are API endpoints returning correct data?

**Issue: Registration modal not appearing**
- Check: Is `needsRegistration` true in useWalletAuth?
- Check: Is wallet connected?
- Check: Is user already in database?

**Issue: Logout not working**
- Check: Is `/api/auth/logout` being called?
- Check: Is wallet disconnecting?
- Check: Is session cookie being deleted?

---

## 📚 Resources

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Supabase Docs](https://supabase.com/docs)

---

**Last Updated:** Oct 16, 2025
**Status:** ✅ Complete - Ready for testing
