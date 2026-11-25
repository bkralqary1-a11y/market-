import { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  MessageCircle,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  Tag,
} from 'lucide-react';
import { Language, Product, StoreBrandItem } from '../types';
import {
  SiteConfig,
  DEFAULT_SITE_CONFIG,
  DEFAULT_BUILTIN_BRANDS,
} from '../services/firestoreService';
import { type EditableSectionTarget } from './VisualSectionEditorModal';
import { soundFX } from '../utils/audioEffects';

interface BrandTickerProps {
  language: Language;
  siteConfig?: SiteConfig;
  brands?: StoreBrandItem[];
  products?: Product[];
  selectedBrand?: string;
  onSelectBrand?: (brandName: string) => void;
  isAdminMode?: boolean;
  onToggleBlockHide?: (field: 'hideTrustPillars' | 'hideBrandsBar') => void;
  onAdminEditSection?: (target: EditableSectionTarget) => void;
  onToggleBrandHide?: (brand: StoreBrandItem) => void;
  onDeleteBrand?: (brand: StoreBrandItem) => void;
}

export default function BrandTicker({
  language,
  siteConfig = DEFAULT_SITE_CONFIG,
  brands = DEFAULT_BUILTIN_BRANDS,
  products = [],
  selectedBrand = '',
  onSelectBrand,
  isAdminMode = false,
  onToggleBlockHide,
  onAdminEditSection,
  onToggleBrandHide,
  onDeleteBrand,
}: BrandTickerProps) {
  const isAr = language === 'ar';
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});
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

  const getBrandProductCount = (brand: StoreBrandItem) => {
    const arLower = brand.nameAr.trim().toLowerCase();
    const enLower = (brand.nameEn || '').trim().toLowerCase();
    return products.filter((p) => {
      if (p.hidden) return false;
      const pb = (p.brand || '').trim().toLowerCase();
      return pb !== '' && (pb === arLower || (enLower !== '' && pb === enLower));
    }).length;
  };

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

        {/* Block B: Interactive Authorized Brands Strip (Works identically to Categories!) */}
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
          <div className="liquid-glass rounded-[24px] p-3.5 sm:p-5 space-y-3 relative">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0b1220]">
                    {isAr ? 'العلامات التجارية المعتمدة' : 'Authorized Brands'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {isAdminMode
                      ? 'اسحب للطرف لإضافة علامة تجارية جديدة أو عدّل واحذف أي علامة'
                      : isAr
                      ? 'اضغط على أي علامة لعرض جميع الهواتف والمنتجات التابعة لها'
                      : 'Tap any brand to browse all its devices & accessories'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isAdminMode && onAdminEditSection && (
                  <button
                    type="button"
                    onClick={() => onAdminEditSection({ type: 'addBrand' })}
                    className="px-2.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white text-[11px] font-extrabold flex items-center gap-1 shadow cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة علامة</span>
                  </button>
                )}
                {isAdminMode && onToggleBlockHide && (
                  <button
                    type="button"
                    onClick={() => onToggleBlockHide('hideBrandsBar')}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>إخفاء الشريط</span>
                  </button>
                )}
              </div>
            </div>

            {/* Swipeable Brands Strip */}
            <div className="flex flex-nowrap items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
              {brands.map((brand) => {
                const isSelected =
                  selectedBrand &&
                  selectedBrand.trim().toLowerCase() === brand.nameAr.trim().toLowerCase();
                const liveCount = getBrandProductCount(brand);
                const hasLogo = Boolean(brand.logo?.trim()) && !failedLogos[brand.id];

                return (
                  <div
                    key={brand.id}
                    className={`relative shrink-0 snap-start flex flex-col justify-between rounded-2xl transition-all ${
                      isAdminMode ? 'min-w-[140px] sm:min-w-[155px]' : 'min-w-[110px] sm:min-w-[128px]'
                    } ${brand.hidden ? 'opacity-55' : ''}`}
                  >
                    {isAdminMode && (
                      <div className="flex items-center justify-between gap-1 mb-1.5 px-0.5">
                        <div className="flex items-center gap-1">
                          {onAdminEditSection && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdminEditSection({ type: 'editBrand', brand });
                              }}
                              className="px-2 py-1 rounded-lg bg-[#0071e3] hover:bg-[#005bbf] text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer shadow-xs"
                              title="تعديل العلامة"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                              <span>تعديل</span>
                            </button>
                          )}
                          {onToggleBrandHide && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleBrandHide(brand);
                              }}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer shadow-xs ${
                                brand.hidden
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-amber-400 text-slate-950'
                              }`}
                              title={brand.hidden ? 'إظهار العلامة' : 'إخفاء العلامة'}
                            >
                              {brand.hidden ? (
                                <Eye className="w-3 h-3" />
                              ) : (
                                <EyeOff className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                        {onDeleteBrand && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBrand(brand);
                            }}
                            className="w-6 h-6 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-xs"
                            title="حذف / إلغاء العلامة التجارية"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        if (onSelectBrand) {
                          onSelectBrand(brand.nameAr);
                        }
                      }}
                      className={`group w-full flex-1 px-3.5 py-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer ${
                        isSelected
                          ? 'liquid-btn-primary text-white border-transparent shadow-md'
                          : 'liquid-glass-subtle hover:bg-white border-white/80 hover:border-[#0071e3]/50 text-[#0b1220]'
                      } ${isAdminMode ? 'ring-1 ring-[#0071e3]/35' : ''}`}
                    >
                      {hasLogo && (
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/90 border border-slate-200/70 flex items-center justify-center shrink-0">
                          <img
                            src={brand.logo}
                            alt={isAr ? brand.nameAr : brand.nameEn}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedLogos((prev) => ({ ...prev, [brand.id]: true }))
                            }
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      )}
                      <span
                        className={`text-xs sm:text-sm font-black tracking-wide truncate max-w-[130px] ${
                          isSelected ? 'text-white' : 'text-[#0b1220] group-hover:text-[#0071e3]'
                        }`}
                      >
                        {isAr ? brand.nameAr : brand.nameEn || brand.nameAr}
                      </span>
                      <span
                        className={`text-[10px] font-bold tabular-nums ${
                          isSelected ? 'text-white/85' : 'text-slate-500'
                        }`}
                      >
                        {brand.hidden && isAdminMode
                          ? 'مخفية'
                          : `${liveCount} ${isAr ? 'منتج' : 'items'}`}
                      </span>
                    </button>
                  </div>
                );
              })}

              {/* Admin Mode "+ Add Brand" Tile at the end of the swipeable strip */}
              {isAdminMode && onAdminEditSection && (
                <div className="shrink-0 snap-start min-w-[135px] flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => onAdminEditSection({ type: 'addBrand' })}
                    className="w-full h-full min-h-[76px] px-3 py-3 rounded-2xl border-2 border-dashed border-[#0071e3]/60 hover:border-[#0071e3] bg-sky-50/60 hover:bg-white/90 flex flex-col items-center justify-center gap-1.5 text-[#0071e3] transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl liquid-btn-primary flex items-center justify-center shadow">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[11px] font-extrabold whitespace-nowrap">
                      + إضافة علامة تجارية
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
