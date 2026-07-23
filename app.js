import { createClient } from "@supabase/supabase-js";

const rooms = [
  { id: "101", type: "Suite", group: "lux" },
  { id: "106", type: "Suite", group: "lux" },
  { id: "207", type: "Suite", group: "lux" },
  { id: "102", type: "Standard", group: "standard" },
  { id: "104", type: "Standard", group: "standard" },
  { id: "202", type: "Standard", group: "standard" },
  { id: "203", type: "Standard", group: "standard" },
  { id: "204", type: "Standard", group: "standard" },
  { id: "205", type: "Standard", group: "standard" },
  { id: "103", type: "Twin", group: "two-beds" },
  { id: "105", type: "Triple", group: "three-beds" },
  { id: "201", type: "Junior Suite", group: "semi-lux" },
  { id: "206", type: "Junior Suite", group: "semi-lux" },
];

const roomTypeOrder = ["Suite", "Standard", "Twin", "Triple", "Junior Suite"];
const storageKey = "hotel-desk-stays-v1";
const activeSectionStorageKey = "hotel-desk-active-section-v1";
const languageStorageKey = "hotel-desk-language-v1";
const defaultBookingColor = "#4f7cff";
const sectionStorageValues = new Set(["dashboard", "new-stay", "stays", "calendar", "rooms"]);
const georgianMonthNames = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];
const georgianWeekdayShortNames = ["კვი", "ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ"];
const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const supabaseUrl = env.VITE_SUPABASE_URL || window.HOTEL_SUPABASE_URL || "https://clbrcyezqiiuzmwlkydz.supabase.co";
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  window.HOTEL_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYnJjeWV6cWlpdXptd2xreWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzEwMzAsImV4cCI6MjEwMDMwNzAzMH0.1yhkwib_Aqf2DKfbM5eRBQCSzgQ7cy9NWcq08oZg58I";
const configuredLoginEmail = env.VITE_APP_LOGIN_EMAIL || "batumimarseille@gmail.com";
const supabaseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const usesSupabase = Boolean(supabaseClient);

const translations = {
  en: {
    brand: { eyebrow: "Hotel" },
    language: { label: "Language" },
    auth: {
      privateAccess: "Private access",
      title: "Sign in to dashboard",
      description: "Use the hotel account to manage stays, rooms, payments, and the calendar.",
      email: "Email",
      emailPlaceholder: "batumimarseille@gmail.com",
      password: "Password",
      passwordPlaceholder: "Password",
      signIn: "Sign in",
      signingIn: "Signing in...",
      signInError: "Could not sign in. Check email and password.",
    },
    nav: {
      dashboard: "Overview",
      "new-stay": "New stay",
      stays: "Records",
      calendar: "Calendar",
      rooms: "Rooms",
    },
    pageHeaders: {
      dashboard: {
        eyebrow: "Admin panel",
        title: "Overview",
        description: "A quick summary of check-ins, check-outs, debts, and current room occupancy.",
      },
      "new-stay": {
        eyebrow: "New record",
        title: "New stay",
        description: "Add a guest, choose a room, stay dates, calendar color, and payment method.",
      },
      "edit-stay": {
        eyebrow: "Edit record",
        title: "Edit stay",
        description: "Update guest details, room, stay dates, payment split, or notes.",
      },
      stays: {
        eyebrow: "History",
        title: "Records",
        description: "All bookings and stays in one list: statuses, payments, debts, and quick actions.",
      },
      calendar: {
        eyebrow: "Planning",
        title: "Occupancy calendar",
        description: "View available and occupied dates for each room to avoid double-booking.",
      },
      rooms: {
        eyebrow: "Room inventory",
        title: "Rooms",
        description: "13 Hotel Marseille rooms grouped by category and capacity.",
      },
    },
    roomTypes: {
      Suite: "Suite",
      Standard: "Standard",
      Twin: "Twin",
      Triple: "Triple",
      "Junior Suite": "Junior Suite",
    },
    status: {
      booked: "Booked",
      "checked-in": "Checked in",
      "checked-out": "Checked out",
      cancelled: "Cancelled",
    },
    storage: {
      localTitle: "Local demo version",
      localText: "Data is currently saved only in this browser.",
      cloudTitle: "Cloud version",
      cloudText: "Data is stored in Supabase for the hotel account.",
      signOut: "Sign out",
    },
    stats: {
      occupied: "Occupied",
      roomsNow: "rooms now",
      arrivalsToday: "Arrivals today",
      waitingCheckIn: "waiting for check-in",
      departuresToday: "Departures today",
      needReview: "need review",
      debt: "Debt",
      activeRecords: "across active records",
    },
    panels: {
      rooms: "Rooms",
      currentOccupancy: "Current occupancy",
      today: "Today",
      activeGuests: "Active guests",
      record: "Record",
      records: "Records",
      allRecords: "All records",
      calendar: "Calendar",
      roomOccupancy: "Room occupancy",
      inventory: "Inventory",
      roomsByCategory: "13 rooms by category",
    },
    filters: {
      all: "All",
      checkedIn: "Checked in",
      booked: "Bookings",
      checkedOut: "Checked out",
      debt: "Debt",
    },
    table: {
      guest: "Guest",
      room: "Room",
      dates: "Dates",
      total: "Total",
      payment: "Payment",
      status: "Status",
      empty: "No records yet.",
      noNotes: "No notes",
      paid: "Paid",
      debt: "Debt",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Delete this record?",
    },
    form: {
      record: "Record",
      addStay: "Add stay",
      editStay: "Edit stay",
      saveStay: "Save stay",
      saveChanges: "Save changes",
      cancel: "Cancel",
      guestName: "Guest name",
      guestPlaceholder: "For example, John Smith",
      company: "Company",
      companyExisting: "Existing",
      companyNew: "New",
      companyNone: "No company",
      companyNewPlaceholder: "New company name",
      color: "Color",
      room: "Room",
      stayDates: "Stay dates",
      selectStayDates: "Select stay dates",
      selectCheckout: "select check-out",
      clearDates: "Clear dates",
      total: "Total amount, ₾",
      cash: "Cash, ₾",
      card: "Card, ₾",
      invoice: "Invoice, ₾",
      debt: "Debt, ₾",
      notes: "Notes",
      notesPlaceholder: "Special requests, contact, notes",
      chooseCheckIn: "Select check-in date",
      chooseCheckOut: "Select check-out date",
      selectedRoom: "Room",
      selectRoom: "Select a room",
      occupiedUnavailable: "occupied / unavailable",
      selectedRange: "selected range",
      applyDates: "Apply dates",
      datesApplied: "Dates applied.",
      selectBothBeforeApply: "Select both check-in and check-out dates before applying.",
      updateHint: "You can update dates, payment, room, or notes.",
      editingCancelled: "Editing cancelled.",
    },
    calendar: {
      room: "Room",
      today: "Today",
      hint: "One column = one day. A colored cell means the room is occupied on that date.",
      emptyDetails: "Click a colored calendar cell to view booking details.",
      to: "to",
      total: "Total",
      outstandingDebt: "Outstanding debt",
      paymentBalanced: "Payment is balanced.",
      closeDetails: "Close details",
    },
    activeGuests: {
      empty: "No active guests right now.",
      checkout: "Check-out",
      review: "Click to review and edit",
    },
    common: {
      available: "Available",
      room: "room",
      rooms: "rooms",
      pastDate: "Past dates cannot be selected",
      rangeConflict: "Selected range includes occupied dates",
      selectBothDates: "Select check-in and check-out dates.",
      selectDates: "Select stay dates",
      checkoutAfterCheckin: "Check-out date must be after check-in date.",
      roomConflict: "This room is already occupied for the selected dates.",
      recordUpdated: "Record updated.",
      staySaved: "Stay saved.",
      saveError: "Could not save this record. Please check the connection and try again.",
      selectRoom: "Select a room",
    },
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  ka: {
    brand: { eyebrow: "სასტუმრო" },
    language: { label: "ენა" },
    auth: {
      privateAccess: "პირადი წვდომა",
      title: "პანელში შესვლა",
      description: "გამოიყენეთ სასტუმროს ანგარიში ჯავშნების, ნომრების, გადახდებისა და კალენდრის სამართავად.",
      email: "ელფოსტა",
      emailPlaceholder: "batumimarseille@gmail.com",
      password: "პაროლი",
      passwordPlaceholder: "პაროლი",
      signIn: "შესვლა",
      signingIn: "შესვლა მიმდინარეობს...",
      signInError: "შესვლა ვერ მოხერხდა. გადაამოწმეთ ელფოსტა და პაროლი.",
    },
    nav: {
      dashboard: "მიმოხილვა",
      "new-stay": "ახალი შესახლება",
      stays: "ჟურნალი",
      calendar: "კალენდარი",
      rooms: "ნომრები",
    },
    pageHeaders: {
      dashboard: {
        eyebrow: "ადმინისტრატორის პანელი",
        title: "მიმოხილვა",
        description: "სწრაფი შეჯამება შესახლებებზე, გასვლებზე, ვალებზე და ნომრების მიმდინარე დაკავებაზე.",
      },
      "new-stay": {
        eyebrow: "ახალი ჩანაწერი",
        title: "ახალი შესახლება",
        description: "დაამატეთ სტუმარი, აირჩიეთ ნომერი, ცხოვრების თარიღები, კალენდრის ფერი და გადახდის მეთოდი.",
      },
      "edit-stay": {
        eyebrow: "ჩანაწერის რედაქტირება",
        title: "შესახლების რედაქტირება",
        description: "განაახლეთ სტუმრის მონაცემები, ნომერი, თარიღები, გადახდა ან შენიშვნები.",
      },
      stays: {
        eyebrow: "ისტორია",
        title: "ჟურნალი",
        description: "ყველა ჯავშანი და შესახლება ერთ სიაში: სტატუსები, გადახდები, ვალები და სწრაფი მოქმედებები.",
      },
      calendar: {
        eyebrow: "დაგეგმვა",
        title: "დაკავებულობის კალენდარი",
        description: "ნახეთ თავისუფალი და დაკავებული თარიღები თითოეული ნომრისთვის.",
      },
      rooms: {
        eyebrow: "ნომრების სია",
        title: "ნომრები",
        description: "Hotel Marseille-ის 13 ნომერი კატეგორიებისა და ტევადობის მიხედვით.",
      },
    },
    roomTypes: {
      Suite: "ლუქსი",
      Standard: "სტანდარტი",
      Twin: "ორი საწოლი",
      Triple: "სამი საწოლი",
      "Junior Suite": "ნახევრად ლუქსი",
    },
    status: {
      booked: "ჯავშანი",
      "checked-in": "შესახლებული",
      "checked-out": "გასული",
      cancelled: "გაუქმებული",
    },
    storage: {
      localTitle: "ლოკალური დემო-ვერსია",
      localText: "მონაცემები დროებით ინახება მხოლოდ ამ ბრაუზერში.",
      cloudTitle: "ღრუბლოვანი ვერსია",
      cloudText: "მონაცემები ინახება Supabase-ში სასტუმროს ანგარიშისთვის.",
      signOut: "გასვლა",
    },
    stats: {
      occupied: "დაკავებულია",
      roomsNow: "ნომერი ახლა",
      arrivalsToday: "დღევანდელი შესახლებები",
      waitingCheckIn: "ელოდება შესახლებას",
      departuresToday: "დღევანდელი გასვლები",
      needReview: "საჭიროა შემოწმება",
      debt: "ვალი",
      activeRecords: "აქტიურ ჩანაწერებში",
    },
    panels: {
      rooms: "ნომრები",
      currentOccupancy: "მიმდინარე დაკავება",
      today: "დღეს",
      activeGuests: "აქტიური სტუმრები",
      record: "ჩანაწერი",
      records: "ჩანაწერები",
      allRecords: "ყველა ჩანაწერი",
      calendar: "კალენდარი",
      roomOccupancy: "ნომრების დაკავება",
      inventory: "ნომრების სია",
      roomsByCategory: "13 ნომერი კატეგორიების მიხედვით",
    },
    filters: {
      all: "ყველა",
      checkedIn: "შესახლებული",
      booked: "ჯავშნები",
      checkedOut: "გასული",
      debt: "ვალი",
    },
    table: {
      guest: "სტუმარი",
      room: "ნომერი",
      dates: "თარიღები",
      total: "ჯამი",
      payment: "გადახდა",
      status: "სტატუსი",
      empty: "ჩანაწერები ჯერ არ არის.",
      noNotes: "შენიშვნები არ არის",
      paid: "გადახდილია",
      debt: "ვალი",
      edit: "რედაქტირება",
      delete: "წაშლა",
      confirmDelete: "წავშალოთ ეს ჩანაწერი?",
    },
    form: {
      record: "ჩანაწერი",
      addStay: "შესახლების დამატება",
      editStay: "შესახლების რედაქტირება",
      saveStay: "შესახლების შენახვა",
      saveChanges: "ცვლილებების შენახვა",
      cancel: "გაუქმება",
      guestName: "სტუმრის სახელი",
      guestPlaceholder: "მაგალითად, Ivan Petrov",
      company: "კომპანია",
      companyExisting: "არსებული",
      companyNew: "ახალი",
      companyNone: "კომპანიის გარეშე",
      companyNewPlaceholder: "ახალი კომპანიის სახელი",
      color: "ფერი",
      room: "ნომერი",
      stayDates: "ცხოვრების თარიღები",
      selectStayDates: "აირჩიეთ ცხოვრების თარიღები",
      selectCheckout: "აირჩიეთ გასვლის თარიღი",
      clearDates: "თარიღების გასუფთავება",
      total: "ჯამური თანხა, ₾",
      cash: "ნაღდი, ₾",
      card: "ბარათი, ₾",
      invoice: "ინვოისი, ₾",
      debt: "ვალი, ₾",
      notes: "კომენტარი",
      notesPlaceholder: "განსაკუთრებული პირობები, კონტაქტი, შენიშვნა",
      chooseCheckIn: "აირჩიეთ შესვლის თარიღი",
      chooseCheckOut: "აირჩიეთ გასვლის თარიღი",
      selectedRoom: "ნომერი",
      selectRoom: "აირჩიეთ ნომერი",
      occupiedUnavailable: "დაკავებული / მიუწვდომელი",
      selectedRange: "არჩეული პერიოდი",
      applyDates: "თარიღების დადასტურება",
      datesApplied: "თარიღები არჩეულია.",
      selectBothBeforeApply: "დადასტურებამდე აირჩიეთ შესვლის და გასვლის თარიღები.",
      updateHint: "შეგიძლიათ შეცვალოთ თარიღები, გადახდა, ნომერი ან შენიშვნები.",
      editingCancelled: "რედაქტირება გაუქმდა.",
    },
    calendar: {
      room: "ნომერი",
      today: "დღეს",
      hint: "ერთი სვეტი = ერთი დღე. ფერადი უჯრა ნიშნავს, რომ ნომერი ამ თარიღში დაკავებულია.",
      emptyDetails: "დეტალების სანახავად დააჭირეთ კალენდარში ფერად უჯრას.",
      to: "დან",
      total: "ჯამი",
      outstandingDebt: "დარჩენილი ვალი",
      paymentBalanced: "გადახდა დაბალანსებულია.",
      closeDetails: "დეტალების დახურვა",
    },
    activeGuests: {
      empty: "აქტიური სტუმრები ახლა არ არის.",
      checkout: "გასვლა",
      review: "რედაქტირებისთვის დააჭირეთ",
    },
    common: {
      available: "თავისუფალია",
      room: "ნომერი",
      rooms: "ნომერი",
      pastDate: "წარსული თარიღის არჩევა შეუძლებელია",
      rangeConflict: "არჩეულ პერიოდში არის დაკავებული თარიღები",
      selectBothDates: "აირჩიეთ შესვლის და გასვლის თარიღები.",
      selectDates: "აირჩიეთ ცხოვრების თარიღები.",
      checkoutAfterCheckin: "გასვლის თარიღი უნდა იყოს შესვლის შემდეგ.",
      roomConflict: "ეს ნომერი არჩეულ თარიღებში უკვე დაკავებულია.",
      recordUpdated: "ჩანაწერი განახლდა.",
      staySaved: "ჩანაწერი შენახულია.",
      saveError: "ჩანაწერის შენახვა ვერ მოხერხდა. გადაამოწმეთ კავშირი და სცადეთ თავიდან.",
      selectRoom: "აირჩიეთ ნომერი",
    },
    weekdays: ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვი"],
  },
};

let stays = [];
let companies = [];
let activeFilter = "all";
let highlightedStayId = null;
let highlightedCalendarStayId = null;
let editingStayId = null;
let calendarStart = addDays(todayDate(), -3);
let selectedCalendarStayId = null;
let formCalendarMonth = new Date(todayDate().getFullYear(), todayDate().getMonth(), 1);
let activeDateField = "checkIn";
let isDatePickerOpen = false;
let formDateHover = null;
let pendingCheckIn = "";
let pendingCheckOut = "";
let currentLanguage = getStoredLanguage();
let currentSectionName = "dashboard";
let didJustSignIn = false;

const selectors = {
  navItems: document.querySelectorAll(".nav-item"),
  sections: document.querySelectorAll(".section-block"),
  newStaySection: document.querySelector("#newStaySection"),
  editStaySection: document.querySelector("#editStaySection"),
  stayFormPanel: document.querySelector("#stayFormPanel"),
  pageEyebrow: document.querySelector("#pageEyebrow"),
  pageTitle: document.querySelector("#pageTitle"),
  pageDescription: document.querySelector("#pageDescription"),
  roomSelect: document.querySelector("#roomSelect"),
  companySelect: document.querySelector("#companySelect"),
  companyNewInput: document.querySelector("#companyNewInput"),
  companyModeInputs: document.querySelectorAll('input[name="companyMode"]'),
  stayForm: document.querySelector("#stayForm"),
  formTitle: document.querySelector("#formTitle"),
  formMessage: document.querySelector("#formMessage"),
  formSubmitButton: document.querySelector("#formSubmitButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  roomMap: document.querySelector("#roomMap"),
  roomGroups: document.querySelector("#roomGroups"),
  activeGuestList: document.querySelector("#activeGuestList"),
  staysTable: document.querySelector("#staysTable"),
  filterChips: document.querySelectorAll(".filter-chip"),
  occupiedStat: document.querySelector("#occupiedStat"),
  arrivalsStat: document.querySelector("#arrivalsStat"),
  departuresStat: document.querySelector("#departuresStat"),
  debtStat: document.querySelector("#debtStat"),
  statCards: document.querySelectorAll("[data-stat-filter]"),
  occupancyCalendar: document.querySelector("#occupancyCalendar"),
  bookingDetailsPanel: document.querySelector("#bookingDetailsPanel"),
  calendarRange: document.querySelector("#calendarRange"),
  calendarPrevButton: document.querySelector("#calendarPrevButton"),
  calendarNextButton: document.querySelector("#calendarNextButton"),
  calendarTodayButton: document.querySelector("#calendarTodayButton"),
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  loginForm: document.querySelector("#loginForm"),
  loginMessage: document.querySelector("#loginMessage"),
  logoutButton: document.querySelector("#logoutButton"),
  storageModeTitle: document.querySelector("#storageModeTitle"),
  storageModeText: document.querySelector("#storageModeText"),
  dateRangeField: document.querySelector("#dateRangeField"),
  dateRangeButton: document.querySelector("#dateRangeButton"),
  dateRangeDisplay: document.querySelector("#dateRangeDisplay"),
  dateClearButton: document.querySelector("#dateClearButton"),
  formDateCalendar: document.querySelector("#formDateCalendar"),
  languageSelect: document.querySelector("#languageSelect"),
};


function getTranslationValue(path, dictionary) {
  return path.split(".").reduce((value, key) => value?.[key], dictionary);
}

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(languageStorageKey);
    return translations[stored] ? stored : "en";
  } catch {
    return "en";
  }
}

function getStoredSection() {
  try {
    const stored = localStorage.getItem(activeSectionStorageKey);
    return sectionStorageValues.has(stored) ? stored : "dashboard";
  } catch {
    return "dashboard";
  }
}

function storeActiveSection(sectionName) {
  if (!sectionStorageValues.has(sectionName)) return;

  try {
    localStorage.setItem(activeSectionStorageKey, sectionName);
  } catch {
    // Browsers can block localStorage in private mode.
  }
}

function t(path) {
  const currentValue = getTranslationValue(path, translations[currentLanguage] || translations.en);
  if (currentValue !== undefined) return currentValue;

  const fallbackValue = getTranslationValue(path, translations.en);
  return fallbackValue !== undefined ? fallbackValue : path;
}

function getLocale() {
  return currentLanguage === "ka" ? "ka-GE" : "en-GB";
}

function getNumberLocale() {
  return currentLanguage === "ka" ? "ka-GE" : "en-US";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString(getNumberLocale());
}

function roomTypeLabel(type) {
  return t(`roomTypes.${type}`) || type;
}

function getPageHeader(sectionName) {
  return t(`pageHeaders.${sectionName}`) || translations.en.pageHeaders.dashboard;
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;

  if (selectors.languageSelect) {
    selectors.languageSelect.value = currentLanguage;
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = t(node.dataset.i18n);
    if (typeof value === "string") node.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const value = t(node.dataset.i18nPlaceholder);
    if (typeof value === "string") node.setAttribute("placeholder", value);
  });

  if (selectors.dateClearButton) {
    selectors.dateClearButton.setAttribute("aria-label", t("form.clearDates"));
  }
}

function setLanguage(language) {
  if (!translations[language]) return;

  currentLanguage = language;
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // Ignore blocked storage.
  }

  applyStaticTranslations();
  populateRoomSelect();
  populateCompanyOptions();
  updateDateRangeDisplay();

  const header = getPageHeader(currentSectionName);
  if (selectors.pageEyebrow) selectors.pageEyebrow.textContent = header.eyebrow;
  if (selectors.pageTitle) selectors.pageTitle.textContent = header.title;
  if (selectors.pageDescription) selectors.pageDescription.textContent = header.description;

  renderAll();
}

function todayDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDate(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isSameDate(first, second) {
  return first.getTime() === second.getTime();
}

function loadLocalStays() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveLocalStays() {
  localStorage.setItem(storageKey, JSON.stringify(stays));
}

function normalizeCompanyName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function getCompanyNameById(companyId) {
  return companies.find((company) => company.id === companyId)?.name || "";
}

function populateCompanyOptions(selectedCompanyId = selectors.companySelect?.value || "") {
  if (!selectors.companySelect) return;

  selectors.companySelect.innerHTML = [
    `<option value="">${t("form.companyNone")}</option>`,
    ...companies
      .slice()
      .sort((first, second) => normalizeCompanyName(first.name).localeCompare(normalizeCompanyName(second.name), getLocale()))
      .map((company) => `<option value="${company.id}">${normalizeCompanyName(company.name)}</option>`),
  ].join("");

  selectors.companySelect.value = companies.some((company) => company.id === selectedCompanyId) ? selectedCompanyId : "";
}

function setCompanyMode(mode) {
  const nextMode = mode === "new" ? "new" : "existing";

  selectors.companyModeInputs?.forEach((input) => {
    input.checked = input.value === nextMode;
  });
  selectors.companySelect?.classList.toggle("hidden", nextMode !== "existing");
  selectors.companyNewInput?.classList.toggle("hidden", nextMode !== "new");

  if (nextMode === "new") {
    selectors.companySelect.value = "";
  } else if (selectors.companyNewInput) {
    selectors.companyNewInput.value = "";
  }
}

function getCompanyOptions() {
  const byName = new Map();

  companies.forEach((company) => {
    const name = normalizeCompanyName(company.name);
    if (name) byName.set(name.toLocaleLowerCase(), name);
  });

  stays.forEach((stay) => {
    const name = normalizeCompanyName(stay.companyName);
    if (name) byName.set(name.toLocaleLowerCase(), name);
  });

  return Array.from(byName.values())
    .sort((first, second) => first.localeCompare(second, getLocale()))
    .map((name) => ({ id: name.toLocaleLowerCase(), name }));
}

function mapStayFromDatabase(row) {
  const company = row.companies || null;

  return {
    id: row.id,
    guestName: row.guest_name,
    companyId: row.company_id || company?.id || undefined,
    companyName: company?.name || row.company_name || "",
    roomId: row.room_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    total: Number(row.total_amount || 0),
    cash: Number(row.cash_amount || 0),
    card: Number(row.card_amount || 0),
    invoice: Number(row.invoice_amount || 0),
    debt: Number(row.debt_amount || 0),
    notes: row.notes || "",
    color: row.color || defaultBookingColor,
    status: row.is_cancelled ? "cancelled" : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStayToDatabase(stay) {
  return {
    id: stay.id,
    guest_name: stay.guestName,
    company_id: stay.companyId || null,
    room_id: stay.roomId,
    check_in: stay.checkIn,
    check_out: stay.checkOut,
    color: stay.color || defaultBookingColor,
    total_amount: Number(stay.total || 0),
    cash_amount: Number(stay.cash || 0),
    card_amount: Number(stay.card || 0),
    invoice_amount: Number(stay.invoice || 0),
    debt_amount: Number(stay.debt || 0),
    notes: stay.notes || "",
    is_cancelled: stay.status === "cancelled",
  };
}

async function loadCompanies() {
  if (!usesSupabase) {
    return getCompanyOptions();
  }

  const { data, error } = await supabaseClient
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load companies from Supabase", error);
    return [];
  }

  return data || [];
}

async function ensureStayCompanies() {
  const companyNames = Array.from(
    new Set(stays.map((stay) => normalizeCompanyName(stay.companyName)).filter(Boolean))
  );

  if (!companyNames.length) return true;

  if (!usesSupabase) {
    companies = getCompanyOptions();
    return true;
  }

  const existingByName = new Map(
    companies.map((company) => [normalizeCompanyName(company.name).toLocaleLowerCase(), company])
  );
  const missingNames = companyNames.filter((name) => !existingByName.has(name.toLocaleLowerCase()));

  if (missingNames.length > 0) {
    const { data, error } = await supabaseClient
      .from("companies")
      .upsert(missingNames.map((name) => ({ name })), { onConflict: "name" })
      .select("*");

    if (error) {
      console.error("Failed to save companies", error);
      return false;
    }

    (data || []).forEach((company) => {
      existingByName.set(normalizeCompanyName(company.name).toLocaleLowerCase(), company);
    });
    companies = Array.from(existingByName.values()).sort((first, second) => first.name.localeCompare(second.name));
  }

  stays = stays.map((stay) => {
    const name = normalizeCompanyName(stay.companyName);
    if (!name) return { ...stay, companyId: undefined, companyName: "" };

    const company = existingByName.get(name.toLocaleLowerCase());
    return {
      ...stay,
      companyId: company?.id,
      companyName: company?.name || name,
    };
  });

  return true;
}

async function loadStays() {
  if (!usesSupabase) {
    return loadLocalStays();
  }

  const { data, error } = await supabaseClient
    .from("stays")
    .select("*, companies(id, name)")
    .order("check_in", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load stays from Supabase", error);
    return [];
  }

  return (data || []).map(mapStayFromDatabase);
}

async function saveStays() {
  if (!usesSupabase) {
    await ensureStayCompanies();
    populateCompanyOptions();
    saveLocalStays();
    return true;
  }

  const companiesSaved = await ensureStayCompanies();
  if (!companiesSaved) return false;

  const nextRows = stays.map(mapStayToDatabase);
  const nextIds = nextRows.map((row) => row.id);

  const { data: existingRows, error: selectError } = await supabaseClient
    .from("stays")
    .select("id");

  if (selectError) {
    console.error("Failed to read existing stays", selectError);
    return false;
  }

  const idsToDelete = (existingRows || [])
    .map((row) => row.id)
    .filter((id) => !nextIds.includes(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabaseClient
      .from("stays")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      console.error("Failed to delete removed stays", deleteError);
      return false;
    }
  }

  if (nextRows.length === 0) return true;

  const { error: upsertError } = await supabaseClient
    .from("stays")
    .upsert(nextRows, { onConflict: "id" });

  if (upsertError) {
    console.error("Failed to save stays", upsertError);
    return false;
  }

  return true;
}

async function refreshStays() {
  stays = await loadStays();
  if (!usesSupabase) companies = await loadCompanies();
  populateCompanyOptions();
  renderAll();
}

function getRoom(roomId) {
  return rooms.find((room) => room.id === roomId);
}

function getPaidAmount(stay) {
  return Number(stay.cash || 0) + Number(stay.card || 0) + Number(stay.invoice || 0);
}

function getDebt(stay) {
  const explicitDebt = Number(stay.debt || 0);
  const calculatedDebt = Number(stay.total || 0) - getPaidAmount(stay);
  return Math.max(explicitDebt, calculatedDebt, 0);
}

function getStayStatus(stay) {
  if (stay.status === "cancelled") return "cancelled";

  const today = todayDate();
  const checkIn = toDate(stay.checkIn);
  const checkOut = toDate(stay.checkOut);

  if (today < checkIn) return "booked";
  if (today >= checkOut) return "checked-out";
  return "checked-in";
}

function getStatusLabel(status) {
  return t(`status.${status}`) || t("status.booked");
}

function getStatusClass(status) {
  return {
    booked: "status-upcoming",
    "checked-in": "status-active",
    "checked-out": "status-completed",
    cancelled: "status-cancelled",
  }[status] || "status-upcoming";
}

function datesOverlap(startA, endA, startB, endB) {
  return toDate(startA) < toDate(endB) && toDate(endA) > toDate(startB);
}

function hasRoomConflict(nextStay) {
  return stays.some((stay) => {
    if (stay.id === nextStay.id) return false;
    if (stay.roomId !== nextStay.roomId) return false;
    if (["checked-out", "cancelled"].includes(getStayStatus(stay))) return false;
    return datesOverlap(nextStay.checkIn, nextStay.checkOut, stay.checkIn, stay.checkOut);
  });
}

function populateRoomSelect() {
  selectors.roomSelect.innerHTML = rooms
    .map((room) => `<option value="${room.id}">${room.id} · ${roomTypeLabel(room.type)}</option>`)
    .join("");
}


function renderRoomMap() {
  selectors.roomMap.innerHTML = rooms
    .map((room) => {
      const currentStay = stays.find(
        (stay) => stay.roomId === room.id && getStayStatus(stay) === "checked-in"
      );
      const roomClass = currentStay ? (getDebt(currentStay) > 0 ? "room-debt" : "room-busy") : "room-free";
      const label = currentStay ? currentStay.guestName : t("common.available");

      return `
        <button class="room-card ${roomClass}" ${currentStay ? `data-room-stay="${currentStay.id}" style="--room-color: ${currentStay.color || defaultBookingColor}"` : ""}>
          <div>
            <strong>${room.id}</strong>
            <span>${roomTypeLabel(room.type)}</span>
          </div>
          <p>${label}</p>
        </button>
      `;
    })
    .join("");
}

function renderRoomGroups() {
  selectors.roomGroups.innerHTML = roomTypeOrder
    .map((type) => {
      const groupRooms = rooms.filter((room) => room.type === type);
      return `
        <div class="room-group-card">
          <span>${groupRooms.length} ${getRoomWord(groupRooms.length)}</span>
          <h4>${roomTypeLabel(type)}</h4>
          <p>${groupRooms.map((room) => room.id).join(", ")}</p>
        </div>
      `;
    })
    .join("");
}

function getRoomWord(count) {
  return count === 1 ? t("common.room") : t("common.rooms");
}

function renderActiveGuests() {
  const active = stays.filter((stay) => getStayStatus(stay) === "checked-in");

  if (!active.length) {
    selectors.activeGuestList.innerHTML = `<div class="empty-state">${t("activeGuests.empty")}</div>`;
    return;
  }

  selectors.activeGuestList.innerHTML = active
    .map((stay) => {
      const room = getRoom(stay.roomId);
      return `
        <button type="button" class="guest-card active-guest-card" data-active-stay="${stay.id}" style="--guest-color: ${stay.color || defaultBookingColor}">
          <div>
            <strong>${stay.guestName}</strong>
            <span>${room.id} · ${roomTypeLabel(room.type)}${stay.companyName ? " · " + stay.companyName : ""}</span>
          </div>
          <p>${t("activeGuests.checkout")}: ${formatDate(stay.checkOut)}</p>
          <small>${t("activeGuests.review")}</small>
        </button>
      `;
    })
    .join("");
}

function renderStats() {
  const today = todayDate();
  const active = stays.filter((stay) => getStayStatus(stay) === "checked-in");
  const arrivals = stays.filter((stay) => toDate(stay.checkIn).getTime() === today.getTime());
  const departures = stays.filter((stay) => toDate(stay.checkOut).getTime() === today.getTime());
  const debt = stays.reduce((sum, stay) => sum + getDebt(stay), 0);

  selectors.occupiedStat.textContent = String(active.length);
  selectors.arrivalsStat.textContent = String(arrivals.length);
  selectors.departuresStat.textContent = String(departures.length);
  selectors.debtStat.textContent = `${formatNumber(debt)} ₾`;
}

function renderStaysTable() {
  const filtered = stays.filter((stay) => {
    const status = getStayStatus(stay);
    if (activeFilter === "all") return true;
    if (activeFilter === "debt") return getDebt(stay) > 0;
    if (activeFilter === "arrivals-today") return toDate(stay.checkIn).getTime() === todayDate().getTime();
    if (activeFilter === "departures-today") return toDate(stay.checkOut).getTime() === todayDate().getTime();
    return status === activeFilter;
  });

  if (!filtered.length) {
    selectors.staysTable.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table">${t("table.empty")}</td>
      </tr>
    `;
    return;
  }

  selectors.staysTable.innerHTML = filtered
    .map((stay) => {
      const room = getRoom(stay.roomId);
      const status = getStayStatus(stay);
      const debt = getDebt(stay);
      const isHighlighted = highlightedStayId === stay.id;

      return `
        <tr class="${isHighlighted ? "journal-highlight" : ""}" data-stay-row="${stay.id}">
          <td>
            <strong>${stay.guestName}</strong>
            <span>${[stay.companyName, stay.notes || t("table.noNotes")].filter(Boolean).join(" · ")}</span>
          </td>
          <td>${room.id}<span>${roomTypeLabel(room.type)}</span></td>
          <td>${formatDate(stay.checkIn)} - ${formatDate(stay.checkOut)}</td>
          <td>${formatNumber(stay.total)} ₾</td>
          <td>
            <span>${t("table.paid")}: ${formatNumber(getPaidAmount(stay))} ₾</span>
            <span class="${debt > 0 ? "debt-text" : "paid-text"}">${t("table.debt")}: ${formatNumber(debt)} ₾</span>
          </td>
          <td><span class="status-pill ${getStatusClass(status)}">${getStatusLabel(status)}</span></td>
          <td class="row-actions">
            <button class="edit-row" data-edit="${stay.id}" aria-label="${t("table.edit")}">${t("table.edit")}</button>
            <button class="delete-row" data-delete="${stay.id}" aria-label="${t("table.delete")}">×</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function paymentLabel(key) {
  return t(`form.${key}`).replace(", ₾", "");
}

function getPaymentBreakdown(stay) {
  return [
    [paymentLabel("cash"), stay.cash || 0],
    [paymentLabel("card"), stay.card || 0],
    [paymentLabel("invoice"), stay.invoice || 0],
    [paymentLabel("debt"), getDebt(stay)],
  ];
}

function renderBookingDetails() {
  const stay = stays.find((item) => item.id === selectedCalendarStayId);

  if (!stay) {
    selectors.bookingDetailsPanel.classList.add("hidden");
    selectors.bookingDetailsPanel.innerHTML = "";
    return;
  }

  selectors.bookingDetailsPanel.classList.remove("hidden");

  const room = getRoom(stay.roomId);
  const status = getStayStatus(stay);
  const debt = getDebt(stay);
  const payments = getPaymentBreakdown(stay)
    .map(([label, amount]) => '<div class="detail-payment-row"><span>' + label + '</span><strong>' + formatNumber(amount) + ' ₾</strong></div>')
    .join("");

  selectors.bookingDetailsPanel.innerHTML = [
    '<article class="booking-detail-card">',
    '  <button type="button" class="detail-close" data-detail-close aria-label="' + t("calendar.closeDetails") + '">×</button>',
    '  <div class="booking-detail-color" style="background: ' + (stay.color || defaultBookingColor) + '"></div>',
    '  <h4>' + stay.guestName + '</h4>',
    stay.companyName ? '  <p class="detail-company">' + stay.companyName + '</p>' : '',
    '  <div class="detail-meta"><span>' + t("calendar.room") + ' ' + room.id + '</span><span>' + roomTypeLabel(room.type) + '</span><span>' + getStatusLabel(status) + '</span></div>',
    '  <div class="detail-dates"><strong>' + formatDate(stay.checkIn) + '</strong><span>' + t("calendar.to") + '</span><strong>' + formatDate(stay.checkOut) + '</strong></div>',
    '  <div class="detail-total"><span>' + t("calendar.total") + '</span><strong>' + formatNumber(stay.total) + ' ₾</strong></div>',
    '  <div class="detail-payments">' + payments + '</div>',
    debt > 0 ? '  <div class="detail-alert">' + t("calendar.outstandingDebt") + ': ' + formatNumber(debt) + ' ₾</div>' : '  <div class="detail-ok">' + t("calendar.paymentBalanced") + '</div>',
    stay.notes ? '  <p class="detail-notes">' + stay.notes + '</p>' : '',
    '  <div class="detail-actions">',
    '    <button type="button" class="primary-button" data-detail-edit="' + stay.id + '">' + t("table.edit") + '</button>',
    '    <button type="button" class="danger-button" data-detail-delete="' + stay.id + '">' + t("table.delete") + '</button>',
    '  </div>',
    '</article>',
  ].join("");
}

function renderCalendar() {
  const days = Array.from({ length: 14 }, (_, index) => addDays(calendarStart, index));
  const today = todayDate();
  const lastDay = days[days.length - 1];

  selectors.calendarRange.textContent = `${formatDate(days[0])} - ${formatDate(lastDay)}`;

  const header = `
    <div class="calendar-row calendar-header-row">
      <div class="calendar-room-label calendar-head">${t("calendar.room")}</div>
      ${days
        .map(
          (day) => `
            <div class="calendar-cell calendar-head ${day.getTime() === today.getTime() ? "calendar-today" : ""}">
              <span>${formatWeekdayShort(day)}</span>
              <strong>${day.getDate()}</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;

  const rows = rooms
    .map((room) => {
      const cells = days
        .map((day) => {
          const stay = stays.find((item) => {
            if (item.roomId !== room.id) return false;
            const checkIn = toDate(item.checkIn);
            const checkOut = toDate(item.checkOut);
            return day >= checkIn && day < checkOut;
          });

          if (!stay) {
            return `<div class="calendar-cell ${day.getTime() === today.getTime() ? "calendar-today" : ""}"></div>`;
          }

          const status = getStayStatus(stay);
          const debtClass = getDebt(stay) > 0 ? "calendar-debt" : "";
          if (status === "cancelled") return `<div class="calendar-cell ${day.getTime() === today.getTime() ? "calendar-today" : ""}"></div>`;
          return `
            <button class="calendar-cell calendar-booked calendar-${status} ${debtClass} ${selectedCalendarStayId === stay.id ? "calendar-selected" : ""} ${highlightedCalendarStayId === stay.id ? "calendar-highlighted" : ""}" data-calendar-stay="${stay.id}" style="--booking-color: ${stay.color || defaultBookingColor}" title="${stay.guestName}">
              <span>${stay.guestName.slice(0, 1)}</span>
            </button>
          `;
        })
        .join("");

      return `
        <div class="calendar-row">
          <div class="calendar-room-label">
            <strong>${room.id}</strong>
            <span>${roomTypeLabel(room.type)}</span>
          </div>
          ${cells}
        </div>
      `;
    })
    .join("");

  selectors.occupancyCalendar.innerHTML = header + (rows || `<div class="calendar-empty-room">${t("common.selectRoom")}</div>`);
  renderBookingDetails();
}

function formatDate(value) {
  const date = toDate(value);

  if (currentLanguage === "ka") {
    return `${date.getDate()} ${georgianMonthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  return date.toLocaleDateString(getLocale(), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonthYear(value) {
  const date = toDate(value);

  if (currentLanguage === "ka") {
    return `${georgianMonthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  return date.toLocaleDateString(getLocale(), { month: "long", year: "numeric" });
}

function formatWeekdayShort(value) {
  const date = toDate(value);

  if (currentLanguage === "ka") {
    return georgianWeekdayShortNames[date.getDay()];
  }

  return date.toLocaleDateString(getLocale(), { weekday: "short" });
}

function getDateBooking(day, bookings) {
  return bookings.find((stay) => day >= toDate(stay.checkIn) && day < toDate(stay.checkOut));
}

function hasBusyDateBetween(start, end, bookings) {
  if (!start || !end || end <= start) return false;

  return bookings.some((stay) => {
    return datesOverlap(toInputDate(start), toInputDate(end), stay.checkIn, stay.checkOut);
  });
}

function syncPendingDatesFromForm() {
  if (!selectors.stayForm) return;
  pendingCheckIn = selectors.stayForm.checkIn.value;
  pendingCheckOut = selectors.stayForm.checkOut.value;
}

function getVisibleCheckInValue() {
  return isDatePickerOpen ? pendingCheckIn : selectors.stayForm.checkIn.value;
}

function getVisibleCheckOutValue() {
  return isDatePickerOpen ? pendingCheckOut : selectors.stayForm.checkOut.value;
}

function updateDateRangeDisplay() {
  if (!selectors.stayForm) return;
  const checkInValue = getVisibleCheckInValue();
  const checkOutValue = getVisibleCheckOutValue();
  const committedCheckIn = selectors.stayForm.checkIn.value;
  const committedCheckOut = selectors.stayForm.checkOut.value;
  const hasSelectedDates = Boolean(checkInValue || checkOutValue);
  const hasCommittedDates = Boolean(committedCheckIn || committedCheckOut);

  if (selectors.dateRangeDisplay) {
    if (checkInValue && checkOutValue) {
      selectors.dateRangeDisplay.textContent = formatDate(checkInValue) + " — " + formatDate(checkOutValue);
    } else if (checkInValue) {
      selectors.dateRangeDisplay.textContent = formatDate(checkInValue) + " — " + t("form.selectCheckout");
    } else {
      selectors.dateRangeDisplay.textContent = t("form.selectStayDates");
    }
  }

  selectors.dateRangeButton?.classList.toggle("active", isDatePickerOpen);
  selectors.dateRangeButton?.classList.toggle("has-value", hasSelectedDates || hasCommittedDates);
  selectors.dateRangeField?.classList.toggle("open", isDatePickerOpen);
  selectors.dateRangeField?.classList.toggle("has-dates", hasSelectedDates || hasCommittedDates);
}

function getFormRoomBookings() {
  const roomId = selectors.stayForm?.roomId?.value;
  if (!roomId) return [];

  return stays.filter((stay) => {
    if (stay.id === editingStayId) return false;
    if (stay.roomId !== roomId) return false;
    return !["checked-out", "cancelled"].includes(getStayStatus(stay));
  });
}

function renderFormDateCalendar() {
  if (!selectors.formDateCalendar || !selectors.stayForm) return;

  updateDateRangeDisplay();

  const room = getRoom(selectors.stayForm.roomId.value);
  const checkInValue = getVisibleCheckInValue();
  const checkOutValue = getVisibleCheckOutValue();
  const checkIn = checkInValue ? toDate(checkInValue) : null;
  const checkOut = checkOutValue ? toDate(checkOutValue) : null;
  const hoverDate = formDateHover ? toDate(formDateHover) : null;
  const previewCheckOut =
    activeDateField === "checkOut" && checkIn && hoverDate && hoverDate > checkIn ? hoverDate : checkOut;
  const today = todayDate();
  const roomBookings = getFormRoomBookings();
  const visibleMonths = [startOfMonth(formCalendarMonth), addMonths(formCalendarMonth, 1)];
  const weekDays = t("weekdays");

  const renderMonth = (monthStart) => {
    const firstWeekOffset = (monthStart.getDay() + 6) % 7;
    const lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const blanks = Array.from(
      { length: firstWeekOffset },
      () => '<span class="form-date-day empty-day" aria-hidden="true"></span>'
    );
    const days = Array.from(
      { length: lastDay },
      (_, index) => new Date(monthStart.getFullYear(), monthStart.getMonth(), index + 1)
    );

    const dayButtons = days
      .map((day) => {
        const dayValue = toInputDate(day);
        const booking = getDateBooking(day, roomBookings);
        const isPastDay = day < today;
        const hasConfirmedRange = Boolean(checkIn && checkOut);
        const hasHoverRange = Boolean(activeDateField === "checkOut" && checkIn && hoverDate && hoverDate > checkIn);
        const selectedStart = checkIn && isSameDate(day, checkIn);
        const selectedConfirmedEnd = hasConfirmedRange && checkOut && isSameDate(day, checkOut);
        const selectedHoverEnd = hasHoverRange && hoverDate && isSameDate(day, hoverDate);
        const inConfirmedRange = hasConfirmedRange && day > checkIn && day < checkOut;
        const inHoverRange = hasHoverRange && day > checkIn && day < hoverDate;
        const inSelectedRange = inConfirmedRange || inHoverRange || selectedHoverEnd;
        const isPreviewRange = Boolean(inHoverRange || selectedHoverEnd);
        const canCheckoutBeforeBooking =
          activeDateField === "checkOut" &&
          checkIn &&
          booking &&
          isSameDate(day, toDate(booking.checkIn)) &&
          day > checkIn &&
          !hasBusyDateBetween(checkIn, day, roomBookings);
        const rangeWouldConflict =
          activeDateField === "checkOut" &&
          checkIn &&
          day > checkIn &&
          hasBusyDateBetween(checkIn, day, roomBookings);
        const isBusy = Boolean(booking) && !canCheckoutBeforeBooking;
        const isUnavailable = isBusy || isPastDay || rangeWouldConflict;
        const className = [
          "form-date-day",
          isSameDate(day, today) ? "today-day" : "",
          isBusy ? "busy-day" : "",
          isPastDay ? "past-day" : "",
          rangeWouldConflict ? "blocked-range-day" : "",
          isUnavailable ? "unavailable-day" : "",
          selectedStart ? "selected-start" : "",
          selectedConfirmedEnd ? "selected-end" : "",
          selectedHoverEnd ? "preview-end" : "",
          inSelectedRange ? "selected-range" : "",
          isPreviewRange ? "preview-range" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const title = isBusy
          ? booking.guestName + ": " + formatDate(booking.checkIn) + " - " + formatDate(booking.checkOut)
          : isPastDay
            ? t("common.pastDate")
            : rangeWouldConflict
              ? t("common.rangeConflict")
              : "";
        const style = booking ? "--booking-color: " + (booking.color || defaultBookingColor) : "";
        const disabled = isUnavailable ? " disabled aria-disabled=\"true\"" : "";

        return [
          '<button type="button" class="' + className + '" data-form-date="' + dayValue + '" title="' + title + '" style="' + style + '"' + disabled + '>',
          '  <span>' + day.getDate() + '</span>',
          '</button>',
        ].join("");
      })
      .join("");

    return [
      '<div class="form-date-month">',
      '  <div class="form-date-month-title">' + formatMonthYear(monthStart) + '</div>',
      '  <div class="form-date-weekdays">' + weekDays.map((day) => '<span>' + day + '</span>').join("") + '</div>',
      '  <div class="form-date-days">' + blanks.join("") + dayButtons + '</div>',
      '</div>',
    ].join("");
  };

  selectors.formDateCalendar.innerHTML = [
    '<div class="form-date-calendar-head booking-calendar-head">',
    '  <button type="button" class="calendar-arrow" data-form-month="prev" aria-label="Previous month">‹</button>',
    '  <div class="booking-calendar-title">',
    '    <span>' + (activeDateField === "checkOut" ? t("form.chooseCheckOut") : t("form.chooseCheckIn")) + '</span>',
    '    <strong>' + (room ? t("form.selectedRoom") + " " + room.id + " · " + roomTypeLabel(room.type) : t("form.selectRoom")) + '</strong>',
    '  </div>',
    '  <button type="button" class="calendar-arrow" data-form-month="next" aria-label="Next month">›</button>',
    '</div>',
    '<div class="form-date-months">' + visibleMonths.map(renderMonth).join("") + '</div>',
    '<div class="form-date-legend">',
    '  <span><i class="legend-busy"></i> ' + t("form.occupiedUnavailable") + '</span>',
    '  <span><i class="legend-selected"></i> ' + t("form.selectedRange") + '</span>',
    '</div>',
    '<div class="form-date-apply-row">',
    '  <button type="button" class="ghost-button" data-form-date-cancel>' + t("form.cancel") + '</button>',
    '  <button type="button" class="primary-button" data-form-date-apply' + (pendingCheckIn && pendingCheckOut ? '' : ' disabled') + '>' + t("form.applyDates") + '</button>',
    '</div>',
  ].join("");
}
function mountStayForm(sectionName) {
  if (!selectors.stayFormPanel) return;
  if (sectionName === "edit-stay") {
    selectors.editStaySection?.appendChild(selectors.stayFormPanel);
    return;
  }
  selectors.newStaySection?.appendChild(selectors.stayFormPanel);
}

function renderAll() {
  renderFormDateCalendar();
  renderStats();
  renderRoomMap();
  renderRoomGroups();
  renderActiveGuests();
  renderStaysTable();
  renderCalendar();
}

function readFormStay() {
  const formData = new FormData(selectors.stayForm);
  const existing = stays.find((stay) => stay.id === editingStayId);
  const companyMode = String(formData.get("companyMode") || "existing");
  const selectedCompanyId = String(formData.get("companyId") || "");
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);
  const newCompanyName = normalizeCompanyName(formData.get("companyNewName"));

  return {
    id: editingStayId || crypto.randomUUID(),
    guestName: String(formData.get("guestName")).trim(),
    companyId: companyMode === "existing" ? selectedCompany?.id : undefined,
    companyName: companyMode === "existing" ? normalizeCompanyName(selectedCompany?.name) : newCompanyName,
    roomId: String(formData.get("roomId")),
    checkIn: String(formData.get("checkIn")),
    checkOut: String(formData.get("checkOut")),
    total: Number(formData.get("total") || 0),
    cash: Number(formData.get("cash") || 0),
    card: Number(formData.get("card") || 0),
    invoice: Number(formData.get("invoice") || 0),
    debt: Number(formData.get("debt") || 0),
    notes: String(formData.get("notes") || "").trim(),
    color: String(formData.get("color") || defaultBookingColor),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: editingStayId ? new Date().toISOString() : undefined,
  };
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const wasEditing = Boolean(editingStayId);
  const stay = readFormStay();

  if (!stay.checkIn || !stay.checkOut) {
    setFormMessage(t("common.selectBothDates"), "error");
    return;
  }

  if (toDate(stay.checkOut) <= toDate(stay.checkIn)) {
    setFormMessage(t("common.checkoutAfterCheckin"), "error");
    return;
  }

  if (hasRoomConflict(stay)) {
    setFormMessage(t("common.roomConflict"), "error");
    return;
  }

  if (editingStayId) {
    stays = stays.map((item) => (item.id === editingStayId ? stay : item));
    setFormMessage(t("common.recordUpdated"), "success");
  } else {
    stays = [stay, ...stays];
    setFormMessage(t("common.staySaved"), "success");
  }

  const saved = await saveStays();
  if (!saved) {
    setFormMessage(t("common.saveError"), "error");
    return;
  }

  resetFormMode();
  await refreshStays();
  showSection(wasEditing ? "stays" : "dashboard");
}

function startEditStay(id) {
  const stay = stays.find((item) => item.id === id);
  if (!stay) return;

  editingStayId = id;
  selectors.stayForm.guestName.value = stay.guestName;
  const companyName = stay.companyName || getCompanyNameById(stay.companyId);
  const matchingCompany = companies.find(
    (company) => normalizeCompanyName(company.name).toLocaleLowerCase() === normalizeCompanyName(companyName).toLocaleLowerCase()
  );
  populateCompanyOptions(matchingCompany?.id || stay.companyId || "");
  if (matchingCompany || stay.companyId) {
    setCompanyMode("existing");
  } else {
    setCompanyMode(companyName ? "new" : "existing");
    selectors.companyNewInput.value = companyName;
  }
  selectors.stayForm.roomId.value = stay.roomId;
  selectors.stayForm.checkIn.value = stay.checkIn;
  selectors.stayForm.checkOut.value = stay.checkOut;
  formDateHover = null;
  activeDateField = "checkOut";
  isDatePickerOpen = false;
  formCalendarMonth = startOfMonth(toDate(stay.checkIn));
  selectors.stayForm.total.value = stay.total;
  selectors.stayForm.cash.value = stay.cash || 0;
  selectors.stayForm.card.value = stay.card || 0;
  selectors.stayForm.invoice.value = stay.invoice || 0;
  selectors.stayForm.debt.value = stay.debt || 0;
  selectors.stayForm.notes.value = stay.notes || "";
  selectors.stayForm.color.value = stay.color || defaultBookingColor;

  selectors.formTitle.textContent = t("form.editStay");
  selectors.formSubmitButton.textContent = t("form.saveChanges");
  selectors.cancelEditButton.classList.remove("hidden");
  setFormMessage(t("form.updateHint"), "success");
  showSection("edit-stay");
  renderFormDateCalendar();
}

function resetFormMode() {
  editingStayId = null;
  selectors.stayForm.reset();
  populateCompanyOptions();
  setCompanyMode("existing");
  selectors.formTitle.textContent = t("form.addStay");
  selectors.formSubmitButton.textContent = t("form.saveStay");
  selectors.cancelEditButton.classList.add("hidden");
  setFormMessage("", "");
  setDefaultDates();
  renderFormDateCalendar();
}

function showStayInCalendar(stay) {
  if (!stay) return;
  selectedCalendarStayId = null;
  highlightedCalendarStayId = stay.id;
  calendarStart = addDays(toDate(stay.checkIn), -3);
  showSection("calendar");
  renderCalendar();

  requestAnimationFrame(() => {
    const cell = selectors.occupancyCalendar.querySelector(`[data-calendar-stay="${stay.id}"]`);
    cell?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  });
}

function getVisibleJournalFilter(filter) {
  return {
    "arrivals-today": "booked",
    "departures-today": "checked-out",
  }[filter] || filter;
}

function setJournalFilterBadge(filter) {
  const visibleFilter = getVisibleJournalFilter(filter);
  selectors.filterChips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === visibleFilter);
  });
}

function resetTransientState() {
  selectedCalendarStayId = null;
  highlightedCalendarStayId = null;
  highlightedStayId = null;
  isDatePickerOpen = false;
  formDateHover = null;
  resetFormMode();
}

function navigateToSection(sectionName) {
  resetTransientState();

  if (sectionName === "stays") {
    activeFilter = "all";
    setJournalFilterBadge("all");
  }

  showSection(sectionName);

  if (sectionName === "stays") {
    renderStaysTable();
  }

  renderCalendar();
}

function showJournalFilter(filter) {
  resetTransientState();
  activeFilter = filter;
  setJournalFilterBadge(filter);
  showSection("stays");
  renderStaysTable();
}

function showStayInJournal(stayId) {
  selectedCalendarStayId = null;
  highlightedCalendarStayId = null;
  highlightedStayId = stayId;
  isDatePickerOpen = false;
  formDateHover = null;
  resetFormMode();
  activeFilter = "all";
  setJournalFilterBadge("all");
  showSection("stays");
  renderStaysTable();

  requestAnimationFrame(() => {
    const row = selectors.staysTable.querySelector(`[data-stay-row="${stayId}"]`);
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

function setFormMessage(message, type) {
  selectors.formMessage.textContent = message;
  selectors.formMessage.className = `form-message ${type || ""}`;
}

function resetFormDates() {
  selectors.stayForm.checkIn.value = "";
  selectors.stayForm.checkOut.value = "";
  pendingCheckIn = "";
  pendingCheckOut = "";
  activeDateField = "checkIn";
  isDatePickerOpen = false;
  formDateHover = null;
  formCalendarMonth = startOfMonth(todayDate());
}

function setDefaultDates() {
  resetFormDates();
}

function showSection(sectionName) {
  currentSectionName = sectionName;
  if (sectionStorageValues.has(sectionName)) {
    storeActiveSection(sectionName);
  }

  mountStayForm(sectionName);
  selectors.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.section === sectionName);
  });
  selectors.sections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== sectionToId(sectionName));
  });

  const header = getPageHeader(sectionName);
  if (selectors.pageEyebrow) selectors.pageEyebrow.textContent = header.eyebrow;
  if (selectors.pageTitle) selectors.pageTitle.textContent = header.title;
  if (selectors.pageDescription) selectors.pageDescription.textContent = header.description;
}

function sectionToId(sectionName) {
  return {
    dashboard: "dashboardSection",
    "new-stay": "newStaySection",
    "edit-stay": "editStaySection",
    stays: "staysSection",
    calendar: "calendarSection",
    rooms: "roomsSection",
  }[sectionName];
}


async function requireSession() {
  if (!usesSupabase) {
    selectors.authScreen?.classList.add("hidden");
    selectors.appShell?.classList.remove("hidden");
    if (selectors.storageModeTitle) selectors.storageModeTitle.textContent = t("storage.localTitle");
    if (selectors.storageModeText) selectors.storageModeText.textContent = t("storage.localText");
    selectors.logoutButton?.classList.add("hidden");
    return true;
  }

  const { data } = await supabaseClient.auth.getSession();
  const session = data?.session;

  if (session) {
    selectors.authScreen?.classList.add("hidden");
    selectors.appShell?.classList.remove("hidden");
    if (selectors.storageModeTitle) selectors.storageModeTitle.textContent = t("storage.cloudTitle");
    if (selectors.storageModeText) selectors.storageModeText.textContent = t("storage.cloudText");
    selectors.logoutButton?.classList.remove("hidden");
    return true;
  }

  selectors.appShell?.classList.add("hidden");
  selectors.authScreen?.classList.remove("hidden");
  selectors.loginForm.email.value = configuredLoginEmail;
  return false;
}

function setLoginMessage(message, type) {
  if (!selectors.loginMessage) return;
  selectors.loginMessage.textContent = message;
  selectors.loginMessage.className = `form-message ${type || ""}`;
}

function bindEvents() {
  selectors.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navigateToSection(item.dataset.section);
    });
  });

  selectors.languageSelect?.addEventListener("change", (event) => {
    setLanguage(event.target.value);
  });

  selectors.stayForm.addEventListener("submit", handleFormSubmit);

  selectors.companyModeInputs?.forEach((input) => {
    input.addEventListener("change", () => {
      setCompanyMode(input.value);
    });
  });

  selectors.stayForm.roomId.addEventListener("change", () => {
    if (!editingStayId) {
      resetFormDates();
    } else {
      isDatePickerOpen = false;
      formDateHover = null;
      activeDateField = selectors.stayForm.checkOut.value ? "checkIn" : "checkOut";
      const anchorDate = selectors.stayForm.checkIn.value ? toDate(selectors.stayForm.checkIn.value) : todayDate();
      formCalendarMonth = startOfMonth(anchorDate);
    }
    renderFormDateCalendar();
  });

  selectors.dateRangeButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    const wasOpen = isDatePickerOpen;
    isDatePickerOpen = !wasOpen;
    formDateHover = null;

    if (isDatePickerOpen) {
      syncPendingDatesFromForm();
    }

    if (!isDatePickerOpen) {
      renderFormDateCalendar();
      return;
    }

    if (editingStayId && pendingCheckIn && pendingCheckOut) {
      activeDateField = "checkIn";
      formCalendarMonth = startOfMonth(toDate(pendingCheckIn));
    } else if (!pendingCheckIn || pendingCheckOut) {
      activeDateField = "checkIn";
      const anchorDate = pendingCheckIn ? toDate(pendingCheckIn) : todayDate();
      formCalendarMonth = startOfMonth(anchorDate);
    } else {
      activeDateField = "checkOut";
      formCalendarMonth = startOfMonth(toDate(pendingCheckIn));
    }

    renderFormDateCalendar();
  });

  selectors.dateClearButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    resetFormDates();
    renderFormDateCalendar();
  });

  selectors.formDateCalendar?.addEventListener("click", (event) => {
    event.stopPropagation();
    const cancelButton = event.target.closest("[data-form-date-cancel]");
    if (cancelButton) {
      isDatePickerOpen = false;
      formDateHover = null;
      syncPendingDatesFromForm();
      renderFormDateCalendar();
      return;
    }

    const applyButton = event.target.closest("[data-form-date-apply]");
    if (applyButton) {
      if (!pendingCheckIn || !pendingCheckOut) {
        setFormMessage(t("form.selectBothBeforeApply"), "error");
        return;
      }
      selectors.stayForm.checkIn.value = pendingCheckIn;
      selectors.stayForm.checkOut.value = pendingCheckOut;
      activeDateField = "checkIn";
      isDatePickerOpen = false;
      formDateHover = null;
      setFormMessage(t("form.datesApplied"), "success");
      renderFormDateCalendar();
      return;
    }

    const monthButton = event.target.closest("[data-form-month]");
    if (monthButton) {
      formDateHover = null;
      formCalendarMonth = addMonths(formCalendarMonth, monthButton.dataset.formMonth === "next" ? 1 : -1);
      renderFormDateCalendar();
      return;
    }

    const dayButton = event.target.closest("[data-form-date]");
    if (!dayButton || dayButton.disabled) return;

    const value = dayButton.dataset.formDate;
    const pickedDate = toDate(value);
    const currentCheckIn = pendingCheckIn;
    formDateHover = null;

    if (!currentCheckIn || activeDateField === "checkIn") {
      pendingCheckIn = value;
      pendingCheckOut = "";
      activeDateField = "checkOut";
      isDatePickerOpen = true;
    } else if (pickedDate <= toDate(currentCheckIn)) {
      pendingCheckIn = value;
      pendingCheckOut = "";
      activeDateField = "checkOut";
      isDatePickerOpen = true;
    } else {
      pendingCheckOut = value;
      activeDateField = "checkIn";
      isDatePickerOpen = true;
    }

    formCalendarMonth = startOfMonth(pickedDate);
    renderFormDateCalendar();
  });

  selectors.formDateCalendar?.addEventListener("mouseover", (event) => {
    if (!isDatePickerOpen || activeDateField !== "checkOut" || !pendingCheckIn) return;

    const clearHover = () => {
      if (!formDateHover) return;
      formDateHover = null;
      renderFormDateCalendar();
    };
    const dayButton = event.target.closest("[data-form-date]");

    if (!dayButton || dayButton.disabled) {
      clearHover();
      return;
    }

    const value = dayButton.dataset.formDate;
    if (toDate(value) <= toDate(pendingCheckIn)) {
      clearHover();
      return;
    }

    if (formDateHover === value) return;
    formDateHover = value;
    renderFormDateCalendar();
  });

  selectors.formDateCalendar?.addEventListener("mouseleave", () => {
    if (!formDateHover) return;
    formDateHover = null;
    renderFormDateCalendar();
  });

  document.addEventListener("click", (event) => {
    if (!isDatePickerOpen) return;
    if (event.target.closest("#dateRangeField")) return;
    isDatePickerOpen = false;
    formDateHover = null;
    renderFormDateCalendar();
  });

  selectors.cancelEditButton.addEventListener("click", () => {
    const wasEditing = Boolean(editingStayId);
    resetFormMode();
    if (wasEditing) {
      showSection("stays");
      return;
    }
    setFormMessage(t("form.editingCancelled"), "success");
  });

  selectors.filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      showJournalFilter(chip.dataset.filter);
    });
  });

  selectors.statCards.forEach((card) => {
    const openStatJournal = () => showJournalFilter(card.dataset.statFilter);
    card.addEventListener("click", openStatJournal);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openStatJournal();
    });
  });

  selectors.staysTable.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
      startEditStay(editButton.dataset.edit);
      return;
    }

    if (!deleteButton) return;
    if (!confirm(t("table.confirmDelete"))) return;
    stays = stays.filter((stay) => stay.id !== deleteButton.dataset.delete);
    if (editingStayId === deleteButton.dataset.delete) resetFormMode();
    if (selectedCalendarStayId === deleteButton.dataset.delete) selectedCalendarStayId = null;
    if (highlightedCalendarStayId === deleteButton.dataset.delete) highlightedCalendarStayId = null;
    saveStays().then((saved) => {
      if (!saved) console.error("Delete was not saved.");
      refreshStays();
    });
  });

  selectors.occupancyCalendar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-calendar-stay]");
    if (!button) {
      selectedCalendarStayId = null;
      highlightedCalendarStayId = null;
      renderCalendar();
      return;
    }
    selectedCalendarStayId = button.dataset.calendarStay;
    highlightedCalendarStayId = null;
    renderCalendar();
  });

  selectors.bookingDetailsPanel.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-detail-edit]");
    const deleteButton = event.target.closest("[data-detail-delete]");
    const closeButton = event.target.closest("[data-detail-close]");

    if (closeButton) {
      selectedCalendarStayId = null;
      highlightedCalendarStayId = null;
      renderCalendar();
      return;
    }
    if (editButton) {
      startEditStay(editButton.dataset.detailEdit);
      return;
    }

    if (!deleteButton) return;
    if (!confirm(t("table.confirmDelete"))) return;
    stays = stays.filter((stay) => stay.id !== deleteButton.dataset.detailDelete);
    selectedCalendarStayId = null;
    if (highlightedCalendarStayId === deleteButton.dataset.detailDelete) highlightedCalendarStayId = null;
    saveStays().then((saved) => {
      if (!saved) console.error("Delete was not saved.");
      refreshStays();
    });
  });

  selectors.roomMap.addEventListener("click", (event) => {
    const roomButton = event.target.closest("[data-room-stay]");
    if (!roomButton) return;
    const stay = stays.find((item) => item.id === roomButton.dataset.roomStay);
    if (!stay) return;
    showStayInCalendar(stay);
  });

  selectors.activeGuestList.addEventListener("click", (event) => {
    const guestButton = event.target.closest("[data-active-stay]");
    if (!guestButton) return;
    startEditStay(guestButton.dataset.activeStay);
  });

  selectors.calendarPrevButton.addEventListener("click", () => {
    calendarStart = addDays(calendarStart, -14);
    renderCalendar();
  });

  selectors.calendarNextButton.addEventListener("click", () => {
    calendarStart = addDays(calendarStart, 14);
    renderCalendar();
  });

  selectors.calendarTodayButton.addEventListener("click", () => {
    calendarStart = addDays(todayDate(), -3);
    renderCalendar();
  });

  selectors.loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!usesSupabase) return;

    const formData = new FormData(selectors.loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    setLoginMessage(t("auth.signingIn"), "");
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      setLoginMessage(t("auth.signInError"), "error");
      return;
    }

    setLoginMessage("", "");
    didJustSignIn = true;
    await startApp();
  });

  selectors.logoutButton?.addEventListener("click", async () => {
    if (usesSupabase) await supabaseClient.auth.signOut();
    stays = [];
    resetFormMode();
    renderAll();
    await requireSession();
  });
}

async function startApp() {
  const canStart = await requireSession();
  if (!canStart) return;

  companies = usesSupabase ? await loadCompanies() : [];
  stays = await loadStays();
  if (!usesSupabase) companies = await loadCompanies();
  populateRoomSelect();
  populateCompanyOptions();
  setDefaultDates();

  const targetSection = didJustSignIn ? "dashboard" : getStoredSection();
  didJustSignIn = false;
  showSection(targetSection);
  renderAll();
}

async function init() {
  applyStaticTranslations();
  populateRoomSelect();
  setDefaultDates();
  bindEvents();
  await startApp();
}

init();
