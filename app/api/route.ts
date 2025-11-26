import { NextResponse } from 'next/server';

/**
 * GET / - Home/landing page API
 */
export async function GET() {
    return NextResponse.json({
        message: 'Welcome to Gift Cards API',
        status: 'online',
        version: '2.0.0',
        framework: 'Next.js'
    });
}
