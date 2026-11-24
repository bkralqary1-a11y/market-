import { useState, useEffect } from 'react';
import { PageView, Language, Currency, CategoryId, Product, CartItem } from './types';
import { mockProducts } from './data/mockData';
import { getStoredProducts, getStoredDiscountConfig, StoreDiscountConfig } from './utils/storeStorage';
import { MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react';

// Components
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import BrandTicker from './components/BrandTicker';
import CategoriesSection from './components/CategoriesSection';
import ProductCard from './components/ProductCard';
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
import FloatingSocialDock from './components/FloatingSocialDock';
import { soundFX } from './utils/audioEffects';

export default function App() {
  const [products] = useState<Product[]>(() => getStoredProducts());
  const [discountConfig] = useState<StoreDiscountConfig>(() => getStoredDiscountConfig());

  // Navigation state
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [language, setLanguage] = useState<Language>('ar');
  const [currency, setCurrency] = useState<Currency>('YER');
  const [selectedProduct, setSelectedProduct] = useState<Product>(() =>
    products.length > 0 ? products[0] : mockProducts[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('saddam_store_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist & Comparison
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saddam_store_wishlist_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);

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

  // Home filter tab
  const [homeFilter, setHomeFilter] = useState<'trending' | 'popular' | 'all'>('trending');

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
  };

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

  const handleToggleWishlist = (productId: string) => {
    soundFX.playClick();
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

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

  const visibleProducts = products.filter((p) => !p.hidden);

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

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col text-[#0b1220] font-sans selection:bg-[#0071e3] selection:text-white relative overflow-x-hidden"
    >
      {/* iOS 27 Liquid Glass Atmospheric Refraction Canvas */}
      <Ambient3DBackground />

      {/* 1. Floating iOS 27 Liquid Glass Header */}
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

      {/* Slim Liquid Glass Announcement Strip (if enabled) */}
      {discountConfig.enabled && (
        <div className="px-3 sm:px-5 pt-1 relative z-20">
          <div className="container mx-auto max-w-7xl liquid-glass rounded-2xl py-2 px-4 text-center text-xs font-bold text-[#0b1220] flex flex-wrap items-center justify-center gap-2">
            <span>{isAr ? discountConfig.bannerTextAr : discountConfig.bannerTextEn}</span>
            {discountConfig.promoCode && (
              <span className="text-[#0071e3] font-mono font-black tracking-wider">
                {isAr ? 'الكود:' : 'CODE:'} {discountConfig.promoCode}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Content Area */}
      <main className="flex-grow relative z-10">
        {/* VIEW 1: TRUSTBUY LIQUID GLASS HOMEPAGE */}
        {currentView === 'home' && (
          <>
            {/* Section 1: TrustBuy Bento Hero Showcase */}
            <HeroSlider
              language={language}
              currency={currency}
              onExplore={(cat) => {
                setSelectedCategory(cat || 'all');
                setCurrentView('shop');
              }}
              onSelectProduct={handleSelectProduct}
            />

            {/* Section 2: TrustBuy Trust Pillars + Authorized Brands Ribbon */}
            <BrandTicker language={language} />

            {/* Section 3: Curated Liquid Glass Categories */}
            <CategoriesSection
              language={language}
              onSelectCategory={handleSelectCategory}
              selectedCategory={selectedCategory}
            />

            {/* Section 4: Featured & Best-Selling Products Grid */}
            <section id="trending-products-section" className="py-10 sm:py-14 px-3 sm:px-5">
              <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs font-bold text-[#0071e3] block mb-1">
                      {isAr ? 'مختارات الثقة والأكثر طلباً' : 'Trusted Bestsellers'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1220] tracking-tight">
                      {isAr ? 'أحدث الأجهزة والملحقات الأصلية' : 'Featured Devices & Accessories'}
                    </h2>
                  </div>

                  {/* iOS 27 Liquid Glass Segmented Filter Control */}
                  <div className="liquid-glass-capsule p-1 rounded-2xl inline-flex items-center gap-1 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setSelectedCategory('all');
                        setHomeFilter('trending');
                      }}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        homeFilter === 'trending' && selectedCategory === 'all'
                          ? 'liquid-btn-primary text-white'
                          : 'text-slate-700 hover:text-[#0b1220]'
                      }`}
                    >
                      {isAr ? 'الأكثر طلباً' : 'Trending'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setSelectedCategory('all');
                        setHomeFilter('popular');
                      }}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        homeFilter === 'popular' && selectedCategory === 'all'
                          ? 'liquid-btn-primary text-white'
                          : 'text-slate-700 hover:text-[#0b1220]'
                      }`}
                    >
                      {isAr ? 'الأعلى تقييماً' : 'Top Rated'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setSelectedCategory('all');
                        setHomeFilter('all');
                      }}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        homeFilter === 'all' && selectedCategory === 'all'
                          ? 'liquid-btn-primary text-white'
                          : 'text-slate-700 hover:text-[#0b1220]'
                      }`}
                    >
                      {isAr ? 'عرض الكل' : 'All'}
                    </button>
                  </div>
                </div>

                {/* Products Grid */}
                {visibleProducts.length === 0 ? (
                  <div className="text-center py-14 px-6 liquid-glass rounded-[30px] max-w-xl mx-auto my-4">
                    <h3 className="text-lg font-extrabold text-[#0b1220] mb-2">
                      {isAr ? 'متجر صدام العقاري للهواتف الذكية' : 'Saddam Al-Aqari Tech Store'}
                    </h3>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                      {isAr
                        ? 'يمكنك الاستفسار والطلب المباشر لكافة الأجهزة والملحقات الأصلية عبر الواتساب فوراً.'
                        : 'Contact us directly on WhatsApp for inquiries and instant orders.'}
                    </p>
                    <a
                      href="https://wa.me/967774102030"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 liquid-btn-emerald font-bold text-sm px-6 py-3 rounded-2xl"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isAr ? 'تواصل عبر الواتساب (774102030)' : 'Chat on WhatsApp (774102030)'}</span>
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 w-full min-w-0">
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

                {/* Explore Full Catalog Button */}
                <div className="text-center mt-10">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedCategory('all');
                      setCurrentView('shop');
                    }}
                    className="inline-flex items-center gap-2.5 liquid-glass-strong hover:bg-white text-[#0b1220] hover:text-[#0071e3] text-sm font-extrabold px-8 py-3.5 rounded-2xl transition-all cursor-pointer"
                  >
                    <span>{isAr ? 'استعراض جميع الأجهزة في الكتالوج' : 'Explore Complete Tech Catalog'}</span>
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </section>
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
          <div className="py-12 min-h-screen px-3 sm:px-5">
            <div className="container mx-auto max-w-6xl">
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
      <FloatingCartBar
        cart={cart}
        onOpenInvoice={() => setInvoiceModalOpen(true)}
      />

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

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={visibleProducts}
        language={language}
        currency={currency}
        onSelectProduct={handleSelectProduct}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        language={language}
        onSuccessLogin={() => setCurrentView('account')}
      />

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

      <FlyingCartAnimation />

      <FloatingSocialDock language={language} />

      {/* 4. TrustBuy Liquid Glass Footer */}
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
