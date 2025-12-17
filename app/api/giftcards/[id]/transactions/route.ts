import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { loadCreditDB, saveCreditDB, loadTransactions, saveTransactions, Transaction } from '@/lib/db';
import { findCompanyByCardId } from '@/lib/utils';

/**
 * POST /api/giftcards/[id]/transactions
 * 
 * Creates a new transaction for a specific gift card.
 * Deducts the amount from the company balance and saves the transaction.
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

        // Get request body
        const body = await request.json().catch(() => ({}));
        console.log(`\n[POST /giftcards/${cardId}/transactions] Body received:`);
        console.log(JSON.stringify(body, null, 2));

        // Extract amount from body
        const amount = body.amount || body.value || 0;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            const errorResponse = { error: 'Valid amount (> 0) is required in request body' };
            console.log(`\n[POST /giftcards/${cardId}/transactions] Response Code: 400`);
            console.log(`[POST /giftcards/${cardId}/transactions] Response Body:`, JSON.stringify(errorResponse, null, 2));
            console.log('='.repeat(80) + '\n');
            return NextResponse.json(errorResponse, { status: 400 });
        }

        // Find company and user by cardId
        const [company, memberIndex] = findCompanyByCardId(cardId);

        if (!company || memberIndex === null) {
            const errorResponse = { error: 'Gift card not found' };
            console.log(`\n[POST /giftcards/${cardId}/transactions] Response Code: 404`);
            console.log(`[POST /giftcards/${cardId}/transactions] Response Body:`, JSON.stringify(errorResponse, null, 2));
            console.log('='.repeat(80) + '\n');
            return NextResponse.json(errorResponse, { status: 404 });
        }

        // Validate balance
        if (company.balance < amount) {
            const errorResponse = { error: 'Insufficient balance' };
            console.log(`\n[POST /giftcards/${cardId}/transactions] Response Code: 400`);
            console.log(`[POST /giftcards/${cardId}/transactions] Response Body:`, JSON.stringify(errorResponse, null, 2));
            console.log('='.repeat(80) + '\n');
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const user = company.members[memberIndex];

        // Update company balance
        const companies = loadCreditDB();
        const companyIndex = companies.findIndex(c => c.id === company.id);
        companies[companyIndex].balance -= amount;
        const saved = saveCreditDB(companies);

        if (!saved) {
            const errorResponse = { error: 'Error updating balance' };
            console.log(`\n[POST /giftcards/${cardId}/transactions] Response Code: 500`);
            console.log(`[POST /giftcards/${cardId}/transactions] Response Body:`, JSON.stringify(errorResponse, null, 2));
            console.log('='.repeat(80) + '\n');
            return NextResponse.json(errorResponse, { status: 500 });
        }

        // Generate a unique transaction ID
        const transactionId = uuidv4().replace(/-/g, '');

        // Create transaction record
        const transactions = loadTransactions();
        const transaction: Transaction = {
            id: transactionId,
            date: new Date().toISOString(),
            amount: -amount, // Negative for purchase
            type: 'purchase',
            userId: user.id,
            companyId: company.id,
            cardId: cardId
        };

        transactions.push(transaction);
        saveTransactions(transactions);

        // Construct the response
        // Using 'gatewayqa' prefix as requested in the example
        const response = {
            cardId: cardId,
            id: transactionId,
            _self: {
                href: `gatewayqa/giftcards/${cardId}/transactions/${transactionId}`
            }
        };

        // Log response code and body
        console.log(`\n[POST /giftcards/${cardId}/transactions] Response Code: 200`);
        console.log(`[POST /giftcards/${cardId}/transactions] Response Body:`, JSON.stringify(response, null, 2));
        console.log('='.repeat(80) + '\n');

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Error in transactions endpoint:', error);
        const errorResponse = { error: 'Internal Server Error' };
        console.log(`\n[POST /giftcards/[id]/transactions] Response Code: 500`);
        console.log(`[POST /giftcards/[id]/transactions] Response Body:`, JSON.stringify(errorResponse, null, 2));
        console.log('='.repeat(80) + '\n');
        return NextResponse.json(errorResponse, { status: 500 });
    }
}
