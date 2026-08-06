import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Ledger, Transaction, TransactionType, SimulatedContact } from '../types';
import { 
  ArrowLeft, Plus, Search, Calendar, Phone, Trash2, CalendarCheck, CheckCircle2,
  Share2, ArrowDownLeft, ArrowUpRight, PlusCircle, Smile, HelpCircle, Save, Filter,
  User, ChevronRight, FileDown, Pencil, MessageCircle, ChevronDown
} from 'lucide-react';
import ContactPicker from './ContactPicker';
import { translations, translatePresetName, translatePresetDesc, translatePresetText } from '../utils/translations';

interface LedgerDetailProps {
  ledger: Ledger;
  transactions: Transaction[];
  onBack: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'ledgerId' | 'userId'>) => void;
  onDeleteTransaction: (id: string) => void;
  onDeletePersonTransactions?: (personName: string, ledgerId: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  language?: 'english' | 'urdu' | 'hindi';
  triggerConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}

export default function LedgerDetail({
  ledger,
  transactions,
  onBack,
  onAddTransaction,
  onDeleteTransaction,
  onDeletePersonTransactions,
  onUpdateTransaction,
  language = 'english',
  triggerConfirm
}: LedgerDetailProps) {
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'given' | 'received'>('all');

  // New Transaction Form State
  const [personName, setPersonName] = useState('');
  const [personMobile, setPersonMobile] = useState('');
  const [personWhatsApp, setPersonWhatsApp] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('Loan');
  const [txNature, setTxNature] = useState<'given' | 'received'>('given'); // 'given': lent, 'received': borrowed
  const [itemDetails, setItemDetails] = useState(''); // e.g. "Dinner Set", "Cash"
  const [txDate, setTxDate] = useState(() => new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:MM
  const [notes, setNotes] = useState('');

  // Custom Transaction Types (users can create unlimited custom transaction types)
  const [customTxTypes, setCustomTxTypes] = useState<string[]>([
    'Loan', 'Borrow', 'Return', 'Cash', 'Gift', 'Contribution', 'Expense'
  ]);
  const [newCustomType, setNewCustomType] = useState('');
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);

  // Edit Transaction Form State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editPersonName, setEditPersonName] = useState('');
  const [editPersonMobile, setEditPersonMobile] = useState('');
  const [editPersonWhatsApp, setEditPersonWhatsApp] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editTxType, setEditTxType] = useState<TransactionType>('Loan');
  const [editTxNature, setEditTxNature] = useState<'given' | 'received'>('given');
  const [editItemDetails, setEditItemDetails] = useState('');
  const [editTxDate, setEditTxDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showEditContactPicker, setShowEditContactPicker] = useState(false);

  // View state (grouped by default, per client directive)
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(null);
  const [expandedPeople, setExpandedPeople] = useState<Record<string, boolean>>({});

  // Language Translations mapping based on prop
  const texts = translations[language];

  const togglePersonExpanded = (name: string) => {
    if (selectedPersonName === name) {
      setSelectedPersonName(null);
    } else {
      setSelectedPersonName(name);
    }
    setExpandedPeople(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleStartEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditPersonName(tx.personName);
    setEditPersonMobile(tx.personMobile || '');
    setEditPersonWhatsApp(tx.personWhatsApp || '');
    setEditAmount(String(tx.amount));
    setEditTxType(tx.type);
    setEditTxNature(tx.nature);
    setEditItemDetails(tx.itemDetails || '');
    setEditNotes(tx.notes || '');
    
    let formattedDate = tx.date;
    if (tx.date && tx.date.length >= 16) {
      formattedDate = tx.date.substring(0, 16);
    }
    setEditTxDate(formattedDate);
  };

  const handleEditTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editPersonName.trim() || !editAmount) return;

    onUpdateTransaction({
      ...editingTx,
      personName: editPersonName.trim(),
      personMobile: editPersonMobile.trim() || undefined,
      personWhatsApp: editPersonWhatsApp.trim() || undefined,
      amount: Number(editAmount) || 0,
      type: editTxType,
      nature: editTxNature,
      itemDetails: editItemDetails.trim() || undefined,
      date: editTxDate || new Date().toISOString(),
      notes: editNotes.trim() || undefined
    });

    setEditingTx(null);
  };

  // Filter local ledger transactions
  const ledgerTx = transactions.filter(t => t.ledgerId === ledger.id);
  
  const totalGiven = ledgerTx.filter(t => t.nature === 'given').reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = ledgerTx.filter(t => t.nature === 'received').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalGiven - totalReceived; // positive: they owe you; negative: you owe them

  const filteredTx = ledgerTx
    .filter(t => {
      // search filter
      const matchesSearch = 
        t.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.itemDetails || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // nature filter
      const matchesNature = 
        activeFilter === 'all' || 
        (activeFilter === 'given' && t.nature === 'given') || 
        (activeFilter === 'received' && t.nature === 'received');

      return matchesSearch && matchesNature;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest first

  // Group by person
  const groupedByName: Record<string, Transaction[]> = {};
  filteredTx.forEach(tx => {
    const name = tx.personName.trim();
    if (!groupedByName[name]) {
      groupedByName[name] = [];
    }
    groupedByName[name].push(tx);
  });

  const groupedPeople = Object.keys(groupedByName).map(name => {
    const txs = groupedByName[name];
    const given = txs.filter(t => t.nature === 'given').reduce((sum, t) => sum + t.amount, 0);
    const received = txs.filter(t => t.nature === 'received').reduce((sum, t) => sum + t.amount, 0);
    const withDetails = txs.find(t => t.personMobile || t.personWhatsApp);
    return {
      personName: name,
      personMobile: withDetails?.personMobile,
      personWhatsApp: withDetails?.personWhatsApp,
      transactions: txs,
      totalGiven: given,
      totalReceived: received,
      netBalance: given - received
    };
  });

  const peopleCount = groupedPeople.length;
  const toCollectAmount = groupedPeople
    .filter(gp => gp.netBalance > 0)
    .reduce((sum, gp) => sum + gp.netBalance, 0);
  const toPayAmount = groupedPeople
    .filter(gp => gp.netBalance < 0)
    .reduce((sum, gp) => sum + Math.abs(gp.netBalance), 0);

  const handleCreateCustomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomType.trim()) return;
    if (!customTxTypes.includes(newCustomType.trim())) {
      setCustomTxTypes([...customTxTypes, newCustomType.trim()]);
    }
    setTxType(newCustomType.trim());
    setNewCustomType('');
    setShowCustomTypeInput(false);
  };

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !amount) return;

    onAddTransaction({
      personName: personName.trim(),
      personMobile: personMobile.trim() || undefined,
      personWhatsApp: personWhatsApp.trim() || undefined,
      amount: Number(amount) || 0,
      type: txType,
      nature: txNature,
      itemDetails: itemDetails.trim() || undefined,
      date: txDate || new Date().toISOString(),
      notes: notes.trim() || undefined
    });

    // Reset forms
    setPersonName('');
    setPersonMobile('');
    setPersonWhatsApp('');
    setAmount('');
    setTxType('Loan');
    setTxNature('given');
    setItemDetails('');
    setNotes('');
    setTxDate(new Date().toISOString().substring(0, 16));
    setShowAddTxModal(false);
  };

  const handleSelectSimulatedContact = (contact: SimulatedContact) => {
    setPersonName(contact.name);
    setPersonMobile(contact.mobile);
    setPersonWhatsApp(contact.whatsapp);
  };

  const handleQuickAddTx = (name: string, mobile: string | undefined, whatsapp: string | undefined, nature: 'given' | 'received') => {
    setPersonName(name);
    setPersonMobile(mobile || '');
    setPersonWhatsApp(whatsapp || '');
    setTxNature(nature);
    setTxType(nature === 'given' ? 'Loan' : 'Borrow');
    setShowAddTxModal(true);
  };

  const generateWhatsAppShareLink = (tx: Transaction, fallbackWhatsApp?: string) => {
    const textMsg = encodeURIComponent(
      `⭐ *SaveLedger Entry notification* ⭐\n\n` +
      `Assalam-o-Alaikum,\n` +
      `This is a friendly ledger record update on account of: *${tx.personName}*\n\n` +
      `📁 *Ledger:* ${ledger.name}\n` +
      `💰 *Amount:* Rs. ${tx.amount.toLocaleString()} PKR\n` +
      `📦 *Entry Type:* ${tx.type}\n` +
      `📅 *Date:* ${new Date(tx.date).toLocaleDateString('en-PK')}\n` +
      `ℹ️ *Details:* ${tx.itemDetails || 'Cash record'}\n` +
      `${tx.notes ? `📝 *Memo:* ${tx.notes}\n` : ''}\n` +
      `Status: *${tx.nature === 'given' ? 'You Received / Lent from ' + userShort() : 'You paid / Returned to ' + userShort()}*\n` +
      `Saved safely in digital SaveLedger app.`
    );
    const num = tx.personWhatsApp || fallbackWhatsApp || '';
    return `https://wa.me/${num.replace(/[^0-9]/g, '') || ''}?text=${textMsg}`;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'P';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  };

  const getLastActivityDate = (gp: any, lang: string) => {
    if (!gp.transactions || gp.transactions.length === 0) return '';
    const dateObj = new Date(gp.transactions[0].date);
    return dateObj.toLocaleDateString(lang === 'urdu' ? 'ur-PK' : lang === 'hindi' ? 'hi-IN' : 'en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const generatePersonWhatsAppLink = (gp: any) => {
    let textHeader = '';
    let textFooter = '';
    let textBookName = '';
    let textNetBalance = '';
    let textEntriesHeader = '';
    let transactionLines = '';

    const cleanPhone = gp.personWhatsApp ? gp.personWhatsApp.replace(/[^0-9]/g, '') : '';
    const translatedPersonName = translatePresetName(gp.personName, language);
    const translatedLedgerName = translatePresetName(ledger.name, language);

    if (language === 'urdu') {
      textHeader = `⭐ *ڈیجیٹل ٹرسٹ بک کھاتہ رپورٹ* ⭐\n\nمحترم/محترمہ *${translatedPersonName}*،\nامید ہے آپ خیریت سے ہوں گے۔ یہ ہماری کھاتہ بک کا ایک خلاصہ ہے:\n\n`;
      textBookName = `📁 *کھاتہ کتاب:* ${translatedLedgerName}\n`;
      textEntriesHeader = `📝 *تفصیلات (اینٹریز):*\n`;

      gp.transactions.forEach((tx: Transaction, i: number) => {
        const isGiven = tx.nature === 'given';
        const typeStr = translatePresetName(tx.type, 'urdu') + (isGiven ? ' (دیا گیا)' : ' (موصول ہوا)');
        const itemStr = tx.itemDetails ? ` [تفصیل: ${translatePresetName(tx.itemDetails, 'urdu')}]` : '';
        const notesStr = tx.notes ? ` (${translatePresetText(tx.notes, 'urdu')})` : '';
        const dateStr = new Date(tx.date).toLocaleDateString('en-PK');
        transactionLines += `${i + 1}. 📅 ${dateStr} - *${typeStr}*: Rs. ${tx.amount.toLocaleString()}${itemStr}${notesStr}\n`;
      });

      const net = gp.netBalance;
      if (net > 0) {
        textNetBalance = `\n💰 *بقایا رقم:* آپ نے ہمیں دینے ہیں *Rs. ${net.toLocaleString()}*\n`;
      } else if (net < 0) {
        textNetBalance = `\n💰 *بقایا رقم:* ہم نے آپ کو دینے ہیں *Rs. ${Math.abs(net).toLocaleString()}*\n`;
      } else {
        textNetBalance = `\n💰 *بقایا رقم:* حساب برابر ہے (بے باق)۔\n`;
      }

      textFooter = `\nشکریہ۔ محفوظ ڈیجیٹل کسٹمر کھاتہ بک۔`;
    } else if (language === 'hindi') {
      textHeader = `⭐ *डिजिटल ट्रस्ट बुक बहीखाता रिपोर्ट* ⭐\n\nप्रिय *${translatedPersonName}*,\nआशा है आप स्वस्थ होंगे। यहाँ हमारे बहीखाते का विवरण दिया गया है:\n\n`;
      textBookName = `📁 *बहीखाता पुस्तक:* ${translatedLedgerName}\n`;
      textEntriesHeader = `📝 *विवरण (एंट्रीज):*\n`;

      gp.transactions.forEach((tx: Transaction, i: number) => {
        const isGiven = tx.nature === 'given';
        const typeStr = translatePresetName(tx.type, 'hindi') + (isGiven ? ' (दिया)' : ' (लिया)');
        const itemStr = tx.itemDetails ? ` [विवरण: ${translatePresetName(tx.itemDetails, 'hindi')}]` : '';
        const notesStr = tx.notes ? ` (${translatePresetText(tx.notes, 'hindi')})` : '';
        const dateStr = new Date(tx.date).toLocaleDateString('en-PK');
        transactionLines += `${i + 1}. 📅 ${dateStr} - *${typeStr}*: Rs. ${tx.amount.toLocaleString()}${itemStr}${notesStr}\n`;
      });

      const net = gp.netBalance;
      if (net > 0) {
        textNetBalance = `\n💰 *कुल शेष:* आपको हमें देना है *Rs. ${net.toLocaleString()}*\n`;
      } else if (net < 0) {
        textNetBalance = `\n💰 *कुल शेष:* हमें आपको देना है *Rs. ${Math.abs(net).toLocaleString()}*\n`;
      } else {
        textNetBalance = `\n💰 *कुल शेष:* हिसाब बराबर है।\n`;
      }

      textFooter = `\nधन्यवाद। सुरक्षित डिजिटल बहीखाता ऐप।`;
    } else {
      textHeader = `⭐ *SaveLedger Statement* ⭐\n\nDear *${translatedPersonName}*,\nHope you are doing well. Here is a summary of our account statement:\n\n`;
      textBookName = `📁 *Ledger Book:* ${translatedLedgerName}\n`;
      textEntriesHeader = `📝 *Details (Entries):*\n`;

      gp.transactions.forEach((tx: Transaction, i: number) => {
        const isGiven = tx.nature === 'given';
        const typeStr = tx.type + (isGiven ? ' (Lent/Paid)' : ' (Borrowed/Received)');
        const itemStr = tx.itemDetails ? ` [Item: ${tx.itemDetails}]` : '';
        const notesStr = tx.notes ? ` (${tx.notes})` : '';
        const dateStr = new Date(tx.date).toLocaleDateString('en-PK');
        transactionLines += `${i + 1}. 📅 ${dateStr} - *${typeStr}*: Rs. ${tx.amount.toLocaleString()}${itemStr}${notesStr}\n`;
      });

      const net = gp.netBalance;
      if (net > 0) {
        textNetBalance = `\n💰 *Net Balance:* You owe us *Rs. ${net.toLocaleString()}*\n`;
      } else if (net < 0) {
        textNetBalance = `\n💰 *Net Balance:* We owe you *Rs. ${Math.abs(net).toLocaleString()}*\n`;
      } else {
        textNetBalance = `\n💰 *Net Balance:* Settled / Clean page.\n`;
      }

      textFooter = `\nThank you. Saved digitally on SaveLedger app.`;
    }

    const fullMessage = encodeURIComponent(textHeader + textBookName + textEntriesHeader + transactionLines + textNetBalance + textFooter);
    return `https://wa.me/${cleanPhone}?text=${fullMessage}`;
  };

  const downloadPersonPDF = (gp: any) => {
    const doc = new jsPDF();
    
    // Header banner
    doc.setFillColor(15, 23, 42); // deep slate/black
    doc.rect(0, 0, 210, 42, 'F');
    
    // Logo / Brand name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("SAVELEDGER", 15, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // silver slate
    doc.text("DIGITAL LEDGER SYSTEM", 15, 25);
    
    // App summary context
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Statement Date: ${new Date().toLocaleDateString('en-PK')} ${new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}`, 15, 34);
    doc.text(`Ledger Book: ${ledger.name}`, 195, 34, { align: 'right' });

    // Customer/Party Block
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, 50, 180, 28, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(15, 50, 180, 28, 'D');

    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CUSTOMER / PARTY DETAILS:", 20, 57);

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    const resolvedName = translatePresetName(gp.personName, 'english');
    doc.text(resolvedName, 20, 64);

    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const contactInfo = [
      gp.personMobile ? `Mobile: ${gp.personMobile}` : '',
      gp.personWhatsApp ? `WhatsApp: ${gp.personWhatsApp}` : ''
    ].filter(Boolean).join(" | ");
    doc.text(contactInfo || "No contact info available", 20, 71);

    // Summary tiles (Given, Received, Net Balance)
    // Card 1: Total Given
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.rect(15, 84, 56, 20, 'F');
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.rect(15, 84, 56, 20, 'D');
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("TOTAL LENT / GIVEN", 19, 89);
    doc.setFontSize(12);
    doc.text(`Rs. ${gp.totalGiven.toLocaleString()}`, 19, 97);

    // Card 2: Total Received
    doc.setFillColor(254, 251, 237); // amber-50
    doc.rect(77, 84, 56, 20, 'F');
    doc.setDrawColor(253, 244, 201); // amber-200
    doc.rect(77, 84, 56, 20, 'D');
    doc.setTextColor(146, 64, 14); // amber-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("TOTAL BORROWED / RECD", 81, 89);
    doc.setFontSize(12);
    doc.text(`Rs. ${gp.totalReceived.toLocaleString()}`, 81, 97);

    // Card 3: Net Balance
    const net = gp.netBalance;
    let netBg = 241; // slate-100 default
    let netDraw = 226;
    let netTextR = 71, netTextG = 85, netTextB = 105;
    let balanceLabel = "NET BALANCE (SETTLED)";
    let balanceValue = "Rs. 0";

    if (net > 0) {
      netBg = 236; // emerald-50
      netDraw = 167;
      netTextR = 4; netTextG = 120; netTextB = 87; // emerald-600
      balanceLabel = "THEY OWE YOU";
      balanceValue = `Rs. ${net.toLocaleString()}`;
    } else if (net < 0) {
      netBg = 254; // rose-50
      netDraw = 254;
      netTextR = 225; netTextG = 29; netTextB = 72; // rose-600
      balanceLabel = "WE OWE THEM";
      balanceValue = `Rs. ${Math.abs(net).toLocaleString()}`;
    }

    doc.setFillColor(netBg === 254 && netDraw === 254 ? 254 : netBg, netBg === 254 && netDraw === 254 ? 242 : netBg, netBg === 254 && netDraw === 254 ? 242 : netBg);
    doc.rect(139, 84, 56, 20, 'F');
    doc.setDrawColor(netBg === 254 && netDraw === 254 ? 254 : netDraw, netBg === 254 && netDraw === 254 ? 205 : netDraw, netBg === 254 && netDraw === 254 ? 211 : netDraw);
    doc.rect(139, 84, 56, 20, 'D');
    doc.setTextColor(netTextR, netTextG, netTextB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(balanceLabel, 143, 89);
    doc.setFontSize(12);
    doc.text(balanceValue, 143, 97);

    // Table Header
    doc.setFillColor(15, 23, 42); // slate-900 table header
    doc.rect(15, 112, 180, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Date", 18, 117.5);
    doc.text("Type / Tag", 42, 117.5);
    doc.text("Details & Notes", 72, 117.5);
    doc.text("Cash Out (Lent)", 132, 117.5);
    doc.text("Cash In (Recd)", 165, 117.5);

    let yPosition = 120;
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont("helvetica", "normal");

    gp.transactions.forEach((tx: Transaction, index: number) => {
      // Row striping background
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPosition, 180, 8, 'F');
      }
      doc.setDrawColor(241, 245, 249);
      doc.line(15, yPosition + 8, 195, yPosition + 8);

      const isGiven = tx.nature === 'given';
      const dateStr = new Date(tx.date).toLocaleDateString('en-PK');
      
      // Values drawing
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(dateStr, 18, yPosition + 5.5);
      doc.text(translatePresetName(tx.type, 'english'), 42, yPosition + 5.5);
      
      let detailParts = [];
      if (tx.itemDetails) detailParts.push(`Gift Item: ${translatePresetName(tx.itemDetails, 'english')}`);
      if (tx.notes) detailParts.push(translatePresetText(tx.notes, 'english'));
      let detailStr = detailParts.join(" | ");
      if (detailStr.length > 33) detailStr = detailStr.substring(0, 31) + '...';
      doc.text(detailStr || "-", 72, yPosition + 5.5);

      if (isGiven) {
        doc.setFont("helvetica", "bold");
        doc.text(`Rs. ${tx.amount.toLocaleString()}`, 132, yPosition + 5.5);
        doc.setFont("helvetica", "normal");
        doc.text("-", 165, yPosition + 5.5);
      } else {
        doc.text("-", 132, yPosition + 5.5);
        doc.setFont("helvetica", "bold");
        doc.text(`Rs. ${tx.amount.toLocaleString()}`, 165, yPosition + 5.5);
      }

      yPosition += 8;

      // New page trigger
      if (yPosition > 265) {
        doc.addPage();
        yPosition = 20;

        // Redraw table headers on new page
        doc.setFillColor(15, 23, 42);
        doc.rect(15, yPosition, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Date", 18, yPosition + 5.5);
        doc.text("Type / Tag", 42, yPosition + 5.5);
        doc.text("Details & Notes", 72, yPosition + 5.5);
        doc.text("Cash Out (Lent)", 132, yPosition + 5.5);
        doc.text("Cash In (Recd)", 165, yPosition + 5.5);
        yPosition += 8;
        doc.setTextColor(51, 65, 85);
        doc.setFont("helvetica", "normal");
      }
    });

    // Elegant Sign-off
    const docHeight = doc.internal.pageSize.getHeight();
    const finalY = yPosition + 12 > docHeight - 30 ? docHeight - 30 : yPosition + 12;
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, finalY, 195, finalY);
    
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("This is a digitally generated copy of the transaction records from your SaveLedger app and requires no physical signature.", 15, finalY + 6);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Thank you for using SaveLedger!", 15, finalY + 12);

    doc.save(`Ledger_Statement_${gp.personName.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadSingleTransactionPDF = (tx: Transaction, gp: any) => {
    const doc = new jsPDF();
    
    // Header banner
    doc.setFillColor(15, 23, 42); // deep slate/black
    doc.rect(0, 0, 210, 42, 'F');
    
    // Logo / Brand name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("SAVELEDGER", 15, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("DIGITAL TRANSACTION RECEIPT", 15, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Receipt Date: ${new Date().toLocaleDateString('en-PK')} ${new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}`, 15, 34);
    doc.text(`Ledger Book: ${ledger.name}`, 195, 34, { align: 'right' });

    // Customer/Party Block
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, 50, 180, 28, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(15, 50, 180, 28, 'D');

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CUSTOMER / PARTY DETAILS:", 20, 57);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    const resolvedName = translatePresetName(gp.personName, 'english');
    doc.text(resolvedName, 20, 64);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const contactInfo = [
      gp.personMobile ? `Mobile: ${gp.personMobile}` : '',
      gp.personWhatsApp ? `WhatsApp: ${gp.personWhatsApp}` : ''
    ].filter(Boolean).join(" | ");
    doc.text(contactInfo || "No contact info available", 20, 71);

    // Transaction Details Header
    doc.setFillColor(15, 23, 42);
    doc.rect(15, 85, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("ENTRY KEY", 20, 90.5);
    doc.text("DETAILS / VALUES", 190, 90.5, { align: 'right' });

    // Fields list
    const items = [
      { key: "Entry Party:", val: gp.personName },
      { key: "Entry Type:", val: tx.type },
      { key: "Nature / Flow:", val: tx.nature === 'given' ? "Cash Given / Lent (+)" : "Cash Received / Borrowed (-)" },
      { key: "Date & Time:", val: new Date(tx.date).toLocaleString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
      { key: "Goods / Items details:", val: tx.itemDetails || "N/A (Pure Cash)" },
      { key: "Memo / Notes:", val: tx.notes || "No remarks" }
    ];

    let currentY = 100;
    doc.setFontSize(9);
    items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, currentY - 5, 180, 8, 'F');
      }
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text(item.key, 20, currentY);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.text(String(item.val), 80, currentY);
      currentY += 8;
    });

    // Divider
    currentY += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, currentY, 195, currentY);
    currentY += 8;

    // Total Amount Card
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("ENTRY AMOUNT:", 20, currentY);
    
    if (tx.nature === 'given') {
      doc.setTextColor(16, 120, 87);
    } else {
      doc.setTextColor(225, 29, 72);
    }
    const valStr = `${tx.nature === 'given' ? '+' : '-'} Rs. ${tx.amount.toLocaleString()}`;
    doc.text(valStr, 190, currentY, { align: 'right' });

    // Nice signature section or fine print
    currentY += 40;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, currentY, 65, currentY);
    doc.line(145, currentY, 195, currentY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Issuer Signature", 40, currentY + 5, { align: 'center' });
    doc.text("Receiver Signature", 170, currentY + 5, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("This receipt is computer-generated and requires no physical signature.", 105, 280, { align: 'center' });

    doc.save(`Receipt-${tx.personName.replace(/\s+/g, '-')}-${tx.id.substring(0, 5)}.pdf`);
  };

  const userShort = () => "SaveLedger User";

  return (
    <div className="space-y-6 animate-fade-in" id="ledger-detail-container">
      
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedPersonName) {
                setSelectedPersonName(null);
                setExpandedPeople({});
              } else {
                onBack();
              }
            }}
            className="p-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all"
            id="back-to-ledgers-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{texts.activeLedgerBookSub}</span>
            <h2 className="text-xl font-bold text-slate-800 leading-tight flex items-center gap-2 mt-0.5">
              <span>{translatePresetName(ledger.name, language)}</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            // Set default nature depending on current filters or default to given
            setTxNature('given');
            setShowAddTxModal(true);
          }}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
          id="add-entry-trigger"
        >
          <Plus className="w-4 h-4" />
          <span>{texts.addTransactionBtn}</span>
        </button>
      </div>

      {/* Ledger Stats card - Total Given & Total Received */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg border border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y-0 lg:divide-y-0 lg:divide-x divide-slate-850 animate-fade-in">
        
        <div className="pb-4 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-500 text-sm">🟢</span>
            <span>{language === 'urdu' ? 'وصول طلب رقم' : language === 'hindi' ? 'प्राप्त करने योग्य राशि' : 'Money to Receive'}</span>
          </span>
          <p className="text-xl sm:text-2xl md:text-3xl font-black mt-1.5 text-emerald-400">Rs. {toCollectAmount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {language === 'urdu' ? 'وصول کرنے والی رقم' : language === 'hindi' ? 'पैसे कलेक्ट करने हैं' : 'Money to collect.'}
          </p>
        </div>

        <div className="py-0 sm:py-0 md:pl-0 lg:pl-6 border-slate-800">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <span className="text-rose-500 text-sm">🔴</span>
            <span>{language === 'urdu' ? 'قابلِ ادائیگی رقم' : language === 'hindi' ? 'देय राशि' : 'Money to Pay'}</span>
          </span>
          <p className="text-xl sm:text-2xl md:text-3xl font-black mt-1.5 text-rose-400">Rs. {toPayAmount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {language === 'urdu' ? 'واپس کرنے والی رقم' : language === 'hindi' ? 'पैसे वापस देने हैं' : 'Money to repay.'}
          </p>
        </div>

        <div className="py-0 sm:py-0 md:pl-0 lg:pl-6 border-slate-800">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
            <span>{language === 'urdu' ? 'خالص بقایا جات' : language === 'hindi' ? 'कुल शेष राशि' : 'Net Balance'}</span>
          </span>
          <p className={`text-xl sm:text-2xl md:text-3xl font-black mt-1.5 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Rs. {Math.abs(balance).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {balance >= 0 
              ? (language === 'urdu' ? 'آپ کو رقم ملنی ہے' : language === 'hindi' ? 'आपको पैसे मिलेंगे' : 'You will receive money') 
              : (language === 'urdu' ? 'آپ نے رقم ادا کرنی ہے' : language === 'hindi' ? 'आपको पैसे देने हैं' : 'You need to pay')
            }
          </p>
        </div>

        <div className="py-0 sm:py-0 md:pl-0 lg:pl-6 border-slate-800">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <User className="w-4 h-4 text-sky-450" />
            <span className="uppercase">{language === 'urdu' ? 'کل رابطے' : language === 'hindi' ? 'कुल संपर्क' : 'TOTAL CONTACTS'}</span>
          </span>
          <p className="text-xl sm:text-2xl md:text-3xl font-black mt-1.5 text-sky-400 border-slate-800">
            {peopleCount} {peopleCount === 1 
              ? (language === 'urdu' ? 'شخص' : language === 'hindi' ? 'व्यक्ति' : 'Person') 
              : (language === 'urdu' ? 'افراد' : language === 'hindi' ? 'लोग' : 'People')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {language === 'urdu' ? 'تمام کھاتہ داران' : language === 'hindi' ? 'इस बही में कुल व्यक्ति' : 'Total listed contacts.'}
          </p>
        </div>

      </div>

      {/* TIMELINE TIMELINE HISTORY - SEARCH & FILTERS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        
        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Entry History ({filteredTx.length})</h3>
            <p className="text-xs text-slate-500">View all payments, loans, returns, and cash entries in this ledger.</p>
            
            {/* View Mode Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg w-fit mt-2.5 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setViewMode('grouped');
                  setSelectedPersonName(null);
                  setExpandedPeople({});
                }}
                className={`text-xs font-bold py-1.5 px-3.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grouped' ? 'bg-white text-emerald-800 font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{texts.groupByPerson}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setSelectedPersonName(null);
                  setExpandedPeople({});
                }}
                className={`text-xs font-bold py-1.5 px-3.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-white text-emerald-800 font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{texts.dailyFeed}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ledger entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-hidden w-full text-slate-800"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveFilter('all')}
                className={`text-[10px] sm:text-xs font-semibold py-1 px-2.5 rounded-md transition-all cursor-pointer ${
                  activeFilter === 'all' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('given')}
                className={`text-[10px] sm:text-xs font-semibold py-1 px-2.5 rounded-md transition-all cursor-pointer ${
                  activeFilter === 'given' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Given
              </button>
              <button
                onClick={() => setActiveFilter('received')}
                className={`text-[10px] sm:text-xs font-semibold py-1 px-2.5 rounded-md transition-all cursor-pointer ${
                  activeFilter === 'received' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Received
              </button>
            </div>
          </div>
        </div>

        {/* Transactions timeline feed */}
        <div className="mt-6">
          {viewMode === 'grouped' ? (
            /* GROUPED BY PERSON VIEW */
            <div className="space-y-4">
              {/* Back to All Parties Button */}
              {selectedPersonName && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersonName(null);
                    setExpandedPeople({});
                  }}
                  className="mb-4 flex items-center justify-center text-xs text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-4 py-2 rounded-2xl font-black transition-all cursor-pointer shadow-xs animate-fade-in"
                >
                  <span>{texts.backToAll}</span>
                </button>
              )}

              {groupedPeople
                .filter((gp) => !selectedPersonName || gp.personName === selectedPersonName)
                .map((gp) => {
                  const isExpanded = selectedPersonName ? (selectedPersonName === gp.personName) : !!expandedPeople[gp.personName];
                  const net = gp.netBalance;
                  return (
                  <div 
                    key={gp.personName} 
                    className="border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition-all overflow-hidden shadow-xs"
                    id={`grouped-person-${gp.personName.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {/* Clickable Header */}
                    <div 
                      onClick={() => togglePersonExpanded(gp.personName)}
                      className="w-full p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center text-left gap-4 focus:outline-hidden cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar Initials with Status-specific tint styling */}
                        <div className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-[13px] sm:text-sm shrink-0 transition-all duration-200 shadow-xs uppercase ${
                          net > 0 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : net < 0 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-slate-50 text-slate-600 border-slate-250'
                        }`}>
                          {getInitials(gp.personName)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-800 text-sm sm:text-base">{translatePresetName(gp.personName, language)}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                              {gp.transactions.length} {gp.transactions.length === 1 
                                ? (language === 'urdu' ? 'اندراج' : language === 'hindi' ? 'प्रविष्टि' : 'entry') 
                                : (language === 'urdu' ? 'اندراجات' : language === 'hindi' ? 'प्रविष्टियां' : 'entries')}
                            </span>
                          </div>
                          
                          {/* Last Activity */}
                          {gp.transactions && gp.transactions.length > 0 && (
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {language === 'urdu' ? 'آخری انٹری:' : language === 'hindi' ? 'अंतिम लेनदेन:' : 'Last Activity:'} <span className="text-slate-600 font-semibold font-mono">{getLastActivityDate(gp, language)}</span>
                            </p>
                          )}

                          {(gp.personMobile || gp.personWhatsApp) && (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-slate-400 text-[10px] font-medium font-mono">
                              {gp.personMobile && <span>📞 {gp.personMobile}</span>}
                              {gp.personWhatsApp && <span>💬 WhatsApp: {gp.personWhatsApp}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 mt-1 lg:mt-0 justify-between">
                        {/* Dynamic Colored Status Badge */}
                        <div className="flex items-center">
                          {net > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-100/80 shadow-xs uppercase tracking-wide">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              {language === 'urdu' ? 'وصول کریں:' : language === 'hindi' ? 'प्राप्त करें:' : 'Collect'} Rs. {net.toLocaleString()}
                            </span>
                          ) : net < 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-100/80 shadow-xs uppercase tracking-wide">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                              {language === 'urdu' ? 'ادائیگی کریں:' : language === 'hindi' ? 'भुगतान करें:' : 'Pay'} Rs. {Math.abs(net).toLocaleString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              {language === 'urdu' ? 'برابر ہے' : language === 'hindi' ? 'हिसाब बराबर' : 'Settled'}
                            </span>
                          )}
                        </div>

                        {/* Interactive Side-By-Side Quick Action Bar */}
                        <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 sm:pt-0">
                          {/* 1. WhatsApp Remind Button */}
                          <a
                            href={gp.personWhatsApp ? `https://wa.me/${gp.personWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              language === 'urdu' 
                                ? `محترم ${gp.personName}، یہ سیو لیجر کھاتہ یاد دہانی ہے۔ آپ کا بقایا حساب: Rs. ${Math.abs(net).toLocaleString()} ہے۔ شکریہ!` 
                                : language === 'hindi' 
                                  ? `नमस्ते ${gp.personName}, यह सेव लेजर खाता अनुस्मारक है। आपका शेष: Rs. ${Math.abs(net).toLocaleString()} है। धन्यवाद!` 
                                  : `Hello ${gp.personName}, this is a quick ledger reminder on your account from SaveLedger. Net standing balance is Rs. ${Math.abs(net).toLocaleString()}. Thank you!`
                            )}` : '#'}
                            target={gp.personWhatsApp ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!gp.personWhatsApp) {
                                alert(language === 'urdu' ? 'براہ کرم اس کسٹمر کا واٹس ایپ نمبر درج کریں۔' : language === 'hindi' ? 'कृपया इस संपर्क का व्हाट्सएप नंबर दर्ज करें।' : 'Please add a WhatsApp number for this contact first.');
                              }
                            }}
                            className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                              gp.personWhatsApp 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' 
                                : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                            }`}
                            title={language === 'urdu' ? 'واٹس ایپ یاد دہانی رپورٹ بھیجیں' : language === 'hindi' ? 'व्हाट्सएप अनुस्मारक भेजें' : 'Send WhatsApp Reminder'}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* 2. Share Full Statement Statement Details */}
                          <a
                            href={generatePersonWhatsAppLink(gp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center p-2 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-250 rounded-xl transition-all shrink-0 cursor-pointer"
                            title={language === 'urdu' ? 'مکمل رپورٹ شیئر کریں' : language === 'hindi' ? 'बहीखाता शेयर करें' : 'Share Statement Report'}
                          >
                            <Share2 className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600" />
                          </a>

                          {/* 3. PDF Statement Download */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadPersonPDF(gp);
                            }}
                            className="flex items-center justify-center p-2 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-250 rounded-xl transition-all shrink-0 cursor-pointer"
                            title={language === 'urdu' ? 'پی ڈی ایف ڈاؤن لوڈ کریں' : language === 'hindi' ? 'पीडीएफ डाउनलोड करें' : 'Download PDF Statement'}
                          >
                            <FileDown className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                          </button>

                          {/* 4. Delete Party button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const title = language === 'urdu' ? 'پورا کھاتہ اور نام حذف کریں' : language === 'hindi' ? 'पूरा बहीखाता और नाम हटाएं' : 'Delete Name Card';
                              const confirmMsg = language === 'urdu' 
                                ? `کیا آپ "${gp.personName}" کے تمام کھاتہ ریکارڈز اور ان کا نام حذف کرنا چاہتے ہیں؟` 
                                : language === 'hindi' 
                                  ? `क्या आप "${gp.personName}" के सभी बहीखाता रिकॉर्ड और उनका नाम हटाना चाहते हैं?` 
                                  : `Are you sure you want to delete "${gp.personName}" and all their entry records?`;
                              
                              const doDelete = () => {
                                if (onDeletePersonTransactions) {
                                  onDeletePersonTransactions(gp.personName, ledger.id);
                                } else {
                                  gp.transactions.forEach((tx: any) => {
                                    onDeleteTransaction(tx.id);
                                  });
                                }
                              };

                              if (triggerConfirm) {
                                triggerConfirm(title, confirmMsg, doDelete);
                              } else {
                                if (confirm(confirmMsg)) {
                                  doDelete();
                                }
                              }
                            }}
                            className="flex items-center justify-center p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all shadow-xs cursor-pointer select-none shrink-0 border border-rose-100"
                            title={language === 'urdu' ? 'پورا کھاتہ اور نام حذف کریں' : language === 'hindi' ? 'पूरा बहीखाता और नाम हटाएं' : 'Delete Name Entry and all Records'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* 5. Chevron expand visual state */}
                          <div className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-slate-400 shrink-0">
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Nested Transactions Panel */}
                    {isExpanded && (
                      <div className="bg-white border-t border-slate-100 p-4 space-y-4" id={`expanded-actions-${gp.personName.replace(/\s+/g, '-').toLowerCase()}`}>
                        
                        {/* Quick Given / Received entry buttons */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-slate-50 border border-slate-100 gap-3">
                          <div className="text-left">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                              {language === 'urdu' ? 'فوری نیا اندراج' : language === 'hindi' ? 'त्वरित नई प्रविष्टि' : 'QUICK ADD'}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              {language === 'urdu' 
                                ? `${translatePresetName(gp.personName, language)} کے لیے ایک نیا اندراج شامل کریں:` 
                                : language === 'hindi' 
                                  ? `${translatePresetName(gp.personName, language)} के लिए एक नया लेनदेन जोड़ें:` 
                                  : `Add a new entry for ${gp.personName}:`}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAddTx(gp.personName, gp.personMobile, gp.personWhatsApp, 'given');
                              }}
                              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 hover:border-emerald-600 font-extrabold rounded-xl text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-3xs whitespace-nowrap"
                              id={`quick-give-${gp.personName.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                              <span className="whitespace-nowrap">
                                {language === 'urdu' ? 'رقم دی' : language === 'hindi' ? 'पैसे दिए' : 'Give Cash'}
                              </span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAddTx(gp.personName, gp.personMobile, gp.personWhatsApp, 'received');
                              }}
                              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 border border-amber-250 hover:border-amber-550 font-extrabold rounded-xl text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-3xs whitespace-nowrap"
                              id={`quick-receive-${gp.personName.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                              <span className="whitespace-nowrap">
                                {language === 'urdu' ? 'رقم لی' : language === 'hindi' ? 'पैसे लिए' : 'Receive Cash'}
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 py-1">
                          {gp.transactions.map((tx) => {
                            const isGiven = tx.nature === 'given';
                            const whatsAppNum = tx.personWhatsApp || gp.personWhatsApp;
                            return (
                              <div key={tx.id} className="relative group/tx">
                                {/* Inner small dot */}
                                <span className={`absolute -left-[21px] top-2.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${isGiven ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                                
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-slate-50/60 border border-slate-100/40 hover:bg-slate-50 transition-colors gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                                        isGiven ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {translatePresetName(tx.type, language)} ({isGiven 
                                          ? (language === 'urdu' ? 'دی رقم' : language === 'hindi' ? 'दी गई' : 'Given') 
                                          : (language === 'urdu' ? 'لی رقم' : language === 'hindi' ? 'प्राप्त' : 'Received')})
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-slate-300" />
                                        {new Date(tx.date).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>

                                    {tx.itemDetails && (
                                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                        <span>{language === 'urdu' ? '🎁 ادائیگی برائے سامان:' : language === 'hindi' ? '🎁 भुगतान की गई वस्तु:' : '🎁 Paid with item:'}</span>
                                        <strong className="text-slate-800">{translatePresetName(tx.itemDetails, language)}</strong>
                                      </p>
                                    )}

                                    {tx.notes && (
                                      <p className="text-xs text-slate-500 italic">
                                        "{translatePresetText(tx.notes, language)}"
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-200/40 pt-2 sm:pt-0 mt-1 sm:mt-0">
                                    <div className="text-left sm:text-right">
                                      <p className={`text-sm font-extrabold ${isGiven ? 'text-emerald-700' : 'text-slate-800'}`}>
                                        {isGiven ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartEdit(tx);
                                        }}
                                        className="p-2 bg-slate-100 hover:bg-emerald-600 text-slate-500 hover:text-white rounded-xl transition-all border border-slate-200 hover:border-emerald-600 flex items-center justify-center cursor-pointer shrink-0"
                                        title={language === 'urdu' ? 'تبدیل کریں' : language === 'hindi' ? 'संपादित करें' : 'Edit'}
                                      >
                                        <Pencil className="w-3.5 h-3.5 transition-colors" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const title = language === 'urdu' ? 'اندراج حذف کریں' : language === 'hindi' ? 'प्रвиष्टि हटाएं' : 'Delete Record';
                                          const msg = language === 'urdu' ? 'کیا آپ اس کھاتہ ریکارڈ کو ہر گز حذف کرنا چاہتے ہیں؟' : language === 'hindi' ? 'क्या आप इस बहीखाता रिकॉर्ड को हमेशा के लिए हटाना चाहते हैं?' : 'Delete this ledger record irrevocably?';
                                          if (triggerConfirm) {
                                            triggerConfirm(title, msg, () => onDeleteTransaction(tx.id));
                                          } else {
                                            if (confirm(msg)) {
                                              onDeleteTransaction(tx.id);
                                            }
                                          }
                                        }}
                                        className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 hover:border-rose-600 flex items-center justify-center cursor-pointer shrink-0"
                                        title={language === 'urdu' ? 'حذف کریں' : language === 'hindi' ? 'हटाएं' : 'Delete'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 transition-colors" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* CHRONOLOGICAL DAILY FEED VIEW */
            <div className="relative border-l border-slate-100 pl-4 space-y-6">
              {filteredTx.map((tx, index) => {
                const isGiven = tx.nature === 'given';
                return (
                  <div key={tx.id} className="relative group animate-fade-in" id={`tx-timeline-item-${tx.id}`}>
                    {/* Timeline node dot */}
                    <span className={`absolute -left-[25px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow-xs flex items-center justify-center ${
                      isGiven ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}></span>

                    {/* Outer Card */}
                    <div className="bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:border-slate-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold font-mono uppercase ${
                          isGiven ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.type.substring(0, 2)}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm">{translatePresetName(tx.personName, language)}</h4>
                            <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                              isGiven ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {translatePresetName(tx.type, language)} ({isGiven 
                                ? (language === 'urdu' ? 'دی رقم' : language === 'hindi' ? 'दी गई' : 'Given') 
                                : (language === 'urdu' ? 'لی رقم' : language === 'hindi' ? 'प्राप्त' : 'Received')})
                            </span>
                          </div>

                          {/* Phone mobile details */}
                          {(tx.personMobile || tx.personWhatsApp) && (
                            <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1.5">
                              {tx.personMobile && <span>{language === 'urdu' ? 'موبائل' : language === 'hindi' ? 'मोबाइल' : 'Mobile'}: {tx.personMobile}</span>}
                              {tx.personWhatsApp && <span>• WhatsApp: {tx.personWhatsApp}</span>}
                            </p>
                          )}

                          {/* Items Details (e.g. glass set, tea set) */}
                          {tx.itemDetails && (
                            <div className="bg-white py-1 px-2 border border-slate-100 rounded-sm mt-1.5 text-xs inline-flex items-center gap-1 select-none text-slate-600 font-medium">
                              <span>{language === 'urdu' ? '🎁 ادائیگی برائے سامان:' : language === 'hindi' ? '🎁 भुगतान की गई वस्तु:' : '🎁 Paid with item:'} <strong>{translatePresetName(tx.itemDetails, language)}</strong></span>
                            </div>
                          )}

                          {/* Notes / Memos */}
                          {tx.notes && (
                            <p className="text-xs text-slate-500 italic mt-1.5">
                              "{translatePresetText(tx.notes, language)}"
                            </p>
                          )}

                          {/* Date Stamp */}
                          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(tx.date).toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right hand values & share buttons */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 gap-2 border-t sm:border-t-0 border-slate-200/50 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className={`text-base font-black ${isGiven ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {isGiven ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {isGiven 
                              ? (language === 'urdu' ? 'ادائیگی (کیش آؤٹ)' : language === 'hindi' ? 'नकद भुगतान (कैश आउट)' : 'Lent/Cash out') 
                              : (language === 'urdu' ? 'وصولی (کیش ان)' : language === 'hindi' ? 'नकद प्राप्त (कैश इन)' : 'Borrowed/Cash in')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {tx.personWhatsApp && (
                            <a
                              href={generateWhatsAppShareLink(tx)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all border border-emerald-100 flex items-center gap-1 text-[10px]"
                              title="Share Record via WhatsApp"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(tx);
                            }}
                            className="p-2 bg-slate-100 hover:bg-emerald-600 text-slate-500 hover:text-white border border-slate-200 hover:border-emerald-600 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
                            title={language === 'urdu' ? 'تبدیل کریں' : language === 'hindi' ? 'संपादित करें' : 'Edit'}
                          >
                            <Pencil className="w-3.5 h-3.5 transition-colors" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const title = language === 'urdu' ? 'اندراج حذف کریں' : language === 'hindi' ? 'प्रविष्टि हटाएं' : 'Delete Record';
                              const msg = language === 'urdu' ? 'کیا آپ اس کھاتہ ریکارڈ کو ہر گز حذف کرنا چاہتے ہیں؟' : language === 'hindi' ? 'क्या आप इस बहीखाता ریکارڈ کو ہمیشہ کے لیے ہٹانا چاہتے ہیں؟' : 'Delete this ledger record irrevocably?';
                              if (triggerConfirm) {
                                triggerConfirm(title, msg, () => onDeleteTransaction(tx.id));
                              } else {
                                if (confirm(msg)) {
                                  onDeleteTransaction(tx.id);
                                }
                              }
                            }}
                            className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-100 hover:border-rose-600 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
                            title={language === 'urdu' ? 'حذف کریں' : language === 'hindi' ? 'हटाएं' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredTx.length === 0 && (
            <div className="text-center py-10 text-slate-500 pr-4">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">No entries match your search criteria.</p>
              <button
                onClick={() => setShowAddTxModal(true)}
                className="mt-2 text-emerald-600 hover:underline text-xs font-semibold"
              >
                Click to add new entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD TRANSACTION ENTRY */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="add-tx-modal">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col p-6 my-8 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  <span>{texts.addLedgerTransactionRecordTitle}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{language === 'urdu' ? 'رجسٹریشن کھاتہ کتاب:' : language === 'hindi' ? 'पंजीकरण बहीखाता:' : 'Recording in:'} {translatePresetName(ledger.name, language)}</p>
              </div>
              <button 
                onClick={() => setShowAddTxModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                id="close-add-tx"
              >
                &times;
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddTxSubmit} className="space-y-4 overflow-y-auto pr-1">
              
              {/* Nature Selector (Lent vs Borrowed) */}
              <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex">
                <button
                  type="button"
                  onClick={() => {
                    setTxNature('given');
                    setTxType('Loan');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all text-center cursor-pointer ${
                    txNature === 'given' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {texts.cashGivenTabLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxNature('received');
                    setTxType('Borrow');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all text-center cursor-pointer ${
                    txNature === 'received' 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {texts.cashReceivedTabLabel}
                </button>
              </div>

              {/* Name and Contacts */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700">{texts.partyPersonNameLabel}</label>
                  <button
                    type="button"
                    onClick={() => setShowContactPicker(true)}
                    className="text-xs text-emerald-600 hover:bg-emerald-50 px-2.5 py-1 rounded-sm font-bold border border-emerald-100 flex items-center gap-1 cursor-pointer"
                  >
                    {texts.selectFromContactsBtn}
                  </button>
                </div>
                
                <input
                  type="text"
                  required
                  placeholder={language === 'urdu' ? 'جیسے ذیشان علی، کامران مغل' : language === 'hindi' ? 'जैसे जीशान अली, कामरान मुगल' : "e.g. Zeeshan Ali, Kamran Mughal"}
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                  id="tx-person-name"
                />
              </div>

              {/* Mobile and WhatsApp Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'urdu' ? 'موبائل نمبر (اختیاری)' : language === 'hindi' ? 'मोबाइल नंबर (वैकल्पिक)' : 'Mobile No (Optional)'}</label>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={personMobile}
                    onChange={(e) => setPersonMobile(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.whatsAppNotificationSub}</label>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={personWhatsApp}
                    onChange={(e) => setPersonWhatsApp(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                  />
                </div>
              </div>

              {/* Amount and Instrument details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.amountPkrLabel}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-bold"
                      id="tx-amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.whatWasGivenLabel}</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Cash, Tea Set, Dinner Set, Clock"
                    value={itemDetails}
                    onChange={(e) => setItemDetails(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                  />
                </div>
              </div>

              {/* Transaction Type Choice & Custom tag creation */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">{language === 'urdu' ? 'لین دین کی کیٹیگری' : language === 'hindi' ? 'लेनदेन श्रेणी' : 'Entry Category'}</label>
                  <button
                    type="button"
                    onClick={() => setShowCustomTypeInput(!showCustomTypeInput)}
                    className="text-[10px] text-emerald-600 font-bold hover:underline"
                  >
                    {showCustomTypeInput 
                      ? (language === 'urdu' ? 'بنیادی لسٹ دکھائیں' : language === 'hindi' ? 'डिफ़ॉल्ट सूची दिखाएं' : 'Show Default List') 
                      : (language === 'urdu' ? '+ کسٹم کیٹیگری بنائیں' : language === 'hindi' ? '+ नई कस्टम श्रेणी' : '+ Create Custom Type')}
                  </button>
                </div>

                {showCustomTypeInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Salami, Catering, Plumbing, Cement"
                      value={newCustomType}
                      onChange={(e) => setNewCustomType(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-hidden text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCustomType}
                      className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      {language === 'urdu' ? 'محفوظ کریں' : language === 'hindi' ? 'सहेजें' : 'Save Custom Type'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 border border-slate-100 bg-slate-50 p-2 rounded-xl">
                    {customTxTypes.map(type => {
                      // Translate key custom types if standard
                      let displayedType = type;
                      if (language === 'urdu') {
                        const mapper: Record<string, string> = {
                          'Loan': 'قرض دینا', 'Borrow': 'قرض لینا', 'Return': 'واپسی', 'Cash': 'نقد', 'Gift': 'تحفہ', 'Contribution': 'حصہ', 'Expense': 'خرچہ'
                        };
                        displayedType = mapper[type] || type;
                      } else if (language === 'hindi') {
                        const mapper: Record<string, string> = {
                          'Loan': 'ऋण देय', 'Borrow': 'ऋण प्राप्त', 'Return': 'वापसी', 'Cash': 'नकद', 'Gift': 'उपहार', 'Contribution': 'योगदान', 'Expense': 'व्यय'
                        };
                        displayedType = mapper[type] || type;
                      }
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setTxType(type as TransactionType)}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-semibold border transition-all ${
                            txType === type
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {displayedType}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date of transaction */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.entryTimestampLabel}</label>
                <input
                  type="datetime-local"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-mono"
                  id="tx-date-input"
                />
              </div>

              {/* Memo/Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.memoRemindersDescLabel}</label>
                <textarea
                  placeholder={texts.memoRemindersDescPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  {language === 'urdu' ? 'منسوخ کریں' : language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  id="add-tx-entry-submit"
                >
                  {texts.saveEntryBookRecordBtn}
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

      {/* MODAL: EDIT TRANSACTION ENTRY */}
      {editingTx && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="edit-tx-modal">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col p-6 my-8 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5 font-display text-emerald-800">
                  <span>✏️ {language === 'urdu' ? 'کھاتہ کا اندراج تبدیل کریں' : language === 'hindi' ? 'बहीखाता रिकॉर्ड संपादित करें' : 'Edit Ledger Record'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{language === 'urdu' ? 'تبدیلی برائے کھاتہ:' : language === 'hindi' ? 'बहीखाता में संपादन:' : 'Updating entry in:'} {translatePresetName(ledger.name, language)}</p>
              </div>
              <button 
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                id="close-edit-tx"
              >
                &times;
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleEditTxSubmit} className="space-y-4 overflow-y-auto pr-1">
              
              {/* Nature Selector (Lent vs Borrowed) */}
              <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex">
                <button
                  type="button"
                  onClick={() => {
                    setEditTxNature('given');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all text-center cursor-pointer ${
                    editTxNature === 'given' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {texts.cashGivenTabLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditTxNature('received');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all text-center cursor-pointer ${
                    editTxNature === 'received' 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {texts.cashReceivedTabLabel}
                </button>
              </div>

              {/* Name and Contacts */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700">{texts.partyPersonNameLabel}</label>
                  <button
                    type="button"
                    onClick={() => setShowEditContactPicker(true)}
                    className="text-xs text-emerald-600 hover:bg-emerald-50 px-2.5 py-1 rounded-sm font-bold border border-emerald-100 flex items-center gap-1 cursor-pointer"
                  >
                    {texts.selectFromContactsBtn}
                  </button>
                </div>
                
                <input
                  type="text"
                  required
                  placeholder="e.g. Zeeshan Ali"
                  value={editPersonName}
                  onChange={(e) => setEditPersonName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                />
              </div>

              {/* Mobile and WhatsApp Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'urdu' ? 'موبائل نمبر' : language === 'hindi' ? 'मोबाइल नंबर' : 'Mobile No'}</label>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={editPersonMobile}
                    onChange={(e) => setEditPersonMobile(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'urdu' ? 'واٹس ایپ نمبر' : language === 'hindi' ? 'व्हाट्सएप नंबर' : 'WhatsApp No'}</label>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={editPersonWhatsApp}
                    onChange={(e) => setEditPersonWhatsApp(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                  />
                </div>
              </div>

              {/* Amount and Instrument details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'urdu' ? 'رقم (روپے)' : language === 'hindi' ? 'राशि (रूपये)' : 'Amount (Rs.)'}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.whatWasGivenLabel}</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Cash, Bedding Set"
                    value={editItemDetails}
                    onChange={(e) => setEditItemDetails(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                  />
                </div>
              </div>

              {/* Transaction Type Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'urdu' ? 'کیٹیگری / ٹیگ' : language === 'hindi' ? 'श्रेणी / टैग' : 'Entry Category / Tag'}</label>
                <div className="flex flex-wrap gap-1 border border-slate-100 bg-slate-50 p-2 rounded-xl">
                  {customTxTypes.map(type => {
                    let displayedType = type;
                    if (language === 'urdu') {
                      const mapper: Record<string, string> = {
                        'Loan': 'قرض دینا', 'Borrow': 'قرض لینا', 'Return': 'واپسی', 'Cash': 'نقد', 'Gift': 'تحفہ', 'Contribution': 'حصہ', 'Expense': 'خرچہ'
                      };
                      displayedType = mapper[type] || type;
                    } else if (language === 'hindi') {
                      const mapper: Record<string, string> = {
                        'Loan': 'ऋण देय', 'Borrow': 'ऋण प्राप्त', 'Return': 'वापसी', 'Cash': 'नकद', 'Gift': 'उपहार', 'Contribution': 'योगदान', 'Expense': 'व्यय'
                      };
                      displayedType = mapper[type] || type;
                    }
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditTxType(type)}
                        className={`text-[10px] px-2.5 py-1 rounded-md font-semibold border transition-all ${
                          editTxType === type
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {displayedType}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date of transaction */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{texts.entryTimestampLabel}</label>
                <input
                  type="datetime-local"
                  required
                  value={editTxDate}
                  onChange={(e) => setEditTxDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-mono"
                />
              </div>

              {/* Memo/Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'urdu' ? 'تفصیل / یاد دہانی نوٹ' : language === 'hindi' ? 'मेमो विवरण' : 'Memo description'}</label>
                <textarea
                  placeholder="e.g., Return promise or advance payment details..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end bg-white">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  {language === 'urdu' ? 'منسوخ کریں' : language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {language === 'urdu' ? 'ریکارڈ اپ ڈیٹ کریں' : language === 'hindi' ? 'रिकॉर्ड अपडेट करें' : 'Update Entry Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Picker Simulator for Editing modal */}
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

      {/* Floating Action Button (FAB) for quick adding transactions */}
      <button
        type="button"
        onClick={() => {
          setTxNature('given');
          setShowAddTxModal(true);
        }}
        className="fixed bottom-6 right-6 z-40 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-emerald-500 focus:outline-hidden group"
        id="fab-add-ledger-tx"
        title={texts.addTransactionBtn}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
          {texts.addTransactionBtn}
        </span>
      </button>

    </div>
  );
}
