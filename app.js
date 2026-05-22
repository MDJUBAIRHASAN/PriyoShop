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
    screenHistory: []
  };

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
    adjustScale();
    window.addEventListener('resize', adjustScale);
    navigateTo('home');
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
    const screens = document.querySelectorAll('.screen');
    const current = document.querySelector('.screen.active');
    const target = document.getElementById('screen-' + screenId);

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

        if (el.dataset.categoryTarget) {
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
                            document.getElementById('detail-price').innerText = '৳' + price.toLocaleString();
                            document.getElementById('detail-weight').innerText = '(' + weight + ')';
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

    // Show/hide bottom nav
    const bottomNav = document.querySelector('.bottom-nav');
    const screensWithNav = ['home', 'search', 'categories', 'cart', 'product-detail'];
    if (bottomNav) {
      bottomNav.style.display = mainScreens.includes(screenId) ? 'flex' : 'none';
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

  // ── Cart Logic ──
  function renderCart() {
    const cartList = document.getElementById('cart-items-list');
    if (!cartList) return;

    cartList.innerHTML = state.cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image" style="background:#f5f5f5;overflow:hidden;">
          <img src="${item.image || './images/rice_akij.png'}" style="width:100%;height:100%;object-fit:cover;" alt="">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-weight">ওজনঃ ${item.weight} • <span class="cart-item-price">৳${item.price.toLocaleString()}.0</span></div>
          <div class="cart-item-qty-badge">আইটেমঃ ${item.qty}</div>
          <div class="cart-item-qty">
            <div class="qty-selector">
              <button class="qty-btn" onclick="App.changeQty(${item.id}, -1)"><i data-lucide="minus" style="width:13px;height:13px;pointer-events:none"></i></button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" onclick="App.changeQty(${item.id}, 1)"><i data-lucide="plus" style="width:13px;height:13px;pointer-events:none"></i></button>
            </div>
          </div>
        </div>
        <button class="cart-item-delete" onclick="App.removeFromCart(${item.id})"><i data-lucide="trash-2" style="width:16px;height:16px;pointer-events:none"></i></button>
      </div>
    `).join('');

    updateCartSummary();
    updateCartBadge();
    renderCheckout();
    renderOrderDetail();
    renderOrderRepeat();
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
    const netTotal = total + shipping + discount;

    const summaryEl = document.getElementById('cart-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="cart-summary-row"><span>সর্বমোট বিল</span><span>৳${total.toLocaleString()}</span></div>
        <div class="cart-summary-row"><span>ডেলিভারি চার্জ</span><span>+৳০</span></div>
        <div class="cart-summary-row"><span>ডিসকাউন্ট</span><span>-৳৮০</span></div>
        <div class="cart-summary-row total"><span>সর্বমোট</span><span>৳${netTotal.toLocaleString()}</span></div>
      `;
    }
  }

  function updateCartBadge() {
    const totalItems = state.cartItems.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
    });
    document.querySelectorAll('.header-action-btn .badge').forEach(badge => {
      badge.textContent = totalItems;
    });
  }

  function renderCheckout() {
    const checkoutItems = document.getElementById('checkout-items');
    if (!checkoutItems) return;

    const total = getCartTotal();
    const discount = -80;
    const delivery = 80;
    const net = total + discount + delivery;

    checkoutItems.innerHTML = state.cartItems.map(item => `
      <div class="checkout-item-row">
        <span class="item-name">${item.name}-${item.weight}(${item.qty})</span>
        <span class="item-price">৳${(item.price * item.qty).toLocaleString()}</span>
      </div>
    `).join('');

    const checkoutTotals = document.getElementById('checkout-totals');
    if (checkoutTotals) {
      checkoutTotals.innerHTML = `
        <div class="checkout-total-row"><span>সর্বমোট বিল</span><span>৳${total.toLocaleString()}</span></div>
        <div class="checkout-total-row"><span>ডিসকাউন্ট</span><span>-৳৮০</span></div>
        <div class="checkout-total-row"><span>ডেলিভারি চার্জ</span><span>+৳${delivery}</span></div>
        <div class="checkout-total-row final"><span>মোট মূল্য</span><span>৳${net.toLocaleString()}</span></div>
      `;
    }
  }

  function renderOrderDetail() {
    const el = document.getElementById('order-detail-items');
    if (!el) return;
    el.innerHTML = state.cartItems.map(item => `
      <div class="cart-item">
        <div class="cart-item-image" style="background:#f5f5f5;overflow:hidden;">
          <img src="${item.image || './images/rice_akij.png'}" style="width:100%;height:100%;object-fit:cover;" alt="">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name" style="font-family:var(--font-en)">${item.nameEn}</div>
          <div class="cart-item-price">• ৳${(item.price * item.qty).toLocaleString()} টাকা</div>
        </div>
        <div class="qty-value" style="position:absolute;right:16px;bottom:16px;border:1px solid #e0e0e0;border-radius:6px;padding:4px 14px;font-size:13px">${item.qty}</div>
      </div>
    `).join('');
    refreshIcons();
  }

  function renderOrderRepeat() {
    const el = document.getElementById('repeat-items-list');
    if (!el) return;
    el.innerHTML = state.cartItems.map(item => `
      <div class="repeat-item">
        <div class="repeat-item-image" style="background:#f5f5f5;overflow:hidden;">
          <img src="${item.image || './images/rice_akij.png'}" style="width:100%;height:100%;object-fit:cover;" alt="">
        </div>
        <div class="repeat-item-details">
          <div class="repeat-item-name">${item.name}</div>
          <div class="repeat-item-info">${item.weight} • <span class="repeat-item-price">৳${item.price.toLocaleString()}</span></div>
          <div class="cart-item-qty" style="margin-top:8px">
            <div class="qty-selector">
              <button class="qty-btn"><i data-lucide="minus" style="width:13px;height:13px"></i></button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn"><i data-lucide="plus" style="width:13px;height:13px"></i></button>
            </div>
          </div>
        </div>
        <button class="repeat-item-delete"><i data-lucide="trash-2" style="width:16px;height:16px"></i></button>
      </div>
    `).join('');
    refreshIcons();
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

  // ── Expose API ──
  window.App = {
    navigateTo,
    goBack,
    changeQty,
    removeFromCart,
    addToCart,
    openBottomSheet,
    closeBottomSheet,
    toggleDrawer,
    closeDrawer
  };

})();
