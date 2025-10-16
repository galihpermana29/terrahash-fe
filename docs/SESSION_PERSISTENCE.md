# Session Persistence Implementation

## Problem

The original implementation used local `useState` which caused:

1. ❌ **Flash of unauthenticated state** on page refresh
2. ❌ **AuthGuard redirects** before session could be checked
3. ❌ **Poor UX** - User sees login screen even with valid session
4. ❌ **State resets to initial** on every component mount

```typescript
// OLD: Always started with null/false
const [authState, setAuthState] = useState({
  user: null,           // ❌ Resets on mount
  isAuthenticated: false, // ❌ Resets on mount
});
```

## Solution

Replaced local state with **React Query** for automatic session persistence:

```typescript
// NEW: Fetches session on mount, caches result
const { data: sessionData, isLoading } = useQuery({
  queryKey: ["currentUser"],
  queryFn: getCurrentUser,
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});

// Derive state from query
const user = sessionData?.success ? sessionData.data.user : null;
const isAuthenticated = !!user;
```

## Benefits

✅ **Persistent auth state** - Survives page refreshes  
✅ **No flash of content** - Loads session before rendering  
✅ **Automatic caching** - React Query handles cache  
✅ **Optimistic updates** - Mutations update cache immediately  
✅ **Better UX** - Smooth experience across navigation  

## How It Works

### On Initial Mount

```
1. Component mounts
   ↓
2. useQuery fetches /api/auth/me
   ↓
3. isLoading = true (shows spinner)
   ↓
4. API returns session data
   ↓
5. Query cache updated
   ↓
6. isAuthenticated = true ✅
   ↓
7. Component renders with user data
```

### On Page Refresh

```
1. Component mounts
   ↓
2. React Query checks cache
   ↓
3. Cache has data (within staleTime)
   ↓
4. isAuthenticated = true immediately ✅
   ↓
5. No flash, no redirect
   ↓
6. Background refetch (if needed)
```

### On Login/Register

```
1. User logs in
   ↓
2. Login mutation succeeds
   ↓
3. queryClient.setQueryData(["currentUser"], data)
   ↓
4. Query cache updated immediately
   ↓
5. All components re-render with new state ✅
```

### On Logout

```
1. User logs out
   ↓
2. Logout mutation succeeds
   ↓
3. queryClient.setQueryData(["currentUser"], null)
   ↓
4. Query cache cleared
   ↓
5. isAuthenticated = false ✅
   ↓
6. AuthGuard redirects
```

## Code Changes

### 1. Added Session API Endpoint

**`src/app/api/auth/session/route.ts`**

```typescript
export async function GET() {
  const session = await getSession();
  return successResponse({ session });
}
```

### 2. Refactored useAuth Hook

**Before:**
```typescript
const [authState, setAuthState] = useState({
  user: null,
  isAuthenticated: false,
});

// Mutations manually call setAuthState()
```

**After:**
```typescript
// Query fetches session on mount
const { data: sessionData, isLoading } = useQuery({
  queryKey: ["currentUser"],
  queryFn: getCurrentUser,
});

// Derive state from query
const user = sessionData?.success ? sessionData.data.user : null;
const isAuthenticated = !!user;

// Mutations update query cache
queryClient.setQueryData(["currentUser"], data);
```

### 3. State is Now Derived

**Before:** State stored in `useState`  
**After:** State derived from React Query cache

```typescript
// Derived state (no useState needed)
const user = sessionData?.success ? sessionData.data.user : null;
const isAuthenticated = !!user;
const userType = user?.type || null;
```

## Query Configuration

```typescript
useQuery({
  queryKey: ["currentUser"],
  queryFn: getCurrentUser,
  retry: false,                    // Don't retry on 401
  staleTime: 5 * 60 * 1000,       // Cache for 5 minutes
  refetchOnWindowFocus: false,     // Don't refetch on focus
});
```

### Why These Settings?

- **`retry: false`** - 401 errors are expected (not logged in), don't retry
- **`staleTime: 5 min`** - Session doesn't change often, cache it
- **`refetchOnWindowFocus: false`** - Prevent unnecessary API calls

## Cache Updates

### Login/Register

```typescript
onSuccess: (data) => {
  if (data.success) {
    // Update cache immediately
    queryClient.setQueryData(["currentUser"], data);
  }
}
```

### Logout

```typescript
onSuccess: () => {
  // Clear cache
  queryClient.setQueryData(["currentUser"], null);
  disconnect?.();
}
```

### Wallet Disconnect

```typescript
useEffect(() => {
  if (!isConnected && isAuthenticated) {
    // Clear cache when wallet disconnects
    queryClient.setQueryData(["currentUser"], null);
  }
}, [isConnected, isAuthenticated]);
```

## Testing

### Test Scenarios

1. **Fresh visit (no session)**
   - Query returns null
   - isAuthenticated = false
   - Shows login UI

2. **Page refresh (has session)**
   - Query returns cached data immediately
   - isAuthenticated = true
   - No flash, no redirect ✅

3. **Login**
   - Mutation updates cache
   - isAuthenticated = true immediately
   - All components re-render

4. **Logout**
   - Mutation clears cache
   - isAuthenticated = false
   - AuthGuard redirects

5. **Navigate between pages**
   - Cache persists
   - No re-fetch (within staleTime)
   - Smooth UX ✅

## Comparison

| Feature | useState (Old) | React Query (New) |
|---------|---------------|-------------------|
| Persists on refresh | ❌ No | ✅ Yes |
| Flash of content | ❌ Yes | ✅ No |
| Automatic caching | ❌ No | ✅ Yes |
| Optimistic updates | ❌ Manual | ✅ Automatic |
| Loading states | ✅ Manual | ✅ Built-in |
| Refetch control | ❌ No | ✅ Yes |

## API Calls

### Before (useState)

```
Page load → No API call → isAuthenticated = false
User logs in → API call → setAuthState()
Page refresh → No API call → isAuthenticated = false ❌
```

### After (React Query)

```
Page load → API call → Cache updated → isAuthenticated = true
User logs in → API call → Cache updated → isAuthenticated = true
Page refresh → Use cache → isAuthenticated = true ✅
```

## Files Changed

1. **`src/hooks/useAuth.ts`**
   - Removed `useState`
   - Added `useQuery` for session
   - Derive state from query data
   - Mutations update query cache

2. **`src/client-action/auth.ts`**
   - Added `getSession()` function

3. **`src/app/api/auth/session/route.ts`**
   - New endpoint for session check

4. **`src/components/auth/AuthGuard.tsx`**
   - Removed debug console.log

## Best Practices

✅ **Use React Query for server state** - Auth is server state, not local state  
✅ **Derive state from queries** - Don't duplicate data in useState  
✅ **Update cache in mutations** - Keep UI in sync  
✅ **Configure staleTime** - Reduce unnecessary API calls  
✅ **Handle loading states** - Show spinners during fetch  

## Future Enhancements

- [ ] Add session expiration handling
- [ ] Add automatic token refresh
- [ ] Add optimistic UI updates
- [ ] Add offline support
- [ ] Add session activity tracking

---

**Last Updated:** Oct 16, 2025  
**Status:** ✅ Implemented - Session now persists across page refreshes
