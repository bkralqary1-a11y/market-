import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Copy,
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
  Upload,
  Star,
  Link2,
  Check,
} from 'lucide-react';
import { Product, CategoryId, StoreCategoryItem, StoreBrandItem } from '../types';
import { normalizeSafeId, formatCloudError } from '../services/firestoreService';
import { compressImageFileToDataUrl, recompressDataUrlToBudget } from '../utils/imageUpload';
import { getProductShareUrl, copyTextToClipboard } from '../utils/productLinks';

const MAX_PRODUCT_IMAGES = 5;

function getPerImageBudget(totalCount: number, isPrimary: boolean) {
  if (totalCount <= 1) {
    return { maxDimension: 1600, quality: 0.92, maxChars: 360000 };
  }
  if (totalCount === 2) {
    return isPrimary
      ? { maxDimension: 1450, quality: 0.9, maxChars: 280000 }
      : { maxDimension: 1280, quality: 0.88, maxChars: 220000 };
  }
  if (totalCount === 3) {
    return isPrimary
      ? { maxDimension: 1400, quality: 0.88, maxChars: 240000 }
      : { maxDimension: 1200, quality: 0.86, maxChars: 185000 };
  }
  if (totalCount === 4) {
    return isPrimary
      ? { maxDimension: 1300, quality: 0.88, maxChars: 215000 }
      : { maxDimension: 1120, quality: 0.85, maxChars: 160000 };
  }
  return isPrimary
    ? { maxDimension: 1250, quality: 0.86, maxChars: 200000 }
    : { maxDimension: 1080, quality: 0.84, maxChars: 145000 };
}

interface VisualProductEditorModalProps {
  isOpen: boolean;
  product: Product | null; // null => Add new product
  isClone?: boolean; // true => Opened as a clone (saves as a brand-new product without images)
  defaultCategory?: CategoryId;
  categories: StoreCategoryItem[];
  brands: StoreBrandItem[];
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

function createEmptyProduct(
  defaultCategory: CategoryId,
  categories: StoreCategoryItem[]
): Product {
  const matchedCat =
    categories.find((c) => c.id === defaultCategory) ||
    categories[0] || { id: 'phones', nameAr: 'الهواتف الذكية', nameEn: 'Smartphones' };

  return {
    id: `prod-${Date.now().toString(36)}`,
    sku: '',
    name: '',
    nameAr: '',
    brand: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    category: matchedCat.id,
    categoryNameEn: matchedCat.nameEn || matchedCat.nameAr,
    categoryNameAr: matchedCat.nameAr,
    image: '',
    images: [],
    rating: 0,
    reviewsCount: 0,
    description: '',
    descriptionAr: '',
    inStock: true,
    stock: 0,
    fastShipping: false,
    warrantyYears: 0,
    isTrending: true,
    isPopular: false,
    isFeatured: false,
    colors: [],
    colorNamesAr: [],
    variants: {
      titleEn: '',
      titleAr: '',
      options: [],
    },
    specs: {},
    tagAr: '',
    videoUrl: '',
    hidden: false,
  };
}

export default function VisualProductEditorModal({
  isOpen,
  product,
  isClone = false,
  defaultCategory = 'phones',
  categories,
  brands,
  onClose,
  onSave,
  onDelete,
}: VisualProductEditorModalProps) {
  const [clonedInModal, setClonedInModal] = useState(false);
  const isNew = !product || isClone || clonedInModal;
  const isCloneMode = isClone || clonedInModal;

  const categoriesRef = useRef<StoreCategoryItem[]>(categories);
  categoriesRef.current = categories;
  const scrollBodyRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<Product>(() =>
    product ? { ...product } : createEmptyProduct(defaultCategory, categories)
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [colorEntries, setColorEntries] = useState<ColorEntry[]>([]);
  const [variantOptionsText, setVariantOptionsText] = useState('');
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadDoneMsg, setUploadDoneMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const base = product
      ? {
          ...product,
          ...(isClone ? { id: `prod-${Date.now().toString(36)}`, image: '', images: [] } : {}),
        }
      : createEmptyProduct(defaultCategory, categoriesRef.current);
    setForm(base);
    setClonedInModal(false);

    const extraImages = isClone
      ? []
      : (base.images || []).filter((img) => img && img !== base.image);
    setGalleryUrls(extraImages);

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
    setSpecRows(existingSpecs);

    setConfirmDelete(false);
    setStatusError(null);
    setUploadDoneMsg(null);
    setUploadProgress(0);
    setUploadLabel('');
    setLinkCopied(false);
  }, [isOpen, product, isClone, defaultCategory]);

  if (!isOpen) return null;

  const flashUploadDone = (msg: string) => {
    setUploadDoneMsg(msg);
    setTimeout(() => {
      setUploadDoneMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleCloneInPlace = () => {
    setForm((prev) => ({
      ...prev,
      id: `prod-${Date.now().toString(36)}`,
      image: '',
      images: [],
    }));
    setGalleryUrls([]);
    setClonedInModal(true);
    setConfirmDelete(false);
    setStatusError(null);
    setUploadDoneMsg(null);
    if (scrollBodyRef.current) {
      scrollBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBatchPhotoUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    mode: 'fill' | 'replace-primary' = 'fill'
  ) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length === 0) return;

    const existingGallery = galleryUrls.filter((u) => Boolean(u.trim()));
    const hasPrimary = Boolean(form.image.trim());

    let maxAccept = MAX_PRODUCT_IMAGES;
    if (mode === 'fill') {
      const currentCount = (hasPrimary ? 1 : 0) + existingGallery.length;
      maxAccept = Math.max(0, MAX_PRODUCT_IMAGES - currentCount);
      if (maxAccept === 0) {
        setStatusError(`الحد الأقصى لصور المنتج هو ${MAX_PRODUCT_IMAGES} صور. احذف صورة أولاً لإضافة غيرها.`);
        return;
      }
    } else if (files.length === 1) {
      maxAccept = 1;
    } else {
      // Replacing primary + filling remaining slots up to 5 photos in a single pick
      maxAccept = MAX_PRODUCT_IMAGES;
    }

    const selected = files.slice(0, maxAccept);
    const trimmedNotice =
      files.length > selected.length
        ? ` (تم اختيار أول ${selected.length} صور فقط لأن الحد الأقصى ${MAX_PRODUCT_IMAGES} صور)`
        : '';

    const projectedTotal =
      mode === 'replace-primary' && selected.length > 1
        ? selected.length
        : Math.min(
            MAX_PRODUCT_IMAGES,
            (hasPrimary ? 1 : 0) +
              existingGallery.length +
              (mode === 'replace-primary' && hasPrimary ? 0 : selected.length)
          );

    setUploadingImage(true);
    setUploadProgress(5);
    setUploadDoneMsg(null);
    setStatusError(null);

    try {
      const uploaded: string[] = [];
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        const isFirstPrimary =
          (mode === 'replace-primary' && i === 0) || (!hasPrimary && i === 0);
        const budget = getPerImageBudget(projectedTotal, isFirstPrimary);

        setUploadLabel(
          selected.length > 1
            ? `جاري رفع الصورة ${i + 1} من ${selected.length} بأعلى جودة...`
            : 'جاري رفع الصورة بأعلى جودة...'
        );

        const dataUrl = await compressImageFileToDataUrl(file, {
          ...budget,
          onProgress: (pct) => {
            const overall = Math.round(((i + pct / 100) / selected.length) * 100);
            setUploadProgress(overall);
          },
        });
        uploaded.push(dataUrl);
      }

      if (mode === 'replace-primary') {
        if (uploaded.length === 1) {
          setForm((prev) => ({ ...prev, image: uploaded[0] }));
        } else if (uploaded.length > 1) {
          setForm((prev) => ({ ...prev, image: uploaded[0] }));
          const nextGallery = [...uploaded.slice(1), ...existingGallery].slice(
            0,
            MAX_PRODUCT_IMAGES - 1
          );
          setGalleryUrls(nextGallery);
        }
      } else {
        if (!hasPrimary && uploaded.length > 0) {
          setForm((prev) => ({ ...prev, image: uploaded[0] }));
          if (uploaded.length > 1) {
            setGalleryUrls((prev) =>
              [...prev.filter((u) => Boolean(u.trim())), ...uploaded.slice(1)].slice(
                0,
                MAX_PRODUCT_IMAGES - 1
              )
            );
          }
        } else {
          setGalleryUrls((prev) =>
            [...prev.filter((u) => Boolean(u.trim())), ...uploaded].slice(
              0,
              MAX_PRODUCT_IMAGES - 1
            )
          );
        }
      }

      flashUploadDone(
        uploaded.length > 1
          ? `تم رفع ${uploaded.length} صور دفعة واحدة بأعلى جودة ✓${trimmedNotice}`
          : `تم رفع الصورة بأعلى جودة ✓${trimmedNotice}`
      );
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'تعذر رفع بعض الصور.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      setUploadLabel('');
    }
  };

  const handleSingleGalleryUpload = async (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length === 0) return;

    // If user selected multiple files from a single slot, fill sequentially up to 5 total!
    if (files.length > 1) {
      const remaining = Math.max(1, MAX_PRODUCT_IMAGES - 1 - idx);
      const selected = files.slice(0, remaining);
      setUploadingImage(true);
      setUploadProgress(5);
      setUploadDoneMsg(null);
      setStatusError(null);
      try {
        const budget = getPerImageBudget(MAX_PRODUCT_IMAGES, false);
        const uploaded: string[] = [];
        for (let i = 0; i < selected.length; i++) {
          setUploadLabel(`جاري رفع الصورة ${i + 1} من ${selected.length} بأعلى جودة...`);
          const dataUrl = await compressImageFileToDataUrl(selected[i], {
            ...budget,
            onProgress: (pct) => {
              const overall = Math.round(((i + pct / 100) / selected.length) * 100);
              setUploadProgress(overall);
            },
          });
          uploaded.push(dataUrl);
        }
        setGalleryUrls((prev) => {
          const next = [...prev];
          uploaded.forEach((url, offset) => {
            next[idx + offset] = url;
          });
          return next.slice(0, MAX_PRODUCT_IMAGES - 1);
        });
        flashUploadDone(`تم رفع ${uploaded.length} صور إضافية بأعلى جودة ✓`);
      } catch (err) {
        setStatusError(err instanceof Error ? err.message : 'تعذر رفع الصور.');
      } finally {
        setUploadingImage(false);
        setUploadProgress(0);
        setUploadLabel('');
      }
      return;
    }

    const file = files[0];
    setUploadingImage(true);
    setUploadProgress(10);
    setUploadLabel(`جاري رفع الصورة الإضافية ${idx + 2} بأعلى جودة...`);
    setUploadDoneMsg(null);
    setStatusError(null);
    try {
      const totalCount = Math.max(2, (form.image.trim() ? 1 : 0) + galleryUrls.length);
      const budget = getPerImageBudget(totalCount, false);
      const dataUrl = await compressImageFileToDataUrl(file, {
        ...budget,
        onProgress: (pct) => setUploadProgress(pct),
      });
      setGalleryUrls((prev) => {
        const next = [...prev];
        next[idx] = dataUrl;
        return next;
      });
      flashUploadDone('تم رفع الصورة الإضافية بأعلى جودة ✓');
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'تعذر رفع الصورة.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      setUploadLabel('');
    }
  };

  const handlePromoteToPrimary = (galleryIdx: number) => {
    const chosen = galleryUrls[galleryIdx];
    if (!chosen) return;
    const oldPrimary = form.image.trim();
    setForm((prev) => ({ ...prev, image: chosen }));
    setGalleryUrls((prev) => {
      const next = prev.filter((_, i) => i !== galleryIdx);
      if (oldPrimary) {
        next.splice(galleryIdx, 0, oldPrimary);
      }
      return next;
    });
  };

  const handleRemovePhotoAtSlot = (slotIdx: number) => {
    if (slotIdx === 0) {
      const cleanExtra = galleryUrls.filter((u) => Boolean(u.trim()));
      if (cleanExtra.length > 0) {
        setForm((prev) => ({ ...prev, image: cleanExtra[0] }));
        setGalleryUrls(cleanExtra.slice(1));
      } else {
        setForm((prev) => ({ ...prev, image: '' }));
      }
    } else {
      const gIdx = slotIdx - 1;
      setGalleryUrls((prev) => prev.filter((_, i) => i !== gIdx));
    }
  };

  const handlePriceChange = (val: string) => {
    const safePrice = val === '' ? 0 : Math.max(0, Number(val) || 0);
    setForm((prev) => {
      const orig = prev.originalPrice || 0;
      const calcDiscount =
        orig > safePrice && orig > 0 ? Math.round(((orig - safePrice) / orig) * 100) : 0;
      return { ...prev, price: safePrice, discountPercentage: calcDiscount };
    });
  };

  const handleOriginalPriceChange = (val: string) => {
    const safeOrig = val === '' ? 0 : Math.max(0, Number(val) || 0);
    setForm((prev) => {
      const calcDiscount =
        safeOrig > prev.price && safeOrig > 0
          ? Math.round(((safeOrig - prev.price) / safeOrig) * 100)
          : 0;
      return { ...prev, originalPrice: safeOrig, discountPercentage: calcDiscount };
    });
  };

  const handleDiscountChange = (val: string) => {
    const safePct = val === '' ? 0 : Math.min(99, Math.max(0, Math.round(Number(val) || 0)));
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

  const handleCategoryChange = (catId: string) => {
    const matched = categories.find((c) => c.id === catId);
    setForm((prev) => ({
      ...prev,
      category: catId,
      categoryNameAr: matched?.nameAr || catId,
      categoryNameEn: matched?.nameEn || matched?.nameAr || catId,
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
      let cleanImages = [
        form.image.trim(),
        ...galleryUrls.map((u) => u.trim()),
      ]
        .filter((u, idx, arr) => u.length > 0 && arr.indexOf(u) === idx)
        .slice(0, MAX_PRODUCT_IMAGES);

      // Automatically balance total size comfortably below Firestore's 1MB document limit
      // so uploading 5 high-resolution photos ALWAYS succeeds on the first try
      let totalImageBytes = cleanImages.reduce((sum, s) => sum + s.length, 0);
      if (totalImageBytes > 820000) {
        const dataUrlsCount = cleanImages.filter((s) => s.startsWith('data:image/')).length;
        if (dataUrlsCount > 0) {
          const nonDataBytes = cleanImages
            .filter((s) => !s.startsWith('data:image/'))
            .reduce((sum, s) => sum + s.length, 0);
          const perImageShare = Math.max(
            95000,
            Math.floor((780000 - nonDataBytes) / dataUrlsCount)
          );
          const rebalanced: string[] = [];
          for (let i = 0; i < cleanImages.length; i++) {
            const imgStr = cleanImages[i];
            if (imgStr.startsWith('data:image/') && imgStr.length > perImageShare) {
              const targetShare = i === 0 ? Math.min(220000, Math.round(perImageShare * 1.15)) : perImageShare;
              const fitted = await recompressDataUrlToBudget(imgStr, {
                maxDimension: i === 0 ? 1250 : 1050,
                quality: 0.84,
                maxChars: targetShare,
              });
              rebalanced.push(fitted);
            } else {
              rebalanced.push(imgStr);
            }
          }
          cleanImages = rebalanced;
          totalImageBytes = cleanImages.reduce((sum, s) => sum + s.length, 0);
        }
      }

      if (totalImageBytes > 860000) {
        setStatusError(
          'مجموع حجم الصور كبير جداً. يرجى تقليل عدد الصور الإضافية أو استخدام روابط مباشرة لبعضها.'
        );
        setSaving(false);
        return;
      }

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
        id: isNew ? normalizeSafeId(form.id, 'prod') : form.id,
        name: form.name.trim(),
        nameAr: form.nameAr.trim(),
        brand: form.brand.trim(),
        sku: form.sku.trim(),
        description: form.description.trim(),
        descriptionAr: form.descriptionAr.trim(),
        image: cleanImages[0] || '',
        images: cleanImages,
        colors: cleanColors,
        colorNamesAr: cleanColorNames,
        variants: {
          titleAr: parsedOptions.length > 0 ? form.variants.titleAr.trim() || 'السعة / الموديل' : '',
          titleEn:
            parsedOptions.length > 0
              ? form.variants.titleEn.trim() || form.variants.titleAr.trim() || 'Option'
              : '',
          options: parsedOptions, // Empty array when left blank => never shows!
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
        formatCloudError(err, 'تعذر الحفظ في السحابة. تأكد من صلاحية حساب الإدارة واتصالك بالإنترنت.')
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
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isCloneMode ? 'bg-indigo-600 shadow-md shadow-indigo-500/30' : 'liquid-btn-primary'
              }`}
            >
              {isCloneMode ? (
                <Copy className="w-5 h-5 text-white" />
              ) : isNew ? (
                <Plus className="w-5 h-5 text-white" />
              ) : (
                <Sparkles className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0b1220] truncate">
                {isCloneMode
                  ? `استنساخ منتج جديد: ${form.nameAr || 'نسخة جديدة'}`
                  : isNew
                  ? 'إضافة منتج جديد للمتجر'
                  : `تعديل المنتج: ${form.nameAr || product?.nameAr}`}
              </h2>
              <p className="text-[11px] text-slate-600">
                {isCloneMode
                  ? 'تم نسخ كافة بيانات المنتج ما عدا الصور — أضف الصور الجديدة ثم اضغط حفظ ليصبح لديك منتجان مستقلان'
                  : 'كل المربعات اختيارية — أي مربع تكتب فيه سيظهر في صفحة المنتج، وأي مربع تتركه فارغاً لن يظهر'}
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
        <div ref={scrollBodyRef} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {isCloneMode && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-extrabold flex items-center gap-2.5">
              <Copy className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>
                وضع الاستنساخ: تم نسخ الاسم والسعر والألوان والمواصفات والوصف ما عدا الصور. أضف الصور الجديدة ثم احفظ ليُضاف كمنتج مستقل ثانٍ!
              </span>
            </div>
          )}

          {statusError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {statusError}
            </div>
          )}

          {/* Direct Permanent Product Link Strip */}
          {form.id && (
            <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0071e3] mb-1">
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isNew
                      ? 'الرابط المباشر الدائم للمنتج (يعمل فور الحفظ)'
                      : 'الرابط المباشر الدائم للمنتج (للنشر في واتساب والفيسبوك وغيرها)'}
                  </span>
                </div>
                <p
                  dir="ltr"
                  className="text-[11px] font-mono text-slate-700 bg-white/80 border border-sky-200/70 rounded-xl px-3 py-1.5 truncate select-all"
                >
                  {getProductShareUrl(isNew ? normalizeSafeId(form.id, 'prod') : form.id)}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const safeId = isNew ? normalizeSafeId(form.id, 'prod') : form.id;
                  const ok = await copyTextToClipboard(getProductShareUrl(safeId));
                  if (ok) {
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2200);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm ${
                  linkCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0071e3] hover:bg-[#005bbf] text-white'
                }`}
              >
                {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>{linkCopied ? 'تم نسخ الرابط ✓' : 'نسخ رابط المنتج'}</span>
              </button>
            </div>
          )}

          {/* BLOCK 1: الصور (تحديد حتى 5 صور دفعة واحدة من المعرض + روابط اختيارية) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-4">
            {(() => {
              const filledExtra = galleryUrls.filter((u) => Boolean(u.trim()));
              const totalUploadedPhotos = (form.image.trim() ? 1 : 0) + filledExtra.length;
              const remainingPhotos = Math.max(0, MAX_PRODUCT_IMAGES - totalUploadedPhotos);
              const slots = Array.from({ length: MAX_PRODUCT_IMAGES }, (_, idx) =>
                idx === 0 ? form.image.trim() : galleryUrls[idx - 1]?.trim() || ''
              );

              return (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#0071e3]" />
                      <span>صور المنتج ({totalUploadedPhotos} / {MAX_PRODUCT_IMAGES} صور)</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        className={`text-xs font-extrabold bg-[#0071e3] hover:bg-[#005bbf] text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          uploadingImage || remainingPhotos === 0 ? 'opacity-65 pointer-events-none' : ''
                        }`}
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {uploadingImage
                            ? `جاري الرفع ${uploadProgress}%`
                            : remainingPhotos > 0
                            ? `تحديد حتى ${remainingPhotos} صور دفعة واحدة`
                            : `اكتملت ${MAX_PRODUCT_IMAGES} صور`}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleBatchPhotoUpload(e, 'fill')}
                          className="hidden"
                          disabled={uploadingImage || remainingPhotos === 0}
                        />
                      </label>
                      {galleryUrls.length < MAX_PRODUCT_IMAGES - 1 && (
                        <button
                          type="button"
                          onClick={() => setGalleryUrls((prev) => [...prev, ''])}
                          className="text-xs font-bold text-[#0071e3] hover:bg-sky-50 px-3 py-2 rounded-xl border border-sky-200/80 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>رابط إضافي</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {uploadingImage && (
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold text-sky-900">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#0071e3]" />
                          <span>{uploadLabel || 'جاري رفع ومعالجة الصور بأعلى جودة...'}</span>
                        </span>
                        <span className="tabular-nums font-black text-[#0071e3]">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-sky-200/80 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-l from-[#0071e3] to-sky-400 transition-all duration-200"
                          style={{ width: `${Math.max(8, uploadProgress)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!uploadingImage && uploadDoneMsg && (
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{uploadDoneMsg}</span>
                    </div>
                  )}

                  {/* Interactive 5-Photo Visual Strip (Select up to 5 photos at once!) */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                    {slots.map((slotUrl, slotIdx) => {
                      const isPrimarySlot = slotIdx === 0;
                      return (
                        <div
                          key={slotIdx}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            slotUrl
                              ? isPrimarySlot
                                ? 'border-[#0071e3] bg-white shadow-sm'
                                : 'border-slate-200 bg-white'
                              : 'border-dashed border-slate-300 bg-slate-50/80 hover:border-[#0071e3]'
                          }`}
                        >
                          {slotUrl ? (
                            <>
                              <img
                                src={slotUrl}
                                alt={`صورة ${slotIdx + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <span
                                className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-md text-[9px] font-black shadow ${
                                  isPrimarySlot
                                    ? 'bg-[#0071e3] text-white'
                                    : 'bg-slate-900/75 text-white'
                                }`}
                              >
                                {isPrimarySlot ? 'رئيسية' : slotIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemovePhotoAtSlot(slotIdx)}
                                className="absolute top-1 left-1 w-5 h-5 rounded-full bg-rose-600/95 hover:bg-rose-700 text-white flex items-center justify-center shadow cursor-pointer"
                                aria-label="حذف الصورة"
                                title="حذف هذه الصورة"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              {!isPrimarySlot && (
                                <button
                                  type="button"
                                  onClick={() => handlePromoteToPrimary(slotIdx - 1)}
                                  className="absolute bottom-1 inset-x-1 py-0.5 rounded-md bg-slate-900/75 hover:bg-[#0071e3] text-white text-[9px] font-extrabold flex items-center justify-center gap-0.5 cursor-pointer transition-colors"
                                  title="جعلها الصورة الرئيسية"
                                >
                                  <Star className="w-2.5 h-2.5" />
                                  <span className="truncate">رئيسية</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center p-1 text-slate-400 hover:text-[#0071e3] cursor-pointer text-center">
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                              <span className="text-[9px] sm:text-[10px] font-extrabold leading-tight">
                                {isPrimarySlot ? 'رئيسية' : `صورة ${slotIdx + 1}`}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleBatchPhotoUpload(e, 'fill')}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Live Square Preview + Direct Tap to Multi-Upload up to 5 Photos */}
                    <div className="md:col-span-4 aspect-square rounded-2xl bg-slate-100/80 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center relative group">
                      {form.image ? (
                        <>
                          <img
                            src={form.image}
                            alt={form.nameAr || 'معاينة'}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1.5">
                            <label className="px-2.5 py-1.5 rounded-xl bg-[#0071e3]/95 hover:bg-[#005bbf] text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer shadow">
                              <Upload className="w-3 h-3" />
                              <span>تغيير / إضافة صور</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleBatchPhotoUpload(e, 'replace-primary')}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemovePhotoAtSlot(0)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600/95 hover:bg-rose-700 text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer shadow"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>مسح</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-500 hover:text-[#0071e3] cursor-pointer text-center transition-colors">
                          <Upload className="w-9 h-9 mb-2 opacity-75" />
                          <span className="text-xs font-extrabold block">
                            اضغط لاختيار حتى {MAX_PRODUCT_IMAGES} صور دفعة واحدة
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            حدّد عدة صور معاً وتُرفع تلقائياً بأعلى دقة HD
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleBatchPhotoUpload(e, 'fill')}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      )}

                      {uploadingImage && (
                        <div className="absolute inset-0 z-20 bg-slate-950/65 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-white text-center">
                          <Loader2 className="w-10 h-10 animate-spin text-sky-400 mb-2" />
                          <span className="text-xs font-extrabold">جاري التحميل بأعلى جودة...</span>
                          <span className="text-sm font-black tabular-nums text-sky-300 mt-1">
                            {uploadProgress}%
                          </span>
                        </div>
                      )}

                      {form.discountPercentage ? (
                        <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow">
                          -{form.discountPercentage}%
                        </span>
                      ) : null}
                    </div>

                    {/* Primary & Gallery Upload / URL Boxes */}
                    <div className="md:col-span-8 space-y-3">
                      <div className="p-3 rounded-xl bg-white border border-slate-200/90 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] font-extrabold text-slate-600">
                            الصورة الرئيسية (أو حدّد حتى {MAX_PRODUCT_IMAGES} صور معاً)
                          </label>
                          <label className="text-[11px] font-extrabold text-[#0071e3] hover:underline flex items-center gap-1 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>اختر من المعرض</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleBatchPhotoUpload(e, 'replace-primary')}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          dir="ltr"
                          value={form.image.startsWith('data:') ? '' : form.image}
                          onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                          placeholder={
                            form.image.startsWith('data:')
                              ? 'تم رفع الصورة الرئيسية من جهازك بنجاح ✓ (أو الصق رابطاً لاستبدالها)'
                              : 'https://example.com/product-photo.jpg (اختياري)'
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                        />
                      </div>

                      {galleryUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center gap-2"
                        >
                          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
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
                            type="text"
                            dir="ltr"
                            value={url.startsWith('data:') ? '' : url}
                            onChange={(e) => {
                              const next = [...galleryUrls];
                              next[idx] = e.target.value;
                              setGalleryUrls(next);
                            }}
                            placeholder={
                              url.startsWith('data:')
                                ? `صورة إضافية ${idx + 2} مرفوعة من الجهاز ✓`
                                : `رابط صورة إضافية ${idx + 2}`
                            }
                            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                          />
                          <label
                            className="p-2 rounded-lg text-[#0071e3] hover:bg-sky-50 cursor-pointer shrink-0"
                            title="رفع من المعرض"
                          >
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleSingleGalleryUpload(idx, e)}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer shrink-0"
                            aria-label="حذف الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                        <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                          رابط فيديو للمنتج (اختياري)
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={form.videoUrl || ''}
                          onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                          placeholder="اتركه فارغاً إذا لا يوجد فيديو"
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
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
                  placeholder="اكتب اسم المنتج هنا..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  القسم (من القوائم الموجودة والمضافة)
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3] cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  العلامة التجارية (من العلامات الموجودة والمضافة)
                </label>
                <select
                  value={form.brand}
                  onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3] cursor-pointer"
                >
                  <option value="">— بدون علامة تجارية —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.nameAr}>
                      {b.nameAr}
                    </option>
                  ))}
                  {form.brand.trim() &&
                    !brands.some(
                      (b) => b.nameAr.trim().toLowerCase() === form.brand.trim().toLowerCase()
                    ) && <option value={form.brand}>{form.brand}</option>}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  اسم المنتج بالإنجليزي (اختياري)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Optional English Name"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  كود المنتج SKU (اختياري)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  placeholder="اتركه فارغاً للإخفاء"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>
            </div>
          </div>

          {/* BLOCK 3: السعر، الخصم، المخزون */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#0071e3]" />
              <span>السعر ونسبة الخصم</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  السعر الحالي (ر.ي)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price || ''}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="مثال: 15000"
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-black text-[#0071e3] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  السعر قبل الخصم (اختياري)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.originalPrice || ''}
                  onChange={(e) => handleOriginalPriceChange(e.target.value)}
                  placeholder="فارغ"
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/90">
                <label className="block text-[11px] font-extrabold text-rose-700 mb-1">
                  نسبة الخصم % (اختياري)
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={form.discountPercentage || ''}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder="فارغ"
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-rose-200 text-sm font-black text-rose-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  الكمية بالمخزون (اختياري)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.stock || ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      stock: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  placeholder="فارغ"
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#0b1220] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  التقييم من 5 (اختياري)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={form.rating || ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      rating:
                        e.target.value === ''
                          ? 0
                          : Math.min(5, Math.max(0, Number(e.target.value) || 0)),
                    }))
                  }
                  placeholder="فارغ للإخفاء"
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-amber-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>
            </div>
          </div>

          {/* BLOCK 4: الألوان والخيارات (تظهر فقط عند الإضافة!) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Colors Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0071e3]" />
                  <span>الألوان المتوفرة (اختياري)</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setColorEntries((prev) => [...prev, { hex: '#1e293b', nameAr: '' }])
                  }
                  className="text-xs font-bold text-[#0071e3] hover:bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة لون</span>
                </button>
              </div>

              {colorEntries.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  فارغ — لن يظهر قسم الألوان في صفحة المنتج إلا إذا أضفت لوناً هنا.
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
                        placeholder="اسم اللون (مثال: أسود، أزرق، وردي)"
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
                <span>السعة التخزينية / الموديل (اختياري)</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                للهواتف اكتب السعات مثل (128GB, 256GB, 512GB). للأغلفة والملحقات اتركه فارغاً تماماً ولن يظهر في الصفحة!
              </p>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    عنوان الخيار (اختياري)
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
                    placeholder="مثال: السعة التخزينية أو الموديل"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                    القيم المتاحة (افصل بفاصلة — اتركه فارغاً للإخفاء)
                  </label>
                  <input
                    type="text"
                    value={variantOptionsText}
                    onChange={(e) => setVariantOptionsText(e.target.value)}
                    placeholder="مثال: 128GB ، 256GB ، 512GB"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-[#0b1220]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 5: الوصف والمواصفات (تظهر فقط عند الكتابة فيها) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#0b1220] flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#0071e3]" />
              <span>الوصف والمواصفات (اختياري)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200/90">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  وصف المنتج بالعربية (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={form.descriptionAr}
                  onChange={(e) => setForm((p) => ({ ...p, descriptionAr: e.target.value }))}
                  placeholder="اكتب وصف المنتج إذا أردت، أو اتركه فارغاً..."
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
                  جدول المواصفات (يظهر فقط ما تضيفه هنا)
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

              {specRows.length === 0 ? (
                <p className="text-xs text-slate-500 py-1">
                  لا توجد مواصفات مضافة — اضغط "+ إضافة مواصفة" لإضافة المعالج أو البطارية أو أي تفاصيل أخرى.
                </p>
              ) : (
                specRows.map((row, idx) => (
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
                      placeholder="المواصفة (مثال: البطارية)"
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
                      placeholder="القيمة (مثال: 5000 مللي أمبير)"
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
                ))
              )}
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
              <span>متوفر حالياً</span>
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
        <div className="px-5 sm:px-7 py-4 border-t border-slate-900/10 bg-white/70 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {!isNew && onDelete && (
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
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف المنتج</span>
                </button>
              )
            )}

            {!isNew && (
              <button
                type="button"
                onClick={handleCloneInPlace}
                disabled={saving || uploadingImage}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                title="نسخ كل بيانات المنتج كمنتج ثانٍ مستقل بدون الصور"
              >
                <Copy className="w-4 h-4" />
                <span>استنساخ بدون الصور</span>
              </button>
            )}
          </div>

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
              disabled={saving || uploadingImage}
              className="px-6 py-2.5 rounded-2xl liquid-btn-primary text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isNew ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {isCloneMode
                  ? 'حفظ النسخة كمنتج جديد'
                  : isNew
                  ? 'إضافة المنتج وحفظه'
                  : 'حفظ التعديلات في السحابة'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
