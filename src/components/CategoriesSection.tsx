import { useState, useEffect, type ReactNode } from 'react';
import { Smartphone, Headphones, Shield, Zap, Cable, ArrowLeft, ArrowRight } from 'lucide-react';
import { CategoryId, Language } from '../types';
import { mockCategories } from '../data/mockData';
import { getStoredCategoryImages, CategoryImagesConfig } from '../utils/storeStorage';
import { soundFX } from '../utils/audioEffects';

interface CategoriesSectionProps {
  language: Language;
  onSelectCategory: (catId: CategoryId) => void;
  selectedCategory?: CategoryId;
}

export default function CategoriesSection({
  language,
  onSelectCategory,
  selectedCategory,
}: CategoriesSectionProps) {
  const isAr = language === 'ar';
  const [categoryImages, setCategoryImages] = useState<CategoryImagesConfig>(() => getStoredCategoryImages());
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleImagesUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CategoryImagesConfig>;
      if (customEvent.detail) {
        setCategoryImages(customEvent.detail);
      }
    };
    window.addEventListener('saddam-category-images-updated', handleImagesUpdate);
    return () => window.removeEventListener('saddam-category-images-updated', handleImagesUpdate);
  }, []);

  const categoryIcons: Record<string, ReactNode> = {
    phones: <Smartphone className="w-5 h-5" />,
    audio: <Headphones className="w-5 h-5" />,
    cases: <Shield className="w-5 h-5" />,
    chargers: <Zap className="w-5 h-5" />,
    cables: <Cable className="w-5 h-5" />,
  };

  return (
    <section id="categories-section" className="py-8 sm:py-12 px-3 sm:px-5 relative z-10">
      <div className="container mx-auto max-w-7xl">
        {/* Clean TrustBuy Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-[#0071e3] block mb-1">
              {isAr ? 'تصفح حسب القسم' : 'Shop by Category'}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0b1220] tracking-tight">
              {isAr ? 'أقسام المتجر المعتمدة' : 'Curated Tech Categories'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onSelectCategory('all');
            }}
            className="text-xs sm:text-sm font-bold text-[#0071e3] hover:text-[#005bbf] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{isAr ? 'عرض الكل' : 'View All'}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Clean 5-Column Liquid Glass Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {mockCategories.map((cat) => {
            const bgImg = categoryImages[cat.id] || cat.image;
            const isSelected = selectedCategory === cat.id;
            const isFailed = failedImages[cat.id];

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => {
                  soundFX.playClick();
                  onSelectCategory(cat.id);
                }}
                className={`group text-right rtl:text-right ltr:text-left liquid-glass liquid-card-hover rounded-[26px] p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer overflow-hidden ${
                  isSelected ? 'ring-2 ring-[#0071e3]' : ''
                }`}
              >
                {/* Media Frame */}
                <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden liquid-glass-subtle mb-3">
                  {isFailed ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100/80 to-blue-200/60 text-[#0071e3]">
                      {categoryIcons[cat.id] || <Smartphone className="w-8 h-8" />}
                    </div>
                  ) : (
                    <img
                      src={bgImg}
                      alt={isAr ? cat.nameAr : cat.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() => setFailedImages((prev) => ({ ...prev, [cat.id]: true }))}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#091124]/45 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-8 h-8 rounded-xl bg-white/80 backdrop-blur-md text-[#0071e3] flex items-center justify-center shadow-sm">
                    {categoryIcons[cat.id] || <Zap className="w-4 h-4" />}
                  </div>
                </div>

                {/* Clean Text Content */}
                <div className="px-1.5 pb-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0b1220] group-hover:text-[#0071e3] transition-colors truncate">
                      {isAr ? cat.nameAr : cat.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-600 tabular-nums">
                    {cat.itemCount} {isAr ? 'منتج متوفر' : 'items available'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
