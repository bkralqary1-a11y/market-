import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Loader2, Pencil, Image as ImageIcon } from 'lucide-react';
import { HeroSlideItem, CategoryId } from '../types';
import { SiteConfig } from '../services/firestoreService';

export type EditableSectionTarget =
  | { type: 'hero'; slideIndex: number }
  | { type: 'bento1' }
  | { type: 'bento2' }
  | { type: 'category'; categoryId: Exclude<CategoryId, 'all'> }
  | { type: 'categoriesHeader' }
  | { type: 'productsHeader' }
  | { type: 'storeSettings' };

interface VisualSectionEditorModalProps {
  target: EditableSectionTarget | null;
  siteConfig: SiteConfig;
  heroSlides: HeroSlideItem[];
  onClose: () => void;
  onSaveSiteConfig: (next: SiteConfig) => Promise<void>;
  onSaveHeroSlide: (slide: HeroSlideItem, order: number) => Promise<void>;
  onDeleteHeroSlide: (slideId: string) => Promise<void>;
}

const CAT_CONFIG_KEYS: Record<
  Exclude<CategoryId, 'all'>,
  { nameKey: keyof SiteConfig; imgKey: keyof SiteConfig; label: string }
> = {
  phones: { nameKey: 'catPhonesNameAr', imgKey: 'catPhonesImg', label: 'قسم الهواتف الذكية' },
  audio: { nameKey: 'catAudioNameAr', imgKey: 'catAudioImg', label: 'قسم السماعات' },
  cases: { nameKey: 'catCasesNameAr', imgKey: 'catCasesImg', label: 'قسم الكفرات' },
  chargers: { nameKey: 'catChargersNameAr', imgKey: 'catChargersImg', label: 'قسم الشواحن' },
  cables: { nameKey: 'catCablesNameAr', imgKey: 'catCablesImg', label: 'قسم الكيابل' },
};

export default function VisualSectionEditorModal({
  target,
  siteConfig,
  heroSlides,
  onClose,
  onSaveSiteConfig,
  onSaveHeroSlide,
  onDeleteHeroSlide,
}: VisualSectionEditorModalProps) {
  const [cfg, setCfg] = useState<SiteConfig>(siteConfig);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [slideDraft, setSlideDraft] = useState<HeroSlideItem | null>(null);
  const [isNewSlide, setIsNewSlide] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;
    setCfg(siteConfig);
    setErrorMsg(null);
    if (target.type === 'hero') {
      const idx = Math.min(target.slideIndex, Math.max(0, heroSlides.length - 1));
      setActiveSlideIdx(idx);
      setIsNewSlide(false);
      setSlideDraft(
        heroSlides[idx]
          ? { ...heroSlides[idx] }
          : {
              id: `slide-${Date.now().toString(36)}`,
              badgeAr: 'متجر صدام العقاري',
              titleAr: 'عرض جديد',
              subtitleAr: '',
              mediaType: 'image',
              imageUrl: '',
              buttonTextAr: 'تصفح الأجهزة الآن',
              featureBadge2Ar: 'ضمان رسمي معتمد',
              enabled: true,
            }
      );
    }
  }, [target, siteConfig, heroSlides]);

  if (!target) return null;

  const handleSelectSlide = (idx: number) => {
    setActiveSlideIdx(idx);
    setIsNewSlide(false);
    setSlideDraft({ ...heroSlides[idx] });
  };

  const handleStartNewSlide = () => {
    setIsNewSlide(true);
    setSlideDraft({
      id: `slide-${Date.now().toString(36)}`,
      badgeAr: 'عرض حصري • متجر صدام العقاري',
      titleAr: '',
      subtitleAr: '',
      mediaType: 'image',
      imageUrl: '',
      buttonTextAr: 'تصفح الأجهزة الآن',
      featureBadge2Ar: 'ضمان رسمي معتمد',
      enabled: true,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      if (target.type === 'hero' && slideDraft) {
        if (!slideDraft.titleAr.trim()) {
          setErrorMsg('يرجى كتابة العنوان الرئيسي للشريحة.');
          setSaving(false);
          return;
        }
        const order = isNewSlide ? heroSlides.length : activeSlideIdx;
        await onSaveHeroSlide(slideDraft, order);
      } else {
        await onSaveSiteConfig(cfg);
      }
      onClose();
    } catch {
      setErrorMsg('تعذر حفظ التعديلات في السحابة. تأكد من اتصالك وصلاحية الدخول.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCurrentSlide = async () => {
    if (!slideDraft || isNewSlide || heroSlides.length <= 1) return;
    setSaving(true);
    try {
      await onDeleteHeroSlide(slideDraft.id);
      onClose();
    } catch {
      setErrorMsg('تعذر حذف الشريحة.');
    } finally {
      setSaving(false);
    }
  };

  const getModalTitle = () => {
    switch (target.type) {
      case 'hero':
        return 'تعديل شرائح الواجهة الرئيسية';
      case 'bento1':
        return 'تعديل البطاقة الجانبية الأولى';
      case 'bento2':
        return 'تعديل البطاقة الجانبية الثانية';
      case 'category':
        return `تعديل ${CAT_CONFIG_KEYS[target.categoryId].label}`;
      case 'categoriesHeader':
        return 'تعديل عنوان قسم الأقسام';
      case 'productsHeader':
        return 'تعديل عنوان قسم المنتجات';
      case 'storeSettings':
        return 'إعدادات المتجر والشريط العلوي وأرقام التواصل';
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1050] bg-[#070f21]/70 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong w-full max-w-2xl rounded-[30px] border border-white/70 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-900/10 flex items-center justify-between bg-white/55">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl liquid-btn-primary flex items-center justify-center">
              <Pencil className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-extrabold text-[#0b1220]">{getModalTitle()}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-slate-700 hover:text-slate-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* HERO SLIDE EDITOR */}
          {target.type === 'hero' && slideDraft && (
            <div className="space-y-4">
              {/* Slide Selector Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {heroSlides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSlide(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                      !isNewSlide && activeSlideIdx === idx
                        ? 'liquid-btn-primary text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-[#0071e3]'
                    }`}
                  >
                    شريحة {idx + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleStartNewSlide}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer border ${
                    isNewSlide
                      ? 'liquid-btn-emerald text-white border-transparent'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة شريحة</span>
                </button>
              </div>

              {/* Image Preview */}
              {slideDraft.imageUrl && (
                <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={slideDraft.imageUrl}
                    alt={slideDraft.titleAr}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200 sm:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    العنوان الرئيسي للشريحة *
                  </label>
                  <input
                    type="text"
                    value={slideDraft.titleAr}
                    onChange={(e) => setSlideDraft({ ...slideDraft, titleAr: e.target.value })}
                    placeholder="مثال: آبل آيفون 16 برو ماكس"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    الشارة العلوية (فوق العنوان)
                  </label>
                  <input
                    type="text"
                    value={slideDraft.badgeAr}
                    onChange={(e) => setSlideDraft({ ...slideDraft, badgeAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    نص الضمان / الميزة
                  </label>
                  <input
                    type="text"
                    value={slideDraft.featureBadge2Ar || ''}
                    onChange={(e) =>
                      setSlideDraft({ ...slideDraft, featureBadge2Ar: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 sm:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    الوصف أسفل العنوان
                  </label>
                  <textarea
                    rows={2}
                    value={slideDraft.subtitleAr}
                    onChange={(e) => setSlideDraft({ ...slideDraft, subtitleAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 sm:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    رابط صورة الخلفية (URL)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={slideDraft.imageUrl}
                    onChange={(e) => setSlideDraft({ ...slideDraft, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    نص الزر الرئيسي
                  </label>
                  <input
                    type="text"
                    value={slideDraft.buttonTextAr || ''}
                    onChange={(e) =>
                      setSlideDraft({ ...slideDraft, buttonTextAr: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    رسالة واتساب مخصصة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={slideDraft.whatsappCustomTextAr || ''}
                    onChange={(e) =>
                      setSlideDraft({ ...slideDraft, whatsappCustomTextAr: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BENTO 1 EDITOR */}
          {target.type === 'bento1' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  النص الصغير أعلى البطاقة
                </label>
                <input
                  type="text"
                  value={cfg.bento1BadgeAr}
                  onChange={(e) => setCfg({ ...cfg, bento1BadgeAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  العنوان الرئيسي للبطاقة
                </label>
                <input
                  type="text"
                  value={cfg.bento1TitleAr}
                  onChange={(e) => setCfg({ ...cfg, bento1TitleAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-extrabold text-[#0b1220]"
                />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  الوصف المختصر
                </label>
                <textarea
                  rows={2}
                  value={cfg.bento1DescAr}
                  onChange={(e) => setCfg({ ...cfg, bento1DescAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220]"
                />
              </div>
            </div>
          )}

          {/* BENTO 2 EDITOR */}
          {target.type === 'bento2' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  النص الصغير أعلى البطاقة
                </label>
                <input
                  type="text"
                  value={cfg.bento2BadgeAr}
                  onChange={(e) => setCfg({ ...cfg, bento2BadgeAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  العنوان الرئيسي للبطاقة
                </label>
                <input
                  type="text"
                  value={cfg.bento2TitleAr}
                  onChange={(e) => setCfg({ ...cfg, bento2TitleAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-extrabold text-[#0b1220]"
                />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  الوصف المختصر
                </label>
                <textarea
                  rows={2}
                  value={cfg.bento2DescAr}
                  onChange={(e) => setCfg({ ...cfg, bento2DescAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220]"
                />
              </div>
            </div>
          )}

          {/* CATEGORY TILE EDITOR */}
          {target.type === 'category' && (() => {
            const { nameKey, imgKey } = CAT_CONFIG_KEYS[target.categoryId];
            const imgVal = String(cfg[imgKey] || '');
            const nameVal = String(cfg[nameKey] || '');
            return (
              <div className="space-y-4">
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                  {imgVal ? (
                    <img
                      src={imgVal}
                      alt={nameVal}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    اسم القسم الظاهر في المربع
                  </label>
                  <input
                    type="text"
                    value={nameVal}
                    onChange={(e) => setCfg({ ...cfg, [nameKey]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-extrabold text-[#0b1220]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    رابط صورة القسم (URL)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={imgVal}
                    onChange={(e) => setCfg({ ...cfg, [imgKey]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220]"
                  />
                </div>
              </div>
            );
          })()}

          {/* CATEGORIES SECTION HEADER EDITOR */}
          {target.type === 'categoriesHeader' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  النص الصغير فوق العنوان
                </label>
                <input
                  type="text"
                  value={cfg.categoriesSectionBadgeAr}
                  onChange={(e) => setCfg({ ...cfg, categoriesSectionBadgeAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  العنوان الرئيسي لقسم الأقسام
                </label>
                <input
                  type="text"
                  value={cfg.categoriesSectionTitleAr}
                  onChange={(e) => setCfg({ ...cfg, categoriesSectionTitleAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-extrabold text-[#0b1220]"
                />
              </div>
            </div>
          )}

          {/* PRODUCTS SECTION HEADER EDITOR */}
          {target.type === 'productsHeader' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  النص الصغير فوق العنوان
                </label>
                <input
                  type="text"
                  value={cfg.productsSectionBadgeAr}
                  onChange={(e) => setCfg({ ...cfg, productsSectionBadgeAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  العنوان الرئيسي لقسم المنتجات
                </label>
                <input
                  type="text"
                  value={cfg.productsSectionTitleAr}
                  onChange={(e) => setCfg({ ...cfg, productsSectionTitleAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-extrabold text-[#0b1220]"
                />
              </div>
            </div>
          )}

          {/* GLOBAL STORE SETTINGS EDITOR */}
          {target.type === 'storeSettings' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    اسم المتجر بالعربية
                  </label>
                  <input
                    type="text"
                    value={cfg.storeNameAr}
                    onChange={(e) => setCfg({ ...cfg, storeNameAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-extrabold text-[#0b1220]"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    اسم المتجر بالإنجليزية
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={cfg.storeNameEn}
                    onChange={(e) => setCfg({ ...cfg, storeNameEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  الشعار الوصفي (Tagline)
                </label>
                <input
                  type="text"
                  value={cfg.taglineAr}
                  onChange={(e) => setCfg({ ...cfg, taglineAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  عنوان المحل
                </label>
                <input
                  type="text"
                  value={cfg.addressAr}
                  onChange={(e) => setCfg({ ...cfg, addressAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220]"
                />
              </div>

              {/* Contact Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-emerald-700 mb-1">
                    رقم الواتساب الرئيسي
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={cfg.whatsappPrimary}
                    onChange={(e) => setCfg({ ...cfg, whatsappPrimary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[#0b1220]"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    رقم الاتصال الثاني
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={cfg.whatsappSecondary}
                    onChange={(e) => setCfg({ ...cfg, whatsappSecondary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[#0b1220]"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    رقم الاتصال الثالث
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={cfg.phoneTertiary}
                    onChange={(e) => setCfg({ ...cfg, phoneTertiary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[#0b1220]"
                  />
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer text-xs font-extrabold text-[#0b1220]">
                  <span>تفعيل شريط العروض العلوي</span>
                  <input
                    type="checkbox"
                    checked={cfg.bannerEnabled}
                    onChange={(e) => setCfg({ ...cfg, bannerEnabled: e.target.checked })}
                    className="accent-[#0071e3] w-4 h-4"
                  />
                </label>
                <input
                  type="text"
                  value={cfg.bannerTextAr}
                  onChange={(e) => setCfg({ ...cfg, bannerTextAr: e.target.value })}
                  placeholder="نص شريط الإعلان..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-[#0b1220]"
                />
                <input
                  type="text"
                  dir="ltr"
                  value={cfg.promoCode}
                  onChange={(e) => setCfg({ ...cfg, promoCode: e.target.value })}
                  placeholder="كود الخصم (مثال: SADDAM10)"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-[#0071e3]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-900/10 bg-white/70 flex items-center justify-between gap-3">
          {target.type === 'hero' && !isNewSlide && heroSlides.length > 1 ? (
            <button
              type="button"
              onClick={handleDeleteCurrentSlide}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف هذه الشريحة</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 mr-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl liquid-glass-subtle text-slate-700 text-xs font-extrabold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl liquid-btn-primary text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
