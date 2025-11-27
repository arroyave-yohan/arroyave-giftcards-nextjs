import { NextRequest, NextResponse } from 'next/server';
import { loadTransactions, saveTransactions, Transaction } from '@/lib/db';
import { findCompanyByCardId } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/giftcards/[id]/transactions/[tId]/settlements
 * 
 * Creates a settlement for a specific transaction.
 * Validates the transaction exists, corresponds to the gift card, and amount matches.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; tId: string }> }
) {
    try {
        const { id: cardId, tId } = await params;

        // Get request body
        const body = await request.json().catch(() => ({}));
        const { value, requestId } = body;

        // Validate body
        if (value === undefined || typeof value !== 'number' || value <= 0) {
            const errorMsg = 'Invalid value in request body';
            const settlementId = uuidv4().replace(/-/g, '');
            const settlement: Transaction = {
                id: settlementId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'settlement',
                userId: '',
                companyId: '',
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            const transactions = loadTransactions();
            transactions.push(settlement);
            saveTransactions(transactions);

            return NextResponse.json(
                { error: errorMsg },
                { status: 200 }
            );
        }

        // Load all transactions
        const transactions = loadTransactions();

        // Find the original transaction
        const originalTransaction = transactions.find(t => t.id === tId);

        if (!originalTransaction) {
            const errorMsg = 'Transaction not found';
            const settlementId = uuidv4().replace(/-/g, '');
            const settlement: Transaction = {
                id: settlementId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'settlement',
                userId: '',
                companyId: '',
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            transactions.push(settlement);
            saveTransactions(transactions);

            return NextResponse.json(
                { error: errorMsg },
                { status: 200 }
            );
        }

        // Validate that the transaction corresponds to the gift card
        if (originalTransaction.cardId !== cardId) {
            const errorMsg = 'Transaction does not correspond to the specified gift card';
            const settlementId = uuidv4().replace(/-/g, '');
            const settlement: Transaction = {
                id: settlementId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'settlement',
                userId: originalTransaction.userId,
                companyId: originalTransaction.companyId,
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            transactions.push(settlement);
            saveTransactions(transactions);

            return NextResponse.json(
                { error: errorMsg },
                { status: 200 }
            );
        }

        // Validate that the amount matches (compare absolute values)
        const originalAmount = Math.abs(originalTransaction.amount);
        if (Math.abs(value - originalAmount) > 0.01) { // Allow small floating point differences
            const errorMsg = `Amount mismatch. Expected: ${originalAmount}, Received: ${value}`;
            const settlementId = uuidv4().replace(/-/g, '');
            const settlement: Transaction = {
                id: settlementId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'settlement',
                userId: originalTransaction.userId,
                companyId: originalTransaction.companyId,
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            transactions.push(settlement);
            saveTransactions(transactions);

            return NextResponse.json(
                { error: errorMsg },
                { status: 200 }
            );
        }

        // All validations passed - create successful settlement
        const settlementId = uuidv4().replace(/-/g, '');
        const settlementDate = new Date().toISOString();
        
        const settlement: Transaction = {
            id: settlementId,
            date: settlementDate,
            amount: value, // Store as positive value for settlement
            type: 'settlement',
            userId: originalTransaction.userId,
            companyId: originalTransaction.companyId,
            cardId: cardId,
            originalTransactionId: tId,
        };

        transactions.push(settlement);
        saveTransactions(transactions);

        // Return successful response
        return NextResponse.json({
            oid: settlementId,
            value: value,
            date: settlementDate
        }, { status: 200 });

    } catch (error) {
        console.error('Error in settlements endpoint:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

