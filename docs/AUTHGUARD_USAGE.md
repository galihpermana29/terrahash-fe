# AuthGuard Component Usage Guide

## Overview

The `AuthGuard` component is a Higher-Order Component (HOC) that protects routes by checking:
1. **Authentication status** - Is the user logged in?
2. **User type** - Does the user have the required role (PUBLIC or GOV)?

## Location

```
src/components/auth/AuthGuard.tsx
```

## Basic Usage

### 1. Protect Any Authenticated Route

Requires user to be logged in, regardless of user type:

```tsx
import AuthGuard from '@/components/auth/AuthGuard';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div>Protected content for any authenticated user</div>
    </AuthGuard>
  );
}
```

### 2. Protect PUBLIC User Routes

Only PUBLIC users can access:

```tsx
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard requiredUserType="PUBLIC">
      <div>PUBLIC user dashboard</div>
    </AuthGuard>
  );
}
```

### 3. Protect GOV User Routes

Only GOV users can access:

```tsx
import AuthGuard from '@/components/auth/AuthGuard';

export default function GovDashboardPage() {
  return (
    <AuthGuard requiredUserType="GOV">
      <div>Government admin dashboard</div>
    </AuthGuard>
  );
}
```

### 4. Custom Redirect Path

Specify where to redirect unauthorized users:

```tsx
<AuthGuard 
  requiredUserType="GOV" 
  redirectTo="/unauthorized"
>
  <GovContent />
</AuthGuard>
```

### 5. Custom Loading Fallback

Provide a custom loading component:

```tsx
<AuthGuard 
  fallback={
    <div className="flex items-center justify-center h-screen">
      <p>Loading your dashboard...</p>
    </div>
  }
>
  <DashboardContent />
</AuthGuard>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | The protected content to render |
| `requireAuth` | `boolean` | `true` | Whether authentication is required |
| `requiredUserType` | `'PUBLIC' \| 'GOV'` | `undefined` | Required user type (if any) |
| `redirectTo` | `string` | `'/'` | Where to redirect unauthorized users |
| `fallback` | `React.ReactNode` | Spinner | Custom loading component |

## How It Works

### Flow Diagram

```
User visits protected route
    ↓
AuthGuard checks isLoading
    ↓
  ┌─────────────────┐
  │ Still loading?  │
  └────┬────────────┘
       │ Yes → Show loading spinner
       │ No  → Continue
       ↓
Check if authenticated
    ↓
  ┌─────────────────────┐
  │ Not authenticated?  │
  └────┬────────────────┘
       │ Yes → Redirect to redirectTo (default: '/')
       │ No  → Continue
       ↓
Check user type (if requiredUserType specified)
    ↓
  ┌──────────────────────┐
  │ Wrong user type?     │
  └────┬─────────────────┘
       │ Yes → Redirect to appropriate dashboard
       │       - GOV → /gov
       │       - PUBLIC → /dashboard
       │ No  → Continue
       ↓
Render protected content ✅
```

## Redirect Logic

### When User is Not Authenticated

- Redirects to `redirectTo` prop (default: `/`)

### When User Type Doesn't Match

- **GOV user** accessing PUBLIC route → Redirect to `/gov`
- **PUBLIC user** accessing GOV route → Redirect to `/dashboard`
- **Unknown type** → Redirect to `redirectTo` prop

## Example Pages

### Public Dashboard (`/dashboard`)

```tsx
// src/app/dashboard/page.tsx
'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

function DashboardContent() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user?.full_name}!</h1>
      <p>Your submissions, parcels, and listings</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requiredUserType="PUBLIC" redirectTo="/unauthorized">
      <DashboardContent />
    </AuthGuard>
  );
}
```

### Government Dashboard (`/gov`)

```tsx
// src/app/gov/page.tsx
'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

function GovDashboardContent() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Government Dashboard</h1>
      <p>Review submissions and manage parcels</p>
    </div>
  );
}

export default function GovDashboardPage() {
  return (
    <AuthGuard requiredUserType="GOV" redirectTo="/unauthorized">
      <GovDashboardContent />
    </AuthGuard>
  );
}
```

### Unauthorized Page (`/unauthorized`)

```tsx
// src/app/unauthorized/page.tsx
'use client';

import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useAuth();

  return (
    <Result
      status="403"
      title="Access Denied"
      subTitle="You don't have permission to access this page."
      extra={
        <Button onClick={() => router.push(isAuthenticated ? '/dashboard' : '/')}>
          {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
        </Button>
      }
    />
  );
}
```

## Advanced Patterns

### Nested Protection

You can nest AuthGuards for complex scenarios:

```tsx
<AuthGuard>
  {/* Any authenticated user */}
  <Layout>
    <AuthGuard requiredUserType="PUBLIC">
      {/* Only PUBLIC users */}
      <PublicContent />
    </AuthGuard>
  </Layout>
</AuthGuard>
```

### Conditional Protection

Protect routes conditionally:

```tsx
export default function MixedPage() {
  const isProtected = true; // Your logic here
  
  const content = <div>Content</div>;
  
  return isProtected ? (
    <AuthGuard>
      {content}
    </AuthGuard>
  ) : (
    content
  );
}
```

### With Server-Side Data

Combine with data fetching:

```tsx
'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { useQuery } from '@tanstack/react-query';

function DashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => fetch('/api/submissions/me').then(r => r.json()),
  });

  if (isLoading) return <div>Loading data...</div>;

  return <div>{/* Render data */}</div>;
}

export default function DashboardPage() {
  return (
    <AuthGuard requiredUserType="PUBLIC">
      <DashboardContent />
    </AuthGuard>
  );
}
```

## Testing

### Test Cases

1. **Unauthenticated user** visits protected route → Redirects to home
2. **PUBLIC user** visits `/dashboard` → Access granted
3. **PUBLIC user** visits `/gov` → Redirects to `/dashboard`
4. **GOV user** visits `/gov` → Access granted
5. **GOV user** visits `/dashboard` → Redirects to `/gov`
6. **Loading state** → Shows spinner

### Manual Testing

1. **Not logged in:**
   - Visit `/dashboard` → Should redirect to `/`
   - Visit `/gov` → Should redirect to `/`

2. **Logged in as PUBLIC:**
   - Visit `/dashboard` → Should show dashboard
   - Visit `/gov` → Should redirect to `/dashboard` or `/unauthorized`

3. **Logged in as GOV:**
   - Visit `/gov` → Should show gov dashboard
   - Visit `/dashboard` → Should redirect to `/gov` or `/unauthorized`

## Troubleshooting

### Issue: Infinite redirect loop

**Cause:** AuthGuard redirecting to a page that also has AuthGuard with same requirements

**Solution:** Ensure redirect paths don't have conflicting AuthGuards

### Issue: Flash of protected content

**Cause:** AuthGuard renders children before redirect completes

**Solution:** This is expected behavior. The component returns `null` during redirect, but React may render one frame. Consider adding a loading state in your layout.

### Issue: User sees loading spinner forever

**Cause:** `isLoading` from `useAuth` never becomes `false`

**Solution:** Check that AuthProvider is properly set up in layout.tsx and auth state is updating correctly

## Integration with Existing Features

### With Navbar

The Navbar already shows different options based on user type:

```tsx
// Navbar automatically shows:
// - PUBLIC users: Link to /dashboard
// - GOV users: Link to /gov
```

### With API Routes

Server-side protection using session utilities:

```tsx
// src/app/api/submissions/me/route.ts
import { requireAuth, requireUserType } from '@/lib/utils/session';

export async function GET() {
  const user = await requireAuth(); // Throws if not authenticated
  await requireUserType('PUBLIC'); // Throws if not PUBLIC
  
  // Fetch user's submissions
}
```

## Best Practices

1. ✅ **Always use AuthGuard** for protected pages
2. ✅ **Specify requiredUserType** when route is role-specific
3. ✅ **Use custom redirectTo** for better UX (e.g., `/unauthorized`)
4. ✅ **Keep AuthGuard at page level**, not component level
5. ✅ **Combine with server-side checks** in API routes
6. ❌ **Don't nest multiple AuthGuards** with same requirements
7. ❌ **Don't use AuthGuard in layout.tsx** (causes issues with public pages)

## Related Files

- `src/contexts/AuthContext.tsx` - Auth state provider
- `src/hooks/useAuth.ts` - Auth hook (wrapped by context)
- `src/hooks/useWalletAuth.ts` - Wallet connection handler
- `src/lib/utils/session.ts` - Server-side auth utilities
- `src/app/unauthorized/page.tsx` - Unauthorized error page

## Future Enhancements

- [ ] Add permission-based access (beyond just user type)
- [ ] Add audit logging for unauthorized access attempts
- [ ] Add "return to" functionality (redirect back after login)
- [ ] Add grace period for session expiration
- [ ] Add role hierarchy (e.g., ROOT_ADMIN > GOV > PUBLIC)

---

**Last Updated:** Oct 16, 2025  
**Status:** ✅ Implemented and ready for use
