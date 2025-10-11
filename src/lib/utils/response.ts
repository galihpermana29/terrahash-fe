/**
 * =============================================================================
 * API RESPONSE HELPERS
 * =============================================================================
 * 
 * 📚 LEARNING NOTE: Why do we need helper functions?
 * 
 * Instead of writing the same response format in every API route:
 * 
 * ❌ BAD (repetitive):
 * ```typescript
 * return Response.json({
 *   success: true,
 *   data: parcels,
 *   meta: { total: 100, page: 1, limit: 20 }
 * }, { status: 200 });
 * ```
 * 
 * ✅ GOOD (using helper):
 * ```typescript
 * return successResponse(parcels, { total: 100, page: 1, limit: 20 });
 * ```
 * 
 * BENEFITS:
 * 1. Consistency - All responses have the same structure
 * 2. Less code - Don't repeat yourself (DRY principle)
 * 3. Easy to change - Update format in one place
 * 4. Type safety - TypeScript ensures correct usage
 * 
 * =============================================================================
 */

import { NextResponse } from 'next/server';
import { ApiResponse } from '../types/response';

/**
 * -----------------------------------------------------------------------------
 * SUCCESS RESPONSES
 * -----------------------------------------------------------------------------
 */

/**
 * Create a successful API response
 * 
 * 💡 GENERIC TYPE <T>:
 * This function can return any type of data:
 * - successResponse<Parcel>(parcel)
 * - successResponse<Parcel[]>(parcels)
 * - successResponse<string>("Operation completed")
 * 
 * @param data - The data to return
 * @param meta - Optional pagination/metadata
 * @param status - HTTP status code (default: 200 OK)
 * @returns NextResponse with standardized success format
 * 
 * 📝 USAGE EXAMPLES:
 * 
 * ```typescript
 * // Simple success
 * return successResponse({ id: '123', name: 'Parcel A' });
 * 
 * // With pagination
 * return successResponse(parcels, { total: 100, page: 1, limit: 20 });
 * 
 * // Created resource (201 status)
 * return successResponse(newParcel, undefined, 201);
 * ```
 */
export function successResponse<T>(
  data: T,
  meta?: ApiResponse['meta'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }), // Only include meta if provided
    },
    { status }
  );
}

/**
 * -----------------------------------------------------------------------------
 * ERROR RESPONSES
 * -----------------------------------------------------------------------------
 * 
 * 🎯 HTTP STATUS CODES GUIDE:
 * 
 * 400 Bad Request     - Client sent invalid data
 * 401 Unauthorized    - Authentication required or failed
 * 403 Forbidden       - Authenticated but not allowed
 * 404 Not Found       - Resource doesn't exist
 * 409 Conflict        - Resource already exists or conflict
 * 422 Unprocessable   - Validation failed
 * 500 Server Error    - Something went wrong on our end
 * 503 Service Unavailable - Database or service is down
 */

/**
 * Create a generic error response
 * 
 * @param code - Machine-readable error code (e.g., "VALIDATION_ERROR")
 * @param message - Human-readable error message
 * @param details - Additional error context (optional)
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with standardized error format
 * 
 * 📝 USAGE:
 * ```typescript
 * return errorResponse(
 *   'INVALID_PARCEL_ID',
 *   'Parcel ID must be in format TH-XXX-YYYY',
 *   { provided: 'ABC123' },
 *   400
 * );
 * ```
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Create a validation error response (400)
 * 
 * 💡 WHEN TO USE:
 * When the client sends data that doesn't pass validation
 * (e.g., missing required fields, wrong format)
 * 
 * @param errors - Validation error details (usually from Zod)
 * @returns NextResponse with validation error
 * 
 * 📝 USAGE:
 * ```typescript
 * const validation = schema.safeParse(body);
 * if (!validation.success) {
 *   return validationErrorResponse(validation.error.format());
 * }
 * ```
 */
export function validationErrorResponse(errors: any): NextResponse<ApiResponse> {
  return errorResponse(
    'VALIDATION_ERROR',
    'Invalid request data. Please check your input.',
    errors,
    400
  );
}

/**
 * Create an unauthorized error response (401)
 * 
 * 💡 WHEN TO USE:
 * When a wallet address is not in the government_officials table
 * or when authentication is required but not provided
 * 
 * @param message - Custom error message
 * @returns NextResponse with 401 status
 * 
 * 📝 USAGE:
 * ```typescript
 * if (!official) {
 *   return unauthorizedResponse('Wallet address not authorized');
 * }
 * ```
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized. Authentication required.'
): NextResponse<ApiResponse> {
  return errorResponse('UNAUTHORIZED', message, null, 401);
}

/**
 * Create a forbidden error response (403)
 * 
 * 💡 WHEN TO USE:
 * When user is authenticated but doesn't have permission
 * (e.g., official is inactive or doesn't have required role)
 * 
 * @param message - Custom error message
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(
  message: string = 'Forbidden. You do not have permission to perform this action.'
): NextResponse<ApiResponse> {
  return errorResponse('FORBIDDEN', message, null, 403);
}

/**
 * Create a not found error response (404)
 * 
 * 💡 WHEN TO USE:
 * When a requested resource doesn't exist in the database
 * 
 * @param resource - Name of the resource (e.g., "Parcel", "Official")
 * @returns NextResponse with 404 status
 * 
 * 📝 USAGE:
 * ```typescript
 * const parcel = await db.getParcel(id);
 * if (!parcel) {
 *   return notFoundResponse('Parcel');
 * }
 * ```
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return errorResponse('NOT_FOUND', `${resource} not found`, null, 404);
}

/**
 * Create a conflict error response (409)
 * 
 * 💡 WHEN TO USE:
 * When trying to create a resource that already exists
 * (e.g., parcel_id already in use)
 * 
 * @param message - Description of the conflict
 * @returns NextResponse with 409 status
 * 
 * 📝 USAGE:
 * ```typescript
 * if (existingParcel) {
 *   return conflictResponse('Parcel ID already exists');
 * }
 * ```
 */
export function conflictResponse(
  message: string
): NextResponse<ApiResponse> {
  return errorResponse('CONFLICT', message, null, 409);
}

/**
 * Create a server error response (500)
 * 
 * 💡 WHEN TO USE:
 * When something unexpected goes wrong on the server
 * (database errors, unexpected exceptions, etc.)
 * 
 * ⚠️ IMPORTANT:
 * - Always log the actual error for debugging
 * - Don't expose internal error details to the client
 * - Return a generic message to the user
 * 
 * @param message - Generic error message for the client
 * @returns NextResponse with 500 status
 * 
 * 📝 USAGE:
 * ```typescript
 * try {
 *   // ... database operation
 * } catch (error) {
 *   console.error('Database error:', error); // Log for debugging
 *   return serverErrorResponse('Failed to create parcel');
 * }
 * ```
 */
export function serverErrorResponse(
  message: string = 'Internal server error. Please try again later.'
): NextResponse<ApiResponse> {
  return errorResponse('SERVER_ERROR', message, null, 500);
}

/**
 * =============================================================================
 * 🎓 LEARNING SUMMARY: API Response Patterns
 * =============================================================================
 * 
 * STANDARD RESPONSE STRUCTURE:
 * 
 * Success:
 * {
 *   "success": true,
 *   "data": { ... },
 *   "meta": { "total": 100, "page": 1, "limit": 20 }
 * }
 * 
 * Error:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid input",
 *     "details": { ... }
 *   }
 * }
 * 
 * WHEN TO USE EACH HELPER:
 * 
 * ✅ successResponse()        - Operation succeeded
 * ❌ validationErrorResponse() - Bad input data (400)
 * 🔒 unauthorizedResponse()   - Not authenticated (401)
 * 🚫 forbiddenResponse()      - Not allowed (403)
 * 🔍 notFoundResponse()       - Resource missing (404)
 * ⚠️ conflictResponse()       - Duplicate resource (409)
 * 💥 serverErrorResponse()    - Server error (500)
 * 
 * BEST PRACTICES:
 * 
 * 1. Always use these helpers instead of raw Response.json()
 * 2. Choose the correct HTTP status code
 * 3. Provide clear, actionable error messages
 * 4. Log detailed errors server-side, return generic messages to client
 * 5. Include validation details to help frontend fix issues
 * 
 * EXAMPLE API ROUTE STRUCTURE:
 * 
 * ```typescript
 * export async function POST(request: Request) {
 *   try {
 *     // 1. Parse request body
 *     const body = await request.json();
 *     
 *     // 2. Validate input
 *     const validation = schema.safeParse(body);
 *     if (!validation.success) {
 *       return validationErrorResponse(validation.error);
 *     }
 *     
 *     // 3. Check authorization
 *     if (!isAuthorized) {
 *       return unauthorizedResponse();
 *     }
 *     
 *     // 4. Check for conflicts
 *     if (alreadyExists) {
 *       return conflictResponse('Resource already exists');
 *     }
 *     
 *     // 5. Perform operation
 *     const result = await database.create(data);
 *     
 *     // 6. Return success
 *     return successResponse(result, undefined, 201);
 *     
 *   } catch (error) {
 *     console.error('Error:', error);
 *     return serverErrorResponse();
 *   }
 * }
 * ```
 * 
 * =============================================================================
 */
