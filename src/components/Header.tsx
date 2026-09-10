import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  X,
  Smartphone,
  Headphones,
  Shield,
  Zap,
  Cable,
  Truck,
  ShieldCheck,
  CreditCard,
  Building2,
} from 'lucide-react';
import { PageView, Language, Currency, CategoryId } from '../types';
import { CURRENCIES, formatPrice } from '../data/mockData';

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
}

export default function Header({
  currentView,
  setCurrentView,
  selectedCategory,
  onSelectCategory,
  cartCount,
  cartTotal,
  wishlistCount,
  compareCount,
  onOpenCartDrawer,
  onOpenCompare,
  language,
  setLanguage,
  currency,
  setCurrency,
  onOpenSearch,
  onOpenAuth,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [cartBumping, setCartBumping] = useState(false);
  const isAr = language === 'ar';

  useEffect(() => {
    const handleBump = () => {
      setCartBumping(true);
      setTimeout(() => setCartBumping(false), 700);
    };
    window.addEventListener('cart-bump', handleBump);
    return () => window.removeEventListener('cart-bump', handleBump);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const categoryLinks: { id: CategoryId; nameEn: string; nameAr: string; icon: ReactNode; badge?: string }[] = [
    { id: 'phones', nameEn: 'Smartphones', nameAr: 'الهواتف', icon: <Smartphone className="w-4 h-4" />, badge: '5G' },
    { id: 'audio', nameEn: 'Headphones', nameAr: 'السماعات', icon: <Headphones className="w-4 h-4" />, badge: 'ANC' },
    { id: 'cases', nameEn: 'Cases & Covers', nameAr: 'الكفرات', icon: <Shield className="w-4 h-4" />, badge: 'MagSafe' },
    { id: 'chargers', nameEn: 'Chargers', nameAr: 'الشواحن', icon: <Zap className="w-4 h-4" />, badge: 'GaN' },
    { id: 'cables', nameEn: 'Cables', nameAr: 'الكيابل', icon: <Cable className="w-4 h-4" />, badge: '100W+' },
  ];

  return (
    <header className={`sticky top-0 ${mobileMenuOpen ? 'z-[9999]' : 'z-40'} bg-white/95 backdrop-blur-md border-b border-gray-line shadow-sm transition-all`}>
      {/* Main Brand Header */}
      <div className="container mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Saddam Al-Aqari Store Logo */}
            <div
              onClick={() => setCurrentView('home')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-lg shadow-[0_4px_12px_rgba(249,115,22,0.35)] group-hover:scale-105 transition-transform border border-orange-300/40">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight text-gray-dark font-display leading-tight">
                    {isAr ? (
                      <>
                        متجر <span className="text-orange-600">صدام العقاري</span>
                      </>
                    ) : (
                      <>
                        Saddam <span className="text-orange-600">Al-Aqari</span>
                      </>
                    )}
                  </span>
                  <span className="text-[9px] bg-orange-100 text-orange-700 border border-orange-200 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                    {isAr ? 'اليمن' : 'Yemen'}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium -mt-0.5 hidden xs:block">
                  {isAr ? 'للهواتف الذكية ومستلزماتها الأصلية' : 'Smartphones & Genuine Accessories'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar (Direct Search Trigger) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div
              onClick={onOpenSearch}
              className="w-full bg-gray-50 hover:bg-gray-100/80 border border-gray-line rounded-2xl py-2.5 px-4 flex items-center justify-between cursor-pointer transition-all shadow-inner text-gray-400 group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-xs text-gray-500 font-medium">
                  {isAr
                    ? 'ابحث عن آيفون 16، سماعات، شواحن GaN، كفرات...'
                    : 'Search iPhone 16, headphones, GaN chargers, cases...'}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white text-gray-400 px-2 py-0.5 rounded-md border border-gray-200">
                ⌘K
              </span>
            </div>
          </div>

          {/* Header Action Badges & Drawer Triggers */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Icon */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compare Tool Trigger */}
            <button
              onClick={onOpenCompare}
              className="p-2 sm:px-3 sm:py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1.5 relative group"
              title={isAr ? 'مقارنة الأجهزة' : 'Compare Products'}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden xl:inline-block text-xs font-bold text-gray-700">
                {isAr ? 'المقارنة' : 'Compare'}
              </span>
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 bg-cyan-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Wishlist Trigger */}
            <button
              onClick={() => setCurrentView('shop')}
              className="p-2 sm:px-3 sm:py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1.5 relative group"
              title={isAr ? 'المفضلة' : 'Wishlist'}
            >
              <Heart className="w-5 h-5" />
              <span className="hidden xl:inline-block text-xs font-bold text-gray-700">
                {isAr ? 'المفضلة' : 'Wishlist'}
              </span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Language Switcher (Desktop) */}
            <button
              onClick={() => setLanguage(isAr ? 'en' : 'ar')}
              className="hidden sm:inline-flex items-center text-xs font-bold text-gray-700 hover:text-primary px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              title={isAr ? 'Switch Language' : 'تغيير اللغة'}
            >
              {isAr ? 'English' : 'عربي'}
            </button>

            {/* Slide-out Cart Trigger with Total */}
            <button
              id="main-header-cart-btn"
              onClick={onOpenCartDrawer}
              className={`bg-primary hover:bg-primary-hover text-white py-2 px-3 sm:px-4 rounded-xl transition-all shadow-md flex items-center gap-2 group active:scale-95 duration-200 ${
                cartBumping
                  ? 'scale-110 ring-4 ring-amber-400 ring-offset-2 ring-offset-tech-dark bg-orange-600 shadow-amber-500/50'
                  : ''
              }`}
            >
              <div className={`relative transition-transform duration-200 ${cartBumping ? 'scale-125 rotate-6' : ''}`}>
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className={`absolute -top-2.5 -right-2.5 rtl:-right-auto rtl:-left-2.5 bg-amber-400 text-tech-dark text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow transition-transform ${cartBumping ? 'scale-125' : ''}`}>
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left rtl:text-right leading-none">
                <span className="text-[10px] opacity-80 uppercase tracking-wider">{isAr ? 'السلة' : 'Cart'}</span>
                <span className="text-xs font-black font-mono">
                  {cartTotal > 0 ? formatPrice(cartTotal, currency, isAr) : isAr ? 'فارغة' : '0.00'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category Bar Navigation (The 5 Specific Categories) */}
      <nav className="border-t border-gray-line bg-gray-50/70 hidden lg:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* All Products button */}
            <button
              onClick={() => {
                onSelectCategory('all');
                setCurrentView('shop');
              }}
              className={`py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                selectedCategory === 'all' && currentView === 'shop'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-dark hover:bg-white/50'
              }`}
            >
              <span>{isAr ? 'كل المنتجات' : 'All Products'}</span>
            </button>

            {/* 5 Requested Categories */}
            {categoryLinks.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setCurrentView('shop');
                }}
                className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  selectedCategory === cat.id && currentView === 'shop'
                    ? 'border-primary text-primary bg-white shadow-xs'
                    : 'border-transparent text-gray-700 hover:text-primary hover:bg-white/60'
                }`}
              >
                <span className={selectedCategory === cat.id ? 'text-primary' : 'text-gray-400'}>
                  {cat.icon}
                </span>
                <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                {cat.badge && (
                  <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {cat.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right Trust Indicators / Fast delivery */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'ضمان محلي سنتين معتمد' : '2-Year Official Warranty'}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>{isAr ? 'تقسيط تابي وتمارا 0%' : '0% Installments'}</span>
            </span>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer Rendered via Portal directly to body */}
      {typeof document !== 'undefined' && mobileMenuOpen && createPortal(
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[999999] w-screen h-screen h-[100dvh] flex justify-start lg:hidden animate-in fade-in duration-200"
        >
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer z-0"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Elevated Drawer Rectangle in front of everything */}
          <div className="relative z-10 bg-white w-[85%] max-w-[340px] h-full h-[100dvh] flex flex-col justify-between shadow-[0_25px_70px_20px_rgba(0,0,0,0.85)] border-r rtl:border-r-0 rtl:border-l border-orange-500/40 overflow-y-auto transform translate-x-0 animate-in slide-in-from-start duration-300">
            <div>
              {/* Cover Image at top of drawer */}
              <div className="relative w-full h-40 overflow-hidden bg-zinc-900 border-b border-orange-500/30 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=85&w=800&auto=format&fit=crop"
                  alt={isAr ? 'واجهة متجر صدام الفاخر' : 'Saddam Store Header'}
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-85 z-0"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 h-full bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex flex-col justify-between p-4">
                  {/* Top Bar inside image */}
                  <div className="flex items-center justify-between">
                    <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {isAr ? 'الفرع الرسمي' : 'Official Store'}
                    </span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Store Branding over image */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-lg border border-white/20">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-black text-base text-white font-display block leading-none drop-shadow-md">
                        {isAr ? 'متجر صدام العقاري' : 'Saddam Al-Aqari'}
                      </span>
                      <span className="text-[11px] text-amber-300 font-semibold drop-shadow-sm">
                        {isAr ? 'للهواتف الذكية ومستلزماتها' : 'Smartphones & Gear'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">
                  {isAr ? 'أقسام المتجر الإلكتروني' : 'Store Categories'}
                </span>
                {categoryLinks.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setCurrentView('shop');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedCategory === cat.id ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-dark'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {cat.icon}
                      <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                    </div>
                    {cat.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {cat.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-line space-y-1.5 px-4">
                <button
                  onClick={() => {
                    setCurrentView('compare');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
                    <span>{isAr ? 'مقارنة مواصفات الهواتف' : 'Phone Specifications Comparison'}</span>
                  </div>
                  {compareCount > 0 && (
                    <span className="bg-cyan-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {compareCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentView('wholesale');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'بوابة مبيعات الجملة والشركات (B2B)' : 'B2B Wholesale Portal'}</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('account');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'تتبع الشحنات والطلبات' : 'Order Tracking'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Currency & Language Switcher in Mobile */}
            <div className="p-4 border-t border-gray-line bg-gray-50/80 shrink-0">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-500">{isAr ? 'العملة واللغة' : 'Currency & Lang'}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLanguage(isAr ? 'en' : 'ar')}
                    className="px-2.5 py-1 rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {isAr ? 'English' : 'عربي'}
                  </button>
                  <span className="px-2.5 py-1 rounded bg-orange-600 text-white font-mono text-[11px] font-bold">
                    YER ({isAr ? 'ر.ي' : 'YER'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
