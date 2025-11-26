/**
 * Utility functions for processing gift cards
 * Migrated from Python utils.py
 */
import { loadCreditDB, Company } from './db';

/**
 * Parses a card_id to extract the company name and member index
 * 
 * Expected format: empresa_indice (e.g., arroyave_0, company2_1)
 * 
 * @param cardId - Gift card ID in formato empresa_indice
 * @returns Tuple [parsedCompanyName, memberIndex] if valid, [null, null] if not
 */
export function parseCardId(cardId: string): [string | null, number | null] {
    try {
        const parts = cardId.split('_');
        if (parts.length !== 2) {
            return [null, null];
        }

        const parsedCompanyName = parts[0];
        const memberIndex = parseInt(parts[1], 10);

        if (isNaN(memberIndex)) {
            return [null, null];
        }

        return [parsedCompanyName, memberIndex];
    } catch (error) {
        return [null, null];
    }
}

/**
 * Searches for a user by email in registered companies
 * 
 * @param email - User email to search for
 * @returns Tuple [company, memberIndex] if found, [null, null] if not
 */
export function searchUserInCompanies(email: string): [Company | null, number | null] {
    const companies = loadCreditDB();

    for (const company of companies) {
        const members = company.members || [];
        for (let index = 0; index < members.length; index++) {
            if (members[index].id === email) {
                return [company, index];
            }
        }
    }

    return [null, null];
}

/**
 * Finds a company and member based on the card_id
 * 
 * @param cardId - Gift card ID in formato empresa_indice
 * @returns Tuple [company, memberIndex] if found, [null, null] if not
 */
export function findCompanyByCardId(cardId: string): [Company | null, number | null] {
    // Parse the card_id
    const [parsedCompanyName, memberIndex] = parseCardId(cardId);

    if (parsedCompanyName === null || memberIndex === null) {
        return [null, null];
    }

    // Load companies
    const companies = loadCreditDB();

    // Search for company that matches the parsed name
    for (const company of companies) {
        const companyName = company.companyName || '';
        // Normalize the company name the same way as in search
        const normalizedName = companyName
            .replace(/ /g, '')
            .replace(/-/g, '')
            .replace(/_/g, '')
            .toLowerCase();

        if (normalizedName === parsedCompanyName) {
            // Verify that the index is valid
            const members = company.members || [];
            if (memberIndex < members.length) {
                return [company, memberIndex];
            }
        }
    }

    return [null, null];
}

/**
 * Builds the gift card response for search endpoint
 * 
 * @param balance - Gift card balance
 * @param cardId - Gift card ID (optional, uses default)
 * @param baseUrl - Server base URL (e.g., https://giftcardsdev.arroyave.me)
 * @returns Array with gift card object
 */
export function buildGiftCardResponse(
    balance: number,
    cardId: string = "3ad63br54-988e-4a14-8b7f-31fc6a5b955c_24",
    baseUrl: string = ""
) {
    const href = baseUrl
        ? `${baseUrl}/api/giftcards/${cardId}`
        : `/api/giftcards/${cardId}`;

    return [
        {
            id: cardId,
            provider: "arroyave_gift",
            balance: balance,
            _self: {
                href: href
            }
        }
    ];
}

/**
 * Builds the detailed gift card response for get by ID endpoint
 * 
 * @param cardId - Gift card ID
 * @param balance - Company balance (integer)
 * @param redemptionToken - Member's redemption token
 * @param redemptionCode - Member's redemption code
 * @param baseUrl - Server base URL
 * @returns Dictionary with complete gift card information
 */
export function buildGiftCardDetailResponse(
    cardId: string,
    balance: number,
    redemptionToken: string,
    redemptionCode: string,
    baseUrl: string = ""
) {
    const transactionsHref = `/cards/${cardId}/transactions`;

    return {
        id: cardId,
        redemptionToken: redemptionToken,
        redemptionCode: redemptionCode,
        balance: balance,
        emissionDate: "2025-04-24T20:22:58.163",
        expiringDate: "2030-01-01T00:00:00",
        currencyCode: "COP",
        transactions: {
            href: transactionsHref
        }
    };
}
