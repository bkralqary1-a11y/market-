import { ArrowRight, ArrowLeft, Tag, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface PromoBannerProps {
  language: Language;
  onShopNow: () => void;
}

export default function PromoBanner({ language, onShopNow }: PromoBannerProps) {
  const isAr = language === 'ar';

  return (
    <section id="promo-banner" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-tech-dark text-white min-h-[360px] flex items-center shadow-2xl border border-white/10">
          {/* Background image & gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1400&auto=format&fit=crop"
              alt="Promo Banner"
              className="w-full h-full object-cover object-center opacity-30 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-tech-dark via-tech-dark/85 to-transparent rtl:bg-gradient-to-l" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 md:p-14 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-primary text-white text-xs font-black uppercase px-3.5 py-1 rounded-full mb-3 shadow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'حزمة الترقية الشاملة 2026' : 'Flagship Upgrade Bundle'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-3 leading-tight font-display text-white">
              {isAr
                ? 'باكج الشحن السريع وحماية الهاتف بخصم 35%'
                : 'GaN Fast Charging & MagSafe Protection Bundle'}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
              {isAr
                ? 'احصل على شاحن أنكر GaN ثلاثي المنافذ مع كفر MagSafe أصلي وكابل 100W مجدول بضمان سنتين مع كود TECH10 عند الدفع.'
                : 'Get Anker 3-Port GaN charger, certified MagSafe armor case, and 100W braided line with 2-year warranty. Use code TECH10.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="promo-shop-btn"
                onClick={onShopNow}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg active:scale-95 text-xs sm:text-sm"
              >
                <span>{isAr ? 'اقتنِ الحزمة واستكشف العروض' : 'Shop Bundle & Offers'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-white/10 px-3 py-2 rounded-xl border border-white/15">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'شحن فوري + ضمان سنتين' : '2-Yr Warranty Included'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
