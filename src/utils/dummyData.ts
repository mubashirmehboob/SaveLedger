import { Ledger, Transaction, EventEntity, EventItem, SimulatedContact } from '../types';

export const SIMULATED_CONTACTS: SimulatedContact[] = [
  { id: 'c1', name: 'Zeeshan Ali', mobile: '+92 300 1234567', whatsapp: '+92 300 1234567' },
  { id: 'c2', name: 'Muhammad Bilal', mobile: '+92 321 9876543', whatsapp: '+92 321 9876543' },
  { id: 'c3', name: 'Ayesha Khan', mobile: '+92 333 4567890', whatsapp: '+92 333 4567890' },
  { id: 'c4', name: 'Kamran Mughal', mobile: '+92 345 5556677', whatsapp: '+92 345 5556677' },
  { id: 'c5', name: 'Sajid Mehmood', mobile: '+92 312 8889911', whatsapp: '+92 312 8889911' },
  { id: 'c6', name: 'Haris Qureshi', mobile: '+92 301 7772233', whatsapp: '+92 301 7772233' },
  { id: 'c7', name: 'Zainab Bibi', mobile: '+92 315 4441122', whatsapp: '+92 315 4441122' },
  { id: 'c8', name: 'Uncle Arshad', mobile: '+92 300 9998877', whatsapp: '+92 300 9998877' }
];

export const getInitialLedgers = (userId: string): Ledger[] => [
  {
    id: 'l1',
    userId,
    name: 'Personal & Friends',
    description: 'Daily friendly interactions and small loans',
    createdAt: '2026-05-10T12:00:00Z'
  },
  {
    id: 'l2',
    userId,
    name: 'Office colleagues',
    description: 'Lunch cash contributions and mutual loans',
    createdAt: '2026-05-12T14:30:00Z'
  },
  {
    id: 'l3',
    userId,
    name: 'Karyana Shop (Suppliers)',
    description: 'Groceries store ledger account records',
    createdAt: '2026-05-15T09:15:00Z'
  }
];

export const getInitialTransactions = (userId: string): Transaction[] => [
  {
    id: 't1',
    ledgerId: 'l1',
    userId,
    personName: 'Zeeshan Ali',
    personMobile: '+92 300 1234567',
    personWhatsApp: '+92 300 1234567',
    amount: 5000,
    type: 'Loan',
    nature: 'given',
    date: '2026-06-01T10:00:00.000Z',
    notes: 'Urgent loan given for business expense. Promised return in 2 weeks.'
  },
  {
    id: 't2',
    ledgerId: 'l1',
    userId,
    personName: 'Muhammad Bilal',
    personMobile: '+92 321 9876543',
    personWhatsApp: '+92 321 9876543',
    amount: 3000,
    type: 'Borrow',
    nature: 'received',
    date: '2026-06-05T15:30:00.000Z',
    notes: 'Borrowed for petrol and grocery emergencies.'
  },
  {
    id: 't3',
    ledgerId: 'l1',
    userId,
    personName: 'Zeeshan Ali',
    personMobile: '+92 300 1234567',
    personWhatsApp: '+92 300 1234567',
    amount: 1500,
    type: 'Return',
    nature: 'received',
    date: '2026-06-10T11:20:00.000Z',
    notes: 'Zeeshan returned partial loan amount.'
  },
  {
    id: 't4',
    ledgerId: 'l2',
    userId,
    personName: 'Kamran Mughal',
    personMobile: '+92 345 5556677',
    amount: 1200,
    type: 'Expense',
    nature: 'given',
    date: '2026-06-08T13:00:00.000Z',
    notes: 'Paid office tea bill for the whole team.'
  },
  {
    id: 't5',
    ledgerId: 'l2',
    userId,
    personName: 'Ayesha Khan',
    personMobile: '+92 333 4567890',
    amount: 800,
    type: 'Cash',
    nature: 'received',
    date: '2026-06-09T17:45:00.000Z',
    notes: 'Lunch contribution received.'
  },
  {
    id: 't6',
    ledgerId: 'l3',
    userId,
    personName: 'Sajid Mehmood',
    personMobile: '+92 312 8889911',
    amount: 15000,
    type: 'Borrow',
    nature: 'received',
    date: '2026-05-20T18:00:00.000Z',
    notes: 'Monthly wholesale supply credit items.'
  },
  {
    id: 't7',
    ledgerId: 'l3',
    userId,
    personName: 'Sajid Mehmood',
    personMobile: '+92 312 8889911',
    amount: 10000,
    type: 'Return',
    nature: 'given',
    date: '2026-06-02T12:00:00.000Z',
    notes: 'Paid back partial wholesale supplier amount.'
  }
];

export const getInitialEvents = (userId: string): EventEntity[] => [
  {
    id: 'e1',
    userId,
    name: "Imran's Housewarming Party",
    type: 'Housewarming',
    date: '2026-06-20',
    plannedBudget: 45000,
    notes: "Visiting Imran's new rawalpindi house. Recorded to match custom event settings."
  },
  {
    id: 'e2',
    userId,
    name: "Sajid's Daughter Marriage",
    type: 'Wedding',
    date: '2026-07-05',
    plannedBudget: 150000,
    notes: 'Daughter wedding gift records. Must tally previous gift lists.'
  }
];

export const getInitialEventItems = (userId: string): EventItem[] => [
  {
    id: 'ei1',
    eventId: 'e1',
    userId,
    type: 'gift', // given to Imran (since Imran is our friend, and we guest at his event, we track it)
    personName: 'My Contribution (Me)',
    amount: 5000,
    giftItem: 'Tea Set + Glass Set',
    date: '2026-06-20',
    notes: 'Gave a nice 12-piece Tea & Glass Set and Rs. 2,000 cash contribution.'
  },
  {
    id: 'ei2',
    eventId: 'e1',
    userId,
    type: 'expense',
    amount: 1200,
    expenseCategory: 'Travel & Decor',
    date: '2026-06-20',
    notes: 'Fuel cost to attend the event.'
  },
  {
    id: 'ei3',
    eventId: 'e2',
    userId,
    type: 'gift', // Our gift to Sajid
    personName: 'My Contribution (Me)',
    amount: 15000,
    giftItem: 'Dinner Set (Luxury 72pc)',
    date: '2026-07-05',
    notes: 'Gave luxury dinner set + Rs. 5000 cash as Gift / Salami.'
  },
  {
    // Let's also simulate an event where WE are the host and received contributions from others!
    id: 'ei9',
    eventId: 'e3', // Host event
    userId,
    type: 'gift',
    personName: 'Uncle Arshad',
    amount: 10000,
    giftItem: 'Cash & Microwave Oven',
    date: '2026-06-14',
    notes: 'Received Gift / Salami for our son Aqeeqah.'
  }
];

// Add an event hosted by us in simulation
export const getHostedSimulatedEvent = (userId: string): EventEntity => ({
  id: 'e3',
  userId,
  name: "Our Son's Aqeeqah Function",
  type: 'Aqeeqah',
  date: '2026-06-14',
  plannedBudget: 120000,
  notes: 'Hosted at our house. Recording all gifts returned by friends and relatives!'
});

export const getInitialHostedEventItems = (userId: string): EventItem[] => [
  {
    id: 'ei4',
    eventId: 'e3',
    userId,
    type: 'gift',
    personName: 'Zeeshan Ali',
    amount: 5000,
    giftItem: 'Cash',
    date: '2026-06-14',
    notes: 'Returned Rs. 5,000 Salami (We gave him Rs. 3,000 last year on his birthday).'
  },
  {
    id: 'ei5',
    eventId: 'e3',
    userId,
    type: 'gift',
    personName: 'Ayesha Khan',
    amount: 3000,
    giftItem: 'Baby Gift Pack & Clothes Set',
    date: '2026-06-14',
    notes: 'Gave baby blankets, standard garments.'
  },
  {
    id: 'ei6',
    eventId: 'e3',
    userId,
    type: 'gift',
    personName: 'Kamran Mughal',
    amount: 8000,
    giftItem: 'Pedestal Fan',
    date: '2026-06-14',
    notes: 'Gave a nice GFC Pedestal Fan.'
  },
  {
    id: 'ei7',
    eventId: 'e3',
    userId,
    type: 'expense',
    amount: 65000,
    expenseCategory: 'Catering',
    date: '2026-06-14',
    notes: 'Paid Deg / Food (Mutton Palao & Kheer) catering bill.'
  },
  {
    id: 'ei8',
    eventId: 'e3',
    userId,
    type: 'expense',
    amount: 25000,
    expenseCategory: 'Tents & Sound',
    date: '2026-06-14',
    notes: 'Tent service & seating arrangements.'
  }
];
