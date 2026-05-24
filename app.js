/* ============================================
   PRIYOSHOP APP PROTOTYPE — APP LOGIC
   SPA Router, Carousel, Drawer, Cart, Animations
   ============================================ */

(function () {
  'use strict';

  // ── State ──
  const state = {
    currentScreen: 'home',
    previousScreen: null,
    drawerOpen: false,
    bottomSheetOpen: false,
    cartItems: [
      { id: 1, name: 'আকিজ এসেনশিয়াল মিনিকেট চাল ২৫ কেজি', nameEn: 'Akij Essential Miniket Rice 25 kg', weight: '25 kg', price: 1800, qty: 1, image: './images/rice_akij.png' },
      { id: 2, name: 'আকিজ এসেন্সিয়াল মিনিকেট চাল- ৫০ কেজি', nameEn: 'Akij Essential Miniket Rice - 50 KG', weight: '50 kg', price: 3985, qty: 1, image: './images/rice_akij_50.png' },
      { id: 3, name: 'চিনি (ফ্রেশ/তীর/ইগলু) - ৫০ কেজি', nameEn: 'Sugar (Fresh/Teer/Igloo) - 50 KG', weight: '50 kg', price: 5050, qty: 6, image: './images/sugar_bag.png' },
      { id: 4, name: 'ঈশান মিনিকেট চাল ৫০ কেজি', nameEn: 'Eshan Miniket Rice - 50 KG', weight: '50 kg', price: 3890, qty: 1, image: './images/rice_amin.png' }
    ],
    carouselIndex: 0,
    carouselTimer: null,
    onboardingStep: 0,
    screenHistory: [],
    // App-wide editable-order window (persisted), shared across all screens.
    editableOrder: { active: false, expiresAt: 0, status: 'editable' },
    editableTicker: null,
    deliveryNote: '',
    // Reconciled lines built from lastOrder when retailer taps 1-Tap Reorder.
    reorderItems: [],
    // Voice ordering (Idea 1).
    voice: { permission: false, items: [], transcript: '' },
    // Simple Mode (Idea 9).
    simpleMode: false,
    // Spin-the-Wheel reward (Idea 4).
    spin: { orders: 0, available: 0, justUnlocked: false, rotation: 0, spinning: false, lastPrize: null },
    // Local Bazaar Community (Idea 3).
    bazaar: { joined: false, challenges: {} },
    // Digital Bhai support chat (Idea 2).
    bhai: { messages: [], seeded: false },
    // App-exclusive reward system (Idea 8).
    rewards: {
      points: 2340,
      lifetime: 2340,
      earnedThisOrder: 0,
      tierJustUpgraded: null,
      voucher: null,
      history: [
        { label: 'অর্ডার #26056305', points: 142, date: '১৫-মে-২০২৬' },
        { label: 'অর্ডার #25981120', points: 98, date: '০৮-মে-২০২৬' },
        { label: 'রেফারেল বোনাস', points: 50, date: '০২-মে-২০২৬' }
      ]
    }
  };

  // Modify-after-order window length (faithful 30 min). Use "demo: lock now" link to skip.
  const MODIFY_WINDOW_SECONDS = 1800;

  // ── Reward system (Idea 8) ──
  const POINTS_PER_TAKA = 100; // 1 point per ৳100 of in-app order value
  const TIERS = [
    { name: 'Silver',   bn: 'সিলভার',   min: 0,     benefit: '১% ক্যাশব্যাক' },
    { name: 'Gold',     bn: 'গোল্ড',     min: 4000,  benefit: '২% ক্যাশব্যাক + ফ্রি ডেলিভারি' },
    { name: 'Platinum', bn: 'প্ল্যাটিনাম', min: 10000, benefit: '৩% ক্যাশব্যাক + অগ্রাধিকার সাপোর্ট' }
  ];

  // ── Spin-the-Wheel (Idea 4) — ops-configurable ──
  const SPIN_MILESTONE = 5;            // successful app orders per spin unlock
  const SPIN_THEME = 'default';        // 'default' | 'festival'
  // Guaranteed win (no lose state). weight = relative likelihood.
  const SPIN_PRIZES = [
    { type: 'cashback', value: 50,   label: '৳৫০ ক্যাশব্যাক',     color: '#E53935', weight: 3 },
    { type: 'points',   value: 100,  label: '১০০ পয়েন্ট',        color: '#43A047', weight: 3 },
    { type: 'cashback', value: 100,  label: '৳১০০ ক্যাশব্যাক',    color: '#FB8C00', weight: 2 },
    { type: 'points',   value: 500,  label: '৫০০ পয়েন্ট 🎉',     color: '#1E88E5', weight: 2 },
    { type: 'cashback', value: 250,  label: '৳২৫০ ক্যাশব্যাক',    color: '#8E24AA', weight: 1 },
    { type: 'cashback', value: 500,  label: '🎁 মেগা ৳৫০০',       color: '#00897B', weight: 1 }
  ];
  const SPIN_PRIZES_FESTIVAL = [
    { type: 'bonus',    value: 500,  label: 'ঈদ বোনাস ৫০০ পয়েন্ট', color: '#D81B60', weight: 2 },
    { type: 'cashback', value: 150,  label: '৳১৫০ ক্যাশব্যাক',     color: '#E53935', weight: 3 },
    { type: 'points',   value: 300,  label: '৩০০ পয়েন্ট',         color: '#43A047', weight: 3 },
    { type: 'cashback', value: 250,  label: 'ঈদি ৳২৫০ ক্যাশব্যাক', color: '#1E88E5', weight: 2 },
    { type: 'cashback', value: 300,  label: '৳৩০০ ক্যাশব্যাক',     color: '#FB8C00', weight: 1 },
    { type: 'bonus',    value: 1000, label: '🎁 মেগা ১০০০ পয়েন্ট', color: '#6D4C41', weight: 1 }
  ];
  function activePrizes() { return SPIN_THEME === 'festival' ? SPIN_PRIZES_FESTIVAL : SPIN_PRIZES; }

  // ── Local Bazaar Community (Idea 3) — mock community data ──
  const BAZAAR_GROUP = { name: 'ধানমন্ডি বাজার', members: 42, myShop: 'Shahi General Store', myRank: 7, weekChange: 3 };
  const BAZAAR_LEADERS = [
    { rank: 1, name: 'রহমান স্টোর', area: 'ঝিগাতলা', score: 9850 },
    { rank: 2, name: 'নিউ ভাই ভাই স্টোর', area: 'হাজারীবাগ', score: 9120 },
    { rank: 3, name: 'মায়ের দোয়া স্টোর', area: 'ধানমন্ডি ১৫', score: 8740 },
    { rank: 4, name: 'বিসমিল্লাহ ট্রেডার্স', area: 'রায়েরবাজার', score: 7980 },
    { rank: 5, name: 'ভরসা জেনারেল স্টোর', area: 'শংকর', score: 7310 },
    { rank: 6, name: 'আল-আমিন স্টোর', area: 'ধানমন্ডি ৭', score: 6620 },
    { rank: 7, name: 'Shahi General Store', area: 'ধানমন্ডি ১২', score: 6180, me: true },
    { rank: 8, name: 'সততা স্টোর', area: 'জিগাতলা', score: 5840 }
  ];
  const BAZAAR_BADGES = [
    { label: 'ধারাবাহিক ক্রেতা', icon: 'flame', earned: true },
    { label: 'টপ ডিজিটাল গ্রহণকারী', icon: 'smartphone', earned: true },
    { label: 'নিয়মিত অর্ডারকারী', icon: 'calendar-check', earned: true },
    { label: 'এলাকার চ্যাম্পিয়ন', icon: 'crown', earned: false },
    { label: 'মেগা ক্রেতা', icon: 'trophy', earned: false },
    { label: 'কমিউনিটি লিডার', icon: 'users', earned: false }
  ];
  const BAZAAR_CHALLENGES = [
    { id: 'c1', label: 'এই সপ্তাহে ৫টি অর্ডার করুন', goal: 5, color: '#E53935', tracksOrders: true },
    { id: 'c2', label: 'টানা ৩ দিন অ্যাপে অর্ডার করুন', goal: 3, base: 1, color: '#43A047' },
    { id: 'c3', label: '৩ জন প্রতিবেশী দোকানকে রেফার করুন', goal: 3, base: 0, color: '#8E24AA' }
  ];
  const BAZAAR_CAMPAIGNS = [
    { title: 'ধানমন্ডি বাজার ডিজিটাল ড্রাইভ', sub: 'অ্যাপে অর্ডার করে বাজারকে #১ বানান', icon: 'rocket' },
    { title: 'ঈদ স্পেশাল বাজার অফার', sub: 'এই সপ্তাহে চাল-তেলে বিশেষ ছাড়', icon: 'party-popper' },
    { title: 'নতুন দোকান স্বাগতম সপ্তাহ', sub: 'নতুন সদস্যদের জন্য বোনাস পয়েন্ট', icon: 'store' }
  ];

  // ── Digital Bhai (Idea 2) — a real agent persona ──
  const BHAI_AGENT = { name: 'করিম ভাই', initial: 'ক', role: 'প্রিয়শপ সহকারী', sla: 'সাধারণত ২ মিনিটে উত্তর' };
  const BHAI_QUICK = ['কীভাবে অর্ডার করব?', 'কার্ট এডিট করব কীভাবে?', 'চেকআউটে সাহায্য চাই', 'পেমেন্ট কীভাবে দেব?'];
  function bhaiReply(text) {
    const t = (text || '').toLowerCase();
    if (/অর্ডার|order|কিনব|কিনবো/.test(t))
      return "আচ্ছা ভাই, অর্ডার করা একদম সহজ — আমি বলে দিচ্ছি 🙂 প্রথমে হোম থেকে পণ্যটা খুঁজে '+' চাপুন, তারপর নিচের 'কার্ট'-এ গিয়ে 'চেকআউট' চাপলেই হবে। কোথাও আটকে গেলে আমাকে বলবেন, আমি আছি।";
    if (/কার্ট|cart|এডিট|পরিমাণ|বাদ|মুছ/.test(t))
      return "কোনো সমস্যা নেই ভাই। কার্টে প্রতিটা পণ্যের পাশে − আর + আছে, ওটা দিয়ে পরিমাণ কমান-বাড়ান। বাদ দিতে চাইলে পাশের ট্র্যাশ আইকনে চাপ দিন। টাকার হিসাব নিজে থেকেই ঠিক হয়ে যাবে।";
    if (/চেকআউট|checkout|পেমেন্ট|payment|টাকা|বিল/.test(t))
      return "ভয় পাবেন না ভাই 🙂 চেকআউটে ঠিকানা আর পেমেন্ট একবার দেখে নিয়ে লাল 'কনফার্ম অর্ডার' বাটনে চাপ দিন। ভুল হলেও চিন্তা নেই — ৩০ মিনিট পর্যন্ত বদলানো বা বাতিল করা যাবে।";
    if (/ভয়েস|voice|নোট/.test(t))
      return "জি ভাই, লিখতে অসুবিধা হলে নিচের মাইক বাটন চেপে কথা বলেই আমাকে পাঠাতে পারেন। আমি শুনে নেব।";
    if (/ধন্যবাদ|thanks|থ্যাংক|ঠিক আছে|আচ্ছা/.test(t))
      return "আরে ভাই, এটাই তো আমার কাজ! 🤝 আবার যেকোনো দরকারে এই বাটনে চাপ দিলেই আমি হাজির।";
    return "জি ভাই, বলুন তো — অর্ডার করা, কার্ট ঠিক করা, নাকি চেকআউট নিয়ে সাহায্য লাগবে? আমি ধাপে ধাপে দেখিয়ে দিচ্ছি, চিন্তা করবেন না।";
  }

  // ── Voice ordering (Idea 1) ──
  // Category keywords incl. dialect/colloquial + romanized variants.
  const VOICE_CATEGORY_KEYS = {
    oil:   ['তেল', 'সয়াবিন', 'tel', 'oil', 'soyabin'],
    sugar: ['চিনি', 'sugar', 'cini', 'chini'],
    rice:  ['চাল', 'মিনিকেট', 'rice', 'chal', 'chaul'],
    dal:   ['ডাল', 'dal', 'dail'],
    flour: ['আটা', 'ময়দা', 'ata', 'flour', 'moyda'],
    ajino: ['আজিনোমতো', 'ajinomoto', 'টেস্টিং সল্ট']
  };

  // brand keys narrow within a category; "মুসুর/মসুর" intentionally maps to 2 dals (low-confidence demo).
  const VOICE_CATALOG = [
    { id: 300, name: 'রূপচাঁদা সয়াবিন তেল ৫ লিটার', nameEn: 'Rupchanda Soybean Oil 5L', weight: '5 Liter', price: 800, image: './images/oil.png', cat: 'oil', brandKeys: ['রূপচাঁদা', 'rupchanda'] },
    { id: 301, name: 'তীর সয়াবিন তেল ৫ লিটার', nameEn: 'Teer Soybean Oil 5L', weight: '5 Liter', price: 790, image: './images/oil.png', cat: 'oil', brandKeys: ['তীর', 'teer'] },
    { id: 303, name: 'পুষ্টি সয়াবিন তেল ৫ লিটার', nameEn: 'Pusti Soybean Oil 5L', weight: '5 Liter', price: 780, image: './images/oil.png', cat: 'oil', brandKeys: ['পুষ্টি', 'pusti'] },
    { id: 100, name: 'ফ্রেশ চিনি ৫০ কেজি', nameEn: 'Fresh Sugar 50kg', weight: '50 kg', price: 5050, image: './images/sugar_fresh.png', cat: 'sugar', brandKeys: ['ফ্রেশ', 'fresh'] },
    { id: 101, name: 'তীর চিনি ৫০ কেজি', nameEn: 'Teer Sugar 50kg', weight: '50 kg', price: 5060, image: './images/sugar_teer.png', cat: 'sugar', brandKeys: ['তীর', 'teer'] },
    { id: 102, name: 'ইগলু চিনি ৫০ কেজি', nameEn: 'Igloo Sugar 50kg', weight: '50 kg', price: 5040, image: './images/sugar_igloo.png', cat: 'sugar', brandKeys: ['ইগলু', 'igloo'] },
    { id: 5,  name: 'আকিজ এসেনশিয়াল মিনিকেট চাল ২৫ কেজি', nameEn: 'Akij Miniket Rice 25kg', weight: '25 kg', price: 1800, image: './images/rice_akij.png', cat: 'rice', brandKeys: ['আকিজ', 'akij'] },
    { id: 7,  name: 'আমিন আটাশ চাল ২৫ কেজি', nameEn: 'Amin Athash Rice 25kg', weight: '25 kg', price: 1020, image: './images/rice_amin_25.png', cat: 'rice', brandKeys: ['আমিন', 'amin'] },
    { id: 11, name: 'নজরুল মিনিকেট চাল ২৫ কেজি', nameEn: 'Nazrul Miniket Rice 25kg', weight: '25 kg', price: 1500, image: './images/rice_nazrul.png', cat: 'rice', brandKeys: ['নজরুল', 'nazrul'] },
    { id: 200, name: 'দেশি মসুর ডাল ২৫ কেজি', nameEn: 'Local Masoor Dal 25kg', weight: '25 kg', price: 2500, image: './images/dal.png', cat: 'dal', brandKeys: ['দেশি', 'মসুর', 'মুসুর', 'desi', 'masoor'] },
    { id: 201, name: 'নেপালি মসুর ডাল ২৫ কেজি', nameEn: 'Nepali Masoor Dal 25kg', weight: '25 kg', price: 2800, image: './images/dal.png', cat: 'dal', brandKeys: ['নেপালি', 'মসুর', 'মুসুর', 'nepali', 'masoor'] },
    { id: 202, name: 'মুগ ডাল ২৫ কেজি', nameEn: 'Moong Dal 25kg', weight: '25 kg', price: 3000, image: './images/dal.png', cat: 'dal', brandKeys: ['মুগ', 'moong', 'mug'] },
    { id: 400, name: 'তীর আটা ৫০ কেজি', nameEn: 'Teer Ata 50kg', weight: '50 kg', price: 1800, image: './images/flour.png', cat: 'flour', brandKeys: ['তীর', 'teer'] },
    { id: 401, name: 'ফ্রেশ আটা ৫০ কেজি', nameEn: 'Fresh Ata 50kg', weight: '50 kg', price: 1790, image: './images/flour.png', cat: 'flour', brandKeys: ['ফ্রেশ', 'fresh'] },
    { id: 600, name: 'আজিনোমতো ১ কেজি', nameEn: 'Ajinomoto 1kg', weight: '1 kg', price: 250, image: './images/ajinomoto.png', imgFilter: '', cat: 'ajino', brandKeys: ['আজিনোমতো', 'ajinomoto', 'আজিনা', 'ajina'] },
    { id: 601, name: 'থাই আজিনোমতো ১ কেজি', nameEn: 'Thai Ajinomoto 1kg', weight: '1 kg', price: 280, image: './images/ajinomoto.png', imgFilter: 'hue-rotate(120deg)', cat: 'ajino', brandKeys: ['থাই', 'thai'] },
    { id: 602, name: 'চাইনিজ আজিনোমতো ১ কেজি', nameEn: 'Chinese Ajinomoto 1kg', weight: '1 kg', price: 200, image: './images/ajinomoto.png', imgFilter: 'hue-rotate(240deg)', cat: 'ajino', brandKeys: ['চাইনিজ', 'chinese'] },
    { id: 603, name: 'মেলা আজিনোমতো ১ কেজি', nameEn: 'Mela Ajinomoto 1kg', weight: '1 kg', price: 220, image: './images/ajinomoto.png', imgFilter: 'invert(0.1) saturate(2)', cat: 'ajino', brandKeys: ['মেলা', 'mela'] }
  ];

  // Bangla/English number words + Bangla digits → integer.
  const QTY_WORDS = {
    'এক': 1, '১': 1, 'one': 1, 'ek': 1,
    'দুই': 2, 'দুটা': 2, 'দুইটা': 2, 'দুদা': 2, 'দুটো': 2, '২': 2, 'two': 2, 'dui': 2,
    'তিন': 3, '৩': 3, 'three': 3, 'tin': 3,
    'চার': 4, '৪': 4, 'four': 4, 'char': 4,
    'পাঁচ': 5, 'পাচ': 5, '৫': 5, 'five': 5, 'pach': 5,
    'ছয়': 6, '৬': 6, 'six': 6,
    'সাত': 7, '৭': 7, 'আট': 8, '৮': 8, 'নয়': 9, '৯': 9, 'দশ': 10, '১০': 10
  };

  // ── 1-Tap Reorder: the retailer's previous order (their weekly pattern) ──
  // status flags drive the reconciliation screen:
  //   stock:false      → SKU now out of stock (offer alternative swap)
  //   oldPrice present → price changed since last order
  const LAST_ORDER = [
    { id: 101, name: 'আকিজ এসেনশিয়াল মিনিকেট চাল ২৫ কেজি', weight: '25 kg', price: 1800, qty: 4, image: './images/rice_akij.png', stock: true },
    { id: 102, name: 'চিনি (ফ্রেশ/তীর/ইগলু) ৫০ কেজি', weight: '50 kg', price: 5050, oldPrice: 4900, qty: 6, image: './images/sugar_bag.png', stock: true },
    { id: 103, name: 'সয়াবিন তেল ৫ লিটার', weight: '5 L', price: 850, qty: 5, image: './images/oil.png', stock: false,
      alt: { id: 113, name: 'রূপচাঁদা সয়াবিন তেল ৫ লিটার', weight: '5 L', price: 870, image: './images/oil.png' } },
    { id: 104, name: 'আমিন আটাশ চাল ২৫ কেজি', weight: '25 kg', price: 1020, qty: 3, image: './images/rice_amin_25.png', stock: true },
    { id: 105, name: 'আটা ২ কেজি', weight: '2 kg', price: 120, qty: 8, image: './images/flour.png', stock: false,
      alt: { id: 115, name: 'তীর আটা ২ কেজি', weight: '2 kg', price: 125, image: './images/flour.png' } },
    { id: 106, name: 'মুসুর ডাল ১ কেজি', weight: '1 kg', price: 140, qty: 6, image: './images/dal.png', stock: true }
  ];

  // ── DOM Ready ──
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNavigation();
    setupDrawer();
    setupCarousel();
    setupBottomSheet();
    setupFAQ();
    setupSearch();
    renderCart();
    updateCartBadge();
    initReorder();
    renderRewards();
    localizeNumerals();
    loadEditableOrder();
    renderEditableSurfaces();
    startEditableTicker();
    loadSimpleMode();
    adjustScale();
    window.addEventListener('resize', adjustScale);
    navigateTo(state.simpleMode ? 'simple-home' : 'home');

    // Intro splash → fade out after a short brand moment.
    const splash = document.getElementById('app-splash');
    if (splash) {
      setTimeout(() => splash.classList.add('hide'), 2200);
      setTimeout(() => { splash.style.display = 'none'; }, 2900);
    }
  }

  // ── Responsive Scaling ──
  function adjustScale() {
    const frame = document.querySelector('.device-frame');
    if (!frame) return;
    // Base width 426px, height 898px
    const scale = Math.min(1, (window.innerWidth - 40) / 450, (window.innerHeight - 60) / 920);
    frame.style.transform = `scale(${scale})`;
    frame.style.transformOrigin = 'top center';
    frame.style.marginBottom = `-${(1 - scale) * 898}px`; // Fixes huge scrolling gap
  }

  // ── SPA Router ──
  function navigateTo(screenId, addToHistory = true) {
    // In Simple Mode, "home" always means the simplified hub.
    if (state.simpleMode && screenId === 'home') screenId = 'simple-home';
    const screens = document.querySelectorAll('.screen');
    const current = document.querySelector('.screen.active');
    const target = document.getElementById('screen-' + screenId);

    // Digital Bhai FAB: visible across journey, hidden on chat + Simple Mode.
    const fab = document.getElementById('bhai-fab');
    if (fab) fab.style.display = (screenId === 'bhai' || state.simpleMode) ? 'none' : 'flex';

    if (current && current === target) {
      target.classList.remove('slide-out');
      target.classList.add('active');
      refreshIcons();
      updateBottomNav(screenId);
      if (screenId === 'home') startCarousel();
      return;
    }

    if (current) {
      current.classList.add('slide-out');
      setTimeout(() => {
        current.classList.remove('active', 'slide-out');
      }, 300);
    }

    if (addToHistory && state.currentScreen !== screenId) {
      state.screenHistory.push(state.currentScreen);
    }

    state.previousScreen = state.currentScreen;
    state.currentScreen = screenId;

    setTimeout(() => {
      const target = document.getElementById('screen-' + screenId);
      if (target) {
        target.classList.add('active');
        target.scrollTop = 0;
        refreshIcons();
      }
    }, current ? 100 : 0);

    updateBottomNav(screenId);

    if (screenId === 'home') {
      startCarousel();
    } else {
      stopCarousel();
    }

    if (screenId === 'order-success' || screenId === 'order-success-payment') {
      setTimeout(() => triggerConfetti(screenId), 400);
    }

    // New order placed → open a fresh 30-min editable window + award reward points
    // + reveal the 1-Tap Reorder card (hidden until the retailer has an order).
    if (screenId === 'order-success-payment') {
      createEditableOrder();
      awardPointsForOrder();
      const rc = document.getElementById('home-reorder-card');
      if (rc) rc.style.display = 'flex';
      // Spin milestone: count the order, unlock a spin every SPIN_MILESTONE orders.
      state.spin.orders += 1;
      if (state.spin.orders % SPIN_MILESTONE === 0) {
        state.spin.available += 1;
        state.spin.justUnlocked = true;
      }
      renderSpin();
    }

    if (screenId === 'order-success') {
      startModifyWindow();
      // Celebrate a tier upgrade triggered by this order.
      if (state.rewards.tierJustUpgraded) {
        const t = state.rewards.tierJustUpgraded;
        setTimeout(() => showToast('অভিনন্দন! আপনি এখন ' + t.bn + ' টিয়ার — নতুন সুবিধা চালু হয়েছে।'), 900);
        state.rewards.tierJustUpgraded = null;
      }
      // Celebrate a freshly unlocked reward spin.
      if (state.spin.justUnlocked) {
        setTimeout(() => showToast('🎡 অভিনন্দন! রিওয়ার্ড স্পিন আনলক হয়েছে!'), 1400);
        state.spin.justUnlocked = false;
      }
    }

    // Repaint editable surfaces so the Home pill shows/hides immediately.
    renderEditableSurfaces();
  }

  function goBack() {
    if (state.screenHistory.length > 0) {
      const prev = state.screenHistory.pop();
      navigateTo(prev, false);
    } else {
      navigateTo('home', false);
    }
  }

  // ── Navigation ──
  function setupNavigation() {
    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.dataset.screen;
        if (target) {
          state.screenHistory = [];
          navigateTo(target);
        }
      });
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', goBack);
    });

    // All navigable links
    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.navigate;

        if (el.dataset.brandTarget) {
            const key = el.dataset.brandTarget; // Bangla brand word
            const titleEl = document.getElementById('all-products-title');
            if (titleEl) titleEl.innerText = (el.dataset.brandName || key) + ' পণ্য';
            document.querySelectorAll('#screen-all-products .product-card').forEach(card => {
                const nm = card.querySelector('.product-name');
                const name = nm ? nm.textContent.trim() : '';
                // Exact brand: name starts with the brand word (excludes generic combos
                // like "চিনি (ফ্রেশ/তীর/ইগলু)"). Ajinomoto variants (থাই/চাইনিজ/মেলা) match anywhere.
                const match = name.indexOf(key) === 0 || (key === 'আজিনোমতো' && name.indexOf('আজিনোমতো') !== -1);
                card.style.display = match ? 'block' : 'none';
            });
        } else if (el.dataset.categoryTarget) {
            const cat = el.dataset.categoryTarget;
            const nameEl = el.querySelector('.category-name');
            const title = nameEl ? nameEl.innerText : 'সকল পণ্য';
            const titleEl = document.getElementById('all-products-title');
            if (titleEl) titleEl.innerText = title;

            document.querySelectorAll('#screen-all-products .product-card').forEach(card => {
                if (cat === 'all' || card.dataset.category === cat) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (target === 'all-products') {
            const titleEl = document.getElementById('all-products-title');
            if (titleEl) titleEl.innerText = 'সকল পণ্য';
            document.querySelectorAll('#screen-all-products .product-card').forEach(card => {
                card.style.display = 'block';
            });
        }
        
        if (target === 'product-detail') {
            const addBtn = el.querySelector('.add-btn');
            if (addBtn) {
                const match = addBtn.getAttribute('onclick').match(/App\.addToCart\((.*?)\)/);
                if (match && match[1]) {
                    const payload = match[1];
                    try {
                        const getName = payload.match(/name:'([^']+)'/);
                        const getNameEn = payload.match(/nameEn:'([^']+)'/);
                        const getWeight = payload.match(/weight:'([^']+)'/);
                        const getPrice = payload.match(/price:(\d+)/);
                        const getImg = payload.match(/image:'([^']+)'/);
                        
                        if (getName && getPrice && getImg) {
                            const name = getName[1];
                            const nameEn = getNameEn ? getNameEn[1] : name;
                            const weight = getWeight ? getWeight[1] : '';
                            const price = parseInt(getPrice[1], 10);
                            const img = getImg[1];
                            
                            document.getElementById('detail-name').innerText = name;
                            document.getElementById('detail-header-title').innerText = name.substring(0, 18) + '...';
                            document.getElementById('detail-price').innerText = '৳' + toBn(price.toLocaleString());
                            document.getElementById('detail-weight').innerText = '(' + toBn(weight) + ')';
                            document.getElementById('detail-brand').innerText = 'ব্র্যান্ডঃ ' + name.split(' ')[0];
                            document.getElementById('detail-description').innerHTML = 
                                nameEn + ' - ' + weight + '.<br>' +
                                'Product Type: Grocery.<br>' +
                                'Net Weight: ' + weight + '... <span class="product-description-link">সম্পূর্ণ দেখুন</span>';
                                
                            const imgEl = document.getElementById('detail-image');
                            imgEl.src = img;
                            const cardImg = el.querySelector('.product-image img');
                            if (cardImg) {
                                imgEl.style.filter = cardImg.style.filter;
                            }
                            if (img.includes('oil.png') || img.includes('flour.png')) {
                                imgEl.style.transform = 'scale(1.2)';
                            } else {
                                imgEl.style.transform = 'scale(1)';
                            }

                        }
                    } catch(e) {
                        console.error('Failed to extract product data safely', e);
                    }
                }
            }
        }

        navigateTo(target);
        closeDrawer();
      });
    });
  }

  function updateBottomNav(screenId) {
    const mainScreens = ['home', 'search', 'categories', 'cart'];
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.screen === screenId);
    });

    const bottomNav = document.getElementById('bottom-nav');
    const simpleNav = document.getElementById('simple-bottom-nav');

    if (state.simpleMode) {
      // Simple Mode: full nav hidden, simplified nav on its core screens.
      if (bottomNav) bottomNav.style.display = 'none';
      const simpleNavScreens = ['simple-home', 'search', 'order-list', 'cart'];
      if (simpleNav) simpleNav.style.display = simpleNavScreens.includes(screenId) ? 'flex' : 'none';
    } else {
      if (simpleNav) simpleNav.style.display = 'none';
      if (bottomNav) bottomNav.style.display = mainScreens.includes(screenId) ? 'flex' : 'none';
    }
  }

  // ── Drawer ──
  function setupDrawer() {
    const menuBtn = document.querySelector('.menu-btn');
    const overlay = document.querySelector('.drawer-overlay');

    if (menuBtn) {
      menuBtn.addEventListener('click', toggleDrawer);
    }
    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }
  }

  function toggleDrawer() {
    state.drawerOpen = !state.drawerOpen;
    document.querySelector('.drawer').classList.toggle('open', state.drawerOpen);
    document.querySelector('.drawer-overlay').classList.toggle('open', state.drawerOpen);
  }

  function closeDrawer() {
    state.drawerOpen = false;
    const drawer = document.querySelector('.drawer');
    const overlay = document.querySelector('.drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  // ── Banner Carousel ──
  function setupCarousel() {
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        state.carouselIndex = i;
        updateCarousel();
      });
    });
    startCarousel();
  }

  function startCarousel() {
    stopCarousel();
    state.carouselTimer = setInterval(() => {
      const track = document.querySelector('.carousel-track');
      if (!track) return;
      const slideCount = track.children.length;
      state.carouselIndex = (state.carouselIndex + 1) % slideCount;
      updateCarousel();
    }, 3500);
  }

  function stopCarousel() {
    if (state.carouselTimer) {
      clearInterval(state.carouselTimer);
      state.carouselTimer = null;
    }
  }

  function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    if (track) {
      track.style.transform = `translateX(-${state.carouselIndex * 100}%)`;
    }
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === state.carouselIndex);
    });
  }

  // ── Bottom Sheet ──
  function setupBottomSheet() {
    const locationInfo = document.querySelector('.location-info');
    if (locationInfo) {
      locationInfo.addEventListener('click', openBottomSheet);
    }

    const bsOverlay = document.querySelector('.bottom-sheet-overlay');
    if (bsOverlay) {
      bsOverlay.addEventListener('click', closeBottomSheet);
    }

    // Address card selection
    document.querySelectorAll('.address-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.address-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        setTimeout(closeBottomSheet, 300);
      });
    });

    // Add new address
    const addAddrBtn = document.querySelector('.add-address-btn');
    if (addAddrBtn) {
      addAddrBtn.addEventListener('click', () => {
        closeBottomSheet();
        navigateTo('new-address');
      });
    }
  }

  function openBottomSheet() {
    state.bottomSheetOpen = true;
    const overlay = document.querySelector('.bottom-sheet-overlay');
    const sheet = document.querySelector('.bottom-sheet');
    if (overlay) overlay.classList.add('open');
    if (sheet) sheet.classList.add('open');
  }

  function closeBottomSheet() {
    state.bottomSheetOpen = false;
    const overlay = document.querySelector('.bottom-sheet-overlay');
    const sheet = document.querySelector('.bottom-sheet');
    if (overlay) overlay.classList.remove('open');
    if (sheet) sheet.classList.remove('open');
  }

  // ── Helper: render a product icon/image ──
  function productIconHtml(icon, color, bg, size) {
    return `<div style="width:${size}px;height:${size}px;border-radius:12px;background:${bg || '#F1F8E9'};display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">
      <img src="${icon}" style="width:100%;height:100%;object-fit:cover;" alt="product">
    </div>`;
  }

  // ── Refresh Lucide icons ──
  function refreshIcons() {
    if (window.lucide) lucide.createIcons();
  }

  // Convert English digits to Bangla numerals in static price/weight labels.
  // Idempotent (toBn only maps 0-9), safe to re-run.
  function localizeNumerals() {
    document.querySelectorAll('.product-price, .product-weight').forEach(el => {
      el.textContent = toBn(el.textContent);
    });
  }

  // ── Cart Logic ──
  function renderCart() {
    const cartList = document.getElementById('cart-items-list');
    if (!cartList) return;

    cartList.innerHTML = state.cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}" onclick="App.openCartItemDetail(${item.id})" style="cursor:pointer">
        <div class="cart-item-image" style="background:#f5f5f5;overflow:hidden;">
          <img src="${item.image || './images/rice_akij.png'}" style="width:100%;height:100%;object-fit:cover;filter:${item.imgFilter || ''}" alt="">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-weight">ওজনঃ ${toBn(item.weight)} • <span class="cart-item-price">৳${toBn(item.price.toLocaleString())}.০</span></div>
          <div class="cart-item-qty-badge">আইটেমঃ ${toBn(item.qty)}</div>
          <div class="cart-item-qty">
            <div class="qty-selector">
              <button class="qty-btn" onclick="event.stopPropagation();App.changeQty(${item.id}, -1)"><i data-lucide="minus" style="width:13px;height:13px;pointer-events:none"></i></button>
              <span class="qty-value">${toBn(item.qty)}</span>
              <button class="qty-btn" onclick="event.stopPropagation();App.changeQty(${item.id}, 1)"><i data-lucide="plus" style="width:13px;height:13px;pointer-events:none"></i></button>
            </div>
          </div>
        </div>
        <button class="cart-item-delete" onclick="event.stopPropagation();App.removeFromCart(${item.id})"><i data-lucide="trash-2" style="width:16px;height:16px;pointer-events:none"></i></button>
      </div>
    `).join('');

    updateCartSummary();
    updateCartBadge();
    renderCheckout();
    renderOrderDetail();
    renderOrderRepeat();
    renderModifyOrder();
    refreshIcons();
  }

  function changeQty(id, delta) {
    const item = state.cartItems.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      renderCart();
    }
  }

  function removeFromCart(id) {
    state.cartItems = state.cartItems.filter(i => i.id !== id);
    renderCart();
  }

  function addToCart(product) {
    const existing = state.cartItems.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cartItems.push({ ...product, qty: 1 });
    }
    renderCart();
    showAddedToast();
    refreshIcons();
  }

  function showAddedToast() {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: #333; color: #fff; padding: 10px 20px; border-radius: 20px;
      font-size: 13px; z-index: 9999; animation: fade-in 0.3s ease;
      font-family: 'Noto Sans Bengali', sans-serif;
    `;
    toast.textContent = 'কার্টে যোগ করা হয়েছে!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  function getCartTotal() {
    return state.cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  function updateCartSummary() {
    const total = getCartTotal();
    const shipping = 0;
    const discount = -80;
    const voucher = state.rewards.voucher ? state.rewards.voucher.amount : 0;
    const netTotal = Math.max(0, total + shipping + discount - voucher);

    const summaryEl = document.getElementById('cart-summary');
    if (summaryEl) {
      const voucherRow = voucher
        ? `<div class="cart-summary-row" style="color:var(--success)"><span>ক্যাশব্যাক ভাউচার</span><span>-৳${toBn(voucher.toLocaleString())}</span></div>`
        : '';
      summaryEl.innerHTML = `
        <div class="cart-summary-row"><span>সর্বমোট বিল</span><span>৳${toBn(total.toLocaleString())}</span></div>
        <div class="cart-summary-row"><span>ডেলিভারি চার্জ</span><span>+৳০</span></div>
        <div class="cart-summary-row"><span>ডিসকাউন্ট</span><span>-৳৮০</span></div>
        ${voucherRow}
        <div class="cart-summary-row total"><span>সর্বমোট</span><span>৳${toBn(netTotal.toLocaleString())}</span></div>
      `;
    }
  }

  function updateCartBadge() {
    const totalItems = state.cartItems.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = toBn(totalItems);
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
    });
    document.querySelectorAll('.header-action-btn .badge').forEach(badge => {
      badge.textContent = toBn(totalItems);
    });
  }

  // Open product detail for a cart line (cart rows are clickable).
  function openCartItemDetail(id) {
    const item = state.cartItems.find(i => i.id === id);
    if (!item) return;
    populateProductDetail(item);
    navigateTo('product-detail');
  }

  // Fill the product-detail screen from a product-like object {name,nameEn,weight,price,image}.
  function populateProductDetail(d) {
    const name = d.name, nameEn = d.nameEn || d.name, weight = d.weight || '', price = d.price, img = d.image || './images/rice_akij.png';
    setText('detail-name', name);
    setText('detail-header-title', name.length > 18 ? name.substring(0, 18) + '...' : name);
    setText('detail-price', '৳' + toBn(price.toLocaleString()));
    setText('detail-weight', '(' + toBn(weight) + ')');
    setText('detail-brand', 'ব্র্যান্ডঃ ' + name.split(' ')[0]);
    const desc = document.getElementById('detail-description');
    if (desc) {
      desc.innerHTML = nameEn + ' - ' + weight + '.<br>Product Type: Grocery.<br>Net Weight: ' + weight +
        '... <span class="product-description-link">সম্পূর্ণ দেখুন</span>';
    }
    const imgEl = document.getElementById('detail-image');
    if (imgEl) {
      imgEl.src = img;
      imgEl.style.transform = (img.includes('oil') || img.includes('flour')) ? 'scale(1.2)' : 'scale(1)';
      imgEl.style.filter = d.imgFilter || '';
    }
    refreshIcons();
  }

  function renderCheckout() {
    const checkoutItems = document.getElementById('checkout-items');
    if (!checkoutItems) return;

    const total = getCartTotal();
    const discount = -80;
    const delivery = 80;
    const voucher = state.rewards.voucher ? state.rewards.voucher.amount : 0;
    const net = Math.max(0, total + discount + delivery - voucher);

    checkoutItems.innerHTML = state.cartItems.map(item => `
      <div class="checkout-item-row">
        <span class="item-name">${item.name}-${toBn(item.weight)}(${toBn(item.qty)})</span>
        <span class="item-price">৳${toBn((item.price * item.qty).toLocaleString())}</span>
      </div>
    `).join('');

    const checkoutTotals = document.getElementById('checkout-totals');
    if (checkoutTotals) {
      const voucherRow = voucher
        ? `<div class="checkout-total-row" style="color:var(--success)"><span>ক্যাশব্যাক ভাউচার</span><span>-৳${toBn(voucher.toLocaleString())}</span></div>`
        : '';
      checkoutTotals.innerHTML = `
        <div class="checkout-total-row"><span>সর্বমোট বিল</span><span>৳${toBn(total.toLocaleString())}</span></div>
        <div class="checkout-total-row"><span>ডিসকাউন্ট</span><span>-৳৮০</span></div>
        <div class="checkout-total-row"><span>ডেলিভারি চার্জ</span><span>+৳${toBn(delivery)}</span></div>
        ${voucherRow}
        <div class="checkout-total-row final"><span>মোট মূল্য</span><span>৳${toBn(net.toLocaleString())}</span></div>
      `;
    }
  }

  function renderOrderDetail() {
    const el = document.getElementById('order-detail-items');
    if (!el) return;
    el.innerHTML = state.cartItems.map(item => `
      <div class="cart-item" onclick="App.openCartItemDetail(${item.id})" style="cursor:pointer">
        <div class="cart-item-image" style="background:#f5f5f5;overflow:hidden;">
          <img src="${item.image || './images/rice_akij.png'}" style="width:100%;height:100%;object-fit:cover;filter:${item.imgFilter || ''}" alt="">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name" style="font-family:var(--font-en)">${item.nameEn}</div>
          <div class="cart-item-price">• ৳${toBn((item.price * item.qty).toLocaleString())} টাকা</div>
        </div>
        <div class="qty-value" style="position:absolute;right:16px;bottom:16px;border:1px solid #e0e0e0;border-radius:6px;padding:4px 14px;font-size:13px">${toBn(item.qty)}</div>
      </div>
    `).join('');
    refreshIcons();
  }

  function renderOrderRepeat() {
    const el = document.getElementById('repeat-items-list');
    if (!el) return;
    el.innerHTML = state.cartItems.map(item => `
      <div class="repeat-item" onclick="App.openCartItemDetail(${item.id})" style="cursor:pointer">
        <div class="repeat-item-image" style="background:#f5f5f5;overflow:hidden;">
          <img src="${item.image || './images/rice_akij.png'}" style="width:100%;height:100%;object-fit:cover;filter:${item.imgFilter || ''}" alt="">
        </div>
        <div class="repeat-item-details">
          <div class="repeat-item-name">${item.name}</div>
          <div class="repeat-item-info">${toBn(item.weight)} • <span class="repeat-item-price">৳${toBn(item.price.toLocaleString())}</span></div>
          <div class="cart-item-qty" style="margin-top:8px">
            <div class="qty-selector">
              <button class="qty-btn" onclick="event.stopPropagation()"><i data-lucide="minus" style="width:13px;height:13px"></i></button>
              <span class="qty-value">${toBn(item.qty)}</span>
              <button class="qty-btn" onclick="event.stopPropagation()"><i data-lucide="plus" style="width:13px;height:13px"></i></button>
            </div>
          </div>
        </div>
        <button class="repeat-item-delete" onclick="event.stopPropagation()"><i data-lucide="trash-2" style="width:16px;height:16px"></i></button>
      </div>
    `).join('');
    refreshIcons();
  }

  // ── Modify-After-Order & Checkout Guarantee ──

  // English digits → Bangla numerals (UI uses Bangla numerals throughout).
  function toBn(value) {
    const map = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(value).replace(/[0-9]/g, d => map[d]);
  }

  // ── Persisted editable-order window ──
  const EDITABLE_KEY = 'priyoshop_editable_order';

  function saveEditableOrder() {
    try {
      localStorage.setItem(EDITABLE_KEY, JSON.stringify(state.editableOrder));
      localStorage.setItem('priyoshop_delivery_note', state.deliveryNote || '');
    } catch (e) { /* localStorage may be unavailable on file:// */ }
  }

  // Prototype starts clean: no editable order until one is placed this session.
  function loadEditableOrder() {
    state.editableOrder = { active: false, expiresAt: 0, status: 'editable' };
    state.deliveryNote = '';
    try { localStorage.removeItem(EDITABLE_KEY); } catch (e) { /* ignore */ }
  }

  // Called once when an order is placed.
  function createEditableOrder() {
    state.editableOrder = { active: true, expiresAt: Date.now() + MODIFY_WINDOW_SECONDS * 1000, status: 'editable' };
    saveEditableOrder();
    renderEditableSurfaces();
  }

  function remainingMs() {
    return Math.max(0, state.editableOrder.expiresAt - Date.now());
  }
  function fmtClock(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60), s = total % 60;
    return toBn(String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'));
  }
  function fmtMins(ms) {
    return toBn(Math.max(1, Math.ceil(ms / 60000))); // at least ১ while active
  }

  function startEditableTicker() {
    if (state.editableTicker) clearInterval(state.editableTicker);
    state.editableTicker = setInterval(() => {
      if (state.editableOrder.active && state.editableOrder.status === 'editable' && remainingMs() <= 0) {
        lockOrder();
      } else {
        renderEditableSurfaces();
      }
    }, 1000);
  }

  function isEditable() {
    return state.editableOrder.active && state.editableOrder.status === 'editable' && remainingMs() > 0;
  }

  // Window expired / pick-pack started → order moves to Processing.
  function lockOrder() {
    state.editableOrder.status = 'processing';
    saveEditableOrder();
    renderEditableSurfaces();
  }

  // Paint every surface that reflects the editable-order window.
  function renderEditableSurfaces() {
    const editable = isEditable();
    const ms = remainingMs();

    // order-success: countdown + modify-window vs guarantee
    const cd = document.getElementById('modify-countdown');
    if (cd) cd.textContent = fmtClock(ms);
    const box = document.getElementById('modify-window-box');
    const guarantee = document.getElementById('guarantee-box');
    if (box) box.style.display = editable ? 'block' : 'none';
    if (guarantee) guarantee.style.display = (state.editableOrder.active && !editable) ? 'block' : 'none';

    // home floating status pill (passive; Home only)
    const pill = document.getElementById('home-order-status');
    if (pill) {
      pill.style.display = (editable && (state.currentScreen === 'home' || state.currentScreen === 'simple-home')) ? 'flex' : 'none';
      setText('home-status-clock', fmtClock(ms));
      const bar = document.getElementById('home-status-progress');
      if (bar) bar.style.width = Math.max(0, (ms / (MODIFY_WINDOW_SECONDS * 1000)) * 100) + '%';
    }

    // notifications reminder
    const notif = document.getElementById('notif-editable');
    if (notif) {
      notif.style.display = editable ? 'flex' : 'none';
      setText('notif-editable-mins', fmtMins(ms));
    }

    // order-list editable card
    const olBadge = document.getElementById('order-list-status');
    if (olBadge) {
      olBadge.textContent = state.editableOrder.active
        ? (editable ? 'পরিবর্তনযোগ্য' : 'প্রসেসিং')
        : 'নতুন অর্ডার';
    }
    const olActions = document.getElementById('order-list-editable');
    if (olActions) {
      olActions.style.display = editable ? 'block' : 'none';
      setText('order-list-mins', fmtMins(ms));
    }
    refreshIcons();
  }

  // Kept for the navigateTo('order-success') hook — just repaint from shared state.
  function startModifyWindow() {
    renderEditableSurfaces();
  }

  function openModifyOrder() {
    if (!isEditable()) {
      showToast('সময় শেষ — অর্ডার এখন প্রসেসিং-এ');
      return;
    }
    renderModifyOrder();
    navigateTo('modify-order');
  }

  function renderModifyOrder() {
    const list = document.getElementById('modify-items-list');
    if (!list) return;

    if (state.cartItems.length === 0) {
      list.innerHTML = '<div style="padding:40px 16px;text-align:center;color:var(--text-secondary)">কোনো পণ্য নেই</div>';
    } else {
      list.innerHTML = state.cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}" onclick="App.openCartItemDetail(${item.id})" style="cursor:pointer">
          <div class="cart-item-image" style="background:#f5f5f5;overflow:hidden;">
            <img src="${item.image || './images/rice_akij.png'}" style="width:100%;height:100%;object-fit:cover;filter:${item.imgFilter || ''}" alt="">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-weight">ওজনঃ ${toBn(item.weight)} • <span class="cart-item-price">৳${toBn(item.price.toLocaleString())}.০</span></div>
            <div class="cart-item-qty">
              <div class="qty-selector">
                <button class="qty-btn" onclick="event.stopPropagation();App.changeQty(${item.id}, -1)"><i data-lucide="minus" style="width:13px;height:13px;pointer-events:none"></i></button>
                <span class="qty-value">${toBn(item.qty)}</span>
                <button class="qty-btn" onclick="event.stopPropagation();App.changeQty(${item.id}, 1)"><i data-lucide="plus" style="width:13px;height:13px;pointer-events:none"></i></button>
              </div>
            </div>
          </div>
          <button class="cart-item-delete" onclick="event.stopPropagation();App.removeFromCart(${item.id})"><i data-lucide="trash-2" style="width:16px;height:16px;pointer-events:none"></i></button>
        </div>
      `).join('');
    }

    const totals = document.getElementById('modify-totals');
    if (totals) {
      const total = getCartTotal();
      totals.innerHTML = `
        <div class="modify-total-row total"><span>পরিবর্তিত সর্বমোট</span><span>৳${toBn(total.toLocaleString())}</span></div>
      `;
    }
    const note = document.getElementById('modify-delivery-note');
    if (note) note.value = state.deliveryNote || '';
    refreshIcons();
  }

  function confirmModify() {
    showToast('অর্ডার আপডেট হয়েছে');
    navigateTo('order-success');
  }

  function cancelOrder() {
    if (!isEditable()) { showToast('সময় শেষ — অর্ডার এখন প্রসেসিং-এ'); return; }
    if (!window.confirm('আপনি কি অর্ডারটি বাতিল করতে চান? কোনো জরিমানা নেই।')) return;
    state.editableOrder.active = false;
    saveEditableOrder();
    renderEditableSurfaces();
    showToast('অর্ডার বাতিল হয়েছে');
    navigateTo('home');
  }

  function saveDeliveryNote(text) {
    state.deliveryNote = text;
    saveEditableOrder();
  }

  function selectIssue(el) {
    document.querySelectorAll('#screen-report-issue .payment-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
  }

  function addPhotoEvidence(input) {
    const f = input && input.files && input.files[0];
    const preview = document.getElementById('report-photo-preview');
    if (preview) {
      preview.textContent = f ? ('সংযুক্ত: ' + f.name) : '';
      preview.style.display = f ? 'block' : 'none';
    }
  }

  function submitReport() {
    showToast('রিপোর্ট পাঠানো হয়েছে — ২৪ ঘণ্টায় বিনামূল্যে রিটার্ন/রিফান্ড');
    navigateTo('order-detail');
  }

  // ── 1-Tap Reorder ──

  // Headline numbers for the home card / weekly notification.
  function reorderSummary() {
    const totalQty = LAST_ORDER.reduce((s, i) => s + i.qty, 0);
    const total = LAST_ORDER.reduce((s, i) => s + i.price * i.qty, 0);
    return { totalQty, total };
  }

  // Fill home reorder card + notification copy on load (retailers with >=1 past order).
  function initReorder() {
    const { totalQty, total } = reorderSummary();
    const label = toBn(totalQty) + 'টি পণ্য • ৳' + toBn(total.toLocaleString());
    const cardSummary = document.getElementById('reorder-card-summary');
    if (cardSummary) cardSummary.textContent = label;
    const notifSummary = document.getElementById('reorder-notif-summary');
    if (notifSummary) notifSummary.textContent = label;
  }

  // Tap → clone last order into reconciliation state, open review screen.
  function startReorder() {
    state.reorderItems = LAST_ORDER.map(i => ({ ...i, swapped: false }));
    renderReorderReview();
    navigateTo('reorder-review');
  }

  function renderReorderReview() {
    const list = document.getElementById('reorder-review-items');
    if (!list) return;

    const outOfStock = state.reorderItems.filter(i => !i.stock && !i.swapped).length;
    const priceChanged = state.reorderItems.filter(i => i.oldPrice).length;

    // Issue banner
    const banner = document.getElementById('reorder-issue-banner');
    if (banner) {
      if (outOfStock === 0 && priceChanged === 0) {
        banner.style.display = 'none';
      } else {
        banner.style.display = 'flex';
        const parts = [];
        if (outOfStock) parts.push(toBn(outOfStock) + 'টি পণ্য স্টকে নেই');
        if (priceChanged) parts.push(toBn(priceChanged) + 'টির দাম বদলেছে');
        const txt = document.getElementById('reorder-issue-text');
        if (txt) txt.textContent = parts.join(' • ') + '। নিচে দেখে নিন।';
      }
    }

    list.innerHTML = state.reorderItems.map(item => {
      const unavailable = !item.stock && !item.swapped;
      const priceBadge = item.oldPrice
        ? `<span class="reorder-badge price">দাম বেড়েছে: ৳${toBn(item.oldPrice.toLocaleString())} → ৳${toBn(item.price.toLocaleString())}</span>`
        : '';

      if (unavailable) {
        const swapBtn = item.alt
          ? `<button class="reorder-swap-btn" onclick="event.stopPropagation();App.swapAlternative(${item.id})"><i data-lucide="repeat" style="width:13px;height:13px;pointer-events:none"></i> বিকল্প নিন (${item.alt.name})</button>`
          : '';
        return `
          <div class="reorder-item out-of-stock" data-id="${item.id}" onclick="App.reorderOpenDetail(${item.id})" style="cursor:pointer">
            <div class="cart-item-image" style="background:#f5f5f5;overflow:hidden;">
              <img src="${item.image}" style="width:100%;height:100%;object-fit:cover;opacity:.5;filter:${item.imgFilter || ''}" alt="">
            </div>
            <div class="reorder-item-details">
              <div class="cart-item-name">${item.name}</div>
              <span class="reorder-badge oos">স্টকে নেই</span>
              ${swapBtn}
            </div>
            <button class="cart-item-delete" onclick="event.stopPropagation();App.removeReorderItem(${item.id})"><i data-lucide="x" style="width:16px;height:16px;pointer-events:none"></i></button>
          </div>`;
      }

      return `
        <div class="reorder-item" data-id="${item.id}" onclick="App.reorderOpenDetail(${item.id})" style="cursor:pointer">
          <div class="cart-item-image" style="background:#f5f5f5;overflow:hidden;">
            <img src="${item.image}" style="width:100%;height:100%;object-fit:cover;filter:${item.imgFilter || ''}" alt="">
          </div>
          <div class="reorder-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-weight">ওজনঃ ${toBn(item.weight)} • <span class="cart-item-price">৳${toBn(item.price.toLocaleString())}</span></div>
            ${priceBadge}
            ${item.swapped ? '<span class="reorder-badge swapped">বিকল্প যোগ হয়েছে</span>' : ''}
            <div class="cart-item-qty">
              <div class="qty-selector">
                <button class="qty-btn" onclick="event.stopPropagation();App.reorderChangeQty(${item.id}, -1)"><i data-lucide="minus" style="width:13px;height:13px;pointer-events:none"></i></button>
                <span class="qty-value">${toBn(item.qty)}</span>
                <button class="qty-btn" onclick="event.stopPropagation();App.reorderChangeQty(${item.id}, 1)"><i data-lucide="plus" style="width:13px;height:13px;pointer-events:none"></i></button>
              </div>
            </div>
          </div>
          <button class="cart-item-delete" onclick="event.stopPropagation();App.removeReorderItem(${item.id})"><i data-lucide="trash-2" style="width:16px;height:16px;pointer-events:none"></i></button>
        </div>`;
    }).join('');

    const total = state.reorderItems
      .filter(i => i.stock || i.swapped)
      .reduce((s, i) => s + i.price * i.qty, 0);
    const totals = document.getElementById('reorder-review-total');
    if (totals) {
      totals.innerHTML = `<div class="modify-total-row total"><span>মোট</span><span>৳${toBn(total.toLocaleString())}</span></div>`;
    }
    refreshIcons();
  }

  function reorderChangeQty(id, delta) {
    const item = state.reorderItems.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      renderReorderReview();
    }
  }

  function swapAlternative(id) {
    const item = state.reorderItems.find(i => i.id === id);
    if (item && item.alt) {
      item.name = item.alt.name;
      item.weight = item.alt.weight;
      item.price = item.alt.price;
      item.image = item.alt.image;
      item.stock = true;
      item.swapped = true;
      delete item.oldPrice;
      renderReorderReview();
      showToast('বিকল্প পণ্য যোগ হয়েছে');
    }
  }

  function removeReorderItem(id) {
    state.reorderItems = state.reorderItems.filter(i => i.id !== id);
    renderReorderReview();
  }

  function reorderOpenDetail(id) {
    const it = state.reorderItems.find(i => i.id === id);
    if (it) { populateProductDetail(it); navigateTo('product-detail'); }
  }

  // Accept reconciliation → load available lines into cart → checkout.
  function proceedReorderCheckout() {
    const available = state.reorderItems.filter(i => i.stock || i.swapped);
    if (available.length === 0) {
      showToast('কোনো পণ্য নেই');
      return;
    }
    state.cartItems = available.map(i => ({
      id: i.id, name: i.name, nameEn: i.name, weight: i.weight, price: i.price, qty: i.qty, image: i.image
    }));
    renderCart();
    navigateTo('checkout');
  }

  // ── Reward System (Idea 8) ──

  function tierFor(points) {
    let t = TIERS[0];
    for (const tier of TIERS) if (points >= tier.min) t = tier;
    return t;
  }

  // Next tier + points still needed, or null at top tier.
  function nextTier(points) {
    const idx = TIERS.indexOf(tierFor(points));
    if (idx >= TIERS.length - 1) return null;
    const next = TIERS[idx + 1];
    return { tier: next, remaining: next.min - points };
  }

  function computeEarned(total) {
    return Math.floor(total / POINTS_PER_TAKA);
  }

  // Net order value mirrors renderCheckout: total - 80 discount + 80 delivery - voucher.
  function orderNetTotal() {
    const total = getCartTotal();
    const voucher = state.rewards.voucher ? state.rewards.voucher.amount : 0;
    return Math.max(0, total - 80 + 80 - voucher);
  }

  // Award points once when an order is placed (on reaching order-success-payment).
  function awardPointsForOrder() {
    const r = state.rewards;
    const net = orderNetTotal();
    const earned = computeEarned(net);
    const beforeTier = tierFor(r.lifetime);

    r.earnedThisOrder = earned;
    r.points += earned;
    r.lifetime += earned;
    r.history.unshift({ label: 'নতুন অর্ডার', points: earned, date: todayBn() });

    const afterTier = tierFor(r.lifetime);
    r.tierJustUpgraded = (afterTier !== beforeTier) ? afterTier : null;

    // Voucher is single-use — consumed by this order.
    r.voucher = null;

    renderRewards();
  }

  function todayBn() {
    return '২৩-মে-২০২৬';
  }

  function redeem(cost) {
    const r = state.rewards;
    if (r.points < cost) {
      showToast('পর্যাপ্ত পয়েন্ট নেই');
      return;
    }
    r.points -= cost;
    r.voucher = { amount: cost };
    renderRewards();
    showToast('৳' + toBn(cost.toLocaleString()) + ' ক্যাশব্যাক ভাউচার তৈরি — পরের অর্ডারে প্রযোজ্য');
  }

  // Paint every rewards surface: home strip, drawer badge, dashboard, success banner.
  function renderRewards() {
    const r = state.rewards;
    const tier = tierFor(r.lifetime);
    const next = nextTier(r.lifetime);
    const nextText = next
      ? next.tier.bn + '-এ পৌঁছাতে আর ' + toBn(next.remaining.toLocaleString()) + ' পয়েন্ট'
      : 'আপনি সর্বোচ্চ টিয়ারে আছেন!';

    setText('home-points', toBn(r.points.toLocaleString()));
    setText('home-tier', tier.bn);
    setText('home-next-tier', nextText);
    setText('drawer-points', toBn(r.points.toLocaleString()) + ' পয়েন্ট');

    // Dashboard
    setText('rewards-balance', toBn(r.points.toLocaleString()));
    setText('rewards-tier', tier.bn + ' টিয়ার');
    setText('rewards-next', nextText);
    const bar = document.getElementById('rewards-progress');
    if (bar) {
      let pct = 100;
      if (next) {
        const span = next.tier.min - tier.min;
        pct = Math.min(100, Math.round(((r.lifetime - tier.min) / span) * 100));
      }
      bar.style.width = pct + '%';
    }

    // Tier-benefit highlight
    document.querySelectorAll('#tier-benefits .tier-benefit').forEach(el => {
      el.classList.toggle('active', el.dataset.tier === tier.name);
    });

    // Active voucher chip
    const voucherEl = document.getElementById('rewards-voucher');
    if (voucherEl) {
      if (r.voucher) {
        voucherEl.style.display = 'flex';
        setText('rewards-voucher-amount', '৳' + toBn(r.voucher.amount.toLocaleString()));
      } else {
        voucherEl.style.display = 'none';
      }
    }

    // Recent earnings
    const hist = document.getElementById('rewards-history');
    if (hist) {
      hist.innerHTML = r.history.map(h => `
        <div class="rewards-history-row">
          <div>
            <div class="rh-label">${h.label}</div>
            <div class="rh-date">${h.date} • মেয়াদ ৬ মাস</div>
          </div>
          <div class="rh-points">+${toBn(h.points.toLocaleString())}</div>
        </div>
      `).join('');
    }

    // Order-success earned banner
    setText('points-earned-value', toBn(r.earnedThisOrder.toLocaleString()));
    setText('points-earned-balance', toBn(r.points.toLocaleString()));

    renderSpin();
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Voice Ordering (Idea 1) ──

  const VOICE_UNITS = ['কার্টন', 'carton', 'বস্তা', 'প্যাকেট', 'packet', 'কেজি', 'kg', 'লিটার', 'liter', 'litre', 'পিস', 'piece', 'টা', 'টি'];

  // Levenshtein-based similarity (0..1) for fuzzy "did you mean" guessing.
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function similarity(a, b) {
    if (!a || !b) return 0;
    const max = Math.max(a.length, b.length);
    return max ? 1 - levenshtein(a, b) / max : 0;
  }

  function cleanToken(t) { return t.replace(/[^ঀ-৿a-z0-9]/g, ''); }
  function isQtyOrUnit(w) {
    if (!w) return true;
    if (/^[0-9]+$/.test(w)) return true;
    if (Object.keys(QTY_WORDS).some(k => w === k || w.startsWith(k))) return true;
    if (VOICE_UNITS.some(u => w === u || w.startsWith(u))) return true;
    return false;
  }

  // Extract quantity from a segment (word/digit + suffix forms like "ছয়টা", "২টি").
  function qtyFromSegment(seg) {
    const keys = Object.keys(QTY_WORDS).sort((a, b) => b.length - a.length);
    for (const t of seg.split(/\s+/)) {
      const clean = cleanToken(t);
      if (!clean) continue;
      if (/^[0-9]+$/.test(clean)) return parseInt(clean, 10);
      for (const k of keys) if (clean === k || clean.startsWith(k)) return QTY_WORDS[k];
    }
    return 1;
  }

  // Best fuzzy guess across the whole catalog (for unrecognized speech).
  function voiceBestGuess(seg) {
    const words = seg.split(/\s+/).map(cleanToken).filter(w => w.length > 1 && !isQtyOrUnit(w));
    let best = null, bestScore = 0;
    VOICE_CATALOG.forEach(p => {
      const cand = [...p.brandKeys, ...p.name.toLowerCase().split(/\s+/)];
      let score = 0;
      words.forEach(sw => cand.forEach(c => { const s = similarity(sw, c.toLowerCase()); if (s > score) score = s; }));
      if (score > bestScore) { bestScore = score; best = p; }
    });
    return { product: best, score: bestScore };
  }

  // Convert a (simulated) spoken transcript into structured cart lines.
  // Dialect "normalization" = keyword/synonym matching against VOICE_CATALOG;
  // unknown items are surfaced as "did you mean?" cards rather than dropped.
  function parseVoiceOrder(transcript) {
    const text = (transcript || '').toLowerCase();
    const segments = text.split(/আর|এবং|,|;|\+/).map(s => s.trim()).filter(Boolean);
    const items = [];

    segments.forEach(seg => {
      const qty = qtyFromSegment(seg);

      // 1. category
      let cat = null;
      for (const c in VOICE_CATEGORY_KEYS) {
        if (VOICE_CATEGORY_KEYS[c].some(k => seg.includes(k))) { cat = c; break; }
      }

      if (cat) {
        const inCat = VOICE_CATALOG.filter(p => p.cat === cat);
        const brandMatches = inCat.filter(p => p.brandKeys.some(k => seg.includes(k)));
        let product, confidence, suggestions = [];
        if (brandMatches.length === 1) {
          product = brandMatches[0]; confidence = 'high';
        } else if (brandMatches.length > 1) {
          product = brandMatches[0]; confidence = 'low'; suggestions = brandMatches.slice(0, 3);
        } else {
          product = inCat[0]; confidence = 'low'; suggestions = inCat.slice(0, 3);
        }
        items.push({ product: { ...product }, qty, confidence, suggestions: suggestions.map(s => ({ ...s })) });
        return;
      }

      // 2. no category → unrecognized item (only if there's a real product-like token)
      const meaningful = seg.split(/\s+/).map(cleanToken).filter(w => w && !isQtyOrUnit(w));
      if (meaningful.length === 0) return;

      const g = voiceBestGuess(seg);
      let guess = null, suggestions = [];
      if (g.product && g.score >= 0.45) {
        guess = g.product;
        suggestions = VOICE_CATALOG.filter(p => p.cat === g.product.cat).slice(0, 3);
      }
      items.push({
        unrecognized: true, spoken: seg, qty, confidence: 'unrecognized',
        guess: guess ? { ...guess } : null,
        suggestions: suggestions.map(s => ({ ...s }))
      });
    });
    return items;
  }

  function startVoiceOrder() {
    if (!state.voice.permission) { openVoicePermission(); return; }
    openVoiceOverlay();
  }

  function openVoicePermission() {
    const o = document.getElementById('voice-permission-overlay');
    const s = document.getElementById('voice-permission-sheet');
    if (o) o.classList.add('open');
    if (s) s.classList.add('open');
  }

  function closeVoicePermission() {
    const o = document.getElementById('voice-permission-overlay');
    const s = document.getElementById('voice-permission-sheet');
    if (o) o.classList.remove('open');
    if (s) s.classList.remove('open');
  }

  function grantVoicePermission() {
    state.voice.permission = true;
    closeVoicePermission();
    openVoiceOverlay();
  }

  function denyVoicePermission() {
    closeVoicePermission();
    showToast('ভয়েস অর্ডার ব্যবহার করতে মাইক্রোফোন অনুমতি প্রয়োজন');
  }

  function openVoiceOverlay() {
    const ov = document.getElementById('voice-overlay');
    if (ov) ov.classList.add('open');
    refreshIcons();
  }

  function closeVoiceOverlay() {
    const ov = document.getElementById('voice-overlay');
    if (ov) ov.classList.remove('open');
  }

  // End the (simulated) recording. With no real audio captured, treat it as the
  // representative spoken order; demo chips remain for choosing a specific phrase.
  function stopVoiceListening() {
    runVoiceTranscript('রূপচাঁদা তেল এক কার্টন আর তীর চিনি দুই বস্তা');
  }

  // A demo chip "spoke" this transcript → parse + go to review.
  function runVoiceTranscript(text) {
    state.voice.transcript = text;
    state.voice.items = parseVoiceOrder(text);
    closeVoiceOverlay();
    renderVoiceReview();
    navigateTo('voice-review');
  }

  function renderVoiceReview() {
    setText('voice-transcript', state.voice.transcript);
    const list = document.getElementById('voice-review-items');
    if (!list) return;

    if (state.voice.items.length === 0) {
      list.innerHTML = '<div style="padding:40px 16px;text-align:center;color:var(--text-secondary)">কোনো পণ্য বুঝতে পারিনি। আবার চেষ্টা করুন।</div>';
    } else {
      list.innerHTML = state.voice.items.map((it, i) => it.unrecognized
        ? voiceUnrecognizedHtml(it, i)
        : voiceItemHtml(it, i)).join('');
    }

    const total = state.voice.items.reduce((s, it) => s + (it.product ? it.product.price * it.qty : 0), 0);
    const t = document.getElementById('voice-review-total');
    if (t) t.innerHTML = `<div class="modify-total-row total"><span>মোট</span><span>৳${toBn(total.toLocaleString())}</span></div>`;
    refreshIcons();
  }

  // Visual suggestion rows (image + name + price) shared by low-confidence & unrecognized.
  function voiceSuggestionRowsHtml(i, suggestions, currentId) {
    if (!suggestions || !suggestions.length) return '';
    return `<div class="voice-suggestions">${suggestions.map(s => `
      <button class="voice-suggestion-row${s.id === currentId ? ' active' : ''}" onclick="event.stopPropagation();App.voicePickSuggestion(${i}, ${s.id})">
        <div class="voice-sugg-img"><img src="${s.image}" style="width:100%;height:100%;object-fit:cover;filter:${s.imgFilter || ''}" alt=""></div>
        <span class="voice-sugg-name">${s.name}</span>
        <span class="voice-sugg-price">৳${toBn(s.price.toLocaleString())}</span>
      </button>`).join('')}</div>`;
  }

  function voiceItemHtml(it, i) {
    const p = it.product;
    const badge = it.confidence === 'high'
      ? '<span class="voice-badge match"><i data-lucide="check" style="width:12px;height:12px"></i> মিল পাওয়া গেছে</span>'
      : '<span class="voice-badge low"><i data-lucide="help-circle" style="width:12px;height:12px"></i> নিশ্চিত নয় — বেছে নিন</span>';
    const sugg = it.confidence === 'low' ? voiceSuggestionRowsHtml(i, it.suggestions, p.id) : '';
    return `
      <div class="voice-review-row" onclick="App.voiceOpenDetail(${i})" style="cursor:pointer">
        <div class="cart-item-image" style="background:#f5f5f5;overflow:hidden;"><img src="${p.image}" style="width:100%;height:100%;object-fit:cover;filter:${p.imgFilter || ''}" alt=""></div>
        <div class="voice-review-details">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-weight">ওজনঃ ${toBn(p.weight)} • <span class="cart-item-price">৳${toBn(p.price.toLocaleString())}</span></div>
          ${badge}
          ${sugg}
          <div class="cart-item-qty"><div class="qty-selector">
            <button class="qty-btn" onclick="event.stopPropagation();App.voiceChangeQty(${i}, -1)"><i data-lucide="minus" style="width:13px;height:13px;pointer-events:none"></i></button>
            <span class="qty-value">${toBn(it.qty)}</span>
            <button class="qty-btn" onclick="event.stopPropagation();App.voiceChangeQty(${i}, 1)"><i data-lucide="plus" style="width:13px;height:13px;pointer-events:none"></i></button>
          </div></div>
        </div>
        <button class="cart-item-delete" onclick="event.stopPropagation();App.voiceRemove(${i})"><i data-lucide="trash-2" style="width:16px;height:16px;pointer-events:none"></i></button>
      </div>`;
  }

  function voiceUnrecognizedHtml(it, i) {
    const header = it.guess
      ? `<div class="voice-guess-chip"><i data-lucide="alert-triangle" style="width:14px;height:14px"></i> এটি কি ছিল: “${it.guess.name}”?</div>`
      : '';
    return `
      <div class="voice-unrecognized">
        ${header}
        <div class="voice-unrecognized-top">
          <div class="voice-unrecognized-img"><i data-lucide="help-circle" style="width:26px;height:26px;color:var(--text-tertiary)"></i></div>
          <div class="voice-unrecognized-body">
            <div class="voice-unrecognized-spoken">“${it.spoken}”</div>
            <div class="voice-unrecognized-sub">অচেনা পণ্য — নিচে থেকে বেছে নিন।</div>
            <div class="cart-item-qty" style="margin-top:6px"><div class="qty-selector">
              <button class="qty-btn" onclick="App.voiceChangeQty(${i}, -1)"><i data-lucide="minus" style="width:13px;height:13px;pointer-events:none"></i></button>
              <span class="qty-value">${toBn(it.qty)}</span>
              <button class="qty-btn" onclick="App.voiceChangeQty(${i}, 1)"><i data-lucide="plus" style="width:13px;height:13px;pointer-events:none"></i></button>
            </div></div>
          </div>
          <button class="cart-item-delete" style="position:static" onclick="App.voiceRemove(${i})"><i data-lucide="x" style="width:18px;height:18px;pointer-events:none"></i></button>
        </div>
        ${voiceSuggestionRowsHtml(i, it.suggestions, null)}
      </div>`;
  }

  function voiceChangeQty(i, delta) {
    const it = state.voice.items[i];
    if (it) { it.qty = Math.max(1, it.qty + delta); renderVoiceReview(); }
  }

  function voicePickSuggestion(i, id) {
    const it = state.voice.items[i];
    const sel = (it && it.suggestions.find(s => s.id === id)) || VOICE_CATALOG.find(s => s.id === id);
    if (it && sel) {
      it.product = { ...sel };
      it.confidence = 'high';
      it.unrecognized = false;
      it.guess = null;
      renderVoiceReview();
    }
  }

  function voiceRemove(i) {
    state.voice.items.splice(i, 1);
    renderVoiceReview();
  }

  function voiceOpenDetail(i) {
    const it = state.voice.items[i];
    if (it && it.product) { populateProductDetail(it.product); navigateTo('product-detail'); }
  }

  function voiceAddToCart() {
    const resolved = state.voice.items.filter(it => it.product && !it.unrecognized);
    if (resolved.length === 0) { showToast('যোগ করার মতো পণ্য নেই'); return; }
    resolved.forEach(it => {
      const ex = state.cartItems.find(c => c.id === it.product.id);
      if (ex) ex.qty += it.qty;
      else state.cartItems.push({
        id: it.product.id, name: it.product.name, nameEn: it.product.nameEn,
        weight: it.product.weight, price: it.product.price, qty: it.qty, image: it.product.image
      });
    });
    renderCart();
    const unresolved = state.voice.items.length - resolved.length;
    showToast(unresolved > 0 ? 'কিছু পণ্য বেছে নেওয়া হয়নি — বাকিগুলো যোগ হয়েছে' : 'ভয়েস অর্ডার কার্টে যোগ হয়েছে');
    navigateTo('cart');
  }

  // Reusable toast (generalized from showAddedToast).
  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: #333; color: #fff; padding: 10px 20px; border-radius: 20px;
      font-size: 13px; z-index: 9999; animation: fade-in 0.3s ease;
      font-family: 'Noto Sans Bengali', sans-serif; max-width: 90%; text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // ── FAQ Accordion ──
  function setupFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        const isExpanded = btn.classList.contains('expanded');

        // Close all
        document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('expanded'));
        document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('visible'));

        if (!isExpanded) {
          btn.classList.add('expanded');
          answer.classList.add('visible');
        }
      });
    });
  }

  // ── Search ──
  function setupSearch() {
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      searchBar.addEventListener('click', () => {
        navigateTo('search');
        setTimeout(() => {
          const input = document.querySelector('#search-input');
          if (input) input.focus();
        }, 400);
      });
    }
  }

  // ── Confetti Animation ──
  function triggerConfetti(screenId) {
    const container = document.querySelector(`#screen-${screenId} .confetti-container`);
    if (!container) return;

    container.innerHTML = '';
    const colors = ['#E53935', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#FFEB3B', '#F06292'];

    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = 2 + Math.random() * 2;
      const size = 6 + Math.random() * 8;
      const shapes = ['50%', '0', '2px'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      piece.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: -10px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape};
        animation: confetti-fall ${duration}s ease-in ${delay}s forwards;
      `;
      container.appendChild(piece);
    }
  }

  // ── Onboarding Carousel ──
  window.setOnboardingStep = function (step) {
    state.onboardingStep = step;
    const cards = document.querySelectorAll('.onboarding-step-card');
    const dots = document.querySelectorAll('.onboarding-dot');

    cards.forEach((card, i) => {
      card.style.display = i === step ? 'flex' : 'none';
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === step);
    });
  };

  // ── Spin-the-Wheel (Idea 4) ──
  function renderSpin() {
    const prog = state.spin.orders % SPIN_MILESTONE;
    const ready = state.spin.available > 0;
    const bar = document.getElementById('spin-progress');
    if (bar) bar.style.width = (ready ? 100 : (prog / SPIN_MILESTONE) * 100) + '%';
    setText('spin-progress-label', ready
      ? 'আপনার রিওয়ার্ড স্পিন প্রস্তুত!'
      : 'পরবর্তী স্পিন আনলক করতে আর ' + toBn(SPIN_MILESTONE - prog) + 'টি অর্ডার করুন');
    setText('spin-count', toBn(prog) + '/' + toBn(SPIN_MILESTONE));
    setText('spin-available', ready ? toBn(state.spin.available) + 'টি স্পিন বাকি' : '');
    const cta = document.getElementById('spin-cta');
    if (cta) cta.classList.toggle('disabled', !ready);
  }

  function demoUnlockSpin() {
    state.spin.available += 1;
    renderSpin();
    showToast('🎡 স্পিন আনলক হয়েছে');
  }

  function openSpin() {
    if (state.spin.available <= 0) { showToast('আগে স্পিন আনলক করুন'); return; }
    renderSpinWheel();
    navigateTo('spin');
  }

  function renderSpinWheel() {
    const wheel = document.getElementById('spin-wheel');
    if (!wheel) return;
    const prizes = activePrizes();
    const seg = 360 / prizes.length;
    const stops = prizes.map((p, i) => `${p.color} ${i * seg}deg ${(i + 1) * seg}deg`).join(', ');
    wheel.style.background = `conic-gradient(${stops})`;
    wheel.innerHTML = prizes.map((p, i) => {
      const ang = i * seg + seg / 2;
      return `<div class="spin-label" style="transform:rotate(${ang}deg)"><span>${p.label}</span></div>`;
    }).join('');
  }

  function weightedPick(prizes) {
    const total = prizes.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    for (let i = 0; i < prizes.length; i++) { r -= prizes[i].weight; if (r < 0) return i; }
    return prizes.length - 1;
  }

  function doSpin() {
    if (state.spin.spinning || state.spin.available <= 0) return;
    state.spin.spinning = true;
    const prizes = activePrizes();
    const idx = weightedPick(prizes);
    const seg = 360 / prizes.length;
    const target = (360 - (idx * seg + seg / 2)) % 360; // bring segment center under top pointer
    const base = Math.ceil(state.spin.rotation / 360) * 360;
    const final = base + 360 * 5 + target;
    state.spin.rotation = final;
    const wheel = document.getElementById('spin-wheel');
    if (wheel) wheel.style.transform = `rotate(${final}deg)`;
    setTimeout(() => finishSpin(prizes[idx]), 4300);
  }

  function finishSpin(prize) {
    state.spin.spinning = false;
    state.spin.available -= 1;
    applyPrize(prize);
    renderSpin();
    triggerConfetti('spin');
    setText('spin-result-prize', prize.label);
    const overlay = document.getElementById('spin-result');
    if (overlay) overlay.classList.add('open');
  }

  function applyPrize(p) {
    const r = state.rewards;
    if (p.type === 'cashback') {
      r.voucher = { amount: p.value };
    } else if (p.type === 'points' || p.type === 'bonus') {
      r.points += p.value;
      r.lifetime += p.value;
      r.history.unshift({ label: 'স্পিন রিওয়ার্ড', points: p.value, date: todayBn() });
    } else if (p.type === 'delivery') {
      showToast('ফ্রি ডেলিভারি রিওয়ার্ড যোগ হয়েছে');
    }
    renderRewards();
  }

  function closeSpinResult() {
    const overlay = document.getElementById('spin-result');
    if (overlay) overlay.classList.remove('open');
    navigateTo('offer-points');
  }

  // ── Local Bazaar Community (Idea 3) ──
  function openBazaar() { renderBazaar(); navigateTo('bazaar'); }

  function joinBazaar() {
    state.bazaar.joined = true;
    showToast('আপনি ' + BAZAAR_GROUP.name + ' কমিউনিটিতে যোগ দিয়েছেন!');
    renderBazaar();
  }

  function joinChallenge(id) {
    state.bazaar.challenges[id] = true;
    showToast('চ্যালেঞ্জে অংশগ্রহণ নিশ্চিত হয়েছে');
    renderBazaar();
  }

  function challengeProgress(c) {
    if (c.tracksOrders) return Math.min(state.spin.orders, c.goal);
    return Math.min((c.base || 0) + (state.bazaar.challenges[c.id] ? 1 : 0), c.goal);
  }

  function renderBazaar() {
    const join = document.getElementById('bazaar-join');
    const dash = document.getElementById('bazaar-dashboard');
    if (join) join.style.display = state.bazaar.joined ? 'none' : 'block';
    if (dash) dash.style.display = state.bazaar.joined ? 'block' : 'none';

    setText('bazaar-join-name', BAZAAR_GROUP.name);
    setText('bazaar-join-members', toBn(BAZAAR_GROUP.members));
    setText('bazaar-group-name', BAZAAR_GROUP.name + ' কমিউনিটি');
    setText('bazaar-members-count', toBn(BAZAAR_GROUP.members) + ' জন রিটেইলার');
    setText('bazaar-rank', '#' + toBn(BAZAAR_GROUP.myRank));
    setText('bazaar-rank-shop', BAZAAR_GROUP.myShop);
    setText('bazaar-rank-change', '↑' + toBn(BAZAAR_GROUP.weekChange) + ' এই সপ্তাহে');

    const lead = document.getElementById('bazaar-leaders');
    if (lead) lead.innerHTML = BAZAAR_LEADERS.map(l => {
      const medal = l.rank <= 3 ? ['🥇', '🥈', '🥉'][l.rank - 1] : toBn(l.rank);
      return `<div class="bazaar-leader-row${l.me ? ' me' : ''}">
        <span class="bz-rank">${medal}</span>
        <div class="bz-leader-info"><div class="bz-leader-name">${l.name}${l.me ? ' (আপনি)' : ''}</div><div class="bz-leader-area">${l.area}</div></div>
        <span class="bz-score">${toBn(l.score.toLocaleString())}</span>
      </div>`;
    }).join('');

    const bg = document.getElementById('bazaar-badges');
    if (bg) bg.innerHTML = BAZAAR_BADGES.map(b => `
      <div class="bazaar-badge${b.earned ? ' earned' : ' locked'}">
        <i data-lucide="${b.earned ? b.icon : 'lock'}"></i><span>${b.label}</span>
      </div>`).join('');

    const ch = document.getElementById('bazaar-challenges');
    if (ch) ch.innerHTML = BAZAAR_CHALLENGES.map(c => {
      const prog = challengeProgress(c);
      const pct = Math.round((prog / c.goal) * 100);
      const joined = c.tracksOrders || state.bazaar.challenges[c.id];
      return `<div class="bazaar-challenge">
        <div class="bz-ch-top"><span class="bz-ch-label">${c.label}</span><span class="bz-ch-count">${toBn(prog)}/${toBn(c.goal)}</span></div>
        <div class="bz-ch-track"><div class="bz-ch-fill" style="width:${pct}%;background:${c.color}"></div></div>
        ${joined
          ? '<div class="bz-ch-joined"><i data-lucide="check" style="width:13px;height:13px"></i> অংশগ্রহণ করছেন</div>'
          : `<button class="bz-ch-btn" onclick="App.joinChallenge('${c.id}')">অংশগ্রহণ করুন</button>`}
      </div>`;
    }).join('');

    const cp = document.getElementById('bazaar-campaigns');
    if (cp) cp.innerHTML = BAZAAR_CAMPAIGNS.map(c => `
      <div class="bazaar-campaign">
        <div class="bz-camp-icon"><i data-lucide="${c.icon}" style="width:20px;height:20px"></i></div>
        <div><div class="bz-camp-title">${c.title}</div><div class="bz-camp-sub">${c.sub}</div></div>
      </div>`).join('');

    refreshIcons();
  }

  // ── Digital Bhai chat (Idea 2) ──
  function openBhai() {
    navigateTo('bhai');
    if (!state.bhai.seeded) {
      state.bhai.seeded = true;
      // Simulate connecting to a real agent, then a warm greeting.
      state.bhai.messages.push({ from: 'system', text: 'আপনাকে একজন সহকারীর সাথে যুক্ত করা হচ্ছে…' });
      renderBhai();
      setTimeout(() => {
        state.bhai.messages.push({ from: 'system', text: BHAI_AGENT.name + ' চ্যাটে যুক্ত হয়েছেন' });
        renderBhai();
        bhaiTypeThen('আসসালামু আলাইকুম ভাই! আমি ' + BHAI_AGENT.name.replace(' ভাই', '') + ', প্রিয়শপ থেকে। 🙂 চিন্তা করবেন না, আমি আপনার সাথেই আছি। কী নিয়ে সাহায্য লাগবে বলুন তো?', 1200);
      }, 1000);
    } else {
      renderBhai();
    }
  }

  function pushBhai(from, text, isVoice) {
    state.bhai.messages.push({ from, text, voice: !!isVoice });
    renderBhai();
  }

  // Show a typing indicator, then deliver the agent message.
  function bhaiTypeThen(text, delay) {
    state.bhai.typing = true;
    renderBhai();
    setTimeout(() => {
      state.bhai.typing = false;
      state.bhai.messages.push({ from: 'agent', text });
      renderBhai();
    }, delay || 1100);
  }

  // Agent replies with a spoken (voice) message — for retailers who can't read.
  function bhaiVoiceReplyThen(text, delay) {
    state.bhai.typing = true;
    renderBhai();
    setTimeout(() => {
      state.bhai.typing = false;
      state.bhai.messages.push({ from: 'agent', text, voiceReply: true });
      renderBhai();
      speakBn(text); // auto-play once
    }, delay || 1600);
  }

  // Bangla text-to-speech (browser); silent fallback if unsupported.
  function speakBn(text) {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'bn-BD';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  function playBhaiVoice(i) {
    const m = state.bhai.messages[i];
    if (m) speakBn(m.text);
  }

  // Simulated voice call with the agent.
  function callBhai() {
    const ov = document.getElementById('bhai-call');
    if (!ov) return;
    ov.classList.add('open');
    setText('bhai-call-status', 'কল করা হচ্ছে…');
    setText('bhai-call-timer', '');
    clearInterval(state.bhai.callTimer);
    let s = 0;
    setTimeout(() => {
      setText('bhai-call-status', '🟢 সংযুক্ত');
      state.bhai.callTimer = setInterval(() => {
        s++;
        const m = Math.floor(s / 60), sec = s % 60;
        setText('bhai-call-timer', toBn(String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')));
      }, 1000);
    }, 1600);
    refreshIcons();
  }

  function endBhaiCall() {
    clearInterval(state.bhai.callTimer);
    const ov = document.getElementById('bhai-call');
    if (ov) ov.classList.remove('open');
  }

  function sendBhaiText() {
    const input = document.getElementById('bhai-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    pushBhai('user', text);
    bhaiTypeThen(bhaiReply(text), 1100);
  }

  function sendBhaiQuick(text) {
    pushBhai('user', text);
    bhaiTypeThen(bhaiReply(text), 1100);
  }

  function sendBhaiVoice() {
    pushBhai('user', '🎤 ভয়েস নোট · ০:০৫', true);
    // Reply by voice too, since the retailer chose to speak (may not read well).
    bhaiVoiceReplyThen('জি ভাই, আপনার কথা শুনলাম। ' + bhaiReply('অর্ডার'), 1600);
  }

  function renderBhai() {
    setText('bhai-status', '🟢 অনলাইন · ' + BHAI_AGENT.sla);
    const list = document.getElementById('bhai-messages');
    if (list) {
      let html = state.bhai.messages.map((m, i) => {
        if (m.from === 'system') return `<div class="bhai-system">${m.text}</div>`;
        if (m.voiceReply) {
          return `<div class="bhai-msg agent bhai-voicereply" onclick="App.playBhaiVoice(${i})">
            <button class="bhai-play"><i data-lucide="volume-2" style="width:18px;height:18px;pointer-events:none"></i></button>
            <div class="bhai-voicereply-body"><span class="bhai-voicereply-label">🔊 ভয়েস উত্তর — শুনতে চাপুন</span><span class="bhai-voicereply-text">${m.text}</span></div>
          </div>`;
        }
        return `<div class="bhai-msg ${m.from}">${m.voice ? '<i data-lucide="mic" style="width:14px;height:14px;vertical-align:middle"></i> ' : ''}${m.text}</div>`;
      }).join('');
      if (state.bhai.typing) {
        html += `<div class="bhai-typing"><span class="bhai-typing-name">${BHAI_AGENT.name} লিখছেন</span><span class="bhai-dots"><i></i><i></i><i></i></span></div>`;
      }
      list.innerHTML = html;
      list.scrollTop = list.scrollHeight;
    }
    const quick = document.getElementById('bhai-quick');
    if (quick) {
      quick.innerHTML = BHAI_QUICK.map(q => `<button class="bhai-chip" onclick="App.sendBhaiQuick('${q}')">${q}</button>`).join('');
    }
    refreshIcons();
  }

  // ── Simple Mode (Idea 9) ──
  const SIMPLE_KEY = 'priyoshop_simple_mode';

  function loadSimpleMode() {
    try { state.simpleMode = localStorage.getItem(SIMPLE_KEY) === '1'; } catch (e) { /* ignore */ }
    applySimpleClass();
    syncSimpleToggle();
  }

  function applySimpleClass() {
    const screen = document.querySelector('.phone-screen');
    if (screen) screen.classList.toggle('simple-mode', state.simpleMode);
  }

  function syncSimpleToggle() {
    const t = document.getElementById('simple-mode-toggle');
    if (t) t.classList.toggle('on', state.simpleMode);
  }

  function setSimpleMode(on) {
    state.simpleMode = on;
    try { localStorage.setItem(SIMPLE_KEY, on ? '1' : '0'); } catch (e) { /* ignore */ }
    applySimpleClass();
    syncSimpleToggle();
    state.screenHistory = [];
    if (on) {
      navigateTo('simple-home');
      setTimeout(() => showToast('আপনি এখন Simple Mode ব্যবহার করছেন'), 300);
    } else {
      navigateTo('home');
    }
  }

  function toggleSimpleMode() {
    setSimpleMode(!state.simpleMode);
  }

  function openSimpleHelp() {
    const o = document.getElementById('simple-help-overlay');
    const s = document.getElementById('simple-help-sheet');
    if (o) o.classList.add('open');
    if (s) s.classList.add('open');
  }
  function closeSimpleHelp() {
    const o = document.getElementById('simple-help-overlay');
    const s = document.getElementById('simple-help-sheet');
    if (o) o.classList.remove('open');
    if (s) s.classList.remove('open');
  }

  // ── Expose API ──
  window.App = {
    navigateTo,
    goBack,
    changeQty,
    removeFromCart,
    addToCart,
    openCartItemDetail,
    openBottomSheet,
    closeBottomSheet,
    toggleDrawer,
    closeDrawer,
    openModifyOrder,
    confirmModify,
    cancelOrder,
    lockOrder,
    selectIssue,
    submitReport,
    saveDeliveryNote,
    addPhotoEvidence,
    startReorder,
    reorderChangeQty,
    swapAlternative,
    removeReorderItem,
    reorderOpenDetail,
    proceedReorderCheckout,
    redeem,
    startVoiceOrder,
    grantVoicePermission,
    denyVoicePermission,
    runVoiceTranscript,
    stopVoiceListening,
    voiceChangeQty,
    voicePickSuggestion,
    voiceRemove,
    voiceOpenDetail,
    voiceAddToCart,
    closeVoiceOverlay,
    setSimpleMode,
    toggleSimpleMode,
    openSimpleHelp,
    closeSimpleHelp,
    openSpin,
    doSpin,
    demoUnlockSpin,
    closeSpinResult,
    openBazaar,
    joinBazaar,
    joinChallenge,
    openBhai,
    sendBhaiText,
    sendBhaiQuick,
    sendBhaiVoice,
    playBhaiVoice,
    callBhai,
    endBhaiCall
  };

})();
