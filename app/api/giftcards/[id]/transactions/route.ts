import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/giftcards/[id]/transactions
 * 
 * Creates a new transaction for a specific gift card.
 * Currently returns a mock response with a generated transaction ID.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: cardId } = await params;

        // Log headers for debugging
        console.log(`\n[POST /giftcards/${cardId}/transactions] Headers received:`);
        request.headers.forEach((value, key) => {
            console.log(`  ${key}: ${value}`);
        });

        // Get request body if any
        const body = await request.json().catch(() => ({}));
        console.log(`\n[POST /giftcards/${cardId}/transactions] Body received:`);
        console.log(JSON.stringify(body, null, 2));

        // Generate a unique transaction ID
        const transactionId = uuidv4().replace(/-/g, '');

        // Construct the response
        // Using 'gatewayqa' prefix as requested in the example
        const response = {
            cardId: cardId,
            id: transactionId,
            _self: {
                href: `gatewayqa/giftcards/${cardId}/transactions/${transactionId}`
            }
        };

        // Log BEFORE preparing response
        console.log(`\n[POST /giftcards/${cardId}/transactions] Response:`);
        console.log(JSON.stringify(response, null, 2));
        console.log('='.repeat(80) + '\n');

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Error in transactions endpoint:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
