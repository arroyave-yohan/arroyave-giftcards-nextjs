import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Only apply to /api routes
    if (path.startsWith('/api')) {
        // Exclude internal dashboard access (e.g., /api/admin)
        // Also excluding health check if needed, but user specified dashboard data access
        if (path.startsWith('/api/admin')) {
            return NextResponse.next();
        }

        const appKey = process.env.appKey;
        const appToken = process.env.appToken;

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
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
