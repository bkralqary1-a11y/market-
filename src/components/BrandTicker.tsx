import { ShieldCheck, Truck, CheckCircle2, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { Language } from '../types';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../services/firestoreService';

interface BrandTickerProps {
  language: Language;
  siteConfig?: SiteConfig;
  isAdminMode?: boolean;
  onToggleBlockHide?: (field: 'hideTrustPillars' | 'hideBrandsBar') => void;
}

export default function BrandTicker({
  language,
  siteConfig = DEFAULT_SITE_CONFIG,
  isAdminMode = false,
  onToggleBlockHide,
}: BrandTickerProps) {
  const isAr = language === 'ar';
  const hideTrustPillars = Boolean(siteConfig.hideTrustPillars);
  const hideBrandsBar = Boolean(siteConfig.hideBrandsBar);

  if (!isAdminMode && hideTrustPillars && hideBrandsBar) {
    return null;
  }

  const trustPillars = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#0071e3]" />,
      titleAr: 'ضمان رسمي معتمد',
      titleEn: 'Official Warranty',
      descAr: 'كفالة حقيقية مع فاتورة رسمية',
      descEn: 'Certified hardware warranty',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      titleAr: 'أجهزة أصلية 100%',
      titleEn: '100% Authentic Gear',
      descAr: 'فحص كامل للجهاز قبل الاستلام',
      descEn: 'Verified & inspectable on delivery',
    },
    {
      icon: <Truck className="w-5 h-5 text-[#0071e3]" />,
      titleAr: 'توصيل لجميع المحافظات',
      titleEn: 'Fast Nationwide Delivery',
      descAr: 'شحن سريع وآمن لحد باب منزلك',
      descEn: 'Express insured courier dispatch',
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-emerald-600" />,
      titleAr: 'طلب فوري عبر واتساب',
      titleEn: 'Instant WhatsApp Order',
      descAr: 'تأكيد سريع وخدمة عملاء مباشرة',
      descEn: 'Direct confirmation & live support',
    },
  ];

  const techBrands = ['Apple', 'SAMSUNG', 'ANKER', 'SONY', 'belkin', 'spigen', 'BASEUS'];

  return (
    <section id="brands-ticker-section" className="py-4 px-3 sm:px-5 relative z-10">
      <div className="container mx-auto max-w-7xl space-y-4">
        {/* Block A: Trust Pillars 4-Card Row */}
        {hideTrustPillars && isAdminMode ? (
          <div className="liquid-glass rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-50/50 px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-amber-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-amber-600" />
              <span>مربعات المميزات (الضمان / التوصيل / الفحص) مخفية عن الزوار</span>
            </span>
            {onToggleBlockHide && (
              <button
                type="button"
                onClick={() => onToggleBlockHide('hideTrustPillars')}
                className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>إظهار</span>
              </button>
            )}
          </div>
        ) : !hideTrustPillars ? (
          <div className="relative">
            {isAdminMode && onToggleBlockHide && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => onToggleBlockHide('hideTrustPillars')}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-[11px] font-extrabold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>إخفاء مربعات المميزات (الضمان والتوصيل)</span>
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {trustPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="liquid-glass rounded-[22px] p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-2xl liquid-glass-strong flex items-center justify-center shrink-0">
                    {pillar.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#0b1220] truncate">
                      {isAr ? pillar.titleAr : pillar.titleEn}
                    </h3>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {isAr ? pillar.descAr : pillar.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Block B: Authorized Brands Bar */}
        {hideBrandsBar && isAdminMode ? (
          <div className="liquid-glass rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-50/50 px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-amber-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-amber-600" />
              <span>شريط العلامات التجارية مخفي عن الزوار</span>
            </span>
            {onToggleBlockHide && (
              <button
                type="button"
                onClick={() => onToggleBlockHide('hideBrandsBar')}
                className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>إظهار</span>
              </button>
            )}
          </div>
        ) : !hideBrandsBar ? (
          <div className="liquid-glass rounded-[22px] px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 relative">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap shrink-0">
                {isAr ? 'العلامات التجارية المعتمدة' : 'Authorized Brands'}
              </span>
              {isAdminMode && onToggleBlockHide && (
                <button
                  type="button"
                  onClick={() => onToggleBlockHide('hideBrandsBar')}
                  className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>إخفاء الشريط</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
              {techBrands.map((brand) => (
                <span
                  key={brand}
                  className="px-4 py-1.5 rounded-xl liquid-glass-subtle text-xs sm:text-sm font-extrabold tracking-wider text-slate-800 whitespace-nowrap shrink-0"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
