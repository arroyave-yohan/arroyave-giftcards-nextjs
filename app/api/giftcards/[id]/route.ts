import { NextRequest, NextResponse } from 'next/server';
import { findCompanyByCardId, buildGiftCardDetailResponse } from '@/lib/utils';

/**
 * GET /api/giftcards/:id - Get specific gift card by ID
 * 
 * The card_id must have the format: empresa_indice (e.g., arroyave_0, company2_1)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: cardId } = await params;

    // Log headers for debugging
    console.log(`\n[GET /giftcards/${cardId}] Headers received:`);
    request.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
    });

    // Search for company and member using card_id
    const [company, memberIndex] = findCompanyByCardId(cardId);

    if (company === null || memberIndex === null) {
        // Log BEFORE preparing response
        console.log(`\n[GET /giftcards/${cardId}] Gift card not found - 404`);
        console.log('='.repeat(80) + '\n');

        // Prepare and return error response
        return NextResponse.json(
            {
                success: false,
                error: 'Gift card not found'
            },
            { status: 404 }
        );
    }

    // Get company balance
    const balance = company.balance;
    const companyName = company.companyName;

    // Get redemptionToken and redemptionCode from member
    const members = company.members || [];
    const member = memberIndex < members.length ? members[memberIndex] : { redemptionToken: cardId, redemptionCode: cardId };
    const redemptionToken = member.redemptionToken || cardId;
    const redemptionCode = member.redemptionCode || cardId;

    // Build detailed response with base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = host.includes('localhost') ? '' : `${protocol}://${host}`;
    const response = buildGiftCardDetailResponse(cardId, balance, redemptionToken, redemptionCode, baseUrl);

    // Log BEFORE preparing response
    console.log(`\n[GET /giftcards/${cardId}] Gift card found`);
    console.log(`Company: ${companyName} | Balance: ${balance}`);
    console.log(`\n[GET /giftcards/${cardId}] Response:`);
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
}
