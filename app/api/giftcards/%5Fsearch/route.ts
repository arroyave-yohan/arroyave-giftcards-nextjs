import { NextRequest, NextResponse } from 'next/server';
import { searchUserInCompanies, buildGiftCardResponse } from '@/lib/utils';

/**
 * POST /api/giftcards/_search - Search gift cards by email
 * 
 * This endpoint handles POST requests for VTEX compatibility
 * Searches for user by email in creditDB.json and returns their company's balance
 */
export async function POST(request: NextRequest) {
    try {
        // Handle preflight OPTIONS request
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 204 });
        }

        // Get request body
        const body = await request.json().catch(() => null);

        // Extract client email
        if (!body || !body.client || !body.client.email) {
            return NextResponse.json([]);
        }

        const email = body.client.email;

        // Search for user in companies
        const [company, memberIndex] = searchUserInCompanies(email);

        if (company === null || memberIndex === null) {
            return NextResponse.json([]);
        }

        // User found - build response
        const balance = company.balance;
        const companyName = company.companyName;

        // Parse company_name: convert to lowercase and remove spaces and special characters
        const parsedCompanyName = companyName
            .replace(/ /g, '')
            .replace(/-/g, '')
            .replace(/_/g, '')
            .toLowerCase();

        // Format: empresa_indice (e.g., arroyave_0, company2_1)
        const cardId = `${parsedCompanyName}_${memberIndex}`;

        // Build response with base URL
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const baseUrl = host.includes('localhost') ? '' : `${protocol}://${host}`;
        const response = buildGiftCardResponse(balance, cardId, baseUrl);

        // Log BEFORE preparing the response
        console.log('\n' + '='.repeat(80));
        console.log('[_search] Request received');
        console.log(`Email: ${email}`);
        console.log(`Company: ${companyName} | Balance: ${balance} | Card ID: ${cardId}`);
        console.log('\n[_search] Response:');
        console.log(JSON.stringify(response, null, 2));
        console.log('='.repeat(80) + '\n');

        // Prepare and return response with VTEX headers
        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'X-VTEX-Provider-Authentication': 'validated',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('Error in _search endpoint:', error);
        return NextResponse.json([]);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
