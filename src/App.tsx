import React, { useState, useEffect } from 'react';
import { 
  UserAccount, Ledger, Transaction, EventEntity, EventItem, DeletedLedger, DeletedEvent,
  ExpenseBook, ExpenseEntry
} from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LedgerDetail from './components/LedgerDetail';
import EventDetail from './components/EventDetail';
import ExpenseTracker from './components/ExpenseTracker';
import { translations, translatePresetName } from './utils/translations';
import { 
  getInitialLedgers, 
  getInitialTransactions, 
  getInitialEvents, 
  getInitialEventItems,
  getHostedSimulatedEvent,
  getInitialHostedEventItems,
  SIMULATED_CONTACTS
} from './utils/dummyData';
import { 
  BookOpen, AlertCircle, Sparkles, Check, LogOut, Menu, X, ChevronRight, 
  User, TrendingUp, Gift, CreditCard, Settings, Trash2, Shield, 
  RefreshCw, Download, Upload, UserMinus, ShieldAlert, ArrowLeft,
  Calendar, Info, HelpCircle, Lock, Mail, Phone
} from 'lucide-react';

// Firebase core imports
import { db, auth } from './firebase';
import { cleanUndefined } from './lib/firestoreUtils';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser, updatePassword, updateEmail } from 'firebase/auth';

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core Ledger, transaction and event states
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [eventItems, setEventItems] = useState<EventItem[]>([]);

  // Expense tracker states
  const [expenseBooks, setExpenseBooks] = useState<ExpenseBook[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [showExpenseTracker, setShowExpenseTracker] = useState(false);

  // Custom Confirmation Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ title, message, onConfirm });
  };

  // Recycle Bin states for recovery & undo deleted items
  const [deletedLedgers, setDeletedLedgers] = useState<DeletedLedger[]>([]);
  const [deletedEvents, setDeletedEvents] = useState<DeletedEvent[]>([]);

  // Navigation / View states
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'english' | 'urdu' | 'hindi'>(
    (localStorage.getItem('saveledger_lang') as 'english' | 'urdu' | 'hindi') ||
    (localStorage.getItem('trustbook_lang') as 'english' | 'urdu' | 'hindi') || 'english'
  );

  const texts = translations[language];

  // Profile settings options
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileMobile, setProfileMobile] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfileMobile(currentUser.mobile || '');
    }
  }, [currentUser]);

  // Load user session on startup & track Firebase Authentication
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Authenticated user found in Firebase
          let userAccount: UserAccount;
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              userAccount = userDocSnap.data() as UserAccount;
            } else {
              userAccount = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Cloud User',
                email: firebaseUser.email || '',
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, cleanUndefined(userAccount));
            }
          } catch (docErr) {
            console.warn("Firestore user profile fetch notice (using auth profile fallback):", docErr);
            userAccount = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Cloud User',
              email: firebaseUser.email || '',
              createdAt: new Date().toISOString()
            };
          }
          
          setCurrentUser(userAccount);
          localStorage.setItem('saveledger_current_user', JSON.stringify(userAccount));
        } else {
          // No Firebase Auth user - clear state and require registration/login
          setCurrentUser(null);
          localStorage.removeItem('saveledger_current_user');
          localStorage.removeItem('trustbook_current_user');
        }
      } catch (err) {
        console.error("Authentication error:", err);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Cloud Subscriptions & Offline Fallbacks
  useEffect(() => {
    if (!currentUser) {
      setLedgers([]);
      setTransactions([]);
      setEvents([]);
      setEventItems([]);
      setDeletedLedgers([]);
      setDeletedEvents([]);
      setExpenseBooks([]);
      setExpenses([]);
      return;
    }

    const userId = currentUser.id;
    const isOfflineDemo = userId === 'u1'; // Flag for mock offline preview mode

    if (isOfflineDemo) {
      // 1. Load Ledgers local
      const storedLedgers = localStorage.getItem(`saveledger_ledgers_${userId}`) || localStorage.getItem(`trustbook_ledgers_${userId}`);
      if (storedLedgers) {
        setLedgers(JSON.parse(storedLedgers));
      } else {
        const initial = getInitialLedgers(userId);
        setLedgers(initial);
        localStorage.setItem(`saveledger_ledgers_${userId}`, JSON.stringify(initial));
      }

      // 2. Load Tx local
      const storedTx = localStorage.getItem(`saveledger_tx_${userId}`) || localStorage.getItem(`trustbook_tx_${userId}`);
      if (storedTx) {
        setTransactions(JSON.parse(storedTx));
      } else {
        const initial = getInitialTransactions(userId);
        setTransactions(initial);
        localStorage.setItem(`saveledger_tx_${userId}`, JSON.stringify(initial));
      }

      // 3. Load Events local
      const storedEvents = localStorage.getItem(`saveledger_events_${userId}`) || localStorage.getItem(`trustbook_events_${userId}`);
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      } else {
        const initial = [...getInitialEvents(userId), getHostedSimulatedEvent(userId)];
        setEvents(initial);
        localStorage.setItem(`saveledger_events_${userId}`, JSON.stringify(initial));
      }

      // 4. Load Event Items local
      const storedEventItems = localStorage.getItem(`saveledger_event_items_${userId}`) || localStorage.getItem(`trustbook_event_items_${userId}`);
      if (storedEventItems) {
        setEventItems(JSON.parse(storedEventItems));
      } else {
        const initial = [...getInitialEventItems(userId), ...getInitialHostedEventItems(userId)];
        setEventItems(initial);
        localStorage.setItem(`saveledger_event_items_${userId}`, JSON.stringify(initial));
      }

      // 5. Load Recycle Bins local
      const storedDelLedgers = localStorage.getItem(`saveledger_deleted_ledgers_${userId}`) || localStorage.getItem(`trustbook_deleted_ledgers_${userId}`);
      setDeletedLedgers(storedDelLedgers ? JSON.parse(storedDelLedgers) : []);

      const storedDelEvents = localStorage.getItem(`saveledger_deleted_events_${userId}`) || localStorage.getItem(`trustbook_deleted_events_${userId}`);
      setDeletedEvents(storedDelEvents ? JSON.parse(storedDelEvents) : []);

      // 6. Load Expense Books local
      const storedExpenseBooks = localStorage.getItem(`saveledger_expense_books_${userId}`) || localStorage.getItem(`trustbook_expense_books_${userId}`);
      if (storedExpenseBooks) {
        setExpenseBooks(JSON.parse(storedExpenseBooks));
      } else {
        setExpenseBooks([]);
        localStorage.setItem(`saveledger_expense_books_${userId}`, JSON.stringify([]));
      }

      // 7. Load Expenses local
      const storedExpenses = localStorage.getItem(`saveledger_expenses_${userId}`) || localStorage.getItem(`trustbook_expenses_${userId}`);
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      } else {
        setExpenses([]);
        localStorage.setItem(`saveledger_expenses_${userId}`, JSON.stringify([]));
      }
      
      return; // Skip real-time Firestore synchronization for offline guest user
    }

    // AUTHENTICATED REAL-TIME SYNCHRONIZATION WITH CLOUD FIRESTORE
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return;
    }

    const handleSyncError = (col: string) => (err: any) => {
      console.warn(`Firestore subscription sync notice (${col}):`, err);
    };

    // Subscribe to Ledgers
    const qLedgers = query(collection(db, 'ledgers'), where('userId', '==', userId));
    const unsubLedgers = onSnapshot(qLedgers, async (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as Ledger);
      
      if (items.length === 0) {
        if (localStorage.getItem(`trustbook_seeded_ledgers_${userId}`)) {
          setLedgers([]);
          return;
        }
        // Run migration / initial seeding
        const localLeds = localStorage.getItem(`trustbook_ledgers_${userId}`) || localStorage.getItem(`trustbook_ledgers_u1`);
        const initial = localLeds ? JSON.parse(localLeds) : getInitialLedgers(userId);
        const migrated = initial.map((l: any) => ({ ...l, userId }));
        
        try {
          for (const ledger of migrated) {
            await setDoc(doc(db, 'ledgers', ledger.id), cleanUndefined(ledger));
          }
          localStorage.setItem(`trustbook_seeded_ledgers_${userId}`, 'true');
        } catch (err) {
          console.error("Failed to seed ledgers", err);
        }
      } else {
        localStorage.setItem(`trustbook_seeded_ledgers_${userId}`, 'true');
        setLedgers(items.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      }
    }, handleSyncError('ledgers'));

    // Subscribe to Transactions
    const qTx = query(collection(db, 'transactions'), where('userId', '==', userId));
    const unsubTx = onSnapshot(qTx, async (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as Transaction);
      
      if (items.length === 0) {
        if (localStorage.getItem(`trustbook_seeded_tx_${userId}`)) {
          setTransactions([]);
          return;
        }
        // Run migration / initial seeding
        const localTx = localStorage.getItem(`trustbook_tx_${userId}`) || localStorage.getItem(`trustbook_tx_u1`);
        const initial = localTx ? JSON.parse(localTx) : getInitialTransactions(userId);
        const migrated = initial.map((t: any) => ({ ...t, userId }));
        
        try {
          for (const tx of migrated) {
            await setDoc(doc(db, 'transactions', tx.id), cleanUndefined(tx));
            if (tx.type === 'Return') {
              await setDoc(doc(db, 'repayments', tx.id), cleanUndefined(tx)); // Sync custom repayments
            }
          }
          localStorage.setItem(`trustbook_seeded_tx_${userId}`, 'true');
        } catch (err) {
          console.error("Failed to seed tx", err);
        }
      } else {
        localStorage.setItem(`trustbook_seeded_tx_${userId}`, 'true');
        setTransactions(items);
      }
    }, handleSyncError('transactions'));

    // Subscribe to Events
    const qEvents = query(collection(db, 'events'), where('userId', '==', userId));
    const unsubEvents = onSnapshot(qEvents, async (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as EventEntity);
      
      if (items.length === 0) {
        if (localStorage.getItem(`trustbook_seeded_events_${userId}`)) {
          setEvents([]);
          return;
        }
        // Migration / initial seeding
        const localEvents = localStorage.getItem(`trustbook_events_${userId}`) || localStorage.getItem(`trustbook_events_u1`);
        const initial = localEvents ? JSON.parse(localEvents) : [...getInitialEvents(userId), getHostedSimulatedEvent(userId)];
        const migrated = initial.map((e: any) => ({ ...e, userId }));
        
        try {
          for (const ev of migrated) {
            await setDoc(doc(db, 'events', ev.id), cleanUndefined(ev));
          }
          localStorage.setItem(`trustbook_seeded_events_${userId}`, 'true');
        } catch (err) {
          console.error("Failed to seed events", err);
        }
      } else {
        localStorage.setItem(`trustbook_seeded_events_${userId}`, 'true');
        setEvents(items);
      }
    }, handleSyncError('events'));

    // Subscribe to Event Items
    const qEventItems = query(collection(db, 'eventItems'), where('userId', '==', userId));
    const unsubEventItems = onSnapshot(qEventItems, async (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as EventItem);
      
      if (items.length === 0) {
        if (localStorage.getItem(`trustbook_seeded_event_items_${userId}`)) {
          setEventItems([]);
          return;
        }
        // Migration / initial seeding
        const localItems = localStorage.getItem(`trustbook_event_items_${userId}`) || localStorage.getItem(`trustbook_event_items_u1`);
        const initial = localItems ? JSON.parse(localItems) : [...getInitialEventItems(userId), ...getInitialHostedEventItems(userId)];
        // Ensure seenIds/unique is set
        const seenIds = new Set<string>();
        const migrated = initial.map((item: any, idx: number) => {
          const uniqueId = seenIds.has(item.id) ? `${item.id}_u_${idx}` : item.id;
          seenIds.add(uniqueId);
          return { ...item, id: uniqueId, userId };
        });

        try {
          for (const item of migrated) {
            await setDoc(doc(db, 'eventItems', item.id), cleanUndefined(item));
          }
          localStorage.setItem(`trustbook_seeded_event_items_${userId}`, 'true');
        } catch (err) {
          console.error("Failed to seed event items", err);
        }
      } else {
        localStorage.setItem(`trustbook_seeded_event_items_${userId}`, 'true');
        setEventItems(items);
      }
    }, handleSyncError('eventItems'));

    // Subscribe to Deleted Ledgers
    const qDelLedgers = query(collection(db, 'deleted_ledgers'), where('userId', '==', userId));
    const unsubDelLedgers = onSnapshot(qDelLedgers, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as DeletedLedger);
      setDeletedLedgers(items);
    }, handleSyncError('deleted_ledgers'));

    // Subscribe to Deleted Events
    const qDelEvents = query(collection(db, 'deleted_events'), where('userId', '==', userId));
    const unsubDelEvents = onSnapshot(qDelEvents, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as DeletedEvent);
      setDeletedEvents(items);
    }, handleSyncError('deleted_events'));

    // List/Subscribe to user settings doc
    const unsubSettings = onSnapshot(doc(db, 'settings', userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.language && data.language !== language) {
          setLanguage(data.language);
          localStorage.setItem('trustbook_lang', data.language);
        }
      }
    }, handleSyncError('settings'));

    // Subscribe to Expense Books
    const qExpenseBooks = query(collection(db, 'expenseBooks'), where('userId', '==', userId));
    const unsubExpenseBooks = onSnapshot(qExpenseBooks, async (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as ExpenseBook);
      setExpenseBooks(items.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      localStorage.setItem(`trustbook_seeded_books_${userId}`, 'true');
    }, handleSyncError('expenseBooks'));

    // Subscribe to Expenses
    const qExpenses = query(collection(db, 'expenses'), where('userId', '==', userId));
    const unsubExpenses = onSnapshot(qExpenses, async (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as ExpenseEntry);
      setExpenses(items);
      localStorage.setItem(`trustbook_seeded_expenses_${userId}`, 'true');
    }, handleSyncError('expenses'));

    // Seed/sync Contacts list into Firestore contacts collection
    const seedContacts = async () => {
      try {
        const qContacts = query(collection(db, 'contacts'), where('userId', '==', userId));
        const getDocSnap = await getDocs(qContacts);
        if (getDocSnap.empty) {
          for (const c of SIMULATED_CONTACTS) {
            const newContact = { ...c, userId };
            await setDoc(doc(db, 'contacts', `${userId}_${c.id}`), cleanUndefined(newContact));
          }
        }
      } catch (err) {
        console.warn("Contacts sync notice:", err);
      }
    };
    seedContacts();

    return () => {
      unsubLedgers();
      unsubTx();
      unsubEvents();
      unsubEventItems();
      unsubDelLedgers();
      unsubDelEvents();
      unsubSettings();
      unsubExpenseBooks();
      unsubExpenses();
    };
  }, [currentUser]);

  // Persist handlers that dispatch both to Local Storage (demo) and Cloud Firestore (live)
    const saveLedgers = async (updated: Ledger[]) => {
    if (!currentUser) return;
    setLedgers(updated);
    localStorage.setItem(`saveledger_ledgers_${currentUser.id}`, JSON.stringify(updated));
  };

  const saveTransactions = async (updated: Transaction[]) => {
    if (!currentUser) return;
    setTransactions(updated);
    localStorage.setItem(`saveledger_tx_${currentUser.id}`, JSON.stringify(updated));
  };

  const saveEvents = async (updated: EventEntity[]) => {
    if (!currentUser) return;
    setEvents(updated);
    localStorage.setItem(`saveledger_events_${currentUser.id}`, JSON.stringify(updated));
  };

  const saveEventItems = async (updated: EventItem[]) => {
    if (!currentUser) return;
    setEventItems(updated);
    localStorage.setItem(`saveledger_event_items_${currentUser.id}`, JSON.stringify(updated));
  };

  const saveDeletedLedgers = async (updated: DeletedLedger[]) => {
    if (!currentUser) return;
    setDeletedLedgers(updated);
    localStorage.setItem(`saveledger_deleted_ledgers_${currentUser.id}`, JSON.stringify(updated));
  };

  const saveDeletedEvents = async (updated: DeletedEvent[]) => {
    if (!currentUser) return;
    setDeletedEvents(updated);
    localStorage.setItem(`saveledger_deleted_events_${currentUser.id}`, JSON.stringify(updated));
  };

  const saveExpenseBooks = async (updated: ExpenseBook[]) => {
    if (!currentUser) return;
    setExpenseBooks(updated);
    localStorage.setItem(`saveledger_expense_books_${currentUser.id}`, JSON.stringify(updated));
  };

  const saveExpenses = async (updated: ExpenseEntry[]) => {
    if (!currentUser) return;
    setExpenses(updated);
    localStorage.setItem(`saveledger_expenses_${currentUser.id}`, JSON.stringify(updated));
  };

  // Core Actions
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('saveledger_current_user', JSON.stringify(user));
  };

  const handleLogOut = async () => {
    // If authenticated via Firebase, log out cleanly
    if (auth.currentUser) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Error logging out of Firebase Auth', err);
      }
    }
    setCurrentUser(null);
    setSelectedLedger(null);
    setSelectedEvent(null);
    localStorage.removeItem('saveledger_current_user');
    localStorage.removeItem('trustbook_current_user');
  };

  // Ledger actions
  const handleAddLedger = async (name: string, description: string) => {
    if (!currentUser) return;
    const newLedger: Ledger = {
      id: 'l_' + Date.now(),
      userId: currentUser.id,
      name,
      description: description || undefined,
      createdAt: new Date().toISOString()
    };
    
    if (currentUser.id === 'u1') {
      saveLedgers([...ledgers, newLedger]);
    } else {
      await setDoc(doc(db, 'ledgers', newLedger.id), cleanUndefined(newLedger));
    }
  };

  const handleDeleteLedger = async (id: string) => {
    const targetLedger = ledgers.find(l => l.id === id);
    if (!targetLedger) return;

    const associatedTx = transactions.filter(t => t.ledgerId === id);
    
    // Add to DeletedLedgers
    const newDeletedLedger: DeletedLedger = {
      id: 'del_l_' + Date.now(),
      ledger: targetLedger,
      associatedTransactions: associatedTx,
      deletedAt: new Date().toISOString()
    };
    
    if (currentUser?.id === 'u1') {
      saveDeletedLedgers([...deletedLedgers, newDeletedLedger]);
      saveLedgers(ledgers.filter(l => l.id !== id));
      saveTransactions(transactions.filter(t => t.ledgerId !== id));
    } else {
      // Write to Firestore collections (including repayments synchronization)
      await setDoc(doc(db, 'deleted_ledgers', newDeletedLedger.id), cleanUndefined({ ...newDeletedLedger, userId: currentUser?.id }));
      await deleteDoc(doc(db, 'ledgers', id));
      for (const t of associatedTx) {
        await deleteDoc(doc(db, 'transactions', t.id));
        if (t.type === 'Return') {
          await deleteDoc(doc(db, 'repayments', t.id));
        }
      }
    }

    if (selectedLedger?.id === id) setSelectedLedger(null);
  };

  const handleRestoreLedger = async (deletedId: string) => {
    const record = deletedLedgers.find(dl => dl.id === deletedId);
    if (!record) return;

    if (currentUser?.id === 'u1') {
      saveLedgers([...ledgers, record.ledger]);
      saveTransactions([...transactions, ...record.associatedTransactions]);
      saveDeletedLedgers(deletedLedgers.filter(dl => dl.id !== deletedId));
    } else {
      await setDoc(doc(db, 'ledgers', record.ledger.id), cleanUndefined(record.ledger));
      for (const t of record.associatedTransactions) {
        await setDoc(doc(db, 'transactions', t.id), cleanUndefined(t));
        if (t.type === 'Return') {
          await setDoc(doc(db, 'repayments', t.id), cleanUndefined(t));
        }
      }
      await deleteDoc(doc(db, 'deleted_ledgers', deletedId));
    }
  };

  const handlePermanentDeleteLedger = async (deletedId: string) => {
    if (currentUser?.id === 'u1') {
      saveDeletedLedgers(deletedLedgers.filter(dl => dl.id !== deletedId));
    } else {
      await deleteDoc(doc(db, 'deleted_ledgers', deletedId));
    }
  };

  // Transaction actions within a ledger
  const handleAddTransaction = async (newTxData: Omit<Transaction, 'id' | 'ledgerId' | 'userId'>) => {
    if (!currentUser || !selectedLedger) return;
    const newTx: Transaction = {
      ...newTxData,
      id: 'tx_' + Date.now(),
      ledgerId: selectedLedger.id,
      userId: currentUser.id
    };
    
    if (currentUser.id === 'u1') {
      saveTransactions([...transactions, newTx]);
    } else {
      await setDoc(doc(db, 'transactions', newTx.id), cleanUndefined(newTx));
      if (newTx.type === 'Return') {
        await setDoc(doc(db, 'repayments', newTx.id), cleanUndefined(newTx));
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const targetTx = transactions.find(t => t.id === id);
    if (currentUser?.id === 'u1') {
      saveTransactions(transactions.filter(t => t.id !== id));
    } else {
      await deleteDoc(doc(db, 'transactions', id));
      if (targetTx?.type === 'Return') {
        await deleteDoc(doc(db, 'repayments', id));
      }
    }
  };

  const handleDeletePersonTransactions = async (personName: string, ledgerId: string) => {
    const matched = transactions.filter(t => t.personName.trim().toLowerCase() === personName.trim().toLowerCase() && t.ledgerId === ledgerId);
    
    if (currentUser?.id === 'u1') {
      saveTransactions(transactions.filter(t => !(t.personName.trim().toLowerCase() === personName.trim().toLowerCase() && t.ledgerId === ledgerId)));
    } else {
      for (const t of matched) {
        await deleteDoc(doc(db, 'transactions', t.id));
        if (t.type === 'Return') {
          await deleteDoc(doc(db, 'repayments', t.id));
        }
      }
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    if (currentUser?.id === 'u1') {
      saveTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
    } else {
      await setDoc(doc(db, 'transactions', updatedTx.id), cleanUndefined(updatedTx));
      if (updatedTx.type === 'Return') {
        await setDoc(doc(db, 'repayments', updatedTx.id), cleanUndefined(updatedTx));
      } else {
        // If type changed from return to else, clean up from repayment collection
        await deleteDoc(doc(db, 'repayments', updatedTx.id));
      }
    }
  };

  // Event actions
  const handleAddEvent = async (newEventData: Omit<EventEntity, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newEvent: EventEntity = {
      ...newEventData,
      id: 'e_' + Date.now(),
      userId: currentUser.id
    };
    
    if (currentUser.id === 'u1') {
      saveEvents([...events, newEvent]);
    } else {
      await setDoc(doc(db, 'events', newEvent.id), cleanUndefined(newEvent));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const targetEvent = events.find(e => e.id === id);
    if (!targetEvent) return;

    const associatedItems = eventItems.filter(item => item.eventId === id);

    const newDeletedEvent: DeletedEvent = {
      id: 'del_e_' + Date.now(),
      event: targetEvent,
      associatedEventItems: associatedItems,
      deletedAt: new Date().toISOString()
    };

    if (currentUser?.id === 'u1') {
      saveDeletedEvents([...deletedEvents, newDeletedEvent]);
      saveEvents(events.filter(e => e.id !== id));
      saveEventItems(eventItems.filter(item => item.eventId !== id));
    } else {
      await setDoc(doc(db, 'deleted_events', newDeletedEvent.id), cleanUndefined({ ...newDeletedEvent, userId: currentUser?.id }));
      await deleteDoc(doc(db, 'events', id));
      for (const item of associatedItems) {
        await deleteDoc(doc(db, 'eventItems', item.id));
      }
    }

    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  const handleRestoreEvent = async (deletedId: string) => {
    const record = deletedEvents.find(de => de.id === deletedId);
    if (!record) return;

    if (currentUser?.id === 'u1') {
      saveEvents([...events, record.event]);
      saveEventItems([...eventItems, ...record.associatedEventItems]);
      saveDeletedEvents(deletedEvents.filter(de => de.id !== deletedId));
    } else {
      await setDoc(doc(db, 'events', record.event.id), cleanUndefined(record.event));
      for (const item of record.associatedEventItems) {
        await setDoc(doc(db, 'eventItems', item.id), cleanUndefined(item));
      }
      await deleteDoc(doc(db, 'deleted_events', deletedId));
    }
  };

  const handlePermanentDeleteEvent = async (deletedId: string) => {
    if (currentUser?.id === 'u1') {
      saveDeletedEvents(deletedEvents.filter(de => de.id !== deletedId));
    } else {
      await deleteDoc(doc(db, 'deleted_events', deletedId));
    }
  };

  const handleDeleteAllData = async () => {
    if (!currentUser) return;
    const userId = currentUser.id;

    // Prevent auto-reseeding default dummy data
    localStorage.setItem(`saveledger_seeded_ledgers_${userId}`, 'true');
    localStorage.setItem(`saveledger_seeded_tx_${userId}`, 'true');
    localStorage.setItem(`saveledger_seeded_events_${userId}`, 'true');
    localStorage.setItem(`saveledger_seeded_event_items_${userId}`, 'true');
    localStorage.setItem(`saveledger_seeded_expense_books_${userId}`, 'true');
    localStorage.setItem(`saveledger_seeded_expenses_${userId}`, 'true');

    // Delete ledgers
    const ledgerIds = ledgers.map(l => l.id);
    for (const id of ledgerIds) {
      await handleDeleteLedger(id);
    }

    // Delete events
    const eventIds = events.map(e => e.id);
    for (const id of eventIds) {
      await handleDeleteEvent(id);
    }

    // Delete expense books
    const bookIds = expenseBooks.map(b => b.id);
    for (const id of bookIds) {
      await handleDeleteExpenseBook(id);
    }

    // Purge any remaining orphan items or transactions or expense records
    if (currentUser.id === 'u1') {
      saveEventItems([]);
      saveTransactions([]);
      saveExpenseBooks([]);
      saveExpenses([]);
    } else {
      for (const item of eventItems) {
        await deleteDoc(doc(db, 'eventItems', item.id));
      }
      for (const t of transactions) {
        await deleteDoc(doc(db, 'transactions', t.id));
      }
      for (const b of expenseBooks) {
        await deleteDoc(doc(db, 'expenseBooks', b.id));
      }
      for (const exp of expenses) {
        await deleteDoc(doc(db, 'expenses', exp.id));
      }
    }
  };

  // Event Item Actions (Gifts / contribution vs Expenses spent out)
  const handleAddEventItem = async (newItemData: Omit<EventItem, 'id' | 'eventId' | 'userId'>) => {
    if (!currentUser || !selectedEvent) return;
    const newItem: EventItem = {
      ...newItemData,
      id: 'ei_' + Date.now(),
      eventId: selectedEvent.id,
      userId: currentUser.id
    };
    
    if (currentUser.id === 'u1') {
      saveEventItems([...eventItems, newItem]);
    } else {
      await setDoc(doc(db, 'eventItems', newItem.id), cleanUndefined(newItem));
    }
  };

  const handleDeleteEventItem = async (id: string) => {
    if (currentUser?.id === 'u1') {
      saveEventItems(eventItems.filter(item => item.id !== id));
    } else {
      await deleteDoc(doc(db, 'eventItems', id));
    }
  };

  const handleUpdateEventItem = async (updatedItem: EventItem) => {
    if (currentUser?.id === 'u1') {
      saveEventItems(eventItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    } else {
      await setDoc(doc(db, 'eventItems', updatedItem.id), cleanUndefined(updatedItem));
    }
  };

  // Expense Tracker Actions
  const handleAddExpenseBook = async (bookData: Omit<ExpenseBook, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    const newBook: ExpenseBook = {
      ...bookData,
      id: 'eb_' + Date.now(),
      userId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    
    if (currentUser.id === 'u1') {
      saveExpenseBooks([...expenseBooks, newBook]);
    } else {
      await setDoc(doc(db, 'expenseBooks', newBook.id), cleanUndefined(newBook));
    }
  };

  const handleUpdateExpenseBook = async (updatedBook: ExpenseBook) => {
    if (!currentUser) return;
    
    if (currentUser.id === 'u1') {
      saveExpenseBooks(expenseBooks.map(b => b.id === updatedBook.id ? updatedBook : b));
    } else {
      await setDoc(doc(db, 'expenseBooks', updatedBook.id), cleanUndefined(updatedBook));
    }
  };

  const handleDeleteExpenseBook = async (id: string) => {
    if (!currentUser) return;
    
    if (currentUser.id === 'u1') {
      saveExpenseBooks(expenseBooks.filter(b => b.id !== id));
      saveExpenses(expenses.filter(e => e.bookId !== id));
    } else {
      await deleteDoc(doc(db, 'expenseBooks', id));
      // Delete associated expenses
      const associatedExpenses = expenses.filter(e => e.bookId === id);
      for (const exp of associatedExpenses) {
        await deleteDoc(doc(db, 'expenses', exp.id));
      }
    }
  };

  const handleAddExpense = async (expenseData: Omit<ExpenseEntry, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    const newExpense: ExpenseEntry = {
      ...expenseData,
      id: 'exp_' + Date.now(),
      userId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    
    if (currentUser.id === 'u1') {
      saveExpenses([...expenses, newExpense]);
    } else {
      await setDoc(doc(db, 'expenses', newExpense.id), cleanUndefined(newExpense));
    }
  };

  const handleUpdateExpense = async (updatedExpense: ExpenseEntry) => {
    if (!currentUser) return;
    
    if (currentUser.id === 'u1') {
      saveExpenses(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    } else {
      await setDoc(doc(db, 'expenses', updatedExpense.id), cleanUndefined(updatedExpense));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!currentUser) return;
    
    if (currentUser.id === 'u1') {
      saveExpenses(expenses.filter(e => e.id !== id));
    } else {
      await deleteDoc(doc(db, 'expenses', id));
    }
  };

  // Backup & Import handlers
  const handleExportBackup = () => {
    if (!currentUser) return;
    const backupObj = {
      app: 'SaveLedger',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        mobile: currentUser.mobile
      },
      ledgers,
      transactions,
      events,
      eventItems,
      deletedLedgers,
      deletedEvents
    };
    
    const fileContent = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `saveledger_backup_${currentUser.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const backupObj = JSON.parse(text);

        // Basic verification
        if (!backupObj.ledgers || !Array.isArray(backupObj.ledgers)) {
          throw new Error('Invalid file format. Ledgers array not found.');
        }

        const performImport = async () => {
          if (currentUser && currentUser.id !== 'u1') {
            // Write directly to Cloud Firestore
            for (const item of backupObj.ledgers) {
              await setDoc(doc(db, 'ledgers', item.id), cleanUndefined({ ...item, userId: currentUser.id }));
            }
            if (backupObj.transactions && Array.isArray(backupObj.transactions)) {
              for (const item of backupObj.transactions) {
                await setDoc(doc(db, 'transactions', item.id), cleanUndefined({ ...item, userId: currentUser.id }));
                if (item.type === 'Return') {
                  await setDoc(doc(db, 'repayments', item.id), cleanUndefined({ ...item, userId: currentUser.id }));
                }
              }
            }
            if (backupObj.events && Array.isArray(backupObj.events)) {
              for (const item of backupObj.events) {
                await setDoc(doc(db, 'events', item.id), cleanUndefined({ ...item, userId: currentUser.id }));
              }
            }
            if (backupObj.eventItems && Array.isArray(backupObj.eventItems)) {
              for (const item of backupObj.eventItems) {
                await setDoc(doc(db, 'eventItems', item.id), cleanUndefined({ ...item, userId: currentUser.id }));
              }
            }
            if (backupObj.deletedLedgers && Array.isArray(backupObj.deletedLedgers)) {
              for (const item of backupObj.deletedLedgers) {
                await setDoc(doc(db, 'deleted_ledgers', item.id), cleanUndefined({ ...item, userId: currentUser.id }));
              }
            }
            if (backupObj.deletedEvents && Array.isArray(backupObj.deletedEvents)) {
              for (const item of backupObj.deletedEvents) {
                await setDoc(doc(db, 'deleted_events', item.id), cleanUndefined({ ...item, userId: currentUser.id }));
              }
            }
          } else {
            // Offline local save
            saveLedgers(backupObj.ledgers);
            if (backupObj.transactions && Array.isArray(backupObj.transactions)) {
              saveTransactions(backupObj.transactions);
            }
            if (backupObj.events && Array.isArray(backupObj.events)) {
              saveEvents(backupObj.events);
            }
            if (backupObj.eventItems && Array.isArray(backupObj.eventItems)) {
              saveEventItems(backupObj.eventItems);
            }
            if (backupObj.deletedLedgers && Array.isArray(backupObj.deletedLedgers)) {
              saveDeletedLedgers(backupObj.deletedLedgers);
            }
            if (backupObj.deletedEvents && Array.isArray(backupObj.deletedEvents)) {
              saveDeletedEvents(backupObj.deletedEvents);
            }
          }

          alert(
            language === 'urdu'
              ? 'بیک اپ کامیابی سے امپورٹ ہو گیا ہے!'
              : language === 'hindi'
                ? 'बैकअप सफलतापूर्वक आयात किया गया है!'
                : 'Backup imported successfully!'
          );
        };

        const title = language === 'urdu' ? 'بیک اپ امپورٹ کریں' : language === 'hindi' ? 'बैकअप आयात करें' : 'Import Backup';
        const msg = language === 'urdu' 
          ? 'کیا آپ واقعی اس بیک اپ فائل کو امپورٹ کرنا چاہتے ہیں؟ موجودہ بائی کھاتہ ڈیٹا اووررائٹ ہو سکتا ہے۔' 
          : language === 'hindi' 
            ? 'क्या आप सचमुच इस बैकअप फ़ाइल को आयात करना चाहते हैं? वर्तमान बहीखाता डेटा बदल सकता है।' 
            : 'Are you sure you want to import this backup file? This will merge/restore your data configuration.';

        triggerConfirm(title, msg, performImport);
      } catch (err: any) {
        alert(
          language === 'urdu'
            ? 'فائل لوڈ کرنے میں خرابی: ' + err.message
            : language === 'hindi'
              ? 'फ़ाइल लोड करने में त्रुटि: ' + err.message
              : 'Error parsing backup file: ' + err.message
        );
      }
    };
    reader.readAsText(file);
  };

  const handlePasswordResetRequest = async () => {
    if (!currentUser || !currentUser.email) return;
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      alert(
        language === 'urdu'
          ? `پاس ورڈ دوبارہ ترتیب دینے کا لنک کامیابی کے ساتھ آپ کے ای میل (${currentUser.email}) پر بھیج دیا گیا ہے۔ برائے مہربانی اپنا ان باکس دیکھیں۔`
          : language === 'hindi'
            ? `पासवर्ड रीसेट लिंक सफलतापूर्वक आपके ईमेल (${currentUser.email}) पर भेज दिया गया है। कृपया अपना इनबॉक्स जांचें।`
            : `Password reset link has been successfully sent to ${currentUser.email}. Please check your inbox.`
      );
    } catch (err: any) {
      console.error('Password reset failure from settings:', err);
      alert(
        language === 'urdu'
          ? 'ای میل بھیجنے میں خرابی: ' + err.message
          : language === 'hindi'
            ? 'ईमेल भेजने में असमर्थ: ' + err.message
            : 'Error sending reset email: ' + err.message
      );
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      // 1. Update Password & Email in Firebase Auth if needed (if not demo u1)
      if (currentUser.id !== 'u1') {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          // If password was provided
          if (profilePassword && profilePassword.trim() !== '') {
            try {
              await updatePassword(firebaseUser, profilePassword.trim());
              setProfilePassword(''); // Reset on success
            } catch (pErr: any) {
              console.error('Error updating Firebase Auth password:', pErr);
              if (pErr.code === 'auth/requires-recent-login') {
                throw new Error(
                  language === 'urdu'
                    ? 'سیکیورٹی وجوہات کی بنا پر پاس ورڈ تبدیل کرنے کے لیے آپ کا تازہ لاگ ان ضروری ہے۔ براہ کرم ایک بار لاگ آؤٹ کر کے دوبارہ لاگ ان کریں، یا نیچے "Security & Password Reset" سے ای میل لنک استعمال کریں۔'
                    : language === 'hindi'
                      ? 'सुरक्षा कारणों से पासवर्ड बदलने के लिए आपका ताजा लॉगिन आवश्यक है। कृपया एक बार लॉगआउट करके पुनः लॉगिन करें, या नीचे "Security & Password Reset" से ईमेल लिंक का उपयोग करें।'
                      : 'For security reasons, updating your password requires a fresh login. Please log out and log back in, or use "Send Reset Link Email" below.'
                );
              } else {
                throw new Error(
                  language === 'urdu'
                    ? 'پاس ورڈ تبدیل کرنے میں خرابی: ' + pErr.message
                    : language === 'hindi'
                      ? 'पासवर्ड बदलने में त्रुटि: ' + pErr.message
                      : 'Error changing password: ' + pErr.message
                );
              }
            }
          }

          // If email was changed
          if (profileEmail && profileEmail !== firebaseUser.email) {
            try {
              await updateEmail(firebaseUser, profileEmail.trim());
            } catch (eErr: any) {
              console.error('Error updating Firebase Auth email:', eErr);
              if (eErr.code === 'auth/requires-recent-login') {
                throw new Error(
                  language === 'urdu'
                    ? 'سیکیورٹی وجوہات کی بنا پر ای میل تبدیل کرنے کے لیے آپ کا تازہ لاگ ان ضروری ہے۔ براہ کرم ایک بار لاگ آؤٹ کر کے دوبارہ لاگ ان کریں اور کوشش کریں۔'
                    : language === 'hindi'
                      ? 'सुरक्षा कारणों से ईमेल बदलने के लिए आपका ताजा लॉगिन आवश्यक है। कृपया एक बार लॉगआउट करके पुनः लॉगिन करें और प्रयास करें।'
                      : 'For security reasons, changing your email requires a fresh login. Please log out and log back in, then try again.'
                );
              } else {
                throw new Error(
                  language === 'urdu'
                    ? 'ای میل تبدیل کرنے میں خرابی: ' + eErr.message
                    : language === 'hindi'
                      ? 'ईमेल बदलने में त्रुटि: ' + eErr.message
                      : 'Error changing email: ' + eErr.message
                );
              }
            }
          }
        }
      }

      // 2. Update in Firebase Firestore (if not demo u1)
      if (currentUser.id !== 'u1') {
        try {
          const userDocRef = doc(db, 'users', currentUser.id);
          await setDoc(userDocRef, cleanUndefined({
            id: currentUser.id,
            name: profileName,
            email: profileEmail,
            mobile: profileMobile
          }), { merge: true });
        } catch (err) {
          console.warn("Firestore user profile update notice:", err);
        }
      }

      // 3. Update React State and client-side localStorage
      const updatedUser: UserAccount = {
        ...currentUser,
        name: profileName,
        email: profileEmail,
        mobile: profileMobile
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('saveledger_current_user', JSON.stringify(updatedUser));

      // 4. Set success message based on language
      let msg = '';
      if (language === 'urdu') {
        msg = 'پروفائل کی تفصیلات (نام، ای میل، فون نمبر اور پاس ورڈ) کامیابی سے محفوظ ہو گئیں۔';
      } else if (language === 'hindi') {
        msg = 'प्रोफ़ाइल विवरण (नाम, ईमेल, फोन नंबर और पासवर्ड) सफलतापूर्वक सहेजा गया।';
      } else {
        msg = 'Profile details (name, email, phone number & password) updated successfully.';
      }
      setProfileSuccessMsg(msg);
      setTimeout(() => {
        setProfileSuccessMsg('');
      }, 5000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setProfileErrorMsg(err.message || (
        language === 'urdu'
          ? 'تبدیلیاں محفوظ کرنے میں خرابی واقع ہوئی ہے۔ دوبارہ کوشش کریں۔'
          : language === 'hindi'
            ? 'परिवर्तन सहेजने में त्रुटि हुई। कृपया पुन: प्रयास करें।'
            : 'Error saving profile changes. Please try again.'
      ));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEraseAccount = async () => {
    if (!currentUser) return;
    
    let confirmPrompt = 'Type "DELETE" to permanently erase this account and clean all associated records:';
    let cancelMsg = 'Action cancelled.';
    let successMsg = 'Your account and records have been deleted!';
    
    if (language === 'urdu') {
      confirmPrompt = 'اپنا اکاؤنٹ اور تمام ڈیٹا مستقل طور پر حذف کرنے کے لیے "DELETE" ٹائپ کریں:';
      cancelMsg = 'منسوخ کر دیا گیا ہے۔';
      successMsg = 'آپ کا اکاؤنٹ اور تمام کھاتہ ہسٹری مستقل طور پر حذف کر دی گئی ہے!';
    } else if (language === 'hindi') {
      confirmPrompt = 'अपना खाता और सारा डेटा हमेशा के लिए हटाने के लिए "DELETE" टाइप करें:';
      cancelMsg = 'प्रक्रिया रद्द कर दी गई।';
      successMsg = 'आपका खाता और बहीखाता डेटा सफलतापूर्वक हटा दिया गया है!';
    }

    const userInput = prompt(confirmPrompt);
    if (userInput !== 'DELETE') {
      alert(cancelMsg);
      return;
    }

    const userId = currentUser.id;

    // Erase database records from safe cloud Firestore locations if logged in as Firebase Auth User
    if (auth.currentUser && userId !== 'u1') {
      try {
        const collectionsToClean = [
          'ledgers',
          'transactions',
          'repayments',
          'events',
          'eventItems',
          'deleted_ledgers',
          'deleted_events',
          'expenseBooks',
          'expenses',
          'contacts'
        ];
        
        for (const colName of collectionsToClean) {
          const q = query(collection(db, colName), where('userId', '==', userId));
          const querySnapshot = await getDocs(q);
          const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
        }

        // Delete user database profile
        await deleteDoc(doc(db, 'users', userId));

        // Delete the authentication profile using clean firebase Auth system APIs
        await deleteUser(auth.currentUser);
      } catch (err: any) {
        console.error('Error erasing cloud account:', err);
        if (err.code === 'auth/requires-recent-login') {
          alert(
            language === 'urdu'
              ? 'سیکیورٹی وجوہات کی بنا پر، اس حساس عمل کے لیے دوبارہ لاگ ان ہونا ضروری ہے۔ براہ کرم لاگ آؤٹ کر کے دوبارہ لاگ ان کریں اور کوشش کریں۔'
              : language === 'hindi'
                ? 'सुरक्षा कारणों से, इस संवेदनशील कार्य के लिए फिर से लॉग इन करना आवश्यक है। कृपया लॉग आउट करें और पुनः लॉग इन करके प्रयास करें।'
                : 'For security reasons, this sensitive action requires a recent login. Please log out, sign back in, and try again.'
          );
          return;
        }
      }
    }

    // Always clean localStorage indices for consistency
    localStorage.removeItem(`trustbook_ledgers_${userId}`);
    localStorage.removeItem(`trustbook_tx_${userId}`);
    localStorage.removeItem(`trustbook_events_${userId}`);
    localStorage.removeItem(`trustbook_event_items_${userId}`);
    localStorage.removeItem(`trustbook_deleted_ledgers_${userId}`);
    localStorage.removeItem(`trustbook_deleted_events_${userId}`);

    // Remove from the multi-accounts list if present
    const accountsData = localStorage.getItem('trustbook_accounts');
    if (accountsData) {
      try {
        const list: UserAccount[] = JSON.parse(accountsData);
        const filtered = list.filter(u => u.id !== userId);
        localStorage.setItem('trustbook_accounts', JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
    }

    // Force sign out
    handleLogOut();
    alert(successMsg);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-600">Loading SaveLedger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white flex flex-col md:flex-row overflow-x-hidden">
      
      {!currentUser ? (
        /* Authentication / Welcome Screen has a polished minimalistic layout */
        <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 bg-slate-50">
          <div className="w-full max-w-md">
            <Auth onLogin={handleLogin} currentUser={currentUser} language={language} />
          </div>
        </div>
      ) : (
        /* Fully Immersive Custom Dashboard with Beautiful Sidebar & Content Shell */
        <>
          {/* Mobile Header bar */}
          <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                S
              </div>
              <span className="font-bold text-base tracking-tight">Save Ledger</span>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Sidebar Navigation */}
          <aside className={`
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 z-40 shrink-0 border-r border-slate-800 md:min-h-screen
          `}>
            {/* Top Brand Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/60 shrink-0">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-white text-lg">S</div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none text-white">Save Ledger</h1>
              </div>
            </div>

            {/* Sidebar Scrollable Nav Items */}
            <nav className="flex-1 px-4 py-6 space-y-5 overflow-y-auto">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">{texts.mainCategories}</div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedLedger(null);
                      setSelectedEvent(null);
                      setShowSettings(false);
                      setShowRecycleBin(false);
                      setShowExpenseTracker(false);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left group ${
                      !selectedLedger && !selectedEvent && !showSettings && !showRecycleBin && !showExpenseTracker
                        ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 font-medium'
                        : 'hover:bg-slate-800 text-slate-300 border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      !selectedLedger && !selectedEvent && !showSettings && !showRecycleBin && !showExpenseTracker
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}>
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{texts.loansDashboardLink}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLedger(null);
                      setSelectedEvent(null);
                      setShowSettings(false);
                      setShowRecycleBin(false);
                      setShowExpenseTracker(true);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left group ${
                      showExpenseTracker
                        ? 'bg-amber-600/10 text-amber-400 border-amber-500/20 font-medium'
                        : 'hover:bg-slate-800 text-slate-300 border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      showExpenseTracker
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}>
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-xs shrink-0">💰</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">
                      {language === 'urdu' ? 'اخراجات کا ٹریکر' : language === 'hindi' ? 'व्यय ट्रैकर' : 'Expense Tracker'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic User Custom Ledgers in Sidebar list! */}
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{texts.customLedgersHeader} ({ledgers.length})</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {ledgers.map((l, i) => {
                    const dotColors = ['bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-emerald-500', 'bg-sky-500'];
                    const dotClass = dotColors[i % dotColors.length];
                    const isSelected = selectedLedger?.id === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => {
                          setSelectedEvent(null);
                          setSelectedLedger(l);
                          setShowSettings(false);
                          setShowRecycleBin(false);
                          setShowExpenseTracker(false);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg text-xs transition-colors ${
                          isSelected 
                            ? 'bg-slate-800 text-emerald-400 font-bold border-l-2 border-emerald-500' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-2.5 h-2.5 rounded-full ${dotClass} shrink-0`}></div>
                          <span className="truncate">{translatePresetName(l.name, language)}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-white" />
                      </button>
                    );
                  })}
                  {ledgers.length === 0 && (
                    <span className="text-slate-600 text-[11px] block px-2 italic">{texts.noCustomLedgersSidebar}</span>
                  )}
                </div>
              </div>

              {/* Dynamic User Active Wedding / Aqeeqah functions in Sidebar! */}
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{texts.ceremonyEventsHeader} ({events.length})</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {events.map((e, index) => {
                    const isSelected = selectedEvent?.id === e.id;
                    return (
                      <button
                        key={e.id}
                        onClick={() => {
                          setSelectedLedger(null);
                          setSelectedEvent(e);
                          setShowSettings(false);
                          setShowRecycleBin(false);
                          setShowExpenseTracker(false);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg text-xs transition-colors ${
                          isSelected 
                            ? 'bg-slate-800 text-purple-400 font-bold border-l-2 border-purple-500' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>🎁</span>
                          <span className="truncate">{translatePresetName(e.name, language)}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                      </button>
                    );
                  })}
                  {events.length === 0 && (
                    <span className="text-slate-600 text-[11px] block px-2 italic">{texts.noEventsSidebar}</span>
                  )}
                </div>
              </div>

              {/* Settings & Tools / Recycle Bin Categories */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                  {language === 'urdu' ? 'ترتیبات اور کچرا دان' : language === 'hindi' ? 'सेटिंग्स और बकेट' : 'Settings & Trash'}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedLedger(null);
                      setSelectedEvent(null);
                      setShowSettings(true);
                      setShowRecycleBin(false);
                      setShowExpenseTracker(false);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                      showSettings
                        ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 font-medium'
                        : 'hover:bg-slate-800 text-slate-300 border-transparent'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="text-xs sm:text-sm font-medium">
                      {language === 'urdu' ? 'بیک اپ اور ترتیبات' : language === 'hindi' ? 'बैकअप और सेटिंग्स' : 'Settings & Backup'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLedger(null);
                      setSelectedEvent(null);
                      setShowSettings(false);
                      setShowRecycleBin(true);
                      setShowExpenseTracker(false);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                      showRecycleBin
                        ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 font-medium'
                        : 'hover:bg-slate-800 text-slate-300 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-4 h-4 text-slate-400" />
                      <span className="text-xs sm:text-sm font-medium">
                        {language === 'urdu' ? 'حذف شدہ اشیاء' : language === 'hindi' ? 'हटाए गए आइटम' : 'Deleted Items'}
                      </span>
                    </div>
                    {deletedLedgers.length + deletedEvents.length > 0 && (
                      <span className="bg-emerald-600 text-white font-bold text-[10px] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
                        {deletedLedgers.length + deletedEvents.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </nav>

            {/* User credentials summary & logout at the bottom of sidebar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
              <div className="flex items-center justify-between gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {currentUser.name[0].toUpperCase()}
                  </div>
                  <div className="truncate space-y-0.5">
                    <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-300 font-mono truncate leading-tight">
                      {currentUser.email || 'No email registered'}
                    </p>
                    {currentUser.mobile && (
                      <p className="text-[10px] text-emerald-400 font-mono truncate leading-tight">
                        {currentUser.mobile}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogOut}
                  className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                  title="Sign Out / Change Book Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
              <div className="flex items-center text-[10px] sm:text-xs text-slate-600 font-bold gap-1.5 bg-slate-50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-slate-200/80 truncate max-w-[170px] xs:max-w-[220px] sm:max-w-md">
                <span className="truncate">{texts.liveSandboxBanner}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Language Selector */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-3xs font-bold">
                  <select
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value as 'english' | 'urdu' | 'hindi';
                      setLanguage(newLang);
                      localStorage.setItem('saveledger_lang', newLang);
                    }}
                    className="bg-transparent text-xs text-slate-700 font-extrabold border-0 p-0 focus:ring-0 cursor-pointer outline-hidden"
                  >
                    <option value="english">🇬🇧 English</option>
                    <option value="urdu">🇵🇰 اردو</option>
                    <option value="hindi">🇮🇳 हिन्दी</option>
                  </select>
                </div>
              </div>
            </header>

            {/* Dynamic Viewport */}
            <div className="p-4 sm:p-8 flex-1 bg-slate-50 md:overflow-y-auto overflow-y-visible">
              
              {/* Core active view */}
              <div className="max-w-5xl mx-auto">
                {selectedLedger ? (
                  /* Detailed Ledger timeline */
                  <LedgerDetail
                    ledger={selectedLedger}
                    transactions={transactions}
                    onBack={() => setSelectedLedger(null)}
                    onAddTransaction={handleAddTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onDeletePersonTransactions={handleDeletePersonTransactions}
                    onUpdateTransaction={handleUpdateTransaction}
                    language={language}
                    triggerConfirm={triggerConfirm}
                  />
                ) : selectedEvent ? (
                  /* Detailed Event manager */
                  <EventDetail
                    event={selectedEvent}
                    eventItems={eventItems}
                    onBack={() => setSelectedEvent(null)}
                    onAddEventItem={handleAddEventItem}
                    onDeleteEventItem={handleDeleteEventItem}
                    onUpdateEventItem={handleUpdateEventItem}
                    language={language}
                    triggerConfirm={triggerConfirm}
                  />
                ) : showSettings ? (
                  /* Settings Screen Panel */
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-8 space-y-8 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center shrink-0"
                        title={language === 'urdu' ? 'واپس جائیں' : language === 'hindi' ? 'वापस जाएं' : 'Go Back'}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <Settings className="w-5.5 h-5.5 text-slate-600" />
                          <span>{language === 'urdu' ? 'ترتیبات اور بیک آپ' : language === 'hindi' ? 'सेटिंग्स और बैकअप' : 'App Settings & Backup'}</span>
                        </h2>
                        <p className="text-slate-500 text-xs mt-0.5 sm:mt-1">
                          {language === 'urdu' ? 'اپنے کھاتہ کے بیک آپ اور رازداری کے قواعد کو کنٹرول کریں' : language === 'hindi' ? 'अपने बहीखाता बैकअप और गोपनीयता नियमों को नियंत्रित करें' : 'Control your local SaveLedger backup, download datasets and secure records.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* App Profile & Contact Settings Card */}
                      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs hover:shadow-md transition-all md:col-span-2">
                        <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-extrabold text-slate-800">
                              {language === 'urdu' ? 'پروفائل اور رابطہ کی تفصیلات' : language === 'hindi' ? 'प्रोफ़ाइल और संपर्क विवरण' : 'App Profile & Contact Settings'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {language === 'urdu' ? 'اپنے اکاؤنٹ کا نام، ای میل اور موبائل نمبر تبدیل کریں۔' : language === 'hindi' ? 'अपने खाते का नाम, ईमेल और मोबाइल नंबर बदलें।' : 'Update your registered SaveLedger name, email, and phone number easily.'}
                            </p>
                          </div>
                        </div>

                        {/* Success & Error Alert Messages */}
                        {profileSuccessMsg && (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs py-2.5 px-4 rounded-xl font-bold animate-fade-in flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{profileSuccessMsg}</span>
                          </div>
                        )}
                        {profileErrorMsg && (
                          <div className="bg-rose-50 text-rose-800 border border-rose-200 text-xs py-2.5 px-4 rounded-xl font-bold animate-fade-in flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{profileErrorMsg}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
                          {/* Full Name */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>{language === 'urdu' ? 'صارف کا نام' : language === 'hindi' ? 'उपयोगकर्ता का नाम' : 'Full Name'}</span>
                            </label>
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              placeholder="Full Name"
                              className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                              required
                            />
                          </div>

                          {/* Email Address */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>{language === 'urdu' ? 'ای میل ایڈریس (Gmail)' : language === 'hindi' ? 'जीमेल / ईमेल पता' : 'Gmail / Email Address'}</span>
                            </label>
                            <input
                              type="email"
                              value={profileEmail}
                              onChange={(e) => setProfileEmail(e.target.value)}
                              placeholder="name@gmail.com"
                              className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono shadow-2xs"
                              required
                            />
                          </div>

                          {/* Phone / WhatsApp */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>{language === 'urdu' ? 'موبائل نمبر / واٹس ایپ' : language === 'hindi' ? 'मोबाइल नंबर / व्हाट्सएप' : 'Phone Number / WhatsApp'}</span>
                            </label>
                            <input
                              type="text"
                              value={profileMobile}
                              onChange={(e) => setProfileMobile(e.target.value)}
                              placeholder="+92 300 1234567"
                              className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono shadow-2xs"
                            />
                          </div>

                          {/* New Password */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>{language === 'urdu' ? 'نیا پاس ورڈ (اختیاری)' : language === 'hindi' ? 'नया पासवर्ड (वैकल्पिक)' : 'New Password (Optional)'}</span>
                            </label>
                            <input
                              type="password"
                              value={profilePassword}
                              onChange={(e) => setProfilePassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono shadow-2xs"
                              minLength={6}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                          <p className="text-[11px] text-slate-500">
                            {language === 'urdu' ? 'تبدیلیاں فوراً آپ کے پروفائل پر محفوظ ہو جائیں گی۔' : language === 'hindi' ? 'बदलाव तुरंत आपके प्रोफ़ाइल पर सहेजे जाएंगे।' : 'Details can be updated easily and saved to your profile immediately.'}
                          </p>
                          <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm py-2.5 px-6 rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                          >
                            {isSavingProfile ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>{language === 'urdu' ? 'محفوظ ہو رہا ہے...' : language === 'hindi' ? 'सहेजा जा रहा है...' : 'Saving Profile...'}</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>{language === 'urdu' ? 'تبدیلیاں محفوظ کریں' : language === 'hindi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile Changes'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      {/* Official Live Privacy & Data Protection Policy Card (Full Width) */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:shadow-md transition-all md:col-span-2">
                        <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                            <Shield className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-800">
                              {language === 'urdu' ? 'آفیشل معلومات رازداری اور ڈیٹا پالیسی' : language === 'hindi' ? 'आधिकारिक डेटा गोपनीयता और नीति' : 'Official Live Privacy & Data Protection Policy'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {language === 'urdu' ? 
                                'ٹرسٹ بک کی آفیشل لائیو ڈیٹا پالیسی کے مطابق آپ کے کسٹمر کھاتے، بلوں کا حساب، ادھار ریکارڈ اور شادی بیاہ سلامی ڈائری مکمل طور پر محفوظ کلاؤڈ ڈیٹا بیس میں رکھے جاتے ہیں۔' : 
                                language === 'hindi' ? 
                                'ट्रस्ट बुक की आधिकारिक लाइव नीति आपके सभी ग्राहक खातों, ऋण बहीखाता विवरण और समारोह सलामी उपहारों को पूर्ण गोपनीयता के साथ गूगल क्लाउड पर सुरक्षित रखती है।' : 
                                'Under our official Live Data Policy, all customer sheet ledgers, financial loans, transaction memos, and ceremonial wedding Salami/Pahaji gift registers are locked in a privately encrypted Cloud Database.'}
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] sm:text-xs text-slate-600 space-y-2.5 bg-slate-50/80 border border-slate-100 rounded-xl p-4 leading-relaxed">
                          <div className="flex items-start gap-2">
                            <p>
                              <strong className="text-slate-800 font-bold">{language === 'urdu' ? 'گوگل کلاؤڈ سیکیور سنک:' : language === 'hindi' ? 'गूगल क्लाउड सिंक:' : 'Google Cloud Sync:'}</strong>{' '}
                              {language === 'urdu' ? 
                                'ٹرسٹ بک ڈیٹا کلاؤڈ فائر بیس کے ذریعے اینڈ ٹو اینڈ الیکٹرانک انکرپشن کے ساتھ سنک ہوتا ہے، جس سے آپ کسی بھی دوسرے موبائل پر لاگ ان کر کے اپنا ریکارڈ بازیافت کر سکتے ہیں۔' : 
                                language === 'hindi' ? 
                                'गूगल क्लाउड फायरबेस की डेटाबेस सुरक्षा के साथ आपका लेखा और बहीखाता विवरण सदैव आपके खातों में बैकअप रहता है।' : 
                                'Data is routed via secure SSL/TLS channels into high-performance military-grade Cloud Firestore database servers with multi-device live synchronization.'}
                            </p>
                          </div>
                          
                          <div className="flex items-start gap-2 border-t border-slate-200/60 pt-2">
                            <p>
                              <strong className="text-slate-800 font-bold">{language === 'urdu' ? 'نام کی رازداری اور سیکیورٹی:' : language === 'hindi' ? 'गोपनीय बही विवरण:' : 'Complete Confidentiality:'}</strong>{' '}
                              {language === 'urdu' ? 
                                'آپ کے کسٹمرز کے موبائل نمبر، ادھار رقم اور پرسنل میموز بالکل خفیہ ہیں۔ ہم آپ کی اجازت کے بغیر کبھی کوئی تفصیل کسی تیسرے فریق کو شیئر یا فروخت نہیں کرتے۔' : 
                                language === 'hindi' ? 
                                'आपकी ऋण राशि, मित्रों के डेटा, और संपर्क नंबर हमेशा अत्यंत गोपनीय रहेंगे। इसे तीसरे पक्षों के साथ कभी साझा नहीं किया जाता है।' : 
                                'Zero third-party sharing. Your list of customer contacts, loan balances, personal reminder notes, or amounts are never rented, sold, or shared with advertising networks.'}
                            </p>
                          </div>

                          <div className="flex items-start gap-2 border-t border-slate-200/60 pt-2">
                            <p>
                              <strong className="text-slate-800 font-bold">{language === 'urdu' ? 'اکاؤنٹ مستقل حذف کرنے کا اختیار:' : language === 'hindi' ? 'खाता हटाने का अधिकार:' : 'Right to be Forgotten:'}</strong>{' '}
                              {language === 'urdu' ? 
                                'بک مالکان کو اپنے ریکارڈ پر مکمل اختیار حاصل ہے۔ آپ کسی بھی وقت "بک ڈیلیٹ" بٹن دبا کر اپنا ڈیٹا مکمل طور پر انٹرنیٹ اور کلاؤڈ سرور سے ہمیشہ کے لیے مٹا سکتے ہیں۔' : 
                                language === 'hindi' ? 
                                'आप जब चाहें अपनी सेटिंग्स पैनल में "खतरनाक क्षेत्र" पर जाकर अपना संपूर्ण वित्तीय डेटाबेस और खाता क्लाउड सर्वर से हमेशा के लिए नष्ट कर सकते हैं।' : 
                                'Full GDPR Sovereign Rights. Users retain full data sovereignty; you can irreparably purge your entire database schema and credentials from our cloud servers instantly.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Secure Ledger Backup Data Card (Left Column) */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3.5 pb-2 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-slate-800">
                                {language === 'urdu' ? 'ڈیٹا بیک اپ (Export/Import)' : language === 'hindi' ? 'बहीखाता बैकअप (Export/Import)' : 'Secure Ledger Backup Data'}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {language === 'urdu' ? 'اپنا تمام ڈیٹا ایک محفوظ بیک اپ فائل کے طور پر ڈاؤن لوڈ کریں یا پہلے سے محفوظ شدہ فائل اپلوڈ کریں۔' : language === 'hindi' ? 'अपना सारा डेटा एक सुरक्षित बैकअप फ़ाइल के रूप में डाउनलोड करें या पहले से सहेजी गई फ़ाइल आयात करें।' : 'Export your balance logs, shagan register entries, accounts and restore them anytime.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleExportBackup}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>{language === 'urdu' ? 'بیک اپ ڈاؤن لوڈ کریں' : language === 'hindi' ? 'बैकअप डाउनलोड करें' : 'Download Backup'}</span>
                          </button>

                          <label className="flex-1 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span>{language === 'urdu' ? 'فائل امپورٹ کریں' : language === 'hindi' ? 'फ़ाइल आयात करें' : 'Import Backup'}</span>
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImportBackup}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Security & Password Reset Card (Right Column) */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3.5 pb-2 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-slate-800">
                                {language === 'urdu' ? 'پاس ورڈ تبدیل کریں' : language === 'hindi' ? 'पासवर्ड बदलें' : 'Security & Password Reset'}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {language === 'urdu' ? 'اپنا پاس ورڈ تبدیل کرنے کے لیے اپنے ای میل ایڈریس پر پاس ورڈ ری سیٹ کا محفوظ لنک حاصل کریں۔' : language === 'hindi' ? 'अपना पासवर्ड बदलने के लिए अपने पंजीकृत ईमेल पर सुरक्षा लिंक भेजें।' : 'Send a secure authentication link to your registered email to reset your account password.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          {currentUser?.id === 'u1' ? (
                            <p className="text-xs text-amber-600 italic">
                              {language === 'urdu' ? 'ڈیمو سائن ان اکاؤنٹ کے لیے پاس ورڈ ری سیٹ دستیاب نہیں ہے۔' : language === 'hindi' ? 'डेमो साइन-इन के लिए पासवर्ड रीसेट उपलब्ध नहीं है।' : 'Password reset is disabled for Sandbox Demo access.'}
                            </p>
                          ) : currentUser?.email ? (
                            <button
                              type="button"
                              onClick={handlePasswordResetRequest}
                              className="w-full bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>{language === 'urdu' ? 'ری سیٹ لنک ای میل کریں' : language === 'hindi' ? 'रीसेट लिंक भेजें' : 'Send Reset Link Email'}</span>
                            </button>
                          ) : (
                            <p className="text-xs text-amber-600 italic">
                              {language === 'urdu' ? 'یہ آپشن موبائل نمبر والے صارفین پر لاگو نہیں ہوتا۔' : language === 'hindi' ? 'यह विकल्प मोबाइल संख्या लॉग इन धारकों पर लागू नहीं होता है।' : 'Password reset is not applicable for mobile/phone number logins.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone Card */}
                    <div className="bg-rose-50/40 border border-rose-200 rounded-2xl p-5 sm:p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-rose-900">
                            {language === 'urdu' ? 'خطرناک زون - اکاؤنٹ حذف کریں' : language === 'hindi' ? 'खतरे का क्षेत्र - खाता हटाएं' : 'Danger Zone: Erase Account'}
                          </h3>
                          <p className="text-[11px] text-rose-700/80 mt-1">
                            {language === 'urdu' ? 'اس اکاؤنٹ اور تمام منسلک قرض ریکارڈز، سلامی رجسٹرز اور لاگز کو مستقل طور پر مٹا دیں۔ یہ عمل ناقابل واپسی ہے۔' : language === 'hindi' ? 'इस खाते और सभी संबंधित बहीखाता रिकॉर्ड, सलामी रजिस्टर और इतिहास को हमेशा के लिए मिटा दें। यह प्रक्रिया अपरिवर्तनीय है।' : 'Irrevocably wipe your profile, lenders books, wedding registries and all data. This is completely permanent.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleEraseAccount}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-2xs hover:shadow-xs flex items-center gap-2 transition-all"
                        >
                          <UserMinus className="w-4 h-4" />
                          <span>{language === 'urdu' ? 'اکاؤنٹ اور تمام کھاتہ مٹائیں' : language === 'hindi' ? 'खाता और बहीखाता साफ़ करें' : 'Delete Account & Erase All Records'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : showRecycleBin ? (
                  /* Recycle Bin / Deleted Items Panel */
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-8 space-y-8 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowRecycleBin(false)}
                        className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center shrink-0"
                        title={language === 'urdu' ? 'واپس جائیں' : language === 'hindi' ? 'वापस जाएं' : 'Go Back'}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <Trash2 className="w-5.5 h-5.5 text-slate-600" />
                          <span>{language === 'urdu' ? 'حذف شدہ اشیاء / کچرا دان' : language === 'hindi' ? 'हटाए गए आइटम / रीसायकल बिन' : 'Recycle Bin / Deleted Items'}</span>
                        </h2>
                        <p className="text-slate-500 text-xs mt-0.5 sm:mt-1">
                          {language === 'urdu' ? 'غلطی سے حذف کیے گئے لیجرز یا شادی بیاہ کے ریکارڈ یہاں سے دوبارہ بحال کریں' : language === 'hindi' ? 'गलती से हटाए गए बहीखाते या समारोह रिकॉर्ड यहां से वापस प्राप्त करें' : 'Mistakenly deleted custom ledgers or ceremonial diaries can be fully recovered with logs intact.'}
                        </p>
                      </div>
                    </div>

                    {deletedLedgers.length === 0 && deletedEvents.length === 0 ? (
                      /* Empty state styled beautifully */
                      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-12 px-4 text-center space-y-3">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                          <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-800">
                          {language === 'urdu' ? 'کوئی حذف شدہ ریکارڈ نہیں ملا' : language === 'hindi' ? 'कोई हटाए गए आइटम नहीं मिले' : 'No Deleted Items Found'}
                        </h3>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto p-0.5">
                          {language === 'urdu' ? 'آپ کا تمام کھاتہ محفوظ ہے۔ حذف کی گئی چیزیں عارضی طور پر یہاں دکھائی دیں گی۔' : language === 'hindi' ? 'आपका बहीखाता बिल्कुल सुरक्षित है। हटाए गए विलेख अस्थायी रूप से यहाँ सुरक्षित रहेंगे।' : 'Your digital diaries to credit logs are fully intact. Items you delete will show up here temporarily for restoration.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Deleted Ledgers Header & Grid */}
                        {deletedLedgers.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                              {language === 'urdu' ? 'حذف شدہ کسٹمر بائی کھاتہ' : language === 'hindi' ? 'हटाए गए बहीखाता लेजर' : 'Deleted Custom Ledgers'} ({deletedLedgers.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {deletedLedgers.map((dl) => (
                                <div key={dl.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-2xs transition-shadow">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                      <h4 className="text-sm font-extrabold text-slate-800 truncate">{translatePresetName(dl.ledger.name, language)}</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                                      {dl.ledger.description || (language === 'urdu' ? 'کوئی تفصیل موجود نہیں' : language === 'hindi' ? 'कोई विवरण नहीं' : 'No description provided')}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                                      <span className="bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                                        📄 {dl.associatedTransactions.length} {language === 'urdu' ? 'کھاتہ اندراجات' : language === 'hindi' ? 'लेनदेन' : dl.associatedTransactions.length === 1 ? 'Entry' : 'Entries'}
                                      </span>
                                      <span className="bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                                        ❌ {new Date(dl.deletedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                                    <button
                                      onClick={() => handleRestoreLedger(dl.id)}
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-3xs hover:shadow-2xs transition-all"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>{language === 'urdu' ? 'بحال کریں' : language === 'hindi' ? 'रीस्टोर करें' : 'Restore'}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const title = language === 'urdu' ? 'کھاتہ ہمیشہ کے لیے حذف کریں' : language === 'hindi' ? 'लेजर हमेशा के लिए हटाएं' : 'Purge Ledger Book';
                                        const msg = language === 'urdu' ? 'کیا آپ ہمیشہ کے لئے ڈیلیٹ کرنا چاہتے ہیں؟ یہ عمل ناقابل واپسی ہے۔' : language === 'hindi' ? 'क्या आप इस लेजर को हमेशा के लिए मिटाना चाहते हैं? यह प्रक्रिया अपरिवर्तनीय है।' : 'Permanently purge this ledger? All inside records will be lost forever.';
                                        triggerConfirm(title, msg, () => handlePermanentDeleteLedger(dl.id));
                                      }}
                                      className="border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-extrabold text-[11px] py-1.5 px-2.5 rounded-lg flex items-center justify-center transition-colors"
                                      title="Purge Permanently"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Deleted Events list */}
                        {deletedEvents.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                              {language === 'urdu' ? 'حذف شدہ تقاریب اور ڈائریاں' : language === 'hindi' ? 'हटाए गए समारोह एवं डायरी' : 'Deleted Ceremonial Diaries'} ({deletedEvents.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {deletedEvents.map((de) => (
                                <div key={de.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-2xs transition-shadow">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs">🎁</span>
                                      <h4 className="text-sm font-extrabold text-slate-800 truncate">{translatePresetName(de.event.name, language)}</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 italic">
                                      {de.event.type} • {language === 'urdu' ? 'بجٹ' : language === 'hindi' ? 'बजट' : 'Budget'}: {de.event.plannedBudget.toLocaleString()}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                                      <span className="bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                                        💖 {de.associatedEventItems.length} {language === 'urdu' ? 'سلامی / اخراجات' : language === 'hindi' ? 'सलामी / खर्च' : 'Salami/Exp Entries'}
                                      </span>
                                      <span className="bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                                        ❌ {new Date(de.deletedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                                    <button
                                      onClick={() => handleRestoreEvent(de.id)}
                                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-3xs hover:shadow-2xs transition-all"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>{language === 'urdu' ? 'بحال کریں' : language === 'hindi' ? 'रीस्टोर करें' : 'Restore'}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const title = language === 'urdu' ? 'تقریب ہمیشہ کے لیے حذف کریں' : language === 'hindi' ? 'समारोह हमेशा के लिए हटाएं' : 'Purge Event Diary';
                                        const msg = language === 'urdu' ? 'کیا آپ اسے ہمیشہ کے لئے مٹانا چاہتے ہیں؟' : language === 'hindi' ? 'क्या आप इस इवेंट को हमेशा के लिए मिटाना चाहते हैं?' : 'Permanently purge this event diary? All guest books and logs will be lost forever.';
                                        triggerConfirm(title, msg, () => handlePermanentDeleteEvent(de.id));
                                      }}
                                      className="border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-extrabold text-[11px] py-1.5 px-2.5 rounded-lg flex items-center justify-center transition-colors"
                                      title="Purge Permanently"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : showExpenseTracker ? (
                  /* Expense Tracker Panel */
                  <ExpenseTracker
                    user={currentUser!}
                    expenseBooks={expenseBooks}
                    expenses={expenses}
                    onAddBook={handleAddExpenseBook}
                    onUpdateBook={handleUpdateExpenseBook}
                    onDeleteBook={handleDeleteExpenseBook}
                    onAddExpense={handleAddExpense}
                    onUpdateExpense={handleUpdateExpense}
                    onDeleteExpense={handleDeleteExpense}
                    language={language}
                    triggerConfirm={triggerConfirm}
                  />
                ) : (
                  /* Primary Default Home View (📒 Loans, 🎁 Events, ➕ Add Ledger) */
                  <Dashboard
                    user={currentUser}
                    ledgers={ledgers}
                    transactions={transactions}
                    events={events}
                    eventItems={eventItems}
                    onSelectLedger={(ledger) => {
                      setSelectedEvent(null);
                      setSelectedLedger(ledger);
                    }}
                    onSelectEvent={(event) => {
                      setSelectedLedger(null);
                      setSelectedEvent(event);
                    }}
                    onAddLedger={handleAddLedger}
                    onAddEvent={handleAddEvent}
                    onDeleteLedger={handleDeleteLedger}
                    onDeleteEvent={handleDeleteEvent}
                    onDeleteAllData={handleDeleteAllData}
                    onOpenRecycleBin={() => {
                      setSelectedLedger(null);
                      setSelectedEvent(null);
                      setShowSettings(false);
                      setShowRecycleBin(true);
                      setShowExpenseTracker(false);
                    }}
                    deletedCount={deletedLedgers.length + deletedEvents.length}
                    onLogOut={handleLogOut}
                    language={language}
                    triggerConfirm={triggerConfirm}
                  />
                )}
              </div>

              {/* Bottom footer badge */}
              <footer className="mt-16 text-center max-w-md mx-auto space-y-1.5 text-[11px] text-slate-400 font-light select-none pb-8 flex flex-col items-center justify-center">
                <p className="flex items-center justify-center gap-1">
                  <span>{texts.footerEncryptionNote}</span>
                </p>
                <p>
                  {texts.footerCopyrightNote}
                </p>
                <div className="pt-1.5">
                  <p className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-800 font-black px-3 py-1 rounded-full border border-emerald-100 shadow-3xs select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{language === 'urdu' ? 'آخری سنک: ابھی ہوا ✓' : language === 'hindi' ? 'अंतिम सिंक: अभी हुआ ✓' : 'Last Synced: Just Now ✓'}</span>
                  </p>
                </div>
              </footer>
            </div>
          </main>
        </>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 animate-fade-in"
          onClick={() => setConfirmDialog(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setConfirmDialog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4">
              <div className="bg-rose-50 border border-rose-100 rounded-full p-2.5 h-fit text-rose-600 select-none shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 text-left">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight text-left">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed text-left">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl transition-all font-semibold text-xs border border-slate-200 hover:border-slate-300 shadow-3xs cursor-pointer select-none"
              >
                {language === 'urdu' ? 'منسوخ کریں' : language === 'hindi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  try {
                    confirmDialog.onConfirm();
                  } catch (err) {
                    console.error(err);
                  }
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all font-bold text-xs shadow-xs hover:shadow-sm cursor-pointer select-none"
              >
                {language === 'urdu' ? 'حذف کریں' : language === 'hindi' ? 'हटाएं' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
