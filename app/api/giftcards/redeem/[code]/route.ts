import { NextRequest, NextResponse } from 'next/server';
import { loadGiftCards, saveGiftCards } from '@/lib/db';

/**
 * POST /api/giftcards/redeem/:code - Redeem a gift card
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code: redemptionCode } = await params;

    const giftCards = loadGiftCards();
    const card = giftCards.find(card => card.redemptionCode === redemptionCode);

    if (!card) {
        return NextResponse.json(
            {
                success: false,
                error: 'Gift card not found'
            },
            { status: 404 }
        );
    }

    // Check if gift card is expired
    const expiringDate = new Date(card.expiringDate);
    if (new Date() > expiringDate) {
        return NextResponse.json(
            {
                success: false,
                error: 'Gift card has expired'
            },
            { status: 400 }
        );
    }

    // Check if it has balance
    if (card.balance <= 0) {
        return NextResponse.json(
            {
                success: false,
                error: 'Gift card has no balance'
            },
            { status: 400 }
        );
    }

    // Get amount to redeem from body
    const body = await request.json().catch(() => ({}));
    const amount = body.amount || 0;

    if (amount <= 0) {
        return NextResponse.json(
            {
                success: false,
                error: 'Invalid amount'
            },
            { status: 400 }
        );
    }

    if (amount > card.balance) {
        return NextResponse.json(
            {
                success: false,
                error: 'Insufficient balance'
            },
            { status: 400 }
        );
    }

    // Update balance
    card.balance -= amount;
    saveGiftCards(giftCards);

    return NextResponse.json({
        success: true,
        message: 'Gift card redeemed successfully',
        redeemedAmount: amount,
        remainingBalance: card.balance
    });
}
