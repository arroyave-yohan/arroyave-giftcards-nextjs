import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates authentication headers for API requests
 * Checks for X-PROVIDER-API-AppKey and X-PROVIDER-API-AppToken headers
 * Allows access from same origin (frontend) without auth, requires auth for external calls
 * 
 * @param request - NextRequest object
 * @returns NextResponse with error if authentication fails, null if valid
 */
export function validateAuth(request: NextRequest): NextResponse | null {
    const appKey = process.env.appKey;
    const appToken = process.env.appToken;

    // Get origin from request
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    
    // Check if request is from same origin (internal frontend call)
    const isInternalRequest = 
        !origin || // No origin header (same-origin request)
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        (host && origin.includes(host)) ||
        (referer && host && referer.includes(host));

    // If it's an internal request (from frontend), allow without auth
    if (isInternalRequest) {
        return null;
    }

    // For external requests, require authentication headers
    const requestAppKey = request.headers.get('X-PROVIDER-API-AppKey');
    const requestAppToken = request.headers.get('X-PROVIDER-API-AppToken');

    // Check if headers are present and match the environment variables
    if (!requestAppKey || !requestAppToken || requestAppKey !== appKey || requestAppToken !== appToken) {
        return NextResponse.json(
            {
                message: 'Authentication failed',
                error: 'Missing or invalid authentication headers'
            },
            { status: 401 }
        );
    }

    return null;
}

