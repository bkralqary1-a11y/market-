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
  Lock,
  Settings,
} from 'lucide-react';
import { PageView, Language, Currency, CategoryId } from '../types';
import { CURRENCIES, formatPrice } from '../data/mockData';
import { soundFX } from '../utils/audioEffects';

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
  onOpenAdmin?: () => void;
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
  onOpenAdmin,
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
      {/* Top Luxury Announcement & Direct Social Bar */}
      <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 text-white text-[11px] py-1.5 px-4 border-b border-white/10 hidden sm:block">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300 font-medium">
              {isAr ? 'عمران - الشارع العام | توصيل فوري لجميع محافظات اليمن' : 'Amran Main St | Express Delivery Across Yemen'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-[10px] hidden md:inline">
              {isAr ? 'تابع حساباتنا الرسمية:' : 'Official Social:'}
            </span>

            {/* Social Icons Strip */}
            <div className="flex items-center gap-2">
              <a
                href="https://youtube.com/channel/UCKrhL35COXkwrCL6Qf-NEgg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="يوتيوب"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <a
                href="https://www.tiktok.com/@saddam_alaqari_phones?_r=1&_t=ZS-99cQKDeUIFw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                title="تيك توك"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.34-.02 2.58-.8 3.14-2.02.35-.71.45-1.52.44-2.31.02-4.75-.01-9.51.01-14.26z"/>
                </svg>
              </a>

              <a
                href="https://www.instagram.com/saddam_alaqari_phones?stkn=YWNpcng0dWkwYWM5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
                title="انستغرام"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href="https://www.facebook.com/saddam.alaqari.mobilee?mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                title="فيسبوك"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a
                href="https://wa.me/967774102030"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 font-mono transition-colors"
                title="واتساب المبيعات"
              >
                <span>774102030</span>
              </a>

              {onOpenAdmin && (
                <button
                  id="header-admin-btn-top"
                  onClick={() => {
                    soundFX.playClick();
                    onOpenAdmin();
                  }}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:border-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                  title={isAr ? 'لوحة تحكم وإدارة المتجر بالكامل' : 'Admin Control Panel'}
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>{isAr ? 'لوحة التحكم ⚙️' : 'Admin Panel'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
              onClick={() => {
                soundFX.playClick();
                setLanguage(isAr ? 'en' : 'ar');
              }}
              className="hidden sm:inline-flex items-center text-xs font-bold text-gray-700 hover:text-primary px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              title={isAr ? 'Switch Language' : 'تغيير اللغة'}
            >
              {isAr ? 'English' : 'عربي'}
            </button>

            {/* Admin Dashboard Trigger */}
            {onOpenAdmin && (
              <button
                id="header-admin-btn-action"
                onClick={() => {
                  soundFX.playClick();
                  onOpenAdmin();
                }}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                title={isAr ? 'لوحة تحكم المشرف والتحكم بالمنتجات' : 'Admin Control Panel'}
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>{isAr ? 'لوحة الإدارة' : 'Admin'}</span>
              </button>
            )}

            {/* Slide-out Cart Trigger with Total */}
            <button
              id="main-header-cart-btn"
              onClick={() => {
                soundFX.playModalOpen();
                onOpenCartDrawer();
              }}
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

                {onOpenAdmin && (
                  <button
                    id="header-admin-btn-mobile"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      soundFX.playClick();
                      onOpenAdmin();
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 cursor-pointer transition-colors"
                  >
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>{isAr ? 'لوحة تحكم المشرف (إدارة المتجر بالكامل)' : 'Admin Control Panel'}</span>
                  </button>
                )}
              </div>

              {/* Official Social Media Grid inside Mobile Drawer */}
              <div className="pt-4 border-t border-gray-line">
                <span className="text-[11px] font-bold text-gray-500 block mb-2">
                  {isAr ? 'منصاتنا الرسمية والتواصل:' : 'Official Social Channels:'}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <a
                    href="https://youtube.com/channel/UCKrhL35COXkwrCL6Qf-NEgg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                    title="يوتيوب"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1">يوتيوب</span>
                  </a>

                  <a
                    href="https://www.tiktok.com/@saddam_alaqari_phones?_r=1&_t=ZS-99cQKDeUIFw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 transition-colors"
                    title="تيك توك"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.34-.02 2.58-.8 3.14-2.02.35-.71.45-1.52.44-2.31.02-4.75-.01-9.51.01-14.26z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1">تيك توك</span>
                  </a>

                  <a
                    href="https://www.instagram.com/saddam_alaqari_phones?stkn=YWNpcng0dWkwYWM5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition-colors"
                    title="انستغرام"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1">انستغرام</span>
                  </a>

                  <a
                    href="https://www.facebook.com/saddam.alaqari.mobilee?mibextid=ZbWKwL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                    title="فيسبوك"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1">فيسبوك</span>
                  </a>
                </div>
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
