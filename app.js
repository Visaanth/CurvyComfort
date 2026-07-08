/**
 * Curvy Comfort - Premium Luxury Fashion App Logic
 */

const ASSET_VERSION = '3';
const CATALOG_VERSION = '3';

function productImageSrc(image) {
  if (!image) return '';
  if (image.startsWith('data:')) return image;
  const separator = image.includes('?') ? '&' : '?';
  return `${image}${separator}v=${ASSET_VERSION}`;
}

function defaultImageSrc(path) {
  return productImageSrc(path);
}

// --- INITIAL MOCK PRODUCTS DATABASE ---
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Vibrant Maroon Anarkali Set',
    price: 3499,
    originalPrice: 4299,
    category: 'ethnic',
    rating: 4.9,
    reviewsCount: 124,
    image: '/ethnic_wear.png',
    badge: 'Best Seller',
    isNew: false
  },
  {
    id: 'p2',
    name: 'Floral Cotton Kurta Set',
    price: 1599,
    originalPrice: 1999,
    category: 'casual',
    rating: 4.7,
    reviewsCount: 86,
    image: '/casual_wear.png',
    badge: '',
    isNew: true
  },
  {
    id: 'p3',
    name: 'Royal Red & Gold Lehenga',
    price: 4599,
    originalPrice: 5999,
    category: 'party',
    rating: 5.0,
    reviewsCount: 62,
    image: '/party_wear.png',
    badge: 'Exclusive',
    isNew: false
  },
  {
    id: 'p5',
    name: 'Emerald Green Ready-Made Blouse',
    price: 1499,
    originalPrice: 1899,
    category: 'blouse',
    rating: 4.9,
    reviewsCount: 93,
    image: '/readymade_blouse.png',
    badge: 'Sale',
    isNew: true
  },
  {
    id: 'p6',
    name: 'Cotton Motif Loungewear Co-ord Set',
    price: 2299,
    originalPrice: 2799,
    category: 'loungewear',
    rating: 4.6,
    reviewsCount: 78,
    image: '/loungewear.png',
    badge: '',
    isNew: false
  },
  {
    id: 'p7',
    name: 'Golden Embroidered Kurti',
    price: 2199,
    originalPrice: 2599,
    category: 'ethnic',
    rating: 4.8,
    reviewsCount: 110,
    image: '/ethnic_wear.png',
    badge: '',
    isNew: true
  },
  {
    id: 'p8',
    name: 'Printed Cotton Kurta & Palazzo',
    price: 1899,
    originalPrice: 2299,
    category: 'casual',
    rating: 4.7,
    reviewsCount: 57,
    image: '/casual_wear.png',
    badge: '',
    isNew: false
  }
];

// --- APP STATE ---
let productsDatabase = [];
let cart = [];
let wishlist = [];
let recentlyViewed = [];
let currentCategory = 'all';

// --- ADMIN CREDENTIALS ---
const ADMIN_EMAIL = 'admin@curvycomfort@gmail.com';
const ADMIN_PASSWORD = 'CurComf2026';

// --- DOM ELEMENTS ---
const productGrid = document.getElementById('product-grid');
const newArrivalsGrid = document.getElementById('new-arrivals-grid');
const cartCount = document.getElementById('cart-count');
const wishlistCount = document.getElementById('wishlist-count');
const cartDrawer = document.getElementById('cart-drawer');
const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
const cartDrawerBody = document.getElementById('cart-drawer-body');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartTrigger = document.getElementById('cart-trigger');
const wishlistDrawer = document.getElementById('wishlist-drawer');
const wishlistDrawerBackdrop = document.getElementById('wishlist-drawer-backdrop');
const wishlistDrawerBody = document.getElementById('wishlist-drawer-body');
const wishlistCloseBtn = document.getElementById('wishlist-close-btn');
const wishlistTrigger = document.getElementById('wishlist-trigger');
const searchDrawer = document.getElementById('search-drawer');
const searchDrawerBackdrop = document.getElementById('search-drawer-backdrop');
const searchCloseBtn = document.getElementById('search-close-btn');
const searchTrigger = document.getElementById('search-trigger');
const searchInput = document.getElementById('search-bar-input');
const searchResultsBody = document.getElementById('search-results-body');
const searchResultsHeading = document.getElementById('search-results-heading');
const checkoutWhatsappBtn = document.getElementById('checkout-whatsapp-btn');
const cartTotalPrice = document.getElementById('cart-total-price');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.getElementById('nav-menu');
const header = document.getElementById('main-header');

// Sticky Cart Bar
const stickyCartBar = document.getElementById('sticky-cart-bar');
const stickyBarImg = document.getElementById('sticky-bar-img');
const stickyBarTitle = document.getElementById('sticky-bar-title');
const stickyBarPrice = document.getElementById('sticky-bar-price');
const stickyBarBuyBtn = document.getElementById('sticky-bar-buy-btn');

// Admin Elements
const adminLoginLink = document.getElementById('admin-login-link');
const adminLoginModal = document.getElementById('admin-login-modal-backdrop');
const adminLoginClose = document.getElementById('admin-login-modal-close');
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginError = document.getElementById('admin-login-error');
const adminEmailInput = document.getElementById('admin-email-input');
const adminPasswordInput = document.getElementById('admin-password-input');

const adminProductModal = document.getElementById('admin-product-modal-backdrop');
const adminProductClose = document.getElementById('admin-product-modal-close');
const adminProductForm = document.getElementById('admin-product-form');
const adminAddProductTrigger = document.getElementById('admin-add-product-trigger');
const adminActionBar = document.getElementById('admin-action-bar');
const productEditorTitle = document.getElementById('product-editor-title');
const productEditorTag = document.getElementById('product-editor-tag');
const editProductId = document.getElementById('edit-product-id');
const productFormSubmitBtn = document.getElementById('product-form-submit-btn');

// Admin product form inputs
const inputProdName = document.getElementById('prod-name');
const inputProdPrice = document.getElementById('prod-price');
const inputProdCategory = document.getElementById('prod-category');
const inputProdBadge = document.getElementById('prod-badge');
const inputProdImageFile = document.getElementById('prod-image-file');
const inputProdImageBase64 = document.getElementById('prod-image-base64');
const imagePreviewContainer = document.getElementById('image-preview-container');
const uploadedImagePreview = document.getElementById('uploaded-image-preview');

// Branding Image Manager elements
const adminBrandingTrigger = document.getElementById('admin-branding-trigger');
const adminBrandingModal = document.getElementById('admin-branding-modal-backdrop');
const adminBrandingClose = document.getElementById('admin-branding-modal-close');
const adminBrandingForm = document.getElementById('admin-branding-form');
const inputBrandLogoFile = document.getElementById('brand-logo-file');
const inputBrandLogoBase64 = document.getElementById('brand-logo-base64');
const logoPreviewBox = document.getElementById('logo-preview-box');
const brandingLogoPreview = document.getElementById('branding-logo-preview');

const inputBrandHeroFile = document.getElementById('brand-hero-file');
const inputBrandHeroBase64 = document.getElementById('brand-hero-base64');
const heroPreviewBox = document.getElementById('hero-preview-box');
const brandingHeroPreview = document.getElementById('branding-hero-preview');
const resetBrandingBtn = document.getElementById('reset-branding-btn');

// --- INIT APP ---
document.addEventListener('DOMContentLoaded', async () => {
  loadLocalCartAndWishlist();
  
  // Apply cached/saved visuals immediately
  applyBrandingVisuals();
  
  // Fetch latest data from server
  await Promise.all([
    fetchProducts(),
    fetchBranding()
  ]);

  checkAdminSession();
  renderProducts();
  renderNewArrivals();
  updateHeaderState();
  initAdminListeners();
  initBrandingListeners();
  initAnalyticsTracking();
});

// --- BACKEND AND LOCAL STORAGE DATA LOAD ---
function loadLocalCartAndWishlist() {
  const storedCart = localStorage.getItem('curvy_comfort_cart');
  const storedWishlist = localStorage.getItem('curvy_comfort_wishlist');
  const storedRecent = localStorage.getItem('curvy_comfort_recent');

  if (storedCart) cart = JSON.parse(storedCart);
  if (storedWishlist) wishlist = JSON.parse(storedWishlist);
  if (storedRecent) recentlyViewed = JSON.parse(storedRecent);
}

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch catalog');
    productsDatabase = await response.json();
    
    // Filter cart/wishlist/recent to only contain items present in the backend catalog
    cart = cart.filter(item => productsDatabase.some(p => p.id === item.id));
    wishlist = wishlist.filter(item => productsDatabase.some(p => p.id === item.id));
    recentlyViewed = recentlyViewed.filter(item => productsDatabase.some(p => p.id === item.id));
    
    updateCounts();
    renderRecentlyViewed();
  } catch (err) {
    console.error('Error loading catalog from backend:', err);
    // Fallback to DEFAULT_PRODUCTS in case backend is offline
    productsDatabase = [...DEFAULT_PRODUCTS];
  }
}

async function fetchBranding() {
  try {
    const response = await fetch('/api/branding');
    if (!response.ok) throw new Error('Failed to load branding settings');
    const branding = await response.json();
    
    if (branding.brand_logo) {
      localStorage.setItem('curvy_comfort_brand_logo', branding.brand_logo);
    } else {
      localStorage.removeItem('curvy_comfort_brand_logo');
    }
    
    if (branding.brand_hero) {
      localStorage.setItem('curvy_comfort_brand_hero', branding.brand_hero);
    } else {
      localStorage.removeItem('curvy_comfort_brand_hero');
    }
    
    applyBrandingVisuals();
  } catch (err) {
    console.error('Error fetching branding settings:', err);
    applyBrandingVisuals();
  }
}

function saveData() {
  localStorage.setItem('curvy_comfort_cart', JSON.stringify(cart));
  localStorage.setItem('curvy_comfort_wishlist', JSON.stringify(wishlist));
  localStorage.setItem('curvy_comfort_recent', JSON.stringify(recentlyViewed));
  updateCounts();
}

function updateCounts() {
  cartCount.innerText = cart.reduce((total, item) => total + item.quantity, 0);
  wishlistCount.innerText = wishlist.length;
}

// --- APPLY BRAND CUSTOM VISUALS ---
function applyBrandingVisuals() {
  const customLogo = localStorage.getItem('curvy_comfort_brand_logo');
  const customHero = localStorage.getItem('curvy_comfort_brand_hero');
  const faviconLink = document.getElementById('favicon-link');

  if (customLogo) {
    document.querySelectorAll('.brand-logo-element').forEach(el => {
      el.src = customLogo;
    });
    if (faviconLink) faviconLink.href = customLogo;
  }

  if (customHero) {
    const heroEl = document.getElementById('brand-hero-element');
    if (heroEl) heroEl.src = customHero;
  }
}

// --- ADMIN STATE & LOGIN SESSION LOGIC ---
function checkAdminSession() {
  const isAdminActive = localStorage.getItem('curvy_comfort_admin_active') === 'true';
  if (isAdminActive) {
    enableAdminMode();
  } else {
    disableAdminMode();
  }
}

function enableAdminMode() {
  document.body.classList.add('admin-mode');
  if (adminActionBar) adminActionBar.style.display = 'block';
  if (adminLoginLink) {
    adminLoginLink.innerHTML = '🔓 Log Out Admin';
    adminLoginLink.style.color = '#25D366'; // Highlight in green
  }
}

function disableAdminMode() {
  document.body.classList.remove('admin-mode');
  if (adminActionBar) adminActionBar.style.display = 'none';
  if (adminLoginLink) {
    adminLoginLink.innerHTML = '🔐 Admin Access';
    adminLoginLink.style.color = '';
  }
}

function initAdminListeners() {
  // Toggle Login Modal from Footer link
  if (adminLoginLink) {
    adminLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      const isAdminActive = localStorage.getItem('curvy_comfort_admin_active') === 'true';
      if (isAdminActive) {
        localStorage.removeItem('curvy_comfort_admin_active');
        disableAdminMode();
        renderProducts();
        alert('Admin logged out successfully.');
      } else {
        openModal(adminLoginModal);
        adminEmailInput.focus();
      }
    });
  }

  if (adminLoginClose) {
    adminLoginClose.addEventListener('click', () => closeModal(adminLoginModal));
  }

  // Handle Login submission
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = adminEmailInput.value.trim();
      const password = adminPasswordInput.value;

      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Invalid credentials');
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          localStorage.setItem('curvy_comfort_admin_active', 'true');
          enableAdminMode();
          closeModal(adminLoginModal);
          adminLoginForm.reset();
          adminLoginError.style.display = 'none';
          renderProducts();
          alert('Welcome back, Admin! Catalog administration controls activated.');
        } else {
          adminLoginError.innerText = 'Invalid email or password credentials';
          adminLoginError.style.display = 'block';
        }
      })
      .catch(err => {
        console.error(err);
        adminLoginError.innerText = err.message || 'Authentication error';
        adminLoginError.style.display = 'block';
      });
    });
  }

  // Trigger Add Product Modal
  if (adminAddProductTrigger) {
    adminAddProductTrigger.addEventListener('click', () => {
      editProductId.value = '';
      adminProductForm.reset();
      imagePreviewContainer.style.display = 'none';
      uploadedImagePreview.src = '';
      productEditorTitle.innerText = 'Add New Product';
      productEditorTag.innerText = 'Product Catalog Creation';
      productFormSubmitBtn.innerText = 'Save and Publish Product';
      inputProdImageFile.setAttribute('required', 'required');
      openModal(adminProductModal);
    });
  }

  if (adminProductClose) {
    adminProductClose.addEventListener('click', () => closeModal(adminProductModal));
  }

  // Handle image upload reading to Base64
  if (inputProdImageFile) {
    inputProdImageFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        inputProdImageBase64.value = event.target.result;
        uploadedImagePreview.src = event.target.result;
        imagePreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  // Handle Product Form Add or Edit submission
  if (adminProductForm) {
    adminProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = editProductId.value;
      const name = inputProdName.value.trim();
      const price = parseFloat(inputProdPrice.value);
      const category = inputProdCategory.value;
      const badge = inputProdBadge.value.trim();
      const imageBase64 = inputProdImageBase64.value;

      const payload = { name, price, category, badge };
      if (imageBase64) {
        payload.image = imageBase64;
      }

      if (id) {
        // --- EDIT MODE ---
        fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(async res => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to update product');
          }
          return res.json();
        })
        .then(updatedProd => {
          const prodIndex = productsDatabase.findIndex(p => p.id === id);
          if (prodIndex > -1) {
            productsDatabase[prodIndex] = updatedProd;
          }
          saveData();
          alert('Product details updated successfully!');
          closeModal(adminProductModal);
          renderProducts();
          renderNewArrivals();
        })
        .catch(err => {
          console.error(err);
          alert(`Failed to update product: ${err.message}`);
        });
      } else {
        // --- ADD MODE ---
        if (!imageBase64) {
          alert('Please select and upload a product clothing photo.');
          return;
        }
        payload.image = imageBase64;
        payload.isNew = true;

        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(async res => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to add product');
          }
          return res.json();
        })
        .then(newProd => {
          productsDatabase.unshift(newProd);
          saveData();
          alert('New product successfully published to boutique catalog!');
          closeModal(adminProductModal);
          renderProducts();
          renderNewArrivals();
        })
        .catch(err => {
          console.error(err);
          alert(`Failed to publish product: ${err.message}`);
        });
      }
    });
  }
}

// Branding Image Manager Listeners
function initBrandingListeners() {
  if (adminBrandingTrigger) {
    adminBrandingTrigger.addEventListener('click', () => {
      adminBrandingForm.reset();
      logoPreviewBox.style.display = 'none';
      heroPreviewBox.style.display = 'none';
      
      // Seed previews if they exist in storage
      const storedLogo = localStorage.getItem('curvy_comfort_brand_logo');
      const storedHero = localStorage.getItem('curvy_comfort_brand_hero');
      
      if (storedLogo) {
        brandingLogoPreview.src = storedLogo;
        logoPreviewBox.style.display = 'block';
      }
      if (storedHero) {
        brandingHeroPreview.src = storedHero;
        heroPreviewBox.style.display = 'block';
      }

      openModal(adminBrandingModal);
    });
  }

  if (adminBrandingClose) {
    adminBrandingClose.addEventListener('click', () => closeModal(adminBrandingModal));
  }

  // File reader for logo
  if (inputBrandLogoFile) {
    inputBrandLogoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        inputBrandLogoBase64.value = event.target.result;
        brandingLogoPreview.src = event.target.result;
        logoPreviewBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  // File reader for hero banner
  if (inputBrandHeroFile) {
    inputBrandHeroFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        inputBrandHeroBase64.value = event.target.result;
        brandingHeroPreview.src = event.target.result;
        heroPreviewBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  // Submit branding
  if (adminBrandingForm) {
    adminBrandingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newLogo = inputBrandLogoBase64.value;
      const newHero = inputBrandHeroBase64.value;

      const payload = {};
      if (newLogo) payload.brand_logo = newLogo;
      if (newHero) payload.brand_hero = newHero;

      fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update branding settings');
        }
        
        if (newLogo) localStorage.setItem('curvy_comfort_brand_logo', newLogo);
        if (newHero) localStorage.setItem('curvy_comfort_brand_hero', newHero);

        applyBrandingVisuals();
        closeModal(adminBrandingModal);
        alert('Store branding graphics successfully updated!');
      })
      .catch(err => {
        console.error(err);
        alert(`Failed to update branding graphics: ${err.message}`);
      });
    });
  }

  // Reset branding
  if (resetBrandingBtn) {
    resetBrandingBtn.addEventListener('click', () => {
      const conf = confirm('Reset branding visuals back to default logo and hero banner graphics?');
      if (!conf) return;

      // Post empty values to backend to clear database settings
      fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_logo: '', brand_hero: '' })
      })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to reset branding on server');
        }
        
        localStorage.removeItem('curvy_comfort_brand_logo');
        localStorage.removeItem('curvy_comfort_brand_hero');
        
        // Restore defaults immediately in the DOM
        document.querySelectorAll('.brand-logo-element').forEach(el => {
          el.src = defaultImageSrc('/logo.jpg');
        });
        const faviconLink = document.getElementById('favicon-link');
        if (faviconLink) faviconLink.href = defaultImageSrc('/logo.jpg');
        
        const heroEl = document.getElementById('brand-hero-element');
        if (heroEl) heroEl.src = defaultImageSrc('/hero_banner.png');

        closeModal(adminBrandingModal);
        alert('Branding reverted back to standard design defaults.');
      })
      .catch(err => {
        console.error(err);
        alert(`Failed to reset branding: ${err.message}`);
      });
    });
  }
}

// Global modal helpers
function openModal(modal) {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Trigger editing mode from card
window.startEditProduct = (id) => {
  const p = productsDatabase.find(prod => prod.id === id);
  if (!p) return;

  editProductId.value = p.id;
  inputProdName.value = p.name;
  inputProdPrice.value = p.price;
  inputProdCategory.value = p.category;
  inputProdBadge.value = p.badge || '';
  inputProdImageBase64.value = '';
  inputProdImageFile.removeAttribute('required');
  
  uploadedImagePreview.src = p.image;
  imagePreviewContainer.style.display = 'block';
  
  productEditorTitle.innerText = 'Edit Boutique Product';
  productEditorTag.innerText = 'Updating Catalog Item';
  productFormSubmitBtn.innerText = 'Update Product Details';
  
  openModal(adminProductModal);
};

// Trigger delete item from card
window.deleteProduct = (id) => {
  const p = productsDatabase.find(prod => prod.id === id);
  if (!p) return;

  const confirmDelete = confirm(`Are you sure you want to permanently delete "${p.name}" from the store catalog?`);
  if (!confirmDelete) return;

  fetch(`/api/products/${id}`, {
    method: 'DELETE'
  })
  .then(async res => {
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to delete product');
    }
    
    // Remove from catalog
    productsDatabase = productsDatabase.filter(prod => prod.id !== id);
    
    // Remove from cart and wishlist if present
    cart = cart.filter(item => item.id !== id);
    wishlist = wishlist.filter(item => item.id !== id);
    recentlyViewed = recentlyViewed.filter(item => item.id !== id);

    saveData();
    renderProducts();
    renderNewArrivals();
    renderCartDrawer();
    renderRecentlyViewed();
    
    alert('Product removed from database catalog successfully.');
  })
  .catch(err => {
    console.error(err);
    alert(`Failed to delete product: ${err.message}`);
  });
};

// --- RENDER PRODUCTS GRID ---
function renderProducts() {
  if (!productGrid) return;
  
  const filtered = currentCategory === 'all' 
    ? productsDatabase 
    : productsDatabase.filter(p => p.category === currentCategory);
    
  productGrid.innerHTML = '';
  
  if (filtered.length === 0) {
    productGrid.innerHTML = `<p class="cart-empty-message" style="grid-column: 1/-1;">No styles found in this category.</p>`;
    return;
  }
  
  filtered.forEach(p => {
    const isWishlisted = wishlist.some(w => w.id === p.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      ${p.badge ? `<span class="product-badge ${p.badge.toLowerCase() === 'sale' ? 'sale' : ''}">${p.badge}</span>` : ''}
      
      <!-- Admin overlay controls -->
      <div class="admin-card-controls">
        <button class="admin-card-btn admin-btn-edit" onclick="startEditProduct('${p.id}')" title="Edit Catalog Details">✏️</button>
        <button class="admin-card-btn admin-btn-delete" onclick="deleteProduct('${p.id}')" title="Delete Product Item">🗑️</button>
      </div>

      <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${p.id}" aria-label="Add to Wishlist">
        <svg width="18" height="18" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>
      <div class="product-img-wrapper" onclick="viewProductDetails('${p.id}')">
        <img src="${productImageSrc(p.image)}" alt="${p.name}" class="product-img" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h4 class="product-title" onclick="viewProductDetails('${p.id}')">${p.name}</h4>
        <div class="product-rating">
          ${getRatingStars(p.rating)} <span>(${p.reviewsCount})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            ₹${p.price.toLocaleString('en-IN')}
            ${p.originalPrice ? `<del>₹${p.originalPrice.toLocaleString('en-IN')}</del>` : ''}
          </div>
          <button class="product-add-cart-btn" data-id="${p.id}" aria-label="Add to Cart">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
          </button>
        </div>
      </div>
    `;
    
    // Action events
    card.querySelector('.product-wishlist-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(p.id);
    });
    card.querySelector('.product-add-cart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(p.id);
    });
    
    productGrid.appendChild(card);
  });
}

function renderNewArrivals() {
  if (!newArrivalsGrid) return;
  const newItems = productsDatabase.filter(p => p.isNew);
  newArrivalsGrid.innerHTML = '';
  
  if (newItems.length === 0) {
    newArrivalsGrid.innerHTML = `<p class="cart-empty-message" style="grid-column: 1/-1;">Check back soon for new arrivals!</p>`;
    return;
  }

  newItems.slice(0, 4).forEach(p => {
    const isWishlisted = wishlist.some(w => w.id === p.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <span class="product-badge">New</span>
      
      <!-- Admin overlay controls -->
      <div class="admin-card-controls">
        <button class="admin-card-btn admin-btn-edit" onclick="startEditProduct('${p.id}')">✏️</button>
        <button class="admin-card-btn admin-btn-delete" onclick="deleteProduct('${p.id}')">🗑️</button>
      </div>

      <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${p.id}">
        <svg width="18" height="18" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>
      <div class="product-img-wrapper" onclick="viewProductDetails('${p.id}')">
        <img src="${productImageSrc(p.image)}" alt="${p.name}" class="product-img" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h4 class="product-title" onclick="viewProductDetails('${p.id}')">${p.name}</h4>
        <div class="product-rating">
          ${getRatingStars(p.rating)} <span>(${p.reviewsCount})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            ₹${p.price.toLocaleString('en-IN')}
          </div>
          <button class="product-add-cart-btn" data-id="${p.id}">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
          </button>
        </div>
      </div>
    `;
    
    card.querySelector('.product-wishlist-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(p.id);
    });
    card.querySelector('.product-add-cart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(p.id);
    });
    
    newArrivalsGrid.appendChild(card);
  });
}

function getRatingStars(rating) {
  let stars = '';
  const fullStars = Math.floor(rating || 5);
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += '★';
    } else {
      stars += '☆';
    }
  }
  return stars;
}

// --- SHOP FILTERS ---
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.getAttribute('data-filter');
    renderProducts();
  });
});

window.filterShopCategory = (cat) => {
  currentCategory = cat;
  filterButtons.forEach(b => {
    if (b.getAttribute('data-filter') === cat) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  renderProducts();
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
};

// --- PRODUCT VIEW & RECENTLY VIEWED LOGIC ---
window.viewProductDetails = (id) => {
  const p = productsDatabase.find(prod => prod.id === id);
  if (!p) return;
  
  // Track recently viewed
  recentlyViewed = recentlyViewed.filter(item => item.id !== id);
  recentlyViewed.unshift(p);
  if (recentlyViewed.length > 4) recentlyViewed.pop();
  saveData();
  renderRecentlyViewed();
  
  showStickyCartBar(p);
  
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  
  trackAnalyticsEvent('view_item', { item_id: p.id, item_name: p.name, price: p.price });
};

function renderRecentlyViewed() {
  const recentSection = document.getElementById('recently-viewed-panel');
  const recentGrid = document.getElementById('recently-viewed-grid');
  
  if (!recentSection || !recentGrid) return;
  
  if (recentlyViewed.length === 0) {
    recentSection.style.display = 'none';
    return;
  }
  
  recentSection.style.display = 'block';
  recentGrid.innerHTML = '';
  
  recentlyViewed.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrapper" onclick="viewProductDetails('${p.id}')">
        <img src="${productImageSrc(p.image)}" alt="${p.name}" class="product-img">
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h4 class="product-title" onclick="viewProductDetails('${p.id}')">${p.name}</h4>
        <div class="product-footer">
          <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
          <button class="product-add-cart-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
          </button>
        </div>
      </div>
    `;
    recentGrid.appendChild(card);
  });
}

// --- WISHLIST DRAWER LOGIC ---
function toggleWishlist(id) {
  const p = productsDatabase.find(prod => prod.id === id);
  if (!p) return;
  
  const index = wishlist.findIndex(item => item.id === id);
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(p);
    trackAnalyticsEvent('add_to_wishlist', { item_id: p.id, item_name: p.name });
  }
  
  saveData();
  renderProducts();
  renderNewArrivals();
  renderWishlistDrawer();
}

function renderWishlistDrawer() {
  if (!wishlistDrawerBody) return;
  
  wishlistDrawerBody.innerHTML = '';
  
  if (wishlist.length === 0) {
    wishlistDrawerBody.innerHTML = `
      <div class="cart-empty-message">
        <div class="cart-empty-icon">💖</div>
        <p>Your wishlist is empty.</p>
        <p style="font-size:0.85rem; margin-top:5px;">Save items you love here!</p>
      </div>
    `;
    return;
  }
  
  wishlist.forEach(p => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${productImageSrc(p.image)}" alt="${p.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${p.name}</h4>
        <span class="cart-item-price">₹${p.price.toLocaleString('en-IN')}</span>
      </div>
      <button class="product-add-cart-btn" onclick="addToCart('${p.id}'); toggleWishlist('${p.id}')" style="width:32px; height:32px; font-size:0.8rem; background-color:var(--color-maroon);" title="Add to Bag">
        👜
      </button>
      <button class="cart-item-remove" onclick="toggleWishlist('${p.id}')" title="Remove">&times;</button>
    `;
    wishlistDrawerBody.appendChild(div);
  });
}

// --- CART DRAWER LOGIC ---
window.addToCart = (id) => {
  const p = productsDatabase.find(prod => prod.id === id);
  if (!p) return;
  
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...p, quantity: 1 });
  }
  
  trackAnalyticsEvent('add_to_cart', { item_id: p.id, item_name: p.name, price: p.price });
  
  saveData();
  renderCartDrawer();
  openDrawer(cartDrawerBackdrop, cartDrawer);
  
  showStickyCartBar(p);
};

function changeQty(id, change) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  
  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveData();
  renderCartDrawer();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveData();
  renderCartDrawer();
}

function renderCartDrawer() {
  if (!cartDrawerBody) return;
  
  cartDrawerBody.innerHTML = '';
  let subtotal = 0;
  
  if (cart.length === 0) {
    cartDrawerBody.innerHTML = `
      <div class="cart-empty-message">
        <div class="cart-empty-icon">👜</div>
        <p>Your cart is empty.</p>
        <button class="btn btn-secondary" onclick="closeAllDrawers();" style="margin-top:1.5rem; padding:0.6rem 1.5rem; font-size:0.8rem;">Start Shopping</button>
      </div>
    `;
    cartTotalPrice.innerText = '₹0.00';
    return;
  }
  
  cart.forEach(p => {
    const totalItemPrice = p.price * p.quantity;
    subtotal += totalItemPrice;
    
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${productImageSrc(p.image)}" alt="${p.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${p.name}</h4>
        <span class="cart-item-price">₹${p.price.toLocaleString('en-IN')} x ${p.quantity}</span>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${p.id}', -1)">-</button>
          <span style="font-size:0.9rem; font-weight:600;">${p.quantity}</span>
          <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${p.id}')">&times;</button>
    `;
    cartDrawerBody.appendChild(div);
  });
  
  cartTotalPrice.innerText = `₹${subtotal.toLocaleString('en-IN')}.00`;
}

// --- CHECKOUT VIA WHATSAPP ---
if (checkoutWhatsappBtn) {
  checkoutWhatsappBtn.addEventListener('click', () => {
    initiateCheckout();
  });
}

function initiateCheckout() {
  if (cart.length === 0) return;
  
  let subtotal = 0;
  let itemsMessage = '';
  
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    itemsMessage += `${index + 1}. ${item.name} (${item.category.toUpperCase()}) - Qty: ${item.quantity} - Price: ₹${item.price.toLocaleString('en-IN')} (Total: ₹${itemTotal.toLocaleString('en-IN')})\n`;
  });
  
  const whatsappNumber = '916385190055';
  const welcomeText = `Hello Curvy Comfort! I would like to place an order from your premium fashion store.\n\n`;
  const orderDetails = `*ORDER DETAILS:*\n${itemsMessage}\n`;
  const summaryText = `*SUBTOTAL:* ₹${subtotal.toLocaleString('en-IN')}.00\n`;
  const footerText = `Please confirm product availability, sizes, and shipping address details to process payment. Thank you!`;
  
  const fullMessage = encodeURIComponent(welcomeText + orderDetails + summaryText + footerText);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${fullMessage}`;
  
  trackAnalyticsEvent('begin_checkout', { value: subtotal, currency: 'INR', items: cart });
  
  // Log the checkout order to the backend MySQL database
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      })),
      total_price: subtotal
    })
  })
  .then(res => {
    if (!res.ok) console.warn('Failed to store order log on server.');
  })
  .catch(err => console.error('Error logging order to database:', err))
  .finally(() => {
    window.open(whatsappUrl, '_blank');
  });
}

// --- DRAWER OPEN/CLOSE SYSTEM ---
function openDrawer(backdrop, drawer) {
  closeAllDrawers();
  backdrop.classList.add('open');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAllDrawers() {
  const backdrops = document.querySelectorAll('.drawer-backdrop');
  const drawers = document.querySelectorAll('.drawer');
  const modals = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(b => b.classList.remove('open'));
  drawers.forEach(d => d.classList.remove('open'));
  modals.forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}

if (cartTrigger) cartTrigger.addEventListener('click', () => { renderCartDrawer(); openDrawer(cartDrawerBackdrop, cartDrawer); });
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeAllDrawers);
if (cartDrawerBackdrop) cartDrawerBackdrop.addEventListener('click', (e) => { if (e.target === cartDrawerBackdrop) closeAllDrawers(); });

if (wishlistTrigger) wishlistTrigger.addEventListener('click', () => { renderWishlistDrawer(); openDrawer(wishlistDrawerBackdrop, wishlistDrawer); });
if (wishlistCloseBtn) wishlistCloseBtn.addEventListener('click', closeAllDrawers);
if (wishlistDrawerBackdrop) wishlistDrawerBackdrop.addEventListener('click', (e) => { if (e.target === wishlistDrawerBackdrop) closeAllDrawers(); });

if (searchTrigger) searchTrigger.addEventListener('click', () => { openDrawer(searchDrawerBackdrop, searchDrawer); searchInput.focus(); });
if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeAllDrawers);
if (searchDrawerBackdrop) searchDrawerBackdrop.addEventListener('click', (e) => { if (e.target === searchDrawerBackdrop) closeAllDrawers(); });

// --- SEARCH ENGINE IN DRAWER ---
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    if (val === '') {
      searchResultsHeading.innerText = 'Popular Searches';
      searchResultsBody.innerHTML = `
        <ul class="footer-links" style="padding-left:10px;">
          <li style="margin-bottom:12px;"><a href="#shop" onclick="closeAllDrawers(); filterShopCategory('ethnic');" style="color:var(--color-maroon); font-weight:600;">✨ Ethnic Wear Collection</a></li>
          <li style="margin-bottom:12px;"><a href="#shop" onclick="closeAllDrawers(); filterShopCategory('casual');" style="color:var(--color-maroon); font-weight:600;">☁️ Premium Casual Wear</a></li>
          <li style="margin-bottom:12px;"><a href="#shop" onclick="closeAllDrawers(); filterShopCategory('party');" style="color:var(--color-maroon); font-weight:600;">👑 Glamorous Party Dresses</a></li>
          <li style="margin-bottom:12px;"><a href="#shop" onclick="closeAllDrawers(); filterShopCategory('blouse');" style="color:var(--color-maroon); font-weight:600;">👚 Ready-Made Blouse Collection</a></li>
        </ul>
      `;
      return;
    }
    
    const results = productsDatabase.filter(p => p.name.toLowerCase().includes(val) || p.category.toLowerCase().includes(val));
    searchResultsHeading.innerText = `Search Results (${results.length})`;
    searchResultsBody.innerHTML = '';
    
    if (results.length === 0) {
      searchResultsBody.innerHTML = `<p class="cart-empty-message">No matching styles found. Try searching "Kurta", "Lehenga", "Blouse", or "Anarkali".</p>`;
      return;
    }
    
    results.forEach(p => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.style.cursor = 'pointer';
      div.addEventListener('click', () => {
        closeAllDrawers();
        viewProductDetails(p.id);
      });
      div.innerHTML = `
        <img src="${productImageSrc(p.image)}" alt="${p.name}" class="cart-item-img" style="width:50px; height:60px;">
        <div class="cart-item-details">
          <h4 class="cart-item-title" style="font-size:0.9rem;">${p.name}</h4>
          <span class="cart-item-price" style="font-size:0.85rem;">₹${p.price.toLocaleString('en-IN')}</span>
        </div>
        <button class="product-add-cart-btn" onclick="event.stopPropagation(); addToCart('${p.id}'); closeAllDrawers();" style="width:28px; height:28px; font-size:0.75rem; background-color:var(--color-gold);">
          +
        </button>
      `;
      searchResultsBody.appendChild(div);
    });
    
    trackAnalyticsEvent('search', { search_term: val });
  });
}

// --- STICKY CART BAR TRIGGER LOGIC ---
function showStickyCartBar(p) {
  if (!stickyCartBar) return;
  stickyBarImg.src = productImageSrc(p.image);
  stickyBarImg.alt = p.name;
  stickyBarTitle.innerText = p.name;
  stickyBarPrice.innerText = `₹${p.price.toLocaleString('en-IN')}.00`;
  
  stickyBarBuyBtn.onclick = () => {
    const whatsappUrl = `https://wa.me/916385190055?text=${encodeURIComponent(`Hello Curvy Comfort! I want to order "${p.name}" (₹${p.price.toLocaleString('en-IN')}) shown on your website. Please check size availability.`)}`;
    trackAnalyticsEvent('begin_checkout', { value: p.price, currency: 'INR', items: [{ ...p, quantity: 1 }] });
    window.open(whatsappUrl, '_blank');
  };
  
  stickyCartBar.classList.add('active');
}

window.addEventListener('scroll', () => {
  if (window.scrollY < 200) {
    if (stickyCartBar) stickyCartBar.classList.remove('active');
  } else {
    if (recentlyViewed.length > 0 && stickyCartBar && !stickyCartBar.classList.contains('active')) {
      showStickyCartBar(recentlyViewed[0]);
    }
  }
});

// --- DYNAMIC HEADER SCROLL EFFECT ---
function updateHeaderState() {
  if (!header) return;
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', updateHeaderState);

// --- MOBILE MENU NAVIGATION ---
if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-open');
  });
}

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    navMenu.classList.remove('mobile-open');
  });
});

// --- DIGITAL MARKETING / EVENT TRACKING ---
function initAnalyticsTracking() {
  console.log('Marketing Integrations initialized: GA4 (G-MOCK456), Meta Pixel (1234567890), GTM (GTM-MOCK123)');
}

function trackAnalyticsEvent(eventName, params) {
  console.log(`[Marketing Analytics] Triggered Event: ${eventName}`, params);
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
  if (typeof fbq === 'function') {
    if (eventName === 'view_item') {
      fbq('track', 'ViewContent', { content_name: params.item_name, content_ids: [params.item_id], value: params.price, currency: 'INR' });
    } else if (eventName === 'add_to_cart') {
      fbq('track', 'AddToCart', { content_name: params.item_name, content_ids: [params.item_id], value: params.price, currency: 'INR' });
    } else if (eventName === 'begin_checkout') {
      fbq('track', 'InitiateCheckout', { value: params.value, currency: 'INR' });
    } else if (eventName === 'search') {
      fbq('track', 'Search', { search_string: params.search_term });
    }
  }
}

// --- EXPOSE MODULAR FUNCTIONS TO GLOBAL SCOPE FOR INLINE HTML CALLS ---
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.toggleWishlist = toggleWishlist;
