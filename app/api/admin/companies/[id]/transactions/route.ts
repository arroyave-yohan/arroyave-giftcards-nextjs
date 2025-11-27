import { NextRequest, NextResponse } from 'next/server';
import { loadTransactions } from '@/lib/db';

/**
 * GET /api/admin/companies/[id]/transactions - Get all transactions for a company
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const transactions = loadTransactions();

        // Filter transactions by company ID
        const companyTransactions = transactions.filter(t => t.companyId === id);

        // Sort by date (newest first)
        companyTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(companyTransactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
        return NextResponse.json(
            { error: 'Error loading transactions' },
            { status: 500 }
        );
    }
}

