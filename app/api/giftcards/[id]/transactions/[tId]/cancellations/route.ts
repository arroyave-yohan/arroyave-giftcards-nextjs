import { NextRequest, NextResponse } from 'next/server';
import { loadTransactions, saveTransactions, loadCreditDB, saveCreditDB, Transaction } from '@/lib/db';
import { findCompanyByCardId } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/giftcards/[id]/transactions/[tId]/cancellations
 * 
 * Creates a cancellation for a specific purchase transaction.
 * Validates the transaction exists, corresponds to the gift card, is a purchase, and amount matches.
 * If successful, refunds the amount to the company balance and creates a refund transaction.
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
            const cancelationId = uuidv4().replace(/-/g, '');
            const cancelation: Transaction = {
                id: cancelationId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'cancelation',
                userId: '',
                companyId: '',
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            const transactions = loadTransactions();
            transactions.push(cancelation);
            saveTransactions(transactions);

            return NextResponse.json(
                { error: errorMsg },
                { status: 200 }
            );
        }

        // Validate that gift card exists
        const [company, memberIndex] = findCompanyByCardId(cardId);
        if (!company || memberIndex === null) {
            const errorMsg = 'Gift card not found';
            const cancelationId = uuidv4().replace(/-/g, '');
            const cancelation: Transaction = {
                id: cancelationId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'cancelation',
                userId: '',
                companyId: '',
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            const transactions = loadTransactions();
            transactions.push(cancelation);
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
            const cancelationId = uuidv4().replace(/-/g, '');
            const cancelation: Transaction = {
                id: cancelationId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'cancelation',
                userId: company.members[memberIndex].id,
                companyId: company.id,
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            transactions.push(cancelation);
            saveTransactions(transactions);

            return NextResponse.json(
                { error: errorMsg },
                { status: 200 }
            );
        }

        // Validate that the transaction corresponds to the gift card
        if (originalTransaction.cardId !== cardId) {
            const errorMsg = 'Transaction does not correspond to the specified gift card';
            const cancelationId = uuidv4().replace(/-/g, '');
            const cancelation: Transaction = {
                id: cancelationId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'cancelation',
                userId: originalTransaction.userId,
                companyId: originalTransaction.companyId,
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            transactions.push(cancelation);
            saveTransactions(transactions);

            return NextResponse.json(
                { error: errorMsg },
                { status: 200 }
            );
        }

        // Validate that the transaction is a purchase (not a recharge)
        if (originalTransaction.type !== 'purchase') {
            const errorMsg = 'Transaction is not a purchase. Only purchase transactions can be cancelled';
            const cancelationId = uuidv4().replace(/-/g, '');
            const cancelation: Transaction = {
                id: cancelationId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'cancelation',
                userId: originalTransaction.userId,
                companyId: originalTransaction.companyId,
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            transactions.push(cancelation);
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
            const cancelationId = uuidv4().replace(/-/g, '');
            const cancelation: Transaction = {
                id: cancelationId,
                date: new Date().toISOString(),
                amount: 0,
                type: 'cancelation',
                userId: originalTransaction.userId,
                companyId: originalTransaction.companyId,
                cardId: cardId,
                error: errorMsg,
                originalTransactionId: tId,
            };
            
            transactions.push(cancelation);
            saveTransactions(transactions);

            return NextResponse.json(
                { error: errorMsg },
                { status: 200 }
            );
        }

        // All validations passed - create successful cancelation
        const cancelationId = uuidv4().replace(/-/g, '');
        const cancelationDate = new Date().toISOString();
        
        const cancelation: Transaction = {
            id: cancelationId,
            date: cancelationDate,
            amount: value, // Store as positive value for cancelation
            type: 'cancelation',
            userId: originalTransaction.userId,
            companyId: originalTransaction.companyId,
            cardId: cardId,
            originalTransactionId: tId,
        };

        transactions.push(cancelation);
        saveTransactions(transactions);

        // Refund: Return the amount to the company balance
        const companies = loadCreditDB();
        const companyIndex = companies.findIndex(c => c.id === company.id);
        companies[companyIndex].balance += value;
        saveCreditDB(companies);

        // Create refund transaction
        const refundId = uuidv4().replace(/-/g, '');
        const refund: Transaction = {
            id: refundId,
            date: cancelationDate,
            amount: value, // Positive for refund
            type: 'refund',
            userId: originalTransaction.userId,
            companyId: company.id,
            cardId: cardId,
            originalTransactionId: tId,
        };

        transactions.push(refund);
        saveTransactions(transactions);

        // Return successful response
        return NextResponse.json({
            oid: cancelationId,
            value: value,
            date: cancelationDate
        }, { status: 200 });

    } catch (error) {
        console.error('Error in cancellations endpoint:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

