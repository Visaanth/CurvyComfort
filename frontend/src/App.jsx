import React, { useState, useEffect, useRef } from 'react';

// Fallback products database in case API is offline
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

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : '');

export default function App() {
  // --- STATE ---
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Branding states
  const [brandLogo, setBrandLogo] = useState(localStorage.getItem('curvy_comfort_brand_logo') || '/logo.jpg');
  const [brandHero, setBrandHero] = useState(localStorage.getItem('curvy_comfort_brand_hero') || '/hero_banner.png');

  // Drawer open states
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Modal open states
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [productEditorOpen, setProductEditorOpen] = useState(false);
  const [brandingManagerOpen, setBrandingManagerOpen] = useState(false);

  // Sticky Cart Bar states
  const [stickyBarActive, setStickyBarActive] = useState(false);
  const [stickyBarProduct, setStickyBarProduct] = useState(null);

  // Admin login fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Product editor form states
  const [editProductId, setEditProductId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('ethnic');
  const [prodBadge, setProdBadge] = useState('');
  const [prodImageBase64, setProdImageBase64] = useState('');
  const [prodImagePreview, setProdImagePreview] = useState('');

  // Branding manager form states
  const [brandLogoBase64, setBrandLogoBase64] = useState('');
  const [brandHeroBase64, setBrandHeroBase64] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [heroPreview, setHeroPreview] = useState('');

  // Search input state
  const [searchTerm, setSearchTerm] = useState('');

  const searchInputRef = useRef(null);

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    // 1. Local Storage loads
    const storedCart = localStorage.getItem('curvy_comfort_cart');
    const storedWishlist = localStorage.getItem('curvy_comfort_wishlist');
    const storedRecent = localStorage.getItem('curvy_comfort_recent');
    const storedAdmin = localStorage.getItem('curvy_comfort_admin_active');

    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    if (storedRecent) setRecentlyViewed(JSON.parse(storedRecent));
    if (storedAdmin === 'true') setIsAdminActive(true);

    // 2. Fetch from backend APIs
    fetchProducts();
    fetchBranding();
    
    // GA4 / Facebook Pixel / GTM mock tracking logs
    console.log('Marketing Integrations initialized: GA4 (G-MOCK456), Meta Pixel (1234567890), GTM (GTM-MOCK123)');
  }, []);

  // Sync Favicon and localStorage when brand logo changes
  useEffect(() => {
    const faviconLink = document.getElementById('favicon-link');
    if (faviconLink && brandLogo) {
      faviconLink.href = brandLogo;
    }
  }, [brandLogo]);

  // Handle scroll events for header styling and bottom sticky bar
  useEffect(() => {
    const handleScroll = () => {
      // Header scrolled state
      if (window.scrollY > 50) {
        setHeaderScrolled(true);
      } else {
        setHeaderScrolled(false);
      }

      // Sticky bar display logic
      if (window.scrollY < 200) {
        setStickyBarActive(false);
      } else {
        if (recentlyViewed.length > 0) {
          setStickyBarActive(true);
          if (!stickyBarProduct) {
            setStickyBarProduct(recentlyViewed[0]);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [recentlyViewed, stickyBarProduct]);

  // Focus search input when search drawer opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [searchOpen]);

  // --- LOCAL PERSISTENCE ---
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('curvy_comfort_cart', JSON.stringify(newCart));
  };

  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem('curvy_comfort_wishlist', JSON.stringify(newWishlist));
  };

  const saveRecent = (newRecent) => {
    setRecentlyViewed(newRecent);
    localStorage.setItem('curvy_comfort_recent', JSON.stringify(newRecent));
  };

  // --- API HANDLERS ---
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products from backend:', err);
    }
  };

  const fetchBranding = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/branding`);
      if (res.ok) {
        const data = await res.json();
        if (data.brand_logo) {
          setBrandLogo(data.brand_logo);
          localStorage.setItem('curvy_comfort_brand_logo', data.brand_logo);
        } else {
          setBrandLogo('/logo.jpg');
          localStorage.removeItem('curvy_comfort_brand_logo');
        }
        if (data.brand_hero) {
          setBrandHero(data.brand_hero);
          localStorage.setItem('curvy_comfort_brand_hero', data.brand_hero);
        } else {
          setBrandHero('/hero_banner.png');
          localStorage.removeItem('curvy_comfort_brand_hero');
        }
      }
    } catch (err) {
      console.error('Failed to fetch branding settings:', err);
    }
  };

  // --- ANALYTICS ---
  const trackAnalyticsEvent = (eventName, params) => {
    console.log(`[Marketing Analytics] Triggered Event: ${eventName}`, params);
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
    if (typeof window.fbq === 'function') {
      if (eventName === 'view_item') {
        window.fbq('track', 'ViewContent', { content_name: params.item_name, content_ids: [params.item_id], value: params.price, currency: 'INR' });
      } else if (eventName === 'add_to_cart') {
        window.fbq('track', 'AddToCart', { content_name: params.item_name, content_ids: [params.item_id], value: params.price, currency: 'INR' });
      } else if (eventName === 'begin_checkout') {
        window.fbq('track', 'InitiateCheckout', { value: params.value, currency: 'INR' });
      } else if (eventName === 'search') {
        window.fbq('track', 'Search', { search_string: params.search_term });
      }
    }
  };

  // --- SHOPPING ACTIONS ---
  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    saveCart(newCart);
    trackAnalyticsEvent('add_to_cart', { item_id: product.id, item_name: product.name, price: product.price });
    
    // Set sticky cart bar details and display it
    setStickyBarProduct(product);
    setCartOpen(true);
  };

  const changeQty = (productId, change) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const qty = item.quantity + change;
        return qty > 0 ? { ...item, quantity: qty } : null;
      }
      return item;
    }).filter(Boolean);
    saveCart(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
  };

  const toggleWishlist = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const isWishlisted = wishlist.some(item => item.id === productId);
    let newWishlist;
    if (isWishlisted) {
      newWishlist = wishlist.filter(item => item.id !== productId);
    } else {
      newWishlist = [...wishlist, product];
      trackAnalyticsEvent('add_to_wishlist', { item_id: product.id, item_name: product.name });
    }
    saveWishlist(newWishlist);
  };

  const viewProductDetails = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Track recently viewed
    const newRecent = [product, ...recentlyViewed.filter(item => item.id !== productId)].slice(0, 4);
    saveRecent(newRecent);

    // Set sticky bar details
    setStickyBarProduct(product);

    // Scroll smoothly to shop view where details/badge would highlight or simply trigger top shop section
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
    trackAnalyticsEvent('view_item', { item_id: product.id, item_name: product.name, price: product.price });
  };

  const handleCheckout = () => {
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

    // Log the order to backend Node.js database
    fetch(`${API_BASE}/api/orders`, {
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
    .catch(err => console.error('Error logging order:', err))
    .finally(() => {
      window.open(whatsappUrl, '_blank');
    });
  };

  // --- ADMIN ACTIONS ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminActive(true);
        localStorage.setItem('curvy_comfort_admin_active', 'true');
        setAdminLoginOpen(false);
        setAdminEmail('');
        setAdminPassword('');
        alert('Welcome back, Admin! Catalog administration controls activated.');
      } else {
        setAdminLoginError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAdminLoginError('Authentication service offline');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminActive(false);
    localStorage.removeItem('curvy_comfort_admin_active');
    alert('Admin logged out successfully.');
  };

  const handleDeleteProduct = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${name}" from the store catalog?`);
    if (!confirmDelete) return;

        try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        // Remove from local cart/wishlist/recent state if deleted
        saveCart(cart.filter(item => item.id !== id));
        saveWishlist(wishlist.filter(item => item.id !== id));
        saveRecent(recentlyViewed.filter(item => item.id !== id));
        alert('Product removed from database catalog successfully.');
      } else {
        const data = await res.json();
        alert(`Failed to delete product: ${data.error}`);
      }
    } catch (err) {
      alert('Delete operation failed.');
    }
  };

  const triggerEditProduct = (product) => {
    setEditProductId(product.id);
    setProdName(product.name);
    setProdPrice(product.price);
    setProdCategory(product.category);
    setProdBadge(product.badge || '');
    setProdImageBase64('');
    setProdImagePreview(product.image);
    setProductEditorOpen(true);
  };

  const triggerAddProduct = () => {
    setEditProductId('');
    setProdName('');
    setProdPrice('');
    setProdCategory('ethnic');
    setProdBadge('');
    setProdImageBase64('');
    setProdImagePreview('');
    setProductEditorOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodImageBase64 && !editProductId) {
      alert('Please select and upload a product clothing photo.');
      return;
    }

    const payload = {
      name: prodName,
      price: parseFloat(prodPrice),
      category: prodCategory,
      badge: prodBadge,
    };

    if (prodImageBase64) {
      payload.image = prodImageBase64;
    }

    try {
      if (editProductId) {
        // Edit mode
        const res = await fetch(`${API_BASE}/api/products/${editProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updatedProduct = await res.json();
          setProducts(products.map(p => p.id === editProductId ? updatedProduct : p));
          alert('Product details updated successfully!');
          setProductEditorOpen(false);
        } else {
          const data = await res.json();
          alert(`Failed to update product: ${data.error}`);
        }
      } else {
        // Add mode
        payload.isNew = true;
        const res = await fetch(`${API_BASE}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const newProduct = await res.json();
          setProducts([newProduct, ...products]);
          alert('New product successfully published to boutique catalog!');
          setProductEditorOpen(false);
        } else {
          const data = await res.json();
          alert(`Failed to publish product: ${data.error}`);
        }
      }
    } catch (err) {
      alert('Product save request failed.');
    }
  };

  const handleBrandingSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    if (brandLogoBase64) payload.brand_logo = brandLogoBase64;
    if (brandHeroBase64) payload.brand_hero = brandHeroBase64;

    try {
      const res = await fetch(`${API_BASE}/api/branding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (brandLogoBase64) {
          setBrandLogo(brandLogoBase64);
          localStorage.setItem('curvy_comfort_brand_logo', brandLogoBase64);
        }
        if (brandHeroBase64) {
          setBrandHero(brandHeroBase64);
          localStorage.setItem('curvy_comfort_brand_hero', brandHeroBase64);
        }
        setBrandingManagerOpen(false);
        alert('Store branding graphics successfully updated!');
      } else {
        const data = await res.json();
        alert(`Failed to update branding graphics: ${data.error}`);
      }
    } catch (err) {
      alert('Branding save request failed.');
    }
  };

  const handleResetBranding = async () => {
    const conf = window.confirm('Reset branding visuals back to default logo and hero banner graphics?');
    if (!conf) return;

    try {
      const res = await fetch(`${API_BASE}/api/branding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_logo: '', brand_hero: '' })
      });
      if (res.ok) {
        setBrandLogo('/logo.jpg');
        setBrandHero('/hero_banner.png');
        localStorage.removeItem('curvy_comfort_brand_logo');
        localStorage.removeItem('curvy_comfort_brand_hero');
        setBrandingManagerOpen(false);
        alert('Branding reverted back to standard design defaults.');
      } else {
        alert('Failed to reset branding on server.');
      }
    } catch (err) {
      alert('Branding reset request failed.');
    }
  };

  // File readers to base64
  const handleProductImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProdImageBase64(event.target.result);
      setProdImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBrandingLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBrandLogoBase64(event.target.result);
      setLogoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBrandingHeroChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBrandHeroBase64(event.target.result);
      setHeroPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Helper rating stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 5);
    return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
  };

  // --- FILTERED PRODUCTS ---
  const filteredProducts = currentCategory === 'all'
    ? products
    : products.filter(p => p.category === currentCategory);

  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  return (
    <div className={`app-root-container ${isAdminActive ? 'admin-mode' : ''}`}>
      
      {/* --- TOP BAR --- */}
      <div className="header-top">
        ✨ Curves Deserve Comfort - Premium Luxury Plus-Size Fashion | 
        <a href="https://chat.whatsapp.com/KIzgCae5jP07ljrVUdpPnb" target="_blank" rel="noopener noreferrer">JOIN OUR WHATSAPP COMMUNITY</a>
      </div>

      {/* --- HEADER --- */}
      <header id="main-header" className={headerScrolled ? 'scrolled' : ''}>
        <div className="nav-container">
          <a href="#home" className="logo-wrapper" id="nav-logo-link">
            <img src={brandLogo} alt="Curvy Comfort Logo" className="logo-img brand-logo-element" />
            <div className="logo-text">Curvy<span>Comfort</span></div>
          </a>

          {/* Desktop Nav */}
          <nav>
            <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`} id="nav-menu">
              <li><a href="#home" className="nav-link active" onClick={() => setMobileMenuOpen(false)}>Home</a></li>
              <li><a href="#shop" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Shop</a></li>
              <li><a href="#new-arrivals" className="nav-link" onClick={() => setMobileMenuOpen(false)}>New Arrivals</a></li>
              <li><a href="#collections" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Collections</a></li>
              <li><a href="#best-sellers" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Best Sellers</a></li>
              <li><a href="#about-brand" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</a></li>
              <li><a href="#contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
            </ul>
          </nav>

          {/* Actions */}
          <div className="nav-actions">
            <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Open Search">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>

            <button className="nav-icon-btn" onClick={() => setWishlistOpen(true)} aria-label="Open Wishlist">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span className="badge-count" id="wishlist-count">{wishlist.length}</span>
            </button>

            <button className="nav-icon-btn" onClick={() => setCartOpen(true)} aria-label="Open Cart">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span className="badge-count" id="cart-count">{cart.reduce((tot, i) => tot + i.quantity, 0)}</span>
            </button>

            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="hero-wrapper" id="home">
        <div className="hero-accent-shape"></div>
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-tag">Curves Deserve Comfort</div>
            <h1 className="hero-title">Confidence Looks Beautiful on Every Curve</h1>
            <p className="hero-subtitle">Premium plus-size fashion designed for comfort, elegance, and confidence. Embrace your beauty with our luxury fabrics and tailored flattering fits.</p>
            <div className="hero-actions">
              <a href="#shop" className="btn btn-primary">Shop Collection</a>
              <a href="#new-arrivals" className="btn btn-secondary">Explore New Arrivals</a>
            </div>
          </div>
          <div className="hero-image-area">
            <div className="hero-image-frame">
              <div className="hero-deco-1"></div>
              <div className="hero-deco-2"></div>
              <img src={brandHero} alt="Confident Plus-Size Models in Curvy Comfort Luxury Maroon and Beige Clothing" id="brand-hero-element" />
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUST BADGES SECTION --- */}
      <section className="trust-section">
        <div className="trust-grid">
          <div className="trust-card">
            <div className="trust-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
            <h4>Premium Fabrics</h4>
            <p>Breathable, luxurious materials selected for longevity and high-comfort fit.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h4>Inclusive Sizing</h4>
            <p>Thoughtfully tailored apparel designed to flatter and empower every body shape.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h4>Secure Payments</h4>
            <p>100% secure checkout gateway integrations for a smooth shopping experience.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h4>Fast Delivery</h4>
            <p>Quick shipping directly to your doorstep with tracking notifications.</p>
          </div>
        </div>
      </section>

      {/* --- FEATURED COLLECTIONS --- */}
      <section className="section" id="collections">
        <div className="section-title-wrapper">
          <h2>Featured Collections</h2>
          <p>Indulge in premium apparel crafted for comfort, style, and luxurious elegance.</p>
          <div className="section-divider"></div>
        </div>
        
        <div className="collections-grid">
          {/* Ethnic Wear */}
          <div className="collection-card" onClick={() => { setCurrentCategory('ethnic'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <img src="/ethnic_wear.png" alt="Premium Ethnic Wear Collection" className="collection-img" />
            <div className="collection-overlay">
              <h3 className="collection-title">Ethnic Wear</h3>
              <span className="collection-link">Explore Collection <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
            </div>
          </div>
          
          {/* Casual Wear */}
          <div className="collection-card" onClick={() => { setCurrentCategory('casual'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <img src="/casual_wear.png" alt="Comfortable Casual Wear Collection" className="collection-img" />
            <div className="collection-overlay">
              <h3 className="collection-title">Casual Wear</h3>
              <span className="collection-link">Explore Collection <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
            </div>
          </div>
          
          {/* Party Wear */}
          <div className="collection-card" onClick={() => { setCurrentCategory('party'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <img src="/party_wear.png" alt="Stunning Party Wear Collection" className="collection-img" />
            <div className="collection-overlay">
              <h3 className="collection-title">Party Wear</h3>
              <span className="collection-link">Explore Collection <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
            </div>
          </div>

          {/* Ready-Made Blouse */}
          <div className="collection-card" onClick={() => { setCurrentCategory('blouse'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <img src="/readymade_blouse.png" alt="Ready-Made Blouse Collection" className="collection-img" />
            <div className="collection-overlay">
              <h3 className="collection-title">Ready-Made Blouse</h3>
              <span className="collection-link">Explore Collection <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
            </div>
          </div>

          {/* Loungewear */}
          <div className="collection-card" onClick={() => { setCurrentCategory('loungewear'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <img src="/loungewear.png" alt="Cozy Loungewear Collection" className="collection-img" />
            <div className="collection-overlay">
              <h3 className="collection-title">Loungewear</h3>
              <span className="collection-link">Explore Collection <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
            </div>
          </div>
        </div>
      </section>

      {/* --- BEST SELLERS & SHOP SECTION --- */}
      <section className="section" id="shop">
        <div className="section-title-wrapper" id="best-sellers">
          <h2>Boutique Catalog</h2>
          <p>Explore our highly-rated customer favorites, styled for beauty and engineered for comfort.</p>
          <div className="section-divider"></div>
          
          {/* Admin Action Bar */}
          {isAdminActive && (
            <div id="admin-action-bar" style={{ display: 'block', marginTop: '20px', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={triggerAddProduct}>➕ Add New Product</button>
              <button className="btn btn-secondary" onClick={() => { setBrandingManagerOpen(true); }} style={{ marginLeft: '10px' }}>🎨 Edit Branding Images</button>
            </div>
          )}
        </div>

        {/* Category Filter Controls */}
        <div className="best-sellers-filter">
          {['all', 'ethnic', 'casual', 'party', 'blouse', 'loungewear'].map(cat => (
            <button
              key={cat}
              className={`filter-btn ${currentCategory === cat ? 'active' : ''}`}
              onClick={() => setCurrentCategory(cat)}
            >
              {cat === 'all' ? 'All Styles' : cat === 'blouse' ? 'Ready-Made Blouse' : cat.charAt(0).toUpperCase() + cat.slice(1) + (cat === 'casual' || cat === 'ethnic' || cat === 'party' ? ' Wear' : '')}
            </button>
          ))}
        </div>

        {/* Dynamic Product Grid */}
        <div className="products-grid" id="product-grid">
          {filteredProducts.length === 0 ? (
            <p className="cart-empty-message" style={{ gridColumn: '1/-1' }}>No styles found in this category.</p>
          ) : (
            filteredProducts.map(p => {
              const isWishlisted = wishlist.some(w => w.id === p.id);
              return (
                <div className="product-card" key={p.id}>
                  {p.badge && (
                    <span className={`product-badge ${p.badge.toLowerCase() === 'sale' ? 'sale' : ''}`}>{p.badge}</span>
                  )}
                  
                  {/* Admin overlay controls */}
                  {isAdminActive && (
                    <div className="admin-card-controls">
                      <button className="admin-card-btn admin-btn-edit" onClick={() => triggerEditProduct(p)} title="Edit Catalog Details">✏️</button>
                      <button className="admin-card-btn admin-btn-delete" onClick={() => handleDeleteProduct(p.id, p.name)} title="Delete Product Item">🗑️</button>
                    </div>
                  )}

                  <button className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={() => toggleWishlist(p.id)} aria-label="Add to Wishlist">
                    <svg width="18" height="18" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
                  
                  <div className="product-img-wrapper" onClick={() => viewProductDetails(p.id)}>
                    <img src={p.image} alt={p.name} className="product-img" loading="lazy" />
                  </div>
                  
                  <div className="product-info">
                    <span className="product-cat">{p.category}</span>
                    <h4 className="product-title" onClick={() => viewProductDetails(p.id)}>{p.name}</h4>
                    <div className="product-rating">
                      {renderStars(p.rating)} <span>({p.reviewsCount})</span>
                    </div>
                    <div className="product-footer">
                      <div className="product-price">
                        ₹{p.price.toLocaleString('en-IN')}
                        {p.originalPrice ? <del style={{ marginLeft: '6px' }}>₹{p.originalPrice.toLocaleString('en-IN')}</del> : ''}
                      </div>
                      <button className="product-add-cart-btn" onClick={() => addToCart(p.id)} aria-label="Add to Cart">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* --- NEW ARRIVALS CAMPAIGN SECTION --- */}
      <section className="section-full bg-beige" id="new-arrivals">
        <div className="section" style={{ padding: '0 1.5rem' }}>
          <div className="section-title-wrapper" style={{ marginBottom: '3.5rem' }}>
            <h2>The New Elegance Arrivals</h2>
            <p>A hand-curated lookbook showcasing soft hues, breathable textures, and comfortable shapes.</p>
            <div className="section-divider"></div>
          </div>
          
          <div className="products-grid" id="new-arrivals-grid">
            {newArrivals.length === 0 ? (
              <p className="cart-empty-message" style={{ gridColumn: '1/-1' }}>Check back soon for new arrivals!</p>
            ) : (
              newArrivals.map(p => {
                const isWishlisted = wishlist.some(w => w.id === p.id);
                return (
                  <div className="product-card" key={p.id}>
                    <span className="product-badge">New</span>
                    
                    {/* Admin overlay controls */}
                    {isAdminActive && (
                      <div className="admin-card-controls">
                        <button className="admin-card-btn admin-btn-edit" onClick={() => triggerEditProduct(p)}>✏️</button>
                        <button className="admin-card-btn admin-btn-delete" onClick={() => handleDeleteProduct(p.id, p.name)}>🗑️</button>
                      </div>
                    )}

                    <button className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={() => toggleWishlist(p.id)}>
                      <svg width="18" height="18" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                    
                    <div className="product-img-wrapper" onClick={() => viewProductDetails(p.id)}>
                      <img src={p.image} alt={p.name} className="product-img" loading="lazy" />
                    </div>
                    
                    <div className="product-info">
                      <span className="product-cat">{p.category}</span>
                      <h4 className="product-title" onClick={() => viewProductDetails(p.id)}>{p.name}</h4>
                      <div className="product-rating">
                        {renderStars(p.rating)} <span>({p.reviewsCount})</span>
                      </div>
                      <div className="product-footer">
                        <div className="product-price">
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                        <button className="product-add-cart-btn" onClick={() => addToCart(p.id)}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE CURVY COMFORT --- */}
      <section className="section why-section">
        <div className="why-grid">
          <div className="why-image-wrapper">
            <div className="why-image-frame">
              <img src="/ethnic_wear.png" alt="Curvy Comfort Brand Positivity Story" />
            </div>
          </div>
          <div className="why-content">
            <div className="hero-tag" style={{ marginBottom: '0.5rem' }}>Why Choose Us</div>
            <h2 style={{ textAlign: 'left', marginBottom: '2rem' }}>Crafted For Comfort, Styled For Confidence</h2>
            
            <div className="why-content-grid">
              <div className="why-item">
                <div className="why-item-icon">✨</div>
                <h3>Designed For Curves</h3>
                <p>Apparel that celebrates and flatters every shape, offering premium boutique styling without compromise.</p>
              </div>
              
              <div className="why-item">
                <div className="why-item-icon">☁️</div>
                <h3>Comfort First</h3>
                <p>Breathable, stretchable, and premium quality fabrics that feel wonderful on your skin all day long.</p>
              </div>
              
              <div className="why-item">
                <div className="why-item-icon">👑</div>
                <h3>Elegant Styling</h3>
                <p>Luxury looks engineered with careful seam lines, beautiful prints, and elegant maroon-gold trims.</p>
              </div>
              
              <div className="why-item">
                <div className="why-item-icon">💖</div>
                <h3>Confidence Boosting</h3>
                <p>Empowering designs that encourage self-love, helping you feel radiant and comfortable every single day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROMOTIONAL BANNER --- */}
      <section className="section-full promo-banner">
        <div className="promo-content">
          <span className="promo-tag">Curvy Comfort Boutique</span>
          <h3 className="promo-title">Luxury Fashion Without Compromise</h3>
          <p className="promo-subtitle">Every collection is designed with real women in mind, offering premium quality and flattering fits.</p>
          <a href="#shop" className="btn btn-white">Browse Collections</a>
        </div>
      </section>

      {/* --- ABOUT BRAND STORY --- */}
      <section className="section about-brand-section" id="about-brand">
        <div className="about-brand-grid">
          <div className="about-brand-content">
            <span className="hero-tag">Our Philosophy</span>
            <h2>About Curvy Comfort</h2>
            <p className="about-brand-text">
              Curvy Comfort was created to empower women through fashion that beautifully combines elegance, comfort, and body positivity. Every piece in our collection is designed with real women in mind, ensuring premium quality materials and flattering fits. We believe that fashion should elevate you, not restrict you. Let your outfit be as bold, elegant, and confident as you are.
            </p>
            <div className="about-brand-stats">
              <div className="stat-item">
                <h3>10k+</h3>
                <p>Happy Customers</p>
              </div>
              <div className="stat-item">
                <h3>100%</h3>
                <p>Inclusive Sizes</p>
              </div>
              <div className="stat-item">
                <h3>24/7</h3>
                <p>WhatsApp Chat Order</p>
              </div>
            </div>
          </div>
          <div className="about-brand-visual">
            <div className="about-brand-card">
              <p className="about-brand-quote">"Fashion is not about fitting into what is trendy. It's about outfits that fit your personality, your shape, and make you feel unstoppable."</p>
              <span className="about-brand-signature">— The Curvy Comfort Team</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- INSTAGRAM GALLERY --- */}
      <section className="section" id="contact">
        <div className="section-title-wrapper">
          <h2>Curvy Comfort Community</h2>
          <p>Follow us on Instagram <a href="https://www.instagram.com/curvy_comfort2026" target="_blank" rel="noopener noreferrer" className="text-gold" style={{ fontWeight: 700 }}>@curvy_comfort2026</a> and share your style using #CurvesDeserveComfort</p>
          <div className="section-divider"></div>
        </div>

        <div className="insta-grid">
          {['/ethnic_wear.png', '/casual_wear.png', '/party_wear.png', '/readymade_blouse.png', '/loungewear.png'].map((img, i) => (
            <div className="insta-item" key={i}>
              <img src={img} alt={`Instagram Post ${i}`} />
              <div className="insta-overlay"><span>♥ View Post</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* --- RECENTLY VIEWED PRODUCTS --- */}
      {recentlyViewed.length > 0 && (
        <section className="section recently-viewed-section" id="recently-viewed-panel">
          <div className="section-title-wrapper" style={{ marginBottom: '2.5rem' }}>
            <h2>Recently Viewed Products</h2>
            <div className="section-divider"></div>
          </div>
          <div className="products-grid" id="recently-viewed-grid">
            {recentlyViewed.map(p => (
              <div className="product-card" key={p.id}>
                <div className="product-img-wrapper" onClick={() => viewProductDetails(p.id)}>
                  <img src={p.image} alt={p.name} className="product-img" />
                </div>
                <div className="product-info">
                  <span className="product-cat">{p.category}</span>
                  <h4 className="product-title" onClick={() => viewProductDetails(p.id)}>{p.name}</h4>
                  <div className="product-footer">
                    <div className="product-price">₹{p.price.toLocaleString('en-IN')}</div>
                    <button className="product-add-cart-btn" onClick={() => addToCart(p.id)}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- FOOTER --- */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="logo-wrapper">
              <img src={brandLogo} alt="Curvy Comfort logo in footer" className="logo-img brand-logo-element" />
              <div className="logo-text">Curvy<span>Comfort</span></div>
            </a>
            <p className="footer-desc">Curvy Comfort is India's premium luxury brand dedicated solely to plus-size women's fashion, putting style and custom comfort hand in hand.</p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/curvy_comfort2026" className="footer-social-btn" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://wa.me/916385190055" className="footer-social-btn" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Business">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.16 1.449 4.828 1.451 5.429 0 9.85-4.42 9.853-9.852.002-2.63-1.023-5.101-2.885-6.965C16.572 1.93 14.1 1.928 12.008 1.928c-5.43 0-9.852 4.42-9.855 9.853-.001 1.773.465 3.503 1.353 5.03l-.995 3.634 3.729-.977zm12.31-7.23c-.1-.15-.25-.23-.5-.35-.25-.12-1.47-.72-1.69-.8-.22-.08-.37-.12-.52.12-.15.25-.6 1-.72 1.15-.12.15-.25.17-.5.05-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.43.08-.18.04-.34-.02-.47-.06-.12-.52-1.27-.72-1.75-.19-.48-.39-.41-.52-.42-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.27-.21.22-.8.78-.8 1.9s.82 2.2 1.93 2.35c.12.02 2.19 3.35 5.3 4.69.74.32 1.31.5 1.76.64.75.24 1.43.2 1.96.12.6-.09 1.69-.69 1.93-1.35.24-.67.24-1.24.17-1.35z"/></svg>
              </a>
              <a href="https://chat.whatsapp.com/KIzgCae5jP07ljrVUdpPnb" className="footer-social-btn" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Community">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"></path></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">Shop Collections</h4>
            <ul className="footer-links">
              <li><a href="#shop" onClick={() => setCurrentCategory('ethnic')}>Ethnic Wear</a></li>
              <li><a href="#shop" onClick={() => setCurrentCategory('casual')}>Casual Wear</a></li>
              <li><a href="#shop" onClick={() => setCurrentCategory('party')}>Party Wear</a></li>
              <li><a href="#shop" onClick={() => setCurrentCategory('blouse')}>Ready-Made Blouse</a></li>
              <li><a href="#shop" onClick={() => setCurrentCategory('loungewear')}>Loungewear</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">Customer Support</h4>
            <ul className="footer-links">
              <li><a href="#about-brand">About Our Boutique</a></li>
              <li><a href="https://wa.me/916385190055?text=Hello%20Curvy%20Comfort%2C%20I%20would%20like%20to%20know%20about%20shipping%20rates." target="_blank" rel="noopener noreferrer">Shipping Policy</a></li>
              <li><a href="https://wa.me/916385190055?text=Hello%20Curvy%20Comfort%2C%20I%20would%20like%20to%20know%20about%20returns." target="_blank" rel="noopener noreferrer">Returns & Exchanges</a></li>
              <li><a href="https://chat.whatsapp.com/KIzgCae5jP07ljrVUdpPnb" target="_blank" rel="noopener noreferrer">WhatsApp Community</a></li>
              <li>
                {isAdminActive ? (
                  <button onClick={handleAdminLogout} className="footer-links-btn" style={{ color: 'var(--color-gold)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    🔓 Log Out Admin
                  </button>
                ) : (
                  <button onClick={() => { setAdminLoginOpen(true); setAdminLoginError(''); }} className="footer-links-btn" style={{ color: 'var(--color-gold)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    🔐 Admin Access
                  </button>
                )}
              </li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">Contact & Ordering</h4>
            <div className="footer-contact-item">
              <div className="footer-contact-icon">📱</div>
              <div>
                <strong>WhatsApp Business</strong><br />
                <a href="https://wa.me/916385190055" target="_blank" rel="noopener noreferrer">+91 63851 90055</a>
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon">📸</div>
              <div>
                <strong>Instagram</strong><br />
                <a href="https://www.instagram.com/curvy_comfort2026" target="_blank" rel="noopener noreferrer">@curvy_comfort2026</a>
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon">💬</div>
              <div>
                <strong>WhatsApp Community</strong><br />
                <a href="https://chat.whatsapp.com/KIzgCae5jP07ljrVUdpPnb" target="_blank" rel="noopener noreferrer">Join Our Group Chat</a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            &copy; 2026 Curvy Comfort. All rights reserved. Designed with love for every curve.
          </div>
          <div className="footer-gateways" title="Secure Payment Gateways Accepted">
            💳 🔒 🛡️
          </div>
        </div>
      </footer>

      {/* --- CART DRAWER --- */}
      <div className={`drawer-backdrop ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}>
        <div className={`drawer ${cartOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h3 className="drawer-title">👜 Shopping Bag</h3>
            <button className="drawer-close-btn" onClick={() => setCartOpen(false)}>&times;</button>
          </div>
          <div className="drawer-body">
            {cart.length === 0 ? (
              <div className="cart-empty-message">
                <div className="cart-empty-icon">👜</div>
                <p>Your cart is empty.</p>
                <button className="btn btn-secondary" onClick={() => setCartOpen(false)} style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Start Shopping</button>
              </div>
            ) : (
              cart.map(p => (
                <div className="cart-item" key={p.id}>
                  <img src={p.image} alt={p.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{p.name}</h4>
                    <span className="cart-item-price">₹{p.price.toLocaleString('en-IN')} x {p.quantity}</span>
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => changeQty(p.id, -1)}>-</button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.quantity}</span>
                      <button className="qty-btn" onClick={() => changeQty(p.id, 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(p.id)}>&times;</button>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="drawer-footer">
              <div className="cart-total-row">
                <span>Subtotal:</span>
                <span>₹{cart.reduce((tot, item) => tot + (item.price * item.quantity), 0).toLocaleString('en-IN')}.00</span>
              </div>
              <button className="btn btn-primary" onClick={handleCheckout} style={{ width: '100%', borderRadius: '30px' }}>Place Order via WhatsApp</button>
            </div>
          )}
        </div>
      </div>

      {/* --- WISHLIST DRAWER --- */}
      <div className={`drawer-backdrop ${wishlistOpen ? 'open' : ''}`} onClick={() => setWishlistOpen(false)}>
        <div className={`drawer ${wishlistOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h3 className="drawer-title">💖 My Wishlist</h3>
            <button className="drawer-close-btn" onClick={() => setWishlistOpen(false)}>&times;</button>
          </div>
          <div className="drawer-body">
            {wishlist.length === 0 ? (
              <div className="cart-empty-message">
                <div className="cart-empty-icon">💖</div>
                <p>Your wishlist is empty.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Save items you love here!</p>
              </div>
            ) : (
              wishlist.map(p => (
                <div className="cart-item" key={p.id}>
                  <img src={p.image} alt={p.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{p.name}</h4>
                    <span className="cart-item-price">₹{p.price.toLocaleString('en-IN')}</span>
                  </div>
                  <button className="product-add-cart-btn" onClick={() => { addToCart(p.id); toggleWishlist(p.id); }} style={{ width: '32px', height: '32px', fontSize: '0.8rem', backgroundColor: 'var(--color-maroon)' }} title="Add to Bag">
                    👜
                  </button>
                  <button className="cart-item-remove" onClick={() => toggleWishlist(p.id)} title="Remove">&times;</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- SEARCH DRAWER --- */}
      <div className={`drawer-backdrop ${searchOpen ? 'open' : ''}`} onClick={() => setSearchOpen(false)}>
        <div className={`drawer ${searchOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h3 className="drawer-title">🔍 Search Catalog</h3>
            <button className="drawer-close-btn" onClick={() => setSearchOpen(false)}>&times;</button>
          </div>
          <div className="drawer-body">
            <form className="search-form" onSubmit={e => e.preventDefault()}>
              <input
                type="text"
                placeholder="Search kurtas, blouses, lehengas..."
                className="search-input"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); trackAnalyticsEvent('search', { search_term: e.target.value }); }}
                ref={searchInputRef}
              />
            </form>
            <div className="search-results-title">
              {searchTerm.trim() === '' ? 'Popular Searches' : `Search Results (${products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())).length})`}
            </div>
            
            <div id="search-results-body">
              {searchTerm.trim() === '' ? (
                <ul className="footer-links" style={{ paddingLeft: '10px' }}>
                  <li style={{ marginBottom: '12px' }}>
                    <a href="#shop" onClick={() => { setSearchOpen(false); setCurrentCategory('ethnic'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'var(--color-maroon)', fontWeight: 600 }}>
                      ✨ Ethnic Wear Collection
                    </a>
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    <a href="#shop" onClick={() => { setSearchOpen(false); setCurrentCategory('casual'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'var(--color-maroon)', fontWeight: 600 }}>
                      ☁️ Premium Casual Wear
                    </a>
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    <a href="#shop" onClick={() => { setSearchOpen(false); setCurrentCategory('party'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'var(--color-maroon)', fontWeight: 600 }}>
                      👑 Glamorous Party Dresses
                    </a>
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    <a href="#shop" onClick={() => { setSearchOpen(false); setCurrentCategory('blouse'); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'var(--color-maroon)', fontWeight: 600 }}>
                      👚 Ready-Made Blouse Collection
                    </a>
                  </li>
                </ul>
              ) : (
                products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <div className="cart-item" key={p.id} style={{ cursor: 'pointer' }} onClick={() => { setSearchOpen(false); viewProductDetails(p.id); }}>
                    <img src={p.image} alt={p.name} className="cart-item-img" style={{ width: '50px', height: '60px' }} />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title" style={{ fontSize: '0.9rem' }}>{p.name}</h4>
                      <span className="cart-item-price" style={{ fontSize: '0.85rem' }}>₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                    <button className="product-add-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(p.id); setSearchOpen(false); }} style={{ width: '28px', height: '28px', fontSize: '0.75rem', backgroundColor: 'var(--color-gold)' }}>
                      +
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- STICKY CART BAR --- */}
      {stickyBarProduct && (
        <div className={`sticky-bar ${stickyBarActive ? 'active' : ''}`} id="sticky-cart-bar">
          <div className="sticky-bar-content">
            <div className="sticky-bar-product">
              <img src={stickyBarProduct.image} alt="Sticky product thumbnail" className="sticky-bar-img" />
              <div>
                <div className="sticky-bar-title">{stickyBarProduct.name}</div>
                <div className="sticky-bar-price">₹{stickyBarProduct.price.toLocaleString('en-IN')}.00</div>
              </div>
            </div>
            <div className="sticky-bar-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/916385190055?text=${encodeURIComponent(`Hello Curvy Comfort! I want to order "${stickyBarProduct.name}" (₹${stickyBarProduct.price.toLocaleString('en-IN')}) shown on your website. Please check size availability.`)}`;
                  trackAnalyticsEvent('begin_checkout', { value: stickyBarProduct.price, currency: 'INR', items: [{ ...stickyBarProduct, quantity: 1 }] });
                  window.open(whatsappUrl, '_blank');
                }}
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
              >
                Instant WhatsApp Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADMIN LOGIN --- */}
      {adminLoginOpen && (
        <div className="modal-backdrop open" id="admin-login-modal-backdrop" onClick={() => setAdminLoginOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setAdminLoginOpen(false)}>&times;</button>
            <div className="modal-body">
              <span className="modal-tag">Store Administration</span>
              <h3 className="modal-title">Admin Portal Login</h3>
              <p className="modal-text">Enter your credentials below to access product management tools.</p>
              <form className="modal-form" onSubmit={handleAdminLogin}>
                <input
                  type="text"
                  placeholder="Admin Email ID"
                  className="modal-input"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="modal-input"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary modal-submit">Login</button>
              </form>
              {adminLoginError && (
                <div id="admin-login-error" style={{ color: 'var(--color-maroon)', fontWeight: 700, marginTop: '10px' }}>
                  {adminLoginError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADMIN PRODUCT EDITOR --- */}
      {productEditorOpen && (
        <div className="modal-backdrop open" id="admin-product-modal-backdrop" onClick={() => setProductEditorOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setProductEditorOpen(false)}>&times;</button>
            <div className="modal-body" style={{ padding: '2.5rem 2rem' }}>
              <span className="modal-tag">{editProductId ? 'Updating Catalog Item' : 'Product Catalog Creation'}</span>
              <h3 className="modal-title">{editProductId ? 'Edit Boutique Product' : 'Add New Product'}</h3>
              <form className="modal-form" onSubmit={handleProductSubmit} style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-maroon)', display: 'block', margin: '10px 0 5px' }}>Product Name *</label>
                <input
                  type="text"
                  className="modal-input"
                  style={{ textAlign: 'left' }}
                  placeholder="e.g. Elegant Maroon Kurta"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  required
                />

                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-maroon)', display: 'block', margin: '10px 0 5px' }}>Price (₹) *</label>
                <input
                  type="number"
                  className="modal-input"
                  style={{ textAlign: 'left' }}
                  placeholder="e.g. 2499"
                  value={prodPrice}
                  onChange={e => setProdPrice(e.target.value)}
                  required
                />

                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-maroon)', display: 'block', margin: '10px 0 5px' }}>Category *</label>
                <select
                  value={prodCategory}
                  onChange={e => setProdCategory(e.target.value)}
                  className="modal-input"
                  style={{ textAlign: 'left', width: '100%', borderRadius: '30px', backgroundColor: 'var(--color-white)' }}
                  required
                >
                  <option value="ethnic">Ethnic Wear</option>
                  <option value="casual">Casual Wear</option>
                  <option value="party">Party Wear</option>
                  <option value="blouse">Ready-Made Blouse</option>
                  <option value="loungewear">Loungewear</option>
                </select>

                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-maroon)', display: 'block', margin: '10px 0 5px' }}>Badge (Optional)</label>
                <input
                  type="text"
                  className="modal-input"
                  style={{ textAlign: 'left' }}
                  placeholder="e.g. Sale, Best Seller"
                  value={prodBadge}
                  onChange={e => setProdBadge(e.target.value)}
                />

                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-maroon)', display: 'block', margin: '10px 0 5px' }}>Product Image File {editProductId ? '(Optional to replace)' : '*'}</label>
                <input
                  type="file"
                  className="modal-input"
                  style={{ textAlign: 'left', paddingTop: '10px' }}
                  accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg"
                  onChange={handleProductImageFileChange}
                  required={!editProductId}
                />
                
                {prodImagePreview && (
                  <div id="image-preview-container" style={{ margin: '10px 0', textAlign: 'center' }}>
                    <img src={prodImagePreview} alt="Preview" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid var(--color-gold)' }} />
                  </div>
                )}

                <button type="submit" className="btn btn-primary modal-submit" style={{ marginTop: '1.5rem' }}>
                  {editProductId ? 'Update Product Details' : 'Save and Publish Product'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADMIN BRANDING IMAGE MANAGER --- */}
      {brandingManagerOpen && (
        <div className="modal-backdrop open" id="admin-branding-modal-backdrop" onClick={() => setBrandingManagerOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setBrandingManagerOpen(false)}>&times;</button>
            <div className="modal-body" style={{ padding: '2.5rem 2rem', textAlign: 'left' }}>
              <span className="modal-tag">Store Customization</span>
              <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Branding Image Manager</h3>
              <p className="modal-text" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Upload new images to personalize your store Logo and Hero Banner.</p>
              
              <form className="modal-form" onSubmit={handleBrandingSubmit}>
                {/* Logo Upload */}
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px dashed rgba(212, 175, 55, 0.3)', paddingBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-maroon)', display: 'block', marginBottom: '6px' }}>Update Brand Logo</label>
                  <input
                    type="file"
                    className="modal-input"
                    style={{ paddingTop: '10px' }}
                    accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg"
                    onChange={handleBrandingLogoChange}
                  />
                  {(logoPreview || brandLogo) && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <img src={logoPreview || brandLogo} alt="Logo Preview" style={{ height: '60px', width: '60px', borderRadius: '50%', border: '2px solid var(--color-gold)', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                {/* Hero Banner Upload */}
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px dashed rgba(212, 175, 55, 0.3)', paddingBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-maroon)', display: 'block', marginBottom: '6px' }}>Update Hero Section Banner</label>
                  <input
                    type="file"
                    className="modal-input"
                    style={{ paddingTop: '10px' }}
                    accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg"
                    onChange={handleBrandingHeroChange}
                  />
                  {(heroPreview || brandHero) && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <img src={heroPreview || brandHero} alt="Hero Preview" style={{ maxHeight: '90px', borderRadius: '8px', border: '2px solid var(--color-gold)', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '30px', padding: '0.8rem 1rem', fontSize: '0.85rem' }}>Save Visuals</button>
                  <button type="button" className="btn btn-secondary" onClick={handleResetBranding} style={{ flex: 1, borderRadius: '30px', padding: '0.8rem 1rem', fontSize: '0.85rem', borderColor: 'var(--color-maroon)', color: 'var(--color-maroon)' }}>Reset Defaults</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- WHATSAPP FLOATING CHAT WIDGET --- */}
      <div className="whatsapp-widget" id="whatsapp-widget">
        <div className="whatsapp-tooltip">Chat & Order on WhatsApp!</div>
        <a href="https://wa.me/916385190055?text=Hello%20Curvy%20Comfort%21%20I%20am%20browsing%20your%20boutique%20website%20and%20need%20some%20help." target="_blank" rel="noopener noreferrer" className="whatsapp-bubble" aria-label="Order on WhatsApp">
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.16 1.449 4.828 1.451 5.429 0 9.85-4.42 9.853-9.852.002-2.63-1.023-5.101-2.885-6.965C16.572 1.93 14.1 1.928 12.008 1.928c-5.43 0-9.852 4.42-9.855 9.853-.001 1.773.465 3.503 1.353 5.03l-.995 3.634 3.729-.977zm12.31-7.23c-.1-.15-.25-.23-.5-.35-.25-.12-1.47-.72-1.69-.8-.22-.08-.37-.12-.52.12-.15.25-.6 1-.72 1.15-.12.15-.25.17-.5.05-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.43.08-.18.04-.34-.02-.47-.06-.12-.52-1.27-.72-1.75-.19-.48-.39-.41-.52-.42-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.27-.21.22-.8.78-.8 1.9s.82 2.2 1.93 2.35c.12.02 2.19 3.35 5.3 4.69.74.32 1.31.5 1.76.64.75.24 1.43.2 1.96.12.6-.09 1.69-.69 1.93-1.35.24-.67.24-1.24.17-1.35z"/></svg>
        </a>
      </div>
    </div>
  );
}
