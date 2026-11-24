import { useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult, signOut, type User } from 'firebase/auth';
import { PageView, Language, Currency, CategoryId, Product, CartItem, HeroSlideItem } from './types';
import {
  DEFAULT_HERO_SLIDES,
  INITIAL_PRODUCTS_LIST,
} from './utils/storeStorage';
import { MessageCircle, ArrowLeft, ArrowRight, Pencil, Eye, EyeOff } from 'lucide-react';
import { auth, isVerifiedAdminUser } from './firebase';
import {
  SiteConfig,
  DEFAULT_SITE_CONFIG,
  getStoreCategories,
  subscribeToProducts,
  subscribeToHeroSlides,
  subscribeToSiteConfig,
  saveProductToCloud,
  deleteProductFromCloud,
  saveHeroSlideToCloud,
  deleteHeroSlideFromCloud,
  saveSiteConfigToCloud,
  seedDefaultDataToCloud,
} from './services/firestoreService';

// Components
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import BrandTicker from './components/BrandTicker';
import CategoriesSection from './components/CategoriesSection';
import ProductCard from './components/ProductCard';
import AddProductTile from './components/AddProductTile';
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
import AdminAuthModal from './components/AdminAuthModal';
import AdminFloatingBar from './components/AdminFloatingBar';
import VisualProductEditorModal from './components/VisualProductEditorModal';
import VisualSectionEditorModal, {
  type EditableSectionTarget,
} from './components/VisualSectionEditorModal';
import { soundFX } from './utils/audioEffects';

export default function App() {
  // Live Firestore Data (strictly reflects cloud catalog once synced — never resurrects deleted products)
  const [cloudProducts, setCloudProducts] = useState<Product[]>([]);
  const [hasCloudProducts, setHasCloudProducts] = useState(false);
  const [productsSynced, setProductsSynced] = useState(false);
  const [cloudSlides, setCloudSlides] = useState<HeroSlideItem[]>([]);
  const [hasCloudSlides, setHasCloudSlides] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [hasCloudConfig, setHasCloudConfig] = useState(false);

  const products = productsSynced ? cloudProducts : [];
  const heroSlides = hasCloudSlides ? cloudSlides : DEFAULT_HERO_SLIDES;
  const allStoreCategories = getStoreCategories(siteConfig, true);

  // Firebase Auth & Hidden Visual Admin Mode State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [newProductDefaultCat, setNewProductDefaultCat] = useState<CategoryId>('phones');
  const [editingSection, setEditingSection] = useState<EditableSectionTarget | null>(null);
  const [seedingCloud, setSeedingCloud] = useState(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const isAdminVerified = isVerifiedAdminUser(authUser);
  const isAdminMode = adminModeEnabled && isAdminVerified;

  const showAdminToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3200);
  };

  // Subscribe to Firebase Auth state & handle redirect login completion
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user && isVerifiedAdminUser(result.user)) {
          try {
            sessionStorage.removeItem('saddam_pending_admin_redirect');
          } catch {
            // ignore
          }
          setAdminModeEnabled(true);
          showAdminToast('أهلاً بك! تم تفعيل وضع التعديل المباشر للمتجر');
        }
      })
      .catch((err) => {
        console.error('Redirect auth error:', err);
      });

    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (isVerifiedAdminUser(user)) {
        try {
          if (sessionStorage.getItem('saddam_pending_admin_redirect') === '1') {
            sessionStorage.removeItem('saddam_pending_admin_redirect');
            setAdminModeEnabled(true);
            showAdminToast('أهلاً بك! تم تفعيل وضع التعديل المباشر للمتجر');
          }
        } catch {
          // ignore
        }
      } else {
        setAdminModeEnabled(false);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to live Firestore collections
  useEffect(() => {
    const unsubProducts = subscribeToProducts((list, hasDocs) => {
      setCloudProducts(list);
      setHasCloudProducts(hasDocs);
      setProductsSynced(true);
    }, isAdminVerified);
    const unsubSlides = subscribeToHeroSlides((list, hasDocs) => {
      setCloudSlides(list);
      setHasCloudSlides(hasDocs);
    }, isAdminVerified);
    const unsubConfig = subscribeToSiteConfig((cfg, hasDoc) => {
      setSiteConfig(cfg);
      setHasCloudConfig(hasDoc);
    });
    return () => {
      unsubProducts();
      unsubSlides();
      unsubConfig();
    };
  }, [isAdminVerified]);

  // Navigation state
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [language, setLanguage] = useState<Language>('ar');
  const [currency, setCurrency] = useState<Currency>('YER');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  // Keep selectedProduct fresh if updated or deleted in Firestore
  useEffect(() => {
    if (!selectedProduct) return;
    const match = products.find((p) => p.id === selectedProduct.id);
    if (match) {
      if (match !== selectedProduct) setSelectedProduct(match);
    } else if (productsSynced) {
      setSelectedProduct(null);
      if (currentView === 'product') {
        setCurrentView('home');
      }
    }
  }, [products, selectedProduct, productsSynced, currentView]);

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

  // Silent Long-Press Trigger (from Footer copyright line)
  const handleTriggerHiddenAdmin = () => {
    if (isVerifiedAdminUser(auth.currentUser)) {
      setAdminModeEnabled(true);
      showAdminToast('تم تفعيل وضع التعديل المباشر للمتجر');
    } else {
      setAdminAuthModalOpen(true);
    }
  };

  // Admin Cloud CRUD Handlers
  const handleAdminSaveProduct = async (prod: Product) => {
    await saveProductToCloud(prod);
    showAdminToast('تم حفظ المنتج وتحديث المتجر مباشرة');
  };

  const handleAdminDeleteProduct = async (productId: string) => {
    await deleteProductFromCloud(productId);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    setWishlist((prev) => prev.filter((id) => id !== productId));
    setComparedProductIds((prev) => prev.filter((id) => id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
      setCurrentView('home');
    }
    showAdminToast('تم حذف المنتج نهائياً من السحابة');
  };

  const handleAdminSaveHeroSlide = async (slide: HeroSlideItem, order: number) => {
    if (!hasCloudSlides) {
      for (let i = 0; i < DEFAULT_HERO_SLIDES.length; i++) {
        if (DEFAULT_HERO_SLIDES[i].id !== slide.id) {
          await saveHeroSlideToCloud(DEFAULT_HERO_SLIDES[i], i);
        }
      }
    }
    await saveHeroSlideToCloud(slide, order);
    showAdminToast('تم تحديث شريحة الواجهة الرئيسية بنجاح');
  };

  const handleAdminDeleteHeroSlide = async (slideId: string) => {
    await deleteHeroSlideFromCloud(slideId);
    showAdminToast('تم حذف الشريحة');
  };

  const handleAdminSaveSiteConfig = async (nextCfg: SiteConfig) => {
    await saveSiteConfigToCloud(nextCfg);
    showAdminToast('تم حفظ تعديلات الواجهة والإعدادات');
  };

  const handleToggleSiteBlock = async (
    field:
      | 'hideHero'
      | 'hideBento1'
      | 'hideBento2'
      | 'hideTrustPillars'
      | 'hideBrandsBar'
      | 'hideCategoriesSection'
      | 'hideProductsSection'
  ) => {
    const nextValue = !Boolean(siteConfig[field]);
    const nextCfg: SiteConfig = { ...siteConfig, [field]: nextValue };
    setSiteConfig(nextCfg);
    await saveSiteConfigToCloud(nextCfg);
    showAdminToast(nextValue ? 'تم إخفاء هذا المربع عن الزوار' : 'تم إظهار هذا المربع مجدداً');
  };

  const handleToggleCategoryHide = async (catId: string, isCustom: boolean) => {
    let nextCfg: SiteConfig;
    if (isCustom) {
      const updated = (siteConfig.customCategories || []).map((c) =>
        c.id === catId ? { ...c, hidden: !c.hidden } : c
      );
      nextCfg = { ...siteConfig, customCategories: updated };
    } else {
      const current = new Set(siteConfig.hiddenCategories || []);
      if (current.has(catId)) {
        current.delete(catId);
      } else {
        current.add(catId);
      }
      nextCfg = { ...siteConfig, hiddenCategories: Array.from(current) };
    }
    setSiteConfig(nextCfg);
    await saveSiteConfigToCloud(nextCfg);
    showAdminToast('تم تحديث ظهور القسم في المتجر');
  };

  const handleSeedCloud = async () => {
    setSeedingCloud(true);
    try {
      await seedDefaultDataToCloud(
        products.length > 0 ? products : INITIAL_PRODUCTS_LIST,
        heroSlides,
        siteConfig
      );
      showAdminToast('تم رفع كافة بيانات المتجر للسحابة بنجاح');
    } catch {
      showAdminToast('تعذر الرفع — تأكد من تسجيل الدخول بحساب المالك');
    } finally {
      setSeedingCloud(false);
    }
  };

  const handleAdminSignOut = async () => {
    await signOut(auth);
    setAdminModeEnabled(false);
    setEditingProduct(undefined);
    setEditingSection(null);
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    variant = product.variants?.options?.[0] || '',
    color = product.colors?.[0] || '',
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
    variant = product.variants?.options?.[0] || '',
    color = product.colors?.[0] || ''
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

  // In Admin Mode show hidden products too so owner can edit or unhide them
  const displayableProducts = isAdminMode ? products : products.filter((p) => !p.hidden);

  const homeFilteredProducts = displayableProducts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (homeFilter === 'trending') return p.isTrending ?? true;
    if (homeFilter === 'popular') return p.isPopular ?? true;
    return true;
  });

  const displayedHomeProducts =
    homeFilteredProducts.length > 0 ? homeFilteredProducts : displayableProducts;

  const cartTotalAmount = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 49 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const comparedProducts = products.filter((p) => comparedProductIds.includes(p.id));
  const waClean = siteConfig.whatsappPrimary.replace(/\D/g, '') || '774102030';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col text-[#0b1220] font-sans selection:bg-[#0071e3] selection:text-white relative overflow-x-hidden ${
        isAdminMode ? 'pb-24' : ''
      }`}
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
        siteConfig={siteConfig}
        isAdminMode={isAdminMode}
        onAdminEditStore={() => setEditingSection({ type: 'storeSettings' })}
      />

      {/* Slim Liquid Glass Announcement Strip (if enabled or in Admin Mode) */}
      {(siteConfig.bannerEnabled || isAdminMode) && (
        <div className="px-3 sm:px-5 pt-1 relative z-20">
          <div className="container mx-auto max-w-7xl liquid-glass rounded-2xl py-2 px-4 text-center text-xs font-bold text-[#0b1220] flex flex-wrap items-center justify-center gap-2">
            <span>
              {siteConfig.bannerEnabled
                ? isAr
                  ? siteConfig.bannerTextAr
                  : siteConfig.bannerTextEn
                : 'شريط العروض العلوي (مخفي عن الزوار حالياً — اضغط القلم لتفعيله وتعديله)'}
            </span>
            {siteConfig.bannerEnabled && siteConfig.promoCode && (
              <span className="text-[#0071e3] font-mono font-black tracking-wider">
                {isAr ? 'الكود:' : 'CODE:'} {siteConfig.promoCode}
              </span>
            )}
            {isAdminMode && (
              <button
                type="button"
                onClick={() => setEditingSection({ type: 'storeSettings' })}
                className="w-6 h-6 rounded-lg bg-[#0071e3] text-white inline-flex items-center justify-center cursor-pointer"
                title="تعديل شريط العروض"
              >
                <Pencil className="w-3 h-3" />
              </button>
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
              slides={heroSlides}
              siteConfig={siteConfig}
              isAdminMode={isAdminMode}
              onAdminEditSection={(target) => setEditingSection(target)}
              onToggleBlockHide={(field) => handleToggleSiteBlock(field)}
            />

            {/* Section 2: Trust Pillars + Authorized Brands Ribbon */}
            <BrandTicker
              language={language}
              siteConfig={siteConfig}
              isAdminMode={isAdminMode}
              onToggleBlockHide={(field) => handleToggleSiteBlock(field)}
            />

            {/* Section 3: Curated Liquid Glass Categories (Swipeable + Admin Add Category) */}
            <CategoriesSection
              language={language}
              onSelectCategory={handleSelectCategory}
              selectedCategory={selectedCategory}
              siteConfig={siteConfig}
              products={products}
              isAdminMode={isAdminMode}
              onAdminEditSection={(target) => setEditingSection(target)}
              onToggleSectionHide={() => handleToggleSiteBlock('hideCategoriesSection')}
              onToggleCategoryHide={handleToggleCategoryHide}
            />

            {/* Section 4: Featured & Best-Selling Products Grid */}
            {siteConfig.hideProductsSection && !isAdminMode ? null : siteConfig.hideProductsSection &&
              isAdminMode ? (
              <section className="py-4 px-3 sm:px-5">
                <div className="container mx-auto max-w-7xl">
                  <div className="liquid-glass rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-50/50 px-4 py-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-extrabold text-amber-900 flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-amber-600" />
                      <span>قسم المنتجات في الواجهة الرئيسية مخفي عن الزوار حالياً</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleSiteBlock('hideProductsSection')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>إظهار القسم</span>
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <section id="trending-products-section" className="py-10 sm:py-14 px-3 sm:px-5">
                <div className="container mx-auto max-w-7xl">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div>
                        <span className="text-xs font-bold text-[#0071e3] block mb-1">
                          {isAr ? siteConfig.productsSectionBadgeAr : 'Trusted Bestsellers'}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1220] tracking-tight">
                          {isAr ? siteConfig.productsSectionTitleAr : 'Featured Devices & Accessories'}
                        </h2>
                      </div>
                      {isAdminMode && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingSection({ type: 'productsHeader' })}
                            className="w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white flex items-center justify-center shadow-md cursor-pointer shrink-0"
                            title="تعديل عنوان قسم المنتجات"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleSiteBlock('hideProductsSection')}
                            className="px-2.5 h-8 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shadow-md cursor-pointer shrink-0"
                            title="إخفاء قسم المنتجات"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">إخفاء القسم</span>
                          </button>
                        </div>
                      )}
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
                  {displayableProducts.length === 0 && !isAdminMode ? (
                    <div className="text-center py-14 px-6 liquid-glass rounded-[30px] max-w-xl mx-auto my-4">
                      <h3 className="text-lg font-extrabold text-[#0b1220] mb-2">
                        {isAr ? siteConfig.storeNameAr : siteConfig.storeNameEn}
                      </h3>
                      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                        {isAr
                          ? 'يمكنك الاستفسار والطلب المباشر لكافة الأجهزة والملحقات عبر الواتساب فوراً.'
                          : 'Contact us directly on WhatsApp for inquiries and instant orders.'}
                      </p>
                      <a
                        href={`https://wa.me/967${waClean}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 liquid-btn-emerald font-bold text-sm px-6 py-3 rounded-2xl"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          {isAr ? `تواصل عبر الواتساب (${waClean})` : `Chat on WhatsApp (${waClean})`}
                        </span>
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 w-full min-w-0">
                      {(isAdminMode ? displayedHomeProducts : displayedHomeProducts.slice(0, 8)).map(
                        (prod) => (
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
                            isAdminMode={isAdminMode}
                            onAdminEdit={(p) => setEditingProduct(p)}
                          />
                        )
                      )}
                      {isAdminMode && (
                        <AddProductTile
                          language={language}
                          onClick={() => {
                            setNewProductDefaultCat(allStoreCategories[0]?.id || 'phones');
                            setEditingProduct(null);
                          }}
                        />
                      )}
                    </div>
                  )}

                  {displayableProducts.length > 0 && (
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
                        <span>
                          {isAr ? 'استعراض جميع المنتجات في الكتالوج' : 'Explore Complete Catalog'}
                        </span>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {/* VIEW 2: SHOP CATALOG */}
        {currentView === 'shop' && (
          <ShopView
            products={displayableProducts}
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
            siteConfig={siteConfig}
            isAdminMode={isAdminMode}
            onAdminEditProduct={(p) => setEditingProduct(p)}
            onAdminAddProduct={(cat) => {
              setNewProductDefaultCat(cat === 'all' ? allStoreCategories[0]?.id || 'phones' : cat);
              setEditingProduct(null);
            }}
          />
        )}

        {/* VIEW 3: PRODUCT DETAIL */}
        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            allProducts={displayableProducts}
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
      {!isAdminMode && (
        <FloatingCartBar
          cart={cart}
          onOpenInvoice={() => setInvoiceModalOpen(true)}
        />
      )}

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
        products={displayableProducts}
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

      {!isAdminMode && <FloatingSocialDock language={language} />}

      {/* Hidden Admin Auth Gate (Opened ONLY via silent 7-second long-press) */}
      <AdminAuthModal
        isOpen={adminAuthModalOpen}
        onClose={() => setAdminAuthModalOpen(false)}
        currentUser={authUser}
        onAuthenticated={() => {
          setAdminAuthModalOpen(false);
          setAdminModeEnabled(true);
          showAdminToast('أهلاً بك! تم تفعيل وضع التعديل المباشر للمتجر');
        }}
      />

      {/* Visual Admin Mode Editors & Floating Control Bar (Authenticated Owner Only) */}
      {isAdminMode && (
        <>
          <AdminFloatingBar
            adminEmail={authUser?.email || ''}
            needsInitialSeed={!hasCloudProducts || !hasCloudSlides || !hasCloudConfig}
            seeding={seedingCloud}
            toastMessage={adminToast}
            onAddNewProduct={() => {
              setNewProductDefaultCat(selectedCategory === 'all' ? 'phones' : selectedCategory);
              setEditingProduct(null);
            }}
            onOpenStoreSettings={() => setEditingSection({ type: 'storeSettings' })}
            onSeedCloud={handleSeedCloud}
            onExitEditMode={() => setAdminModeEnabled(false)}
            onSignOut={handleAdminSignOut}
          />

          <VisualProductEditorModal
            isOpen={editingProduct !== undefined}
            product={editingProduct ?? null}
            defaultCategory={newProductDefaultCat}
            categories={allStoreCategories}
            onClose={() => setEditingProduct(undefined)}
            onSave={handleAdminSaveProduct}
            onDelete={handleAdminDeleteProduct}
          />

          <VisualSectionEditorModal
            target={editingSection}
            siteConfig={siteConfig}
            heroSlides={heroSlides}
            onClose={() => setEditingSection(null)}
            onSaveSiteConfig={handleAdminSaveSiteConfig}
            onSaveHeroSlide={handleAdminSaveHeroSlide}
            onDeleteHeroSlide={handleAdminDeleteHeroSlide}
          />
        </>
      )}

      {/* 4. Compact Liquid Glass Footer (Homepage Only) */}
      {currentView === 'home' && (
        <Footer
          language={language}
          onSelectCategory={handleSelectCategory}
          onNavigate={(view) => {
            if (view === 'shop') setSelectedCategory('all');
            setCurrentView(view);
          }}
          siteConfig={siteConfig}
          isAdminMode={isAdminMode}
          onAdminEditStore={() => setEditingSection({ type: 'storeSettings' })}
          onTriggerHiddenAdmin={handleTriggerHiddenAdmin}
        />
      )}
    </div>
  );
}
