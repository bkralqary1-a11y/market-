import { useState, useEffect } from 'react';
import { PageView, Language, Currency, CategoryId, Product, CartItem, ShortVideoItem } from './types';
import { mockProducts } from './data/mockData';
import { getStoredProducts, saveStoredProducts, getStoredShorts, saveStoredShorts, getStoredDiscountConfig, StoreDiscountConfig } from './utils/storeStorage';
import { Sparkles, MessageCircle } from 'lucide-react';

// Components
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import BrandTicker from './components/BrandTicker';
import CategoriesSection from './components/CategoriesSection';
import ProductCard from './components/ProductCard';
import PromoBanner from './components/PromoBanner';
import Footer from './components/Footer';
import ShopView from './components/ShopView';
import ProductDetailView from './components/ProductDetailView';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import CartDrawer from './components/CartDrawer';
import CompareModal from './components/CompareModal';
import WholesaleView from './components/WholesaleView';
import AccountView from './components/AccountView';
import AuthModal from './components/AuthModal';
import QuickViewModal from './components/QuickViewModal';
import SearchModal from './components/SearchModal';
import InvoiceModal from './components/InvoiceModal';
import FloatingCartBar from './components/FloatingCartBar';
import FlyingCartAnimation from './components/FlyingCartAnimation';
import Ambient3DBackground from './components/Ambient3DBackground';
import WaveDivider from './components/WaveDivider';
import SocialMediaShowcase from './components/SocialMediaShowcase';
import YouTubeShortsSection from './components/YouTubeShortsSection';
import FloatingSocialDock from './components/FloatingSocialDock';
import AdminPageView from './components/AdminPageView';
import { soundFX } from './utils/audioEffects';

export default function App() {
  // Dynamic persistent products and video shorts (التحكم الكامل بالمتجر)
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [shorts, setShorts] = useState<ShortVideoItem[]>(() => getStoredShorts());
  const [discountConfig, setDiscountConfig] = useState<StoreDiscountConfig>(() => getStoredDiscountConfig());

  // App navigation state
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [language, setLanguage] = useState<Language>('ar');
  const [currency, setCurrency] = useState<Currency>('YER');
  const [selectedProduct, setSelectedProduct] = useState<Product>(() => (products.length > 0 ? products[0] : mockProducts[0]));
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  // Initial cart: completely empty so user starts with zeroed-out clean state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('saddam_store_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist & Comparison: zeroed out by default
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saddam_store_wishlist_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);

  // Sync to localStorage when user adds/removes items
  useEffect(() => {
    try {
      localStorage.setItem('saddam_store_cart_v2', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('saddam_store_wishlist_v2', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Modals state
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Home filter tab (all, trending, popular)
  const [homeFilter, setHomeFilter] = useState<'trending' | 'popular' | 'all'>('trending');

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const isAr = language === 'ar';

  // Cart operations
  const handleAddToCart = (
    product: Product,
    variant = product.variants.options[0] || 'الأساسي',
    color = product.colors[0] || '#0f172a',
    qty = 1
  ) => {
    soundFX.playAddToCart();
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedVariant === variant && i.selectedColor === color
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qty;
        return next;
      }
      return [
        ...prev,
        {
          product,
          quantity: qty,
          selectedColor: color,
          selectedVariant: variant,
          warrantyUpgrade: false,
        },
      ];
    });
    // Never force user into cart drawer when adding product: respects user request "دون الدخول الى السله"
  };

  // One-Click Quick Order: directly adds product and opens invoice modal for instant WhatsApp checkout
  const handleQuickOrder = (
    product: Product,
    variant = product.variants.options[0] || 'الأساسي',
    color = product.colors[0] || '#0f172a'
  ) => {
    handleAddToCart(product, variant, color, 1);
    setInvoiceModalOpen(true);
  };

  const handleUpdateQuantity = (idx: number, qty: number) => {
    soundFX.playClick();
    setCart((prev) => {
      const next = [...prev];
      next[idx].quantity = qty;
      return next;
    });
  };

  const handleRemoveFromCart = (idx: number) => {
    soundFX.playClick();
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleWarranty = (idx: number) => {
    soundFX.playClick();
    setCart((prev) => {
      const next = [...prev];
      next[idx].warrantyUpgrade = !next[idx].warrantyUpgrade;
      return next;
    });
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    soundFX.playClick();
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Compare toggle
  const handleToggleCompare = (productId: string) => {
    soundFX.playClick();
    setComparedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), productId];
      }
      return [...prev, productId];
    });
    setCompareModalOpen(true);
  };

  // Navigation handlers
  const handleSelectProduct = (product: Product) => {
    soundFX.playClick();
    setSelectedProduct(product);
    setCurrentView('product');
  };

  const handleSelectCategory = (catId: CategoryId) => {
    soundFX.playWhoosh();
    setSelectedCategory(catId);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter active products (non-hidden) for client views
  const visibleProducts = products.filter((p) => !p.hidden);

  // Home filtered products (supports category selection and trending/popular filters)
  const homeFilteredProducts = visibleProducts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (homeFilter === 'trending') return p.isTrending ?? true;
    if (homeFilter === 'popular') return p.isPopular ?? true;
    return true;
  });

  const displayedHomeProducts = homeFilteredProducts.length > 0 ? homeFilteredProducts : visibleProducts;

  const cartTotalAmount = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 49 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const comparedProducts = products.filter((p) => comparedProductIds.includes(p.id));

  // Standalone Admin Dashboard Website View (User request: لوحه التحكم تضهر كا موقع اخر بالكامل ليس انبثاق)
  if (currentView === 'admin') {
    return (
      <AdminPageView
        products={products}
        onUpdateProducts={(updated) => {
          setProducts(updated);
          saveStoredProducts(updated);
        }}
        shorts={shorts}
        onUpdateShorts={(updated) => {
          setShorts(updated);
          saveStoredShorts(updated);
        }}
        language={language}
        currency={currency}
        onBackToStore={() => {
          setCurrentView('home');
          setDiscountConfig(getStoredDiscountConfig());
        }}
      />
    );
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-white text-gray-dark font-sans selection:bg-primary selection:text-white relative overflow-x-hidden"
    >
      {/* 3D Interactive Ambient Particles & Holographic Orbs */}
      <Ambient3DBackground />

      {/* 1. Master Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'shop') setSelectedCategory('all');
          setCurrentView(view);
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        cartTotal={cartTotalAmount}
        wishlistCount={wishlist.length}
        compareCount={comparedProductIds.length}
        onOpenCartDrawer={() => {
          if (cart.length === 0) {
            setCartDrawerOpen(true);
          } else {
            setInvoiceModalOpen(true);
          }
        }}
        onOpenCompare={() => setCompareModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Store-wide Promo & Discount Announcement Banner (Controlled from Admin Panel) */}
      {discountConfig.enabled && (
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-sm transition-all z-20">
          <span>🔥 {isAr ? discountConfig.bannerTextAr : discountConfig.bannerTextEn}</span>
          {discountConfig.promoCode && (
            <span className="bg-white text-red-600 px-2 py-0.5 rounded-md font-mono text-[11px] font-black uppercase tracking-wider">
              {isAr ? 'كود الخصم:' : 'CODE:'} {discountConfig.promoCode}
            </span>
          )}
        </div>
      )}

      {/* 2. Main Content Area */}
      <main className="flex-grow">
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <>
            {/* Hero Slider with Next-Gen Devices */}
            <HeroSlider
              language={language}
              currency={currency}
              onExplore={() => {
                setSelectedCategory('all');
                setCurrentView('shop');
              }}
              onSelectProduct={handleSelectProduct}
            />

            {/* Authorized Brands Ticker */}
            <BrandTicker language={language} />

            {/* 3D Wave Transition into Categories */}
            <WaveDivider variant="sky-cyan" />

            {/* The 5 Requested Categories (Phones, Audio, Cases, Chargers, Cables) */}
            <CategoriesSection
              language={language}
              onSelectCategory={handleSelectCategory}
              selectedCategory={selectedCategory}
            />

            {/* 3D Wave Transition into Trending */}
            <WaveDivider variant="cyan-orange" />

            {/* Trending & Best Sellers Showcase */}
            <section id="trending-products-section" className="py-14 bg-gray-50 border-t border-gray-line">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-3 border-b border-gray-line gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary text-xs font-bold uppercase tracking-wider block">
                        {isAr ? 'المختارات الأكثر إقبالاً' : 'Flagship Collection'}
                      </span>
                      {selectedCategory !== 'all' && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                          {isAr ? 'قسم مفلتر' : 'Filtered Section'}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-dark tracking-tight">
                      {selectedCategory === 'phones'
                        ? (isAr ? 'الهواتف الذكية المعتمدة' : 'Certified Smartphones')
                        : selectedCategory === 'audio'
                        ? (isAr ? 'السماعات والأنظمة الصوتية' : 'Headphones & Audio')
                        : selectedCategory === 'cases'
                        ? (isAr ? 'كفرات وحماية الأجهزة' : 'Cases & Protection')
                        : selectedCategory === 'chargers'
                        ? (isAr ? 'الشواحن ومنصات الطاقة' : 'Chargers & Power')
                        : selectedCategory === 'cables'
                        ? (isAr ? 'الكيابل والوصلات المعتمدة' : 'Cables & Adapters')
                        : (isAr ? 'الأجهزة والملحقات الأكثر مبيعاً' : 'Best Selling Electronics & Gear')}
                    </h2>
                  </div>

                  {/* Filter & Category Quick Tabs */}
                  <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-line p-1 rounded-xl self-start md:self-auto shadow-xs">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setHomeFilter('trending');
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        homeFilter === 'trending' && selectedCategory === 'all'
                          ? 'bg-primary text-white shadow'
                          : 'text-gray-600 hover:text-gray-dark'
                      }`}
                    >
                      {isAr ? 'الأكثر طلباً' : 'Trending'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setHomeFilter('popular');
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        homeFilter === 'popular' && selectedCategory === 'all'
                          ? 'bg-primary text-white shadow'
                          : 'text-gray-600 hover:text-gray-dark'
                      }`}
                    >
                      {isAr ? 'الأعلى تقييماً' : 'Top Rated'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setHomeFilter('all');
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        homeFilter === 'all' && selectedCategory === 'all'
                          ? 'bg-primary text-white shadow'
                          : 'text-gray-600 hover:text-gray-dark'
                      }`}
                    >
                      {isAr ? 'عرض الكل' : 'All'}
                    </button>
                  </div>
                </div>

                {/* Products Grid: strictly 2 products side by side (grid-cols-2) on mobile & tablets */}
                {visibleProducts.length === 0 ? (
                  <div className="text-center py-14 px-4 bg-white rounded-3xl border border-dashed border-gray-200 max-w-xl mx-auto my-4 shadow-xs">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-1.5">
                      {isAr ? 'متجر صدام العقاري للأجهزة والإلكترونيات' : 'Saddam Al-Aqqari Tech Store'}
                    </h3>
                    <p className="text-xs text-gray-500 mb-5 max-w-md mx-auto leading-relaxed">
                      {isAr
                        ? 'المتجر محمي ومشفر بالكامل. يمكنك الاستفسار والطلب المباشر لكافة الأجهزة والملحقات عبر الواتساب فوراً.'
                        : 'Encrypted and protected store. Contact us directly on WhatsApp for inquiries and instant orders.'}
                    </p>
                    <a
                      href="https://wa.me/967774102030"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isAr ? 'تواصل عبر الواتساب (774102030)' : 'Chat on WhatsApp (774102030)'}</span>
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full min-w-0">
                    {displayedHomeProducts.slice(0, 8).map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        language={language}
                        currency={currency}
                        onSelect={handleSelectProduct}
                        onAddToCart={(p, vr, col) => handleAddToCart(p, vr, col, 1)}
                        onQuickOrder={handleQuickOrder}
                        isWishlisted={wishlist.includes(prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                        isCompared={comparedProductIds.includes(prod.id)}
                        onToggleCompare={handleToggleCompare}
                        onQuickView={(p) => setQuickViewProduct(p)}
                      />
                    ))}
                  </div>
                )}

                {/* View More Button */}
                <div className="text-center mt-10">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentView('shop');
                    }}
                    className="inline-flex items-center gap-2 bg-tech-dark hover:bg-black text-white text-xs md:text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <span>{isAr ? 'استعراض كتالوج الإلكترونيات بالكامل' : 'Explore Entire Tech Catalog'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3D Wave Transition into Promo Banner */}
            <WaveDivider variant="orange-gold" flip />

            {/* Mid-Page Promo Banner (GaN Charging & MagSafe Bundle + 3D Products Coverflow) */}
            <PromoBanner
              language={language}
              currency={currency}
              products={visibleProducts}
              onShopNow={() => {
                setSelectedCategory('chargers');
                setCurrentView('shop');
              }}
              onSelectProduct={handleSelectProduct}
              onAddToCart={(p, vr, col) => handleAddToCart(p, vr, col, 1)}
            />

            {/* 3D Wave Transition into YouTube Shorts */}
            <WaveDivider variant="sky-cyan" />

            {/* Exclusive YouTube Shorts with live video URLs and dynamic admin controls */}
            <YouTubeShortsSection
              language={language}
              currency={currency}
              shorts={shorts}
              products={visibleProducts}
              onSelectProduct={handleSelectProduct}
            />

            {/* 3D Wave Transition into Social Media Showcase */}
            <WaveDivider variant="cyan-orange" />

            {/* Official Social Media Showcase (استعراض قنوات التواصل والفيديوهات مع تقلبات تفاعلية ومزج فخم) */}
            <SocialMediaShowcase language={language} />

            {/* 3D Wave Transition above Footer */}
            <WaveDivider variant="orange-gold" />
          </>
        )}

        {/* VIEW 2: SHOP CATALOG */}
        {currentView === 'shop' && (
          <ShopView
            products={visibleProducts}
            language={language}
            currency={currency}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vr, col) => handleAddToCart(p, vr, col, 1)}
            onQuickOrder={handleQuickOrder}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            comparedIds={comparedProductIds}
            onToggleCompare={handleToggleCompare}
            initialCategory={selectedCategory}
            onCategoryChange={(cat) => setSelectedCategory(cat)}
          />
        )}

        {/* VIEW 3: PRODUCT DETAIL */}
        {currentView === 'product' && (
          <ProductDetailView
            product={selectedProduct}
            language={language}
            currency={currency}
            onBack={() => setCurrentView('shop')}
            onAddToCart={(p, vr, col, q) => handleAddToCart(p, vr, col, q)}
            onQuickOrder={(p, vr, col, q) => {
              handleAddToCart(p, vr, col, q);
              setInvoiceModalOpen(true);
            }}
            onSelectRelated={handleSelectProduct}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            isCompared={comparedProductIds.includes(selectedProduct.id)}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {/* VIEW 4: FULL CART VIEW */}
        {currentView === 'cart' && (
          <CartView
            cart={cart}
            language={language}
            currency={currency}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onToggleWarranty={handleToggleWarranty}
            onContinueShopping={() => {
              setSelectedCategory('all');
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onProceedToCheckout={() => setCurrentView('checkout')}
          />
        )}

        {/* VIEW 5: CHECKOUT VIEW */}
        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            language={language}
            currency={currency}
            onBackToCart={() => setCurrentView('cart')}
            onOrderSuccess={() => {
              setCart([]);
            }}
          />
        )}

        {/* VIEW 6: WHOLESALE B2B VIEW */}
        {currentView === 'wholesale' && (
          <WholesaleView
            language={language}
            currency={currency}
            onBackToStore={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 7: ACCOUNT & ORDER TRACKING */}
        {currentView === 'account' && (
          <AccountView
            language={language}
            currency={currency}
            onBackToStore={() => setCurrentView('home')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* VIEW 8: COMPARE FULL VIEW */}
        {currentView === 'compare' && (
          <div className="py-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
              <CompareModal
                isOpen={true}
                onClose={() => setCurrentView('shop')}
                products={comparedProducts}
                language={language}
                currency={currency}
                onRemoveFromCompare={(id) =>
                  setComparedProductIds((prev) => prev.filter((pId) => pId !== id))
                }
                onAddToCart={(prod) => handleAddToCart(prod)}
                onSelectProduct={handleSelectProduct}
              />
            </div>
          </div>
        )}
      </main>

      {/* 3. Global Drawers & Modals */}
      {/* Floating Cart Bar (الزر الطولي المخصص للطلب أسفل الشاشة مثل الفيديو) */}
      <FloatingCartBar
        cart={cart}
        onOpenInvoice={() => setInvoiceModalOpen(true)}
      />

      {/* Invoice Modal (الفاتورة مع خياري الواتساب وتنزيل الفاتورة التلقائي) */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onBrowseProducts={() => {
          setInvoiceModalOpen(false);
          setSelectedCategory('all');
          setCurrentView('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => {
          setInvoiceModalOpen(false);
          setSelectedCategory(cat);
          setCurrentView('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        language={language}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onToggleWarranty={handleToggleWarranty}
        onOpenInvoice={() => {
          setCartDrawerOpen(false);
          setInvoiceModalOpen(true);
        }}
        onProceedToCheckout={() => {
          setCartDrawerOpen(false);
          setInvoiceModalOpen(true);
        }}
        onViewFullCart={() => {
          setCartDrawerOpen(false);
          setCurrentView('cart');
        }}
        onBrowseProducts={() => {
          setCartDrawerOpen(false);
          setSelectedCategory('all');
          setCurrentView('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => {
          setCartDrawerOpen(false);
          setSelectedCategory(cat);
          setCurrentView('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Side-by-Side Comparison Modal */}
      {currentView !== 'compare' && (
        <CompareModal
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          products={comparedProducts}
          language={language}
          currency={currency}
          onRemoveFromCompare={(id) =>
            setComparedProductIds((prev) => prev.filter((pId) => pId !== id))
          }
          onAddToCart={(prod) => handleAddToCart(prod)}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {/* Live Instant Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={visibleProducts}
        language={language}
        currency={currency}
        onSelectProduct={handleSelectProduct}
      />

      {/* Auth / VIP Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        language={language}
        onSuccessLogin={() => setCurrentView('account')}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        language={language}
        currency={currency}
        onAddToCart={(p, vr, col, q) => handleAddToCart(p, vr, col, q)}
        onQuickOrder={(p, vr, col, q) => {
          handleAddToCart(p, vr, col, q);
          setQuickViewProduct(null);
          setInvoiceModalOpen(true);
        }}
        onViewFullDetails={handleSelectProduct}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Flying Cart Animation Overlay ("رجم وإلقاء صورة المنتج إلى السلة بعدة طرق") */}
      <FlyingCartAnimation />

      {/* Floating 3D VIP Social Dock (منصات التواصل الاجتماعي الرسمية وخدمة العملاء) */}
      <FloatingSocialDock
        language={language}
        onOpenAdmin={() => setCurrentView('admin')}
      />

      {/* 4. Luxury Footer */}
      <Footer
        language={language}
        onSelectCategory={handleSelectCategory}
        onNavigate={(view) => {
          if (view === 'shop') setSelectedCategory('all');
          setCurrentView(view);
        }}
      />
    </div>
  );
}
