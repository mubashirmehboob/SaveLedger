import React, { useState } from 'react';
import { SIMULATED_CONTACTS } from '../utils/dummyData';
import { SimulatedContact } from '../types';
import { User, Phone, Check, Upload, Plus, Smartphone, BookOpen, Trash2, MessageCircle, FileText, Sparkles } from 'lucide-react';
import { translations } from '../utils/translations';

interface ContactPickerProps {
  onSelect: (contact: SimulatedContact) => void;
  onClose: () => void;
  selectedMobile?: string;
  language?: 'english' | 'urdu' | 'hindi';
}

export default function ContactPicker({ 
  onSelect, 
  onClose, 
  selectedMobile, 
  language = 'english' 
}: ContactPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'whatsapp' | 'add' | 'vcf'>('search');
  
  // Local states for custom manual contact addition
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newWhatsApp, setNewWhatsApp] = useState('');

  // WhatsApp quick paste text state
  const [whatsappPasteText, setWhatsappPasteText] = useState('');

  // Load custom contacts from localStorage
  const [customContacts, setCustomContacts] = useState<SimulatedContact[]>(() => {
    try {
      const stored = localStorage.getItem('saveledger_custom_contacts') || localStorage.getItem('trustbook_custom_contacts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const texts = translations[language];

  // Helper function to parse standard vCard files (.vcf)
  const parseVCF = (text: string): SimulatedContact[] => {
    const contacts: SimulatedContact[] = [];
    const cards = text.split(/BEGIN:VCARD/i);
    
    cards.forEach((card, idx) => {
      if (!card.trim()) return;
      
      const lines = card.split(/\r?\n/);
      let name = '';
      let phone = '';
      
      lines.forEach(line => {
        // FN line holds Full Name
        if (/^FN:/i.test(line)) {
          name = line.replace(/^FN:/i, '').trim();
        } else if (/^FN;/i.test(line)) {
          const parts = line.split(':');
          if (parts.length > 1) {
            name = parts.slice(1).join(':').trim();
          }
        }
        // N line if FN is empty
        if (!name && /^N:/i.test(line)) {
          const parts = line.replace(/^N:/i, '').trim().split(';');
          // Try to reconstruct name from N: family;given;middle;prefix;suffix
          name = parts.filter(Boolean).reverse().join(' ').trim();
        }
        
        // TEL line holds phone number
        if (/^TEL[;:]/i.test(line)) {
          const telParts = line.split(':');
          if (telParts.length > 1) {
            let cleanTel = telParts.slice(1).join(':').trim();
            // clean any double quotes or type attributes
            phone = cleanTel.replace(/["']/g, '');
          }
        }
      });
      
      // Clean up names with extra backslashes or formatting issues
      if (name) {
        name = name.replace(/\\/g, '').trim();
      }
      
      if (name && phone) {
        contacts.push({
          id: `vcf_${idx}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: name,
          mobile: phone,
          whatsapp: phone
        });
      }
    });
    
    return contacts;
  };

  // Helper function to parse WhatsApp contact paste text
  const parseWhatsAppPastedText = (rawText: string): SimulatedContact[] => {
    const lines = rawText.split(/\r?\n/);
    const parsedList: SimulatedContact[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Extract phone number patterns (e.g. +92 300 1234567, 0300-1234567, +91..., etc.)
      const phoneRegex = /(\+?\d[\d\s\-\(\)]{8,16}\d)/;
      const phoneMatch = trimmed.match(phoneRegex);

      if (phoneMatch) {
        const foundPhone = phoneMatch[1].trim();
        // The remaining text is considered the name
        let foundName = trimmed.replace(foundPhone, '').replace(/[:,\-\–\|]/g, ' ').trim();
        if (!foundName || foundName.length < 2) {
          foundName = `WhatsApp Contact ${idx + 1}`;
        }

        parsedList.push({
          id: `wa_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
          name: foundName,
          mobile: foundPhone,
          whatsapp: foundPhone
        });
      } else if (trimmed.length >= 3) {
        // Line without obvious phone - check if it's name: number
        const parts = trimmed.split(/[:=\t]/);
        if (parts.length >= 2) {
          const namePart = parts[0].trim();
          const numPart = parts[1].trim();
          if (numPart.replace(/\D/g, '').length >= 7) {
            parsedList.push({
              id: `wa_${Date.now()}_${idx}`,
              name: namePart,
              mobile: numPart,
              whatsapp: numPart
            });
          }
        }
      }
    });

    return parsedList;
  };

  const handleWhatsAppImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappPasteText.trim()) {
      alert(language === 'urdu' ? 'برائے مہربانی واٹس ایپ کاپی شدہ متن یا نمبر پیسٹ کریں۔' : 'Please paste WhatsApp text or contact numbers.');
      return;
    }

    const parsed = parseWhatsAppPastedText(whatsappPasteText);
    if (parsed.length === 0) {
      alert(
        language === 'urdu'
          ? 'متن میں کوئی فون نمبر نہیں ملا۔ براہ کرم نام اور نمبر درست انداز میں پیسٹ کریں۔ (مثال: Zeeshan: 03001234567)'
          : 'No valid phone numbers detected. Please paste text with phone numbers (e.g. Zeeshan: +92 300 1234567).'
      );
      return;
    }

    const merged = [...parsed, ...customContacts];
    const uniqueContacts: SimulatedContact[] = [];
    const seenNumbers = new Set<string>();

    merged.forEach(contact => {
      const cleanPhone = contact.mobile.replace(/[\s\-\(\)\+\+]/g, '');
      if (!seenNumbers.has(cleanPhone)) {
        seenNumbers.add(cleanPhone);
        uniqueContacts.push(contact);
      }
    });

    setCustomContacts(uniqueContacts);
    localStorage.setItem('saveledger_custom_contacts', JSON.stringify(uniqueContacts));
    
    // If only 1 contact was pasted, select it immediately
    if (parsed.length === 1) {
      onSelect(parsed[0]);
      onClose();
      return;
    }

    alert(
      language === 'urdu'
        ? `${parsed.length} واٹس ایپ روابط کامیابی سے شامل ہو گئے۔`
        : `Successfully imported ${parsed.length} WhatsApp contacts!`
    );
    setWhatsappPasteText('');
    setActiveTab('search');
  };

  // Import contacts from vCard file upload
  const handleVCFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const parsed = parseVCF(content);
        if (parsed.length === 0) {
          alert(
            language === 'urdu'
              ? 'فائل میں کوئی درست رابطہ نمبر نہیں ملا۔ براہ مہربانی درست .vcf یا vCard فائل منتخب کریں۔'
              : language === 'hindi'
              ? 'फ़ाइल में कोई मान्य संपर्क नहीं मिला। कृपया मान्य .vcf या vCard फ़ाइल चुनें।'
              : 'No valid contacts could be parsed from the uploaded file. Please ensure it is a valid .vcf or vCard.'
          );
          return;
        }

        const merged = [...parsed, ...customContacts];
        // Deduplicate contacts by clean phone numbers
        const uniqueContacts: SimulatedContact[] = [];
        const seenNumbers = new Set<string>();

        merged.forEach(contact => {
          const cleanPhone = contact.mobile.replace(/[\s\-\(\)\+\+]/g, '');
          if (!seenNumbers.has(cleanPhone)) {
            seenNumbers.add(cleanPhone);
            uniqueContacts.push(contact);
          }
        });

        setCustomContacts(uniqueContacts);
        localStorage.setItem('saveledger_custom_contacts', JSON.stringify(uniqueContacts));
        
        alert(
          language === 'urdu'
            ? `${parsed.length} روابط کامیابی سے امپورٹ کر لیے گئے ہیں! آپ انہیں اب سرچ بار میں تلاش کرسکتے ہیں۔`
            : language === 'hindi'
            ? `${parsed.length} संपर्क सफलतापूर्वक जोड़े गए हैं! आप उन्हें अब खोज सकते हैं।`
            : `Successfully imported ${parsed.length} contacts! Use the contact search bar to select.`
        );
        setActiveTab('search');
      } catch (err) {
        console.error("VCF parsing error:", err);
        alert('Failed to parse the contacts backup file. Please make sure card format is supported.');
      }
    };
    reader.readAsText(file);
  };

  // Native Browser Contacts API Access Integration
  const handleNativeContactPicker = async () => {
    if (typeof window === 'undefined' || !('contacts' in navigator)) {
      alert(
        language === 'urdu'
          ? 'اس ڈیوائس پر کانٹیکٹس تک رسائی دستیاب نہیں ہے۔\n\nآپ درج ذیل طریقے استعمال کر سکتے ہیں:\n• کانٹیکٹ نمبر خود درج کریں\n• فائل (.vcf) سے کانٹیکٹس امپورٹ کریں\n\nبراہِ راست فون بک تک رسائی کے لیے، SaveLedger کو کسی سپورٹڈ موبائل ڈیوائس پر کھولیں۔'
          : language === 'hindi'
          ? 'इस डिवाइस पर संपर्कों (Contacts) तक पहुंच उपलब्ध नहीं है।\n\nआप निम्न तरीके अपना सकते हैं:\n• मैन्युअल रूप से संपर्क जोड़ें\n• .vcf फ़ाइल से संपर्क आयात (Import) करें\n\nसीधे फोन बुक उपयोग के लिए, किसी समर्थित मोबाइल डिवाइस पर SaveLedger खोलें।'
          : 'Contacts access is not available on this device.\n\nYou can:\n• Add a contact manually\n• Paste WhatsApp contact text\n• Import contacts from a .vcf file\n\nFor direct contact access, open SaveLedger on a supported mobile device.'
      );
      return;
    }

    try {
      // @ts-ignore
      const supportedProperties = await navigator.contacts.getProperties();
      const props = [];
      if (supportedProperties.includes('name')) props.push('name');
      if (supportedProperties.includes('tel')) props.push('tel');
      if (props.length === 0) props.push('name', 'tel');
      
      // @ts-ignore
      const results = await navigator.contacts.select(props, { multiple: false });
      if (results && results.length > 0) {
        const nativeContact = results[0];
        const selectedName = nativeContact.name && nativeContact.name[0] ? nativeContact.name[0] : '';
        const selectedPhone = nativeContact.tel && nativeContact.tel[0] ? nativeContact.tel[0] : '';
        
        if (!selectedName && !selectedPhone) {
          alert('Could not retrieve any name or phone details from selected contact.');
          return;
        }

        const newContact: SimulatedContact = {
          id: `native_${Date.now()}`,
          name: selectedName || 'No Name',
          mobile: selectedPhone || '',
          whatsapp: selectedPhone || ''
        };
        
        const updatedCustom = [newContact, ...customContacts];
        setCustomContacts(updatedCustom);
        localStorage.setItem('saveledger_custom_contacts', JSON.stringify(updatedCustom));
        
        onSelect(newContact);
        onClose();
      }
    } catch (err: any) {
      console.warn("Native Contact Picker fails/blocked:", err);
      alert(
        language === 'urdu'
          ? 'فون بک تک رسائی کی اجازت نہیں ملی۔ سیکیورٹی اور آئی فریم (iFrame) کی حدود کی وجہ سے براؤزر اکثر اسے بلاک کرتا ہے۔ برائے مہربانی مینوئل نمبر لکھیں یا VCF فائل اپ لوڈ کریں۔'
          : language === 'hindi'
          ? 'फ़ोन बुक एक्सेस की अनुमति नहीं मिली (iFrame या सुरक्षा कारणों से)। कृपया मैन्युअल रूप से जोड़ें या .vcf फ़ाइल का उपयोग करें।'
          : 'Access to device contacts was rejected or restricted. Please use "WhatsApp Contacts" paste or "Add Custom Contact"!'
      );
    }
  };

  // Add contact manually helper
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMobile.trim()) {
      alert(language === 'urdu' ? 'برائے مہربانی نام اور نمبر دونوں درج کریں۔' : 'Please provide both Name and Contact number.');
      return;
    }

    const newItem: SimulatedContact = {
      id: `manual_${Date.now()}`,
      name: newName.trim(),
      mobile: newMobile.trim(),
      whatsapp: newWhatsApp.trim() || newMobile.trim()
    };

    const updatedCustom = [newItem, ...customContacts];
    setCustomContacts(updatedCustom);
    localStorage.setItem('saveledger_custom_contacts', JSON.stringify(updatedCustom));

    onSelect(newItem);
    onClose();
  };

  // Delete custom contact helper
  const handleDeleteCustomContact = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(language === 'urdu' ? 'کیا آپ اس رابطے کو فہرست سے حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this contact?')) return;
    
    const filtered = customContacts.filter(c => c.id !== id);
    setCustomContacts(filtered);
    localStorage.setItem('saveledger_custom_contacts', JSON.stringify(filtered));
  };

  // Combine custom contacts and simulated contacts, sorting alphabetically
  const allContacts = [...customContacts, ...SIMULATED_CONTACTS];
  const filteredContacts = allContacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm) ||
    (c.whatsapp && c.whatsapp.includes(searchTerm))
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 animate-fade-in" id="contact-picker-modal">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-emerald-600 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-100" />
              <span>
                {language === 'urdu' 
                  ? 'واٹس ایپ اور فون رابطے' 
                  : language === 'hindi' 
                  ? 'व्हाट्सएप और फोन संपर्क' 
                  : 'WhatsApp & Phone Contacts'}
              </span>
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:bg-emerald-700/50 p-1.5 rounded-full transition-colors text-sm font-medium cursor-pointer"
              id="close-contact-picker-btn"
            >
              {texts.closeBtn}
            </button>
          </div>
          <p className="text-emerald-100 text-xs leading-relaxed">
            {language === 'urdu' 
              ? 'واٹس ایپ، فون بک یا بیک اپ فائل سے رابطہ منتخب کریں یا نیا رابطہ درج کریں۔' 
              : language === 'hindi' 
              ? 'व्हाट्सएप, फोन बुक या बैकअप फ़ाइल से संपर्क चुनें।' 
              : 'Pick directly from your WhatsApp contacts, phone book, paste text, or upload .vcf card.'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 min-w-[90px] py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'search'
                ? 'border-emerald-600 text-emerald-600 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'urdu' ? 'رابطے' : 'Contacts'}</span>
            <span className="bg-emerald-50 text-emerald-700 rounded-full px-1.5 py-0.2 text-[10px]">
              {allContacts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 min-w-[110px] py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-600 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'urdu' ? 'واٹس ایپ' : language === 'hindi' ? 'व्हाट्सएप' : 'WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 min-w-[80px] py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'add'
                ? 'border-emerald-600 text-emerald-600 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'urdu' ? 'نیا' : 'Add'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vcf')}
            className={`flex-1 min-w-[80px] py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'vcf'
                ? 'border-emerald-600 text-emerald-600 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>VCF File</span>
          </button>
        </div>

        {/* TAB 1: SEARCH & DIRECTORY */}
        {activeTab === 'search' && (
          <>
            {/* Search Bar & Native API Access Button */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'urdu' ? 'نام یا واٹس ایپ نمبر تلاش کریں...' : 'Search name or WhatsApp number...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden transition-all text-slate-800 font-sans"
                  id="contact-search-input"
                  autoFocus
                />
              </div>

              {/* Native Mobile Contacts trigger button */}
              <button
                type="button"
                onClick={handleNativeContactPicker}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2 px-3 rounded-xl border border-emerald-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>{language === 'urdu' ? 'فون بک / واٹس ایپ سے منتخب کریں' : 'Choose Directly from Device Contacts'}</span>
              </button>
            </div>

            {/* Contacts List */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[45vh]">
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => {
                  const isSelected = selectedMobile === contact.mobile || selectedMobile === contact.whatsapp;
                  const isCustom = contact.id.startsWith('manual_') || contact.id.startsWith('vcf_') || contact.id.startsWith('native_') || contact.id.startsWith('wa_');
                  
                  return (
                    <div
                      key={contact.id}
                      onClick={() => {
                        onSelect(contact);
                        onClose();
                      }}
                      className={`w-full text-left p-3.5 hover:bg-emerald-50/50 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected ? 'bg-emerald-50' : ''
                      }`}
                      id={`contact-item-${contact.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-sm font-mono shrink-0">
                          {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{contact.name}</h4>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                              <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </span>
                            {isCustom && (
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-semibold font-sans">
                                {contact.id.startsWith('wa_') ? 'WhatsApp' : contact.id.startsWith('vcf_') ? 'VCF' : contact.id.startsWith('native_') ? 'Phone' : 'Custom'}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs flex items-center gap-1 mt-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{contact.whatsapp || contact.mobile}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(contact);
                              onClose();
                            }}
                            className="text-xs text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg cursor-pointer shrink-0 border border-emerald-200"
                          >
                            {language === 'urdu' ? 'منتخب کریں' : 'Select'}
                          </button>
                        )}

                        {isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomContact(contact.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center text-slate-500 bg-white">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{language === 'urdu' ? `کوئی رابطہ نہیں ملا: "${searchTerm}"` : `No contacts found matching "${searchTerm}"`}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'urdu' 
                      ? 'واٹس ایپ سے کاپی کر کے پیسٹ کرنے کیلئے اوپر "WhatsApp" ٹیب منتخب کریں۔' 
                      : 'Switch to "WhatsApp" tab to paste copied contacts directly!'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: WHATSAPP QUICK PASTE & IMPORT */}
        {activeTab === 'whatsapp' && (
          <form onSubmit={handleWhatsAppImportSubmit} className="p-5 space-y-4 bg-white flex-1 overflow-y-auto">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <p className="font-bold mb-0.5">
                  {language === 'urdu' ? 'واٹس ایپ سے نمبر اور نام کاپی کر کے یہاں پیسٹ کریں' : 'Paste contacts directly from WhatsApp'}
                </p>
                <p className="text-emerald-700 text-[11px]">
                  {language === 'urdu'
                    ? 'آپ واٹس ایپ چیٹ یا شیئر کیے گئے کانٹیکٹ سے ٹیکسٹ یہاں پیسٹ کر سکتے ہیں۔ یہ خود بخود نام اور نمبر الگ کر لے گا۔'
                    : 'Paste any WhatsApp message, contact card, or list of numbers (e.g. "Ali: +92 300 1234567" or "+923001234567").'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'urdu' ? 'واٹس ایپ ٹیکسٹ یا رابطہ نمبر پیسٹ کریں:' : 'Paste WhatsApp Contact(s) or Numbers:'}
              </label>
              <textarea
                rows={5}
                required
                placeholder={
                  "Examples:\n• +92 300 1234567 - Zeeshan Ali\n• Muhammad Bilal: 03219876543\n• 0300 1234567"
                }
                value={whatsappPasteText}
                onChange={(e) => setWhatsappPasteText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-mono leading-relaxed"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{language === 'urdu' ? 'واٹس ایپ رابطہ امپورٹ اور منتخب کریں' : 'Import & Add WhatsApp Contact'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: ADD CUSTOM CONTACT */}
        {activeTab === 'add' && (
          <form onSubmit={handleManualAdd} className="p-5 space-y-4 bg-white flex-1 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'urdu' ? 'مکمل نام' : language === 'hindi' ? 'पूरा नाम' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'urdu' ? 'مثال: ذیشان مغل' : "e.g. Zeeshan Mughal"}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'urdu' ? 'موبائل نمبر / فون' : language === 'hindi' ? 'मोबाइल नंबर' : 'Phone / Contact Number *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +923001234567"
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'urdu' ? 'واٹس ایپ نمبر (متبادل)' : language === 'hindi' ? 'व्हाट्सएप संख्या' : 'WhatsApp Number (Optional)'}
              </label>
              <input
                type="text"
                placeholder="e.g. +923001234567"
                value={newWhatsApp}
                onChange={(e) => setNewWhatsApp(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                💾 {language === 'urdu' ? 'رابطہ محفوظ اور منتخب کریں' : 'Save & Select Contact'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: IMPORT VCF FILE */}
        {activeTab === 'vcf' && (
          <div className="p-6 bg-white space-y-5 flex-1 overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <Upload className="w-5 h-5 animate-bounce" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">
                {language === 'urdu' ? 'بیک اپ فائل سے کانٹیکٹس امپورٹ کریں' : 'Import Contacts via backup file'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {language === 'urdu' 
                  ? 'اپنے موبائل گیلری / فون بک یا واٹس ایپ سے روابط برآمد (Export) کریں اور حاصل کردہ .vcf فائل یہاں اپ لوڈ کریں۔' 
                  : 'Go to your phone contacts or WhatsApp export, share/export as .vcf or vCard file, and upload it here.'}
              </p>
            </div>

            <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-2xl p-6 transition-all text-center relative bg-emerald-50/20 active:bg-emerald-50/50">
              <input
                type="file"
                accept=".vcf,text/vcard,text/x-vcard"
                onChange={handleVCFUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-emerald-700 block mb-1">
                📂 {language === 'urdu' ? 'فائل منتخب کریں' : 'Select backup file (.vcf)'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">vCard version 2.1, 3.0 & 4.0 supported</span>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-sans">
              <strong>💡 Pro Tip:</strong> You can export contacts directly from WhatsApp or Google Contacts as a .vcf file and upload it above to sync all of your customer names and phone numbers instantly!
            </div>
          </div>
        )}

        {/* Footer info tip card */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-sans">
            🔒 Imported contacts are securely stored in your local browser and automatically fill party name, mobile, and WhatsApp number.
          </p>
        </div>
      </div>
    </div>
  );
}

