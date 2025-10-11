/**
 * =============================================================================
 * HEALTH CHECK API ENDPOINT
 * =============================================================================
 * 
 * 📚 LEARNING NOTE: What is a health check endpoint?
 * 
 * A health check is a simple API endpoint that tells you if your service is
 * running properly. It's used by:
 * 
 * 1. Monitoring tools (to alert you if the service is down)
 * 2. Load balancers (to know which servers are healthy)
 * 3. Deployment systems (to verify deployment succeeded)
 * 4. Developers (to quickly test if the API is working)
 * 
 * WHAT IT CHECKS:
 * - Is the API server running? ✅
 * - Can we connect to the database? ✅
 * - Are environment variables configured? ✅
 * 
 * =============================================================================
 */

/**
 * -----------------------------------------------------------------------------
 * NEXT.JS API ROUTES - HOW THEY WORK
 * -----------------------------------------------------------------------------
 * 
 * 📚 LEARNING NOTE: Understanding Next.js Route Handlers
 * 
 * In Next.js 13+ with App Router, API routes are defined by creating
 * a `route.ts` file in the `/app/api/` directory.
 * 
 * FILE LOCATION = URL PATH:
 * - /app/api/health/route.ts       → /api/health
 * - /app/api/parcels/route.ts      → /api/parcels
 * - /app/api/parcels/[id]/route.ts → /api/parcels/123
 * 
 * HTTP METHODS = EXPORTED FUNCTIONS:
 * - export async function GET()    → Handles GET requests
 * - export async function POST()   → Handles POST requests
 * - export async function PATCH()  → Handles PATCH requests
 * - export async function DELETE() → Handles DELETE requests
 * 
 * EXAMPLE:
 * ```typescript
 * // This file: /app/api/health/route.ts
 * export async function GET() {
 *   return Response.json({ status: 'ok' });
 * }
 * // Accessible at: http://localhost:3000/api/health
 * ```
 * 
 * -----------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * 
 * Returns the health status of the API and its dependencies.
 * 
 * 💡 WHY NO DATABASE CHECK HERE?
 * For now, we're keeping it simple. We'll add database checks
 * after you set up Supabase. This endpoint just confirms the
 * API server is running.
 * 
 * 📝 RESPONSE FORMAT:
 * ```json
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-10-09T14:05:00.000Z",
 *   "environment": "development",
 *   "version": "1.0.0"
 * }
 * ```
 * 
 * 🎯 USAGE:
 * ```bash
 * curl http://localhost:3000/api/health
 * ```
 * 
 * Or in the browser:
 * http://localhost:3000/api/health
 */
export async function GET() {
  try {
    // Check if required environment variables are set
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Determine overall health status
    const isHealthy = hasSupabaseUrl && hasSupabaseKey;
    
    // Build response
    const response = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      checks: {
        api: 'operational',
        environment: {
          supabaseUrl: hasSupabaseUrl ? 'configured' : 'missing',
          supabaseKey: hasSupabaseKey ? 'configured' : 'missing',
        },
      },
    };
    
    // Return 200 if healthy, 503 if degraded
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    // If something goes wrong, return unhealthy status
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 } // 503 = Service Unavailable
    );
  }
}

/**
 * =============================================================================
 * 🎓 LEARNING SUMMARY: API Routes in Next.js
 * =============================================================================
 * 
 * KEY CONCEPTS:
 * 
 * 1. FILE-BASED ROUTING
 *    The file path determines the URL:
 *    /app/api/health/route.ts → /api/health
 * 
 * 2. EXPORT HTTP METHOD FUNCTIONS
 *    ```typescript
 *    export async function GET() { }    // Handle GET
 *    export async function POST() { }   // Handle POST
 *    export async function PATCH() { }  // Handle PATCH
 *    export async function DELETE() { } // Handle DELETE
 *    ```
 * 
 * 3. RETURN NextResponse
 *    ```typescript
 *    return NextResponse.json(data, { status: 200 });
 *    ```
 * 
 * 4. ACCESS REQUEST DATA
 *    ```typescript
 *    export async function POST(request: Request) {
 *      const body = await request.json();
 *      const { searchParams } = new URL(request.url);
 *      const headers = request.headers;
 *    }
 *    ```
 * 
 * 5. DYNAMIC ROUTES
 *    Use [brackets] for dynamic segments:
 *    /app/api/parcels/[id]/route.ts
 *    
 *    ```typescript
 *    export async function GET(
 *      request: Request,
 *      { params }: { params: { id: string } }
 *    ) {
 *      const id = params.id; // Get the dynamic segment
 *    }
 *    ```
 * 
 * EXAMPLE: COMPLETE API ROUTE
 * 
 * ```typescript
 * // File: /app/api/parcels/route.ts
 * import { NextRequest, NextResponse } from 'next/server';
 * 
 * // GET /api/parcels?status=OWNED
 * export async function GET(request: NextRequest) {
 *   const { searchParams } = new URL(request.url);
 *   const status = searchParams.get('status');
 *   
 *   // Fetch data from database
 *   const parcels = await db.getParcels({ status });
 *   
 *   return NextResponse.json({ data: parcels });
 * }
 * 
 * // POST /api/parcels
 * export async function POST(request: NextRequest) {
 *   const body = await request.json();
 *   
 *   // Create parcel in database
 *   const parcel = await db.createParcel(body);
 *   
 *   return NextResponse.json(
 *     { data: parcel },
 *     { status: 201 } // 201 = Created
 *   );
 * }
 * ```
 * 
 * NEXT STEPS:
 * 
 * After you set up Supabase, we'll enhance this health check to:
 * 1. Test database connectivity
 * 2. Check if tables exist
 * 3. Verify we can query data
 * 
 * For now, this simple version confirms your API is running!
 * 
 * =============================================================================
 */
