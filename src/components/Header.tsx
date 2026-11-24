import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Menu,
  X,
  Smartphone,
  Headphones,
  Shield,
  Zap,
  Cable,
  Truck,
  Building2,
  ShieldCheck,
  Pencil,
} from 'lucide-react';
import { PageView, Language, Currency, CategoryId } from '../types';
import { formatPrice } from '../data/mockData';
import { soundFX } from '../utils/audioEffects';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../services/firestoreService';

interface HeaderProps {
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  compareCount: number;
  onOpenCartDrawer: () => void;
  onOpenCompare: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  siteConfig?: SiteConfig;
  isAdminMode?: boolean;
  onAdminEditStore?: () => void;
}

export default function Header({
  currentView,
  setCurrentView,
  selectedCategory,
  onSelectCategory,
  cartCount,
  cartTotal,
  compareCount,
  onOpenCartDrawer,
  onOpenCompare,
  language,
  setLanguage,
  currency,
  onOpenSearch,
  siteConfig = DEFAULT_SITE_CONFIG,
  isAdminMode = false,
  onAdminEditStore,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartBumping, setCartBumping] = useState(false);
  const isAr = language === 'ar';

  useEffect(() => {
    const handleBump = () => {
      setCartBumping(true);
      setTimeout(() => setCartBumping(false), 650);
    };
    window.addEventListener('cart-bump', handleBump);
    return () => window.removeEventListener('cart-bump', handleBump);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const categoryLinks: { id: CategoryId; nameEn: string; nameAr: string; icon: ReactNode }[] = [
    { id: 'phones', nameEn: 'Phones', nameAr: 'الهواتف', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'audio', nameEn: 'Audio', nameAr: 'السماعات', icon: <Headphones className="w-4 h-4" /> },
    { id: 'cases', nameEn: 'Cases', nameAr: 'الكفرات', icon: <Shield className="w-4 h-4" /> },
    { id: 'chargers', nameEn: 'Chargers', nameAr: 'الشواحن', icon: <Zap className="w-4 h-4" /> },
    { id: 'cables', nameEn: 'Cables', nameAr: 'الكيابل', icon: <Cable className="w-4 h-4" /> },
  ];

  return (
    <header className={`sticky top-0 ${mobileMenuOpen ? 'z-[9999]' : 'z-40'} px-3 sm:px-5 pt-2.5 pb-1.5 transition-all`}>
      {/* Floating iOS 27 Liquid Glass Bar */}
      <div className="container mx-auto max-w-7xl liquid-glass-strong rounded-[26px] px-3.5 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* ZONE 1: Brand Wordmark (Single clean line) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-2xl liquid-glass-subtle flex items-center justify-center text-slate-800 hover:text-[#0071e3] transition-colors cursor-pointer"
              aria-label={isAr ? 'فتح القائمة' : 'Open menu'}
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setCurrentView('home');
              }}
              className="flex items-center gap-2.5 group cursor-pointer select-none whitespace-nowrap shrink-0"
              title={isAr ? 'متجر صدام العقاري' : 'Saddam Al-Aqari Store'}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl liquid-btn-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-[#0b1220] font-display whitespace-nowrap">
                {isAr ? siteConfig.storeNameAr : siteConfig.storeNameEn}
              </span>
            </button>
            {isAdminMode && onAdminEditStore && (
              <button
                type="button"
                onClick={onAdminEditStore}
                className="w-7 h-7 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white flex items-center justify-center shadow cursor-pointer shrink-0"
                title="تعديل اسم المتجر والإعدادات"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ZONE 2: Clean Single-Line Navigation Links */}
          <nav
            aria-label={isAr ? 'التنقل الرئيسي' : 'Primary Navigation'}
            className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700"
          >
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setCurrentView('home');
              }}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer border-b-2 ${
                currentView === 'home'
                  ? 'border-[#0071e3] text-[#0071e3] font-bold'
                  : 'border-transparent hover:text-[#0071e3]'
              }`}
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </button>

            {categoryLinks.map((cat) => {
              const isActive = currentView === 'shop' && selectedCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setCurrentView('shop');
                  }}
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-[#0071e3] text-[#0071e3] font-bold'
                      : 'border-transparent hover:text-[#0071e3]'
                  }`}
                >
                  {isAr ? cat.nameAr : cat.nameEn}
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: Search, Compare, Language & Primary Liquid Cart Action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSearch}
              className="h-10 px-3 rounded-2xl liquid-glass-subtle hover:bg-white/80 text-slate-700 hover:text-[#0071e3] transition-all flex items-center gap-2 cursor-pointer shrink-0"
              aria-label={isAr ? 'بحث' : 'Search'}
              title={isAr ? 'بحث في المنتجات' : 'Search products'}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="hidden xl:inline text-xs font-semibold text-slate-500 whitespace-nowrap">
                {isAr ? 'ابحث عن جهاز...' : 'Search...'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenCompare}
              className="relative w-10 h-10 rounded-2xl liquid-glass-subtle hover:bg-white/80 text-slate-700 hover:text-[#0071e3] transition-all flex items-center justify-center cursor-pointer shrink-0"
              aria-label={isAr ? 'مقارنة' : 'Compare'}
              title={isAr ? 'مقارنة الأجهزة' : 'Compare Devices'}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 bg-[#0071e3] text-white text-[10px] font-bold tabular-nums w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {compareCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setLanguage(isAr ? 'en' : 'ar');
              }}
              className="hidden sm:inline-flex h-10 px-3 rounded-2xl liquid-glass-subtle hover:bg-white/80 text-xs font-bold text-slate-700 hover:text-[#0071e3] items-center justify-center transition-all cursor-pointer whitespace-nowrap shrink-0"
              title={isAr ? 'Switch to English' : 'التبديل للعربية'}
            >
              {isAr ? 'EN' : 'عربي'}
            </button>

            {/* Primary CTA: Liquid Glass Shopping Cart */}
            <button
              type="button"
              id="main-header-cart-btn"
              onClick={() => {
                soundFX.playModalOpen();
                onOpenCartDrawer();
              }}
              className={`h-10 px-3.5 sm:px-4 rounded-2xl liquid-btn-primary flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                cartBumping ? 'scale-105 ring-4 ring-[#0071e3]/30' : ''
              }`}
            >
              <div className="relative flex items-center">
                <ShoppingCart className="w-4 h-4 shrink-0" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 bg-white text-[#0071e3] text-[10px] font-black tabular-nums min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold tabular-nums">
                {cartTotal > 0 ? formatPrice(cartTotal, currency, isAr) : isAr ? 'السلة' : 'Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Liquid Glass Drawer */}
      {typeof document !== 'undefined' &&
        mobileMenuOpen &&
        createPortal(
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className="fixed inset-0 z-[999999] flex justify-start lg:hidden animate-in fade-in duration-200"
          >
            <div
              className="fixed inset-0 bg-[#091124]/45 backdrop-blur-md cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="relative z-10 w-[86%] max-w-[340px] h-[100dvh] p-3 flex flex-col">
              <div className="liquid-glass-strong rounded-[30px] h-full flex flex-col justify-between overflow-y-auto p-5">
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl liquid-btn-primary flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-extrabold text-base text-[#0b1220] block leading-tight">
                          {isAr ? 'متجر صدام العقاري' : 'Saddam Al-Aqari'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isAr ? 'تسوق بثقة · ضمان رسمي' : 'Shop with Confidence'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-slate-700 hover:text-slate-950 cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 block px-2 mb-2">
                      {isAr ? 'أقسام المتجر' : 'Categories'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('all');
                        setCurrentView('shop');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                        selectedCategory === 'all' && currentView === 'shop'
                          ? 'liquid-btn-primary text-white'
                          : 'text-slate-800 hover:bg-white/70'
                      }`}
                    >
                      <span>{isAr ? 'كل المنتجات' : 'All Products'}</span>
                    </button>

                    {categoryLinks.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setCurrentView('shop');
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                          selectedCategory === cat.id && currentView === 'shop'
                            ? 'liquid-btn-primary text-white'
                            : 'text-slate-800 hover:bg-white/70'
                        }`}
                      >
                        <span className="opacity-85">{cat.icon}</span>
                        <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                      </button>
                    ))}
                  </div>

                  {/* Store Services */}
                  <div className="pt-4 border-t border-slate-900/10 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('compare');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-white/70 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <SlidersHorizontal className="w-4 h-4 text-[#0071e3]" />
                        <span>{isAr ? 'مقارنة الأجهزة' : 'Compare Devices'}</span>
                      </span>
                      {compareCount > 0 && (
                        <span className="tabular-nums text-[#0071e3] font-extrabold">{compareCount}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('wholesale');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-white/70 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-[#0071e3]" />
                      <span>{isAr ? 'مبيعات الجملة والمحلات' : 'Wholesale B2B'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('account');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-white/70 cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>{isAr ? 'تتبع الطلبات' : 'Order Tracking'}</span>
                    </button>
                  </div>
                </div>

                {/* Drawer Bottom Language & Currency */}
                <div className="pt-4 mt-6 border-t border-slate-900/10 flex items-center justify-between text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLanguage(isAr ? 'en' : 'ar')}
                    className="px-3.5 py-2 rounded-xl liquid-glass-subtle text-slate-800 hover:bg-white cursor-pointer"
                  >
                    {isAr ? 'Switch to English' : 'التبديل للعربية'}
                  </button>
                  <span className="text-slate-500 tabular-nums">YER · {isAr ? 'ر.ي' : 'Yemen'}</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
