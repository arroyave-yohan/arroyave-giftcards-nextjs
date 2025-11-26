/**
 * Database utilities for reading and writing JSON files
 */
import fs from 'fs';
import path from 'path';

// Define types
export interface GiftCard {
  id: string;
  redemptionCode: string;
  redemptionToken: string;
  balance: number;
  emissionDate: string;
  expiringDate: string;
  multipleRedemptions?: boolean;
  multipleCredits?: boolean;
  restrictedToOwner?: boolean;
}

export interface Member {
  id: string; // email
  redemptionToken: string;
  redemptionCode: string;
}

export interface Company {
  companyName: string;
  balance: number;
  members: Member[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const GIFT_CARDS_FILE = path.join(DATA_DIR, 'giftCards.json');
const CREDIT_DB_FILE = path.join(DATA_DIR, 'creditDB.json');

/**
 * Loads gift cards from the JSON file
 */
export function loadGiftCards(): GiftCard[] {
  try {
    const fileContents = fs.readFileSync(GIFT_CARDS_FILE, 'utf-8');
    const data = JSON.parse(fileContents);
    return data.giftCards || [];
  } catch (error) {
    console.error('Error loading gift cards:', error);
    return [];
  }
}

/**
 * Saves gift cards to the JSON file
 */
export function saveGiftCards(giftCards: GiftCard[]): boolean {
  try {
    const data = { giftCards };
    fs.writeFileSync(GIFT_CARDS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving gift cards:', error);
    return false;
  }
}

/**
 * Loads the credit database (companies) from the JSON file
 */
export function loadCreditDB(): Company[] {
  try {
    const fileContents = fs.readFileSync(CREDIT_DB_FILE, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error loading credit DB:', error);
    return [];
  }
}

/**
 * Saves the credit database (companies) to the JSON file
 */
export function saveCreditDB(companies: Company[]): boolean {
  try {
    fs.writeFileSync(CREDIT_DB_FILE, JSON.stringify(companies, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving credit DB:', error);
    return false;
  }
}
