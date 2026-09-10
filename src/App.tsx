import { useState, useEffect } from 'react';
import { PageView, Language, Currency, CategoryId, Product, CartItem } from './types';
import { mockProducts } from './data/mockData';

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

export default function App() {
  // App navigation state
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [language, setLanguage] = useState<Language>('ar');
  const [currency, setCurrency] = useState<Currency>('YER');
  const [selectedProduct, setSelectedProduct] = useState<Product>(mockProducts[0]);
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

  const handleUpdateQuantity = (idx: number, qty: number) => {
    setCart((prev) => {
      const next = [...prev];
      next[idx].quantity = qty;
      return next;
    });
  };

  const handleRemoveFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleWarranty = (idx: number) => {
    setCart((prev) => {
      const next = [...prev];
      next[idx].warrantyUpgrade = !next[idx].warrantyUpgrade;
      return next;
    });
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Compare toggle
  const handleToggleCompare = (productId: string) => {
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
    setSelectedProduct(product);
    setCurrentView('product');
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setCurrentView('shop');
  };

  // Home filtered products
  const homeFilteredProducts = mockProducts.filter((p) => {
    if (homeFilter === 'trending') return p.isTrending;
    if (homeFilter === 'popular') return p.isPopular;
    return true;
  });

  const cartTotalAmount = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 49 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const comparedProducts = mockProducts.filter((p) => comparedProductIds.includes(p.id));

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-white text-gray-dark font-sans selection:bg-primary selection:text-white"
    >
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
        onOpenCartDrawer={() => setInvoiceModalOpen(true)}
        onOpenCompare={() => setCompareModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />

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

            {/* The 5 Requested Categories (Phones, Audio, Cases, Chargers, Cables) */}
            <CategoriesSection
              language={language}
              onSelectCategory={handleSelectCategory}
            />

            {/* Trending & Best Sellers Showcase */}
            <section id="trending-products-section" className="py-14 bg-gray-50 border-t border-gray-line">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-3 border-b border-gray-line">
                  <div>
                    <span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">
                      {isAr ? 'المختارات الأكثر إقبالاً' : 'Flagship Collection'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-dark tracking-tight">
                      {isAr ? 'الأجهزة والملحقات الأكثر مبيعاً' : 'Best Selling Electronics & Gear'}
                    </h2>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 mt-4 md:mt-0 bg-white border border-gray-line p-1 rounded-xl self-start md:self-auto">
                    <button
                      onClick={() => setHomeFilter('trending')}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors ${
                        homeFilter === 'trending' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-dark'
                      }`}
                    >
                      {isAr ? 'الأكثر طلباً' : 'Trending'}
                    </button>
                    <button
                      onClick={() => setHomeFilter('popular')}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors ${
                        homeFilter === 'popular' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-dark'
                      }`}
                    >
                      {isAr ? 'الأعلى تقييماً' : 'Top Rated'}
                    </button>
                    <button
                      onClick={() => setHomeFilter('all')}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors ${
                        homeFilter === 'all' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-dark'
                      }`}
                    >
                      {isAr ? 'عرض الكل' : 'All'}
                    </button>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {homeFilteredProducts.slice(0, 8).map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      language={language}
                      currency={currency}
                      onSelect={handleSelectProduct}
                      onAddToCart={(p, vr, col) => handleAddToCart(p, vr, col, 1)}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={handleToggleWishlist}
                      isCompared={comparedProductIds.includes(prod.id)}
                      onToggleCompare={handleToggleCompare}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

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

            {/* Mid-Page Promo Banner (GaN Charging & MagSafe Bundle) */}
            <PromoBanner
              language={language}
              onShopNow={() => {
                setSelectedCategory('chargers');
                setCurrentView('shop');
              }}
            />
          </>
        )}

        {/* VIEW 2: SHOP CATALOG */}
        {currentView === 'shop' && (
          <ShopView
            products={mockProducts}
            language={language}
            currency={currency}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vr, col) => handleAddToCart(p, vr, col, 1)}
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
            onContinueShopping={() => setCurrentView('shop')}
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
        products={mockProducts}
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
        onViewFullDetails={handleSelectProduct}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Flying Cart Animation Overlay ("رجم وإلقاء صورة المنتج إلى السلة بعدة طرق") */}
      <FlyingCartAnimation />

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
