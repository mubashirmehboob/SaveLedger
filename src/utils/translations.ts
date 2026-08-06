export interface AppTranslations {
  // Sidebar
  mainCategories: string;
  loansDashboardLink: string;
  customLedgersHeader: string;
  ceremonyEventsHeader: string;
  noCustomLedgersSidebar: string;
  noEventsSidebar: string;
  ledgerOwnerBadge: string;
  liveSandboxBanner: string;
  footerEncryptionNote: string;
  footerCopyrightNote: string;
  backToDashboardBtn: string;

  // Auth / Login
  appSubtitle: string;
  signInTab: string;
  registerTab: string;
  fullNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  passwordLabel: string;
  forgotPasswordLink: string;
  createBookBtn: string;
  signInBtn: string;
  orLoginWithLabel: string;
  googleLoginBtn: string;
  passwordTip: string;
  backToLoginBtn: string;
  retrieveAccountTitle: string;
  retrieveAccountSubtitle: string;
  emailOrPhoneLabel: string;
  sendOtpBtn: string;
  verifyOtpTitle: string;
  otpCodeSentSubtitle: string;
  otpCodeLabel: string;
  resendOtpTimer: string;
  newSecurePasswordLabel: string;
  verifySavePasswordBtn: string;
  passwordPlaceholder: string;

  // Dashboard
  switchViewBtn: string;
  aggregatesBannerTitle: string;
  aggregatesBannerSummaryLoans: string;
  aggregatesBannerSummaryEvents: string;
  addLedgerBookBtn: string;
  createNewEventBtn: string;
  totalGivenCol: string;
  totalGivenDesc: string;
  totalReceivedCol: string;
  totalReceivedDesc: string;
  netStandingCol: string;
  netStandingCollect: string;
  netStandingPay: string;
  listedEventsCol: string;
  listedEventsCount: string;
  listedEventsUpcoming: string;
  loansCustomLedgersTab: string;
  eventsPahajiDiariesTab: string;
  customLedgerListTitle: string;
  customLedgerListSubtitle: string;
  newLedgerBtn: string;
  givenGetsBack: string;
  receivedReturns: string;
  getsAmt: string;
  owesAmt: string;
  openLedgerBtn: string;
  deleteBtn: string;
  noCreditLedgersTitle: string;
  noCreditLedgersDesc: string;
  createFirstLedgerBtn: string;
  scheduledEventsTitle: string;
  scheduledEventsSubtitle: string;
  createEventBtn: string;
  actualExpenseVsBudget: string;
  giftsPahajiReceived: string;
  remainingBudget: string;
  budgetLeft: string;
  budgetOverspent: string;
  pahajiItemsRecordedCount: string;
  openCeremonyNotebookBtn: string;
  noEventsTitle: string;
  noEventsDesc: string;
  scheduleFirstEventBtn: string;
  selectStandardCategory: string;
  customNameBtn: string;
  ledgerTitleLabel: string;
  descriptionOptionalLabel: string;
  cancelBtn: string;
  createLedgerBookFormBtn: string;
  scheduleNewEventTitle: string;
  eventNameLabel: string;
  plannedBudgetPkrLabel: string;
  budgetLimitTip: string;
  notesOptionalLabel: string;
  scheduleEventDiaryBtn: string;

  // Ledger Detail Page
  addTransactionBtn: string;
  lentGivenHeader: string;
  borrowedReceivedHeader: string;
  owesReceiveHeader: string;
  searchTxPlaceholder: string;
  allTransactionsTab: string;
  totalNetBalanceHeader: string;
  weOweLabel: string;
  theyOweLabel: string;
  inBalanceLabel: string;
  givenLabel: string;
  receivedLabel: string;
  noTxRecordedTitle: string;
  noTxRecordedDesc: string;
  editTransactionBtn: string;
  confirmLedgerRecordBtn: string;
  editLedgerEntryTitle: string;
  recordNewLedgerEntryTitle: string;
  contactPersonNameLabel: string;
  mobileNumberLabel: string;
  whatsAppLabel: string;
  txAmountLabel: string;
  txNatureLabel: string;
  txDateLabel: string;
  remarksOptionalLabel: string;
  paymentMethodLabel: string;
  cashOnlyOption: string;
  whatsAppNotifyCheckbox: string;
  autoFillWhatsAppBtn: string;
  contactPickerTip: string;
  savedPhoneContactsTitle: string;
  closeBtn: string;
  searchContactsPlaceholder: string;
  groupByPerson: string;
  dailyFeed: string;
  backToAll: string;

  // Event Detail Page
  eventDiaryPlannerTitle: string;
  recordGiftExpenseBtn: string;
  plannedBudgetTargetHeader: string;
  actualExpenseSpentHeader: string;
  giftsPahajiReceivedHeader: string;
  remainingBudgetBalanceHeader: string;
  overspentBudgetLabel: string;
  underBudgetLabel: string;
  budgetUtilizedProgressTitle: string;
  estLimitLabel: string;
  ceremonyLogEntriesTitle: string;
  ceremonyLogEntriesSubtitle: string;
  searchGuestsPlaceholder: string;
  allFilterTab: string;
  giftsPahajiFilterTab: string;
  expensesFilterTab: string;
  receivedContributionLabel: string;
  actualExpenseSpentLabel: string;
  materialGiftLabel: string;
  memoSpecialReminderLabel: string;
  confirmDiaryRecordBtn: string;
  recordEventPageItemTitle: string;
  salamiPahajiReceivedTab: string;
  expenseSpentOutTab: string;
  guestSenderNameLabel: string;
  savedContactsBtn: string;
  cashPaidAmountLabel: string;
  customGiftDescriptionLabel: string;
  expenseCategoryLabel: string;
  expenseCashSpentLabel: string;
  memosSpecialReminderLabel: string;
  confirmDiaryRecordFormBtn: string;
  editCeremonyEntryTitle: string;
  activeLedgerBookSub: string;
  totalCashGivenLabel: string;
  totalCashGivenDesc: string;
  totalCashReceivedLabel: string;
  totalCashReceivedDesc: string;
  netLedgerBalanceLabel: string;
  willCollectSuffix: string;
  willCollectPrefix: string;
  oweSuffix: string;
  owePrefix: string;
  ledgerTimelineTitle: string;
  ledgerTimelineSubtitle: string;
  addLedgerTransactionRecordTitle: string;
  cashGivenTabLabel: string;
  cashReceivedTabLabel: string;
  partyPersonNameLabel: string;
  selectFromContactsBtn: string;
  whatsAppNotificationSub: string;
  amountPkrLabel: string;
  whatWasGivenLabel: string;
  whatWasGivenPlaceholder: string;
  entryTimestampLabel: string;
  memoRemindersDescLabel: string;
  memoRemindersDescPlaceholder: string;
  saveEntryBookRecordBtn: string;
}

export const translations: Record<'english' | 'urdu' | 'hindi', AppTranslations> = {
  english: {
    mainCategories: 'Main Categories',
    loansDashboardLink: 'My Ledgers',
    customLedgersHeader: 'Custom Ledgers',
    ceremonyEventsHeader: 'Ceremony Events',
    noCustomLedgersSidebar: 'No Custom Ledgers Created',
    noEventsSidebar: 'No functional events planned',
    ledgerOwnerBadge: 'Ledger Owner',
    liveSandboxBanner: '🔒 All records are securely backed up',
    footerEncryptionNote: '🔒 Access SaveLedger from any device, anywhere.',
    footerCopyrightNote: '"SaveLedger" • Securely manage loans, ledgers, and financial records.',
    backToDashboardBtn: '← Back to main dashboard list view',

    // Auth / Login
    appSubtitle: 'Manage Loans, Track Expenses & Organize Event Records',
    signInTab: 'Sign In',
    registerTab: 'Register',
    fullNameLabel: 'Your Full Name',
    emailLabel: 'Email / Gmail Address',
    phoneLabel: 'WhatsApp / Contact No (Optional)',
    passwordLabel: 'Password',
    forgotPasswordLink: 'Forgot password?',
    createBookBtn: 'Create SaveLedger',
    signInBtn: 'Sign in to Ledger',
    orLoginWithLabel: 'Or login with',
    googleLoginBtn: 'Instant Google Login',
    passwordTip: '🔓 Try default user password is:',
    backToLoginBtn: 'Back to Login',
    retrieveAccountTitle: 'Retrieve Your Account',
    retrieveAccountSubtitle: 'Enter your registered Gmail (or Pakistan/India format Mobile no) to receive a secure recovery OTP.',
    emailOrPhoneLabel: 'Gmail or Mobile Number',
    sendOtpBtn: 'Send OTP Code',
    verifyOtpTitle: 'Verify OTP',
    otpCodeSentSubtitle: 'We sent a code to. Enter code and type your fresh password.',
    otpCodeLabel: 'Enter 6-Digit OTP',
    resendOtpTimer: 'Resend OTP available in:',
    newSecurePasswordLabel: 'New Secure Password',
    verifySavePasswordBtn: 'Verify and Save Password',
    passwordPlaceholder: 'At least 5 characters',

    // Dashboard
    switchViewBtn: 'Switch to',
    aggregatesBannerTitle: 'SaveLedger Aggregates',
    aggregatesBannerSummaryLoans: 'Check totals below of what cash you have lent (Given) or borrowed (Received).',
    aggregatesBannerSummaryEvents: 'Track event budgets, guest contributions (Pahaji), gifts, and expenses in one place.',
    addLedgerBookBtn: 'Add Ledger Book',
    createNewEventBtn: 'Create New Event',
    totalGivenCol: 'You Will Receive',
    totalGivenDesc: '(To Collect)',
    totalReceivedCol: 'You Need To Pay',
    totalReceivedDesc: '(To Pay)',
    netStandingCol: 'Net Balance',
    netStandingCollect: '(You will receive)',
    netStandingPay: '(You need to pay)',
    listedEventsCol: 'Listed Events',
    listedEventsCount: 'Functions',
    listedEventsUpcoming: 'Upcoming',
    loansCustomLedgersTab: 'My Ledgers',
    eventsPahajiDiariesTab: 'Events',
    customLedgerListTitle: 'Your Custom Ledgers',
    customLedgerListSubtitle: 'Separate transactions for shop keepers, friends or specific construction plans.',
    newLedgerBtn: 'New Ledger',
    givenGetsBack: 'Given (Gets Back)',
    receivedReturns: 'Received (Returns)',
    getsAmt: 'Gets Rs.',
    owesAmt: 'Owes Rs.',
    openLedgerBtn: 'Open Ledger',
    deleteBtn: 'Delete',
    noCreditLedgersTitle: 'No Credit Ledgers Yet',
    noCreditLedgersDesc: 'Create custom ledgers for Business suppliers, cousins, parents, or house plot expenses to separate accounts properly!',
    createFirstLedgerBtn: 'Create First Ledger',
    scheduledEventsTitle: 'Event Records',
    scheduledEventsSubtitle: 'Track gifts, cash contributions (Pahaji), and return obligations from previous ceremonies.',
    createEventBtn: 'Create Event',
    actualExpenseVsBudget: 'Planned Budget',
    giftsPahajiReceived: 'Gifts & Contribution Received:',
    remainingBudget: 'Budget Remaining',
    budgetLeft: 'Left',
    budgetOverspent: 'Overspent by',
    pahajiItemsRecordedCount: 'Pahaji Ledger items list:',
    openCeremonyNotebookBtn: 'Open Ceremony Notebook',
    noEventsTitle: 'No Active Ceremonies Or Events',
    noEventsDesc: 'No functions scheduled. Click Create Event to track wedding expense estimates or friend housewarming gift lists!',
    scheduleFirstEventBtn: 'Schedule First Event',
    selectStandardCategory: 'Select a Standard Ledger Category',
    customNameBtn: 'Custom Name',
    ledgerTitleLabel: 'Ledger Title / Business Name',
    descriptionOptionalLabel: 'Sub-title / Description (Optional)',
    cancelBtn: 'Cancel',
    createLedgerBookFormBtn: 'Create Ledger Book',
    scheduleNewEventTitle: 'Schedule New Event Diary',
    eventNameLabel: 'Event Name / Host Occasion',
    plannedBudgetPkrLabel: 'Planned Budget (PKR)',
    budgetLimitTip: 'Estimation limit for items decoration, travel expense, or catering.',
    notesOptionalLabel: 'Organizer Notes / Target Guests (Optional)',
    scheduleEventDiaryBtn: 'Schedule Event Diary',

    // Ledger Detail Page
    addTransactionBtn: 'Add Entry',
    lentGivenHeader: 'LENT (GIVEN)',
    borrowedReceivedHeader: 'BORROWED (RECEIVED)',
    owesReceiveHeader: 'OWES / RECEIVE',
    searchTxPlaceholder: 'Search entries, remarks or party name...',
    allTransactionsTab: 'All Entries',
    totalNetBalanceHeader: 'Total Net Balance',
    weOweLabel: 'We owe:',
    theyOweLabel: 'They owe:',
    inBalanceLabel: 'In balance (Barabar)',
    givenLabel: 'Given:',
    receivedLabel: 'Received:',
    noTxRecordedTitle: 'No entries yet',
    noTxRecordedDesc: 'Tap + Add Entry to record your first loan or payment.',
    editTransactionBtn: 'Edit Entry',
    confirmLedgerRecordBtn: 'Confirm Ledger Record',
    editLedgerEntryTitle: 'Edit Ledger Entry',
    recordNewLedgerEntryTitle: 'Record Ledger Entry',
    contactPersonNameLabel: 'Contact Person Name',
    mobileNumberLabel: 'Mobile Number (Optional)',
    whatsAppLabel: 'WhatsApp Number (Optional)',
    txAmountLabel: 'Entry Amount (Rs.)',
    txNatureLabel: 'Entry Nature / Type',
    txDateLabel: 'Entry Date / Time',
    remarksOptionalLabel: 'Optional remarks or item descriptions',
    paymentMethodLabel: 'Pay Method / Cash Type',
    cashOnlyOption: 'Cash Only',
    whatsAppNotifyCheckbox: 'Send WhatsApp notification upon booking',
    autoFillWhatsAppBtn: 'Auto-fill WhatsApp SMS text template',
    contactPickerTip: 'Quickly select friends or relatives from your saved phone contacts.',
    savedPhoneContactsTitle: 'Saved Phone Contacts Simulator',
    closeBtn: 'Close',
    searchContactsPlaceholder: 'Search Contacts...',
    groupByPerson: '👥 Group by Person',
    dailyFeed: '🕒 Daily Feed',
    backToAll: '← Back to All Parties',

    // Event Detail Page
    eventDiaryPlannerTitle: 'Event Diary Planner',
    recordGiftExpenseBtn: 'Record Gift / Expense Entry',
    plannedBudgetTargetHeader: 'Planned Budget target',
    actualExpenseSpentHeader: 'Actual Expense Spent',
    giftsPahajiReceivedHeader: 'Gifts/Pahaji Received',
    remainingBudgetBalanceHeader: 'Remaining Budget Balance',
    overspentBudgetLabel: '⚠️ Overspent planned target',
    underBudgetLabel: '⭐ Under planned target',
    budgetUtilizedProgressTitle: 'Budget Utilized Progress',
    estLimitLabel: 'Est Limit:',
    ceremonyLogEntriesTitle: 'Ceremony Log Diary Entries',
    ceremonyLogEntriesSubtitle: 'Record of who brought what gifts/Salami (Pahaji) or where money was spent.',
    searchGuestsPlaceholder: 'Search guests, gift items, expenses...',
    allFilterTab: 'All',
    giftsPahajiFilterTab: '🎁 Gifts / Pahaji',
    expensesFilterTab: '💸 Expenses',
    receivedContributionLabel: 'Received Contribution / Pahaji',
    actualExpenseSpentLabel: 'Actual Expense spent',
    materialGiftLabel: 'Material Gift:',
    memoSpecialReminderLabel: 'Memos / Special Reminders note',
    confirmDiaryRecordBtn: 'Confirm Diary Record',
    recordEventPageItemTitle: 'Record Event Page Item',
    salamiPahajiReceivedTab: '🎁 Salami / Pahaji Received',
    expenseSpentOutTab: '💸 Expense Spent Out',
    guestSenderNameLabel: 'Guest / Sender Name',
    savedContactsBtn: '📖 Saved Contacts',
    cashPaidAmountLabel: 'Cash Paid / Salami worth (Rs.)',
    customGiftDescriptionLabel: 'Custom gift item description',
    expenseCategoryLabel: 'Expense Category',
    expenseCashSpentLabel: 'Expense Cash spent (Rs.)',
    memosSpecialReminderLabel: 'Memos / Special Reminders note',
    confirmDiaryRecordFormBtn: 'Confirm Diary Record',
    editCeremonyEntryTitle: '✏️ Edit Ceremony Entry',
    activeLedgerBookSub: 'Active Ledger Book',
    totalCashGivenLabel: 'You Will Receive',
    totalCashGivenDesc: 'Lent/Payable to collect.',
    totalCashReceivedLabel: 'You Need To Pay',
    totalCashReceivedDesc: 'Borrowed/Receivables to repay.',
    netLedgerBalanceLabel: 'Net Balance',
    willCollectPrefix: '⭐ ',
    willCollectSuffix: ' (You will receive money)',
    owePrefix: '⚠️ ',
    oweSuffix: ' (You need to pay)',
    ledgerTimelineTitle: 'Ledger Timeline Ledger entries',
    ledgerTimelineSubtitle: 'History feed of payments, cash logs, returns, or gifts within this folder.',
    addLedgerTransactionRecordTitle: 'Add Ledger Entry Record',
    cashGivenTabLabel: '🟢 CASH GIVEN (I Lent/Paid Out)',
    cashReceivedTabLabel: '🟡 CASH RECEIVED (I Borrowed/Received)',
    partyPersonNameLabel: 'Party Person Name',
    selectFromContactsBtn: '📖 Select from Contacts',
    whatsAppNotificationSub: 'WhatsApp No (For sending notifications)',
    amountPkrLabel: 'Amount (PKR / Currency)',
    whatWasGivenLabel: 'What was given? (e.g., Glass Set, Cash)',
    whatWasGivenPlaceholder: 'e.g. Pure Cash, Tea Set, Dinner Set',
    entryTimestampLabel: 'Entry Timestamp',
    memoRemindersDescLabel: 'Memo/Reminders description',
    memoRemindersDescPlaceholder: 'e.g., Promised to return before eid function ceremonies or construction payment advance info...',
    saveEntryBookRecordBtn: 'Save Entry Book Record',
  },
  urdu: {
    mainCategories: 'بنیادی زمرے',
    loansDashboardLink: 'قرض کھاتہ جات',
    customLedgersHeader: 'کسٹم کھاتے',
    ceremonyEventsHeader: 'تقریبات رجسٹر',
    noCustomLedgersSidebar: 'کوئی بائ کھاتہ نہیں بنایا گیا',
    noEventsSidebar: 'کوئی تقریب طے نہیں ہے',
    ledgerOwnerBadge: 'کھاتہ مالک',
    liveSandboxBanner: '🔒 تمام ریکارڈز کلاؤڈ پر محفوظ ہیں',
    footerEncryptionNote: '🔒 کسی بھی ڈیوائس سے، کہیں بھی سیو لیجر تک رسائی حاصل کریں۔',
    footerCopyrightNote: '"SaveLedger" • قرضے، کھاتے اور مالیاتی ریکارڈز محفوظ طریقے سے منظم کریں۔',
    backToDashboardBtn: '← مین ڈیش بورڈ لسٹ ویو پر واپس جائیں',

    // Auth / Login
    appSubtitle: 'قرضوں، اخراجات اور ایونٹ کے ریکارڈ کا انتظام کریں',
    signInTab: 'لاگ ان کریں',
    registerTab: 'رجسٹریشن',
    fullNameLabel: 'آپ کا پورا نام',
    emailLabel: 'ای میل / جی میل ایڈریس',
    phoneLabel: 'واٹس ایپ رابطہ نمبر (اختیاری)',
    passwordLabel: 'پاس ورڈ',
    forgotPasswordLink: 'پاس ورڈ بھول گئے؟',
    createBookBtn: 'کھاتہ رجسٹر کریں',
    signInBtn: 'کھاتہ لاگ ان کریں',
    orLoginWithLabel: 'یا اس کے ساتھ لاگ ان کریں',
    googleLoginBtn: 'گوگل سے فوری لاگ ان',
    passwordTip: '🔓 پہلے سے موجود صارف کا پاس ورڈ ہے:',
    backToLoginBtn: 'لاگ ان صفحہ پر واپس جائیں',
    retrieveAccountTitle: 'اپنا اکاؤنٹ بازیافت کریں',
    retrieveAccountSubtitle: 'او ٹی پی موصول کرنے کے لئے اپنا رجسٹرڈ جی میل یا موبائل نمبر درج کریں۔',
    emailOrPhoneLabel: 'جی میل یا موبائل نمبر',
    sendOtpBtn: 'او ٹی پی کوڈ بھیجیں',
    verifyOtpTitle: 'او ٹی پی کی تصدیق',
    otpCodeSentSubtitle: 'ہم نے کوڈ بھیجا ہے۔ تصدیقی کوڈ درج کریں اور نیا پاس ورڈ ٹائپ کریں۔',
    otpCodeLabel: '6 ہندسوں کا او ٹی پی درج کریں',
    resendOtpTimer: 'دوبارہ کوڈ بھیجیں:',
    newSecurePasswordLabel: 'نیا محفوظ پاس ورڈ',
    verifySavePasswordBtn: 'تصدیق کریں اور پاس ورڈ محفوظ کریں',
    passwordPlaceholder: 'کم از کم 5 حروف',

    // Dashboard
    switchViewBtn: 'تبدیل کریں',
    aggregatesBannerTitle: 'کھاتہ جات کے مجموعے',
    aggregatesBannerSummaryLoans: 'نیچے کل قرض دی گئی رقم (دیئے گئے) یا ادھار لی گئی رقم (لیے گئے) کی تفصیل دیکھیں۔',
    aggregatesBannerSummaryEvents: 'بجٹ، مہمانوں کی سلامی (پاہاجی)، تحائف اور اخراجات کا حساب کتاب ایک ہی جگہ رکھیں۔',
    addLedgerBookBtn: 'کھاتہ کتاب شامل کریں',
    createNewEventBtn: 'نیا ایونٹ شیڈول کریں',
    totalGivenCol: 'وصول کرنا ہے',
    totalGivenDesc: '(رقم لینی ہے)',
    totalReceivedCol: 'واپس کرنا ہے',
    totalReceivedDesc: '(رقم دینی ہے)',
    netStandingCol: 'نیٹ بیلنس',
    netStandingCollect: '(آپ کو رقم ملنی ہے)',
    netStandingPay: '(آپ نے رقم ادا کرنی ہے)',
    listedEventsCol: ' درج شدہ تقریبات',
    listedEventsCount: 'تقاریب',
    listedEventsUpcoming: 'شیڈولڈ',
    loansCustomLedgersTab: 'قرض کھاتہ جات',
    eventsPahajiDiariesTab: 'تقاریب',
    customLedgerListTitle: 'آپ کے کسٹم کھاتے',
    customLedgerListSubtitle: 'دکانداروں، دوستوں یا تعمیراتی کاموں کے حساب الیحدہ رکھیں ۔',
    newLedgerBtn: 'نیا کھاتہ',
    givenGetsBack: 'دیا ہے (واپس لیں گے)',
    receivedReturns: 'لیا ہے (واپس دیں گے)',
    getsAmt: 'لینے ہیں روپے:',
    owesAmt: 'دینے ہیں روپے:',
    openLedgerBtn: 'کھاتہ کھولیں',
    deleteBtn: 'حذف کریں',
    noCreditLedgersTitle: 'کوئی چالو کھاتہ نہیں ہے',
    noCreditLedgersDesc: 'کاروباری سپلائی چیمبر، کزنز، یا کچن بل اخراجات کے لئے الگ الگ کھاتے بنائیں تاکہ حساب میں الجھن نہ رہے!',
    createFirstLedgerBtn: 'پہلا کھاتہ بنائیں',
    scheduledEventsTitle: 'تقریبات کا ریکارڈ',
    scheduledEventsSubtitle: 'تحائف، نقد سلامی (پاہاجی)، اور پچھلی تقاریب کے لین دین کا ریکارڈ رکھیں۔',
    createEventBtn: 'تقریب بنائیں',
    actualExpenseVsBudget: 'کل بجٹ',
    giftsPahajiReceived: 'موصول شدہ گفٹ اور سلامی:',
    remainingBudget: 'باقی بجٹ',
    budgetLeft: 'باقی ہے',
    budgetOverspent: 'بجٹ سے تجاوز رقم:',
    pahajiItemsRecordedCount: 'درج شدہ پاہاجی اشیاء لسٹ:',
    openCeremonyNotebookBtn: 'پروگرام کی ڈائری کھولیں',
    noEventsTitle: 'کوئی فعال تقریب درج نہیں ہے',
    noEventsDesc: 'کوئی پروگرام شیڈولڈ نہیں ہے۔ شادی بیاہ اخراجات یا سلامیوں کی لسٹ بنانے کے لئے "نیا ایونٹ" بنائیں۔',
    scheduleFirstEventBtn: 'پہلا ایونٹ بنائیں',
    selectStandardCategory: 'عام کیٹیگری کا انتخاب کریں',
    customNameBtn: 'اپنی مرضی کا نام',
    ledgerTitleLabel: 'کھاتے کا عنوان / دکان کا نام',
    descriptionOptionalLabel: 'مختصر تفصیل (اختیاری)',
    cancelBtn: 'کینسل',
    createLedgerBookFormBtn: 'نیا کھاتہ بنائیں',
    scheduleNewEventTitle: 'نیا پروگرام ڈائری درج کریں',
    eventNameLabel: 'پروگرام کا نام / میزبان تقریب',
    plannedBudgetPkrLabel: 'مجموعی بجٹ تخمینہ (روپے)',
    budgetLimitTip: 'ڈیکوریشن، مٹھائی، کیٹرنگ اور دیگر اخراجات کے لئے کل حد۔',
    notesOptionalLabel: 'آرگنائزر نوٹس / مہمانوں کی تفصیل (اختیاری)',
    scheduleEventDiaryBtn: 'پروگرام ڈائری بنائیں',

    // Ledger Detail Page
    addTransactionBtn: 'آمد یا خرچ کا اندراج کریں',
    lentGivenHeader: 'دیا (قرض/ادائیگی)',
    borrowedReceivedHeader: 'لیا (ادھار اور وصولی)',
    owesReceiveHeader: ' بقایا رقم',
    searchTxPlaceholder: 'کھاتہ، تفصیل یا کسٹمر کا نام تلاش کریں...',
    allTransactionsTab: 'تمام ریکارڈز',
    totalNetBalanceHeader: 'کل نیٹ بقایا رقم',
    weOweLabel: 'ہمیں دینے ہیں:',
    theyOweLabel: 'ہمیں لینے ہیں:',
    inBalanceLabel: 'برابر (حساب برابر ہے)',
    givenLabel: 'دی رقم:',
    receivedLabel: 'لی رقم:',
    noTxRecordedTitle: 'ابھی تک کوئی لین دین نہیں ہے',
    noTxRecordedDesc: 'قرض یا ادائیگی کا پہلا ریکارڈ درج کرنے کے لئے نیچے "+ انٹری شامل کریں" کے FAB پر کلک کریں۔',
    editTransactionBtn: 'ریکارڈ تبدیل کریں',
    confirmLedgerRecordBtn: 'اندراج محفوظ کریں',
    editLedgerEntryTitle: 'ریکارڈ تبدیل کریں',
    recordNewLedgerEntryTitle: 'نیا کھاتہ ریکارڈ درج کریں',
    contactPersonNameLabel: 'رابطہ کار کسٹمر کا نام',
    mobileNumberLabel: 'موبائل نمبر (اختیاری)',
    whatsAppLabel: 'واٹس ایپ نمبر (اختیاری)',
    txAmountLabel: 'منتقل شدہ رقم (روپے)',
    txNatureLabel: 'اندراج کی نوعیت / قسم',
    txDateLabel: 'اندراج کی تاریخ اور وقت',
    remarksOptionalLabel: 'کوئی نوٹس یا تفصیل لکھیں (اختیاری)',
    paymentMethodLabel: 'طریقہ ادائیگی',
    cashOnlyOption: 'صرف نقد',
    whatsAppNotifyCheckbox: 'اندراج ہونے پر کسٹمر کو واٹس ایپ پیغام بھیجیں',
    autoFillWhatsAppBtn: 'میسج ٹیمپلیٹ آٹو فل کریں',
    contactPickerTip: 'محفوظ موبائل ڈائرکٹری سے دوستوں یا گاہکوں کے نام منتخب کریں۔',
    savedPhoneContactsTitle: 'محفوظ کانٹیکٹ فہرست',
    closeBtn: 'بند کریں',
    searchContactsPlaceholder: 'سرچ کانٹیکٹس...',
    groupByPerson: '👥 نام کے لحاظ سے',
    dailyFeed: '🕒 روزانہ فیڈ',
    backToAll: '← سارے کھاتے واپس دیکھیں',

    // Event Detail Page
    eventDiaryPlannerTitle: 'پروگرام بجٹ مینیجر',
    recordGiftExpenseBtn: 'سلامی یا خرچ درج کریں',
    plannedBudgetTargetHeader: 'مجموعی بجٹ تخمینہ حد',
    actualExpenseSpentHeader: 'اصل خرچہ ہوا',
    giftsPahajiReceivedHeader: 'موصول شدہ سلامی و تحائف',
    remainingBudgetBalanceHeader: 'باقی بجٹ بیلنس',
    overspentBudgetLabel: '⚠️ بجٹ سے تجاوز',
    underBudgetLabel: '⭐ بجٹ کی حد میں',
    budgetUtilizedProgressTitle: 'بجٹ اخراجات کی پیش رفت',
    estLimitLabel: 'حد:',
    ceremonyLogEntriesTitle: 'پروگرام لاگ ڈائری انٹریز',
    ceremonyLogEntriesSubtitle: 'کس مہمان نے کتنا گفٹ یا سلامی (پاہاجی) دی، یا کتنا خرچ ہوا۔',
    searchGuestsPlaceholder: 'مہمان کا نام، گفٹ، یا خرچ تلاش کریں...',
    allFilterTab: 'تمام ریکارڈز',
    giftsPahajiFilterTab: '🎁 تحائف / پاہاجی',
    expensesFilterTab: '💸 اخراجات',
    receivedContributionLabel: 'وصول شدہ سلامی / گفٹ',
    actualExpenseSpentLabel: 'اصل خرچہ ہوا',
    materialGiftLabel: 'گفٹ تفصیل:',
    memoSpecialReminderLabel: 'خصوصی یاد دہانی (مثلاً اگر انہوں نے پچھلی شادی پر کتنی سلامی دی تھی)',
    confirmDiaryRecordBtn: 'ڈائری انٹری محفوظ کریں',
    recordEventPageItemTitle: 'پروگرام کا اندراج درج کریں',
    salamiPahajiReceivedTab: '🎁 سلامی / پاہاجی ملی',
    expenseSpentOutTab: '💸 خرچہ کیا گیا',
    guestSenderNameLabel: 'مہمان / دینے والے کا نام',
    savedContactsBtn: '📖 محفوظ کانٹیکٹس',
    cashPaidAmountLabel: 'نقد رقم / سلامی مالیت (روپے)',
    customGiftDescriptionLabel: 'گفٹ اشیاء کی مختصر تفصیل',
    expenseCategoryLabel: 'خرچے کی کیٹیگری',
    expenseCashSpentLabel: 'خرچ شدہ رقم (روپے)',
    memosSpecialReminderLabel: 'خصوصی یاد دہانی',
    confirmDiaryRecordFormBtn: 'پروگرام ڈائری محفوظ کریں',
    editCeremonyEntryTitle: '✏️ پروگرام ریکارڈ تبدیل کریں',
    activeLedgerBookSub: 'چالو کھاتہ کتاب',
    totalCashGivenLabel: 'آپ کو ملیں گے',
    totalCashGivenDesc: 'ادھار دیا رقم جو کسٹمرز سے وصول کرنا ہے۔',
    totalCashReceivedLabel: 'آپ نے دینے ہیں',
    totalCashReceivedDesc: 'ادھار لیا رقم جو واپس ادا کرنا ہے۔',
    netLedgerBalanceLabel: 'نیٹ بیلنس',
    willCollectPrefix: '⭐ ',
    willCollectSuffix: ' (آپ کو رقم ملنی ہے)',
    owePrefix: '⚠️ ',
    oweSuffix: ' (آپ نے رقم ادا کرنی ہے)',
    ledgerTimelineTitle: 'کھاتہ کی تفصیلی ہسٹری',
    ledgerTimelineSubtitle: 'اس فولڈر کے اندر ادائیگیوں، نقد لاگز، واپسی، یا تحائف کی ہسٹری۔',
    addLedgerTransactionRecordTitle: 'نیا کھاتہ ریکارڈ درج کریں',
    cashGivenTabLabel: '🟢 رقم دی (قرض / ادائیگی)',
    cashReceivedTabLabel: '🟡 رقم لی (ادھار / وصولی)',
    partyPersonNameLabel: 'رابطہ کار گاہک کا نام',
    selectFromContactsBtn: '📖 محفوظ نمبروں سے منتخب کریں',
    whatsAppNotificationSub: 'واٹس ایپ نمبر (پیغامات بھیجنے کیلئے)',
    amountPkrLabel: 'رقم (روپے)',
    whatWasGivenLabel: 'کیا چیز دی گئی؟ (مثال کے طور پر نقد، ٹی سیٹ)',
    whatWasGivenPlaceholder: 'جیسے خالص نقد، چائے کا سیٹ، ڈنر سیٹ، وغیرہ',
    entryTimestampLabel: 'اندراج کا وقت اور تاریخ',
    memoRemindersDescLabel: 'تفصیل / یاد دہانی نوٹ',
    memoRemindersDescPlaceholder: 'جیسے عید سے پہلے واپسی کا وعدہ یا دکان کے سامان کی تفصیل وغیرہ۔۔۔',
    saveEntryBookRecordBtn: 'کھاتہ انٹری محفوظ کریں',
  },
  hindi: {
    mainCategories: 'मुख्य श्रेणियां',
    loansDashboardLink: 'ऋण बहीखाता',
    customLedgersHeader: 'कस्टम बहीखाता',
    ceremonyEventsHeader: 'समारोह कार्यक्रम',
    noCustomLedgersSidebar: 'कोई बहीखाता नहीं बनाया गया',
    noEventsSidebar: 'कोई कार्यक्रम निर्धारित नहीं है',
    ledgerOwnerBadge: 'बहीखाता मालिक',
    liveSandboxBanner: '🔒 सभी रिकॉर्ड्स क्लाउड पर सुरक्षित रूप से बैकअप हैं',
    footerEncryptionNote: '🔒 किसी भी डिवाइस से, कहीं भी सेव लेजर का उपयोग करें।',
    footerCopyrightNote: '"SaveLedger" • ऋण, बहीखाता और वित्तीय रिकॉर्ड सुरक्षित रूप से प्रबंधित करें।',
    backToDashboardBtn: '← मुख्य डैशबोर्ड सूची पर वापस जाएं',

    // Auth / Login
    appSubtitle: 'ऋण, व्यय और कार्यक्रम रिकॉर्ड प्रबंधित करें',
    signInTab: 'साइन इन करें',
    registerTab: 'पंजीकरण',
    fullNameLabel: 'आपका पूरा नाम',
    emailLabel: 'ईमेल / जीमेल पता',
    phoneLabel: 'व्हाट्सएप / संपर्क नंबर (वैकल्पिक)',
    passwordLabel: 'पासवर्ड',
    forgotPasswordLink: 'पासवर्ड भूल गए?',
    createBookBtn: 'खाता बनाएं',
    signInBtn: 'बहीखाते में साइन इन करें',
    orLoginWithLabel: 'या इसके साथ लॉग इन करें',
    googleLoginBtn: 'गूगल से त्वरित लॉगिन',
    passwordTip: '🔓 डिफ़ॉल्ट उपयोगकर्ता पासवर्ड है:',
    backToLoginBtn: 'लॉगिन पर वापस जाएं',
    retrieveAccountTitle: 'अपना खाता पुनर्प्राप्त करें',
    retrieveAccountSubtitle: 'सुरक्षित ओटीपी प्राप्त करने के लिए अपना पंजीकृत ईमेल या मोबाइल नंबर दर्ज करें।',
    emailOrPhoneLabel: 'ईमेल या मोबाइल नंबर',
    sendOtpBtn: 'ओटीपी कोड भेजें',
    verifyOtpTitle: 'ओटीपी सत्यापित करें',
    otpCodeSentSubtitle: 'हमने एक कोड भेजा है। कोड दर्ज करें और अपना नया पासवर्ड लिखें।',
    otpCodeLabel: '6-अंकीय ओटीपी दर्ज करें',
    resendOtpTimer: 'दोबारा भेजें इसमें उपलब्ध:',
    newSecurePasswordLabel: 'नया सुरक्षित पासवर्ड',
    verifySavePasswordBtn: 'सत्यापित करें और पासवर्ड सहेजें',
    passwordPlaceholder: 'कम से कम 5 अक्षर',

    // Dashboard
    switchViewBtn: 'बदलें',
    aggregatesBannerTitle: 'कुल संचित डेटा',
    aggregatesBannerSummaryLoans: 'नीचे दी गई कुल राशि देखें जो आपने उधार दी है (दिया गया) या उधार ली है (प्राप्त)।',
    aggregatesBannerSummaryEvents: 'बजट, अतिथियों का योगदान (पाहाजी), उपहार और खर्चों का हिसाब एक ही जगह रखें।',
    addLedgerBookBtn: 'बहीखाता बही जोड़ें',
    createNewEventBtn: 'नया कार्यक्रम जोड़ें',
    totalGivenCol: 'प्राप्त करना है',
    totalGivenDesc: '(वापस मिलेगा)',
    totalReceivedCol: 'देना बाकी है',
    totalReceivedDesc: '(चुकाना बाकी है)',
    netStandingCol: 'कुल बैलेंस',
    netStandingCollect: '(पैसे वापस मिलेंगे)',
    netStandingPay: '(पैसे लौटाने हैं)',
    listedEventsCol: 'सूचीबद्ध कार्यक्रम',
    listedEventsCount: 'समारोह',
    listedEventsUpcoming: 'आगामी',
    loansCustomLedgersTab: 'ऋण बहीखाता',
    eventsPahajiDiariesTab: 'कार्यक्रम',
    customLedgerListTitle: 'आपके कस्टम बहीखाते',
    customLedgerListSubtitle: 'दुकानदारों, दोस्तों या विशिष्ट योजनाओं के लिए अलग लेनदेन प्रबंधित करें।',
    newLedgerBtn: 'नया बहीखाता',
    givenGetsBack: 'दिया (वापस लेना है)',
    receivedReturns: 'लिया (वापस देना है)',
    getsAmt: 'लेना है रु.',
    owesAmt: 'देना है रु.',
    openLedgerBtn: 'बहीखाता खोलें',
    deleteBtn: 'हटाएं',
    noCreditLedgersTitle: 'अभी तक कोई ऋण खाता नहीं है',
    noCreditLedgersDesc: 'खातों को अलग से प्रबंधित करने के लिए आपूर्तिकर्ताओं, परिवार, या घर के खर्चों के लिए बहीखाता बनाएं!',
    createFirstLedgerBtn: 'पहला बहीखाता बनाएं',
    scheduledEventsTitle: 'समारोह रिकॉर्ड',
    scheduledEventsSubtitle: 'पिछले समारोहों के उपहार, नकद योगदान (पाहाजी) और लेन-देन की देनदारियों का रिकॉर्ड रखें।',
    createEventBtn: 'कार्यक्रम बनाएं',
    actualExpenseVsBudget: 'नियोजित बजट',
    giftsPahajiReceived: 'प्राप्त उपहार और योगदान:',
    remainingBudget: 'बचा हुआ बजट',
    budgetLeft: 'बचा है',
    budgetOverspent: 'अधिक खर्च हुआ:',
    pahajiItemsRecordedCount: 'दर्ज की गई पाहाजी मदें:',
    openCeremonyNotebookBtn: 'समारोह पुस्तिका खोलें',
    noEventsTitle: 'कोई सक्रिय समारोह या कार्यक्रम नहीं है',
    noEventsDesc: 'कोई कार्यक्रम निर्धारित नहीं है। खर्चों या उपहारों को ट्रैक करने के लिए नया कार्यक्रम बनाएं।',
    scheduleFirstEventBtn: 'पहला कार्यक्रम शेड्यूल करें',
    selectStandardCategory: 'एक मानक बहीखाता श्रेणी चुनें',
    customNameBtn: 'कस्टम नाम',
    ledgerTitleLabel: 'बहीखाता का नाम / व्यवसाय का नाम',
    descriptionOptionalLabel: 'उप-शीर्षक / विवरण (वैकल्पिक)',
    cancelBtn: 'रद्द करें',
    createLedgerBookFormBtn: 'बहीखाता बनाएं',
    scheduleNewEventTitle: 'नई कार्यक्रम डायरी शेड्यूल करें',
    eventNameLabel: 'कार्यक्रम का नाम / अवसर',
    plannedBudgetPkrLabel: 'नियोजित बजट (रु.)',
    budgetLimitTip: 'सजावट, खानपान और अन्य खर्चों के लिए अनुमानित सीमा।',
    notesOptionalLabel: 'आयोजक नोट्स / लक्षित अतिथि (वैकल्पिक)',
    scheduleEventDiaryBtn: 'कार्यक्रम डायरी सहेजें',

    // Ledger Detail Page
    addTransactionBtn: 'प्रविष्टि जोड़ें',
    lentGivenHeader: 'दिया (ऋण/भुगतान)',
    borrowedReceivedHeader: 'लिया (उधार/प्राप्ति)',
    owesReceiveHeader: 'देना / लेना',
    searchTxPlaceholder: 'प्रविष्टियां, विवरण या व्यक्ति का नाम खोजें...',
    allTransactionsTab: 'सभी प्रविष्टियां',
    totalNetBalanceHeader: 'कुल शुद्ध शेष राशि',
    weOweLabel: 'हमें देना है:',
    theyOweLabel: 'हमें लेना है:',
    inBalanceLabel: 'बराबर (कोई शेष नहीं)',
    givenLabel: 'दी गई राशि:',
    receivedLabel: 'प्राप्त राशि:',
    noTxRecordedTitle: 'अभी तक कोई प्रविष्टि नहीं',
    noTxRecordedDesc: 'अपना पहला ऋण या भुगतान दर्ज करने के लिए नीचे "+ प्रविष्टि जोड़ें" के FAB पर क्लिक करें।',
    editTransactionBtn: 'संपादित करें',
    confirmLedgerRecordBtn: 'प्रविष्टि सहेजें',
    editLedgerEntryTitle: 'बहीखाता प्रविष्टि संपादित करें',
    recordNewLedgerEntryTitle: 'नया लेनदेन रिकॉर्ड करें',
    contactPersonNameLabel: 'संपर्क व्यक्ति का नाम',
    mobileNumberLabel: 'मोबाइल नंबर (वैकल्पिक)',
    whatsAppLabel: 'व्हाट्सएप नंबर (वैकल्पिक)',
    txAmountLabel: 'लेनदेन राशि (रु.)',
    txNatureLabel: 'लेनदेन का प्रकार',
    txDateLabel: 'लेनदेन की तारीख / समय',
    remarksOptionalLabel: 'वैकल्पिक विवरण या टिप्पणियां',
    paymentMethodLabel: 'भुगतान का तरीका',
    cashOnlyOption: 'केवल नकद',
    whatsAppNotifyCheckbox: 'व्हाट्सएप पर सूचना भेजें',
    autoFillWhatsAppBtn: 'व्हाट्सएप संदेश टेम्पलेट ऑटो-फिल करें',
    contactPickerTip: 'सहेजे गए संपर्कों से दोस्तों या रिश्तेदारों को आसानी से चुनें।',
    savedPhoneContactsTitle: 'सहेजे गए फ़ोन संपर्क',
    closeBtn: 'बंद करें',
    searchContactsPlaceholder: 'संपर्क खोजें...',
    groupByPerson: '👥 नाम के अनुसार',
    dailyFeed: '🕒 दैनिक फ़ीड',
    backToAll: '← सभी खाते वापस देखें',

    // Event Detail Page
    eventDiaryPlannerTitle: 'कार्यक्रम डायरी योजनाकार',
    recordGiftExpenseBtn: 'उपहार / खर्च प्रविष्टि दर्ज करें',
    plannedBudgetTargetHeader: 'नियोजित बजट लक्ष्य',
    actualExpenseSpentHeader: 'वास्तविक खर्च',
    giftsPahajiReceivedHeader: 'प्राप्त उपहार / पाहाजी',
    remainingBudgetBalanceHeader: 'शेष बजट राशि',
    overspentBudgetLabel: '⚠️ नियोजित बजट लक्ष्य से अधिक',
    underBudgetLabel: '⭐ नियोजित बजट लक्ष्य के अंतर्गत',
    budgetUtilizedProgressTitle: 'बजट उपयोग की प्रगति',
    estLimitLabel: 'अनुमानित सीमा:',
    ceremonyLogEntriesTitle: 'समारोह बही की प्रविष्टियां',
    ceremonyLogEntriesSubtitle: 'कौन मेहमान क्या उपहार या सलामी (पाहाजी) लाया या कहां खर्च हुआ।',
    searchGuestsPlaceholder: 'अतिथियों, उपहार मदों, खर्चों को खोजें...',
    allFilterTab: 'सभी',
    giftsPahajiFilterTab: '🎁 उपहार / पाहाजी',
    expensesFilterTab: '💸 खर्च',
    receivedContributionLabel: 'प्राप्त सलामी / पाहाजी',
    actualExpenseSpentLabel: 'वास्तविक खर्च हुआ',
    materialGiftLabel: 'सामग्री उपहार:',
    memoSpecialReminderLabel: 'विशेष अनुस्मारक नोट',
    confirmDiaryRecordBtn: 'प्रविष्टि दर्ज करें',
    recordEventPageItemTitle: 'कार्यक्रम बही में दर्ज करें',
    salamiPahajiReceivedTab: '🎁 सलामी / पाहाजी प्राप्त हुई',
    expenseSpentOutTab: '💸 खर्च का भुगतान',
    guestSenderNameLabel: 'अतिथि / भेजने वाले का नाम',
    savedContactsBtn: '📖 सहेजे गए संपर्क',
    cashPaidAmountLabel: 'नकद राशि / सलामी मूल्य (रु.)',
    customGiftDescriptionLabel: 'कस्टम उपहार विवरण',
    expenseCategoryLabel: 'खर्च श्रेणी',
    expenseCashSpentLabel: 'खर्च की गई राशि (रु.)',
    memosSpecialReminderLabel: 'विशेष अनुस्मारक नोट',
    confirmDiaryRecordFormBtn: 'प्रविष्टि दर्ज करें',
    editCeremonyEntryTitle: '✏️ समारोह प्रविष्टि संपादित करें',
    activeLedgerBookSub: 'सक्रिय बहीखाता',
    totalCashGivenLabel: 'आपको मिलेंगे',
    totalCashGivenDesc: 'उधार दी गई राशि जो आपको प्राप्त करनी है।',
    totalCashReceivedLabel: 'आपको देने हैं',
    totalCashReceivedDesc: 'उधार ली गई राशि जो आपको वापस करनी है।',
    netLedgerBalanceLabel: 'कुल बैलेंस',
    willCollectPrefix: '⭐ ',
    willCollectSuffix: ' (आपको पैसे मिलेंगे)',
    owePrefix: '⚠️ ',
    oweSuffix: ' (आपको पैसे देने हैं)',
    ledgerTimelineTitle: 'बहीखाता की विस्तृत समयरेखा',
    ledgerTimelineSubtitle: 'इस फ़ोल्डर के भीतर भुगतान, नकद लॉग, रिटर्न या उपहारों का इतिहास।',
    addLedgerTransactionRecordTitle: 'नया बहीखाता प्रविष्टि जोड़ें',
    cashGivenTabLabel: '🟢 नकद दिया (मैंने उधार दिया/भुगतान किया)',
    cashReceivedTabLabel: '🟡 नकद प्राप्त किया (मैंने उधार लिया/प्राप्त किया)',
    partyPersonNameLabel: 'पक्ष/व्यक्ति का नाम',
    selectFromContactsBtn: '📖 संपर्कों से चुनें',
    whatsAppNotificationSub: 'व्हाट्सएप नंबर (सूचनाएं भेजने के लिए)',
    amountPkrLabel: 'राशि (रुपये)',
    whatWasGivenLabel: 'क्या दिया गया? (जैसे नकद, चाय सेट)',
    whatWasGivenPlaceholder: 'जैसे नकद, चाय सेट, डिनर सेट आदि',
    entryTimestampLabel: 'प्रविष्टि समय और तिथि',
    memoRemindersDescLabel: 'मेमो/अनुस्मारक विवरण',
    memoRemindersDescPlaceholder: 'जैसे ईद समारोह से पहले वापस करने का वादा या अग्रिम भुगतान विवरण...',
    saveEntryBookRecordBtn: 'बहीखाता प्रविष्टि सहेजें',
  }
};

export function translatePresetName(name: string, lang: 'english' | 'urdu' | 'hindi'): string {
  const dictionary: Record<string, Record<'english' | 'urdu' | 'hindi', string>> = {
    'Personal & Friends': {
      english: 'Personal & Friends',
      urdu: 'ذاتی اور دوستوں کا کھاتہ',
      hindi: 'व्यक्तिगत और मित्र'
    },
    'Office colleagues': {
      english: 'Office colleagues',
      urdu: 'دفتر کے ساتھی',
      hindi: 'कार्यालय के सहयोगी'
    },
    'Karyana Shop (Suppliers)': {
      english: 'Karyana Shop (Suppliers)',
      urdu: 'کریانہ شاپ (سپلائرز)',
      hindi: 'किराना दुकान (आपूर्तिकर्ता)'
    },
    "Imran's Housewarming Party": {
      english: "Imran's Housewarming Party",
      urdu: 'عمران کا نئے گھر کا فنکشن',
      hindi: 'इमरान का गृहप्रवेश समारोह'
    },
    "Sajid's Daughter Marriage": {
      english: "Sajid's Daughter Marriage",
      urdu: 'ساجد کی بیٹی کی شادی',
      hindi: 'साजिद की बेटी की शादी'
    },
    "Our Son's Aqeeqah Function": {
      english: "Our Son's Aqeeqah Function",
      urdu: 'ہمارے بیٹے کا عقیقہ فنکشن',
      hindi: 'हमारे बेटे का अकीका समारोह'
    },
    'My Contribution (Me)': {
      english: 'My Contribution (Me)',
      urdu: 'میرا حصہ (خود)',
      hindi: 'मेरा योगदान (स्वयं)'
    },
    'Uncle Arshad': {
      english: 'Uncle Arshad',
      urdu: 'انکل ارشد',
      hindi: 'अंकल अरशद'
    },
    'Zeeshan Ali': {
      english: 'Zeeshan Ali',
      urdu: 'ذیشان علی',
      hindi: 'जीशान अली'
    },
    'Muhammad Bilal': {
      english: 'Muhammad Bilal',
      urdu: 'محمد بلال',
      hindi: 'मोहम्मद बिलाल'
    },
    'Ayesha Khan': {
      english: 'Ayesha Khan',
      urdu: 'عائشہ خان',
      hindi: 'आयशा खान'
    },
    'Kamran Mughal': {
      english: 'Kamran Mughal',
      urdu: 'کامران مغل',
      hindi: 'कामरान मुगल'
    },
    'Sajid Mehmood': {
      english: 'Sajid Mehmood',
      urdu: 'ساجد محمود',
      hindi: 'साजिद महमूद'
    },
    'Haris Qureshi': {
      english: 'Haris Qureshi',
      urdu: 'حارث قریشی',
      hindi: 'हारिस कुरैशी'
    },
    'Zainab Bibi': {
      english: 'Zainab Bibi',
      urdu: 'زینب بی بی',
      hindi: 'जैनब बीबी'
    },
    // Gift items / descriptions
    'Tea Set + Glass Set': {
      english: 'Tea Set + Glass Set',
      urdu: 'ٹی سیٹ اور گلاس سیٹ',
      hindi: 'टी सेट + ग्लास सेट'
    },
    'Dinner Set (Luxury 72pc)': {
      english: 'Dinner Set (Luxury 72pc)',
      urdu: 'ڈنر سیٹ لگژری (72 پیس)',
      hindi: 'लक्जरी डिनर सेट (72 पीस)'
    },
    'Cash & Microwave Oven': {
      english: 'Cash & Microwave Oven',
      urdu: 'نقد رقم اور مائیکرو ویو اوون',
      hindi: 'नकद और माइक्रोवेव ओवन'
    },
    'Cash': {
      english: 'Cash',
      urdu: 'نقد رقم',
      hindi: 'नकद'
    },
    'Pedestal Fan': {
      english: 'Pedestal Fan',
      urdu: 'پیڈسٹل پنکھا',
      hindi: 'पेडेस्टल फैन'
    },
    'Baby Gift Pack & Clothes Set': {
      english: 'Baby Gift Pack & Clothes Set',
      urdu: 'بچوں کا گفٹ پیک اور کپڑوں کا سیٹ',
      hindi: 'बेबी गिफ्ट पैक और कपड़े सेट'
    },
    // Expense Categories
    'Travel & Decor': {
      english: 'Travel & Decor',
      urdu: 'سفر اور ڈیکوریشن',
      hindi: 'यात्रा और सजावट'
    },
    'Catering': {
      english: 'Catering',
      urdu: 'کیٹرنگ اور کھانا',
      hindi: 'खान-पान (कैटरिंग)'
    },
    'Tents & Sound': {
      english: 'Tents & Sound',
      urdu: 'ٹینٹ اور ساؤنڈ سسٹم',
      hindi: 'तंबू और साउंड'
    },
    // Transaction type and types
    'Loan': {
      english: 'Loan',
      urdu: 'قرض دینا',
      hindi: 'ऋण देय'
    },
    'Borrow': {
      english: 'Borrow',
      urdu: 'قرض لینا',
      hindi: 'ऋण प्राप्त'
    },
    'Return': {
      english: 'Return',
      urdu: 'واپسی',
      hindi: 'वापसी'
    },
    'Expense': {
      english: 'Expense',
      urdu: 'خرچ',
      hindi: 'व्यय'
    },
    'Gift': {
      english: 'Gift',
      urdu: 'تحفہ',
      hindi: 'उपहार'
    },
    'Contribution': {
      english: 'Contribution',
      urdu: 'تعاون',
      hindi: 'योगदान'
    }
  };

  if (dictionary[name]) {
    return dictionary[name][lang];
  }
  return name;
}

export function translatePresetDesc(desc: string, lang: 'english' | 'urdu' | 'hindi'): string {
  const dictionary: Record<string, Record<'english' | 'urdu' | 'hindi', string>> = {
    'Daily friendly interactions and small loans': {
      english: 'Daily friendly interactions and small loans',
      urdu: 'روزمرہ کے دوستانہ لین دین اور چھوٹے قرضے',
      hindi: 'दैनिक मैत्रीपूर्ण बातचीत और छोटे ऋण'
    },
    'Lunch cash contributions and mutual loans': {
      english: 'Lunch cash contributions and mutual loans',
      urdu: 'دوپہر کے کھانے کے لیے نقد تعاون اور باہمی قرضے',
      hindi: 'लंच कैश योगदान और पारस्परिक ऋण'
    },
    'Groceries store ledger account records': {
      english: 'Groceries store ledger account records',
      urdu: 'کریانہ اسٹور کے کھاتہ جات کے ریکارڈز',
      hindi: 'किराना स्टोर बहीखाता विवरण'
    },
    "Visiting Imran's new rawalpindi house. Recorded to match custom Pahaji settings.": {
      english: "Visiting Imran's new rawalpindi house. Recorded to match custom Pahaji settings.",
      urdu: "عمران کے نئے راولپنڈی گھر کا دورہ۔ کسٹم پاہاجی سیٹنگز کے مطابق ریکارڈ کیا گیا۔",
      hindi: "इमरान के नए रावलपिंडी घर का दौरा। कस्टम पाहाजी सेटिंग्स के अनुसार सहेजा गया।"
    },
    "Daughter wedding gift records. Must tally previous Pahaji lists.": {
      english: "Daughter wedding gift records. Must tally previous Pahaji lists.",
      urdu: "بیٹی کی شادی کے تحائف کا ریکارڈ۔ پچھلی پاہاجی لسٹوں سے موازنہ کرنا ضروری ہے۔",
      hindi: "बेटी की शादी के उपहारों का रिकॉर्ड। पिछली पाहाजी सूची से मिलान आवश्यक है।"
    }
  };

  if (dictionary[desc]) {
    return dictionary[desc][lang];
  }
  return desc;
}

export function translatePresetText(text: string, lang: 'english' | 'urdu' | 'hindi'): string {
  const dictionary: Record<string, Record<'english' | 'urdu' | 'hindi', string>> = {
    'Urgent loan given for business expense. Promised return in 2 weeks.': {
      english: 'Urgent loan given for business expense. Promised return in 2 weeks.',
      urdu: 'کاروباری اخراجات کے لیے فوری قرض دیا گیا۔ 2 ہفتوں میں واپسی کا وعدہ۔',
      hindi: 'व्यापार व्यय के लिए दिया गया तत्काल ऋण। 2 सप्ताह में वापसी का वादा।'
    },
    'Borrowed for petrol and grocery emergencies.': {
      english: 'Borrowed for petrol and grocery emergencies.',
      urdu: 'پیٹرول اور دیگر ضروری اشیاء کے لیے ادھار لیا گیا۔',
      hindi: 'पेट्रोल और किराना आपात स्थिति के लिए उधार लिया गया।'
    },
    'Zeeshan returned partial loan amount.': {
      english: 'Zeeshan returned partial loan amount.',
      urdu: 'ذیشان نے ادھارے ہوئے کچھ پیسے واپس کیے۔',
      hindi: 'जीशान ने आंशिक ऋण राशि लौटाई।'
    },
    'Paid office tea bill for the whole team.': {
      english: 'Paid office tea bill for the whole team.',
      urdu: 'پوری ٹیم کے چائے کا بل ادا کیا۔',
      hindi: 'पूरी टीम के लिए कार्यालय के चाय बिल का भुगतान किया।'
    },
    'Lunch contribution received.': {
      english: 'Lunch contribution received.',
      urdu: 'دوپہر کے کھانے کا حصہ مل گیا۔',
      hindi: 'लंच का योगदान प्राप्त हुआ।'
    },
    'Monthly wholesale supply credit items.': {
      english: 'Monthly wholesale supply credit items.',
      urdu: 'ماہانہ ہول سیل سپلائی ادھار اشیاء۔',
      hindi: 'मासिक थोक आपूर्ति क्रेडिट वस्तुएं।'
    },
    'Paid back partial wholesale supplier amount.': {
      english: 'Paid back partial wholesale supplier amount.',
      urdu: 'ہول سیل سپلائر کو ادائیگی کا کچھ حصہ واپس کیا۔',
      hindi: 'थोक आपूर्तिकर्ताओं को आंशिक राशि का भुगतान किया।'
    },
    'Gave a nice 12-piece Tea & Glass Set and Rs. 2,000 cash contribution.': {
      english: 'Gave a nice 12-piece Tea & Glass Set and Rs. 2,000 cash contribution.',
      urdu: 'ایک خوبصورت 12 پیس ٹی اور گلاس سیٹ اور 2,000 روپے نقد مدد دی۔',
      hindi: 'एक अच्छा 12-पीस टी एंड ग्लास सेट और 2,000 रुपये नकद योगदान दिया।'
    },
    'Fuel cost to attend the event.': {
      english: 'Fuel cost to attend the event.',
      urdu: 'سفر اور فیول اخراجات۔',
      hindi: 'इवेंट में शामिल होने के लिए ईंधन की लागत।'
    },
    'Gave luxury dinner set + Rs. 5000 cash as Salami/Pahaji.': {
      english: 'Gave luxury dinner set + Rs. 5000 cash as Salami/Pahaji.',
      urdu: 'لگژری ڈنر سیٹ اور 5,000 روپے سلامی/پاہاجی کی صورت میں دیے۔',
      hindi: 'सलामी/पाहाजी के रूप में लग्जरी डिनर सेट + 5,000 रुपये नकद दिए।'
    },
    'Received Salami / Pahaji for our son Aqeeqah.': {
      english: 'Received Salami / Pahaji for our son Aqeeqah.',
      urdu: 'ہمارے بیٹے کے عقیقہ کے لیے سلامی / پاہاجی موصول ہوئی۔',
      hindi: 'हमारे बेटे के अकीका के लिए सलामी/पाहाजी प्राप्त हुई।'
    },
    'Returned Rs. 5,000 Salami / Pahaji (We gave him Rs. 3,000 last year on his birthday).': {
      english: 'Returned Rs. 5,000 Salami / Pahaji (We gave him Rs. 3,000 last year on his birthday).',
      urdu: '5,000 روپے سلامی / پاہاجی واپس کی (ہم نے پچھلے سال سالگرہ پر 3,000 روپے دیے تھے)۔',
      hindi: '5,000 रुपये सलामी/पाहाजी लौटाई (हमने पिछले साल उनके जन्मदिन पर 3,000 रुपये दिए थे)।'
    },
    'Gave baby blankets, standard garments.': {
      english: 'Gave baby blankets, standard garments.',
      urdu: 'بچوں کے کپڑے اور کمبل دیے۔',
      hindi: 'बेबी ब्लैंकेट और रेडीमेड कपड़े दिए।'
    },
    'Gave a nice GFC Pedestal Fan.': {
      english: 'Gave a nice GFC Pedestal Fan.',
      urdu: 'پیڈسٹل پنکھا تحفہ دیا۔',
      hindi: 'एक अच्छा GFC पेडेस्टल फैन दिया।'
    },
    'Paid Deg / Food (Mutton Palao & Kheer) catering bill.': {
      english: 'Paid Deg / Food (Mutton Palao & Kheer) catering bill.',
      urdu: 'کھانے کی دیگوں کا بل (مٹن پلاؤ اور کھیر) ادا کیا۔',
      hindi: 'देग / भोजन (मटन पुलाव और खीर) कैटरिंग बिल का भुगतान किया।'
    },
    'Tent service & seating arrangements.': {
      english: 'Tent service & seating arrangements.',
      urdu: 'ٹینٹ سروس اور بچھانے کا خرچہ۔',
      hindi: 'तंबू सेवा और बैठने की व्यवस्था।'
    }
  };

  if (dictionary[text]) {
    return dictionary[text][lang];
  }
  return text;
}
