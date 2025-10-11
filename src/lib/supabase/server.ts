/**
 * =============================================================================
 * SUPABASE SERVER-SIDE CONFIGURATION
 * =============================================================================
 * 
 * 📚 LEARNING NOTE: What is this file for?
 * 
 * This creates a Supabase client that runs on the SERVER (Next.js API routes).
 * Use this in your API route handlers (files in /app/api/).
 * 
 * KEY DIFFERENCES FROM CLIENT:
 * 
 * 1. USES SERVICE ROLE KEY
 *    - Has FULL database access (bypasses Row Level Security)
 *    - Can perform admin operations
 *    - MUST be kept secret (never expose to browser)
 * 
 * 2. NO SESSION PERSISTENCE
 *    - Server doesn't need to remember user sessions
 *    - Each API request is independent
 * 
 * 3. WHEN TO USE THIS?
 *    - In API route handlers (/app/api/*)
 *    - Server Components (when you need admin access)
 *    - Background jobs
 *    - Operations that need to bypass RLS
 * 
 * 🔒 SECURITY WARNING:
 * This client has FULL database access. Always validate:
 * - User permissions before operations
 * - Input data thoroughly
 * - Wallet addresses for authorization
 * 
 * =============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validate that environment variables exist
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '❌ Missing Supabase server environment variables!\n' +
    'Make sure you have created .env.local with:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- SUPABASE_SERVICE_ROLE_KEY (NOT the anon key!)'
  );
}

/**
 * Server-side Supabase instance with admin privileges
 * 
 * 💡 USAGE EXAMPLE:
 * 
 * ```typescript
 * // In /app/api/parcels/route.ts
 * import { supabaseServer } from '@/lib/supabase/server';
 * 
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   
 *   // This has full access - no RLS restrictions
 *   const { data, error } = await supabaseServer
 *     .from('parcels')
 *     .insert(body)
 *     .select()
 *     .single();
 *   
 *   if (error) {
 *     return Response.json({ error: error.message }, { status: 500 });
 *   }
 *   
 *   return Response.json({ data });
 * }
 * ```
 */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Server doesn't need to manage user sessions
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * 🎯 BEST PRACTICES:
 * 
 * 1. ALWAYS validate user permissions manually
 *    Example: Check if wallet address is in government_officials table
 * 
 * 2. Validate ALL input data
 *    Use Zod schemas to ensure data is correct
 * 
 * 3. Use transactions for related operations
 *    Example: Creating a parcel + history entry together
 * 
 * 4. Log important operations
 *    Track who did what and when
 * 
 * 5. Handle errors gracefully
 *    Return meaningful error messages to the client
 * 
 * 🔐 AUTHORIZATION PATTERN:
 * 
 * ```typescript
 * // Always check authorization first!
 * const { data: official } = await supabaseServer
 *   .from('government_officials')
 *   .select('id, is_active')
 *   .eq('wallet_address', walletAddress)
 *   .eq('is_active', true)
 *   .single();
 * 
 * if (!official) {
 *   return Response.json(
 *     { error: 'Unauthorized' },
 *     { status: 401 }
 *   );
 * }
 * 
 * // Now safe to proceed with operation
 * ```
 * 
 * 📝 REMEMBER:
 * - This client bypasses ALL security rules
 * - YOU are responsible for implementing authorization
 * - Never trust client input without validation
 * - Always verify wallet signatures in production
 */
