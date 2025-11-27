import { NextRequest, NextResponse } from 'next/server';
import { loadCreditDB, saveCreditDB, Company } from '@/lib/db';
import { findCompanyById } from '@/lib/utils';

/**
 * GET /api/admin/companies/[id] - Get a specific company
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const company = findCompanyById(id);

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error loading company:', error);
        return NextResponse.json(
            { error: 'Error loading company' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/companies/[id] - Update a company
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { companyName, balance } = body;

        const companies = loadCreditDB();
        const companyIndex = companies.findIndex(c => c.id === id);

        if (companyIndex === -1) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        const company = companies[companyIndex];

        // Update fields if provided
        if (companyName !== undefined) {
            if (typeof companyName !== 'string' || companyName.trim() === '') {
                return NextResponse.json(
                    { error: 'Invalid company name' },
                    { status: 400 }
                );
            }
            // Check if new name conflicts with another company
            if (companyName.trim() !== company.companyName && 
                companies.some(c => c.id !== id && c.companyName === companyName.trim())) {
                return NextResponse.json(
                    { error: 'Company name already exists' },
                    { status: 400 }
                );
            }
            company.companyName = companyName.trim();
        }

        if (balance !== undefined) {
            if (typeof balance !== 'number' || balance < 0) {
                return NextResponse.json(
                    { error: 'Invalid balance (must be >= 0)' },
                    { status: 400 }
                );
            }
            company.balance = balance;
        }

        companies[companyIndex] = company;
        const saved = saveCreditDB(companies);

        if (!saved) {
            return NextResponse.json(
                { error: 'Error saving company' },
                { status: 500 }
            );
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error updating company:', error);
        return NextResponse.json(
            { error: 'Error updating company' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/companies/[id] - Delete a company
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const companies = loadCreditDB();
        const companyIndex = companies.findIndex(c => c.id === id);

        if (companyIndex === -1) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        companies.splice(companyIndex, 1);
        const saved = saveCreditDB(companies);

        if (!saved) {
            return NextResponse.json(
                { error: 'Error deleting company' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Company deleted' });
    } catch (error) {
        console.error('Error deleting company:', error);
        return NextResponse.json(
            { error: 'Error deleting company' },
            { status: 500 }
        );
    }
}

