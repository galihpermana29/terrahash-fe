'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredUserType?: 'PUBLIC' | 'GOV';
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard Component
 * 
 * Protects routes by checking authentication and user type
 * 
 * @param requireAuth - If true, user must be authenticated (default: true)
 * @param requiredUserType - If specified, user must have this type ('PUBLIC' or 'GOV')
 * @param redirectTo - Where to redirect if auth fails (default: '/')
 * @param fallback - Custom loading component (default: centered spinner)
 * 
 * @example
 * // Protect route for any authenticated user
 * <AuthGuard>
 *   <DashboardPage />
 * </AuthGuard>
 * 
 * @example
 * // Protect route for PUBLIC users only
 * <AuthGuard requiredUserType="PUBLIC">
 *   <PublicDashboard />
 * </AuthGuard>
 * 
 * @example
 * // Protect route for GOV users only
 * <AuthGuard requiredUserType="GOV" redirectTo="/unauthorized">
 *   <GovDashboard />
 * </AuthGuard>
 */
export default function AuthGuard({
  children,
  requireAuth = true,
  requiredUserType,
  redirectTo = '/',
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, userType, isLoading, user } = useAuth();

  useEffect(() => {
    // Wait for auth state to load
    if (isLoading) return;

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check if specific user type is required
    if (requiredUserType && userType !== requiredUserType) {
      // Redirect based on user type
      if (userType === 'GOV') {
        router.push('/gov'); // GOV users go to their dashboard
      } else if (userType === 'PUBLIC') {
        router.push('/dashboard'); // PUBLIC users go to their dashboard
      } else {
        router.push(redirectTo); // Fallback
      }
      return;
    }
  }, [isAuthenticated, userType, isLoading, requireAuth, requiredUserType, router, redirectTo, user]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" tip="Loading..." />
        </div>
      )
    );
  }

  // If not authenticated and auth is required, show nothing (redirecting)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If wrong user type, show nothing (redirecting)
  if (requiredUserType && userType !== requiredUserType) {
    return null;
  }

  // All checks passed, render children
  return <>{children}</>;
}
