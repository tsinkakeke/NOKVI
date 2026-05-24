/**
 * main.js — Entry point (type="module")
 * Handles: shop page, gallery page, tutorials page, cart, nav
 */

import { fetchVideos, debounce } from './api.js';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 'p1', name: 'Hand-Knit Merino Beanie', category: 'handmade',
    price: 38, image: 'assets/beanie.jpg',
    desc: 'Soft merino wool beanie, hand-knit in a 2×2 rib stitch. Available in cream, charcoal, and sage.',
    tags: ['Knitting', 'Accessories'],
  },
  {
    id: 'p2', name: 'Crochet Sunflower Tote', category: 'handmade',
    price: 54, image: 'assets/tote_bag.jpg',
    desc: 'Chunky cotton tote with a crochet sunflower motif. Fully lined inside.',
    tags: ['Crochet', 'Bags'],
  },
  {
    id: 'p3', name: 'Alpaca Blend Yarn — 100g', category: 'yarn',
    price: 12, image: 'assets/alpacayarn.jpg',
    desc: '80% alpaca / 20% nylon. Incredibly soft, great for hats, scarves and baby items.',
    tags: ['Yarn', 'Alpaca'],
  },
  {
    id: 'p4', name: 'Merino DK Yarn — 200g', category: 'yarn',
    price: 18, image: 'assets/merinoyarn.jpg',
    desc: 'Super wash merino in DK weight. Machine washable, dozens of colours available.',
    tags: ['Yarn', 'Merino'],
  },
  {
    id: 'p5', name: 'Crochet Hook Set (9 hooks)', category: 'tools',
    price: 22, image: 'assets/hooks.jpg',
    desc: 'Ergonomic handles, sizes 2mm–10mm. Perfect for beginners and experienced makers alike.',
    tags: ['Tools', 'Crochet'],
  },
  {
    id: 'p6', name: 'Bamboo Knitting Needles — Set of 5', category: 'tools',
    price: 15, image: 'assets/needles.jpg',
    desc: 'Smooth bamboo double-pointed needles, sizes US 1–7. Lightweight and easy on the hands.',
    tags: ['Tools', 'Knitting'],
  },
  {
    id: 'p7', name: 'Beginner Crochet Starter Kit', category: 'tools',
    price: 35, image: 'assets/setcrochet.jpg',
    desc: 'Everything you need to start: 5 hooks, stitch markers, tapestry needles, scissors and a guide.',
    tags: ['Tools', 'Beginner'],
  },
  {
    id: 'p8', name: 'Cosy Socks Knitting Pattern PDF', category: 'patterns',
    price: 4.50, image: 'assets/socks.jpg',
    desc: 'Downloadable PDF pattern for toe-up knit socks. Written for DK weight yarn, sizes S/M/L.',
    tags: ['Pattern', 'PDF'],
  },
  {
    id: 'p9', name: 'Granny Square Blanket Pattern PDF', category: 'patterns',
    price: 6, image: 'assets/grannysquare.jpg',
    desc: 'Step-by-step crochet pattern for a classic granny square throw. 12 colour combinations included.',
    tags: ['Pattern', 'PDF'],
  },
  {
    id: 'p10', name: 'Amigurumi Forest Animals Set', category: 'handmade',
    price: 72, image: 'assets/amigurumi.jpg',
    desc: 'A set of 3 hand-crocheted amigurumi: fox, bear, and bunny. Filled with hypoallergenic stuffing.',
    tags: ['Crochet', 'Amigurumi'],
  },
];

// ─── STATE ────────────────────────────────────────────────────────────────────

/** @type {{ id: string, name: string, price: number, emoji: string }[]} */
let cart = loadCart();

/** @type {{ id: string, title: string, type: string, desc: string, emoji: string, forSale: boolean, price: number | null }[]} */
let galleryItems = loadGallery();

/** @type {{ id: string, title: string, channel: string, description: string, thumbnail: string | null, url: string }[]} */
let currentVideos = [];

let activeFilter = 'all';
let lastVideoQuery = 'knitting crochet beginner tutorial';

// ─── UTILS ────────────────────────────────────────────────────────────────────

/** Generate a short unique id */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Format price as USD */
function formatPrice(num) {
  return `$${Number(num).toFixed(2)}`;
}

/** Show toast notification */
function showToast(message, type = 'default') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ─── localStorage HELPERS ─────────────────────────────────────────────────────

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('kn_cart')) || [];
  } catch { return []; }
}

function saveCart() {
  localStorage.setItem('kn_cart', JSON.stringify(cart));
}

function loadGallery() {
  try {
    return JSON.parse(localStorage.getItem('kn_gallery')) || [];
  } catch { return []; }
}

function saveGallery() {
  localStorage.setItem('kn_gallery', JSON.stringify(galleryItems));
}

// ─── CART ─────────────────────────────────────────────────────────────────────

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function updateCartCount() {
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = cart.length;
  });
}



function addToCart(product) {
  cart.push({
    id: uid(),
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image
  });


  saveCart();
  updateCartCount();

  showToast(`"${product.name}" added to cart!`, 'success');
}




function removeFromCart(cartItemId) {
  cart = cart.filter(item => item.id !== cartItemId);
  saveCart();
  updateCartCount();
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cart-empty';
    empty.textContent = 'Your cart is empty 🧶';
    container.appendChild(empty);
  } else {
    cart.forEach(item => {
      const el = createCartItemEl(item);
      container.appendChild(el);
    });
  }

  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

/** Closure: each remove button closes over its cartItemId */
function createCartItemEl(item) {
  const el = document.createElement('div');
  el.className = 'cart-item';

  el.innerHTML = `
    <img class="cart-item__image" src="${item.image}" alt="${item.name}">

    <div class="cart-item__info">
      <div class="cart-item__name">${item.name}</div>
      <div class="cart-item__price">${formatPrice(item.price)}</div>
    </div>

    <button class="cart-item__remove"
      aria-label="Remove ${item.name} from cart">
      ✕
    </button>
  `;

  const removeBtn = el.querySelector('.cart-item__remove');

  removeBtn.addEventListener('click', () =>
    removeFromCart(item.id)
  );

  return el;
}

function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (!sidebar) return;
  renderCartItems();
  sidebar.classList.add('open');
  overlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar?.classList.remove('open');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── PRODUCTS / SHOP ──────────────────────────────────────────────────────────

function getFilteredProducts() {
  if (activeFilter === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === activeFilter);
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('data-category', product.category);

  const tagsHTML = product.tags.map(t => `<span class="tag">${t}</span>`).join('');

  card.innerHTML = `
     <div class="product-card__image">
        <img src="${product.image}" alt="${product.name}">
     </div>
    <div class="product-card__body">
      <div class="product-card__tags">${tagsHTML}</div>
      <h3 class="product-card__name">${product.name}</h3>
      <p class="product-card__desc">${product.desc}</p>
      <div class="product-card__footer">
        <span class="product-card__price">${formatPrice(product.price)}</span>
        <button class="btn btn--accent btn--sm add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  `;

  // Closure: click handler closes over `product`
  card.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product));
  return card;
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--color-text-muted);font-style:italic;">No products in this category yet.</p>';
    return;
  }

  filtered.forEach((product, i) => {
    const card = createProductCard(product);
    card.style.animationDelay = `${i * 0.06}s`;
    grid.appendChild(card);
  });
}

function initFilterBar() {
  const bar = document.getElementById('filterBar');
  if (!bar) return;

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderProducts();
  });
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────

const GALLERY_EMOJIS = {
  knitting: '🧶',
  crochet: '🪡',
  both: '✨',
};

function createGalleryCard(item) {
  const card = document.createElement('article');
  card.className = 'gallery-card';

  card.innerHTML = `
    <div class="gallery-card__img">
      <img src="${item.image}" alt="${item.title}">
    </div>

    <div class="gallery-card__body">
      <h3 class="gallery-card__title">${item.title}</h3>

      <p class="gallery-card__meta">
        ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        ${item.hours ? ` · ${item.hours}h` : ''}
        ${item.yarn ? ` · ${item.yarn}` : ''}
        ${item.forSale
      ? ` · <strong style="color:var(--color-success)">For Sale ${item.price ? formatPrice(item.price) : ''}</strong>`
      : ''}
      </p>

      <p style="font-size:0.85rem;color:var(--color-text-muted);margin-top:0.4rem;">
        ${item.desc}
      </p>

      ${item.patternFile
      ? `<a href="${item.patternFile}" target="_blank" class="btn btn--outline btn--sm">
      View Pattern File
          </a>`
      : ''}
      <button class="btn btn--sm delete-gallery-btn">
        Delete
      </button>
    </div>
  `;

  card.querySelector('.delete-gallery-btn')
    .addEventListener('click', () => {
      galleryItems = galleryItems.filter(g => g.id !== item.id);
      saveGallery();
      renderGallery();
      showToast('Item deleted', 'success');
    });

  return card;
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (galleryItems.length === 0) {
    grid.innerHTML = '<p style="color:var(--color-text-muted);font-style:italic;font-family:var(--font-display);">No pieces yet — be the first to add one above!</p>';
    return;
  }

  galleryItems.forEach((item, i) => {
    const card = createGalleryCard(item);
    card.style.animationDelay = `${i * 0.07}s`;
    grid.appendChild(card);
  });
}

// ─── UPLOAD FORM ──────────────────────────────────────────────────────────────

function validateUploadForm(formEl) {
  let valid = true;

  const clearError = id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  };
  const setError = (inputId, errorId, msg) => {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (err) err.textContent = msg;
    valid = false;
  };

  clearError('workTitleError');
  clearError('workTypeError');
  clearError('workDescError');
  document.querySelectorAll('#uploadForm .error').forEach(el => el.classList.remove('error'));

  const title = formEl.workTitle.value.trim();
  const type = formEl.workType.value;
  const desc = formEl.workDesc.value.trim();

  if (title.length < 3) setError('workTitle', 'workTitleError', 'Title must be at least 3 characters.');
  if (!type) setError('workType', 'workTypeError', 'Please select a craft type.');
  if (desc.length < 10) setError('workDesc', 'workDescError', 'Description must be at least 10 characters.');

  return valid;
}

function showFormFeedback(message, type) {
  const fb = document.getElementById('uploadFeedback');
  if (!fb) return;
  fb.textContent = message;
  fb.className = `form-feedback ${type}`;
}

function initUploadForm() {
  const form = document.getElementById('uploadForm');
  if (!form) return;

  // Show/hide price field based on checkbox — change event
  const forSaleCheck = document.getElementById('workForSale');
  const priceGroup = document.getElementById('priceGroup');
  if (forSaleCheck && priceGroup) {
    forSaleCheck.addEventListener('change', () => {
      priceGroup.style.display = forSaleCheck.checked ? 'flex' : 'none';
    });
  }

  // Reset form button — click event
  document.getElementById('resetFormBtn')?.addEventListener('click', () => {
    form.reset();
    if (priceGroup) priceGroup.style.display = 'none';
    showFormFeedback('', '');
    document.querySelectorAll('#uploadForm .error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('#uploadForm .field-error').forEach(el => { el.textContent = ''; });
  });

  // Form submit — submit event with e.preventDefault()
  form.addEventListener('submit', e => {
    e.preventDefault();

    if (!validateUploadForm(form)) {
      showFormFeedback('Please fix the errors above.', 'error');
      return;
    }
    const imageFile = document.getElementById('workImage').files[0];
    const newItem = {
      id: uid(),
      title: form.workTitle.value.trim(),
      type: form.workType.value,
      image: URL.createObjectURL(imageFile),
      hours: form.workHours.value || null,
      yarn: form.workYarn.value.trim() || null,
      desc: form.workDesc.value.trim(),
      forSale: form.workForSale.checked,
      price: form.workForSale.checked && form.workPrice.value ? parseFloat(form.workPrice.value) : null,
    };

    galleryItems.unshift(newItem);
    saveGallery();
    renderGallery();

    showFormFeedback(`✨ "${newItem.title}" has been added to your gallery!`, 'success');
    form.reset();
    if (priceGroup) priceGroup.style.display = 'none';
    showToast('Work added to gallery!', 'success');

    // Scroll to gallery
    document.getElementById('galleryGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ─── TUTORIALS / YOUTUBE ──────────────────────────────────────────────────────

function showLoading(show) {
  const el = document.getElementById('loadingState');
  if (!el) return;
  el.classList.toggle('visible', show);
}

function showError(show, message = '') {
  const el = document.getElementById('errorState');
  const msg = document.getElementById('errorMsg');
  if (!el) return;
  el.classList.toggle('visible', show);
  if (msg && message) msg.textContent = message;
}

function createVideoCard(video) {
  const card = document.createElement('article');
  card.className = 'video-card';

  const thumbHTML = video.thumbnail
    ? `<img src="${video.thumbnail}" alt="${video.title} thumbnail" loading="lazy" />`
    : `<img src="assets/basket_of_yarn.jpg" alt="Tutorial thumbnail" />`;
  card.innerHTML = `
    <a href="${video.url}" target="_blank" rel="noopeners noreferrer" aria-label="Watch ${video.title} on YouTube">
      <div class="video-card__thumb">
        ${thumbHTML}
        <div class="video-card__play">
          <div class="video-card__play-icon">▶</div>
        </div>
      </div>
    </a>
    <div class="video-card__body">
      <p class="video-card__channel">${video.channel}</p>
      <h3 class="video-card__title">${video.title}</h3>
      <p class="video-card__desc">${video.description}</p>
    </div>
  `;
  return card;
}

function renderVideos(videos) {
  const grid = document.getElementById('videosGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (videos.length === 0) {
    grid.innerHTML = '<p style="color:var(--color-text-muted);font-style:italic;">No videos found. Try a different search.</p>';
    return;
  }

  videos.forEach((video, i) => {
    const card = createVideoCard(video);
    card.style.animationDelay = `${i * 0.07}s`;
    grid.appendChild(card);
  });
}

async function loadVideos(query) {
  lastVideoQuery = query;
  showLoading(true);
  showError(false);
  const grid = document.getElementById('videosGrid');
  if (grid) grid.innerHTML = '';

  try {
    const videos = await fetchVideos(query, 9);
    currentVideos = videos;
    renderVideos(videos);
  } catch (err) {
    showError(true, `Could not load videos: ${err.message}`);
  } finally {
    showLoading(false);
  }
}

function initTutorialsPage() {
  const searchInput = document.getElementById('tutorialSearch');
  const searchBtn = document.getElementById('searchBtn');
  const quickBar = document.getElementById('quickSearchBar');
  const retryBtn = document.getElementById('retryBtn');

  if (!searchInput) return;

  // Debounced input handler (closure in api.js)
  const debouncedSearch = debounce(query => {
    if (query.trim()) loadVideos(query.trim());
  }, 500);

  // input event — fires on every keystroke, debounced
  searchInput.addEventListener('input', () => debouncedSearch(searchInput.value));

  // keydown event — Enter key fires immediately
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) loadVideos(q);
    }
  });

  // click event — search button
  searchBtn?.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q) loadVideos(q);
  });

  // Quick-search filter bar — click event
  quickBar?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    quickBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const query = btn.dataset.query;
    searchInput.value = '';
    loadVideos(query);
  });

  // Retry button — click event
  retryBtn?.addEventListener('click', () => loadVideos(lastVideoQuery));

  // Load default videos on page load
  loadVideos(lastVideoQuery);
}

// ─── NAV / HAMBURGER ──────────────────────────────────────────────────────────

function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close nav on link click (mobile)
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

function initCartNav() {
  const openBtn = document.getElementById('cartOpenBtn');
  const closeBtn = document.getElementById('cartCloseBtn');
  const overlay = document.getElementById('cartOverlay');

  openBtn?.addEventListener('click', e => { e.preventDefault(); openCart(); });
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);

  // Keyboard: close cart on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });

  // Checkout button
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
    showToast('Thank you for your order! 🧶', 'success');
    cart = [];
    saveCart();
    updateCartCount();
    renderCartItems();
    closeCart();
  });
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────

function init() {
  initNav();
  initCartNav();
  updateCartCount();

  // Shop page
  if (document.getElementById('productsGrid')) {
    renderProducts();
    initFilterBar();
  }

  // Gallery page
  if (document.getElementById('galleryGrid')) {
    renderGallery();
    initUploadForm();
  }

  // Tutorials page
  if (document.getElementById('videosGrid')) {
    initTutorialsPage();
  }
}

init();
