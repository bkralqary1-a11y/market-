import { ShieldCheck, Truck, CheckCircle2, MessageCircle } from 'lucide-react';
import { Language } from '../types';

interface BrandTickerProps {
  language: Language;
}

export default function BrandTicker({ language }: BrandTickerProps) {
  const isAr = language === 'ar';

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

  const techBrands = [
    'Apple',
    'SAMSUNG',
    'ANKER',
    'SONY',
    'belkin',
    'spigen',
    'BASEUS',
  ];

  return (
    <section id="brands-ticker-section" className="py-4 px-3 sm:px-5 relative z-10">
      <div className="container mx-auto max-w-7xl space-y-4">
        {/* TrustBuy 4-Pillar Strip (Full Liquid Glass Row) */}
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

        {/* Authorized Brands Glass Bar */}
        <div className="liquid-glass rounded-[22px] px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap shrink-0">
            {isAr ? 'العلامات التجارية المعتمدة' : 'Authorized Brands'}
          </span>

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
      </div>
    </section>
  );
}
