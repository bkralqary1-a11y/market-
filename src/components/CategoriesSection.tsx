import { useState, type ReactNode } from 'react';
import {
  Smartphone,
  Headphones,
  Shield,
  Zap,
  Cable,
  ArrowLeft,
  ArrowRight,
  Pencil,
  Plus,
  Eye,
  EyeOff,
  LayoutGrid,
} from 'lucide-react';
import { CategoryId, Language, Product } from '../types';
import { soundFX } from '../utils/audioEffects';
import {
  SiteConfig,
  DEFAULT_SITE_CONFIG,
  getStoreCategories,
} from '../services/firestoreService';
import { type EditableSectionTarget } from './VisualSectionEditorModal';

interface CategoriesSectionProps {
  language: Language;
  onSelectCategory: (catId: CategoryId) => void;
  selectedCategory?: CategoryId;
  siteConfig?: SiteConfig;
  products?: Product[];
  isAdminMode?: boolean;
  onAdminEditSection?: (target: EditableSectionTarget) => void;
  onToggleSectionHide?: () => void;
  onToggleCategoryHide?: (catId: string, isCustom: boolean) => void;
}

export default function CategoriesSection({
  language,
  onSelectCategory,
  selectedCategory,
  siteConfig = DEFAULT_SITE_CONFIG,
  products = [],
  isAdminMode = false,
  onAdminEditSection,
  onToggleSectionHide,
  onToggleCategoryHide,
}: CategoriesSectionProps) {
  const isAr = language === 'ar';
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const isSectionHidden = Boolean(siteConfig.hideCategoriesSection);

  if (isSectionHidden && !isAdminMode) {
    return null;
  }

  if (isSectionHidden && isAdminMode) {
    return (
      <section className="py-3 px-3 sm:px-5 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="liquid-glass rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-50/50 px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-amber-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-amber-600" />
              <span>قسم "أقسام المتجر" مخفي عن الزوار حالياً</span>
            </span>
            {onToggleSectionHide && (
              <button
                type="button"
                onClick={onToggleSectionHide}
                className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>إظهار القسم</span>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const categories = getStoreCategories(siteConfig, isAdminMode);

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
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div>
              <span className="text-xs font-bold text-[#0071e3] block mb-1">
                {isAr ? siteConfig.categoriesSectionBadgeAr : 'Shop by Category'}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0b1220] tracking-tight">
                {isAr ? siteConfig.categoriesSectionTitleAr : 'Curated Tech Categories'}
              </h2>
            </div>
            {isAdminMode && onAdminEditSection && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onAdminEditSection({ type: 'categoriesHeader' })}
                  className="w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white flex items-center justify-center shadow-md cursor-pointer shrink-0"
                  title="تعديل عنوان القسم"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {onToggleSectionHide && (
                  <button
                    type="button"
                    onClick={onToggleSectionHide}
                    className="px-2.5 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shadow-md cursor-pointer shrink-0"
                    title="إخفاء قسم الأقسام بالكامل"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">إخفاء القسم</span>
                  </button>
                )}
              </div>
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

        {isAdminMode && (
          <p className="text-[11px] font-bold text-[#0071e3] mb-3">
            اسحب شريط الأقسام جانبياً للوصول إلى زر (+ إضافة قسم جديد) في نهاية الشريط.
          </p>
        )}

        {/* Horizontally Swipeable Categories Strip + Admin "+ Add Category" Tile at the End */}
        <div className="flex flex-nowrap items-stretch overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 pb-3 -mx-1 px-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const isFailed = failedImages[cat.id];
            const liveCount = products.filter((p) => !p.hidden && p.category === cat.id).length;

            return (
              <div
                key={cat.id}
                className="relative flex flex-col w-[160px] sm:w-[195px] lg:w-[220px] shrink-0 snap-start"
              >
                {isAdminMode && onAdminEditSection && (
                  <div className="absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto z-20 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (cat.isCustom) {
                          onAdminEditSection({
                            type: 'editCustomCategory',
                            categoryId: cat.id,
                          });
                        } else {
                          onAdminEditSection({
                            type: 'category',
                            categoryId: cat.id as
                              | 'phones'
                              | 'audio'
                              | 'cases'
                              | 'chargers'
                              | 'cables',
                          });
                        }
                      }}
                      className="px-2 py-1 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white text-[10px] font-extrabold shadow-lg flex items-center gap-1 cursor-pointer"
                      title="تعديل اسم وصورة القسم"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>تعديل</span>
                    </button>

                    {onToggleCategoryHide && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCategoryHide(cat.id, Boolean(cat.isCustom));
                        }}
                        className={`w-6 h-6 rounded-xl flex items-center justify-center shadow-lg cursor-pointer ${
                          cat.hidden
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-400 text-slate-950'
                        }`}
                        title={cat.hidden ? 'إظهار القسم للزوار' : 'إخفاء القسم عن الزوار'}
                      >
                        {cat.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onSelectCategory(cat.id);
                  }}
                  className={`group text-right rtl:text-right ltr:text-left liquid-glass liquid-card-hover rounded-[26px] p-2.5 sm:p-3 flex flex-col justify-between flex-1 cursor-pointer overflow-hidden ${
                    isSelected ? 'ring-2 ring-[#0071e3]' : ''
                  } ${isAdminMode ? 'ring-2 ring-[#0071e3]/40 hover:ring-[#0071e3]' : ''} ${
                    cat.hidden ? 'opacity-55' : ''
                  }`}
                >
                  {/* Media Frame */}
                  <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden liquid-glass-subtle mb-3">
                    {isFailed || !cat.image?.trim() ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100/80 to-blue-200/60 text-[#0071e3]">
                        {categoryIcons[cat.id] || <LayoutGrid className="w-8 h-8" />}
                      </div>
                    ) : (
                      <img
                        src={cat.image}
                        alt={isAr ? cat.nameAr : cat.nameEn}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() => setFailedImages((prev) => ({ ...prev, [cat.id]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091124]/45 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-xl bg-white/80 backdrop-blur-md text-[#0071e3] flex items-center justify-center shadow-sm">
                      {categoryIcons[cat.id] || <LayoutGrid className="w-4 h-4" />}
                    </div>
                    {isAdminMode && cat.hidden && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow">
                        مخفي
                      </span>
                    )}
                  </div>

                  {/* Clean Text Content */}
                  <div className="px-1.5 pb-1 space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0b1220] group-hover:text-[#0071e3] transition-colors truncate">
                      {isAr ? cat.nameAr : cat.nameEn}
                    </h3>
                    <p className="text-[11px] text-slate-600 tabular-nums">
                      {liveCount} {isAr ? 'منتج' : 'items'}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}

          {/* Admin Mode Matching Rectangular "+ Add Category" Tile at the end of swipeable strip */}
          {isAdminMode && onAdminEditSection && (
            <div className="w-[160px] sm:w-[195px] lg:w-[220px] shrink-0 snap-start flex flex-col">
              <button
                type="button"
                onClick={() => onAdminEditSection({ type: 'addCategory' })}
                className="group liquid-glass rounded-[26px] p-4 flex flex-col items-center justify-center text-center gap-3 flex-1 min-h-[180px] border-2 border-dashed border-[#0071e3]/55 hover:border-[#0071e3] hover:bg-white/80 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl liquid-btn-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <span className="block text-sm font-extrabold text-[#0b1220] group-hover:text-[#0071e3]">
                    إضافة قسم جديد
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-500">
                    اضغط لإنشاء قسم بصورة واسم
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
