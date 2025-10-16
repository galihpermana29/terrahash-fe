/**
 * Auth Client Actions
 * 
 * API functions for authentication
 * Used by useAuth hook and other client components
 */

export interface RegisterData {
  wallet_address: string;
  full_name: string;
}

export interface LoginData {
  wallet_address: string;
}

/**
 * Check if wallet exists in database
 */
export const checkWallet = async (address: string) => {
  const response = await fetch(`/api/auth/check-wallet/${address}`);
  if (!response.ok) throw new Error('Failed to check wallet');
  return response.json();
};

/**
 * Login user with wallet address
 */
export const loginUser = async (data: LoginData) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

/**
 * Register new user
 */
export const registerUser = async (data: RegisterData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Logout failed');
  return response.json();
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error('Failed to get current user');
  }
  return response.json();
};

/**
 * Get current session (checks if user is authenticated)
 */
export const getSession = async () => {
  const response = await fetch('/api/auth/session');
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error('Failed to get session');
  }
  return response.json();
};
