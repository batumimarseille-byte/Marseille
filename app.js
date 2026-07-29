import { createClient } from "@supabase/supabase-js";
import flagGeUrl from "./assets/flag-ge.png";
import flagUsUrl from "./assets/flag-us.png";

const roomTypeOrder = ["Suite", "Standard", "Twin", "Triple", "Junior Suite"];
const roomNightPrices = {
  Suite: 350,
  Standard: 170,
  Twin: 160,
  Triple: 300,
  "Junior Suite": 250,
};
const defaultRooms = [
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
].map((room) => ({ ...room, nightlyPrice: roomNightPrices[room.type] || 0 }));
const storageKey = "hotel-desk-stays-v1";
const roomPricesStorageKey = "hotel-desk-room-prices-v1";
const roomInventoryStorageKey = "hotel-desk-room-inventory-v1";
const activeSectionStorageKey = "hotel-desk-active-section-v1";
const languageStorageKey = "hotel-desk-language-v1";
const favoriteGuestStorageKey = "hotel-desk-favorite-guests-v1";
const favoriteGuestMigrationStorageKey = "hotel-desk-favorite-guests-supabase-migrated-v1";
const staffMessagesStorageKey = "hotel-desk-staff-messages-v1";
const staffColorStorageKey = "hotel-desk-staff-color-v1";
const defaultBookingColor = "#4f7cff";
const bookingCustomColorsStorageKey = "hotel-desk-booking-custom-colors-v2";
const bookingColorPalette = ["#4f7cff", "#6376ee", "#7c68e9", "#9a6bf2", "#b98df3", "#e978e0", "#e978b7", "#ef6669", "#ee8061", "#e89b43", "#d6bf38", "#b9df42", "#75c95d", "#6bcd65", "#3fbc83", "#2fb8aa", "#1cb7b8", "#22b8cf", "#36a4e9", "#5d85f2"];
const staffMessagePalette = ["#4f7cff", "#9a6bf2", "#e978b7", "#ef6669", "#e89b43", "#75c95d", "#2fb8aa", "#36a4e9"];
const defaultHotelId = "marseille";

function getCurrentHotelId() {
  const urlHotelId = new URLSearchParams(window.location.search).get("hotel");
  const normalized = String(urlHotelId || defaultHotelId).trim().toLowerCase();
  return /^[a-z0-9-]{2,48}$/.test(normalized) ? normalized : defaultHotelId;
}

const currentHotelId = getCurrentHotelId();
const tenantLanguageStorageKey = `${languageStorageKey}:${currentHotelId}`;
const defaultHotelName = currentHotelId === defaultHotelId ? "Marseille" : "Demo Hotel";
const defaultHotelSettings = {
  id: "",
  hotelId: currentHotelId,
  hotelName: defaultHotelName,
  hotelLabel: "Hotel",
  logoUrl: "/logo.png",
  defaultLanguage: "en",
  currencyCode: "GEL",
  currencySymbol: "₾",
  timezone: "Asia/Tbilisi",
};
const hotelCurrencyOptions = [
  { code: "GEL", symbol: "₾", title: "Georgian lari", meta: "GEL · ₾" },
  { code: "USD", symbol: "$", title: "US dollar", meta: "USD · $" },
  { code: "EUR", symbol: "€", title: "Euro", meta: "EUR · €" },
];
const roomGroupByType = {
  Suite: "lux",
  Standard: "standard",
  Twin: "two-beds",
  Triple: "three-beds",
  "Junior Suite": "semi-lux",
};
let pendingBookingColor = null;
let customColorTone = 220;
let customBookingColors = [];
const languageFlagIcons = { en: flagUsUrl, ka: flagGeUrl };
const sectionStorageValues = new Set(["dashboard", "new-stay", "stays", "staff-chat", "calendar", "rooms"]);
const calendarVisibleDays = 14;
const calendarBufferDays = 14;
const calendarTodayOffsetDays = Math.floor(calendarVisibleDays / 2);
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
    settings: {
      account: "Account",
      title: "Account",
      administrator: "Administrator",
      role: "Hotel staff",
      hotel: "Hotel settings",
      hotelHint: "Name, logo, currency, and default app settings.",
      hotelName: "Hotel name",
      hotelLabel: "Brand label",
      logoUrl: "Logo path or URL",
      defaultLanguage: "Default language",
      currency: "Currency",
      save: "Save changes",
      saving: "Saving...",
      saved: "Settings saved.",
      saveError: "Could not save settings. Check Supabase and try again.",
      preferences: "Preferences",
      language: "Language",
      languageHint: "Choose the interface language",
      session: "Session",
      signOut: "Sign out",
    },
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
        description: "Rooms grouped by category and capacity.",
      },
      "staff-chat": {
        eyebrow: "Team",
        title: "Staff chat",
        description: "Short shift messages for the hotel team.",
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
    staffChat: {
      eyebrow: "Team",
      title: "Staff chat (beta)",
      subtitle: "Shift messages",
      empty: "No messages yet.",
      placeholder: "Write a message...",
      send: "Send",
      message: "Message",
      color: "Message color",
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
      roomsByCategory: "rooms by category",
      perNight: "per night",
    },
    roomInventory: {
      addRoom: "Add room",
      editRoom: "Edit room",
      newRoom: "New room",
      roomNumber: "Room number",
      roomType: "Room type",
      nightlyPrice: "Default nightly price",
      sortOrder: "Display order",
      save: "Save room",
      cancel: "Cancel",
      hide: "Hide room",
      editPrice: "Edit price",
      saved: "Room saved.",
      hidden: "Room hidden.",
      duplicate: "This room already exists.",
      required: "Fill in room number and price.",
      hideBlocked: "This room has an active or future stay.",
      saveError: "Could not save room. Check Supabase and try again.",
      hideError: "Could not hide room. Check Supabase and try again.",
      confirmHide: "Hide this room from active inventory?",
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
      guestPalette: "Guest colors",
      customPalette: "Added colors",
      room: "Room",
      stayDates: "Stay dates",
      selectStayDates: "Select stay dates",
      selectCheckout: "select check-out",
      clearDates: "Clear dates",
      nightCheckIn: "Night check-in",
      nightlyRate: "Price per night",
      nights: "Nights",
      discount: "Discount",
      total: "Total amount",
      cash: "Cash",
      card: "Card",
      invoice: "Invoice",
      debt: "Debt",
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
    settings: {
      account: "ანგარიში",
      title: "ანგარიში",
      administrator: "ადმინისტრატორი",
      role: "სასტუმროს პერსონალი",
      hotel: "სასტუმროს პარამეტრები",
      hotelHint: "სახელი, ლოგო, ვალუტა და საწყისი პარამეტრები.",
      hotelName: "სასტუმროს სახელი",
      hotelLabel: "ბრენდის წარწერა",
      logoUrl: "ლოგოს მისამართი",
      defaultLanguage: "საწყისი ენა",
      currency: "ვალუტა",
      save: "ცვლილებების შენახვა",
      saving: "ინახება...",
      saved: "პარამეტრები შენახულია.",
      saveError: "პარამეტრები ვერ შეინახა. გადაამოწმეთ Supabase.",
      preferences: "პარამეტრები",
      language: "ენა",
      languageHint: "აირჩიეთ ინტერფეისის ენა",
      session: "სესია",
      signOut: "გასვლა",
    },
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
        description: "ნომრები კატეგორიებისა და ტევადობის მიხედვით.",
      },
      "staff-chat": {
        eyebrow: "გუნდი",
        title: "ჩატი",
        description: "მოკლე ცვლის შეტყობინებები სასტუმროს გუნდისთვის.",
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
    staffChat: {
      eyebrow: "გუნდი",
      title: "ჩატი (beta)",
      subtitle: "ცვლის შეტყობინებები",
      empty: "შეტყობინებები ჯერ არ არის.",
      placeholder: "დაწერეთ შეტყობინება...",
      send: "გაგზავნა",
      message: "შეტყობინება",
      color: "შეტყობინების ფერი",
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
      roomsByCategory: "ნომერი კატეგორიების მიხედვით",
      perNight: "ღამეში",
    },
    roomInventory: {
      addRoom: "ნომრის დამატება",
      editRoom: "ნომრის რედაქტირება",
      newRoom: "ახალი ნომერი",
      roomNumber: "ნომრის ნომერი",
      roomType: "ნომრის ტიპი",
      nightlyPrice: "საწყისი ღამის ფასი",
      sortOrder: "ჩვენების რიგი",
      save: "ნომრის შენახვა",
      cancel: "გაუქმება",
      hide: "ნომრის დამალვა",
      editPrice: "ფასის შეცვლა",
      saved: "ნომერი შენახულია.",
      hidden: "ნომერი დამალულია.",
      duplicate: "ეს ნომერი უკვე არსებობს.",
      required: "შეავსეთ ნომერი და ფასი.",
      hideBlocked: "ამ ნომერს აქვს აქტიური ან მომავალი ჩანაწერი.",
      saveError: "ნომრის შენახვა ვერ მოხერხდა. გადაამოწმეთ Supabase.",
      hideError: "ნომრის დამალვა ვერ მოხერხდა. გადაამოწმეთ Supabase.",
      confirmHide: "დავმალოთ ეს ნომერი აქტიური სიიდან?",
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
      guestPalette: "სტუმრის ფერები",
      customPalette: "დამატებული ფერები",
      room: "ნომერი",
      stayDates: "ცხოვრების თარიღები",
      selectStayDates: "აირჩიეთ ცხოვრების თარიღები",
      selectCheckout: "აირჩიეთ გასვლის თარიღი",
      clearDates: "თარიღების გასუფთავება",
      nightCheckIn: "ღამის შესვლა",
      nightlyRate: "ღამის ფასი",
      nights: "ღამეები",
      discount: "ფასდაკლება",
      total: "ჯამური თანხა",
      cash: "ნაღდი",
      card: "ბარათი",
      invoice: "ინვოისი",
      debt: "ვალი",
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

let rooms = defaultRooms.slice();
let stays = [];
let companies = [];
let staffMessages = [];
let activeFilter = "all";
let highlightedStayId = null;
let highlightedCalendarStayId = null;
let editingStayId = null;
let checkoutOnlyEditStayId = null;
let calendarStart = getDefaultCalendarStart();
let selectedCalendarStayId = null;
let formCalendarMonth = new Date(todayDate().getFullYear(), todayDate().getMonth(), 1);
let activeDateField = "checkIn";
let isDatePickerOpen = false;
let formDateHover = null;
let pendingCheckIn = "";
let pendingCheckOut = "";
let currentLanguage = getStoredLanguage();
let hotelSettings = { ...defaultHotelSettings };
let currentSectionName = "dashboard";
let didJustSignIn = false;
let calendarDragState = null;
let calendarResizeState = null;
let shouldSuppressCalendarClick = false;
let pendingCalendarScrollLeft = null;
let totalAmountWasEdited = false;
let isUpdatingTotalAmount = false;
let lastAutoTotalAmount = "";
let nightlyRateWasEdited = false;
let isUpdatingNightlyRate = false;
let pendingCompanyColorUpdates = new Map();
let openCustomDropdown = null;
let selectedStaffColor = getStoredStaffColor();
let editingRoomId = null;

const selectors = {
  navItems: document.querySelectorAll(".nav-item"),
  homeTriggers: document.querySelectorAll("[data-home-trigger]"),
  sections: document.querySelectorAll(".section-block"),
  newStaySection: document.querySelector("#newStaySection"),
  editStaySection: document.querySelector("#editStaySection"),
  stayFormPanel: document.querySelector("#stayFormPanel"),
  pageEyebrow: document.querySelector("#pageEyebrow"),
  pageTitle: document.querySelector("#pageTitle"),
  pageDescription: document.querySelector("#pageDescription"),
  roomSelect: document.querySelector("#roomSelect"),
  companySelect: document.querySelector("#companySelect"),
  roomDropdown: document.querySelector("#roomDropdown"),
  companyDropdown: document.querySelector("#companyDropdown"),
  companyNewInput: document.querySelector("#companyNewInput"),
  companyModeInputs: document.querySelectorAll('input[name="companyMode"]'),
  stayForm: document.querySelector("#stayForm"),
  colorPalette: document.querySelector("#colorPalette"),
  customColorPalette: document.querySelector("#customColorPalette"),
  customColorPaletteLabel: document.querySelector(".color-palette-custom-label"),
  colorPaletteDivider: document.querySelector("#colorPaletteDivider"),
  colorPicker: document.querySelector("#colorPicker"),
  colorPickerTrigger: document.querySelector("#colorPickerTrigger"),
  colorAddSwatch: document.querySelector("#colorAddSwatch"),
  colorRemoveSwatch: document.querySelector("#colorRemoveSwatch"),
  colorApplyButton: document.querySelector("#colorApplyButton"),
  colorCustomControls: document.querySelector("#colorCustomControls"),
  colorConfirmSwatch: document.querySelector("#colorConfirmSwatch"),
  colorToneRange: document.querySelector("#colorToneRange"),
  formTitle: document.querySelector("#formTitle"),
  formMessage: document.querySelector("#formMessage"),
  formSubmitButton: document.querySelector("#formSubmitButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  roomMap: document.querySelector("#roomMap"),
  roomGroups: document.querySelector("#roomGroups"),
  addRoomButton: document.querySelector("#addRoomButton"),
  roomEditorForm: document.querySelector("#roomEditorForm"),
  roomEditorTitle: document.querySelector("#roomEditorTitle"),
  roomEditorMessage: document.querySelector("#roomEditorMessage"),
  roomEditorCancel: document.querySelector("#roomEditorCancel"),
  roomEditorHide: document.querySelector("#roomEditorHide"),
  roomsInventoryTitle: document.querySelector("#roomsInventoryTitle"),
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
  calendarScroll: document.querySelector(".calendar-scroll"),
  calendarRange: document.querySelector("#calendarRange"),
  calendarPrevButton: document.querySelector("#calendarPrevButton"),
  calendarNextButton: document.querySelector("#calendarNextButton"),
  calendarTodayButton: document.querySelector("#calendarTodayButton"),
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  loginForm: document.querySelector("#loginForm"),
  loginMessage: document.querySelector("#loginMessage"),
  logoutButtons: document.querySelectorAll("[data-logout-button]"),
  storageModeTitles: document.querySelectorAll("[data-storage-title]"),
  storageModeTexts: document.querySelectorAll("[data-storage-text]"),
  dateRangeField: document.querySelector("#dateRangeField"),
  dateRangeButton: document.querySelector("#dateRangeButton"),
  dateRangeDisplay: document.querySelector("#dateRangeDisplay"),
  dateClearButton: document.querySelector("#dateClearButton"),
  nightCheckInToggle: document.querySelector("#nightCheckInToggle"),
  formDateCalendar: document.querySelector("#formDateCalendar"),
  topbar: document.querySelector(".topbar"),
  topbarActions: document.querySelector(".topbar-actions"),
  languageToggles: document.querySelectorAll("[data-language-toggle]"),
  languageToggleFlags: document.querySelectorAll("[data-language-flag]"),
  mobileMenuToggle: document.querySelector("#mobileMenuToggle"),
  mobileMenuBackdrop: document.querySelector("#mobileMenuBackdrop"),
  sidebar: document.querySelector(".sidebar"),
  settingsOverlay: document.querySelector("#settingsOverlay"),
  settingsTrigger: document.querySelector("#settingsTrigger"),
  settingsTriggers: document.querySelectorAll("[data-settings-trigger]"),
  settingsCloseButtons: document.querySelectorAll("[data-settings-close]"),
  settingsLanguageButtons: document.querySelectorAll("[data-settings-language]"),
  settingsSignOut: document.querySelector("#settingsSignOut"),
  hotelSettingsForm: document.querySelector("#hotelSettingsForm"),
  hotelSettingsMessage: document.querySelector("#hotelSettingsMessage"),
  settingsHotelName: document.querySelector("#settingsHotelName"),
  settingsHotelLabel: document.querySelector("#settingsHotelLabel"),
  settingsLogoUrl: document.querySelector("#settingsLogoUrl"),
  settingsDefaultLanguage: document.querySelector("#settingsDefaultLanguage"),
  settingsDefaultLanguageDropdown: document.querySelector("#settingsDefaultLanguageDropdown"),
  settingsCurrency: document.querySelector("#settingsCurrency"),
  settingsCurrencyDropdown: document.querySelector("#settingsCurrencyDropdown"),
  dashboardCalendarAction: document.querySelector("#dashboardCalendarAction"),
  dashboardNewStayAction: document.querySelector("#dashboardNewStayAction"),
  staffChatTrigger: document.querySelector("#staffChatTrigger"),
  staffChatMessages: document.querySelector("#staffChatMessages"),
  staffChatForm: document.querySelector("#staffChatForm"),
  staffChatInput: document.querySelector("#staffChatInput"),
  staffChatColors: document.querySelector("#staffChatColors"),
  hotelNames: document.querySelectorAll("[data-hotel-name]"),
  hotelLabels: document.querySelectorAll("[data-hotel-label]"),
  hotelLogos: document.querySelectorAll("[data-hotel-logo]"),
};


function getTranslationValue(path, dictionary) {
  return path.split(".").reduce((value, key) => value?.[key], dictionary);
}

function getStoredLanguage() {
  try {
    const stored =
      localStorage.getItem(tenantLanguageStorageKey) ||
      (currentHotelId === defaultHotelId ? localStorage.getItem(languageStorageKey) : "");
    return translations[stored] ? stored : "en";
  } catch {
    return "en";
  }
}

function hasStoredLanguage() {
  try {
    return Boolean(
      localStorage.getItem(tenantLanguageStorageKey) ||
        (currentHotelId === defaultHotelId && localStorage.getItem(languageStorageKey))
    );
  } catch {
    return false;
  }
}

function getStoredStaffColor() {
  try {
    const stored = normalizeBookingColor(localStorage.getItem(staffColorStorageKey));
    return staffMessagePalette.includes(stored) ? stored : staffMessagePalette[0];
  } catch {
    return staffMessagePalette[0];
  }
}

function getStoredSection() {
  try {
    localStorage.removeItem(activeSectionStorageKey);
  } catch {
    // Browsers can block localStorage in private mode.
  }

  return "dashboard";
}

function storeActiveSection(sectionName) {
  if (!sectionStorageValues.has(sectionName)) return;

  try {
    localStorage.removeItem(activeSectionStorageKey);
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

function getCurrencySymbol() {
  return hotelSettings.currencySymbol || defaultHotelSettings.currencySymbol;
}

function formatMoney(value) {
  return `${formatNumber(value)} ${getCurrencySymbol()}`;
}

function normalizeHotelSettings(row = {}) {
  const currency = getSupportedCurrency(row.currency_code || row.currencyCode || defaultHotelSettings.currencyCode);
  const settings = {
    id: row.id || row.settingsId || defaultHotelSettings.id,
    hotelId: row.hotel_id || row.hotelId || currentHotelId,
    hotelName: row.hotel_name || row.hotelName || defaultHotelSettings.hotelName,
    hotelLabel: row.hotel_label || row.hotelLabel || defaultHotelSettings.hotelLabel,
    logoUrl: row.logo_url || row.logoUrl || defaultHotelSettings.logoUrl,
    defaultLanguage: row.default_language || row.defaultLanguage || defaultHotelSettings.defaultLanguage,
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
    timezone: row.timezone || defaultHotelSettings.timezone,
  };

  settings.defaultLanguage = translations[settings.defaultLanguage] ? settings.defaultLanguage : defaultHotelSettings.defaultLanguage;
  return settings;
}

function getSupportedCurrency(code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  return hotelCurrencyOptions.find((currency) => currency.code === normalizedCode) || hotelCurrencyOptions[0];
}

function getSystemTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || hotelSettings.timezone || defaultHotelSettings.timezone;
  } catch {
    return hotelSettings.timezone || defaultHotelSettings.timezone;
  }
}

function applyHotelSettings() {
  const fullName = `${hotelSettings.hotelLabel} ${hotelSettings.hotelName}`.trim();
  document.title = `${fullName} | Check-in Desk`;

  selectors.hotelNames.forEach((node) => {
    node.textContent = hotelSettings.hotelName;
  });

  selectors.hotelLabels.forEach((node) => {
    node.textContent = hotelSettings.hotelLabel;
  });

  selectors.hotelLogos.forEach((image) => {
    image.src = hotelSettings.logoUrl || defaultHotelSettings.logoUrl;
    image.alt = `${fullName} logo`;
  });
}

async function loadHotelSettings() {
  if (!usesSupabase) return { ...defaultHotelSettings };

  const { data, error } = await supabaseClient
    .from("hotel_settings")
    .select("id, hotel_id, hotel_name, hotel_label, logo_url, default_language, currency_code, currency_symbol, timezone")
    .eq("hotel_id", currentHotelId)
    .maybeSingle();

  if (error) {
    console.warn("Hotel settings are not available yet. Using Marseille defaults.", error.message);
    return { ...defaultHotelSettings };
  }

  return normalizeHotelSettings(data || {});
}

function populateHotelSettingsForm() {
  if (!selectors.hotelSettingsForm) return;
  selectors.settingsHotelName.value = hotelSettings.hotelName || defaultHotelSettings.hotelName;
  selectors.settingsHotelLabel.value = hotelSettings.hotelLabel || defaultHotelSettings.hotelLabel;
  selectors.settingsLogoUrl.value = hotelSettings.logoUrl || defaultHotelSettings.logoUrl;
  selectors.settingsDefaultLanguage.value = translations[hotelSettings.defaultLanguage] ? hotelSettings.defaultLanguage : defaultHotelSettings.defaultLanguage;
  selectors.settingsCurrency.value = getSupportedCurrency(hotelSettings.currencyCode).code;
  setHotelSettingsMessage("", "");
  renderCustomDropdowns();
}

function setHotelSettingsMessage(message, type) {
  if (!selectors.hotelSettingsMessage) return;
  selectors.hotelSettingsMessage.textContent = message;
  selectors.hotelSettingsMessage.className = `settings-message ${type || ""}`;
}

function readHotelSettingsForm() {
  const formData = new FormData(selectors.hotelSettingsForm);
  const currency = getSupportedCurrency(String(formData.get("currency") || defaultHotelSettings.currencyCode));
  return normalizeHotelSettings({
    id: hotelSettings.id,
    hotelId: hotelSettings.hotelId || currentHotelId,
    hotelName: String(formData.get("hotelName") || "").trim(),
    hotelLabel: String(formData.get("hotelLabel") || "").trim(),
    logoUrl: String(formData.get("logoUrl") || "").trim(),
    defaultLanguage: String(formData.get("defaultLanguage") || defaultHotelSettings.defaultLanguage),
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
    timezone: getSystemTimezone(),
  });
}

function mapHotelSettingsToDatabase(settings) {
  return {
    hotel_id: settings.hotelId || currentHotelId,
    hotel_name: settings.hotelName,
    hotel_label: settings.hotelLabel,
    logo_url: settings.logoUrl,
    default_language: settings.defaultLanguage,
    currency_code: settings.currencyCode,
    currency_symbol: settings.currencySymbol,
    timezone: settings.timezone,
  };
}

function refreshHotelSettingsView() {
  applyHotelSettings();
  applyStaticTranslations();
  populateRoomSelect();
  populateCompanyOptions();
  updateDateRangeDisplay();
  renderCustomDropdowns();
  renderAll();
}

async function saveHotelSettings(nextSettings) {
  if (!usesSupabase) {
    hotelSettings = nextSettings;
    refreshHotelSettingsView();
    return true;
  }

  const payload = mapHotelSettingsToDatabase(nextSettings);
  const query = hotelSettings.id
    ? supabaseClient.from("hotel_settings").update(payload).eq("id", hotelSettings.id).eq("hotel_id", currentHotelId).select("id, hotel_id, hotel_name, hotel_label, logo_url, default_language, currency_code, currency_symbol, timezone").single()
    : supabaseClient.from("hotel_settings").insert(payload).select("id, hotel_id, hotel_name, hotel_label, logo_url, default_language, currency_code, currency_symbol, timezone").single();

  const { data, error } = await query;
  if (error) {
    console.error("Could not save hotel settings", error);
    return false;
  }

  hotelSettings = normalizeHotelSettings(data || nextSettings);
  refreshHotelSettingsView();
  return true;
}

function roomTypeLabel(type) {
  return t(`roomTypes.${type}`) || type;
}

function getPageHeader(sectionName) {
  return t(`pageHeaders.${sectionName}`) || translations.en.pageHeaders.dashboard;
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  updateLanguageToggle();

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

  renderRoomEditorTypeOptions();
  applyHotelSettings();
}

function updateLanguageToggle() {
  const nextLanguage = currentLanguage === "ka" ? "English" : "ქართული";
  selectors.languageToggles.forEach((toggle) => {
    toggle.setAttribute("aria-label", `${t("language.label")}: ${nextLanguage}`);
    toggle.setAttribute("title", nextLanguage);
  });

  selectors.languageToggleFlags.forEach((flag) => {
    flag.src = languageFlagIcons[currentLanguage] || languageFlagIcons.en;
  });

  selectors.settingsLanguageButtons.forEach((button) => {
    const isSelected = button.dataset.settingsLanguage === currentLanguage;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function setLanguage(language) {
  if (!translations[language]) return;

  currentLanguage = language;
  try {
    localStorage.setItem(tenantLanguageStorageKey, language);
    if (currentHotelId === defaultHotelId) {
      localStorage.setItem(languageStorageKey, language);
    }
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

  renderCustomDropdowns();
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

function getCenteredCalendarStart() {
  return addDays(todayDate(), -calendarTodayOffsetDays);
}

function getDefaultCalendarStart() {
  return window.matchMedia("(max-width: 1024px)").matches ? todayDate() : getCenteredCalendarStart();
}

function isPhoneCalendarReadOnly() {
  return window.matchMedia("(max-width: 640px)").matches;
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
    return (JSON.parse(localStorage.getItem(storageKey)) || []).map(normalizeStayNights);
  } catch {
    return [];
  }
}

function saveLocalStays() {
  localStorage.setItem(storageKey, JSON.stringify(stays));
}

function loadLocalStaffMessages() {
  try {
    return (JSON.parse(localStorage.getItem(staffMessagesStorageKey)) || [])
      .map((message) => ({
        id: message.id || crypto.randomUUID(),
        color: normalizeBookingColor(message.color) || staffMessagePalette[0],
        message: String(message.message || "").trim(),
        createdAt: message.createdAt || new Date().toISOString(),
      }))
      .filter((message) => message.message)
      .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
  } catch {
    return [];
  }
}

function saveLocalStaffMessages() {
  localStorage.setItem(staffMessagesStorageKey, JSON.stringify(staffMessages.slice(-80)));
}

function normalizeCompanyName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function normalizeRoomId(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeRoom(room) {
  const type = roomTypeOrder.includes(room?.type) ? room.type : roomTypeOrder[0];
  const id = normalizeRoomId(room?.id);
  const fallbackOrder = Number(id);
  return {
    id,
    type,
    group: room?.group || roomGroupByType[type] || type.toLowerCase(),
    sortOrder: Number.isFinite(Number(room?.sortOrder)) ? Number(room.sortOrder) : (Number.isFinite(fallbackOrder) ? fallbackOrder : 999),
    nightlyPrice: Math.max(Number(room?.nightlyPrice ?? roomNightPrices[type] ?? 0), 0),
    isActive: room?.isActive !== false,
  };
}

function sortRoomsForInventory(nextRooms) {
  return nextRooms
    .map(normalizeRoom)
    .filter((room) => room.id && room.isActive)
    .sort((first, second) => {
      if (first.sortOrder !== second.sortOrder) return first.sortOrder - second.sortOrder;
      return first.id.localeCompare(second.id, undefined, { numeric: true });
    });
}

function loadLocalRoomInventory() {
  try {
    const stored = JSON.parse(localStorage.getItem(roomInventoryStorageKey) || "[]");
    if (Array.isArray(stored) && stored.length) return sortRoomsForInventory(stored);
  } catch {
    // Fall back to bundled rooms.
  }

  const storedPrices = JSON.parse(localStorage.getItem(roomPricesStorageKey) || "{}");
  return sortRoomsForInventory(defaultRooms.map((room, index) => ({
    ...room,
    sortOrder: Number(room.id) || index + 1,
    nightlyPrice: Number(storedPrices[room.type] ?? room.nightlyPrice ?? 0),
  })));
}

function saveLocalRoomInventory() {
  localStorage.setItem(roomInventoryStorageKey, JSON.stringify(rooms.map(normalizeRoom)));
}

function getCompanyNameById(companyId) {
  return companies.find((company) => company.id === companyId)?.name || "";
}

function getCompanyById(companyId) {
  return companies.find((company) => company.id === companyId);
}

function getCompanyColor(company) {
  return company?.color || defaultBookingColor;
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
  renderCustomDropdown("company");
}

function setCompanyMode(mode) {
  const nextMode = mode === "new" ? "new" : "existing";

  selectors.companyModeInputs?.forEach((input) => {
    input.checked = input.value === nextMode;
  });
  selectors.companySelect?.classList.toggle("hidden", nextMode !== "existing");
  selectors.companyDropdown?.classList.toggle("hidden", nextMode !== "existing");
  selectors.companyNewInput?.classList.toggle("hidden", nextMode !== "new");

  if (nextMode === "new") {
    selectors.companySelect.value = "";
  } else if (selectors.companyNewInput) {
    selectors.companyNewInput.value = "";
  }
  renderCustomDropdown("company");
}

function getCompanyOptions() {
  const byName = new Map();

  companies.forEach((company) => {
    const name = normalizeCompanyName(company.name);
    const key = name.toLocaleLowerCase();
    if (name) byName.set(key, { name, color: pendingCompanyColorUpdates.get(key) || getCompanyColor(company) });
  });

  stays.forEach((stay) => {
    const name = normalizeCompanyName(stay.companyName);
    const key = name.toLocaleLowerCase();
    if (name && (!byName.has(key) || pendingCompanyColorUpdates.has(key))) {
      byName.set(key, { name, color: pendingCompanyColorUpdates.get(key) || stay.color || defaultBookingColor });
    }
  });

  return Array.from(byName.values())
    .sort((first, second) => first.name.localeCompare(second.name, getLocale()))
    .map((company) => ({ id: company.name.toLocaleLowerCase(), name: company.name, color: company.color }));
}

function applySelectedCompanyColor() {
  const company = getCompanyById(selectors.companySelect?.value);
  if (!selectors.stayForm?.color) return;
  if (!company) {
    setGuestDefaultColor();
    return;
  }
  const companyColor = normalizeBookingColor(getCompanyColor(company)) || defaultBookingColor;
  selectors.stayForm.color.value = companyColor;
  pendingBookingColor = companyColor;
  renderColorPalette();
}

function getActiveBookingColors(excludeStayId = editingStayId) {
  return new Set(
    stays
      .filter((stay) => stay.id !== excludeStayId && !["checked-out", "cancelled"].includes(getStayStatus(stay)))
      .map((stay) => String(stay.color || defaultBookingColor).toLowerCase())
  );
}

function normalizeBookingColor(color) {
  return /^#[0-9a-f]{6}$/i.test(String(color || "")) ? String(color).toLowerCase() : null;
}

function getCustomToneColor(value = customColorTone) {
  const hue = Math.max(0, Math.min(360, Number(value) || 0));
  const chroma = 0.84 * (1 - Math.abs(2 * 0.61 - 1));
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const match = 0.61 - chroma / 2;
  const [red, green, blue] = hue < 60 ? [chroma, x, 0]
    : hue < 120 ? [x, chroma, 0]
      : hue < 180 ? [0, chroma, x]
        : hue < 240 ? [0, x, chroma]
          : hue < 300 ? [x, 0, chroma]
            : [chroma, 0, x];
  const toHex = (channel) => Math.round((channel + match) * 255).toString(16).padStart(2, "0");
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function readLocalCustomBookingColors() {
  try {
    const storedColors = JSON.parse(localStorage.getItem(bookingCustomColorsStorageKey) || "[]");
    return Array.isArray(storedColors)
      ? storedColors.map(normalizeBookingColor).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function getCustomBookingColors() {
  return usesSupabase ? customBookingColors : readLocalCustomBookingColors();
}

async function loadCustomBookingColors() {
  const localColors = readLocalCustomBookingColors();

  if (!usesSupabase) {
    customBookingColors = localColors;
    return customBookingColors;
  }

  const { data, error } = await supabaseClient
    .from("booking_colors")
    .select("color")
    .eq("hotel_id", currentHotelId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load booking colors", error);
    customBookingColors = [];
    return customBookingColors;
  }

  let cloudColors = (data || []).map((item) => normalizeBookingColor(item.color)).filter(Boolean);
  const colorsToMigrate = localColors.filter((color) => (
    !bookingColorPalette.includes(color) && !cloudColors.includes(color)
  ));

  if (colorsToMigrate.length > 0) {
    const { data: migratedColors, error: migrateError } = await supabaseClient
      .from("booking_colors")
      .upsert(colorsToMigrate.map((color) => ({ hotel_id: currentHotelId, color })), { onConflict: "hotel_id,color" })
      .select("color");

    if (migrateError) {
      console.error("Failed to migrate booking colors", migrateError);
    } else {
      cloudColors = [...cloudColors, ...(migratedColors || []).map((item) => normalizeBookingColor(item.color)).filter(Boolean)];
    }
  }

  customBookingColors = [...new Set(cloudColors)];
  return customBookingColors;
}

function getBookingColorPalette() {
  return [...new Set([...bookingColorPalette, ...getCustomBookingColors()])];
}

async function saveCustomBookingColor(color) {
  const normalizedColor = normalizeBookingColor(color);
  if (!normalizedColor || bookingColorPalette.includes(normalizedColor)) return normalizedColor;

  if (!usesSupabase) {
    const colors = [...new Set([...readLocalCustomBookingColors(), normalizedColor])];
    localStorage.setItem(bookingCustomColorsStorageKey, JSON.stringify(colors));
    customBookingColors = colors;
    return normalizedColor;
  }

  const { data, error } = await supabaseClient
    .from("booking_colors")
    .upsert({ hotel_id: currentHotelId, color: normalizedColor }, { onConflict: "hotel_id,color" })
    .select("color")
    .single();

  if (error) {
    console.error("Failed to save booking color", error);
    return null;
  }

  customBookingColors = [...new Set([...customBookingColors, normalizeBookingColor(data?.color) || normalizedColor])];
  return normalizedColor;
}

async function removeCustomBookingColor(color) {
  const normalizedColor = normalizeBookingColor(color);
  if (!normalizedColor || bookingColorPalette.includes(normalizedColor)) return false;

  if (!usesSupabase) {
    const colors = readLocalCustomBookingColors().filter((item) => item !== normalizedColor);
    localStorage.setItem(bookingCustomColorsStorageKey, JSON.stringify(colors));
    customBookingColors = colors;
    return true;
  }

  const { error } = await supabaseClient
    .from("booking_colors")
    .delete()
    .eq("hotel_id", currentHotelId)
    .eq("color", normalizedColor);

  if (error) {
    console.error("Failed to remove booking color", error);
    return false;
  }

  customBookingColors = customBookingColors.filter((item) => item !== normalizedColor);
  return true;
}

function getAvailableBookingColors(excludeStayId = editingStayId) {
  const activeColors = getActiveBookingColors(excludeStayId);
  return getBookingColorPalette().filter((color) => !activeColors.has(color));
}

function getNextAvailableBookingColor(excludeStayId = editingStayId) {
  return getAvailableBookingColors(excludeStayId)[0] || defaultBookingColor;
}

function getNextGuestBookingColor(excludeStayId = editingStayId) {
  const activeColors = getActiveBookingColors(excludeStayId);
  return bookingColorPalette.find((color) => !activeColors.has(color)) || defaultBookingColor;
}

function setGuestDefaultColor() {
  if (!selectors.stayForm?.color) return;
  selectors.stayForm.color.value = getNextGuestBookingColor();
  pendingBookingColor = null;
  renderColorPalette();
}

function isCompanyColorEditMode() {
  const isExistingCompanyMode = [...selectors.companyModeInputs || []].some((input) => (
    input.value === "existing" && input.checked
  ));
  return Boolean(isExistingCompanyMode && selectors.companySelect?.value);
}

function getHueFromColor(color) {
  const normalizedColor = normalizeBookingColor(color) || defaultBookingColor;
  const red = parseInt(normalizedColor.slice(1, 3), 16) / 255;
  const green = parseInt(normalizedColor.slice(3, 5), 16) / 255;
  const blue = parseInt(normalizedColor.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) return customColorTone;
  if (max === red) return Math.round(60 * (((green - blue) / delta) % 6) + 360) % 360;
  if (max === green) return Math.round(60 * ((blue - red) / delta + 2));
  return Math.round(60 * ((red - green) / delta + 4));
}

function renderColorPalette({ keepOpen = false, keepAdding = false } = {}) {
  if (!selectors.colorPalette || !selectors.stayForm?.color) return;

  const selectedColor = String(selectors.stayForm.color.value || defaultBookingColor).toLowerCase();
  const draftColor = normalizeBookingColor(pendingBookingColor) || selectedColor;
  const activeColors = getActiveBookingColors();
  const companyColorMode = isCompanyColorEditMode();
  const customColors = [...new Set([
    ...getCustomBookingColors(),
    ...(!bookingColorPalette.includes(selectedColor) ? [selectedColor] : []),
    ...(!bookingColorPalette.includes(draftColor) ? [draftColor] : []),
  ])];
  const renderSwatches = (colors) => colors
    .map((color) => {
      const selected = color === draftColor;
      const unavailable = activeColors.has(color) && !selected;
      return `<button type="button" class="color-swatch${selected ? " is-selected" : ""}" data-booking-color="${color}" role="radio" aria-checked="${selected}" aria-label="${color}" title="${unavailable ? "In use" : "Select color"}"${unavailable ? " disabled" : ""} style="--swatch-color: ${color}"></button>`;
    })
    .join("");

  selectors.colorPalette.innerHTML = renderSwatches(bookingColorPalette);
  if (selectors.customColorPalette) selectors.customColorPalette.innerHTML = renderSwatches(customColors);
  selectors.colorPalette?.classList.toggle("hidden", companyColorMode);
  selectors.colorPalette?.previousElementSibling?.classList.toggle("hidden", companyColorMode);
  selectors.colorPaletteDivider?.classList.toggle("hidden", companyColorMode || customColors.length === 0);
  selectors.customColorPalette?.classList.toggle("hidden", companyColorMode || customColors.length === 0);
  selectors.customColorPaletteLabel?.classList.toggle("hidden", companyColorMode || customColors.length === 0);

  const canRemoveDraft = !bookingColorPalette.includes(draftColor) && getCustomBookingColors().includes(draftColor);
  if (selectors.colorRemoveSwatch) selectors.colorRemoveSwatch.disabled = companyColorMode || !canRemoveDraft;
  selectors.colorPicker?.classList.toggle("is-open", keepOpen);
  selectors.colorPicker?.classList.toggle("is-adding", keepOpen && (keepAdding || companyColorMode));
  selectors.colorPicker?.classList.toggle("company-color-mode", keepOpen && companyColorMode);
  selectors.colorPickerTrigger?.setAttribute("aria-expanded", String(keepOpen));
  selectors.colorPicker?.style.setProperty("--selected-color", selectedColor);
  selectors.colorPicker?.style.setProperty("--draft-color", draftColor);
  selectors.colorPicker?.style.setProperty("--custom-color", companyColorMode ? draftColor : getCustomToneColor());
  if (selectors.colorToneRange) selectors.colorToneRange.value = String(customColorTone);
  if (!keepOpen) pendingBookingColor = null;
}

function mapRoomFromDatabase(row) {
  return normalizeRoom({
    id: row.id,
    hotelId: row.hotel_id || currentHotelId,
    type: row.type,
    group: row.group_name,
    sortOrder: row.sort_order,
    nightlyPrice: Number(row.nightly_price ?? roomNightPrices[row.type] ?? 0),
    isActive: row.is_active !== false,
  });
}

async function loadRooms() {
  if (!usesSupabase) return loadLocalRoomInventory();

  const { data, error } = await supabaseClient
    .from("rooms")
    .select("id, hotel_id, type, group_name, sort_order, nightly_price, is_active")
    .eq("hotel_id", currentHotelId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load rooms from Supabase", error);
    return defaultRooms.slice();
  }

  return sortRoomsForInventory((data || []).map(mapRoomFromDatabase));
}

function getNextRoomSortOrder() {
  const maxOrder = rooms.reduce((max, room) => Math.max(max, Number(room.sortOrder || 0)), 0);
  return maxOrder + 1;
}

function hasOpenRoomStay(roomId) {
  return stays.some((stay) => stay.roomId === roomId && !["checked-out", "cancelled"].includes(getStayStatus(stay)));
}

function buildRoomPayload(room) {
  const normalized = normalizeRoom(room);
  return {
    hotel_id: currentHotelId,
    id: normalized.id,
    type: normalized.type,
    group_name: normalized.group,
    sort_order: normalized.sortOrder,
    nightly_price: normalized.nightlyPrice,
    is_active: true,
  };
}

async function saveRoomInventoryItem(room, originalRoomId = "") {
  const normalized = normalizeRoom(room);
  const previousRoomId = normalizeRoomId(originalRoomId);
  if (!normalized.id || !Number.isFinite(normalized.nightlyPrice)) return { ok: false, message: t("roomInventory.required") };

  if (!previousRoomId && rooms.some((item) => item.id === normalized.id)) {
    return { ok: false, message: t("roomInventory.duplicate") };
  }

  const nextRoom = {
    ...normalized,
    group: roomGroupByType[normalized.type] || normalized.group,
    isActive: true,
  };

  if (!usesSupabase) {
    rooms = sortRoomsForInventory(previousRoomId
      ? rooms.map((item) => (item.id === previousRoomId ? nextRoom : item))
      : [...rooms, nextRoom]);
    saveLocalRoomInventory();
    return { ok: true };
  }

  const query = previousRoomId
    ? supabaseClient.from("rooms").update(buildRoomPayload(nextRoom)).eq("hotel_id", currentHotelId).eq("id", previousRoomId)
    : supabaseClient.from("rooms").upsert(buildRoomPayload(nextRoom), { onConflict: "hotel_id,id" });

  const { error } = await query;
  if (error) {
    console.error("Failed to save room", error);
    return { ok: false, message: t("roomInventory.saveError") };
  }

  rooms = await loadRooms();
  return { ok: true };
}

async function hideRoomInventoryItem(roomId) {
  const normalizedRoomId = normalizeRoomId(roomId);
  if (!normalizedRoomId) return { ok: false, message: t("roomInventory.hideError") };
  if (hasOpenRoomStay(normalizedRoomId)) return { ok: false, message: t("roomInventory.hideBlocked") };

  if (!usesSupabase) {
    rooms = rooms.filter((room) => room.id !== normalizedRoomId);
    saveLocalRoomInventory();
    return { ok: true };
  }

  const { error } = await supabaseClient
    .from("rooms")
    .update({ is_active: false })
    .eq("hotel_id", currentHotelId)
    .eq("id", normalizedRoomId);

  if (error) {
    console.error("Failed to hide room", error);
    return { ok: false, message: t("roomInventory.hideError") };
  }

  rooms = await loadRooms();
  return { ok: true };
}

function mapStaffMessageFromDatabase(row) {
  return {
    id: row.id,
    color: normalizeBookingColor(row.color) || staffMessagePalette[0],
    message: row.message || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

async function loadStaffMessages() {
  if (!usesSupabase) return loadLocalStaffMessages();

  const { data, error } = await supabaseClient
    .from("staff_messages")
    .select("id, color, message, created_at")
    .eq("hotel_id", currentHotelId)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    console.error("Failed to load staff messages", error);
    return loadLocalStaffMessages();
  }

  return (data || []).map(mapStaffMessageFromDatabase).reverse();
}

async function saveStaffMessage(color, messageText) {
  const message = {
    id: crypto.randomUUID(),
    color: normalizeBookingColor(color) || staffMessagePalette[0],
    message: String(messageText || "").trim(),
    createdAt: new Date().toISOString(),
  };

  if (!message.message) return false;

  if (!usesSupabase) {
    staffMessages = [...staffMessages, message].slice(-80);
    saveLocalStaffMessages();
    return true;
  }

  const { data, error } = await supabaseClient
    .from("staff_messages")
    .insert({ hotel_id: currentHotelId, author: "reception", color: message.color, message: message.message })
    .select("id, color, message, created_at")
    .single();

  if (error) {
    console.error("Failed to save staff message", error);
    staffMessages = [...staffMessages, message].slice(-80);
    saveLocalStaffMessages();
    return true;
  }

  staffMessages = [...staffMessages, mapStaffMessageFromDatabase(data)].slice(-80);
  return true;
}

async function saveRoomTypePrice(type, nightlyPrice) {
  const nextPrice = Math.max(Number(nightlyPrice || 0), 0);

  rooms = rooms.map((room) => (
    room.type === type ? { ...room, nightlyPrice: nextPrice } : room
  ));

  if (!usesSupabase) {
    saveLocalRoomInventory();
    return true;
  }

  const { error } = await supabaseClient
    .from("rooms")
    .update({ nightly_price: nextPrice })
    .eq("hotel_id", currentHotelId)
    .eq("type", type)
    .eq("is_active", true);

  if (error) {
    console.error("Failed to save room price", error);
    return false;
  }

  return true;
}

function mapStayFromDatabase(row) {
  const company = row.companies || null;

  return {
    id: row.id,
    hotelId: row.hotel_id || currentHotelId,
    guestName: row.guest_name,
    companyId: row.company_id || company?.id || undefined,
    companyName: company?.name || row.company_name || "",
    roomId: row.room_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: Number(row.night_count ?? getNightCount(row.check_in, row.check_out)),
    total: Number(row.total_amount || 0),
    discount: Number(row.discount_amount || 0),
    cash: Number(row.cash_amount || 0),
    card: Number(row.card_amount || 0),
    invoice: Number(row.invoice_amount || 0),
    debt: Number(row.debt_amount || 0),
    notes: row.notes || "",
    color: row.color || defaultBookingColor,
    isPinned: Boolean(row.is_pinned),
    status: row.is_cancelled ? "cancelled" : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStayToDatabase(stay) {
  return {
    id: stay.id,
    hotel_id: currentHotelId,
    guest_name: stay.guestName,
    company_id: stay.companyId || null,
    room_id: stay.roomId,
    check_in: stay.checkIn,
    check_out: stay.checkOut,
    night_count: Number(stay.nights ?? getNightCount(stay.checkIn, stay.checkOut)),
    color: stay.color || defaultBookingColor,
    total_amount: Number(stay.total || 0),
    discount_amount: Number(stay.discount || 0),
    cash_amount: Number(stay.cash || 0),
    card_amount: Number(stay.card || 0),
    invoice_amount: Number(stay.invoice || 0),
    debt_amount: Number(stay.debt || 0),
    notes: stay.notes || "",
    is_pinned: Boolean(stay.isPinned),
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
    .eq("hotel_id", currentHotelId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load companies from Supabase", error);
    return [];
  }

  return data || [];
}

async function ensureStayCompanies() {
  const companyColorByName = new Map();
  stays.forEach((stay) => {
    const name = normalizeCompanyName(stay.companyName);
    if (!name) return;
    const key = name.toLocaleLowerCase();
    companyColorByName.set(key, {
      name,
      color: pendingCompanyColorUpdates.get(key) || companyColorByName.get(key)?.color || stay.color || defaultBookingColor,
    });
  });

  const companyEntries = Array.from(companyColorByName.values());
  const companyNames = companyEntries.map((company) => company.name);

  if (!companyNames.length) return true;

  if (!usesSupabase) {
    companies = getCompanyOptions();
    pendingCompanyColorUpdates.clear();
    return true;
  }

  const existingByName = new Map(
    companies.map((company) => [normalizeCompanyName(company.name).toLocaleLowerCase(), company])
  );
  const missingNames = companyNames.filter((name) => !existingByName.has(name.toLocaleLowerCase()));

  if (missingNames.length > 0) {
    const { data, error } = await supabaseClient
      .from("companies")
      .upsert(
        missingNames.map((name) => ({
          hotel_id: currentHotelId,
          name,
          color: companyColorByName.get(name.toLocaleLowerCase())?.color || defaultBookingColor,
        })),
        { onConflict: "hotel_id,name" }
      )
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

  const colorUpdates = Array.from(pendingCompanyColorUpdates.entries()).filter(([nameKey]) => existingByName.has(nameKey));
  if (colorUpdates.length > 0) {
    const results = await Promise.all(
      colorUpdates.map(([nameKey, color]) => {
        const company = existingByName.get(nameKey);
        return supabaseClient
          .from("companies")
          .update({ color })
          .eq("hotel_id", currentHotelId)
          .eq("id", company.id)
          .select("*")
          .single();
      })
    );

    const failed = results.find((result) => result.error);
    if (failed) {
      console.error("Failed to update company color", failed.error);
      return false;
    }

    results.forEach((result) => {
      const company = result.data;
      if (company) existingByName.set(normalizeCompanyName(company.name).toLocaleLowerCase(), company);
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

  pendingCompanyColorUpdates.clear();
  return true;
}

async function loadStays() {
  if (!usesSupabase) {
    return loadLocalStays();
  }

  const { data, error } = await supabaseClient
    .from("stays")
    .select("*, companies(id, name, color)")
    .eq("hotel_id", currentHotelId)
    .order("check_in", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load stays from Supabase", error);
    return [];
  }

  return (data || []).map(mapStayFromDatabase);
}

async function saveStay(stayId) {
  if (!usesSupabase) {
    await ensureStayCompanies();
    populateCompanyOptions();
    saveLocalStays();
    return true;
  }

  const companiesSaved = await ensureStayCompanies();
  if (!companiesSaved) return false;

  const stay = stays.find((item) => item.id === stayId);
  if (!stay) return false;

  let { error: upsertError } = await supabaseClient
    .from("stays")
    .upsert(mapStayToDatabase(stay), { onConflict: "id" });

  if (upsertError && String(upsertError.message || "").includes("night_count")) {
    const { night_count: _nightCount, ...rowWithoutNightCount } = mapStayToDatabase(stay);
    const retryResult = await supabaseClient
      .from("stays")
      .upsert(rowWithoutNightCount, { onConflict: "id" });
    upsertError = retryResult.error;
  }

  if (upsertError) {
    console.error("Failed to save stays", upsertError);
    return false;
  }

  return true;
}

async function deleteStay(stayId) {
  if (!usesSupabase) {
    saveLocalStays();
    return true;
  }

  const { error } = await supabaseClient
    .from("stays")
    .delete()
    .eq("hotel_id", currentHotelId)
    .eq("id", stayId);

  if (error) {
    console.error("Failed to delete stay", error);
    return false;
  }

  return true;
}

async function refreshStays() {
  rooms = await loadRooms();
  stays = await loadStays();
  if (!usesSupabase) companies = await loadCompanies();
  populateRoomSelect();
  populateCompanyOptions();
  renderAll();
}

function getRoom(roomId) {
  return rooms.find((room) => room.id === roomId);
}

function getRoomNightPrice(roomOrType) {
  if (typeof roomOrType !== "string") {
    return Number(roomOrType?.nightlyPrice ?? roomNightPrices[roomOrType?.type] ?? 0);
  }

  const room = rooms.find((item) => item.type === roomOrType);
  return Number(room?.nightlyPrice ?? roomNightPrices[roomOrType] ?? 0);
}

function getStayNightlyRate(stay) {
  const nights = getNightCount(stay?.checkIn, stay?.checkOut);
  if (nights > 0) {
    const subtotal = Number(stay.total || 0) + Number(stay.discount || 0);
    const nightlyRate = subtotal / nights;
    if (nightlyRate > 0) return Math.round(nightlyRate);
  }
  return getRoomNightPrice(getRoom(stay?.roomId));
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

function canExtendCheckoutOnly(stay) {
  if (!stay || stay.status === "cancelled") return false;
  const today = todayDate();
  const checkIn = toDate(stay.checkIn);
  const checkOut = toDate(stay.checkOut);
  return today >= checkIn && today <= checkOut;
}

function isCheckoutOnlyDateEdit() {
  return Boolean(editingStayId && checkoutOnlyEditStayId === editingStayId);
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

function getNightCount(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = toDate(checkIn);
  const end = toDate(checkOut);
  if (end <= start) return 0;
  return Math.round((end - start) / 86400000);
}

function normalizeStayNights(stay) {
  if (!stay) return stay;
  const calculatedNights = getNightCount(stay.checkIn, stay.checkOut);
  return {
    ...stay,
    nights: Number(stay.nights ?? stay.nightCount ?? calculatedNights),
  };
}

function getFormNightCount() {
  const nights = getNightCount(selectors.stayForm?.checkIn?.value, selectors.stayForm?.checkOut?.value);
  return nights;
}

function updateEmptyNumberState(input) {
  if (!input) return;
  input.classList.toggle("empty-number", String(input.value || "") === "0");
}

function updateFormNumberStates() {
  ["nightlyRate", "nights", "discount", "total", "cash", "card", "invoice", "debt"].forEach((fieldName) => {
    updateEmptyNumberState(selectors.stayForm?.[fieldName]);
  });
}

function updateNightCountDisplay() {
  const nightsInput = selectors.stayForm?.nights;
  if (!nightsInput) return;
  const nights = getFormNightCount();
  nightsInput.value = String(nights);
  updateEmptyNumberState(nightsInput);
}

function calculateEstimatedTotal() {
  const nights = getFormNightCount();
  if (nights <= 0) return 0;
  const subtotal = nights * Number(selectors.stayForm?.nightlyRate?.value || 0);
  const discount = Number(selectors.stayForm?.discount?.value || 0);
  return Math.max(subtotal - discount, 0);
}

function setNightlyRateValue(value) {
  const nightlyInput = selectors.stayForm?.nightlyRate;
  if (!nightlyInput) return;
  isUpdatingNightlyRate = true;
  nightlyInput.value = String(value);
  updateEmptyNumberState(nightlyInput);
  isUpdatingNightlyRate = false;
}

function setTotalAmountValue(value) {
  const totalInput = selectors.stayForm?.total;
  if (!totalInput) return;
  const nextValue = String(value);
  isUpdatingTotalAmount = true;
  totalInput.value = nextValue;
  lastAutoTotalAmount = nextValue;
  updateEmptyNumberState(totalInput);
  isUpdatingTotalAmount = false;
}

function updateNightlyRateFromRoom({ force = false } = {}) {
  const nightlyInput = selectors.stayForm?.nightlyRate;
  const room = getRoom(selectors.stayForm?.roomId?.value);
  if (!nightlyInput || !room) return;

  const roomPrice = getRoomNightPrice(room);
  if (force || !nightlyRateWasEdited) {
    setNightlyRateValue(roomPrice);
    nightlyRateWasEdited = false;
  }
}

function updateEstimatedTotal({ force = false, forceNightly = false } = {}) {
  const totalInput = selectors.stayForm?.total;
  if (!totalInput) return;

  updateNightlyRateFromRoom({ force: forceNightly });
  updateNightCountDisplay();
  const estimatedTotal = calculateEstimatedTotal();
  const currentValue = String(totalInput.value || "");
  const canAutoUpdate =
    force ||
    !totalAmountWasEdited ||
    currentValue === "" ||
    Number(currentValue) === 0 ||
    currentValue === lastAutoTotalAmount;

  if (!canAutoUpdate) {
    updateFormNumberStates();
    return;
  }
  setTotalAmountValue(estimatedTotal);
  totalAmountWasEdited = false;
  updateFormNumberStates();
}

function hasRoomConflict(nextStay) {
  return stays.some((stay) => {
    if (stay.id === nextStay.id) return false;
    if (stay.roomId !== nextStay.roomId) return false;
    if (["checked-out", "cancelled"].includes(getStayStatus(stay))) return false;
    return datesOverlap(nextStay.checkIn, nextStay.checkOut, stay.checkIn, stay.checkOut);
  });
}

function hasRoomConflictForRange(stayId, roomId, checkIn, checkOut) {
  return stays.some((stay) => {
    if (stay.id === stayId) return false;
    if (stay.roomId !== roomId) return false;
    if (["checked-out", "cancelled"].includes(getStayStatus(stay))) return false;
    return datesOverlap(checkIn, checkOut, stay.checkIn, stay.checkOut);
  });
}

function populateRoomSelect() {
  selectors.roomSelect.innerHTML = rooms
    .map((room) => `<option value="${room.id}">${room.id} · ${roomTypeLabel(room.type)}</option>`)
    .join("");
  renderCustomDropdown("room");
}

function getCompanyDropdownItems() {
  return [
    { value: "", title: t("form.companyNone"), meta: "", color: "#cbd5e1" },
    ...companies
      .slice()
      .sort((first, second) => normalizeCompanyName(first.name).localeCompare(normalizeCompanyName(second.name), getLocale()))
      .map((company) => ({
        value: company.id,
        title: normalizeCompanyName(company.name),
        meta: "",
        color: getCompanyColor(company),
      })),
  ];
}

function getRoomDropdownItems() {
  return rooms.map((room) => ({
    value: room.id,
    title: `${room.id} · ${roomTypeLabel(room.type)}`,
    meta: "",
    color: "",
  }));
}

function getSettingsLanguageDropdownItems() {
  return [
    { value: "en", title: "English", meta: "", color: "" },
    { value: "ka", title: "ქართული", meta: "", color: "" },
  ];
}

function getSettingsCurrencyDropdownItems() {
  return hotelCurrencyOptions.map((currency) => ({
    value: currency.code,
    title: currency.title,
    meta: currency.meta,
    color: "",
  }));
}

function getDropdownConfig(type) {
  if (type === "company") {
    return {
      container: selectors.companyDropdown,
      select: selectors.companySelect,
      items: getCompanyDropdownItems(),
      placeholder: t("form.companyNone"),
    };
  }

  if (type === "settings-language") {
    return {
      container: selectors.settingsDefaultLanguageDropdown,
      select: selectors.settingsDefaultLanguage,
      items: getSettingsLanguageDropdownItems(),
      placeholder: t("settings.defaultLanguage"),
    };
  }

  if (type === "settings-currency") {
    return {
      container: selectors.settingsCurrencyDropdown,
      select: selectors.settingsCurrency,
      items: getSettingsCurrencyDropdownItems(),
      placeholder: t("settings.currency"),
    };
  }

  return {
    container: selectors.roomDropdown,
    select: selectors.roomSelect,
    items: getRoomDropdownItems(),
    placeholder: t("form.room"),
  };
}

function renderCustomDropdown(type) {
  const config = getDropdownConfig(type);
  if (!config.container || !config.select) return;

  const isOpen = openCustomDropdown === type && !config.container.classList.contains("hidden");
  const selectedValue = config.select.value;
  const selectedItem = config.items.find((item) => item.value === selectedValue) || config.items[0] || {
    value: "",
    title: config.placeholder,
    meta: "",
    color: "#cbd5e1",
  };

  const options = config.items
    .map((item) => {
      const isSelected = item.value === selectedValue;
      return `
        <button class="align-dropdown-option${isSelected ? " is-selected" : ""}" type="button" role="option" aria-selected="${isSelected}" data-dropdown-value="${escapeHtml(item.value)}">
          <span class="align-dropdown-option-copy">
            <strong>${escapeHtml(item.title)}</strong>
            ${item.meta ? `<small>${escapeHtml(item.meta)}</small>` : ""}
          </span>
          <span class="align-dropdown-check" aria-hidden="true">✓</span>
        </button>
      `;
    })
    .join("");

  config.container.classList.toggle("is-open", isOpen);
  config.container.innerHTML = `
    <button class="align-dropdown-trigger" type="button" aria-haspopup="listbox" aria-expanded="${isOpen}" data-dropdown-trigger="${type}">
      <span class="align-dropdown-trigger-copy">
        <strong>${escapeHtml(selectedItem.title)}</strong>
        ${selectedItem.meta ? `<small>${escapeHtml(selectedItem.meta)}</small>` : ""}
      </span>
      <span class="align-dropdown-chevron" aria-hidden="true"></span>
    </button>
    <div class="align-dropdown-menu" role="listbox" aria-label="${escapeHtml(config.placeholder)}">
      ${options}
    </div>
  `;
}

function renderCustomDropdowns() {
  renderCustomDropdown("company");
  renderCustomDropdown("room");
  renderCustomDropdown("settings-language");
  renderCustomDropdown("settings-currency");
}

function closeCustomDropdowns() {
  if (!openCustomDropdown) return;
  openCustomDropdown = null;
  renderCustomDropdowns();
}

function setCustomDropdownValue(type, value) {
  const config = getDropdownConfig(type);
  if (!config.select) return;
  config.select.value = value;
  config.select.dispatchEvent(new Event("change", { bubbles: true }));
  openCustomDropdown = null;
  renderCustomDropdowns();
}


function renderRoomMap() {
  selectors.roomMap.innerHTML = rooms
    .map((room) => {
      const currentStay = stays.find(
        (stay) => stay.roomId === room.id && getStayStatus(stay) === "checked-in"
      );
      const roomClass = currentStay ? (getDebt(currentStay) > 0 ? "room-debt" : "room-busy") : "room-free";
      const label = currentStay ? currentStay.guestName : t("common.available");
      const roomAttributes = currentStay
        ? `data-room-stay="${currentStay.id}" style="--room-color: ${currentStay.color || defaultBookingColor}"`
        : `data-room-id="${room.id}"`;

      return `
        <button class="room-card ${roomClass}" ${roomAttributes}>
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
  if (!selectors.roomGroups) return;
  if (selectors.roomsInventoryTitle) {
    selectors.roomsInventoryTitle.textContent = `${rooms.length} ${t("panels.roomsByCategory")}`;
  }

  selectors.roomGroups.innerHTML = roomTypeOrder
    .map((type) => {
      const groupRooms = rooms.filter((room) => room.type === type);
      return `
        <div class="room-group-card" data-room-type="${type}">
          <div class="room-group-topline">
            <span>${groupRooms.length} ${getRoomWord(groupRooms.length)}</span>
            <button type="button" class="room-price-edit" data-edit-room-price="${type}" aria-label="${escapeHtml(t("roomInventory.editPrice"))}">${t("roomInventory.editPrice")}</button>
          </div>
          <h4>${roomTypeLabel(type)}</h4>
          <strong class="room-group-price">${formatMoney(getRoomNightPrice(type))} / ${t("panels.perNight")}</strong>
          <div class="room-chip-list">
            ${groupRooms.map((room) => `
              <button type="button" class="room-inventory-chip" data-edit-room="${escapeHtml(room.id)}" aria-label="${escapeHtml(t("roomInventory.editRoom"))} ${escapeHtml(room.id)}">
                ${escapeHtml(room.id)}
              </button>
            `).join("")}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRoomEditorTypeOptions() {
  if (!selectors.roomEditorForm?.roomType) return;
  const currentValue = selectors.roomEditorForm.roomType.value || roomTypeOrder[0];
  selectors.roomEditorForm.roomType.innerHTML = roomTypeOrder
    .map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(roomTypeLabel(type))}</option>`)
    .join("");
  selectors.roomEditorForm.roomType.value = roomTypeOrder.includes(currentValue) ? currentValue : roomTypeOrder[0];
}

function setRoomEditorMessage(message = "", type = "") {
  if (!selectors.roomEditorMessage) return;
  selectors.roomEditorMessage.textContent = message;
  selectors.roomEditorMessage.className = type || "";
}

function closeRoomEditor() {
  editingRoomId = null;
  selectors.roomEditorForm?.classList.add("hidden");
  selectors.roomEditorForm?.reset();
  setRoomEditorMessage();
}

function openRoomEditor(room = null) {
  if (!selectors.roomEditorForm) return;

  renderRoomEditorTypeOptions();
  const isEdit = Boolean(room);
  const type = room?.type || "Standard";
  editingRoomId = isEdit ? room.id : null;
  selectors.roomEditorTitle.textContent = isEdit ? t("roomInventory.editRoom") : t("roomInventory.newRoom");
  selectors.roomEditorForm.roomId.value = room?.id || "";
  selectors.roomEditorForm.roomId.readOnly = isEdit;
  selectors.roomEditorForm.roomType.value = type;
  selectors.roomEditorForm.nightlyPrice.value = String(room?.nightlyPrice ?? getRoomNightPrice(type));
  selectors.roomEditorForm.sortOrder.value = String(room?.sortOrder ?? getNextRoomSortOrder());
  selectors.roomEditorHide?.classList.toggle("hidden", !isEdit);
  setRoomEditorMessage();
  selectors.roomEditorForm.classList.remove("hidden");
  requestAnimationFrame(() => selectors.roomEditorForm.scrollIntoView({ block: "nearest", behavior: "smooth" }));
}

function readRoomEditorForm() {
  const type = selectors.roomEditorForm.roomType.value;
  return {
    id: normalizeRoomId(selectors.roomEditorForm.roomId.value),
    type,
    group: roomGroupByType[type] || type.toLowerCase(),
    nightlyPrice: Number(selectors.roomEditorForm.nightlyPrice.value || 0),
    sortOrder: Number(selectors.roomEditorForm.sortOrder.value || getNextRoomSortOrder()),
    isActive: true,
  };
}

function getRoomWord(count) {
  return count === 1 ? t("common.room") : t("common.rooms");
}

function getLegacyFavoriteGuestIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(favoriteGuestStorageKey) || "[]");
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function getFavoriteGuestIds() {
  if (usesSupabase) {
    return new Set(stays.filter((stay) => stay.isPinned).map((stay) => stay.id));
  }

  return getLegacyFavoriteGuestIds();
}

async function migrateLegacyFavoriteGuests() {
  if (!usesSupabase || localStorage.getItem(favoriteGuestMigrationStorageKey)) return;

  const legacyIds = [...getLegacyFavoriteGuestIds()].filter((id) => stays.some((stay) => stay.id === id));
  if (!legacyIds.length) {
    localStorage.setItem(favoriteGuestMigrationStorageKey, "true");
    return;
  }

  const { error } = await supabaseClient
    .from("stays")
    .update({ is_pinned: true })
    .eq("hotel_id", currentHotelId)
    .in("id", legacyIds);

  if (error) {
    console.error("Failed to migrate favorite guests", error);
    return;
  }

  const favoriteIds = new Set(legacyIds);
  stays = stays.map((stay) => (favoriteIds.has(stay.id) ? { ...stay, isPinned: true } : stay));
  localStorage.setItem(favoriteGuestMigrationStorageKey, "true");
}

async function toggleFavoriteGuest(stayId) {
  const stay = stays.find((item) => item.id === stayId);
  if (!stay) return false;

  if (!usesSupabase) {
    const favorites = getLegacyFavoriteGuestIds();
    if (favorites.has(stayId)) favorites.delete(stayId);
    else favorites.add(stayId);
    localStorage.setItem(favoriteGuestStorageKey, JSON.stringify([...favorites]));
    return true;
  }

  const isPinned = !stay.isPinned;
  stays = stays.map((item) => (item.id === stayId ? { ...item, isPinned } : item));
  const { error } = await supabaseClient
    .from("stays")
    .update({ is_pinned: isPinned })
    .eq("hotel_id", currentHotelId)
    .eq("id", stayId);

  if (error) {
    console.error("Failed to update favorite guest", error);
    stays = stays.map((item) => (item.id === stayId ? { ...item, isPinned: !isPinned } : item));
    return false;
  }

  return true;
}

function animateActiveGuestReorder(previousPositions) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  selectors.activeGuestList.querySelectorAll("[data-active-stay]").forEach((card) => {
    const previous = previousPositions.get(card.dataset.activeStay);
    if (!previous) return;

    const next = card.getBoundingClientRect();
    const translateY = previous.top - next.top;
    if (Math.abs(translateY) < 1) return;

    card.animate(
      [{ transform: `translateY(${translateY}px)` }, { transform: "translateY(0)" }],
      { duration: 280, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  });
}

function syncOverviewPanelHeights() {
  const occupancyPanel = selectors.roomMap?.closest(".panel");
  const activeGuestsPanel = document.querySelector(".active-guests-panel");

  if (
    !occupancyPanel ||
    !activeGuestsPanel ||
    window.innerWidth < 1025 ||
    !occupancyPanel.offsetParent
  ) {
    activeGuestsPanel?.style.removeProperty("height");
    return;
  }

  activeGuestsPanel.style.height = `${Math.ceil(occupancyPanel.getBoundingClientRect().height)}px`;
}

function renderActiveGuests() {
  const favorites = getFavoriteGuestIds();
  const active = stays
    .filter((stay) => getStayStatus(stay) === "checked-in")
    .sort((first, second) => Number(favorites.has(second.id)) - Number(favorites.has(first.id)));

  if (!active.length) {
    selectors.activeGuestList.innerHTML = `<div class="empty-state">${t("activeGuests.empty")}</div>`;
    return;
  }

  selectors.activeGuestList.innerHTML = active
    .map((stay) => {
      const room = getRoom(stay.roomId);
      const isFavorite = favorites.has(stay.id);
      return `
        <article class="guest-card active-guest-card${isFavorite ? " is-favorite" : ""}" data-active-stay="${stay.id}" role="button" tabindex="0" style="--guest-color: ${stay.color || defaultBookingColor}">
          <button type="button" class="guest-favorite" data-toggle-favorite="${stay.id}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}" title="${isFavorite ? "Remove from favorites" : "Add to favorites"}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z" /></svg>
          </button>
          <div>
            <strong>${stay.guestName}</strong>
            <span>${room.id} · ${roomTypeLabel(room.type)}${stay.companyName ? " · " + stay.companyName : ""}</span>
          </div>
          <p>${t("activeGuests.checkout")}: ${formatDate(stay.checkOut)}</p>
          ${stay.notes ? `<p class="guest-note">${stay.notes}</p>` : ""}
          <small>${t("activeGuests.review")}</small>
        </article>
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
  selectors.debtStat.textContent = formatMoney(debt);
}

function formatStaffMessageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderStaffChatColors() {
  if (!selectors.staffChatColors) return;
  selectors.staffChatColors.innerHTML = staffMessagePalette
    .map((color) => `
      <button
        type="button"
        class="staff-chat-color${color === selectedStaffColor ? " is-selected" : ""}"
        data-staff-color="${color}"
        role="radio"
        aria-checked="${color === selectedStaffColor}"
        aria-label="${t("staffChat.color")}"
        style="--staff-color: ${color}"
      ></button>
    `)
    .join("");
}

function scrollStaffChatToBottom() {
  if (!selectors.staffChatMessages) return;
  const scroll = () => {
    selectors.staffChatMessages.scrollTop = selectors.staffChatMessages.scrollHeight;
  };
  requestAnimationFrame(() => {
    scroll();
    window.setTimeout(scroll, 40);
  });
}

function renderStaffChat({ scrollToBottom = false } = {}) {
  renderStaffChatColors();
  if (!selectors.staffChatMessages) return;

  if (!staffMessages.length) {
    selectors.staffChatMessages.innerHTML = `<p class="staff-chat-empty">${t("staffChat.empty")}</p>`;
  } else {
    selectors.staffChatMessages.innerHTML = staffMessages
      .map((item) => `
        <article class="staff-message" style="--staff-color: ${normalizeBookingColor(item.color) || staffMessagePalette[0]}">
          <div class="staff-message-meta">
            <strong><span></span>${escapeHtml(t("staffChat.message"))}</strong>
            <span>${escapeHtml(formatStaffMessageTime(item.createdAt))}</span>
          </div>
          <p>${escapeHtml(item.message)}</p>
        </article>
      `)
      .join("");
  }

  if (scrollToBottom) {
    scrollStaffChatToBottom();
  }
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
        <td colspan="6" class="empty-table">${t("table.empty")}</td>
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
        <tr class="clickable-record-row ${isHighlighted ? "journal-highlight" : ""}" data-stay-row="${stay.id}">
          <td>
            <strong>${stay.guestName}</strong>
            <span>${[stay.companyName, stay.notes || t("table.noNotes")].filter(Boolean).join(" · ")}</span>
          </td>
          <td>${room.id}<span>${roomTypeLabel(room.type)}</span></td>
          <td>${formatDate(stay.checkIn)} - ${formatDate(stay.checkOut)}</td>
          <td>${formatMoney(stay.total)}${Number(stay.discount || 0) > 0 ? `<span>${t("form.discount")}: ${formatMoney(stay.discount)}</span>` : ""}</td>
          <td>
            <span>${t("table.paid")}: ${formatMoney(getPaidAmount(stay))}</span>
            <span class="${debt > 0 ? "debt-text" : "paid-text"}">${t("table.debt")}: ${formatMoney(debt)}</span>
          </td>
          <td><span class="status-pill ${getStatusClass(status)}">${getStatusLabel(status)}</span></td>
        </tr>
      `;
    })
    .join("");
}

function paymentLabel(key) {
  return t(`form.${key}`).replace(/,\s*₾/g, "");
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
  const discount = Number(stay.discount || 0);
  const payments = getPaymentBreakdown(stay)
    .map(([label, amount]) => '<div class="detail-payment-row"><span>' + label + '</span><strong>' + formatMoney(amount) + '</strong></div>')
    .join("");

  selectors.bookingDetailsPanel.innerHTML = [
    '<article class="booking-detail-card">',
    '  <button type="button" class="detail-close" data-detail-close aria-label="' + t("calendar.closeDetails") + '">×</button>',
    '  <div class="booking-detail-color" style="background: ' + (stay.color || defaultBookingColor) + '"></div>',
    '  <h4>' + stay.guestName + '</h4>',
    stay.companyName ? '  <p class="detail-company">' + stay.companyName + '</p>' : '',
    '  <div class="detail-meta"><span>' + t("calendar.room") + ' ' + room.id + '</span><span>' + roomTypeLabel(room.type) + '</span><span>' + getStatusLabel(status) + '</span></div>',
    '  <div class="detail-dates"><strong>' + formatDate(stay.checkIn) + '</strong><span>' + t("calendar.to") + '</span><strong>' + formatDate(stay.checkOut) + '</strong></div>',
    '  <div class="detail-total"><span>' + t("calendar.total") + '</span><strong>' + formatMoney(stay.total) + '</strong></div>',
    discount > 0 ? '  <div class="detail-discount"><span>' + t("form.discount") + '</span><strong>-' + formatMoney(discount) + '</strong></div>' : '',
    '  <div class="detail-payments">' + payments + '</div>',
    debt > 0 ? '  <div class="detail-alert">' + t("calendar.outstandingDebt") + ': ' + formatMoney(debt) + '</div>' : '  <div class="detail-ok">' + t("calendar.paymentBalanced") + '</div>',
    stay.notes ? '  <p class="detail-notes">' + stay.notes + '</p>' : '',
    '  <div class="detail-actions">',
    '    <button type="button" class="primary-button" data-detail-edit="' + stay.id + '">' + t("table.edit") + '</button>',
    '    <button type="button" class="danger-button" data-detail-delete="' + stay.id + '">' + t("table.delete") + '</button>',
    '  </div>',
    '</article>',
  ].join("");
}

function shouldUseCalendarBuffer() {
  return true;
}

function getCalendarDayWidth() {
  const row = selectors.occupancyCalendar.querySelector(".calendar-row");
  if (!row) return 0;
  const label = row.querySelector(".calendar-room-label");
  const rowWidth = row.scrollWidth || row.getBoundingClientRect().width;
  const labelWidth = label?.getBoundingClientRect().width || 132;
  const daysCount = Number(selectors.occupancyCalendar.style.getPropertyValue("--calendar-days")) || calendarVisibleDays;
  return daysCount > 0 ? (rowWidth - labelWidth) / daysCount : 0;
}

function queueCalendarScrollLeft(scrollLeft) {
  pendingCalendarScrollLeft = scrollLeft;
}

function preserveCalendarScrollPosition() {
  if (!selectors.calendarScroll) return;
  queueCalendarScrollLeft(selectors.calendarScroll.scrollLeft);
}

function applyPendingCalendarScroll() {
  if (pendingCalendarScrollLeft === null || !selectors.calendarScroll) return;
  selectors.calendarScroll.scrollLeft = Math.max(0, pendingCalendarScrollLeft);
  pendingCalendarScrollLeft = null;
  updateCalendarRangeFromScroll();
}

function openCalendarStay(stayId) {
  preserveCalendarScrollPosition();
  selectedCalendarStayId = stayId;
  highlightedCalendarStayId = null;
  renderCalendar();
}

function updateCalendarRangeFromScroll() {
  if (!selectors.calendarScroll || !selectors.calendarRange) return;

  const scrollRect = selectors.calendarScroll.getBoundingClientRect();
  const roomLabel = selectors.occupancyCalendar.querySelector(".calendar-room-label");
  const roomLabelWidth = roomLabel?.getBoundingClientRect().width || 0;
  const visibleLeft = scrollRect.left + roomLabelWidth;
  const visibleRight = scrollRect.right;
  const visibleDays = Array.from(selectors.occupancyCalendar.querySelectorAll("[data-calendar-head-day]"))
    .filter((cell) => {
      const rect = cell.getBoundingClientRect();
      return rect.left >= visibleLeft - 1 && rect.right <= visibleRight + 1;
    })
    .map((cell) => cell.dataset.calendarHeadDay)
    .filter(Boolean);

  if (visibleDays.length === 0) return;

  selectors.calendarRange.textContent = `${formatDate(visibleDays[0])} - ${formatDate(visibleDays[visibleDays.length - 1])}`;
}

function renderCalendar() {
  const isReadOnlyCalendar = isPhoneCalendarReadOnly();
  const hasBuffer = shouldUseCalendarBuffer();
  const leadingDays = hasBuffer ? calendarBufferDays : 0;
  const dayCount = hasBuffer ? calendarVisibleDays + calendarBufferDays * 2 : calendarVisibleDays;
  const renderStart = addDays(calendarStart, -leadingDays);
  const days = Array.from({ length: dayCount }, (_, index) => addDays(renderStart, index));
  const visibleLastDay = addDays(calendarStart, calendarVisibleDays - 1);
  const today = todayDate();

  selectors.calendarRange.textContent = `${formatDate(calendarStart)} - ${formatDate(visibleLastDay)}`;
  selectors.occupancyCalendar.style.setProperty("--calendar-days", String(dayCount));

  const header = `
    <div class="calendar-row calendar-header-row">
      <div class="calendar-room-label calendar-head">${t("calendar.room")}</div>
      ${days
        .map(
          (day) => `
            <div class="calendar-cell calendar-head ${day.getTime() === today.getTime() ? "calendar-today" : ""}" data-calendar-head-day="${toInputDate(day)}">
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
            const checkOut =
              calendarResizeState?.stayId === item.id && calendarResizeState.previewCheckOut
                ? toDate(calendarResizeState.previewCheckOut)
                : toDate(item.checkOut);
            return day >= checkIn && day < checkOut;
          });

          if (!stay) {
            return `<div class="calendar-cell ${day.getTime() === today.getTime() ? "calendar-today" : ""}" data-calendar-day="${toInputDate(day)}" data-calendar-room="${room.id}"></div>`;
          }

          const status = getStayStatus(stay);
          const debtClass = getDebt(stay) > 0 ? "calendar-debt" : "";
          if (status === "cancelled") return `<div class="calendar-cell ${day.getTime() === today.getTime() ? "calendar-today" : ""}" data-calendar-day="${toInputDate(day)}" data-calendar-room="${room.id}"></div>`;
          const visibleCheckOut =
            calendarResizeState?.stayId === stay.id && calendarResizeState.previewCheckOut
              ? calendarResizeState.previewCheckOut
              : stay.checkOut;
          const previewEnd = toDate(visibleCheckOut);
          const inResizePreview =
            calendarResizeState?.stayId === stay.id && day >= toDate(stay.checkOut) && day < previewEnd;
          const isLastStayDay = isSameDate(day, addDays(previewEnd, -1));
          const resizeHandle =
            !isReadOnlyCalendar && selectedCalendarStayId === stay.id && canExtendCheckoutOnly(stay) && isLastStayDay
              ? '<span class="calendar-resize-handle" data-calendar-resize="' + stay.id + '" aria-hidden="true"></span>'
              : "";
          return `
            <button class="calendar-cell calendar-booked calendar-${status} ${debtClass} ${!isReadOnlyCalendar && inResizePreview ? "calendar-resize-preview" : ""} ${!isReadOnlyCalendar && selectedCalendarStayId === stay.id ? "calendar-selected" : ""} ${!isReadOnlyCalendar && highlightedCalendarStayId === stay.id ? "calendar-highlighted" : ""}" data-calendar-stay="${stay.id}" data-calendar-day="${toInputDate(day)}" data-calendar-room="${room.id}" style="--booking-color: ${stay.color || defaultBookingColor}" title="${stay.guestName}">
              <span>${stay.guestName.slice(0, 1)}</span>
              ${resizeHandle}
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
  if (pendingCalendarScrollLeft === null && calendarResizeState && selectors.calendarScroll) {
    const resizeScrollLeft = selectors.calendarScroll.scrollLeft;
    requestAnimationFrame(() => {
      selectors.calendarScroll.scrollLeft = resizeScrollLeft;
    });
  } else if (pendingCalendarScrollLeft === null && hasBuffer) {
    requestAnimationFrame(() => {
      const dayWidth = getCalendarDayWidth();
      selectors.calendarScroll.scrollLeft = dayWidth * calendarBufferDays;
      updateCalendarRangeFromScroll();
    });
  } else if (pendingCalendarScrollLeft === null) {
    requestAnimationFrame(() => {
      selectors.calendarScroll.scrollLeft = 0;
      updateCalendarRangeFromScroll();
    });
  } else {
    requestAnimationFrame(applyPendingCalendarScroll);
  }
  renderBookingDetails();
}

function getCalendarDateCellFromPoint(clientX, clientY, roomId) {
  const element = document.elementFromPoint(clientX, clientY);
  const cell = element?.closest?.("[data-calendar-day]");
  if (!cell) return null;
  if (roomId && cell.dataset.calendarRoom !== roomId) return null;
  return cell;
}

function getExtendedCheckoutFromCell(stay, cell) {
  if (!stay || !cell?.dataset.calendarDay) return "";
  const targetDay = toDate(cell.dataset.calendarDay);
  const nextCheckOut = addDays(targetDay, 1);
  const minCheckOut = new Date(Math.max(addDays(toDate(stay.checkIn), 1).getTime(), todayDate().getTime()));
  return toInputDate(nextCheckOut < minCheckOut ? minCheckOut : nextCheckOut);
}

function canPreviewCheckoutExtension(stay, nextCheckOut) {
  if (!stay || !nextCheckOut) return false;
  const minCheckOut = new Date(Math.max(addDays(toDate(stay.checkIn), 1).getTime(), todayDate().getTime()));
  if (toDate(nextCheckOut) < minCheckOut) return false;
  if (toDate(nextCheckOut) <= toDate(stay.checkOut)) return true;
  return !hasRoomConflictForRange(stay.id, stay.roomId, stay.checkIn, nextCheckOut);
}

function extendStayCheckout(stayId, nextCheckOut) {
  const stay = stays.find((item) => item.id === stayId);
  if (!stay || !nextCheckOut || toInputDate(toDate(nextCheckOut)) === stay.checkOut) return false;
  if (!canPreviewCheckoutExtension(stay, nextCheckOut)) {
    setFormMessage(t("common.roomConflict"), "error");
    return false;
  }

  const nightlyRate = getStayNightlyRate(stay);
  const nights = getNightCount(stay.checkIn, nextCheckOut);
  const total = Math.max(nightlyRate * nights - Number(stay.discount || 0), 0);
  const paid = getPaidAmount(stay);
  const debt = Math.max(Number(stay.debt || 0), total - paid, 0);

  stays = stays.map((item) =>
    item.id === stayId
      ? {
          ...item,
          checkOut: nextCheckOut,
          nights,
          total,
          debt,
          updatedAt: new Date().toISOString(),
        }
      : item
  );
  return true;
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

function canUseNightCheckInDate(day) {
  if (!selectors.nightCheckInToggle?.checked || editingStayId) return false;
  return isSameDate(day, addDays(todayDate(), -1));
}

function syncPendingDatesFromForm() {
  if (!selectors.stayForm) return;
  const existing = stays.find((stay) => stay.id === editingStayId);
  pendingCheckIn = isCheckoutOnlyDateEdit() && existing?.checkIn ? existing.checkIn : selectors.stayForm.checkIn.value;
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
  selectors.dateRangeField?.classList.toggle("editing-dates", Boolean(editingStayId));
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
  const checkoutOnlyEdit = isCheckoutOnlyDateEdit();

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
        const isNightCheckInDay = canUseNightCheckInDate(day);
        const isPastDay = day < today && !isNightCheckInDay;
        const hasConfirmedRange = Boolean(checkIn && checkOut);
        const hasHoverRange = Boolean(activeDateField === "checkOut" && checkIn && hoverDate && hoverDate > checkIn);
        const selectedStart = checkIn && isSameDate(day, checkIn);
        const isLockedCheckIn = checkoutOnlyEdit && selectedStart;
        const isBeforeCheckoutWindow = checkoutOnlyEdit && checkIn && (day < today || day <= checkIn);
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
        const isUnavailable = isBusy || isPastDay || rangeWouldConflict || isLockedCheckIn || isBeforeCheckoutWindow;
        const className = [
          "form-date-day",
          isSameDate(day, today) ? "today-day" : "",
          isNightCheckInDay ? "night-checkin-day" : "",
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
  renderColorPalette();
  renderStats();
  renderStaffChat({ scrollToBottom: currentSectionName === "staff-chat" });
  renderRoomMap();
  renderRoomGroups();
  renderActiveGuests();
  renderStaysTable();
  renderCalendar();
  requestAnimationFrame(syncOverviewPanelHeights);
}

function readFormStay() {
  const formData = new FormData(selectors.stayForm);
  const existing = stays.find((stay) => stay.id === editingStayId);
  const companyMode = String(formData.get("companyMode") || "existing");
  const selectedCompanyId = String(formData.get("companyId") || "");
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);
  const newCompanyName = normalizeCompanyName(formData.get("companyNewName"));
  const checkIn = isCheckoutOnlyDateEdit() && existing?.checkIn ? existing.checkIn : String(formData.get("checkIn"));
  const checkOut = String(formData.get("checkOut"));
  const nights = Number(formData.get("nights") || getNightCount(checkIn, checkOut));

  return {
    id: editingStayId || crypto.randomUUID(),
    guestName: String(formData.get("guestName")).trim(),
    companyId: companyMode === "existing" ? selectedCompany?.id : undefined,
    companyName: companyMode === "existing" ? normalizeCompanyName(selectedCompany?.name) : newCompanyName,
    roomId: String(formData.get("roomId")),
    checkIn,
    checkOut,
    nights,
    total: Number(formData.get("total") || 0),
    discount: Number(formData.get("discount") || 0),
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

  if (!["checked-out", "cancelled"].includes(getStayStatus(stay)) && getActiveBookingColors(stay.id).has(stay.color.toLowerCase())) {
    setFormMessage("Choose an available color.", "error");
    return;
  }

  if (!stay.checkIn || !stay.checkOut) {
    setFormMessage(t("common.selectBothDates"), "error");
    return;
  }

  if (toDate(stay.checkIn) < todayDate() && !canUseNightCheckInDate(toDate(stay.checkIn))) {
    setFormMessage(t("common.pastDate"), "error");
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

  const companyName = normalizeCompanyName(stay.companyName);
  if (companyName) {
    pendingCompanyColorUpdates.set(companyName.toLocaleLowerCase(), stay.color || defaultBookingColor);
  }

  if (editingStayId) {
    stays = stays.map((item) => (item.id === editingStayId ? stay : item));
    setFormMessage(t("common.recordUpdated"), "success");
  } else {
    stays = [stay, ...stays];
    setFormMessage(t("common.staySaved"), "success");
  }

  const saved = await saveStay(stay.id);
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
  checkoutOnlyEditStayId = canExtendCheckoutOnly(stay) ? id : null;
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
  if (selectors.nightCheckInToggle) selectors.nightCheckInToggle.checked = false;
  renderCustomDropdowns();
  selectors.stayForm.checkIn.value = stay.checkIn;
  selectors.stayForm.checkOut.value = stay.checkOut;
  formDateHover = null;
  activeDateField = "checkOut";
  isDatePickerOpen = false;
  formCalendarMonth = startOfMonth(checkoutOnlyEditStayId ? todayDate() : toDate(stay.checkIn));
  const stayNightCount = getNightCount(stay.checkIn, stay.checkOut);
  selectors.stayForm.nights.value = stay.nights ?? stayNightCount;
  setNightlyRateValue(stayNightCount > 0 ? Math.round((Number(stay.total || 0) + Number(stay.discount || 0)) / stayNightCount) : getRoomNightPrice(getRoom(stay.roomId)));
  nightlyRateWasEdited = true;
  selectors.stayForm.discount.value = stay.discount || 0;
  selectors.stayForm.total.value = stay.total;
  lastAutoTotalAmount = "";
  totalAmountWasEdited = true;
  selectors.stayForm.cash.value = stay.cash || 0;
  selectors.stayForm.card.value = stay.card || 0;
  selectors.stayForm.invoice.value = stay.invoice || 0;
  selectors.stayForm.debt.value = stay.debt || 0;
  selectors.stayForm.notes.value = stay.notes || "";
  selectors.stayForm.color.value = stay.color || defaultBookingColor;
  renderColorPalette();
  updateFormNumberStates();

  selectors.formTitle.textContent = t("form.editStay");
  selectors.formSubmitButton.textContent = t("form.saveChanges");
  selectors.cancelEditButton.classList.remove("hidden");
  setFormMessage(t("form.updateHint"), "success");
  showSection("edit-stay");
  renderFormDateCalendar();
}

function resetFormMode() {
  editingStayId = null;
  checkoutOnlyEditStayId = null;
  selectors.stayForm.reset();
  if (selectors.nightCheckInToggle) selectors.nightCheckInToggle.checked = false;
  selectors.stayForm.color.value = getNextAvailableBookingColor();
  renderColorPalette();
  updateFormNumberStates();
  lastAutoTotalAmount = "";
  totalAmountWasEdited = false;
  nightlyRateWasEdited = false;
  populateCompanyOptions();
  setCompanyMode("existing");
  selectors.formTitle.textContent = t("form.addStay");
  selectors.formSubmitButton.textContent = t("form.saveStay");
  selectors.cancelEditButton.classList.add("hidden");
  setFormMessage("", "");
  setDefaultDates();
  updateEstimatedTotal({ force: true, forceNightly: true });
  renderCustomDropdowns();
  renderFormDateCalendar();
}

function startNewStayForRoom(roomId) {
  if (!rooms.some((room) => room.id === roomId)) return;
  resetFormMode();
  selectors.stayForm.roomId.value = roomId;
  renderCustomDropdown("room");
  updateEstimatedTotal({ force: true, forceNightly: true });
  showSection("new-stay");
  renderFormDateCalendar();
}

function showStayInCalendar(stay) {
  if (!stay) return;
  selectedCalendarStayId = stay.id;
  highlightedCalendarStayId = null;
  showSection("calendar");
  renderCalendar();
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
  pendingBookingColor = null;
  calendarDragState = null;
  calendarResizeState = null;
  shouldSuppressCalendarClick = false;
  selectors.colorPicker?.classList.remove("is-open", "is-adding");
  selectors.colorPickerTrigger?.setAttribute("aria-expanded", "false");
  selectors.activeGuestList?.scrollTo({ top: 0 });
  selectors.calendarScroll?.scrollTo({ top: 0, left: 0 });
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
  updateDateRangeDisplay();
  updateEstimatedTotal();
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
  selectors.staffChatTrigger?.classList.toggle("active", sectionName === "staff-chat");
  selectors.staffChatTrigger?.setAttribute("aria-expanded", String(sectionName === "staff-chat"));
  selectors.sections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== sectionToId(sectionName));
  });

  const header = getPageHeader(sectionName);
  if (selectors.pageEyebrow) selectors.pageEyebrow.textContent = header.eyebrow;
  if (selectors.pageTitle) selectors.pageTitle.textContent = header.title;
  if (selectors.pageDescription) selectors.pageDescription.textContent = header.description;
  selectors.topbarActions?.classList.toggle("hidden", sectionName !== "dashboard");
  selectors.topbar?.classList.toggle("hidden", sectionName === "staff-chat");
  document.documentElement.classList.toggle("staff-chat-active", sectionName === "staff-chat");
  document.body.classList.toggle("staff-chat-active", sectionName === "staff-chat");
  document.documentElement.classList.toggle("calendar-active", sectionName === "calendar");
  document.body.classList.toggle("calendar-active", sectionName === "calendar");
  updateLanguageToggle();
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (sectionName === "dashboard") syncOverviewPanelHeights();
    if (sectionName === "staff-chat") scrollStaffChatToBottom();
  });
}

function sectionToId(sectionName) {
  return {
    dashboard: "dashboardSection",
    "new-stay": "newStaySection",
    "edit-stay": "editStaySection",
    stays: "staysSection",
    "staff-chat": "staffChatSection",
    calendar: "calendarSection",
    rooms: "roomsSection",
  }[sectionName];
}

function setStorageCardContent(title, text, showLogout) {
  selectors.storageModeTitles.forEach((node) => {
    node.textContent = title;
  });
  selectors.storageModeTexts.forEach((node) => {
    node.textContent = text;
  });
  selectors.logoutButtons.forEach((button) => {
    button.classList.toggle("hidden", !showLogout);
  });
}

function setSettingsOpen(isOpen) {
  selectors.settingsOverlay?.classList.toggle("is-open", isOpen);
  selectors.settingsOverlay?.setAttribute("aria-hidden", String(!isOpen));
  selectors.settingsTrigger?.setAttribute("aria-expanded", String(isOpen));
  selectors.settingsTriggers.forEach((button) => {
    button.setAttribute("aria-expanded", String(isOpen));
  });
  if (isOpen) populateHotelSettingsForm();
  document.body.classList.toggle("settings-open", isOpen);
}

async function signOut() {
  setSettingsOpen(false);
  selectors.appShell?.classList.add("app-loading");
  if (usesSupabase) await supabaseClient.auth.signOut();
  stays = [];
  staffMessages = [];
  resetFormMode();
  renderAll();
  await requireSession();
}

async function requireSession() {
  if (!usesSupabase) {
    selectors.authScreen?.classList.add("hidden");
    selectors.appShell?.classList.remove("hidden");
    setStorageCardContent(t("storage.localTitle"), t("storage.localText"), false);
    return true;
  }

  const { data } = await supabaseClient.auth.getSession();
  const session = data?.session;

  if (session) {
    selectors.authScreen?.classList.add("hidden");
    selectors.appShell?.classList.remove("hidden");
    setStorageCardContent(t("storage.cloudTitle"), t("storage.cloudText"), true);
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
  const setMobileMenuOpen = (isOpen) => {
    selectors.sidebar?.classList.toggle("mobile-menu-open", isOpen);
    selectors.mobileMenuToggle?.setAttribute("aria-expanded", String(isOpen));
    document.documentElement.classList.toggle("mobile-menu-lock", isOpen);
    document.body.classList.toggle("mobile-menu-lock", isOpen);
  };

  selectors.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navigateToSection(item.dataset.section);
      setMobileMenuOpen(false);
    });
  });

  selectors.homeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      navigateToSection("dashboard");
      setMobileMenuOpen(false);
    });
  });

  selectors.mobileMenuToggle?.addEventListener("click", () => {
    setMobileMenuOpen(!selectors.sidebar?.classList.contains("mobile-menu-open"));
  });

  selectors.mobileMenuBackdrop?.addEventListener("click", () => setMobileMenuOpen(false));

  selectors.settingsTriggers.forEach((button) => {
    button.addEventListener("click", () => {
      setMobileMenuOpen(false);
      setSettingsOpen(true);
    });
  });
  selectors.settingsCloseButtons.forEach((button) => button.addEventListener("click", () => setSettingsOpen(false)));
  selectors.settingsLanguageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.settingsLanguage));
  });
  selectors.hotelSettingsForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = selectors.hotelSettingsForm.querySelector("button[type='submit']");
    const nextSettings = readHotelSettingsForm();
    submitButton.disabled = true;
    submitButton.textContent = t("settings.saving");
    setHotelSettingsMessage(t("settings.saving"), "");
    const saved = await saveHotelSettings(nextSettings);
    submitButton.disabled = false;
    submitButton.textContent = t("settings.save");
    if (saved) populateHotelSettingsForm();
    setHotelSettingsMessage(saved ? t("settings.saved") : t("settings.saveError"), saved ? "success" : "error");
  });
  selectors.settingsSignOut?.addEventListener("click", signOut);
  selectors.staffChatTrigger?.addEventListener("click", () => {
    navigateToSection("staff-chat");
    setMobileMenuOpen(false);
    requestAnimationFrame(() => selectors.staffChatInput?.focus());
  });
  selectors.staffChatColors?.addEventListener("click", (event) => {
    const colorButton = event.target.closest("[data-staff-color]");
    const color = normalizeBookingColor(colorButton?.dataset.staffColor);
    if (!color) return;
    selectedStaffColor = color;
    try {
      localStorage.setItem(staffColorStorageKey, selectedStaffColor);
    } catch {
      // Ignore blocked storage.
    }
    renderStaffChatColors();
  });
  selectors.staffChatForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = String(selectors.staffChatInput?.value || "").trim();
    if (!message) return;
    const saved = await saveStaffMessage(selectedStaffColor, message);
    if (!saved) return;
    selectors.staffChatInput.value = "";
    renderStaffChat({ scrollToBottom: true });
  });
  selectors.dashboardCalendarAction?.addEventListener("click", () => navigateToSection("calendar"));
  selectors.dashboardNewStayAction?.addEventListener("click", () => navigateToSection("new-stay"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selectors.settingsOverlay?.classList.contains("is-open")) setSettingsOpen(false);
    if (event.key === "Escape") closeCustomDropdowns();
  });

  selectors.languageToggles?.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      setLanguage(currentLanguage === "ka" ? "en" : "ka");
    });
  });

  selectors.stayForm.addEventListener("submit", handleFormSubmit);

  selectors.companyModeInputs?.forEach((input) => {
    input.addEventListener("change", () => {
      setCompanyMode(input.value);
      if (input.value === "existing" && input.checked) applySelectedCompanyColor();
    });
  });

  selectors.companySelect?.addEventListener("change", applySelectedCompanyColor);

  document.addEventListener("click", (event) => {
    const dropdown = event.target.closest(".align-dropdown");
    const option = event.target.closest("[data-dropdown-value]");
    const trigger = event.target.closest("[data-dropdown-trigger]");

    if (option && dropdown?.dataset.dropdown) {
      setCustomDropdownValue(dropdown.dataset.dropdown, option.dataset.dropdownValue || "");
      return;
    }

    if (trigger && dropdown?.dataset.dropdown) {
      openCustomDropdown = openCustomDropdown === dropdown.dataset.dropdown ? null : dropdown.dataset.dropdown;
      renderCustomDropdowns();
      return;
    }

    if (!dropdown) closeCustomDropdowns();
  });

  selectors.colorPicker?.addEventListener("click", (event) => {
    const swatch = event.target.closest("[data-booking-color]");
    if (!swatch || swatch.disabled || !selectors.stayForm?.color) return;
    const color = normalizeBookingColor(swatch.dataset.bookingColor);
    const isCurrentDraft = color && color === (normalizeBookingColor(pendingBookingColor) || normalizeBookingColor(selectors.stayForm.color.value));
    if (!isCompanyColorEditMode() && color && getActiveBookingColors().has(color) && !isCurrentDraft) return;
    event.preventDefault();
    event.stopPropagation();
    pendingBookingColor = color;
    renderColorPalette({ keepOpen: true, keepAdding: selectors.colorPicker?.classList.contains("is-adding") });
  });

  selectors.colorPickerTrigger?.addEventListener("click", () => {
    const isOpen = !selectors.colorPicker?.classList.contains("is-open");
    if (isOpen && isCompanyColorEditMode()) {
      customColorTone = getHueFromColor(selectors.stayForm?.color.value);
    }
    pendingBookingColor = isOpen ? selectors.stayForm?.color.value : null;
    renderColorPalette({ keepOpen: isOpen });
  });

  selectors.colorAddSwatch?.addEventListener("click", () => {
    selectors.colorPicker?.classList.add("is-adding");
    selectors.colorToneRange?.focus();
  });

  selectors.colorToneRange?.addEventListener("input", () => {
    customColorTone = Number(selectors.colorToneRange.value);
    if (isCompanyColorEditMode()) {
      pendingBookingColor = getCustomToneColor();
    }
    selectors.colorPicker?.style.setProperty("--custom-color", getCustomToneColor());
  });

  selectors.colorConfirmSwatch?.addEventListener("click", async () => {
    const color = normalizeBookingColor(getCustomToneColor());
    if (isCompanyColorEditMode()) {
      pendingBookingColor = color;
      renderColorPalette({ keepOpen: true });
      return;
    }
    if (!color || getActiveBookingColors().has(color)) return;
    const saved = await saveCustomBookingColor(color);
    if (!saved) return;
    pendingBookingColor = color;
    renderColorPalette({ keepOpen: true });
  });

  selectors.colorRemoveSwatch?.addEventListener("click", async () => {
    const color = normalizeBookingColor(pendingBookingColor);
    if (!color || getActiveBookingColors().has(color) || !(await removeCustomBookingColor(color))) return;
    pendingBookingColor = selectors.stayForm?.color.value || defaultBookingColor;
    renderColorPalette({ keepOpen: true, keepAdding: selectors.colorPicker?.classList.contains("is-adding") });
  });

  selectors.colorApplyButton?.addEventListener("click", () => {
    const color = normalizeBookingColor(pendingBookingColor);
    if (!color || getActiveBookingColors().has(color) || !selectors.stayForm?.color) return;
    selectors.stayForm.color.value = color;
    renderColorPalette();
  });

  document.addEventListener("click", (event) => {
    if (selectors.colorPicker && !selectors.colorPicker.contains(event.target)) {
      selectors.colorPicker.classList.remove("is-open");
      selectors.colorPickerTrigger?.setAttribute("aria-expanded", "false");
    }
  });

  selectors.stayForm.roomId.addEventListener("change", () => {
    if (!editingStayId) {
      nightlyRateWasEdited = false;
      resetFormDates();
    } else {
      isDatePickerOpen = false;
      formDateHover = null;
      activeDateField = selectors.stayForm.checkOut.value ? "checkIn" : "checkOut";
      const anchorDate = selectors.stayForm.checkIn.value ? toDate(selectors.stayForm.checkIn.value) : todayDate();
      formCalendarMonth = startOfMonth(anchorDate);
    }
    updateEstimatedTotal({ forceNightly: !editingStayId });
    renderFormDateCalendar();
  });

  selectors.nightCheckInToggle?.addEventListener("change", () => {
    if (!selectors.nightCheckInToggle.checked && pendingCheckIn && toDate(pendingCheckIn) < todayDate()) {
      pendingCheckIn = "";
      pendingCheckOut = "";
      selectors.stayForm.checkIn.value = "";
      selectors.stayForm.checkOut.value = "";
      activeDateField = "checkIn";
      updateEstimatedTotal({ force: true });
    }
    renderFormDateCalendar();
  });

  selectors.stayForm.nightlyRate.addEventListener("input", () => {
    if (isUpdatingNightlyRate) return;
    updateEmptyNumberState(selectors.stayForm.nightlyRate);
    nightlyRateWasEdited = true;
    updateEstimatedTotal({ force: true });
  });

  selectors.stayForm.discount.addEventListener("input", () => {
    updateEmptyNumberState(selectors.stayForm.discount);
    updateEstimatedTotal({ force: true });
  });

  selectors.stayForm.total.addEventListener("input", () => {
    if (isUpdatingTotalAmount) return;
    updateEmptyNumberState(selectors.stayForm.total);
    totalAmountWasEdited = String(selectors.stayForm.total.value || "") !== lastAutoTotalAmount;
  });

  ["nightlyRate", "discount", "total", "cash", "card", "invoice", "debt"].forEach((fieldName) => {
    const input = selectors.stayForm[fieldName];
    input?.addEventListener("focus", () => {
      if (input.value === "0") input.select();
    });
    input?.addEventListener("input", () => updateEmptyNumberState(input));
    input?.addEventListener("blur", () => {
      if (input.value !== "") return;
      input.value = "0";
      updateEmptyNumberState(input);
      if (fieldName === "nightlyRate") {
        nightlyRateWasEdited = true;
        updateEstimatedTotal({ force: true });
      } else if (fieldName === "discount") {
        updateEstimatedTotal({ force: true });
      } else if (fieldName === "total") {
        totalAmountWasEdited = String(input.value || "") !== lastAutoTotalAmount;
      }
    });
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

    if (isCheckoutOnlyDateEdit() && pendingCheckIn && pendingCheckOut) {
      activeDateField = "checkOut";
      formCalendarMonth = startOfMonth(todayDate());
    } else if (editingStayId && pendingCheckIn && pendingCheckOut) {
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
    if (editingStayId) return;
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
      const existing = stays.find((stay) => stay.id === editingStayId);
      selectors.stayForm.checkIn.value = isCheckoutOnlyDateEdit() && existing?.checkIn ? existing.checkIn : pendingCheckIn;
      selectors.stayForm.checkOut.value = pendingCheckOut;
      updateEstimatedTotal({ force: isCheckoutOnlyDateEdit() });
      activeDateField = isCheckoutOnlyDateEdit() ? "checkOut" : "checkIn";
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

    if (isCheckoutOnlyDateEdit()) {
      if (!currentCheckIn || pickedDate <= toDate(currentCheckIn) || pickedDate < todayDate()) return;

      pendingCheckOut = value;
      activeDateField = "checkOut";
      isDatePickerOpen = true;
      renderFormDateCalendar();
      return;
    }

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
    const row = event.target.closest("[data-stay-row]");
    if (!row) return;
    startEditStay(row.dataset.stayRow);
  });

  selectors.occupancyCalendar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-calendar-stay]");

    if (shouldSuppressCalendarClick) {
      event.preventDefault();
      event.stopPropagation();
      shouldSuppressCalendarClick = false;
      return;
    }

    if (!button) return;
    if (isPhoneCalendarReadOnly()) return;
    openCalendarStay(button.dataset.calendarStay);
  });

  selectors.occupancyCalendar.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (isPhoneCalendarReadOnly()) return;
    const handle = event.target.closest("[data-calendar-resize]");
    if (!handle) return;
    const stay = stays.find((item) => item.id === handle.dataset.calendarResize);
    if (!stay || !canExtendCheckoutOnly(stay)) return;

    event.preventDefault();
    event.stopPropagation();
    calendarResizeState = {
      pointerId: event.pointerId,
      stayId: stay.id,
      roomId: stay.roomId,
      originalCheckOut: stay.checkOut,
      previewCheckOut: stay.checkOut,
      didDrag: false,
    };
    shouldSuppressCalendarClick = true;
    selectors.calendarScroll.classList.add("resizing-booking");
    selectors.occupancyCalendar.setPointerCapture?.(event.pointerId);
  });

  selectors.calendarScroll.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("[data-calendar-resize]")) return;
    const calendarCell = event.target.closest(".calendar-cell");
    if (!calendarCell) return;

    const dayWidth = getCalendarDayWidth();
    calendarDragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: selectors.calendarScroll.scrollLeft,
      dayWidth,
      didDrag: false,
    };
    selectors.calendarScroll.classList.add("dragging");
    selectors.calendarScroll.setPointerCapture?.(event.pointerId);
  });

  const extendCalendarDragRange = () => {
    if (!calendarDragState || !shouldUseCalendarBuffer()) return;
    const dayWidth = calendarDragState.dayWidth || getCalendarDayWidth();
    if (!dayWidth) return;

    const scroll = selectors.calendarScroll;
    const edgeSize = dayWidth * 4;
    const shiftSize = dayWidth * calendarVisibleDays;
    const maxScrollLeft = scroll.scrollWidth - scroll.clientWidth;

    if (scroll.scrollLeft < edgeSize) {
      calendarStart = addDays(calendarStart, -calendarVisibleDays);
      calendarDragState.startScrollLeft += shiftSize;
      queueCalendarScrollLeft(scroll.scrollLeft + shiftSize);
      renderCalendar();
      selectors.calendarScroll.classList.add("dragging");
      return;
    }

    if (scroll.scrollLeft > maxScrollLeft - edgeSize) {
      calendarStart = addDays(calendarStart, calendarVisibleDays);
      calendarDragState.startScrollLeft -= shiftSize;
      queueCalendarScrollLeft(scroll.scrollLeft - shiftSize);
      renderCalendar();
      selectors.calendarScroll.classList.add("dragging");
    }
  };

  selectors.calendarScroll.addEventListener("pointermove", (event) => {
    if (!calendarDragState || calendarDragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - calendarDragState.startX;
    if (Math.abs(deltaX) > 8) calendarDragState.didDrag = true;
    selectors.calendarScroll.scrollLeft = calendarDragState.startScrollLeft - deltaX;
    updateCalendarRangeFromScroll();
    extendCalendarDragRange();
    if (calendarDragState.didDrag) event.preventDefault();
  });

  selectors.calendarScroll.addEventListener("scroll", updateCalendarRangeFromScroll);

  selectors.occupancyCalendar.addEventListener("pointermove", (event) => {
    if (!calendarResizeState || calendarResizeState.pointerId !== event.pointerId) return;
    const stay = stays.find((item) => item.id === calendarResizeState.stayId);
    if (!stay) return;

    const cell = getCalendarDateCellFromPoint(event.clientX, event.clientY, calendarResizeState.roomId);
    if (!cell) return;

    const nextCheckOut = getExtendedCheckoutFromCell(
      { ...stay, checkOut: calendarResizeState.originalCheckOut },
      cell
    );
    if (!nextCheckOut || !canPreviewCheckoutExtension({ ...stay, checkOut: calendarResizeState.originalCheckOut }, nextCheckOut)) return;

    if (nextCheckOut !== calendarResizeState.previewCheckOut) {
      queueCalendarScrollLeft(selectors.calendarScroll.scrollLeft);
      calendarResizeState.previewCheckOut = nextCheckOut;
      calendarResizeState.didDrag = true;
      selectedCalendarStayId = stay.id;
      renderCalendar();
      selectors.calendarScroll.classList.add("resizing-booking");
    }
    event.preventDefault();
  });

  const finishCalendarDrag = (event) => {
    if (!calendarDragState || calendarDragState.pointerId !== event.pointerId) return;
    const didDrag = calendarDragState.didDrag;
    const releasedElement = document.elementFromPoint(event.clientX, event.clientY);
    const releasedStayButton = releasedElement?.closest?.("[data-calendar-stay]");
    shouldSuppressCalendarClick = calendarDragState.didDrag;
    selectors.calendarScroll.classList.remove("dragging");
    selectors.calendarScroll.releasePointerCapture?.(event.pointerId);
    calendarDragState = null;
    if (!didDrag && releasedStayButton && !isPhoneCalendarReadOnly()) {
      shouldSuppressCalendarClick = true;
      openCalendarStay(releasedStayButton.dataset.calendarStay);
    }
    window.setTimeout(() => {
      shouldSuppressCalendarClick = false;
    }, 250);
  };

  selectors.calendarScroll.addEventListener("pointerup", finishCalendarDrag);
  selectors.calendarScroll.addEventListener("pointercancel", finishCalendarDrag);
  selectors.calendarScroll.addEventListener("lostpointercapture", finishCalendarDrag);

  const finishCalendarResize = (event) => {
    if (!calendarResizeState || calendarResizeState.pointerId !== event.pointerId) return;
    const resizeState = calendarResizeState;
    calendarResizeState = null;
    selectors.calendarScroll.classList.remove("resizing-booking");
    selectors.occupancyCalendar.releasePointerCapture?.(event.pointerId);

    const didExtend = extendStayCheckout(resizeState.stayId, resizeState.previewCheckOut);
    selectedCalendarStayId = resizeState.stayId;
    shouldSuppressCalendarClick = true;
    renderAll();

    if (!didExtend) {
      requestAnimationFrame(() => {
        shouldSuppressCalendarClick = false;
      });
      return;
    }

    saveStay(resizeState.stayId).then((saved) => {
      if (!saved) console.error("Calendar resize was not saved.");
      refreshStays();
      shouldSuppressCalendarClick = false;
    });
  };

  selectors.occupancyCalendar.addEventListener("pointerup", finishCalendarResize);
  selectors.occupancyCalendar.addEventListener("pointercancel", finishCalendarResize);
  selectors.occupancyCalendar.addEventListener("lostpointercapture", finishCalendarResize);

  selectors.bookingDetailsPanel.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-detail-edit]");
    const deleteButton = event.target.closest("[data-detail-delete]");
    const closeButton = event.target.closest("[data-detail-close]");

    if (closeButton) {
      preserveCalendarScrollPosition();
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
    const deletedStayId = deleteButton.dataset.detailDelete;
    stays = stays.filter((stay) => stay.id !== deletedStayId);
    selectedCalendarStayId = null;
    if (highlightedCalendarStayId === deletedStayId) highlightedCalendarStayId = null;
    deleteStay(deletedStayId).then((saved) => {
      if (!saved) console.error("Delete was not saved.");
      refreshStays();
    });
  });

  selectors.roomMap.addEventListener("click", (event) => {
    const occupiedRoomButton = event.target.closest("[data-room-stay]");
    if (occupiedRoomButton) {
      const stay = stays.find((item) => item.id === occupiedRoomButton.dataset.roomStay);
      if (!stay) return;
      showStayInCalendar(stay);
      return;
    }

    const freeRoomButton = event.target.closest("[data-room-id]");
    if (!freeRoomButton) return;
    startNewStayForRoom(freeRoomButton.dataset.roomId);
  });

  selectors.addRoomButton?.addEventListener("click", () => openRoomEditor());

  selectors.roomEditorCancel?.addEventListener("click", closeRoomEditor);

  selectors.roomEditorForm?.roomType?.addEventListener("change", () => {
    if (editingRoomId) return;
    selectors.roomEditorForm.nightlyPrice.value = String(getRoomNightPrice(selectors.roomEditorForm.roomType.value));
  });

  selectors.roomEditorForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await saveRoomInventoryItem(readRoomEditorForm(), editingRoomId);
    if (!result.ok) {
      setRoomEditorMessage(result.message || t("roomInventory.saveError"), "error");
      return;
    }

    populateRoomSelect();
    updateEstimatedTotal({ forceNightly: !nightlyRateWasEdited });
    renderAll();
    setRoomEditorMessage(t("roomInventory.saved"), "success");
    closeRoomEditor();
  });

  selectors.roomEditorHide?.addEventListener("click", async () => {
    if (!editingRoomId) return;
    if (!window.confirm(t("roomInventory.confirmHide"))) return;

    const result = await hideRoomInventoryItem(editingRoomId);
    if (!result.ok) {
      setRoomEditorMessage(result.message || t("roomInventory.hideError"), "error");
      return;
    }

    populateRoomSelect();
    renderAll();
    closeRoomEditor();
  });

  selectors.roomGroups?.addEventListener("click", async (event) => {
    const roomButton = event.target.closest("[data-edit-room]");
    if (roomButton) {
      const room = rooms.find((item) => item.id === roomButton.dataset.editRoom);
      if (room) openRoomEditor(room);
      return;
    }

    const editButton = event.target.closest("[data-edit-room-price]");
    if (!editButton) return;

    const type = editButton.dataset.editRoomPrice;
    const currentPrice = getRoomNightPrice(type);
    const value = prompt(`${roomTypeLabel(type)} ${t("roomInventory.nightlyPrice")}, ${getCurrencySymbol()}`, String(currentPrice));
    if (value === null) return;

    const nextPrice = Number(value);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) return;

    const saved = await saveRoomTypePrice(type, nextPrice);
    if (!saved) return;

    populateRoomSelect();
    updateEstimatedTotal({ forceNightly: !nightlyRateWasEdited });
    renderRoomGroups();
  });

  selectors.activeGuestList.addEventListener("click", async (event) => {
    const favoriteButton = event.target.closest("[data-toggle-favorite]");
    if (favoriteButton) {
      event.stopPropagation();
      const previousPositions = new Map(
        [...selectors.activeGuestList.querySelectorAll("[data-active-stay]")].map((card) => [
          card.dataset.activeStay,
          card.getBoundingClientRect(),
        ]),
      );
      const updated = await toggleFavoriteGuest(favoriteButton.dataset.toggleFavorite);
      if (!updated) return;
      renderActiveGuests();
      animateActiveGuestReorder(previousPositions);
      selectors.activeGuestList.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const guestButton = event.target.closest("[data-active-stay]");
    if (!guestButton) return;
    startEditStay(guestButton.dataset.activeStay);
  });

  selectors.activeGuestList.addEventListener("keydown", (event) => {
    if (event.target.closest("[data-toggle-favorite]") || !["Enter", " "].includes(event.key)) return;
    const guestCard = event.target.closest("[data-active-stay]");
    if (!guestCard) return;
    event.preventDefault();
    startEditStay(guestCard.dataset.activeStay);
  });

  window.addEventListener("resize", () => {
    syncOverviewPanelHeights();
    updateCalendarRangeFromScroll();
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
    calendarStart = getDefaultCalendarStart();
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

  selectors.logoutButtons.forEach((button) => {
    button.addEventListener("click", signOut);
  });
}

async function startApp() {
  const canStart = await requireSession();
  if (!canStart) {
    selectors.appShell?.classList.remove("app-loading");
    return;
  }

  hotelSettings = await loadHotelSettings();
  if (!hasStoredLanguage()) {
    currentLanguage = hotelSettings.defaultLanguage;
    applyStaticTranslations();
  } else {
    applyHotelSettings();
  }

  rooms = await loadRooms();
  companies = usesSupabase ? await loadCompanies() : [];
  stays = await loadStays();
  staffMessages = await loadStaffMessages();
  await loadCustomBookingColors();
  await migrateLegacyFavoriteGuests();
  if (!usesSupabase) companies = await loadCompanies();
  populateRoomSelect();
  populateCompanyOptions();
  setDefaultDates();

  const targetSection = didJustSignIn ? "dashboard" : getStoredSection();
  didJustSignIn = false;
  showSection(targetSection);
  renderAll();
  selectors.appShell?.classList.remove("app-loading");
}

async function init() {
  applyStaticTranslations();
  populateRoomSelect();
  setDefaultDates();
  bindEvents();
  await startApp();
}

init();
