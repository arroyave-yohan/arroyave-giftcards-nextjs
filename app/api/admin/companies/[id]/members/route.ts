import { NextRequest, NextResponse } from 'next/server';
import { loadCreditDB, saveCreditDB, Member } from '@/lib/db';
import { findCompanyById, isValidEmail, userExistsInCompany } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/admin/companies/[id]/members - Get all members of a company
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

        return NextResponse.json(company.members);
    } catch (error) {
        console.error('Error loading members:', error);
        return NextResponse.json(
            { error: 'Error loading members' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/companies/[id]/members - Add a new member to a company
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId, redemptionToken, redemptionCode } = body;

        // Validations
        if (!userId || !isValidEmail(userId)) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        const companies = loadCreditDB();
        const companyIndex = companies.findIndex(c => c.id === id);

        if (companyIndex === -1) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        const company = companies[companyIndex];

        // Check if user already exists in this company
        if (userExistsInCompany(company, userId)) {
            return NextResponse.json(
                { error: 'User already exists in this company' },
                { status: 400 }
            );
        }

        // Generate redemption token and code if not provided
        const token = redemptionToken || uuidv4().replace(/-/g, '');
        const code = redemptionCode || `${company.companyName.toUpperCase().substring(0, 4)}${company.id}MBR${String(company.members.length + 1).padStart(2, '0')}`;

        const newMember: Member = {
            id: userId,
            redemptionToken: token,
            redemptionCode: code
        };

        company.members.push(newMember);
        companies[companyIndex] = company;

        const saved = saveCreditDB(companies);

        if (!saved) {
            return NextResponse.json(
                { error: 'Error saving member' },
                { status: 500 }
            );
        }

        return NextResponse.json(newMember, { status: 201 });
    } catch (error) {
        console.error('Error creating member:', error);
        return NextResponse.json(
            { error: 'Error creating member' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/companies/[id]/members - Update a member
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId, newUserId, redemptionToken, redemptionCode } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID (email) is required' },
                { status: 400 }
            );
        }

        const companies = loadCreditDB();
        const companyIndex = companies.findIndex(c => c.id === id);

        if (companyIndex === -1) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        const company = companies[companyIndex];
        const memberIndex = company.members.findIndex(m => m.id === userId);

        if (memberIndex === -1) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        const member = company.members[memberIndex];

        // Update user ID if provided and valid
        if (newUserId !== undefined) {
            if (!isValidEmail(newUserId)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }
            // Check if new email already exists in this company
            if (newUserId !== userId && userExistsInCompany(company, newUserId)) {
                return NextResponse.json(
                    { error: 'Email already exists in this company' },
                    { status: 400 }
                );
            }
            member.id = newUserId;
        }

        if (redemptionToken !== undefined) {
            member.redemptionToken = redemptionToken;
        }

        if (redemptionCode !== undefined) {
            member.redemptionCode = redemptionCode;
        }

        company.members[memberIndex] = member;
        companies[companyIndex] = company;

        const saved = saveCreditDB(companies);

        if (!saved) {
            return NextResponse.json(
                { error: 'Error saving member' },
                { status: 500 }
            );
        }

        return NextResponse.json(member);
    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json(
            { error: 'Error updating member' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/companies/[id]/members - Delete a member
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID (email) is required as query parameter' },
                { status: 400 }
            );
        }

        const companies = loadCreditDB();
        const companyIndex = companies.findIndex(c => c.id === id);

        if (companyIndex === -1) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        const company = companies[companyIndex];
        const memberIndex = company.members.findIndex(m => m.id === userId);

        if (memberIndex === -1) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        company.members.splice(memberIndex, 1);
        companies[companyIndex] = company;

        const saved = saveCreditDB(companies);

        if (!saved) {
            return NextResponse.json(
                { error: 'Error deleting member' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Member deleted' });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json(
            { error: 'Error deleting member' },
            { status: 500 }
        );
    }
}

