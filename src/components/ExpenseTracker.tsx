import React, { useState } from 'react';
import { ExpenseBook, ExpenseEntry } from '../types';
import { 
  Plus, Calendar, ArrowLeft, Trash2, Pencil, PiggyBank, 
  TrendingUp, TrendingDown, DollarSign, X, Filter, Clock, 
  ArrowUpRight, Check, AlertTriangle, ChevronRight, Tag, BookOpen
} from 'lucide-react';

interface ExpenseTrackerProps {
  user: { id: string; name: string };
  expenseBooks: ExpenseBook[];
  expenses: ExpenseEntry[];
  onAddBook: (book: Omit<ExpenseBook, 'id' | 'userId' | 'createdAt'>) => Promise<void> | void;
  onUpdateBook: (book: ExpenseBook) => Promise<void> | void;
  onDeleteBook: (id: string) => Promise<void> | void;
  onAddExpense: (expense: Omit<ExpenseEntry, 'id' | 'userId' | 'createdAt'>) => Promise<void> | void;
  onUpdateExpense: (expense: ExpenseEntry) => Promise<void> | void;
  onDeleteExpense: (id: string) => Promise<void> | void;
  language?: 'english' | 'urdu' | 'hindi';
  triggerConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}

const trackerTranslations = {
  english: {
    title: "Expense Tracker",
    subtitle: "Track daily expenses & monthly income to manage your budget",
    createBookBtn: "Create Monthly Book",
    newBookTitle: "Create Monthly Expense Book",
    monthLabel: "Select Month & Year",
    incomeLabel: "Monthly Income (Salary/Other)",
    openingBalanceLabel: "Opening Balance (Optional)",
    noBooksTitle: "No Expense Books Created Yet",
    noBooksDesc: "Create your first monthly book to begin tracking expenses and income.",
    backToBooks: "← Back to Monthly Books",
    summaryTitle: "Monthly Summary",
    totalIncome: "Income",
    totalExpenses: "Expenses",
    remainingBalance: "Remaining",
    transactionsCount: "Entries",
    addExpenseBtn: "Add Expense",
    searchPlaceholder: "Search expenses, description or notes...",
    categoryFilterAll: "All Categories",
    categoryLabel: "Category",
    dateLabel: "Date",
    amountLabel: "Amount (Rs.)",
    descriptionLabel: "Description",
    notesLabel: "Notes (Optional)",
    addExpenseTitle: "Add Expense Entry",
    editExpenseTitle: "Edit Expense Entry",
    saveExpenseBtn: "Save Expense",
    deleteBookBtn: "Delete Month Book",
    editBookBtn: "Edit Income/Balance",
    editBookTitle: "Edit Monthly Book Details",
    noExpensesTitle: "No Expenses Logged Yet",
    noExpensesDesc: "Keep your finance on track by adding your first daily expense entry.",
    confirmDeleteBook: "Are you sure you want to delete this monthly book? All logged expenses will be permanently deleted.",
    confirmDeleteExpense: "Are you sure you want to delete this expense entry?",
    dateRangeLabel: "Filter by Date Range",
    startDate: "Start Date",
    endDate: "End Date",
    clearFilter: "Clear Filters",
    notePlaceholder: "Add extra details here...",
    descriptionPlaceholder: "e.g. KFC Dinner, House Rent",
    saveBookBtn: "Create Book",
    updateBookBtn: "Update Book",
    categories: {
      Food: "Food",
      Groceries: "Groceries",
      Petrol: "Petrol",
      Transport: "Transport",
      Bills: "Bills",
      Shopping: "Shopping",
      Health: "Health",
      Education: "Education",
      Entertainment: "Entertainment",
      Rent: "Rent",
      Other: "Other"
    }
  },
  urdu: {
    title: "آمدن اور اخراجات کا حساب",
    subtitle: "اپنے ماہانہ بجٹ اور روزانہ کے اخراجات کو منظم رکھیں",
    createBookBtn: "نیا ماہانہ رجسٹر بنائیں",
    newBookTitle: "نیا ماہانہ اخراجات رجسٹر درج کریں",
    monthLabel: "مہینہ اور سال منتخب کریں",
    incomeLabel: "ماہانہ آمدنی (تنخواہ یا دیگر)",
    openingBalanceLabel: "پچھلا بقایا بیلنس (اختیاری)",
    noBooksTitle: "کوئی اخراجات رجسٹر موجود نہیں ہے",
    noBooksDesc: "اپنے اخراجات اور آمدنی کو ٹریک کرنے کے لئے پہلا ماہانہ رجسٹر بنائیں۔",
    backToBooks: "← ماہانہ رجسٹر لسٹ دیکھیں",
    summaryTitle: "ماہانہ خلاصہ",
    totalIncome: "آمدنی",
    totalExpenses: "اخراجات",
    remainingBalance: "باقی",
    transactionsCount: "کل انٹریز",
    addExpenseBtn: "خرچہ درج کریں",
    searchPlaceholder: "خرچہ، تفصیل یا نوٹ تلاش کریں...",
    categoryFilterAll: "تمام کیٹیگریز",
    categoryLabel: "زمرہ (کیٹیگری)",
    dateLabel: "تاریخ",
    amountLabel: "رقم (روپے)",
    descriptionLabel: "تفصیل",
    notesLabel: "اضافی ریمارکس (اختیاری)",
    addExpenseTitle: "نیا خرچہ درج کریں",
    editExpenseTitle: "خرچہ ریکارڈ تبدیل کریں",
    saveExpenseBtn: "محفوظ کریں",
    deleteBookBtn: "رجسٹر مٹائیں",
    editBookBtn: "آمدنی/بیلنس تبدیل کریں",
    editBookTitle: "ماہانہ رجسٹر کی تفصیلات تبدیل کریں",
    noExpensesTitle: "ابھی کوئی خرچہ درج نہیں ہے",
    noExpensesDesc: "اپنے بجٹ پر نظر رکھنے کے لئے پہلا روزانہ کا خرچہ درج کریں۔",
    confirmDeleteBook: "کیا آپ اس ماہانہ رجسٹر کو مٹانا چاہتے ہیں؟ اس کے اندر موجود تمام اخراجات بھی مستقل طور پر حذف ہو جائیں گے۔",
    confirmDeleteExpense: "کیا آپ اس اخراجات کے اندراج کو حذف کرنا چاہتے ہیں؟",
    dateRangeLabel: "تاریخ کے لحاظ سے فلٹر کریں",
    startDate: "شروع تاریخ",
    endDate: "آخری تاریخ",
    clearFilter: "فلٹر صاف کریں",
    notePlaceholder: "اضافی تفصیل یہاں لکھیں...",
    descriptionPlaceholder: "مثلاً کھانے کا بل، گھر کا کرایہ",
    saveBookBtn: "رجسٹر بنائیں",
    updateBookBtn: "تبدیل کریں",
    categories: {
      Food: "کھانا",
      Groceries: "گھر کا راشن",
      Petrol: "پیٹرول / ایندھن",
      Transport: "سفر و کرایہ",
      Bills: "یوٹیلیٹی بلز",
      Shopping: "خریداری (شاپنگ)",
      Health: "صحت اور علاج",
      Education: "تعلیم اور فیس",
      Entertainment: "تفریح و مٹھائی",
      Rent: "گھر کا کرایہ",
      Other: "دیگر اخراجات"
    }
  },
  hindi: {
    title: "व्यय और आय ट्रैकर",
    subtitle: "अपने मासिक बजट और दैनिक खर्चों को व्यवस्थित रखें",
    createBookBtn: "मासिक रजिस्टर बनाएं",
    newBookTitle: "मासिक व्यय रजिस्टर बनाएं",
    monthLabel: "महीना और वर्ष चुनें",
    incomeLabel: "मासिक आय (वेतन या अन्य)",
    openingBalanceLabel: "प्रारंभिक शेष (वैकल्पिक)",
    noBooksTitle: "कोई मासिक रजिस्टर नहीं मिला",
    noBooksDesc: "अपने खर्चों और आय को ट्रैक करने के लिए पहला मासिक रजिस्टर बनाएं।",
    backToBooks: "← मासिक रजिस्टरों पर वापस जाएं",
    summaryTitle: "मासिक सारांश",
    totalIncome: "आय",
    totalExpenses: "व्यय",
    remainingBalance: "शेष",
    transactionsCount: "कुल प्रविष्टियां",
    addExpenseBtn: "व्यय जोड़ें",
    searchPlaceholder: "खर्च, विवरण या नोट खोजें...",
    categoryFilterAll: "सभी श्रेणियां",
    categoryLabel: "श्रेणी",
    dateLabel: "तारीख",
    amountLabel: "राशि (रु.)",
    descriptionLabel: "विवरण",
    notesLabel: "विशेष नोट (वैकल्पिक)",
    addExpenseTitle: "व्यय प्रविष्टि जोड़ें",
    editExpenseTitle: "व्यय प्रविष्टि संपादित करें",
    saveExpenseBtn: "सहेजें",
    deleteBookBtn: "रजिस्टर हटाएं",
    editBookBtn: "आय/शेष बदलें",
    editBookTitle: "मासिक रजिस्टर विवरण संपादित करें",
    noExpensesTitle: "कोई खर्च दर्ज नहीं है",
    noExpensesDesc: "अपने बजट को नियंत्रित करने के लिए अपनी पहली दैनिक व्यय प्रविष्टि जोड़ें।",
    confirmDeleteBook: "क्या आप निश्चित रूप से इस मासिक रजिस्टर को हटाना चाहते हैं? सभी खर्च भी स्थायी रूप से हटा दिए जाएंगे।",
    confirmDeleteExpense: "क्या आप इस व्यय प्रविष्टि को हटाना चाहते हैं?",
    dateRangeLabel: "तारीख के अनुसार फ़िल्टर करें",
    startDate: "प्रारंभ तिथि",
    endDate: "अंतिम तिथि",
    clearFilter: "फ़िल्टर साफ़ करें",
    notePlaceholder: "अतिरिक्त विवरण यहाँ लिखें...",
    descriptionPlaceholder: "उदा. रात का खाना, घर का किराया",
    saveBookBtn: "रजिस्टर सहेजें",
    updateBookBtn: "अपडेट करें",
    categories: {
      Food: "भोजन",
      Groceries: "राशन / किराना",
      Petrol: "पेट्रोल / ईंधन",
      Transport: "परिवहन / यात्रा",
      Bills: "बिजली/पानी बिल",
      Shopping: "खरीदारी (शॉपिंग)",
      Health: "स्वास्थ्य / दवा",
      Education: "शिक्षा और फीस",
      Entertainment: "मनोरंजन",
      Rent: "मकान किराया",
      Other: "अन्य व्यय"
    }
  }
};

const DEFAULT_CATEGORIES = [
  'Food',
  'Groceries',
  'Petrol',
  'Transport',
  'Bills',
  'Shopping',
  'Health',
  'Education',
  'Entertainment',
  'Rent',
  'Other'
];

export default function ExpenseTracker({
  user,
  expenseBooks,
  expenses,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  language = 'english',
  triggerConfirm
}: ExpenseTrackerProps) {
  const t = trackerTranslations[language];

  // Selected Monthly Book
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Modals Visibility
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Add Book Form State
  const [bookMonthYear, setBookMonthYear] = useState('');
  const [bookIncome, setBookIncome] = useState('');
  const [bookOpeningBalance, setBookOpeningBalance] = useState('');

  // Edit Book Form State
  const [editingBook, setEditingBook] = useState<ExpenseBook | null>(null);
  const [editBookIncome, setEditBookIncome] = useState('');
  const [editBookOpeningBalance, setEditBookOpeningBalance] = useState('');

  // Add Expense Form State
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Edit Expense State
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [editExpenseDate, setEditExpenseDate] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState('Food');
  const [editExpenseDescription, setEditExpenseDescription] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [editExpenseNotes, setEditExpenseNotes] = useState('');

  // Form loading & error status states
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [bookError, setBookError] = useState('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  const activeBook = expenseBooks.find(b => b.id === selectedBookId);
  const activeBookExpenses = expenses.filter(e => e.bookId === selectedBookId);

  // Date formatted display helper
  const formatMonthDisplay = (monthYearStr: string) => {
    if (!monthYearStr) return '';
    const [year, month] = monthYearStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString(language === 'urdu' ? 'ur' : language === 'hindi' ? 'hi' : 'en', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    const shortYear = year.slice(-2); // e.g. "26"
    const parsedDay = parseInt(day, 10).toString(); // e.g. "6"
    const parsedMonth = parseInt(month, 10).toString(); // e.g. "7"
    return `${parsedDay}/${parsedMonth}/${shortYear}`;
  };

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookMonthYear) return;

    setIsSavingBook(true);
    setBookError('');

    try {
      // e.g. "2026-07" -> name: "July 2026"
      const name = formatMonthDisplay(bookMonthYear);

      await onAddBook({
        monthYear: bookMonthYear,
        name,
        monthlyIncome: Number(bookIncome) || 0,
        openingBalance: Number(bookOpeningBalance) || 0
      });

      // Reset Form only on success
      setBookMonthYear('');
      setBookIncome('');
      setBookOpeningBalance('');
      setShowAddBookModal(false);
    } catch (err: any) {
      console.error("Failed to create monthly book:", err);
      setBookError(err.message || "Failed to create monthly book. Please check your network and try again.");
    } finally {
      setIsSavingBook(false);
    }
  };

  const handleEditBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    onUpdateBook({
      ...editingBook,
      monthlyIncome: Number(editBookIncome) || 0,
      openingBalance: Number(editBookOpeningBalance) || 0
    });

    setEditingBook(null);
    setShowEditBookModal(false);
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !expenseDescription.trim() || !expenseAmount) return;

    setIsSavingExpense(true);
    setExpenseError('');

    try {
      await onAddExpense({
        bookId: selectedBookId,
        date: expenseDate || new Date().toISOString().split('T')[0],
        category: expenseCategory,
        description: expenseDescription.trim(),
        amount: Number(expenseAmount) || 0,
        notes: expenseNotes.trim() || undefined
      });

      // Reset Form on success only
      setExpenseDate('');
      setExpenseCategory('Food');
      setExpenseDescription('');
      setExpenseAmount('');
      setExpenseNotes('');
      setShowAddExpenseModal(false);
    } catch (err: any) {
      console.error("Failed to add expense:", err);
      setExpenseError(err.message || "Failed to add expense. Please check your connection and try again.");
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleEditExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    onUpdateExpense({
      ...editingExpense,
      date: editExpenseDate,
      category: editExpenseCategory,
      description: editExpenseDescription.trim(),
      amount: Number(editExpenseAmount) || 0,
      notes: editExpenseNotes.trim() || undefined
    });

    setEditingExpense(null);
  };

  // Calculations for Active Book
  const bookTotalIncome = activeBook ? (activeBook.monthlyIncome + (activeBook.openingBalance || 0)) : 0;
  const bookTotalExpenses = activeBookExpenses.reduce((sum, e) => sum + e.amount, 0);
  const bookRemainingBalance = bookTotalIncome - bookTotalExpenses;
  const bookTxCount = activeBookExpenses.length;

  // Search and filter logic
  const filteredExpenses = activeBookExpenses.filter(e => {
    const categoryName = t.categories[e.category as keyof typeof t.categories] || e.category;
    const matchesSearch = 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;
    
    const matchesStartDate = !startDateFilter || e.date >= startDateFilter;
    const matchesEndDate = !endDateFilter || e.date <= endDateFilter;

    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const handleStartEditBook = (book: ExpenseBook) => {
    setEditingBook(book);
    setEditBookIncome(String(book.monthlyIncome));
    setEditBookOpeningBalance(String(book.openingBalance));
    setShowEditBookModal(true);
  };

  const handleStartEditExpense = (expense: ExpenseEntry) => {
    setEditingExpense(expense);
    setEditExpenseDate(expense.date);
    setEditExpenseCategory(expense.category);
    setEditExpenseDescription(expense.description);
    setEditExpenseAmount(String(expense.amount));
    setEditExpenseNotes(expense.notes || '');
  };

  const handleDeleteBookClick = (bookId: string) => {
    if (triggerConfirm) {
      triggerConfirm(t.deleteBookBtn, t.confirmDeleteBook, () => {
        onDeleteBook(bookId);
        setSelectedBookId(null);
      });
    } else {
      if (window.confirm(t.confirmDeleteBook)) {
        onDeleteBook(bookId);
        setSelectedBookId(null);
      }
    }
  };

  const handleDeleteExpenseClick = (id: string) => {
    if (triggerConfirm) {
      triggerConfirm(t.addExpenseBtn, t.confirmDeleteExpense, () => {
        onDeleteExpense(id);
      });
    } else {
      if (window.confirm(t.confirmDeleteExpense)) {
        onDeleteExpense(id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {!selectedBookId ? (
        // ================= MONTHLY BOOKS OVERVIEW SCREEN =================
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-8 space-y-6 animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 text-[#029664] rounded-2xl border border-emerald-100 flex items-center justify-center font-black text-xl shadow-3xs select-none">💰</div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{t.title}</h2>
                <p className="text-slate-500 text-xs mt-0.5">{t.subtitle}</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddBookModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.createBookBtn}</span>
            </button>
          </div>

          {/* Monthly Books List */}
          {expenseBooks.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <PiggyBank className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">{t.noBooksTitle}</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto p-0.5">{t.noBooksDesc}</p>
              <button
                onClick={() => setShowAddBookModal(true)}
                className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 pt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.createBookBtn}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenseBooks.map((book) => {
                const bookExps = expenses.filter(e => e.bookId === book.id);
                const totalSpent = bookExps.reduce((sum, e) => sum + e.amount, 0);
                const totalInc = book.monthlyIncome + (book.openingBalance || 0);
                const bal = totalInc - totalSpent;

                return (
                  <div 
                    key={book.id} 
                    onClick={() => setSelectedBookId(book.id)}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md hover:border-emerald-300/60 transition-all flex flex-col gap-4 cursor-pointer"
                  >
                    {/* Month Year Header */}
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <span className="text-xl">🗓️</span>
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">{book.name}</span>
                    </div>

                    {/* Summary Columns */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50/50 rounded-xl p-2.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          {t.totalIncome}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-slate-700 block mt-1 font-mono">
                          Rs.{totalInc}
                        </span>
                      </div>
                      <div className="bg-slate-50/50 rounded-xl p-2.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          {t.totalExpenses}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-rose-600 block mt-1 font-mono">
                          Rs.{totalSpent}
                        </span>
                      </div>
                      <div className="bg-emerald-50/30 rounded-xl p-2.5">
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                          {t.remainingBalance}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-emerald-600 block mt-1 font-mono">
                          Rs.{bal}
                        </span>
                      </div>
                    </div>

                    {/* Footer Row Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100/60">
                      {/* Left Side (empty or metadata) */}
                      <div></div>

                      {/* Right Side Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditBook(book);
                          }}
                          className="p-2 hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
                          title={t.editBookBtn}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBookClick(book.id);
                          }}
                          className="p-2 hover:bg-rose-50 border border-rose-200 text-rose-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
                          title={t.deleteBookBtn}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Open Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookId(book.id);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-[#029664] font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-3xs"
                        >
                          <span>{language === 'urdu' ? 'کھولیں' : language === 'hindi' ? 'खोलें' : 'Open'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        // ================= DETAILED SINGLE EXPENSE BOOK SCREEN =================
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-8 space-y-6 animate-fade-in">
          
          {/* Top Back Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedBookId(null)}
                className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center shrink-0"
                title={t.backToBooks}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>{activeBook?.name}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {activeBook?.monthYear}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => activeBook && handleStartEditBook(activeBook)}
                className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.editBookBtn}</span>
              </button>
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addExpenseBtn}</span>
              </button>
            </div>
          </div>

          {/* Book Summary (Responsive) */}
          {/* Mobile Mode: Compact Single-Line Summary */}
          <div className="block sm:hidden bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs">
            <div className="grid grid-cols-3 text-center divide-x divide-slate-100">
              <div className="px-1">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  {language === 'urdu' ? 'کل رقم' : language === 'hindi' ? 'कुल' : 'Total'}
                </span>
                <span className="text-xs font-black text-slate-800 block mt-1.5 font-mono">
                  Rs.{bookTotalIncome}
                </span>
              </div>
              <div className="px-1">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  {language === 'urdu' ? 'اخراجات' : language === 'hindi' ? 'व्यय' : 'Expenses'}
                </span>
                <span className="text-xs font-black text-rose-600 block mt-1.5 font-mono">
                  Rs.{bookTotalExpenses}
                </span>
              </div>
              <div className="px-1">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  {language === 'urdu' ? 'بقایا' : language === 'hindi' ? 'शेष' : 'Remaining'}
                </span>
                <span className={`text-xs font-black block mt-1.5 font-mono ${bookRemainingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Rs.{bookRemainingBalance}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Mode: Detailed Summary Cards */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Income */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-2xs transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.totalIncome}</span>
                  <span className="text-lg sm:text-xl font-black text-slate-800 block">Rs.{bookTotalIncome}</span>
                </div>
                <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-2 text-[10px] text-slate-500 border-t border-slate-50 pt-2 font-mono">
                <span>Salary: Rs.{activeBook?.monthlyIncome}</span>
                {activeBook?.openingBalance ? <span>• Prev: Rs.{activeBook.openingBalance}</span> : null}
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-2xs transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.totalExpenses}</span>
                  <span className="text-lg sm:text-xl font-black text-rose-600 block">Rs.{bookTotalExpenses}</span>
                </div>
                <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                  <TrendingDown className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-3 text-[10px] text-slate-500 border-t border-slate-50 pt-2 font-mono">
                <span>Spent out of pocket budget</span>
              </div>
            </div>

            {/* Remaining Balance */}
            <div className={`border rounded-2xl p-4 sm:p-5 hover:shadow-2xs transition-shadow bg-white ${bookRemainingBalance >= 0 ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.remainingBalance}</span>
                  <span className={`text-lg sm:text-xl font-black block ${bookRemainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Rs.{bookRemainingBalance}
                  </span>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bookRemainingBalance >= 0 ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-rose-100 border border-rose-200 text-rose-600 animate-pulse'}`}>
                  <PiggyBank className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-3 text-[10px] border-t border-slate-50 pt-2 font-mono">
                {bookRemainingBalance >= 0 ? (
                  <span className="text-emerald-600 font-bold">✓ Under budget control</span>
                ) : (
                  <span className="text-rose-600 font-black">⚠️ Budget Overspent!</span>
                )}
              </div>
            </div>

            {/* Transactions Count */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-2xs transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.transactionsCount}</span>
                  <span className="text-lg sm:text-xl font-black text-slate-800 block">{bookTxCount}</span>
                </div>
                <div className="w-9 h-9 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <Clock className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-3 text-[10px] text-slate-500 border-t border-slate-50 pt-2 font-mono">
                <span>Logged ledger timeline entries</span>
              </div>
            </div>

          </div>



          {/* List of logged expenses */}
          {filteredExpenses.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <Tag className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">{t.noExpensesTitle}</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto p-0.5">{t.noExpensesDesc}</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-2 sm:px-4">{t.dateLabel}</th>
                      <th className="py-3 px-2 sm:px-4">{t.categoryLabel}</th>
                      <th className="hidden sm:table-cell py-3 px-4">{t.descriptionLabel}</th>
                      <th className="py-3 px-2 sm:px-4 text-right">{t.amountLabel}</th>
                      <th className="hidden sm:table-cell py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExpenses.map((exp) => {
                      const isEditingThis = editingExpense?.id === exp.id;

                      if (isEditingThis) {
                        return (
                          <tr key={exp.id} className="bg-emerald-50/20">
                            <td className="p-3" colSpan={5}>
                              <form onSubmit={handleEditExpenseSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.dateLabel}</label>
                                  <input 
                                    type="date" 
                                    value={editExpenseDate} 
                                    onChange={(e) => setEditExpenseDate(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.categoryLabel}</label>
                                  <select 
                                    value={editExpenseCategory} 
                                    onChange={(e) => setEditExpenseCategory(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                                    required
                                  >
                                    {DEFAULT_CATEGORIES.map(cat => (
                                      <option key={cat} value={cat}>
                                        {t.categories[cat as keyof typeof t.categories] || cat}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.descriptionLabel}</label>
                                  <input 
                                    type="text" 
                                    value={editExpenseDescription} 
                                    onChange={(e) => setEditExpenseDescription(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.amountLabel}</label>
                                  <input 
                                    type="number" 
                                    value={editExpenseAmount} 
                                    onChange={(e) => setEditExpenseAmount(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                                    required
                                    min="1"
                                  />
                                </div>
                                <div className="sm:col-span-4">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.notesLabel}</label>
                                  <input 
                                    type="text" 
                                    value={editExpenseNotes} 
                                    onChange={(e) => setEditExpenseNotes(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                                    placeholder={t.notePlaceholder}
                                  />
                                </div>
                                <div className="sm:col-span-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteExpenseClick(exp.id);
                                      setEditingExpense(null);
                                    }}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100 hover:border-rose-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{language === 'urdu' ? 'مکمل انٹری حذف کریں' : language === 'hindi' ? 'प्रविष्टि हटाएं' : 'Delete Entry'}</span>
                                  </button>
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingExpense(null)}
                                      className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                                    >
                                      {language === 'urdu' ? 'منسوخ' : language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                                    >
                                      {t.saveExpenseBtn}
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={exp.id} className="hover:bg-slate-50/50 text-xs sm:text-sm text-slate-700 transition-colors">
                          <td className="py-2.5 px-2 sm:px-4 font-mono text-[11px] sm:text-xs text-slate-500 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleStartEditExpense(exp)}
                              className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md transition-all font-extrabold cursor-pointer shadow-3xs text-[10px] sm:text-xs"
                              title="Click to Edit/Delete details"
                            >
                              <span className="text-[10px]">📅</span>
                              <span className="underline decoration-dotted">{formatShortDate(exp.date)}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-2 sm:px-4">
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 sm:px-2 rounded-full text-[10px] sm:text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{t.categories[exp.category as keyof typeof t.categories] || exp.category}</span>
                            </span>
                          </td>
                          <td className="hidden sm:table-cell py-3.5 px-2 sm:px-4">
                            <div>
                              <p className="font-bold text-slate-800">{exp.description}</p>
                              {exp.notes && (
                                <p className="text-[11px] text-slate-400 mt-0.5 italic">{exp.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-2 sm:px-4 text-right font-extrabold text-rose-600 text-xs sm:text-sm font-mono whitespace-nowrap">
                            Rs.{exp.amount}
                          </td>
                          <td className="hidden sm:table-cell py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEditExpense(exp)}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpenseClick(exp.id)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= MODAL: CREATE MONTH BOOK ================= */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 animate-fade-in" id="add-book-modal">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col p-6 max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span>📚</span>
                <span>{t.newBookTitle}</span>
              </h3>
              <button 
                onClick={() => setShowAddBookModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-4 overflow-y-auto pr-1">
              {bookError && (
                <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-semibold flex items-start gap-2 animate-pulse">
                  <span className="text-sm">⚠️</span>
                  <span>{bookError}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.monthLabel}
                </label>
                <input
                  type="month"
                  value={bookMonthYear}
                  onChange={(e) => setBookMonthYear(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden disabled:opacity-50"
                  required
                  disabled={isSavingBook}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.incomeLabel}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={bookIncome}
                  onChange={(e) => setBookIncome(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden font-mono disabled:opacity-50"
                  required
                  min="0"
                  disabled={isSavingBook}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.openingBalanceLabel}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 12000"
                  value={bookOpeningBalance}
                  onChange={(e) => setBookOpeningBalance(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden font-mono disabled:opacity-50"
                  min="0"
                  disabled={isSavingBook}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="flex-1 py-3 text-center border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer disabled:opacity-50"
                  disabled={isSavingBook}
                >
                  {language === 'urdu' ? 'کینسل' : language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isSavingBook}
                >
                  {isSavingBook ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>{language === 'urdu' ? 'محفوظ ہو رہا ہے...' : language === 'hindi' ? 'सहेजा जा रहा है...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{t.saveBookBtn}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT MONTH BOOK ================= */}
      {showEditBookModal && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 animate-fade-in" id="edit-book-modal">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col p-6 max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span>✏️</span>
                <span>{t.editBookTitle}</span>
              </h3>
              <button 
                onClick={() => setShowEditBookModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBookSubmit} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.incomeLabel}
                </label>
                <input
                  type="number"
                  value={editBookIncome}
                  onChange={(e) => setEditBookIncome(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden font-mono"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.openingBalanceLabel}
                </label>
                <input
                  type="number"
                  value={editBookOpeningBalance}
                  onChange={(e) => setEditBookOpeningBalance(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden font-mono"
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6 bg-white">
                <button
                  type="button"
                  onClick={() => setShowEditBookModal(false)}
                  className="flex-1 py-3 text-center border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                >
                  {language === 'urdu' ? 'کینسل' : language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  {t.updateBookBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD EXPENSE ENTRY ================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 animate-fade-in" id="add-expense-modal">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col p-6 max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span>➕</span>
                <span>{t.addExpenseTitle}</span>
              </h3>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 overflow-y-auto pr-1">
              {expenseError && (
                <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-semibold flex items-start gap-2 animate-pulse">
                  <span className="text-sm">⚠️</span>
                  <span>{expenseError}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t.dateLabel}
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden disabled:opacity-50"
                    required
                    disabled={isSavingExpense}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden cursor-pointer disabled:opacity-50"
                    required
                    disabled={isSavingExpense}
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {t.categories[cat as keyof typeof t.categories] || cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.descriptionLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.descriptionPlaceholder}
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden disabled:opacity-50"
                  required
                  disabled={isSavingExpense}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.amountLabel}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden font-mono disabled:opacity-50"
                  required
                  min="1"
                  disabled={isSavingExpense}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.notesLabel}
                </label>
                <textarea
                  placeholder={t.notePlaceholder}
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:outline-hidden h-20 resize-none disabled:opacity-50"
                  disabled={isSavingExpense}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="flex-1 py-3 text-center border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer disabled:opacity-50"
                  disabled={isSavingExpense}
                >
                  {language === 'urdu' ? 'کینسل' : language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isSavingExpense}
                >
                  {isSavingExpense ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>{language === 'urdu' ? 'محفوظ ہو رہا ہے...' : language === 'hindi' ? 'सहेजा जा रहा है...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{t.addExpenseBtn}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
