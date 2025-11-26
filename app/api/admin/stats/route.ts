import { NextResponse } from 'next/server';
import { loadCreditDB } from '@/lib/db';

/**
 * GET /api/admin/stats - Get admin dashboard statistics
 */
export async function GET() {
    try {
        const companies = loadCreditDB();

        const totalCompanies = companies.length;
        const totalBalance = companies.reduce((sum, company) => sum + company.balance, 0);
        const totalMembers = companies.reduce((sum, company) => sum + (company.members?.length || 0), 0);

        return NextResponse.json({
            totalCompanies,
            totalBalance,
            totalMembers,
            companies,
        });
    } catch (error) {
        console.error('Error loading admin stats:', error);
        return NextResponse.json({
            totalCompanies: 0,
            totalBalance: 0,
            totalMembers: 0,
            companies: [],
        });
    }
}
