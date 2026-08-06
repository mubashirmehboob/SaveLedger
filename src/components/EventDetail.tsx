import React, { useState } from 'react';
import { EventEntity, EventItem, SimulatedContact } from '../types';
import { translations, translatePresetName, translatePresetText } from '../utils/translations';
import { 
  ArrowLeft, Plus, Search, Calendar, Phone, Trash2, CheckCircle2,
  TrendingUp, TrendingDown, DollarSign, Gift, HelpCircle, Heart, Tag, Pencil
} from 'lucide-react';
import ContactPicker from './ContactPicker';

interface EventDetailProps {
  event: EventEntity;
  eventItems: EventItem[];
  onBack: () => void;
  onAddEventItem: (item: Omit<EventItem, 'id' | 'eventId' | 'userId'>) => void;
  onDeleteEventItem: (id: string) => void;
  onUpdateEventItem: (item: EventItem) => void;
  language?: 'english' | 'urdu' | 'hindi';
  triggerConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}

export default function EventDetail({
  event,
  eventItems,
  onBack,
  onAddEventItem,
  onDeleteEventItem,
  onUpdateEventItem,
  language = 'english',
  triggerConfirm
}: EventDetailProps) {
  const texts = translations[language];
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItemFilter, setActiveItemFilter] = useState<'all' | 'gift' | 'expense'>('all');

  // New Event Item Form State
  const [itemType, setItemType] = useState<'gift' | 'expense'>('gift');
  const [personName, setPersonName] = useState('');
  const [personMobile, setPersonMobile] = useState('');
  const [personWhatsApp, setPersonWhatsApp] = useState('');
  const [amount, setAmount] = useState('');
  const [giftItem, setGiftItem] = useState(''); // e.g. "Tea Set"
  const [expenseCategory, setExpenseCategory] = useState('Catering');
  const [notes, setNotes] = useState('');

  // Edit Event Item Form State
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [editItemType, setEditItemType] = useState<'gift' | 'expense'>('gift');
  const [editPersonName, setEditPersonName] = useState('');
  const [editPersonMobile, setEditPersonMobile] = useState('');
  const [editPersonWhatsApp, setEditPersonWhatsApp] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editGiftItem, setEditGiftItem] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState('Catering');
  const [editNotes, setEditNotes] = useState('');
  const [showEditContactPicker, setShowEditContactPicker] = useState(false);

  const handleStartEdit = (item: EventItem) => {
    setEditingItem(item);
    setEditItemType(item.type);
    setEditPersonName(item.personName || '');
    setEditPersonMobile(item.personMobile || '');
    setEditPersonWhatsApp(item.personWhatsApp || '');
    setEditAmount(String(item.amount));
    setEditGiftItem(item.giftItem || '');
    setEditExpenseCategory(item.expenseCategory || 'Catering');
    setEditNotes(item.notes || '');
  };

  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (editItemType === 'gift' && !editPersonName.trim()) return;
    if (editItemType === 'expense' && !editAmount) return;

    onUpdateEventItem({
      ...editingItem,
      type: editItemType,
      personName: editItemType === 'gift' ? editPersonName.trim() : undefined,
      personMobile: editItemType === 'gift' ? (editPersonMobile.trim() || undefined) : undefined,
      personWhatsApp: editItemType === 'gift' ? (editPersonWhatsApp.trim() || undefined) : undefined,
      amount: Number(editAmount) || 0,
      giftItem: editItemType === 'gift' ? (editGiftItem || 'Cash') : undefined,
      expenseCategory: editItemType === 'expense' ? editExpenseCategory : undefined,
      notes: editNotes.trim() || undefined
    });

    setEditingItem(null);
  };

  const EVENT_EXPENSE_CATEGORIES = [
    'Catering', 'Decor & Flowers', 'Tent & Seating', 'Sound & Video', 
    'Travel & Transports', 'Printers & Invites', 'Photography', 'Plumbing & Construction', 'Unplanned Daily Bills'
  ];

  const PRESET_GIFTS = [
    'Pure Cash Only', 'Tea Set (6-12pc)', 'Glass Set (6pc)', 'Dinner Set', 
    'Wall Clock', 'Juicer Blender Machine', 'Iron (Dry/Steam)', 'Microwave Oven', 
    'Bedding Blanket Kit', 'Kitchen Pan Appliance'
  ];

  // Specific event logs
  const localItems = eventItems.filter(e => e.eventId === event.id);

  // Math equations defined by user
  const totalReceivedGiftsValue = localItems.filter(e => e.type === 'gift').reduce((sum, e) => sum + e.amount, 0);
  const actualExpense = localItems.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const budgetRemaining = event.plannedBudget - actualExpense;
  const isOverspent = budgetRemaining < 0;

  const filteredItems = localItems
    .filter(item => {
      const matchesSearch = 
        (item.personName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.giftItem || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.expenseCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = 
        activeItemFilter === 'all' || 
        (activeItemFilter === 'gift' && item.type === 'gift') || 
        (activeItemFilter === 'expense' && item.type === 'expense');

      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemType === 'gift' && !personName.trim()) return;
    if (itemType === 'expense' && !amount) return;

    onAddEventItem({
      type: itemType,
      personName: itemType === 'gift' ? personName.trim() : undefined,
      personMobile: itemType === 'gift' ? (personMobile.trim() || undefined) : undefined,
      personWhatsApp: itemType === 'gift' ? (personWhatsApp.trim() || undefined) : undefined,
      amount: Number(amount) || 0,
      giftItem: itemType === 'gift' ? (giftItem || 'Cash') : undefined,
      expenseCategory: itemType === 'expense' ? expenseCategory : undefined,
      date: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined
    });

    // Reset fields
    setPersonName('');
    setPersonMobile('');
    setPersonWhatsApp('');
    setAmount('');
    setGiftItem('');
    setExpenseCategory('Catering');
    setNotes('');
    setShowAddItemModal(false);
  };

  const handleSelectSimulatedContact = (contact: SimulatedContact) => {
    setPersonName(contact.name);
    setPersonMobile(contact.mobile);
    setPersonWhatsApp(contact.whatsapp);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="event-detail-container">
      
      {/* Header with Back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all"
            id="back-to-events-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{texts.eventDiaryPlannerTitle}</span>
            <h2 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{event.name}</h2>
          </div>
        </div>

        <button
          onClick={() => {
            setItemType('gift');
            setShowAddItemModal(true);
          }}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          id="add-event-item-trigger"
        >
          <Plus className="w-4 h-4" />
          <span>{texts.recordGiftExpenseBtn}</span>
        </button>
      </div>

      {/* EVENT BUDGET STATS BAR DISPLAY */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg border border-slate-800 space-y-6">
        
        {/* Math columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">{texts.plannedBudgetTargetHeader}</span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">Rs. {event.plannedBudget.toLocaleString()}</p>
            <span className="text-[9px] text-slate-400">Fixed target</span>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] uppercase font-semibold text-slate-400">{texts.actualExpenseSpentHeader}</span>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${isOverspent ? 'text-rose-400' : 'text-slate-200'}`}>
              Rs. {actualExpense.toLocaleString()}
            </p>
            <span className="text-[9px] text-slate-400">Calculated sum</span>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] uppercase font-semibold text-slate-400">{texts.giftsPahajiReceivedHeader}</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">Rs. {totalReceivedGiftsValue.toLocaleString()}</p>
            <span className="text-[9px] text-emerald-400">Salami contributions</span>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] uppercase font-semibold text-slate-400">{texts.remainingBudgetBalanceHeader}</span>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${isOverspent ? 'text-red-500' : 'text-emerald-400'}`}>
               Rs. {Math.abs(budgetRemaining).toLocaleString()}
            </p>
            <span className="text-[9px] text-slate-400">
              {isOverspent ? texts.overspentBudgetLabel : texts.underBudgetLabel}
            </span>
          </div>
        </div>

        {/* Linear Progress visually */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>{texts.budgetUtilizedProgressTitle} ({Math.round((actualExpense / (event.plannedBudget || 1)) * 100)}%)</span>
            <span>{texts.estLimitLabel} Rs. {event.plannedBudget.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isOverspent ? 'bg-red-500' : 'bg-emerald-600'}`}
              style={{ width: `${Math.min(100, (actualExpense / (event.plannedBudget || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ITEMS LIST DISPLAY (Salami/Pahaji logs and Ceremony Expenses) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        
        {/* Custom Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{texts.ceremonyLogEntriesTitle} ({filteredItems.length})</h3>
            <p className="text-xs text-slate-500">{texts.ceremonyLogEntriesSubtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {/* Search items bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={texts.searchGuestsPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-hidden w-full text-slate-800"
              />
            </div>

            {/* Quick Filter tabs buttons */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveItemFilter('all')}
                className={`text-[10px] sm:text-xs font-semibold py-1 px-3 rounded-md transition-all cursor-pointer ${
                  activeItemFilter === 'all' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {texts.allFilterTab}
              </button>
              <button
                onClick={() => setActiveItemFilter('gift')}
                className={`text-[10px] sm:text-xs font-semibold py-1 px-3 rounded-md transition-all cursor-pointer ${
                  activeItemFilter === 'gift' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {texts.giftsPahajiFilterTab}
              </button>
              <button
                onClick={() => setActiveItemFilter('expense')}
                className={`text-[10px] sm:text-xs font-semibold py-1 px-3 rounded-md transition-all cursor-pointer ${
                  activeItemFilter === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {texts.expensesFilterTab}
              </button>
            </div>
          </div>
        </div>

        {/* Tab content listings */}
        <div className="divide-y divide-slate-100">
          {filteredItems.map(item => {
            const isGift = item.type === 'gift';
            return (
              <div 
                key={item.id}
                className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                id={`event-item-row-${item.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isGift ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {isGift ? <Gift className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                       <h4 className="font-bold text-slate-800 text-sm">
                        {isGift 
                          ? translatePresetName(item.personName || '', language) 
                          : translatePresetName(item.expenseCategory || '', language)}
                      </h4>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isGift ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {isGift ? texts.receivedContributionLabel : texts.actualExpenseSpentLabel}
                      </span>
                    </div>

                    {/* Gifts specifications */}
                    {isGift && item.giftItem && (
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        📦 {texts.materialGiftLabel}: <strong className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-sm">{translatePresetName(item.giftItem, language)}</strong>
                      </p>
                    )}

                    {/* Mobile info if vorhanden */}
                    {isGift && (item.personMobile || item.personWhatsApp) && (
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        {item.personMobile && <span>{language === 'urdu' ? 'موبائل' : language === 'hindi' ? 'मोबाइल' : 'Cell'}: {item.personMobile}</span>}
                        {item.personWhatsApp && <span className="ml-2">WhatsApp: {item.personWhatsApp}</span>}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-xs text-slate-500 italic mt-1 font-light">
                        "{translatePresetText(item.notes, language)}"
                      </p>
                    )}

                    <p className="text-[9px] text-slate-400 mt-1 font-mono">{language === 'urdu' ? 'تاریخ' : language === 'hindi' ? 'दिनांक' : 'Date'}: {item.date}</p>
                  </div>
                </div>

                {/* Values & Deletes */}
                <div className="flex sm:flex-col items-end gap-2 self-stretch sm:self-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <p className={`text-sm sm:text-base font-black ${isGift ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {isGift ? '+' : '-'} Rs. {item.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-400">{isGift ? texts.receivedContributionLabel : texts.actualExpenseSpentLabel}</p>
                  </div>

                  <div className="flex gap-1.5 matches-buttons group">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1 px-1.5 bg-slate-100 hover:bg-emerald-600 text-slate-600 hover:text-white rounded-lg transition-all border border-slate-200 hover:border-emerald-600 font-bold flex items-center justify-center cursor-pointer shrink-0"
                      title={language === 'urdu' ? 'تبدیل کریں' : language === 'hindi' ? 'संपादित करें' : 'Edit'}
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                    </button>
                    <button
                      onClick={() => {
                        const title = language === 'urdu' ? 'اندراج حذف کریں' : language === 'hindi' ? 'प्रविष्टि हटाएं' : 'Delete Entry';
                        const msg = language === 'urdu' 
                          ? 'کیا آپ اس تقریب کے اندراج کو ہر گز حذف کرنا چاہتے ہیں؟' 
                          : language === 'hindi' 
                            ? 'क्या आप इस कार्यक्रम प्रविष्टि को हमेशा के लिए हटाना चाहते हैं?' 
                            : 'Delete this event registry item irrevocably?';
                        if (triggerConfirm) {
                          triggerConfirm(title, msg, () => onDeleteEventItem(item.id));
                        } else {
                          if (confirm(msg)) {
                            onDeleteEventItem(item.id);
                          }
                        }
                      }}
                      className="p-1 px-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-all border border-rose-100 hover:border-rose-600 flex items-center justify-center cursor-pointer shrink-0"
                      title={language === 'urdu' ? 'حذف کریں' : language === 'hindi' ? 'हटाएं' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">No entries match your search criteria.</p>
              <button
                onClick={() => {
                  setItemType('gift');
                  setShowAddItemModal(true);
                }}
                className="mt-2 text-emerald-600 hover:underline text-xs font-bold"
              >
                Click to record first entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: RECORD EVENT ITEM (Pahaji or Expense) */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="add-item-modal">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col p-6 my-8 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <span>{texts.recordEventPageItemTitle}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Recording in: {event.name}</p>
              </div>
              <button 
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                id="close-add-item"
              >
                &times;
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddItemSubmit} className="space-y-4 overflow-y-auto pr-1">
              
              {/* Type Switcher (Gift / Contribution RECEIVED vs Expense SPENT) */}
              <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex">
                <button
                  type="button"
                  onClick={() => setItemType('gift')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    itemType === 'gift' 
                      ? 'bg-purple-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {texts.salamiPahajiReceivedTab}
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('expense')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    itemType === 'expense' 
                      ? 'bg-red-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {texts.expenseSpentOutTab}
                </button>
              </div>

              {itemType === 'gift' ? (
                /* Gift Inputs fields group */
                <div className="space-y-4 animate-fade-in text-slate-800">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold text-slate-700">{texts.guestSenderNameLabel}</label>
                      <button
                        type="button"
                        onClick={() => setShowContactPicker(true)}
                        className="text-xs text-emerald-600 hover:bg-emerald-50 px-2 rounded-sm border border-emerald-100 flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        📖 {texts.savedContactsBtn}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Uncle Arshad, Bilal Cousin"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.mobileNumberLabel}</label>
                      <input
                        type="text"
                        placeholder="e.g. +92 300 9998877"
                        value={personMobile}
                        onChange={(e) => setPersonMobile(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.whatsAppLabel}</label>
                      <input
                        type="text"
                        placeholder="e.g. +92 300 9998877"
                        value={personWhatsApp}
                        onChange={(e) => setPersonWhatsApp(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.cashPaidAmountLabel}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                        <input
                          type="number"
                          placeholder="e.g. 10000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-bold font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.customGiftDescriptionLabel}</label>
                      <input
                        type="text"
                        list="preset-gifts-autocomplete"
                        placeholder="e.g. Tea Set, Microwave Oven, Clock"
                        value={giftItem}
                        onChange={(e) => setGiftItem(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                      />
                      <datalist id="preset-gifts-autocomplete">
                        {PRESET_GIFTS.map(preset => (
                          <option key={preset} value={preset} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              ) : (
                /* Expense Inputs fields group */
                <div className="space-y-4 animate-fade-in text-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.expenseCategoryLabel}</label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                      >
                        {EVENT_EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.expenseCashSpentLabel}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 45000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Notes description info */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.memosSpecialReminderLabel}</label>
                <textarea
                  placeholder="e.g. Gave tea set last year and Rs. 2,000 cash..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                />
              </div>

              {/* Submit panel buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  {texts.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  id="submit-event-item"
                >
                  {texts.confirmDiaryRecordFormBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Book Simulator picker widget */}
      {showContactPicker && (
        <ContactPicker
          onSelect={handleSelectSimulatedContact}
          onClose={() => setShowContactPicker(false)}
          selectedMobile={personMobile}
          language={language}
        />
      )}

      {/* MODAL: EDIT EVENT ITEM */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="edit-item-modal">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col p-6 my-8 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5 font-display text-emerald-800">
                  <span>{texts.editCeremonyEntryTitle}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Recording in: {event.name}</p>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                id="close-edit-item"
              >
                &times;
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleEditItemSubmit} className="space-y-4 overflow-y-auto pr-1">
              
              {/* Type Switcher (Gift / Contribution RECEIVED vs Expense SPENT) */}
              <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex">
                <button
                  type="button"
                  onClick={() => setEditItemType('gift')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    editItemType === 'gift' 
                      ? 'bg-purple-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {texts.salamiPahajiReceivedTab}
                </button>
                <button
                  type="button"
                  onClick={() => setEditItemType('expense')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    editItemType === 'expense' 
                      ? 'bg-red-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {texts.expenseSpentOutTab}
                </button>
              </div>

              {editItemType === 'gift' ? (
                /* Gift Inputs fields group */
                <div className="space-y-4 animate-fade-in text-slate-800">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold text-slate-700">{texts.guestSenderNameLabel}</label>
                      <button
                        type="button"
                        onClick={() => setShowEditContactPicker(true)}
                        className="text-xs text-emerald-600 hover:bg-emerald-50 px-2 rounded-sm border border-emerald-100 flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        📖 {texts.savedContactsBtn}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Uncle Arshad, Bilal Cousin"
                      value={editPersonName}
                      onChange={(e) => setEditPersonName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.mobileNumberLabel}</label>
                      <input
                        type="text"
                        placeholder="e.g. +92 300 9998877"
                        value={editPersonMobile}
                        onChange={(e) => setEditPersonMobile(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.whatsAppLabel}</label>
                      <input
                        type="text"
                        placeholder="e.g. +92 300 9998877"
                        value={editPersonWhatsApp}
                        onChange={(e) => setEditPersonWhatsApp(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.cashPaidAmountLabel}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                        <input
                          type="number"
                          placeholder="e.g. 10000"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-bold font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.customGiftDescriptionLabel}</label>
                      <input
                        type="text"
                        list="preset-gifts-autocomplete-edit"
                        placeholder="e.g. Tea Set, Microwave Oven, Clock"
                        value={editGiftItem}
                        onChange={(e) => setEditGiftItem(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                      />
                      <datalist id="preset-gifts-autocomplete-edit">
                        {PRESET_GIFTS.map(preset => (
                          <option key={preset} value={preset} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              ) : (
                /* Expense Inputs fields group */
                <div className="space-y-4 animate-fade-in text-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.expenseCategoryLabel}</label>
                      <select
                        value={editExpenseCategory}
                        onChange={(e) => setEditExpenseCategory(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                      >
                        {EVENT_EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.expenseCashSpentLabel}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 45000"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Notes description info */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.memosSpecialReminderLabel}</label>
                <textarea
                  placeholder="e.g. Gave tea set last year and Rs. 2,000 cash..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                />
              </div>

              {/* Submit panel buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end bg-white">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  {texts.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {texts.confirmDiaryRecordFormBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Book Simulator picker widget */}
      {showEditContactPicker && (
        <ContactPicker
          onSelect={(contact) => {
            setEditPersonName(contact.name);
            setEditPersonMobile(contact.mobile);
            setEditPersonWhatsApp(contact.whatsapp);
          }}
          onClose={() => setShowEditContactPicker(false)}
          selectedMobile={editPersonMobile}
          language={language}
        />
      )}
    </div>
  );
}
