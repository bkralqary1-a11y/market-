import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Palette,
  Percent,
  Layers,
  ListChecks,
  EyeOff,
  Eye,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Product, CategoryId } from '../types';
import { CATEGORY_META, normalizeSafeId } from '../services/firestoreService';

interface VisualProductEditorModalProps {
  isOpen: boolean;
  product: Product | null; // null => Add new product
  defaultCategory?: CategoryId;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  onDelete?: (productId: string) => Promise<void>;
}

interface ColorEntry {
  hex: string;
  nameAr: string;
}

interface SpecRow {
  key: string;
  ar: string;
  en: string;
}

function createEmptyProduct(defaultCategory: CategoryId = 'phones'): Product {
  const safeCat: Exclude<CategoryId, 'all'> =
    defaultCategory === 'all' ? 'phones' : defaultCategory;
  const meta = CATEGORY_META[safeCat];
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `prod-${Date.now().toString(36)}`,
    sku: `SDM-${randomCode}`,
    name: '',
    nameAr: '',
    brand: 'Apple',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    category: safeCat,
    categoryNameEn: meta.nameEn,
    categoryNameAr: meta.nameAr,
    image: '',
    images: [],
    rating: 5.0,
    reviewsCount: 1,
    description: '',
    descriptionAr: '',
    inStock: true,
    stock: 10,
    fastShipping: true,
    warrantyYears: 1,
    isTrending: true,
    isPopular: true,
    isFeatured: false,
    colors: ['#1e293b'],
    colorNamesAr: ['أسود ليلي'],
    variants: {
      titleEn: 'Storage / Model',
      titleAr: 'السعة / الموديل',
      options: ['256GB'],
    },
    specs: {
      warranty: { en: 'Official Warranty', ar: 'ضمان رسمي معتمد' },
    },
    tagAr: '',
    videoUrl: '',
    hidden: false,
  };
}

export default function VisualProductEditorModal({
  isOpen,
  product,
  defaultCategory = 'phones',
  onClose,
  onSave,
  onDelete,
}: VisualProductEditorModalProps) {
  const isNew = !product;
  const [form, setForm] = useState<Product>(() =>
    product ? { ...product } : createEmptyProduct(defaultCategory)
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [colorEntries, setColorEntries] = useState<ColorEntry[]>([]);
  const [variantOptionsText, setVariantOptionsText] = useState('');
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const base = product ? { ...product } : createEmptyProduct(defaultCategory);
    setForm(base);

    const extraImages = (base.images || []).filter((img) => img && img !== base.image);
    setGalleryUrls(extraImages.length > 0 ? extraImages : ['']);

    const cols = base.colors || [];
    const names = base.colorNamesAr || [];
    if (cols.length > 0) {
      setColorEntries(
        cols.map((hex, i) => ({
          hex: hex || '#0f172a',
          nameAr: names[i] || '',
        }))
      );
    } else {
      setColorEntries([]);
    }

    setVariantOptionsText((base.variants?.options || []).join(' ، '));

    const existingSpecs = Object.entries(base.specs || {}).map(([key, val]) => ({
      key,
      ar: val?.ar || '',
      en: val?.en || '',
    }));
    setSpecRows(
      existingSpecs.length > 0 ? existingSpecs : [{ key: 'المواصفة 1', ar: '', en: '' }]
    );

    setConfirmDelete(false);
    setStatusError(null);
  }, [isOpen, product, defaultCategory]);

  if (!isOpen) return null;

  const handlePriceChange = (newPrice: number) => {
    const safePrice = Math.max(0, newPrice);
    setForm((prev) => {
      const orig = prev.originalPrice || 0;
      const calcDiscount =
        orig > safePrice && orig > 0 ? Math.round(((orig - safePrice) / orig) * 100) : 0;
      return { ...prev, price: safePrice, discountPercentage: calcDiscount };
    });
  };

  const handleOriginalPriceChange = (newOrig: number) => {
    const safeOrig = Math.max(0, newOrig);
    setForm((prev) => {
      const calcDiscount =
        safeOrig > prev.price && safeOrig > 0
          ? Math.round(((safeOrig - prev.price) / safeOrig) * 100)
          : 0;
      return { ...prev, originalPrice: safeOrig, discountPercentage: calcDiscount };
    });
  };

  const handleDiscountChange = (newPct: number) => {
    const safePct = Math.min(99, Math.max(0, Math.round(newPct)));
    setForm((prev) => {
      if (prev.originalPrice && prev.originalPrice > 0) {
        const discountedPrice = Math.round(prev.originalPrice * (1 - safePct / 100));
        return { ...prev, discountPercentage: safePct, price: discountedPrice };
      }
      if (prev.price > 0 && safePct > 0) {
        const derivedOrig = Math.round(prev.price / (1 - safePct / 100));
        return { ...prev, discountPercentage: safePct, originalPrice: derivedOrig };
      }
      return { ...prev, discountPercentage: safePct };
    });
  };

  const handleCategoryChange = (cat: Exclude<CategoryId, 'all'>) => {
    const meta = CATEGORY_META[cat];
    setForm((prev) => ({
      ...prev,
      category: cat,
      categoryNameAr: meta.nameAr,
      categoryNameEn: meta.nameEn,
    }));
  };

  const handleSubmit = async () => {
    setStatusError(null);
    if (!form.nameAr.trim()) {
      setStatusError('يرجى كتابة اسم المنتج بالعربية أولاً.');
      return;
    }

    setSaving(true);
    try {
      const cleanImages = [
        form.image.trim(),
        ...galleryUrls.map((u) => u.trim()),
      ].filter((u, idx, arr) => u.length > 0 && arr.indexOf(u) === idx);

      const cleanColors = colorEntries.map((c) => c.hex.trim()).filter(Boolean);
      const cleanColorNames = colorEntries.map((c) => c.nameAr.trim() || c.hex.trim());

      const parsedOptions = variantOptionsText
        .split(/[،,|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const specsRecord: Record<string, { en: string; ar: string }> = {};
      specRows.forEach((row) => {
        const k = row.key.trim();
        const vAr = row.ar.trim();
        if (k && vAr) {
          specsRecord[k] = { ar: vAr, en: row.en.trim() || vAr };
        }
      });

      const finalProduct: Product = {
        ...form,
        id: normalizeSafeId(form.id, 'prod'),
        name: form.name.trim() || form.nameAr.trim(),
        nameAr: form.nameAr.trim(),
        image: cleanImages[0] || '',
        images: cleanImages,
        colors: cleanColors,
        colorNamesAr: cleanColorNames,
        variants: {
          titleAr: form.variants.titleAr.trim() || 'الخيار',
          titleEn: form.variants.titleEn.trim() || form.variants.titleAr.trim() || 'Option',
          options: parsedOptions.length > 0 ? parsedOptions : ['الأساسي'],
        },
        specs: specsRecord,
        originalPrice:
          form.originalPrice && form.originalPrice > form.price ? form.originalPrice : undefined,
        discountPercentage:
          form.discountPercentage && form.discountPercentage > 0
            ? form.discountPercentage
            : undefined,
      };

      await onSave(finalProduct);
      onClose();
    } catch (err: unknown) {
      setStatusError(
        err instanceof Error
          ? 'تعذر الحفظ في السحابة. تأكد من صلاحية حساب الإدارة واتصالك بالإنترنت.'
          : 'حدث خطأ أثناء الحفظ.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !onDelete) return;
    setDeleting(true);
    setStatusError(null);
    try {
      await onDelete(product.id);
      onClose();
    } catch {
      setStatusError('تعذر حذف المنتج من السحابة.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1050] bg-[#070f21]/70 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong w-full max-w-4xl rounded-[32px] border border-white/70 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Frosted Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-900/10 flex items-center justify-between gap-3 bg-white/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl liquid-btn-primary flex items-center justify-center shrink-0">
              {isNew ? <Plus className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0b1220] truncate">
                {isNew ? 'إضافة منتج جديد للمتجر' : `تعديل المنتج: ${form.nameAr || product?.nameAr}`}
              </h2>
              <p className="text-[11px] text-slate-600">
                عدّل الصورة، السعر، نسبة الخصم، الألوان، الخيارات، والمواصفات داخل المربعات أدناه
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-slate-700 hover:text-slate-950 cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Rectangular Blocks Editor Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {statusError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {statusError}
            </div>
          )}

          {/* BLOCK 1: الصـور والفيديو + معاينة فورية */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0071e3]" />
                <span>الصورة الرئيسية ومعرض صور المنتج</span>
              </h3>
              <button
                type="button"
                onClick={() => setGalleryUrls((prev) => [...prev, ''])}
                className="text-xs font-bold text-[#0071e3] hover:bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/80 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة صورة إضافية</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Live Square Preview */}
              <div className="md:col-span-4 aspect-square rounded-2xl bg-slate-100/80 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center relative">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={form.nameAr || 'معاينة'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-1.5 opacity-60" />
                    <span className="text-xs font-bold block">معاينة صورة المنتج</span>
                  </div>
                )}
                {form.discountPercentage ? (
                  <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow">
                    -{form.discountPercentage}%
                  </span>
                ) : null}
              </div>

              {/* Rectangular URL Boxes */}
              <div className="md:col-span-8 space-y-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    رابط الصورة الرئيسية (URL)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={form.image}
                    onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                    placeholder="https://example.com/product-photo.jpg"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  />
                </div>

                {galleryUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {url ? (
                        <img
                          src={url}
                          alt={`صورة ${idx + 2}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="url"
                      dir="ltr"
                      value={url}
                      onChange={(e) => {
                        const next = [...galleryUrls];
                        next[idx] = e.target.value;
                        setGalleryUrls(next);
                      }}
                      placeholder={`رابط صورة إضافية ${idx + 2}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                    />
                    <button
                      type="button"
                      onClick={() => setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      aria-label="حذف الصورة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    رابط فيديو استعراض المنتج (اختياري - YouTube أو MP4)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={form.videoUrl || ''}
                    onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 2: الاسم والتصنيف والعلامة التجارية */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0b1220]">البيانات الأساسية للمنتج</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200/90 sm:col-span-2 lg:col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  اسم المنتج (بالعربية) *
                </label>
                <input
                  type="text"
                  value={form.nameAr}
                  onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
                  placeholder="مثال: آيفون 16 برو ماكس 256 جيجا"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  القسم
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value as Exclude<CategoryId, 'all'>)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                >
                  <option value="phones">الهواتف الذكية</option>
                  <option value="audio">السماعات</option>
                  <option value="cases">الكفرات والحماية</option>
                  <option value="chargers">الشواحن</option>
                  <option value="cables">الكيابل</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  اسم المنتج (بالإنجليزي - اختياري)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="iPhone 16 Pro Max"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  الشركة / الماركة
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="Apple, Samsung, Anker..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  كود المنتج (SKU)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  placeholder="SDM-1001"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>
            </div>
          </div>

          {/* BLOCK 3: السعر، السعر قبل الخصم، النسبة %، المخزون والضمان */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#0071e3]" />
              <span>السعر ونسبة الخصم والمخزون والضمان</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  السعر الحالي (ر.ي)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-black text-[#0071e3] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  السعر قبل الخصم
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.originalPrice || 0}
                  onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/90">
                <label className="block text-[11px] font-extrabold text-rose-700 mb-1">
                  نسبة الخصم (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={form.discountPercentage || 0}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-rose-200 text-sm font-black text-rose-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  الكمية بالمخزون
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.stock ?? 10}
                  onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  سنوات الضمان
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={form.warrantyYears}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, warrantyYears: Number(e.target.value) }))
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  التقييم (من 5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-amber-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>
            </div>
          </div>

          {/* BLOCK 4: الألوان والخيارات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Colors Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0071e3]" />
                  <span>الألوان المتوفرة</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setColorEntries((prev) => [...prev, { hex: '#0071e3', nameAr: 'أزرق' }])
                  }
                  className="text-xs font-bold text-[#0071e3] hover:bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة لون</span>
                </button>
              </div>

              {colorEntries.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  لا توجد ألوان محددة (اضغط "+ إضافة لون" لإضافة ألوان لهذا المنتج)
                </p>
              ) : (
                <div className="space-y-2">
                  {colorEntries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2"
                    >
                      <input
                        type="color"
                        value={entry.hex.startsWith('#') ? entry.hex : '#0f172a'}
                        onChange={(e) => {
                          const next = [...colorEntries];
                          next[idx] = { ...next[idx], hex: e.target.value };
                          setColorEntries(next);
                        }}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={entry.nameAr}
                        onChange={(e) => {
                          const next = [...colorEntries];
                          next[idx] = { ...next[idx], nameAr: e.target.value };
                          setColorEntries(next);
                        }}
                        placeholder="اسم اللون (مثال: تيتانيوم صحراوي)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setColorEntries((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        aria-label="حذف اللون"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variants Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0071e3]" />
                <span>الخيارات (السعة / الموديل / المقاس)</span>
              </h3>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    عنوان الخيار (مثال: السعة التخزينية أو الموديل)
                  </label>
                  <input
                    type="text"
                    value={form.variants.titleAr}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        variants: { ...p.variants, titleAr: e.target.value },
                      }))
                    }
                    placeholder="السعة / الموديل"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    القيم المتاحة (افصل بينها بفاصلة: 256GB, 512GB, 1TB)
                  </label>
                  <input
                    type="text"
                    value={variantOptionsText}
                    onChange={(e) => setVariantOptionsText(e.target.value)}
                    placeholder="256GB ، 512GB ، 1TB"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 5: الوصف والمواصفات التقنية */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#0071e3]" />
              <span>الوصف التفصيلي والمواصفات التقنية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  وصف المنتج بالعربية
                </label>
                <textarea
                  rows={3}
                  value={form.descriptionAr}
                  onChange={(e) => setForm((p) => ({ ...p, descriptionAr: e.target.value }))}
                  placeholder="اكتب مميزات المنتج وتفاصيل الضمان..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  وصف المنتج بالإنجليزية (اختياري)
                </label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional English description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>
            </div>

            {/* Technical Specs Rectangular Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700">
                  جدول المواصفات (المعالج، الشاشة، الكاميرا، البطارية...)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSpecRows((prev) => [...prev, { key: '', ar: '', en: '' }])
                  }
                  className="text-xs font-bold text-[#0071e3] hover:bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مواصفة</span>
                </button>
              </div>

              {specRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-2 rounded-xl bg-white border border-slate-200 items-center"
                >
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => {
                      const next = [...specRows];
                      next[idx] = { ...next[idx], key: e.target.value };
                      setSpecRows(next);
                    }}
                    placeholder="المواصفة (مثال: المعالج)"
                    className="col-span-4 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                  <input
                    type="text"
                    value={row.ar}
                    onChange={(e) => {
                      const next = [...specRows];
                      next[idx] = { ...next[idx], ar: e.target.value };
                      setSpecRows(next);
                    }}
                    placeholder="القيمة (مثال: A18 Pro)"
                    className="col-span-7 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220]"
                  />
                  <button
                    type="button"
                    onClick={() => setSpecRows((prev) => prev.filter((_, i) => i !== idx))}
                    className="col-span-1 flex items-center justify-center p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BLOCK 6: خيارات العرض والإخفاء */}
          <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-sm flex flex-wrap items-center gap-3 text-xs font-bold">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm((p) => ({ ...p, inStock: e.target.checked }))}
                className="accent-[#0071e3] w-4 h-4"
              />
              <span>متوفر في المخزون</span>
            </label>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.fastShipping}
                onChange={(e) => setForm((p) => ({ ...p, fastShipping: e.target.checked }))}
                className="accent-[#0071e3] w-4 h-4"
              />
              <span>توصيل سريع 24 ساعة</span>
            </label>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.isTrending)}
                onChange={(e) => setForm((p) => ({ ...p, isTrending: e.target.checked }))}
                className="accent-[#0071e3] w-4 h-4"
              />
              <span>عرض في الأكثر طلباً</span>
            </label>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.isPopular)}
                onChange={(e) => setForm((p) => ({ ...p, isPopular: e.target.checked }))}
                className="accent-[#0071e3] w-4 h-4"
              />
              <span>الأعلى تقييماً</span>
            </label>

            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, hidden: !p.hidden }))}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                form.hidden
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {form.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{form.hidden ? 'مخفي عن الزوار حالياً' : 'ظاهر للزوار'}</span>
            </button>
          </div>
        </div>

        {/* Sticky Bottom Action Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-slate-900/10 bg-white/70 flex flex-wrap items-center justify-between gap-3">
          {!isNew && onDelete ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>تأكيد الحذف النهائي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2.5 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  تراجع
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف المنتج</span>
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5 mr-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl liquid-glass-subtle text-slate-700 hover:text-slate-950 text-xs font-extrabold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl liquid-btn-primary text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isNew ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isNew ? 'إضافة المنتج وحفظه' : 'حفظ التعديلات في السحابة'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
