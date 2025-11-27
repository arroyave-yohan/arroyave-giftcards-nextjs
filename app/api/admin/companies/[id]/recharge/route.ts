import { NextRequest, NextResponse } from 'next/server';
import { loadCreditDB, saveCreditDB, loadTransactions, saveTransactions, Transaction } from '@/lib/db';
import { findCompanyById } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/admin/companies/[id]/recharge - Recharge company balance
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { amount, userId } = body;

        // Validations
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'Valid amount (> 0) is required' },
                { status: 400 }
            );
        }

        const company = findCompanyById(id);

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        // Update company balance
        const companies = loadCreditDB();
        const companyIndex = companies.findIndex(c => c.id === id);
        companies[companyIndex].balance += amount;
        const saved = saveCreditDB(companies);

        if (!saved) {
            return NextResponse.json(
                { error: 'Error updating balance' },
                { status: 500 }
            );
        }

        // Create transaction record
        const transactions = loadTransactions();
        const transaction: Transaction = {
            id: uuidv4().replace(/-/g, ''),
            date: new Date().toISOString(),
            amount: amount,
            type: 'recharge',
            userId: userId || 'admin',
            companyId: id,
        };

        transactions.push(transaction);
        saveTransactions(transactions);

        return NextResponse.json({
            success: true,
            company: companies[companyIndex],
            transaction
        });
    } catch (error) {
        console.error('Error recharging balance:', error);
        return NextResponse.json(
            { error: 'Error recharging balance' },
            { status: 500 }
        );
    }
}

