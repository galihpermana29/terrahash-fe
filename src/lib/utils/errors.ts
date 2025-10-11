/**
 * =============================================================================
 * CUSTOM ERROR CLASSES
 * =============================================================================
 * 
 * 📚 LEARNING NOTE: Why create custom error classes?
 * 
 * JavaScript has a built-in Error class, but it's generic.
 * Custom error classes let us:
 * 
 * 1. Add extra properties (statusCode, error code)
 * 2. Categorize errors by type
 * 3. Handle different errors differently
 * 4. Make error handling more semantic
 * 
 * EXAMPLE:
 * 
 * ❌ Generic way:
 * ```typescript
 * throw new Error('Not found');
 * // How do we know what HTTP status to return?
 * ```
 * 
 * ✅ Custom error way:
 * ```typescript
 * throw new NotFoundError('Parcel');
 * // Automatically knows to return 404 status
 * ```
 * 
 * =============================================================================
 */

/**
 * Base application error class
 * 
 * 💡 EXTENDS Error:
 * This inherits from JavaScript's built-in Error class,
 * so it works with try/catch and has a stack trace.
 * 
 * 🎯 ADDITIONAL PROPERTIES:
 * - code: Machine-readable error code
 * - statusCode: HTTP status code to return
 * - details: Extra context about the error
 * 
 * 📝 USAGE:
 * ```typescript
 * throw new AppError(
 *   'INVALID_OPERATION',
 *   'Cannot lease an unclaimed parcel',
 *   400,
 *   { parcelId: 'TH-001', currentStatus: 'UNCLAIMED' }
 * );
 * ```
 */
export class AppError extends Error {
  constructor(
    public code: string,        // e.g., "VALIDATION_ERROR"
    message: string,             // Human-readable message
    public statusCode: number = 500,  // HTTP status code
    public details?: any         // Additional context
  ) {
    // Call the parent Error constructor
    super(message);
    
    // Set the error name to the class name
    this.name = 'AppError';
    
    // Maintains proper stack trace (V8 engines only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * -----------------------------------------------------------------------------
 * SPECIFIC ERROR CLASSES
 * -----------------------------------------------------------------------------
 * 
 * These are specialized versions of AppError for common scenarios.
 * They pre-set the code and statusCode so you don't have to.
 */

/**
 * Validation Error (400)
 * 
 * 💡 WHEN TO USE:
 * When input data doesn't pass validation rules
 * 
 * 📝 USAGE:
 * ```typescript
 * if (!isValidParcelId(id)) {
 *   throw new ValidationError(
 *     'Parcel ID must be in format TH-XXX-YYYY',
 *     { provided: id, expected: 'TH-XXX-YYYY' }
 *   );
 * }
 * ```
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error (404)
 * 
 * 💡 WHEN TO USE:
 * When a requested resource doesn't exist
 * 
 * 📝 USAGE:
 * ```typescript
 * const parcel = await db.getParcel(id);
 * if (!parcel) {
 *   throw new NotFoundError('Parcel');
 * }
 * ```
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized Error (401)
 * 
 * 💡 WHEN TO USE:
 * When authentication is required but not provided,
 * or when credentials are invalid
 * 
 * 📝 USAGE:
 * ```typescript
 * if (!walletAddress) {
 *   throw new UnauthorizedError('Wallet address required');
 * }
 * 
 * if (!isValidOfficial(walletAddress)) {
 *   throw new UnauthorizedError('Wallet not authorized');
 * }
 * ```
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 * 
 * 💡 WHEN TO USE:
 * When user is authenticated but doesn't have permission
 * 
 * 📝 USAGE:
 * ```typescript
 * if (official.is_active === false) {
 *   throw new ForbiddenError('Your account has been deactivated');
 * }
 * ```
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden. Insufficient permissions.') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Conflict Error (409)
 * 
 * 💡 WHEN TO USE:
 * When trying to create a resource that already exists
 * or when there's a state conflict
 * 
 * 📝 USAGE:
 * ```typescript
 * if (existingParcel) {
 *   throw new ConflictError('Parcel ID already exists');
 * }
 * 
 * if (parcel.status === 'LEASED') {
 *   throw new ConflictError('Cannot transfer a leased parcel');
 * }
 * ```
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Database Error (500)
 * 
 * 💡 WHEN TO USE:
 * When a database operation fails unexpectedly
 * 
 * 📝 USAGE:
 * ```typescript
 * const { data, error } = await supabase.from('parcels').insert(data);
 * if (error) {
 *   throw new DatabaseError('Failed to create parcel', error);
 * }
 * ```
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super('DATABASE_ERROR', message, 500, details);
    this.name = 'DatabaseError';
  }
}

/**
 * =============================================================================
 * ERROR HANDLER UTILITY
 * =============================================================================
 * 
 * This function converts any error into a standardized API response.
 * Use it in try/catch blocks to handle errors consistently.
 */

/**
 * Handle errors and convert them to API responses
 * 
 * 💡 HOW IT WORKS:
 * 1. If it's one of our custom errors, use its properties
 * 2. If it's a generic error, return 500 server error
 * 3. Always log the error for debugging
 * 
 * @param error - The caught error
 * @param defaultMessage - Fallback message for unknown errors
 * @returns Object with error details for API response
 * 
 * 📝 USAGE IN API ROUTES:
 * ```typescript
 * import { handleError } from '@/lib/utils/errors';
 * import { errorResponse } from '@/lib/utils/response';
 * 
 * export async function POST(request: Request) {
 *   try {
 *     // ... your code
 *   } catch (error) {
 *     const { code, message, statusCode, details } = handleError(error);
 *     return errorResponse(code, message, details, statusCode);
 *   }
 * }
 * ```
 */
export function handleError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
} {
  // Log the error for debugging (in production, use a proper logging service)
  console.error('Error occurred:', error);

  // If it's one of our custom AppError instances
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // If it's a generic JavaScript Error
  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: defaultMessage,
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }

  // If it's something else (string, object, etc.)
  return {
    code: 'UNKNOWN_ERROR',
    message: defaultMessage,
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? error : undefined,
  };
}

/**
 * =============================================================================
 * 🎓 LEARNING SUMMARY: Error Handling Patterns
 * =============================================================================
 * 
 * WHY USE CUSTOM ERRORS?
 * 
 * 1. TYPE SAFETY
 *    TypeScript knows what properties each error has
 * 
 * 2. CONSISTENCY
 *    All errors follow the same pattern
 * 
 * 3. SEMANTIC CODE
 *    `throw new NotFoundError('Parcel')` is clearer than
 *    `throw new Error('Parcel not found')`
 * 
 * 4. EASIER HANDLING
 *    Can catch specific error types:
 *    ```typescript
 *    try {
 *      // ...
 *    } catch (error) {
 *      if (error instanceof ValidationError) {
 *        // Handle validation errors differently
 *      }
 *    }
 *    ```
 * 
 * ERROR HANDLING BEST PRACTICES:
 * 
 * 1. ✅ ALWAYS LOG ERRORS
 *    ```typescript
 *    console.error('Failed to create parcel:', error);
 *    ```
 * 
 * 2. ✅ DON'T EXPOSE INTERNAL DETAILS
 *    ```typescript
 *    // ❌ Bad: Exposes database structure
 *    return { error: 'duplicate key value violates unique constraint "parcels_parcel_id_key"' }
 *    
 *    // ✅ Good: User-friendly message
 *    return { error: 'Parcel ID already exists' }
 *    ```
 * 
 * 3. ✅ USE APPROPRIATE STATUS CODES
 *    - 400: Client's fault (bad input)
 *    - 401: Not authenticated
 *    - 403: Not authorized
 *    - 404: Not found
 *    - 409: Conflict (duplicate, state issue)
 *    - 500: Server's fault (unexpected error)
 * 
 * 4. ✅ PROVIDE ACTIONABLE MESSAGES
 *    ```typescript
 *    // ❌ Bad: Vague
 *    throw new ValidationError('Invalid data');
 *    
 *    // ✅ Good: Specific and actionable
 *    throw new ValidationError(
 *      'Parcel ID must start with "TH-" followed by numbers',
 *      { provided: 'ABC123', expected: 'TH-XXX-YYYY' }
 *    );
 *    ```
 * 
 * EXAMPLE: COMPLETE ERROR HANDLING IN API ROUTE
 * 
 * ```typescript
 * export async function POST(request: Request) {
 *   try {
 *     // Parse body
 *     const body = await request.json();
 *     
 *     // Validate
 *     if (!body.parcel_id) {
 *       throw new ValidationError('parcel_id is required');
 *     }
 *     
 *     // Check authorization
 *     const official = await getOfficial(body.created_by);
 *     if (!official) {
 *       throw new UnauthorizedError('Wallet not authorized');
 *     }
 *     
 *     // Check for duplicates
 *     const existing = await getParcel(body.parcel_id);
 *     if (existing) {
 *       throw new ConflictError('Parcel ID already exists');
 *     }
 *     
 *     // Create parcel
 *     const parcel = await createParcel(body);
 *     return successResponse(parcel, undefined, 201);
 *     
 *   } catch (error) {
 *     // Convert error to API response
 *     const { code, message, statusCode, details } = handleError(error);
 *     return errorResponse(code, message, details, statusCode);
 *   }
 * }
 * ```
 * 
 * =============================================================================
 */
