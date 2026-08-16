/**
 * Types and schemas for SaveLedger App
 */

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  avatar?: string;
  createdAt: string;
}

export interface Ledger {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export type TransactionType = 'Loan' | 'Borrow' | 'Return' | 'Cash' | 'Gift' | 'Contribution' | 'Expense' | string;

export interface Transaction {
  id: string;
  ledgerId: string;
  userId: string;
  personName: string;
  personMobile?: string;
  personWhatsApp?: string;
  amount: number;
  type: TransactionType;
  nature: 'given' | 'received'; // 'given' means cash out / Lent, 'received' means cash in / Borrowed
  itemDetails?: string; // e.g. "Glass Set", "Dinner Set", "Clock"
  date: string;
  notes?: string;
}

export type EventType =
  | 'Wedding'
  | 'Engagement'
  | 'Birthday'
  | 'Housewarming'
  | 'Aqeeqah'
  | 'Funeral'
  | 'Eid'
  | 'Baby Shower'
  | 'Shop Opening'
  | 'Religious Event'
  | 'Construction Project'
  | string;

export interface EventEntity {
  id: string;
  userId: string;
  name: string;
  type: EventType;
  date: string;
  plannedBudget: number;
  notes?: string;
}

export interface EventItem {
  id: string;
  eventId: string;
  userId: string;
  type: 'gift' | 'expense'; // 'gift' is contribution/gift received; 'expense' is money spent
  personName?: string; // Guests name if type is 'gift'
  personMobile?: string;
  personWhatsApp?: string;
  amount: number; // e.g., Cash 5000 PKR, or product estimated value
  giftItem?: string; // e.g. "Glass Set", "Tea Set", "Cash"
  expenseCategory?: string; // e.g. "Catering", "Decor", "Plumbing"
  date: string;
  notes?: string;
}

export interface SimulatedContact {
  id: string;
  name: string;
  mobile: string;
  whatsapp: string;
}

export interface DeletedLedger {
  id: string;
  ledger: Ledger;
  associatedTransactions: Transaction[];
  deletedAt: string;
}

export interface DeletedEvent {
  id: string;
  event: EventEntity;
  associatedEventItems: EventItem[];
  deletedAt: string;
}

export interface ExpenseBook {
  id: string;
  userId: string;
  monthYear: string; // "YYYY-MM"
  name: string;      // e.g. "July 2026"
  monthlyIncome: number;
  openingBalance: number;
  createdAt: string;
}

export interface ExpenseEntry {
  id: string;
  bookId: string;
  userId: string;
  date: string;       // "YYYY-MM-DD"
  category: string;   // Food, Groceries, Petrol, etc.
  description: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

