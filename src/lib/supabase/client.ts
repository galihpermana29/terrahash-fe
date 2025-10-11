/**
 * =============================================================================
 * SUPABASE CLIENT-SIDE CONFIGURATION
 * =============================================================================
 * 
 * 📚 LEARNING NOTE: What is this file for?
 * 
 * This creates a Supabase client that runs in the BROWSER (client-side).
 * Use this when you need to access Supabase from React components.
 * 
 * KEY CONCEPTS:
 * 
 * 1. CLIENT-SIDE vs SERVER-SIDE
 *    - Client-side: Code that runs in the user's browser
 *    - Server-side: Code that runs on your Next.js server
 * 
 * 2. WHY TWO CLIENTS?
 *    - Client uses the "anon" key (limited permissions, safe to expose)
 *    - Server uses "service_role" key (full access, must stay secret)
 * 
 * 3. WHEN TO USE THIS CLIENT?
 *    - Fetching public data in React components
 *    - Real-time subscriptions
 *    - Client-side queries (with Row Level Security enabled)
 * 
 * 4. SECURITY
 *    - The anon key is safe to expose because Supabase has Row Level Security (RLS)
 *    - RLS controls what data users can access at the database level
 * 
 * =============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
// NEXT_PUBLIC_* variables are accessible in the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate that environment variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase environment variables!\n' +
    'Make sure you have created .env.local with:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Client-side Supabase instance
 * 
 * 💡 USAGE EXAMPLE:
 * 
 * ```typescript
 * import { supabase } from '@/lib/supabase/client';
 * 
 * // In a React component:
 * const fetchParcels = async () => {
 *   const { data, error } = await supabase
 *     .from('parcels')
 *     .select('*')
 *     .limit(10);
 *   
 *   if (error) console.error(error);
 *   return data;
 * };
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // These settings control how authentication works
    persistSession: true, // Keep user logged in across page refreshes
    autoRefreshToken: true, // Automatically refresh expired tokens
    detectSessionInUrl: true, // Handle OAuth redirects
  },
});

/**
 * 🎯 BEST PRACTICES:
 * 
 * 1. Always handle errors when making queries
 * 2. Use TypeScript types for better autocomplete
 * 3. Don't expose sensitive operations to the client
 * 4. Let Row Level Security handle permissions
 * 5. Use this client for READ operations mostly
 * 
 * 🚫 DON'T USE THIS FOR:
 * - Admin operations (creating officials, etc.)
 * - Bypassing security rules
 * - Operations that need service role access
 * 
 * ✅ USE THIS FOR:
 * - Fetching public parcel data
 * - Real-time map updates
 * - User authentication flows
 */
