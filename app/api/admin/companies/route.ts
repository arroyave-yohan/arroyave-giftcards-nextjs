import { NextRequest, NextResponse } from 'next/server';
import { loadCreditDB, saveCreditDB, Company } from '@/lib/db';
import { isValidEmail } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/admin/companies - List all companies
 */
export async function GET() {
    try {
        const companies = loadCreditDB();
        return NextResponse.json(companies);
    } catch (error) {
        console.error('Error loading companies:', error);
        return NextResponse.json(
            { error: 'Error loading companies' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/companies - Create a new company
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyName, balance, members } = body;

        // Validations
        if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
            return NextResponse.json(
                { error: 'Company name is required' },
                { status: 400 }
            );
        }

        if (balance === undefined || typeof balance !== 'number' || balance < 0) {
            return NextResponse.json(
                { error: 'Valid balance (>= 0) is required' },
                { status: 400 }
            );
        }

        // Validate members if provided
        if (members && Array.isArray(members)) {
            for (const member of members) {
                if (!member.id || !isValidEmail(member.id)) {
                    return NextResponse.json(
                        { error: `Invalid email for member: ${member.id}` },
                        { status: 400 }
                    );
                }
            }
        }

        const companies = loadCreditDB();

        // Check if company name already exists
        if (companies.some(c => c.companyName === companyName.trim())) {
            return NextResponse.json(
                { error: 'Company name already exists' },
                { status: 400 }
            );
        }

        // Generate new ID in format 001, 002, etc.
        const existingIds = companies.map(c => parseInt(c.id, 10)).filter(id => !isNaN(id));
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const newId = String(maxId + 1).padStart(3, '0');

        // Create new company
        const newCompany: Company = {
            id: newId,
            companyName: companyName.trim(),
            balance: balance,
            members: members || []
        };

        companies.push(newCompany);
        const saved = saveCreditDB(companies);

        if (!saved) {
            return NextResponse.json(
                { error: 'Error saving company' },
                { status: 500 }
            );
        }

        return NextResponse.json(newCompany, { status: 201 });
    } catch (error) {
        console.error('Error creating company:', error);
        return NextResponse.json(
            { error: 'Error creating company' },
            { status: 500 }
        );
    }
}

