import { useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  MessageCircle,
  Smartphone,
  Pencil,
} from 'lucide-react';
import { Language, CategoryId, PageView } from '../types';
import PaymentPointsSection from './PaymentPointsSection';
import { soundFX } from '../utils/audioEffects';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../services/firestoreService';

interface FooterProps {
  language: Language;
  onSelectCategory: (catId: CategoryId) => void;
  onNavigate: (view: PageView) => void;
  siteConfig?: SiteConfig;
  isAdminMode?: boolean;
  onAdminEditStore?: () => void;
  onTriggerHiddenAdmin?: () => void;
}

export default function Footer({
  language,
  onSelectCategory,
  onNavigate,
  siteConfig = DEFAULT_SITE_CONFIG,
  isAdminMode = false,
  onAdminEditStore,
  onTriggerHiddenAdmin,
}: FooterProps) {
  const isAr = language === 'ar';
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearHoldTimer();
  }, []);

  // Completely silent 7-second long press on copyright line (zero visual cues)
  const handleSilentHoldStart = () => {
    if (!onTriggerHiddenAdmin) return;
    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      onTriggerHiddenAdmin();
    }, 7000);
  };

  const phoneNumbers = [
    siteConfig.whatsappPrimary,
    siteConfig.whatsappSecondary,
    siteConfig.phoneTertiary,
  ].filter(Boolean);
  const waClean = siteConfig.whatsappPrimary.replace(/\D/g, '') || '774102030';

  return (
    <footer className="mt-12 px-3 sm:px-4 pb-6 text-xs">
      <div className="container mx-auto">
        <div className="liquid-glass-dark rounded-[32px] text-white overflow-hidden">
          {/* 1. TrustBuy Value Proposition Pillars */}
          <div className="border-b border-white/10 py-7 px-4 sm:px-8 bg-white/[0.03]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-300 flex items-center justify-center border border-sky-400/25 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {isAr ? 'شحن وتوصيل فوري لكافة المحافظات' : 'Express Delivery across Yemen'}
                  </h4>
                  <p className="text-[11px] text-slate-300/80">
                    {isAr ? 'توصيل خلال ساعات بصنعاء وعدن وجميع المدن' : 'Fast delivery across all governorates'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center border border-emerald-400/25 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {isAr ? 'ضمان رسمي معتمد للأجهزة الأصلية' : 'Official Authorized Warranty'}
                  </h4>
                  <p className="text-[11px] text-slate-300/80">
                    {isAr ? 'منتجات أصلية 100% مع كرت الضمان المعتمد' : '100% genuine with official warranty card'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-300 flex items-center justify-center border border-blue-400/25 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {isAr ? 'فحص واستبدال فوري عند الاستلام' : 'Instant Inspection Guarantee'}
                  </h4>
                  <p className="text-[11px] text-slate-300/80">
                    {isAr ? 'افحص هاتفك وتأكد من ملحقاته قبل الدفع' : 'Inspect your device before payment'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center border border-indigo-400/25 shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {isAr ? 'خدمة عملاء وطلب سريع بالواتساب' : 'Direct WhatsApp Support'}
                  </h4>
                  <p className="text-[11px] text-slate-300/80">
                    {isAr ? 'فريق متخصص في خدمتكم على مدار الساعة' : '24/7 dedicated support team'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Official Electronic Payment Points & Transfer Grid */}
          <PaymentPointsSection language={language} />

          {/* 3. Main Navigation & Links Grid */}
          <div className="px-5 sm:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Brand Info (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl liquid-btn-primary flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="font-extrabold text-lg sm:text-xl font-display block text-white">
                        {isAr ? siteConfig.storeNameAr : siteConfig.storeNameEn}
                      </span>
                      <span className="text-[11px] text-slate-300 font-medium">
                        {isAr ? siteConfig.taglineAr : siteConfig.taglineEn}
                      </span>
                    </div>
                    {isAdminMode && onAdminEditStore && (
                      <button
                        type="button"
                        onClick={onAdminEditStore}
                        className="w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white flex items-center justify-center shadow cursor-pointer shrink-0"
                        title="تعديل بيانات المتجر والأرقام"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-300/85 text-xs leading-relaxed max-w-sm">
                  {isAr
                    ? `${siteConfig.storeNameAr} للإلكترونيات والهواتف الذكية ومستلزماتها — وجهتكم الموثوقة لأحدث الهواتف الذكية والسماعات والشواحن والملحقات الأصلية بضمان رسمي.`
                    : `${siteConfig.storeNameEn} — Your trusted destination for original devices, accessories, and certified warranty.`}
                </p>

                <div className="flex items-start gap-2 text-xs text-slate-200 pt-1">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-200/90 leading-relaxed">
                    {isAr ? siteConfig.addressAr : siteConfig.addressEn}
                  </span>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-3 text-slate-300 text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'مركز معتمد في اليمن' : 'Certified Center in Yemen'}</span>
                  </div>
                  <span className="text-white/30">·</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'التعامل بالريال اليمني (YER)' : 'Transactions in YER'}</span>
                  </div>
                </div>
              </div>

              {/* 5 Categories */}
              <div>
                <h4 className="font-extrabold text-sky-400 text-xs uppercase tracking-wider mb-4">
                  {isAr ? 'الأقسام الرئيسية' : 'Categories'}
                </h4>
                <ul className="space-y-2.5 text-slate-300">
                  <li>
                    <button
                      onClick={() => {
                        onSelectCategory('phones');
                        onNavigate('shop');
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isAr ? 'الهواتف الذكية' : 'Smartphones'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectCategory('audio');
                        onNavigate('shop');
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isAr ? 'السماعات' : 'Headphones'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectCategory('cases');
                        onNavigate('shop');
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isAr ? 'الكفرات' : 'Cases & Covers'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectCategory('chargers');
                        onNavigate('shop');
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isAr ? 'الشواحن' : 'Chargers'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectCategory('cables');
                        onNavigate('shop');
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isAr ? 'الكيابل' : 'Cables'}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Store Services */}
              <div>
                <h4 className="font-extrabold text-sky-400 text-xs uppercase tracking-wider mb-4">
                  {isAr ? 'خدمات المتجر' : 'Store Services'}
                </h4>
                <ul className="space-y-2.5 text-slate-300">
                  <li>
                    <button
                      onClick={() => onNavigate('wholesale')}
                      className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isAr ? 'مبيعات الجملة والمحلات' : 'Wholesale Portal'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('account')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isAr ? 'تتبع حالة الطلب' : 'Track Order'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('compare')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isAr ? 'مقارنة مواصفات الهواتف' : 'Compare Phones'}
                    </button>
                  </li>
                  <li>
                    <span className="text-slate-300/90">
                      {isAr ? 'سياسة الضمان والاستبدال' : 'Warranty & Guarantee'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Contact & Official Channels */}
              <div>
                <h4 className="font-extrabold text-sky-400 text-xs uppercase tracking-wider mb-4">
                  {isAr ? 'تواصل معنا' : 'Contact Us'}
                </h4>
                <div className="space-y-3 text-slate-200">
                  {/* Official Social Media Channels */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="https://youtube.com/channel/UCKrhL35COXkwrCL6Qf-NEgg"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => soundFX.playClick()}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.07] hover:bg-red-500/25 border border-white/12 hover:border-red-400/40 text-white font-bold text-[11px] transition-all active:scale-95"
                      >
                        <span className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </span>
                        <span className="truncate">{isAr ? 'يوتيوب' : 'YouTube'}</span>
                      </a>

                      <a
                        href="https://www.tiktok.com/@saddam_alaqari_phones?_r=1&_t=ZS-99cQKDeUIFw"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => soundFX.playClick()}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.07] hover:bg-cyan-500/25 border border-white/12 hover:border-cyan-400/40 text-white font-bold text-[11px] transition-all active:scale-95"
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.34-.02 2.58-.8 3.14-2.02.35-.71.45-1.52.44-2.31.02-4.75-.01-9.51.01-14.26z" />
                          </svg>
                        </span>
                        <span className="truncate">{isAr ? 'تيك توك' : 'TikTok'}</span>
                      </a>

                      <a
                        href="https://www.instagram.com/saddam_alaqari_phones?stkn=YWNpcng0dWkwYWM5"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => soundFX.playClick()}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.07] hover:bg-pink-500/25 border border-white/12 hover:border-pink-400/40 text-white font-bold text-[11px] transition-all active:scale-95"
                      >
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shrink-0">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </span>
                        <span className="truncate">{isAr ? 'انستغرام' : 'Instagram'}</span>
                      </a>

                      <a
                        href="https://www.facebook.com/saddam.alaqari.mobilee?mibextid=ZbWKwL"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => soundFX.playClick()}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.07] hover:bg-blue-500/25 border border-white/12 hover:border-blue-400/40 text-white font-bold text-[11px] transition-all active:scale-95"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </span>
                        <span className="truncate">{isAr ? 'فيسبوك' : 'Facebook'}</span>
                      </a>
                    </div>

                    {/* Direct WhatsApp */}
                    <a
                      href={`https://wa.me/967${waClean}?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D8%AD%D9%84%D8%A7%D8%AA%20%D8%B5%D8%AF%D8%A7%D9%85%20%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A3%D8%AC%D9%87%D8%B2%D8%A9`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundFX.playClick()}
                      className="liquid-btn-emerald w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {isAr ? `واتساب المبيعات (+967 ${waClean})` : `WhatsApp (+967 ${waClean})`}
                      </span>
                    </a>
                  </div>

                  {/* Direct Call Numbers */}
                  <div className="pt-2.5 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold mb-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'أرقام الاتصال المباشر:' : 'Direct Call Numbers:'}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {phoneNumbers.map((num) => (
                        <a
                          key={num}
                          href={`tel:+967${num.replace(/\D/g, '')}`}
                          onClick={() => soundFX.playClick()}
                          className="inline-flex items-center justify-between bg-white/[0.06] hover:bg-emerald-500/20 border border-white/12 hover:border-emerald-400/35 px-3 py-1.5 rounded-xl text-emerald-300 hover:text-emerald-200 transition-all font-mono tabular-nums font-bold text-xs tracking-wider"
                          title={isAr ? `اضغط للاتصال بـ ${num}` : `Call ${num}`}
                        >
                          <span dir="ltr">{num}</span>
                          <span className="text-[10px] font-sans font-bold text-slate-300">
                            {isAr ? 'اتصال' : 'Call'}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Copyright & Gateways */}
            <div className="pt-7 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p
                onPointerDown={handleSilentHoldStart}
                onPointerUp={clearHoldTimer}
                onPointerLeave={clearHoldTimer}
                onPointerCancel={clearHoldTimer}
                onContextMenu={(e) => {
                  if (holdTimerRef.current) e.preventDefault();
                }}
                className="text-slate-400 text-xs select-none"
              >
                © 2026{' '}
                {isAr
                  ? 'متجر صدام العقاري للهواتف الذكية ومستلزماتها. كافة الحقوق محفوظة.'
                  : 'Saddam Al-Aqari Store. All rights reserved.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300 font-medium">
                <span>الكريمي</span>
                <span className="text-white/25">·</span>
                <span>ون كاش</span>
                <span className="text-white/25">·</span>
                <span>موبايل موني</span>
                <span className="text-white/25">·</span>
                <span>{isAr ? 'الدفع عند الاستلام' : 'COD'}</span>
                <span className="text-white/25">·</span>
                <span className="font-mono">VISA / Master</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
