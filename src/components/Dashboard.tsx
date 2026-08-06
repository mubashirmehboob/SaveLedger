import React, { useState } from 'react';
import { Ledger, Transaction, EventEntity, EventItem, UserAccount } from '../types';
import { translations, translatePresetName, translatePresetDesc } from '../utils/translations';
import { 
  BookOpen, Plus, Sparkles, TrendingUp, TrendingDown, Clock, Search, 
  Trash2, ChevronRight, FileSpreadsheet, Gift, Landmark, Calendar,
  AlertCircle, HelpCircle, ArrowRightLeft, User, Phone, LogOut, CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  user: UserAccount;
  ledgers: Ledger[];
  transactions: Transaction[];
  events: EventEntity[];
  eventItems: EventItem[];
  onSelectLedger: (ledger: Ledger) => void;
  onSelectEvent: (event: EventEntity) => void;
  onAddLedger: (name: string, description: string) => Promise<void> | void;
  onAddEvent: (event: Omit<EventEntity, 'id' | 'userId'>) => Promise<void> | void;
  onDeleteLedger: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onDeleteAllData?: () => Promise<void> | void;
  onOpenRecycleBin?: () => void;
  deletedCount?: number;
  onLogOut: () => void;
  language?: 'english' | 'urdu' | 'hindi';
  triggerConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}

const getLedgerIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('personal')) return '👥';
  if (n.includes('friend')) return '🤝';
  if (n.includes('family')) return '🏠';
  if (n.includes('office')) return '🏢';
  if (n.includes('business')) return '💼';
  if (n.includes('house') || n.includes('construction') || n.includes('build')) return '🏗️';
  if (n.includes('plot')) return '🗺️';
  if (n.includes('wedding')) return '💍';
  if (n.includes('ngo') || n.includes('charity')) return '🤲';
  if (n.includes('customer') || n.includes('karyana') || n.includes('shop') || n.includes('store')) return '🛒';
  if (n.includes('supplier')) return '📦';
  if (n.includes('rent') || n.includes('lease') || n.includes('property')) return '🔑';
  return '📒';
};

export default function Dashboard({
  user,
  ledgers,
  transactions,
  events,
  eventItems,
  onSelectLedger,
  onSelectEvent,
  onAddLedger,
  onAddEvent,
  onDeleteLedger,
  onDeleteEvent,
  onDeleteAllData,
  onOpenRecycleBin,
  deletedCount = 0,
  onLogOut,
  language = 'english',
  triggerConfirm
}: DashboardProps) {
  const texts = translations[language];

  const handleDeleteAll = () => {
    const title = language === 'urdu' ? 'تمام ڈیٹا ڈیلیٹ کریں' : language === 'hindi' ? 'सभी डेटा मिटाएं' : 'Delete All Data';
    const msg = language === 'urdu'
      ? 'کیا آپ واقعی تمام ریکارڈز (کھاتے اور ڈائریاں) مٹانا چاہتے ہیں؟ تمام ڈیٹا ری سائیکل بن میں منتقل ہو جائے گا۔'
      : language === 'hindi'
      ? 'क्या आप वाकई सभी रिकॉर्ड (बहीखाते और डायरियां) हटाना चाहते हैं?'
      : 'Are you sure you want to delete all ledgers and event diaries? All items will be moved to recycle bin.';

    const performDelete = async () => {
      if (onDeleteAllData) {
        await onDeleteAllData();
      } else {
        const ledgerIds = ledgers.map(l => l.id);
        for (const id of ledgerIds) {
          onDeleteLedger(id);
        }
        const eventIds = events.map(e => e.id);
        for (const id of eventIds) {
          onDeleteEvent(id);
        }
      }
    };

    if (triggerConfirm) {
      triggerConfirm(title, msg, performDelete);
    } else {
      if (window.confirm(msg)) {
        performDelete();
      }
    }
  };
  const [activeTab, setActiveTab] = useState<'loans' | 'events'>('loans');
  const [showAddLedgerModal, setShowAddLedgerModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // New Ledger Form State
  const [newLedgerName, setNewLedgerName] = useState('');
  const [newLedgerDesc, setNewLedgerDesc] = useState('');
  const [presetLedgerName, setPresetLedgerName] = useState('');

  // New Event Form State
  const [newEventName, setNewEventName] = useState('');
  const [newEventType, setNewEventType] = useState('Wedding');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventBudget, setNewEventBudget] = useState('50000');
  const [newEventNotes, setNewEventNotes] = useState('');

  // Form saving and error states
  const [isSavingLedger, setIsSavingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState('');
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [eventError, setEventError] = useState('');

  // Quick preset options asked by user:
  const PRESET_LEDGERS = [
    'Personal', 'Friends', 'Family', 'Office', 'Business', 'House Construction', 
    'Plot', 'Wedding', 'NGO', 'Charity', 'Customers', 'Suppliers', 'Rental Property'
  ];

  const EVENT_TYPES = [
    'Wedding', 'Engagement', 'Birthday', 'Housewarming', 'Aqeeqah', 'Funeral', 
    'Eid', 'Baby Shower', 'Shop Opening', 'Religious Event', 'Construction Project'
  ];

  // Calculations for Loans tab summary
  const getLedgerStats = (ledgerId: string) => {
    const ledgerTx = transactions.filter(t => t.ledgerId === ledgerId);
    const given = ledgerTx.filter(t => t.nature === 'given').reduce((sum, t) => sum + t.amount, 0);
    const received = ledgerTx.filter(t => t.nature === 'received').reduce((sum, t) => sum + t.amount, 0);
    return { given, received, balance: given - received };
  };

  const [searchQuery, setSearchQuery] = useState('');

  const activeLedgerIds = new Set(ledgers.map(l => l.id));
  const activeTransactions = transactions.filter(t => activeLedgerIds.has(t.ledgerId));

  // Overall totals across ALL ledgers (Total Receivable vs. Total Payable)
  const totalReceivedAcrossAll = activeTransactions.filter(t => t.nature === 'received').reduce((sum, t) => sum + t.amount, 0); // borrowed / in
  const totalGivenAcrossAll = activeTransactions.filter(t => t.nature === 'given').reduce((sum, t) => sum + t.amount, 0); // lent / out

  // Quick stats row metrics
  const uniquePeopleCount = new Set(activeTransactions.map(t => t.personName.trim().toLowerCase())).size;
  const ledgerBalancesList = ledgers.map(l => getLedgerStats(l.id));
  const totalCollectable = ledgerBalancesList.filter(b => b.balance > 0).reduce((sum, b) => sum + b.balance, 0);
  const totalPayable = ledgerBalancesList.filter(b => b.balance < 0).reduce((sum, b) => sum + Math.abs(b.balance), 0);

  // Calculations for Events tab summary
  const getEventStats = (eventId: string) => {
    const items = eventItems.filter(e => e.eventId === eventId);
    const giftsReceived = items.filter(e => e.type === 'gift').reduce((sum, e) => sum + e.amount, 0);
    const actualExpense = items.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    return { giftsReceived, actualExpense };
  };

  // Overall totals across ALL active events (Budget, Salami, Expenses)
  const activeEventIds = new Set(events.map(e => e.id));
  const activeEventItems = eventItems.filter(e => activeEventIds.has(e.eventId));

  const totalBudgetAcrossAll = events.reduce((sum, e) => sum + e.plannedBudget, 0);
  const totalGiftsAcrossAll = activeEventItems.filter(e => e.type === 'gift').reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesAcrossAll = activeEventItems.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const remainingBudgetAcrossAll = totalBudgetAcrossAll - totalExpensesAcrossAll;

  const handleAddLedgerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = presetLedgerName || newLedgerName;
    if (!finalName.trim()) return;

    setIsSavingLedger(true);
    setLedgerError('');

    try {
      await onAddLedger(finalName, newLedgerDesc);
      // Reset only on success
      setNewLedgerName('');
      setPresetLedgerName('');
      setNewLedgerDesc('');
      setShowAddLedgerModal(false);
    } catch (err: any) {
      console.error("Failed to add ledger:", err);
      setLedgerError(err.message || "Failed to create ledger. Please check your network and try again.");
    } finally {
      setIsSavingLedger(false);
    }
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;

    setIsSavingEvent(true);
    setEventError('');

    try {
      await onAddEvent({
        name: newEventName,
        type: newEventType,
        date: newEventDate || new Date().toISOString().split('T')[0],
        plannedBudget: Number(newEventBudget) || 0,
        notes: newEventNotes
      });
      // Reset only on success
      setNewEventName('');
      setNewEventType('Wedding');
      setNewEventDate('');
      setNewEventBudget('50000');
      setNewEventNotes('');
      setShowAddEventModal(false);
    } catch (err: any) {
      console.error("Failed to add event:", err);
      setEventError(err.message || "Failed to schedule event. Please check your network and try again.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-container">
      
      {/* User Header */}
      <div className="bg-linear-to-r from-emerald-500/8 via-emerald-500/4 to-teal-500/3 rounded-2xl p-6 border border-emerald-500/15 flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 font-bold text-white flex items-center justify-center text-xl mx-auto sm:mx-0 shadow-sm">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h2 className="text-xl font-bold text-slate-800 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 leading-tight">
              <span>{user.name}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 font-mono flex items-center justify-center sm:justify-start gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{user.mobile || user.email}</span>
            </p>
          </div>
        </div>


      </div>

      {/* Main Tab Controller (Only My Ledgers and Events inside card body) */}
      <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden" id="dashboard-total-card">

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{texts.aggregatesBannerTitle}</span>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-emerald-50 text-[#029664] rounded-xl border border-emerald-100 flex items-center justify-center shadow-3xs" id="dashboard-tab-icon">
                  {activeTab === 'loans' ? <BookOpen className="w-5 h-5 stroke-[2.5]" /> : <Gift className="w-5 h-5 stroke-[2.5]" />}
                </span>
                <span>{activeTab === 'loans' ? texts.loansCustomLedgersTab : texts.eventsPahajiDiariesTab}</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'loans' 
                ? (language === 'urdu' ? 'اپنی کھاتہ کتب اور بقایا جات کا جائزہ لیں' : language === 'hindi' ? 'अपनी बही का त्वरित विवरण देखें' : 'Compact summary profile for your books') 
                : texts.aggregatesBannerSummaryEvents}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Quick action buttons */}
            {activeTab === 'loans' ? (
              <button
                onClick={() => setShowAddLedgerModal(true)}
                className="w-full md:w-auto px-4 py-2.5 bg-[#029664] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs tracking-tight shadow-sm flex items-center justify-center gap-1.5 transition-all outline-hidden cursor-pointer"
                id="add-ledger-trigger"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{texts.addLedgerBookBtn}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddEventModal(true)}
                className="w-full md:w-auto px-4 py-2.5 bg-[#029664] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs tracking-tight shadow-sm flex items-center justify-center gap-1.5 transition-all outline-hidden cursor-pointer"
                id="add-event-trigger"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{texts.createNewEventBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row for power users */}
      {activeTab === 'loans' ? (
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-2 bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs text-slate-500 font-bold select-none shadow-3xs animate-fade-in">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-black">●</span>
            <span>{ledgers.length} {language === 'urdu' ? 'سرگرم کتب' : language === 'hindi' ? 'सक्रिय बही' : 'Active Books'}</span>
          </div>
          <span className="hidden sm:inline text-slate-200">|</span>
          <div>
            <span>{uniquePeopleCount} {language === 'urdu' ? 'کل افراد' : language === 'hindi' ? 'कुल संपर्क' : 'Total People'}</span>
          </div>
          <span className="hidden sm:inline text-slate-200">|</span>
          <div className="text-emerald-700">
            <span>{language === 'urdu' ? 'کل قابلِ وصول:' : language === 'hindi' ? 'कुल प्राप्तियाँ:' : 'To Collect:'} <strong className="font-extrabold text-emerald-800">Rs. {totalCollectable.toLocaleString()}</strong></span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-2 bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3 text-xs text-slate-500 font-bold select-none shadow-3xs animate-fade-in">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-black">●</span>
            <span>{language === 'urdu' ? 'کل تقاریب:' : language === 'hindi' ? 'कुल कार्यक्रम:' : 'Total Events:'} <strong className="font-extrabold text-slate-800">{events.length}</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-200">|</span>
          <div>
            <span>{language === 'urdu' ? 'آنے والی تقریبات:' : language === 'hindi' ? 'आगामी कार्यक्रम:' : 'Upcoming Events:'} <strong className="font-extrabold text-slate-800">{events.filter(e => new Date(e.date) >= new Date()).length}</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-200">|</span>
          <div className="text-emerald-700">
            <span>{language === 'urdu' ? 'کل موصولہ رقم:' : language === 'hindi' ? 'कुल प्राप्तियां:' : 'Total Contributions:'} <strong className="font-extrabold text-emerald-800">Rs. {totalGiftsAcrossAll.toLocaleString()}</strong></span>
          </div>
        </div>
      )}

      {/* Nav Switch (Simple UI buttons explicitly for Loans and Events) */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full" id="ledger-event-selector">
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'loans' 
              ? 'bg-white text-emerald-950 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
          id="tab-loans-ledger"
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>{texts.loansCustomLedgersTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'events' 
              ? 'bg-white text-emerald-950 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
          id="tab-events-ledger"
        >
          <Gift className="w-4 h-4 text-emerald-600" />
          <span>{texts.eventsPahajiDiariesTab}</span>
        </button>
      </div>

      {/* Dynamic Tab Panel */}
      {activeTab === 'loans' ? (
        <div className="space-y-4">
          {/* Elegant Search and Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-3xs">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <span>📂</span>
                <span>{texts.customLedgerListTitle} ({
                  ledgers.filter(ledger => {
                    const nameTranslated = translatePresetName(ledger.name, language).toLowerCase();
                    const descTranslated = translatePresetDesc(ledger.description || '', language).toLowerCase();
                    return nameTranslated.includes(searchQuery.toLowerCase()) || descTranslated.includes(searchQuery.toLowerCase());
                  }).length
                })</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{texts.customLedgerListSubtitle}</p>
            </div>

            {/* Premium Interactive Search Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 sm:justify-end">
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={language === 'urdu' ? 'کھاتہ تلاش کریں...' : language === 'hindi' ? 'बहीखाता खोजें...' : 'Search ledger books...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden text-xs text-slate-800 font-bold shadow-3xs transition-all"
                  id="ledger-search-input"
                />
              </div>

              <button
                onClick={() => setShowAddLedgerModal(true)}
                className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{texts.newLedgerBtn}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ledgers.filter(ledger => {
              const nameTranslated = translatePresetName(ledger.name, language).toLowerCase();
              const descTranslated = translatePresetDesc(ledger.description || '', language).toLowerCase();
              return nameTranslated.includes(searchQuery.toLowerCase()) || descTranslated.includes(searchQuery.toLowerCase());
            }).map(ledger => {
              const { given, received, balance } = getLedgerStats(ledger.id);
              const ledgerIcon = getLedgerIcon(ledger.name);
              return (
                <div 
                  key={ledger.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#029664]/50 hover:shadow-xs transition-all flex flex-col overflow-hidden group cursor-pointer relative"
                  onClick={() => onSelectLedger(ledger)}
                  id={`ledger-card-${ledger.id}`}
                >
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl group-hover:bg-emerald-50 transition-colors shadow-3xs select-none" role="img">
                          {ledgerIcon}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-base leading-tight group-hover:text-[#029664] transition-colors">
                            {translatePresetName(ledger.name, language)}
                          </h4>
                          {ledger.description ? (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{translatePresetDesc(ledger.description, language)}</p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic mt-0.5">{language === 'urdu' ? 'کوئی تفصیل درج نہیں ہے' : language === 'hindi' ? 'कोई विवरण नहीं है' : 'No description provided'}</p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const title = language === 'urdu' ? 'کھاتہ بک حذف کریں' : language === 'hindi' ? 'बहीखाता हटाएं' : 'Delete Ledger Book';
                          const msg = language === 'urdu' 
                            ? `کیا آپ واقعی "${ledger.name}" اور اس کے تمام اندراجات حذف کرنا چاہتے ہیں؟` 
                            : language === 'hindi' 
                              ? `क्या आप वाकई "${ledger.name}" और उसके सभी रिकॉर्ड्स हटाना चाहते हैं?` 
                              : `Do you really want to delete "${ledger.name}" and all of its associated entries?`;
                          if (triggerConfirm) {
                            triggerConfirm(title, msg, () => onDeleteLedger(ledger.id));
                          } else {
                            if (confirm(msg)) {
                              onDeleteLedger(ledger.id);
                            }
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 hover:border-rose-600 cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
                        title={language === 'urdu' ? 'حذف کریں' : language === 'hindi' ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Highly Visual Standing Card Info visible first */}
                    <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-3 gap-2 text-center group-hover:bg-emerald-50/10 transition-colors">
                      {/* Left: Collect / Pay / Settled */}
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100 shadow-3xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          {balance > 0 
                            ? (language === 'urdu' ? 'وصول کرنا' : language === 'hindi' ? 'वसूलना' : 'Collect')
                            : balance < 0 
                              ? (language === 'urdu' ? 'دینا ہے' : language === 'hindi' ? 'चुकाना' : 'Pay')
                              : (language === 'urdu' ? 'برابر حساب' : language === 'hindi' ? 'हिसाब बराबर' : 'Settled')
                          }
                        </span>
                        <span className={`text-[12px] sm:text-xs font-black block ${
                          balance > 0 
                            ? 'text-emerald-600' 
                            : balance < 0 
                              ? 'text-rose-600' 
                              : 'text-slate-500'
                        }`}>
                          {balance !== 0 ? `Rs. ${Math.abs(balance).toLocaleString()}` : 'Rs. 0'}
                        </span>
                      </div>

                      {/* Middle: Given */}
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100 shadow-3xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          {language === 'urdu' ? 'دیا' : language === 'hindi' ? 'दिया' : 'Given'}
                        </span>
                        <span className="text-[12px] sm:text-xs font-black text-slate-700 block">
                          Rs. {given.toLocaleString()}
                        </span>
                      </div>

                      {/* Right: Received */}
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100 shadow-3xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          {language === 'urdu' ? 'لیا' : language === 'hindi' ? 'लिया' : 'Received'}
                        </span>
                        <span className="text-[12px] sm:text-xs font-black text-slate-700 block">
                          Rs. {received.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {ledgers.length === 0 && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-100">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-sm">{texts.noCreditLedgersTitle}</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {texts.noCreditLedgersDesc}
              </p>
              <button
                onClick={() => setShowAddLedgerModal(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {texts.createFirstLedgerBtn}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Events Tab Summary with budgeted targets & Pahaji items */
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{texts.scheduledEventsTitle} ({events.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">{texts.scheduledEventsSubtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(event => {
              const { giftsReceived, actualExpense } = getEventStats(event.id);
              const remainingBudget = event.plannedBudget - actualExpense;
              const isOverspent = remainingBudget < 0;
              const usedPercent = event.plannedBudget > 0 ? Math.round((actualExpense / event.plannedBudget) * 100) : 0;

              const getEventStatus = (dateStr: string) => {
                const eventDate = new Date(dateStr);
                const today = new Date();
                const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime();
                const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
                
                if (eventDay > todayDay) {
                  return {
                    label: language === 'urdu' ? '🟢 آنے والا' : language === 'hindi' ? '🟢 आगामी' : '🟢 Upcoming',
                    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  };
                } else if (eventDay === todayDay) {
                  return {
                    label: language === 'urdu' ? '🟡 جاری' : language === 'hindi' ? '🟡 जारी' : '🟡 Ongoing',
                    bg: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  };
                } else {
                  return {
                    label: language === 'urdu' ? '⚫ مکمل' : language === 'hindi' ? '⚫ पूर्ण' : '⚫ Completed',
                    bg: 'bg-slate-100 text-slate-600 border-slate-250'
                  };
                }
              };

              const getDaysRemainingText = (dateStr: string) => {
                const eventDate = new Date(dateStr);
                const today = new Date();
                const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime();
                const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
                
                if (eventDay > todayDay) {
                  const diffTime = eventDay - todayDay;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (language === 'urdu') {
                    return `${diffDays} دن باقی ہیں`;
                  } else if (language === 'hindi') {
                    return `${diffDays} दिन शेष`;
                  } else {
                    return `${diffDays} Days Remaining`;
                  }
                }
                return null;
              };

              const status = getEventStatus(event.date);
              const countdown = getDaysRemainingText(event.date);

              return (
                <div 
                  key={event.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col overflow-hidden group shadow-xs cursor-pointer"
                  onClick={() => onSelectEvent(event)}
                  id={`event-card-${event.id}`}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold text-purple-750 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-purple-100">
                            {event.type === 'Wedding' 
                              ? (language === 'urdu' ? 'شادی فنکشن' : language === 'hindi' ? 'शादी समारोह' : 'Wedding') 
                              : event.type === 'Aqeeqah' 
                                ? (language === 'urdu' ? 'عقیقہ فنکشن' : language === 'hindi' ? 'अकीका समारोह' : 'Aqeeqah') 
                                : event.type}
                          </span>
                          
                          {/* Event Status Badge */}
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${status.bg}`}>
                            {status.label}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">
                          {translatePresetName(event.name, language)}
                        </h4>
                        
                        <p className="text-xs text-slate-400 font-mono">Date: {new Date(event.date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        {/* Event Countdown */}
                        {countdown && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                            <span>{countdown}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const title = language === 'urdu' ? 'تقریب ڈائری حذف کریں' : language === 'hindi' ? 'समारोह डायरी हटाएं' : 'Delete Action Diary';
                          const msg = language === 'urdu' 
                            ? `کیا آپ واقعی "${event.name}" کے تقاریب کے ریکارڈ حذف کرنا چاہتے ہیں؟` 
                            : language === 'hindi' 
                              ? `क्या आप वाकई "${event.name}" समारोह के सभी रिकॉर्ड हटाना चाहते हैं?` 
                              : `Do you really want to delete "${event.name}" event log book?`;
                          if (triggerConfirm) {
                            triggerConfirm(title, msg, () => onDeleteEvent(event.id));
                          } else {
                            if (confirm(msg)) {
                              onDeleteEvent(event.id);
                            }
                          }
                        }}
                        className="p-1 px-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-all border border-rose-100 hover:border-rose-600 cursor-pointer flex items-center justify-center shrink-0"
                        title={language === 'urdu' ? 'حذف کریں' : language === 'hindi' ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Bar of Budget */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                        <span>{texts.actualExpenseVsBudget}</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>Rs. {actualExpense.toLocaleString()} / Rs. {event.plannedBudget.toLocaleString()}</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                            {language === 'urdu' ? `بجٹ استعمال: ${usedPercent}%` : language === 'hindi' ? `बजट उपयोग: ${usedPercent}%` : `Budget Used: ${usedPercent}%`}
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isOverspent ? 'bg-red-500' : 'bg-emerald-600'}`}
                          style={{ width: `${Math.min(100, (actualExpense / (event.plannedBudget || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quick values block */}
                    <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-50 text-xs">
                      <div>
                        <span className="text-slate-400 block font-light">{texts.giftsPahajiReceived}</span>
                        <span className="font-bold text-emerald-700 text-sm mt-0.5 block">Rs. {giftsReceived.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-light">{texts.remainingBudget}</span>
                        <span className={`font-bold text-sm mt-0.5 block ${isOverspent ? 'text-red-650' : 'text-slate-705'}`}>
                          {isOverspent 
                            ? `${language === 'urdu' ? 'بجٹ سے اوپر:' : language === 'hindi' ? 'बजट से अधिक:' : 'Over Budget'} Rs. ${Math.abs(remainingBudget).toLocaleString()}` 
                            : `Rs. ${remainingBudget.toLocaleString()}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-100">
              <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-sm">{texts.noEventsTitle}</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {texts.noEventsDesc}
              </p>
              <button
                onClick={() => setShowAddEventModal(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {texts.scheduleFirstEventBtn}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD LEDGER BOOK */}
      {showAddLedgerModal && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 animate-fade-in" id="add-ledger-modal">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col p-6 max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>{texts.createLedgerBookFormBtn}</span>
              </h3>
              <button 
                onClick={() => setShowAddLedgerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                id="close-add-ledger"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddLedgerSubmit} className="space-y-4 overflow-y-auto pr-1">
              {ledgerError && (
                <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-semibold flex items-start gap-2 animate-pulse">
                  <span className="text-sm">⚠️</span>
                  <span>{ledgerError}</span>
                </div>
              )}

              {/* Preset suggestion chip cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">{texts.selectStandardCategory}</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {PRESET_LEDGERS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isSavingLedger}
                      onClick={() => {
                        setPresetLedgerName(preset);
                        setNewLedgerName('');
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer disabled:opacity-50 ${
                        presetLedgerName === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={isSavingLedger}
                    onClick={() => {
                      setPresetLedgerName('');
                      setNewLedgerName('');
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all disabled:opacity-50 ${
                      !presetLedgerName
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {texts.customNameBtn}
                  </button>
                </div>
              </div>

              {!presetLedgerName && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.ledgerTitleLabel}</label>
                  <input
                    type="text"
                    required={!presetLedgerName}
                    disabled={isSavingLedger}
                    placeholder="e.g. Kamran Tasleem Shop, Sports Club, Plot Construction"
                    value={newLedgerName}
                    onChange={(e) => setNewLedgerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 disabled:opacity-50"
                    id="new-ledger-title"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.descriptionOptionalLabel}</label>
                <textarea
                  placeholder="Record description of this ledger"
                  disabled={isSavingLedger}
                  value={newLedgerDesc}
                  onChange={(e) => setNewLedgerDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 disabled:opacity-50"
                  id="new-ledger-desc"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end bg-white">
                <button
                  type="button"
                  disabled={isSavingLedger}
                  onClick={() => setShowAddLedgerModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {texts.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSavingLedger}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  id="submit-add-ledger"
                >
                  {isSavingLedger ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>{language === 'urdu' ? 'محفوظ ہو رہا ہے...' : language === 'hindi' ? 'सहेजा जा रहा है...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{texts.createLedgerBookFormBtn}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CEREMONY EVENT */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 animate-fade-in" id="add-event-modal">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col p-6 max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                <span>{texts.scheduleNewEventTitle}</span>
              </h3>
              <button 
                onClick={() => setShowAddEventModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                id="close-add-event"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-4 overflow-y-auto pr-1">
              {eventError && (
                <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-semibold flex items-start gap-2 animate-pulse">
                  <span className="text-sm">⚠️</span>
                  <span>{eventError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.eventNameLabel}</label>
                <input
                  type="text"
                  required
                  disabled={isSavingEvent}
                  placeholder="e.g. Sajid's Son Aqeeqah, Imran's New Plot Housewarming"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 disabled:opacity-50"
                  id="new-event-title-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Occasion Type</label>
                  <select
                    value={newEventType}
                    disabled={isSavingEvent}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ceremony Date</label>
                  <input
                    type="date"
                    disabled={isSavingEvent}
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.plannedBudgetPkrLabel}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    disabled={isSavingEvent}
                    value={newEventBudget}
                    onChange={(e) => setNewEventBudget(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{texts.budgetLimitTip}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.notesOptionalLabel}</label>
                <textarea
                  placeholder="Organizer notes..."
                  disabled={isSavingEvent}
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 disabled:opacity-50"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end bg-white">
                <button
                  type="button"
                  disabled={isSavingEvent}
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {texts.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSavingEvent}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  id="submit-add-event"
                >
                  {isSavingEvent ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>{language === 'urdu' ? 'محفوظ ہو رہا ہے...' : language === 'hindi' ? 'सहेजा जा रहा है...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{texts.scheduleEventDiaryBtn}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for instant access */}
      <button
        type="button"
        onClick={() => {
          if (activeTab === 'loans') {
            setShowAddLedgerModal(true);
          } else {
            setShowAddEventModal(true);
          }
        }}
        className="fixed bottom-6 right-6 z-40 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-emerald-500 focus:outline-hidden group"
        id="fab-add-dashboard"
        title={activeTab === 'loans' ? texts.addLedgerBookBtn : texts.createNewEventBtn}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
          {activeTab === 'loans' ? texts.addLedgerBookBtn : texts.createNewEventBtn}
        </span>
      </button>

    </div>
  );
}
