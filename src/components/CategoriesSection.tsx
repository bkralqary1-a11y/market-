import { useState, type ReactNode } from 'react';
import { Smartphone, Headphones, Shield, Zap, Cable, ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { CategoryId, Language, Product } from '../types';
import { mockCategories } from '../data/mockData';
import { soundFX } from '../utils/audioEffects';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../services/firestoreService';
import { type EditableSectionTarget } from './VisualSectionEditorModal';

interface CategoriesSectionProps {
  language: Language;
  onSelectCategory: (catId: CategoryId) => void;
  selectedCategory?: CategoryId;
  siteConfig?: SiteConfig;
  products?: Product[];
  isAdminMode?: boolean;
  onAdminEditSection?: (target: EditableSectionTarget) => void;
}

export default function CategoriesSection({
  language,
  onSelectCategory,
  selectedCategory,
  siteConfig = DEFAULT_SITE_CONFIG,
  products = [],
  isAdminMode = false,
  onAdminEditSection,
}: CategoriesSectionProps) {
  const isAr = language === 'ar';
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const categoryIcons: Record<string, ReactNode> = {
    phones: <Smartphone className="w-5 h-5" />,
    audio: <Headphones className="w-5 h-5" />,
    cases: <Shield className="w-5 h-5" />,
    chargers: <Zap className="w-5 h-5" />,
    cables: <Cable className="w-5 h-5" />,
  };

  const getCategoryImg = (catId: CategoryId, fallback: string) => {
    switch (catId) {
      case 'phones':
        return siteConfig.catPhonesImg || fallback;
      case 'audio':
        return siteConfig.catAudioImg || fallback;
      case 'cases':
        return siteConfig.catCasesImg || fallback;
      case 'chargers':
        return siteConfig.catChargersImg || fallback;
      case 'cables':
        return siteConfig.catCablesImg || fallback;
      default:
        return fallback;
    }
  };

  const getCategoryNameAr = (catId: CategoryId, fallback: string) => {
    switch (catId) {
      case 'phones':
        return siteConfig.catPhonesNameAr || fallback;
      case 'audio':
        return siteConfig.catAudioNameAr || fallback;
      case 'cases':
        return siteConfig.catCasesNameAr || fallback;
      case 'chargers':
        return siteConfig.catChargersNameAr || fallback;
      case 'cables':
        return siteConfig.catCablesNameAr || fallback;
      default:
        return fallback;
    }
  };

  return (
    <section id="categories-section" className="py-8 sm:py-12 px-3 sm:px-5 relative z-10">
      <div className="container mx-auto max-w-7xl">
        {/* Clean TrustBuy Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div>
              <span className="text-xs font-bold text-[#0071e3] block mb-1">
                {isAr ? siteConfig.categoriesSectionBadgeAr : 'Shop by Category'}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0b1220] tracking-tight">
                {isAr ? siteConfig.categoriesSectionTitleAr : 'Curated Tech Categories'}
              </h2>
            </div>
            {isAdminMode && onAdminEditSection && (
              <button
                type="button"
                onClick={() => onAdminEditSection({ type: 'categoriesHeader' })}
                className="w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white flex items-center justify-center shadow-md cursor-pointer shrink-0"
                title="تعديل عنوان القسم"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
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
            const bgImg = getCategoryImg(cat.id, cat.image);
            const displayNameAr = getCategoryNameAr(cat.id, cat.nameAr);
            const isSelected = selectedCategory === cat.id;
            const isFailed = failedImages[cat.id];
            const liveCount = products.filter((p) => !p.hidden && p.category === cat.id).length;

            return (
              <div key={cat.id} className="relative flex flex-col">
                {isAdminMode && onAdminEditSection && cat.id !== 'all' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdminEditSection({
                        type: 'category',
                        categoryId: cat.id as Exclude<CategoryId, 'all'>,
                      });
                    }}
                    className="absolute top-4 right-4 rtl:right-4 rtl:left-auto z-20 px-2 py-1 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white text-[10px] font-extrabold shadow-lg flex items-center gap-1 cursor-pointer"
                    title="تعديل اسم وصورة القسم"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>تعديل</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onSelectCategory(cat.id);
                  }}
                  className={`group text-right rtl:text-right ltr:text-left liquid-glass liquid-card-hover rounded-[26px] p-2.5 sm:p-3 flex flex-col justify-between flex-1 cursor-pointer overflow-hidden ${
                    isSelected ? 'ring-2 ring-[#0071e3]' : ''
                  } ${isAdminMode ? 'ring-2 ring-[#0071e3]/40 hover:ring-[#0071e3]' : ''}`}
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
                        alt={isAr ? displayNameAr : cat.name}
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
                        {isAr ? displayNameAr : cat.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 tabular-nums">
                      {liveCount > 0 ? liveCount : cat.itemCount}{' '}
                      {isAr ? 'منتج متوفر' : 'items available'}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
