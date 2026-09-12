import React, { useState, FormEvent, ChangeEvent } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Check,
  RefreshCw,
  Download,
  Upload,
  Search,
  SlidersHorizontal,
  Layers,
  Video,
  Image as ImageIcon,
  Key,
  LogOut,
  Sparkles,
  Smartphone,
  Save,
  AlertCircle,
  Percent,
  Tag,
  Camera,
  HelpCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Store,
  Film,
  Globe,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Product, CategoryId, Language, Currency, HeroSlideItem, ShortVideoItem } from '../types';
import {
  MASTER_ADMIN_PIN,
  verifyAdminPinSecure,
  isAdminSessionActive,
  setAdminSessionActive,
  setCustomAdminPin,
  resetAdminPinToDefault,
  saveStoredProducts,
  saveStoredShorts,
  getStoredProducts,
  getStoredShorts,
  clearAllProducts,
  resetProductsToInitial,
  exportStoreBackupJSON,
  importStoreBackupJSON,
  getStoredDiscountConfig,
  saveStoredDiscountConfig,
  StoreDiscountConfig,
  getStoredHeroSlides,
  saveStoredHeroSlides,
} from '../utils/storeStorage';
import { formatPrice } from '../data/mockData';
import { getYouTubeId } from '../utils/videoUtils';
import { compressAndConvertImageFile, sanitizeImageUrl, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';
import { soundFX } from '../utils/audioEffects';

interface AdminPageViewProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  shorts: ShortVideoItem[];
  onUpdateShorts: (shorts: ShortVideoItem[]) => void;
  language: Language;
  currency: Currency;
  onBackToStore: () => void;
}

export default function AdminPageView({
  products,
  onUpdateProducts,
  shorts,
  onUpdateShorts,
  language,
  currency,
  onBackToStore,
}: AdminPageViewProps) {
  const isAr = language === 'ar';

  // 1. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminSessionActive());
  const [enteredPin, setEnteredPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 2. Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'hero' | 'discounts' | 'videos' | 'security'>('products');

  // 3. Products Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  // 4. Product Add / Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);

  // 5. Hero Slides State (Up to 5 slides)
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(() => getStoredHeroSlides());
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);

  // 6. Form State for Product Add / Edit
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryId>('smartphones');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('');
  const [formStock, setFormStock] = useState<number>(10);
  const [formDescriptionAr, setFormDescriptionAr] = useState('');
  const [formDescriptionEn, setFormDescriptionEn] = useState('');
  const [formBrand, setFormBrand] = useState('Apple');
  const [formCondition, setFormCondition] = useState<'new' | 'used' | 'open-box'>('new');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formHidden, setFormHidden] = useState(false);

  // 6 Images slots: Cover + Image 1 to 5
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formImage1, setFormImage1] = useState('');
  const [formImage2, setFormImage2] = useState('');
  const [formImage3, setFormImage3] = useState('');
  const [formImage4, setFormImage4] = useState('');
  const [formImage5, setFormImage5] = useState('');

  // 7. Store-wide Discounts
  const [discountConfig, setDiscountConfig] = useState<StoreDiscountConfig>(() => getStoredDiscountConfig());

  // 8. Video Add
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitleAr, setNewVideoTitleAr] = useState('');
  const [newVideoCaptionAr, setNewVideoCaptionAr] = useState('');
  const [isAddingNewVideo, setIsAddingNewVideo] = useState(false);

  // 9. PIN Management
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; success: boolean } | null>(null);

  // 10. Notifications toast
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Authenticate PIN
  const handlePinSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!enteredPin) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await verifyAdminPinSecure(enteredPin);
      if (res.success) {
        setIsAuthenticated(true);
        setAdminSessionActive(true);
        setEnteredPin('');
        soundFX.playSuccess();
      } else {
        setAuthError(res.message || (isAr ? 'الرمز السري غير صحيح. حاول مجدداً.' : 'Invalid PIN code. Try again.'));
      }
    } catch {
      setAuthError(isAr ? 'حدث خطأ أثناء التحقق' : 'Verification error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    soundFX.playClick();
    setAdminSessionActive(false);
    setIsAuthenticated(false);
    setEnteredPin('');
  };

  // Open Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    soundFX.playClick();
    setEditingProduct(prod);
    setIsAddingNewProduct(false);

    setFormNameAr(prod.nameAr);
    setFormNameEn(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price);
    setFormOriginalPrice(prod.originalPrice ? String(prod.originalPrice) : '');
    setFormStock(prod.stock ?? 10);
    setFormDescriptionAr(prod.descriptionAr);
    setFormDescriptionEn(prod.description);
    setFormBrand(prod.brand);
    setFormCondition(prod.condition || 'new');
    setFormIsFeatured(prod.isFeatured || false);
    setFormHidden(prod.hidden || false);

    // Images
    const imgs = prod.images || [];
    setFormCoverImage(prod.image || '');
    setFormImage1(imgs[0] || '');
    setFormImage2(imgs[1] || '');
    setFormImage3(imgs[2] || '');
    setFormImage4(imgs[3] || '');
    setFormImage5(imgs[4] || '');
  };

  // Open Add Product
  const handleOpenAddProduct = () => {
    soundFX.playClick();
    setEditingProduct(null);
    setIsAddingNewProduct(true);

    setFormNameAr('');
    setFormNameEn('');
    setFormCategory('smartphones');
    setFormPrice(0);
    setFormOriginalPrice('');
    setFormStock(10);
    setFormDescriptionAr('');
    setFormDescriptionEn('');
    setFormBrand('Apple');
    setFormCondition('new');
    setFormIsFeatured(false);
    setFormHidden(false);

    setFormCoverImage('');
    setFormImage1('');
    setFormImage2('');
    setFormImage3('');
    setFormImage4('');
    setFormImage5('');
  };

  // Compress & upload image handler
  const handleImageFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast(isAr ? 'جارِ معالجة وضغط الصورة...' : 'Processing image...');
    try {
      const dataUrl = await compressAndConvertImageFile(file, 1200, 0.85);
      setter(dataUrl);
      showToast(isAr ? 'تم رفع الصورة بنجاح!' : 'Image uploaded!');
      soundFX.playSuccess();
    } catch {
      showToast(isAr ? 'فشل تحميل الصورة' : 'Failed to load image');
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) {
      alert(isAr ? 'يرجى كتابة اسم المنتج بالعربي' : 'Please enter product name');
      return;
    }

    const additionalImages = [formImage1, formImage2, formImage3, formImage4, formImage5].filter(
      (img) => img.trim() !== ''
    );
    const mainImg = formCoverImage.trim() || additionalImages[0] || FALLBACK_PRODUCT_IMAGE;

    const originalPriceNum = formOriginalPrice ? Number(formOriginalPrice) : undefined;
    const discountPct =
      originalPriceNum && originalPriceNum > formPrice
        ? Math.round(((originalPriceNum - formPrice) / originalPriceNum) * 100)
        : undefined;

    const catMap: Record<CategoryId, { ar: string; en: string }> = {
      all: { ar: 'الكل', en: 'All' },
      phones: { ar: 'هواتف ذكية', en: 'Smartphones' },
      audio: { ar: 'سماعات وصوتيات', en: 'Audio & Sound' },
      cases: { ar: 'كفرات وحماية', en: 'Cases & Protection' },
      chargers: { ar: 'شواحن ومنصات', en: 'Chargers & Docks' },
      cables: { ar: 'كيابل وتوصيلات', en: 'Cables & Adapters' },
    };

    const sanitizedMain = sanitizeImageUrl(mainImg).url;
    const sanitizedGallery = [sanitizedMain, ...additionalImages.map((img) => sanitizeImageUrl(img).url)];

    if (editingProduct) {
      // Update existing
      const updated: Product[] = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            nameAr: formNameAr,
            name: formNameEn || formNameAr,
            category: formCategory,
            categoryNameAr: catMap[formCategory]?.ar || p.categoryNameAr || 'عام',
            categoryNameEn: catMap[formCategory]?.en || p.categoryNameEn || 'General',
            price: Number(formPrice),
            originalPrice: originalPriceNum,
            discountPercentage: discountPct,
            stock: Number(formStock),
            inStock: Number(formStock) > 0,
            descriptionAr: formDescriptionAr,
            description: formDescriptionEn || formDescriptionAr,
            brand: formBrand,
            condition: formCondition,
            isFeatured: formIsFeatured,
            hidden: formHidden,
            image: sanitizedMain,
            images: sanitizedGallery,
          };
        }
        return p;
      });

      onUpdateProducts(updated);
      saveStoredProducts(updated);
      showToast(isAr ? 'تم تحديث المنتج بنجاح!' : 'Product updated!');
      setEditingProduct(null);
    } else {
      // Add new product
      const newId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const newProd: Product = {
        id: newId,
        sku: `SDM-${Date.now().toString().slice(-6)}`,
        name: formNameEn || formNameAr,
        nameAr: formNameAr,
        category: formCategory,
        categoryNameAr: catMap[formCategory]?.ar || 'عام',
        categoryNameEn: catMap[formCategory]?.en || 'General',
        price: Number(formPrice),
        originalPrice: originalPriceNum,
        discountPercentage: discountPct,
        stock: Number(formStock),
        inStock: Number(formStock) > 0,
        description: formDescriptionEn || formDescriptionAr,
        descriptionAr: formDescriptionAr,
        image: sanitizedMain,
        images: sanitizedGallery,
        rating: 5.0,
        reviewsCount: 1,
        brand: formBrand,
        condition: formCondition,
        isFeatured: formIsFeatured,
        hidden: formHidden,
        fastShipping: true,
        warrantyYears: 1,
        colors: [],
        variants: {
          titleEn: 'Standard',
          titleAr: 'الأساسي',
          options: ['الأساسي'],
        },
        specs: {
          warranty: { ar: 'ضمان محلي', en: 'Local Warranty' },
          quality: { ar: 'أصلي 100%', en: '100% Genuine' },
        },
      };

      const updated = [newProd, ...products];
      onUpdateProducts(updated);
      saveStoredProducts(updated);
      showToast(isAr ? 'تمت إضافة المنتج الجديد بنجاح!' : 'New product added!');
      setIsAddingNewProduct(false);
    }
  };

  // Toggle Product Visibility
  const handleToggleProductVisibility = (productId: string) => {
    soundFX.playClick();
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, hidden: !p.hidden };
      }
      return p;
    });
    onUpdateProducts(updated);
    saveStoredProducts(updated);
  };

  // Delete Product
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(isAr ? `هل أنت متأكد من حذف المنتج "${productName}" نهائياً؟` : `Delete product "${productName}"?`)) {
      soundFX.playClick();
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      saveStoredProducts(updated);
      showToast(isAr ? `تم حذف "${productName}"` : 'Product deleted');
    }
  };

  // Wipe All Products
  const handleWipeAllProducts = () => {
    if (
      window.confirm(
        isAr
          ? '⚠️ هل تريد مسح كافة المنتجات الحالية نهائياً لتضيف منتجاتك الخاصة واحداً تلو الآخر؟'
          : 'Wipe all products to start from a blank catalog?'
      )
    ) {
      soundFX.playClick();
      const empty = clearAllProducts();
      onUpdateProducts(empty);
      showToast(isAr ? 'تم تفريغ كافة المنتجات بنجاح. يمكنك الآن إضافة منتجاتك!' : 'Catalog cleared');
    }
  };

  // Save Store-wide Discount Config
  const handleSaveDiscountConfig = (e: FormEvent) => {
    e.preventDefault();
    soundFX.playSuccess();
    saveStoredDiscountConfig(discountConfig);
    showToast(isAr ? 'تم حفظ إعدادات الخصومات بنجاح!' : 'Discounts saved!');
  };

  // Save Hero Slides
  const handleSaveHeroSlides = (slidesToSave: HeroSlideItem[]) => {
    setHeroSlides(slidesToSave);
    saveStoredHeroSlides(slidesToSave);
    showToast(isAr ? 'تم حفظ شرائح الواجهة العلوية بنجاح!' : 'Hero slides saved!');
    soundFX.playSuccess();
  };

  // Add new hero slide
  const handleAddNewHeroSlide = () => {
    if (heroSlides.length >= 5) {
      alert(isAr ? 'الحد الأقصى لشرائح الواجهة العلوية هو 5 شرائح' : 'Maximum 5 hero slides allowed');
      return;
    }
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      badgeAr: 'عرض خاص • متجر صدام العقاري',
      badgeEn: 'Special Offer • Saddam Al-Aqari',
      titleAr: 'منتج أو عرض استثنائي جديد',
      titleEn: 'New Flagship Offer',
      subtitleAr: 'أقوى العروض والخصومات الفورية مع التوصيل لكافة المحافظات والضمان',
      subtitleEn: 'Exclusive discounts and express delivery across all provinces',
      mediaType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=85&w=1920&auto=format&fit=crop',
      buttonTextAr: 'طلب فوري بالواتساب',
      buttonLink: 'https://wa.me/967774102030',
      enabled: true,
    };
    const updated = [...heroSlides, newSlide];
    handleSaveHeroSlides(updated);
    setEditingSlide(newSlide);
  };

  // Delete hero slide
  const handleDeleteHeroSlide = (id: string) => {
    if (heroSlides.length <= 1) {
      alert(isAr ? 'يجب الإبقاء على شريحة واحدة على الأقل' : 'Must keep at least 1 slide');
      return;
    }
    const updated = heroSlides.filter((s) => s.id !== id);
    handleSaveHeroSlides(updated);
    if (editingSlide?.id === id) setEditingSlide(null);
  };

  // Add Video Short
  const handleAddNewVideo = (e: FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const ytId = getYouTubeId(newVideoUrl);
    if (!ytId) {
      alert(isAr ? 'يرجى إدخال رابط يوتيوب صحيح (YouTube Shorts / Video)' : 'Invalid YouTube URL');
      return;
    }

    const newShort: ShortVideoItem = {
      id: `short-${Date.now()}`,
      youtubeId: ytId,
      shortsUrl: newVideoUrl.trim(),
      titleAr: newVideoTitleAr || 'فيديو جديد • متجر صدام العقاري',
      titleEn: 'New Product Video',
      captionAr: newVideoCaptionAr || 'استعراض أحدث الأجهزة الذكية والملحقات الأصلية.',
      captionEn: 'Review of latest flagship devices and accessories.',
      viewsText: '10K',
      productId: 'custom-short',
      productNameAr: 'متجر صدام العقاري',
      productNameEn: 'Saddam Al-Aqari Store',
      productPrice: 0,
      productImage: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      tagAr: 'فيديو حصري',
      tagEn: 'Exclusive',
    };

    const updated = [newShort, ...shorts];
    onUpdateShorts(updated);
    saveStoredShorts(updated);
    setIsAddingNewVideo(false);
    setNewVideoUrl('');
    setNewVideoTitleAr('');
    setNewVideoCaptionAr('');
    showToast(isAr ? 'تمت إضافة الفيديو بنجاح!' : 'Video added!');
    soundFX.playSuccess();
  };

  // Delete Video Short
  const handleDeleteVideo = (id: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الفيديو؟' : 'Delete this video?')) {
      const updated = shorts.filter((s) => s.id !== id);
      onUpdateShorts(updated);
      saveStoredShorts(updated);
      showToast(isAr ? 'تم حذف الفيديو' : 'Video deleted');
      soundFX.playClick();
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      productSearch === '' ||
      p.nameAr.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());

    const matchCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;

    const matchStatus =
      productStatusFilter === 'all' ||
      (productStatusFilter === 'visible' && !p.hidden) ||
      (productStatusFilter === 'hidden' && p.hidden);

    return matchSearch && matchCategory && matchStatus;
  });

  // =========================================================================
  // VIEW 1: AUTHENTICATION LOGIN SCREEN (Standalone Site Page)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center mx-auto text-neutral-950 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              <Lock className="w-8 h-8 text-neutral-950" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isAr ? 'لوحة تحكم متجر صدام العقاري' : 'Saddam Al-Aqari Admin'}
            </h1>
            <p className="text-xs text-neutral-400">
              {isAr ? 'أدخل الرمز السري للتحكم بالمنتجات والواجهات والخصومات' : 'Enter security PIN to access management'}
            </p>
          </div>

          {/* PIN Form */}
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                {isAr ? 'الرمز السري للإدارة' : 'Master Admin PIN'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="•••••"
                autoFocus
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-amber-400 focus:border-amber-400 focus:outline-none transition-all shadow-inner"
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs text-center flex items-center justify-center gap-1.5 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !enteredPin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جارِ التحقق...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>{isAr ? 'تسجيل الدخول إلى لوحة التحكم' : 'Login to Admin'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Return to Store Button */}
          <div className="pt-4 border-t border-neutral-800 text-center">
            <button
              onClick={() => {
                soundFX.playClick();
                onBackToStore();
              }}
              className="text-xs text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg hover:bg-neutral-800"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'العودة إلى واجهة المتجر الرئيسية' : 'Back to Storefront'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL STANDALONE ADMIN DASHBOARD SITE
  // =========================================================================
  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-950 text-white flex flex-col select-none">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* TOP STANDALONE APP BAR */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-neutral-950 shadow-md">
            <Sliders className="w-5 h-5 text-neutral-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                {isAr ? 'لوحة تحكم متجر صدام العقاري' : 'Saddam Al-Aqari Admin Portal'}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isAr ? 'جلسة نشطة ومحمية' : 'Live & Protected'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              {isAr ? 'إدارة المنتجات، الصور الـ 5، السلايدر العلوي، الفيديوهات والخصومات' : 'Full Store Control Panel'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Back to Store + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              soundFX.playClick();
              onBackToStore();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            title={isAr ? 'العودة لواجهة المتجر' : 'Back to Storefront'}
          >
            <Store className="w-4 h-4" />
            <span>{isAr ? 'عرض المتجر' : 'View Store'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-400 transition-colors border border-neutral-700 cursor-pointer"
            title={isAr ? 'تسجيل الخروج' : 'Logout'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DASHBOARD TABS NAVIGATION */}
      <nav className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
        <button
          onClick={() => {
            soundFX.playClick();
            setActiveTab('products');
            setEditingProduct(null);
            setIsAddingNewProduct(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isAr ? `المنتجات (${products.length})` : `Products (${products.length})`}</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            setActiveTab('hero');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hero'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{isAr ? `الواجهة العلوية (السلايدر ${heroSlides.length}/5)` : `Hero Banners (${heroSlides.length}/5)`}</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            setActiveTab('videos');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'videos'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{isAr ? `الفيديوهات والريلز (${shorts.length})` : `Video Shorts (${shorts.length})`}</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            setActiveTab('discounts');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'discounts'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>{isAr ? 'الخصومات والعروض' : 'Discounts & Offers'}</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            setActiveTab('security');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>{isAr ? 'الأمان والنسخ الاحتياطي' : 'Security & Backups'}</span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: PRODUCTS MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            {/* If Add / Edit mode is active */}
            {isAddingNewProduct || editingProduct ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      {editingProduct ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white">
                        {editingProduct
                          ? (isAr ? `تعديل المنتج: ${editingProduct.nameAr}` : `Edit: ${editingProduct.name}`)
                          : (isAr ? 'إضافة منتج جديد إلى المتجر' : 'Add New Product')}
                      </h2>
                      <p className="text-xs text-neutral-400">
                        {isAr ? 'أدخل تفاصيل المنتج وروابط الصور الـ 5 مع المعاينة الفورية' : 'Fill product details and 5 images'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsAddingNewProduct(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
                  >
                    {isAr ? 'إلغاء والعودة' : 'Cancel'}
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-6">
                  {/* Basic Info Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        {isAr ? 'اسم المنتج بالعربي *' : 'Arabic Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formNameAr}
                        onChange={(e) => setFormNameAr(e.target.value)}
                        placeholder="مثال: آيفون 16 برو ماكس 256GB"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        {isAr ? 'اسم المنتج بالإنجليزية' : 'English Name'}
                      </label>
                      <input
                        type="text"
                        value={formNameEn}
                        onChange={(e) => setFormNameEn(e.target.value)}
                        placeholder="e.g. iPhone 16 Pro Max"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        {isAr ? 'القسم' : 'Category'}
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm focus:border-amber-400 focus:outline-none text-neutral-200"
                      >
                        <option value="smartphones">{isAr ? 'الهواتف الذكية' : 'Smartphones'}</option>
                        <option value="accessories">{isAr ? 'الملحقات والإكسسوارات' : 'Accessories'}</option>
                        <option value="chargers">{isAr ? 'الشواحن والكيابل' : 'Chargers & Cables'}</option>
                        <option value="covers">{isAr ? 'كفرات وحماية' : 'Cases & Protection'}</option>
                        <option value="audio">{isAr ? 'السماعات والصوتيات' : 'Audio & Headphones'}</option>
                        <option value="wearables">{isAr ? 'الساعات الذكية' : 'Smartwatches'}</option>
                        <option value="tablets">{isAr ? 'الأجهزة اللوحية' : 'Tablets'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        {isAr ? `السعر النهائي بالريال اليمني (${currency}) *` : 'Selling Price *'}
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm font-mono text-emerald-400 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        {isAr ? 'السعر قبل الخصم (اختياري للشطب)' : 'Original Price (Optional)'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value)}
                        placeholder="اتركه فارغاً إن لم يكن هناك تخفيض"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm font-mono text-neutral-400 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        {isAr ? 'الكمية المتوفرة في المخزن' : 'Stock Quantity'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formStock}
                        onChange={(e) => setFormStock(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm font-mono text-neutral-200 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* USER MANDATED: 6 IMAGE SLOTS WITH DIRECT PREVIEWS & LINKS */}
                  {/* ================================================================= */}
                  <div className="pt-4 border-t border-neutral-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-amber-400" />
                          <span>{isAr ? 'روابط وصور المنتج (صورة الواجهة + حتى 5 صور إضافية)' : 'Product Images & Links (Cover + 5 Extra)'}</span>
                        </h3>
                        <p className="text-[11px] text-neutral-400">
                          {isAr
                            ? 'ضع رابط الصورة مباشرة أو اضغط على زر المعرض للرفع من جهازك، وستظهر المعاينة أمامك فوراً.'
                            : 'Enter image URL or click upload to preview immediately.'}
                        </p>
                      </div>
                    </div>

                    {/* FREE IMAGE HOSTING SITES RECOMMENDATION HELPER */}
                    <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-neutral-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? 'أفضل المواقع المجانية الموصى بها لرفع الصور ووضع روابطها المباشرة:' : 'Recommended Free Image Hosting Sites:'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <a
                          href="https://imgbb.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-amber-400 transition-colors"
                        >
                          <span className="font-bold">1. ImgBB</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="https://postimages.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-amber-400 transition-colors"
                        >
                          <span className="font-bold">2. Postimages</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="https://imgur.com/upload"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-amber-400 transition-colors"
                        >
                          <span className="font-bold">3. Imgur</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="https://freeimage.host"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-amber-400 transition-colors"
                        >
                          <span className="font-bold">4. Freeimage</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        {isAr
                          ? '💡 نصيحة: ارفع صورتك في أي من هذه المواقع وانسخ "الرابط المباشر" (Direct Link)، أو استخدم زر "📸 رفع من المعرض" المدمج هنا مباشرة.'
                          : 'Tip: Copy Direct Links ending in .jpg/.png or click "Upload File" directly.'}
                      </p>
                    </div>

                    {/* 6 Image Row Slots */}
                    <div className="space-y-3">
                      {/* 0: COVER IMAGE */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-neutral-950 border-2 border-amber-500/40">
                        {/* Live Image Box */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0 flex items-center justify-center relative group">
                          {formCoverImage ? (
                            <img
                              src={formCoverImage}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-neutral-600" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-neutral-950 text-[9px] font-black text-center py-0.5">
                            {isAr ? 'صورة الواجهة' : 'Cover'}
                          </span>
                        </div>

                        {/* Input & Upload */}
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-bold text-amber-300">
                            {isAr ? 'صورة الواجهة الأساسية (الغلاف الرئيسي للمنتج) *' : 'Main Cover Image URL *'}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formCoverImage}
                              onChange={(e) => setFormCoverImage(e.target.value)}
                              placeholder="ضع رابط صورة الواجهة هنا (مثال: https://...)"
                              className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono focus:border-amber-400 focus:outline-none"
                            />
                            <label className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-600 cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                              <Camera className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isAr ? '📸 رفع' : 'Upload'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageFileUpload(e, setFormCoverImage)}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* 1: IMAGE 1 */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0 flex items-center justify-center relative">
                          {formImage1 ? (
                            <img src={formImage1} alt="Preview 1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-neutral-600" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-neutral-800 text-neutral-300 text-[9px] font-bold text-center py-0.5">
                            1
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-bold text-neutral-300">{isAr ? 'صورة 1 (رابط أو رفع)' : 'Image 1'}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formImage1}
                              onChange={(e) => setFormImage1(e.target.value)}
                              placeholder={isAr ? 'رابط صورة 1' : 'Image 1 URL'}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono focus:border-amber-400 focus:outline-none"
                            />
                            <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-600 cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                              <Camera className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isAr ? 'رفع' : 'Upload'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileUpload(e, setFormImage1)} />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* 2: IMAGE 2 */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0 flex items-center justify-center relative">
                          {formImage2 ? (
                            <img src={formImage2} alt="Preview 2" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-neutral-600" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-neutral-800 text-neutral-300 text-[9px] font-bold text-center py-0.5">
                            2
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-bold text-neutral-300">{isAr ? 'صورة 2 (رابط أو رفع)' : 'Image 2'}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formImage2}
                              onChange={(e) => setFormImage2(e.target.value)}
                              placeholder={isAr ? 'رابط صورة 2' : 'Image 2 URL'}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono focus:border-amber-400 focus:outline-none"
                            />
                            <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-600 cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                              <Camera className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isAr ? 'رفع' : 'Upload'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileUpload(e, setFormImage2)} />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* 3: IMAGE 3 */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0 flex items-center justify-center relative">
                          {formImage3 ? (
                            <img src={formImage3} alt="Preview 3" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-neutral-600" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-neutral-800 text-neutral-300 text-[9px] font-bold text-center py-0.5">
                            3
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-bold text-neutral-300">{isAr ? 'صورة 3 (رابط أو رفع)' : 'Image 3'}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formImage3}
                              onChange={(e) => setFormImage3(e.target.value)}
                              placeholder={isAr ? 'رابط صورة 3' : 'Image 3 URL'}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono focus:border-amber-400 focus:outline-none"
                            />
                            <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-600 cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                              <Camera className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isAr ? 'رفع' : 'Upload'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileUpload(e, setFormImage3)} />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* 4: IMAGE 4 */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0 flex items-center justify-center relative">
                          {formImage4 ? (
                            <img src={formImage4} alt="Preview 4" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-neutral-600" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-neutral-800 text-neutral-300 text-[9px] font-bold text-center py-0.5">
                            4
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-bold text-neutral-300">{isAr ? 'صورة 4 (رابط أو رفع)' : 'Image 4'}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formImage4}
                              onChange={(e) => setFormImage4(e.target.value)}
                              placeholder={isAr ? 'رابط صورة 4' : 'Image 4 URL'}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono focus:border-amber-400 focus:outline-none"
                            />
                            <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-600 cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                              <Camera className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isAr ? 'رفع' : 'Upload'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileUpload(e, setFormImage4)} />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* 5: IMAGE 5 */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0 flex items-center justify-center relative">
                          {formImage5 ? (
                            <img src={formImage5} alt="Preview 5" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-neutral-600" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-neutral-800 text-neutral-300 text-[9px] font-bold text-center py-0.5">
                            5
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-bold text-neutral-300">{isAr ? 'صورة 5 (رابط أو رفع)' : 'Image 5'}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formImage5}
                              onChange={(e) => setFormImage5(e.target.value)}
                              placeholder={isAr ? 'رابط صورة 5' : 'Image 5 URL'}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono focus:border-amber-400 focus:outline-none"
                            />
                            <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-600 cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                              <Camera className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isAr ? 'رفع' : 'Upload'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileUpload(e, setFormImage5)} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        {isAr ? 'وصف المنتج بالعربي' : 'Arabic Description'}
                      </label>
                      <textarea
                        rows={3}
                        value={formDescriptionAr}
                        onChange={(e) => setFormDescriptionAr(e.target.value)}
                        placeholder="أدخل المواصفات والضمان وتفاصيل الجهاز..."
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        {isAr ? 'وصف المنتج بالإنجليزية' : 'English Description'}
                      </label>
                      <textarea
                        rows={3}
                        value={formDescriptionEn}
                        onChange={(e) => setFormDescriptionEn(e.target.value)}
                        placeholder="Product specifications, warranty and features..."
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsAddingNewProduct(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingProduct ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة المنتج للمتجر' : 'Add Product')}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* PRODUCTS TABLE & TOOLBAR */
              <div className="space-y-4">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-neutral-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder={isAr ? 'بحث بالاسم أو الكود...' : 'Search products...'}
                        className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-300 focus:outline-none"
                    >
                      <option value="all">{isAr ? 'كل الأقسام' : 'All Categories'}</option>
                      <option value="smartphones">{isAr ? 'الهواتف' : 'Smartphones'}</option>
                      <option value="accessories">{isAr ? 'الملحقات' : 'Accessories'}</option>
                      <option value="chargers">{isAr ? 'الشواحن' : 'Chargers'}</option>
                      <option value="covers">{isAr ? 'الكفرات' : 'Covers'}</option>
                      <option value="audio">{isAr ? 'الصوتيات' : 'Audio'}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة منتج جديد' : 'Add Product'}</span>
                    </button>

                    <button
                      onClick={handleWipeAllProducts}
                      className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 font-bold text-xs border border-red-800/40 transition-colors cursor-pointer"
                      title={isAr ? 'مسح كافة المنتجات للبدء بمتجر فارغ' : 'Clear all products'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Products Grid / Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
                  {filteredProducts.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-neutral-300">
                        {isAr ? 'لا توجد منتجات حالياً مطابقة لبحثك' : 'No products found'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {isAr ? 'اضغط على زر "إضافة منتج جديد" لإضافة أول منتج لمتجرك' : 'Click Add Product to start adding items'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-bold">
                          <tr>
                            <th className="p-3.5 text-center w-16">{isAr ? 'الصورة' : 'Image'}</th>
                            <th className="p-3.5">{isAr ? 'المنتج' : 'Product'}</th>
                            <th className="p-3.5">{isAr ? 'القسم' : 'Category'}</th>
                            <th className="p-3.5 font-mono">{isAr ? 'السعر' : 'Price'}</th>
                            <th className="p-3.5">{isAr ? 'المخزن' : 'Stock'}</th>
                            <th className="p-3.5 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                            <th className="p-3.5 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                          {filteredProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-neutral-800/40 transition-colors">
                              <td className="p-3 text-center">
                                <img
                                  src={prod.image}
                                  alt={prod.nameAr}
                                  className="w-11 h-11 rounded-xl object-cover border border-neutral-700 mx-auto"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                                  }}
                                />
                              </td>
                              <td className="p-3">
                                <h4 className="font-bold text-white text-xs">{prod.nameAr}</h4>
                                <p className="text-[10px] text-neutral-500 font-mono">{prod.sku}</p>
                              </td>
                              <td className="p-3 text-neutral-400">{prod.category}</td>
                              <td className="p-3 font-mono font-bold text-emerald-400">
                                {formatPrice(prod.price, currency, isAr)}
                              </td>
                              <td className="p-3">
                                <span className={`font-mono text-xs font-bold ${prod.stock && prod.stock > 0 ? 'text-neutral-300' : 'text-red-400'}`}>
                                  {prod.stock ?? 0}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleToggleProductVisibility(prod.id)}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    prod.hidden
                                      ? 'bg-red-950/40 border-red-800/40 text-red-400'
                                      : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                                  }`}
                                  title={prod.hidden ? (isAr ? 'المنتج مخفي (انقر للإظهار)' : 'Hidden') : (isAr ? 'المنتج ظاهر (انقر للإخفاء)' : 'Visible')}
                                >
                                  {prod.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                                    title={isAr ? 'تعديل' : 'Edit'}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id, prod.nameAr)}
                                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                                    title={isAr ? 'حذف' : 'Delete'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HERO SLIDER & BANNERS (UP TO 5 ITEMS: IMAGES OR VIDEOS) */}
        {/* ========================================================================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-amber-400" />
                    <span>{isAr ? 'التحكم في الواجهة العلوية (السلايدر والبصريات)' : 'Hero Slider Management'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {isAr
                      ? 'يمكنك إضافة حتى 5 شرائح في الواجهة العلوية: صور أو فيديوهات يوتيوب مع النصوص والروابط والمعاينة الفورية.'
                      : 'Configure up to 5 hero banners with image or video background and links.'}
                  </p>
                </div>

                {heroSlides.length < 5 && (
                  <button
                    onClick={handleAddNewHeroSlide}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة شريحة جديدة' : 'Add Slide'}</span>
                  </button>
                )}
              </div>

              {/* Slides List */}
              <div className="space-y-4">
                {heroSlides.map((slide, idx) => {
                  const isEditingThis = editingSlide?.id === slide.id;

                  return (
                    <div
                      key={slide.id || idx}
                      className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 transition-all"
                    >
                      {/* Top bar of slide card */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-white">{slide.titleAr}</h4>
                            <span className="text-[10px] text-neutral-400">
                              {slide.mediaType === 'video' ? (isAr ? '🎥 خلفية فيديو' : 'Video') : (isAr ? '🖼️ خلفية صورة' : 'Image')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const updated = heroSlides.map((s) =>
                                s.id === slide.id ? { ...s, enabled: !s.enabled } : s
                              );
                              handleSaveHeroSlides(updated);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              slide.enabled
                                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                            }`}
                          >
                            {slide.enabled ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Disabled')}
                          </button>

                          <button
                            onClick={() => setEditingSlide(isEditingThis ? null : slide)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteHeroSlide(slide.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Editing Slide Details */}
                      {isEditingThis && (
                        <div className="pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {/* Media Type */}
                          <div>
                            <label className="block font-bold text-neutral-300 mb-1">{isAr ? 'نوع الوسائط' : 'Media Type'}</label>
                            <select
                              value={slide.mediaType}
                              onChange={(e) => {
                                const val = e.target.value as 'image' | 'video';
                                const updated = heroSlides.map((s) => (s.id === slide.id ? { ...s, mediaType: val } : s));
                                handleSaveHeroSlides(updated);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200"
                            >
                              <option value="image">{isAr ? 'صورة عالية الجودة' : 'Image'}</option>
                              <option value="video">{isAr ? 'فيديو (يوتيوب أو رابط مباشر)' : 'Video'}</option>
                            </select>
                          </div>

                          {/* Media URL */}
                          <div>
                            <label className="block font-bold text-neutral-300 mb-1">
                              {slide.mediaType === 'video' ? (isAr ? 'رابط الفيديو' : 'Video URL') : (isAr ? 'رابط الصورة' : 'Image URL')}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={slide.mediaType === 'video' ? (slide.videoUrl || '') : (slide.imageUrl || '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = heroSlides.map((s) =>
                                    s.id === slide.id
                                      ? slide.mediaType === 'video'
                                        ? { ...s, videoUrl: val }
                                        : { ...s, imageUrl: val }
                                      : s
                                  );
                                  handleSaveHeroSlides(updated);
                                }}
                                className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-xs"
                              />
                              {slide.mediaType === 'image' && (
                                <label className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold border border-neutral-600 cursor-pointer shrink-0">
                                  <span>{isAr ? '📸 رفع' : 'Upload'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const dataUrl = await compressAndConvertImageFile(file, 1920, 0.85);
                                      const updated = heroSlides.map((s) => (s.id === slide.id ? { ...s, imageUrl: dataUrl } : s));
                                      handleSaveHeroSlides(updated);
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          {/* Headline Arabic */}
                          <div>
                            <label className="block font-bold text-neutral-300 mb-1">{isAr ? 'العنوان الرئيسي' : 'Headline'}</label>
                            <input
                              type="text"
                              value={slide.titleAr}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = heroSlides.map((s) => (s.id === slide.id ? { ...s, titleAr: val } : s));
                                handleSaveHeroSlides(updated);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700"
                            />
                          </div>

                          {/* Subtitle Arabic */}
                          <div>
                            <label className="block font-bold text-neutral-300 mb-1">{isAr ? 'الوصف الترويجي' : 'Subtitle'}</label>
                            <input
                              type="text"
                              value={slide.subtitleAr}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = heroSlides.map((s) => (s.id === slide.id ? { ...s, subtitleAr: val } : s));
                                handleSaveHeroSlides(updated);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700"
                            />
                          </div>

                          {/* Button Text & Link */}
                          <div>
                            <label className="block font-bold text-neutral-300 mb-1">{isAr ? 'نص زر الشريحة' : 'Button Text'}</label>
                            <input
                              type="text"
                              value={slide.buttonTextAr || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = heroSlides.map((s) => (s.id === slide.id ? { ...s, buttonTextAr: val } : s));
                                handleSaveHeroSlides(updated);
                              }}
                              placeholder={isAr ? 'مثال: طلب فوري عبر واتساب' : 'e.g. Order Now'}
                              className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-neutral-300 mb-1">{isAr ? 'رابط الزر (واتساب أو رابط داخلي)' : 'Button Link'}</label>
                            <input
                              type="text"
                              value={slide.buttonLink || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = heroSlides.map((s) => (s.id === slide.id ? { ...s, buttonLink: val } : s));
                                handleSaveHeroSlides(updated);
                              }}
                              placeholder="https://wa.me/967774102030"
                              className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: VIDEO SHORTS & REELS */}
        {/* ========================================================================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-red-500" />
                    <span>{isAr ? 'إدارة فيديوهات يوتيوب والريلز' : 'YouTube Shorts Management'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {isAr
                      ? 'أضف روابط فيديوهات Shorts من يوتيوب للمتجر. تتقلب القوالب تلقائياً للمستخدمين.'
                      : 'Add YouTube Shorts and video reviews. Templates rotate automatically.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingNewVideo((prev) => !prev)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة فيديو ريلز جديد' : 'Add Video'}</span>
                </button>
              </div>

              {/* Add Video Form */}
              {isAddingNewVideo && (
                <form onSubmit={handleAddNewVideo} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <h4 className="font-bold text-xs text-amber-400">{isAr ? 'إضافة فيديو جديد' : 'Add New Video'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                        {isAr ? 'رابط يوتيوب أو Shorts *' : 'YouTube URL *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/shorts/..."
                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                        {isAr ? 'عنوان الفيديو' : 'Video Title'}
                      </label>
                      <input
                        type="text"
                        value={newVideoTitleAr}
                        onChange={(e) => setNewVideoTitleAr(e.target.value)}
                        placeholder="مثال: مراجعة كاميرا S26 ألترا"
                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewVideo(false)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                    >
                      {isAr ? 'حفظ الفيديو' : 'Save Video'}
                    </button>
                  </div>
                </form>
              )}

              {/* Video Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {shorts.map((short) => (
                  <div key={short.id} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 relative group">
                    <div className="aspect-[9/14] rounded-xl overflow-hidden bg-black relative">
                      <img
                        src={`https://img.youtube.com/vi/${short.youtubeId}/hqdefault.jpg`}
                        alt={short.titleAr}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                        Shorts
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">{short.titleAr}</h4>
                      <p className="text-[10px] text-neutral-400 line-clamp-1">{short.captionAr}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                      <a
                        href={short.shortsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{isAr ? 'مشاهدة' : 'View'}</span>
                      </a>

                      <button
                        onClick={() => handleDeleteVideo(short.id)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DISCOUNTS & PROMOTIONS */}
        {/* ========================================================================= */}
        {activeTab === 'discounts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
              <div className="pb-4 border-b border-neutral-800">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Percent className="w-5 h-5 text-amber-400" />
                  <span>{isAr ? 'إدارة الخصومات والعروض الترويجية' : 'Store Discounts Management'}</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  {isAr
                    ? 'تحكم في شريط الخصومات العريض ونسب التخفيض في المتجر بالكامل.'
                    : 'Manage promotional banners and store-wide discount settings.'}
                </p>
              </div>

              <form onSubmit={handleSaveDiscountConfig} className="space-y-4 max-w-xl">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div>
                    <h4 className="font-bold text-xs text-white">{isAr ? 'تفعيل شريط الخصومات في أعلى المتجر' : 'Enable Promo Banner'}</h4>
                    <p className="text-[11px] text-neutral-400">
                      {isAr ? 'يظهر إشعار مميز بالعروض في أعلى الصفحة الرئيسية' : 'Displays high-visibility alert on homepage'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={discountConfig.enabled}
                    onChange={(e) => setDiscountConfig({ ...discountConfig, enabled: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    {isAr ? 'نسبة الخصم الترويجية (%)' : 'Discount Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={discountConfig.percentage}
                    onChange={(e) => setDiscountConfig({ ...discountConfig, percentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm font-mono text-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    {isAr ? 'نص شريط العروض بالعربي' : 'Banner Arabic Text'}
                  </label>
                  <input
                    type="text"
                    value={discountConfig.bannerTextAr}
                    onChange={(e) => setDiscountConfig({ ...discountConfig, bannerTextAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAr ? 'حفظ إعدادات الخصومات' : 'Save Discounts'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SECURITY & BACKUPS */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PIN Code Change */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-sm text-white">{isAr ? 'تغيير الرمز السري للوحة التحكم' : 'Change Master PIN'}</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">{isAr ? 'الرمز السري الحالي' : 'Current PIN'}</label>
                    <input
                      type="password"
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="•••••"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">{isAr ? 'الرمز السري الجديد (أرقام)' : 'New PIN'}</label>
                    <input
                      type="password"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="•••••"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">{isAr ? 'تأكيد الرمز السري الجديد' : 'Confirm New PIN'}</label>
                    <input
                      type="password"
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      placeholder="•••••"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 font-mono"
                    />
                  </div>

                  {pinChangeMsg && (
                    <p className={`text-xs font-bold ${pinChangeMsg.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pinChangeMsg.text}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={async () => {
                        if (!currentPinInput || !newPinInput) {
                          setPinChangeMsg({ text: isAr ? 'يرجى إدخال الحقول المطلوبة' : 'Fill all fields', success: false });
                          return;
                        }
                        if (newPinInput !== confirmPinInput) {
                          setPinChangeMsg({ text: isAr ? 'الرموز الجديدة غير متطابقة' : 'PINs do not match', success: false });
                          return;
                        }
                        const verifyRes = await verifyAdminPinSecure(currentPinInput);
                        if (!verifyRes.success) {
                          setPinChangeMsg({ text: isAr ? 'الرمز السري الحالي غير صحيح' : 'Current PIN incorrect', success: false });
                          return;
                        }
                        const ok = await setCustomAdminPin(newPinInput);
                        if (ok) {
                          soundFX.playSuccess();
                          setPinChangeMsg({ text: isAr ? 'تم تحديث الرمز السري بنجاح!' : 'PIN changed successfully!', success: true });
                          setCurrentPinInput('');
                          setNewPinInput('');
                          setConfirmPinInput('');
                        } else {
                          setPinChangeMsg({ text: isAr ? 'فشل الحفظ. تأكد من أن الرمز لا يقل عن 4 أرقام' : 'Failed to update PIN', success: false });
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      {isAr ? 'حفظ الرمز الجديد' : 'Update PIN'}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(isAr ? `إعادة تعيين الرمز للافتراضي (${MASTER_ADMIN_PIN})؟` : 'Reset to default PIN?')) {
                          resetAdminPinToDefault();
                          setPinChangeMsg({ text: isAr ? `تمت الإعادة للافتراضي (${MASTER_ADMIN_PIN})` : 'Reset done', success: true });
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
                    >
                      {isAr ? 'استعادة الافتراضي' : 'Reset'}
                    </button>
                  </div>
                </div>
              </div>

              {/* JSON Backup & Restore */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-sm text-white">{isAr ? 'تصدير واستيراد النسخ الاحتياطي' : 'Data Backup & Restore'}</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <p className="text-neutral-400 leading-relaxed">
                    {isAr
                      ? 'يمكنك تنزيل نسخة احتياطية كاملة لكافة منتجاتك وصورك والواجهات، أو استيرادها على أي جهاز آخر بنقرة واحدة.'
                      : 'Download or import complete JSON store backup.'}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => {
                        const json = exportStoreBackupJSON();
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `saddam-store-backup-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast(isAr ? 'تم تصدير النسخة بنجاح!' : 'Backup exported!');
                        soundFX.playSuccess();
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isAr ? 'تصدير ملف النسخة (JSON)' : 'Export Backup'}</span>
                    </button>

                    <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-neutral-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? 'استيراد ملف نسخة' : 'Import Backup'}</span>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const content = event.target?.result as string;
                            if (content) {
                              const res = importStoreBackupJSON(content);
                              if (res.success) {
                                onUpdateProducts(getStoredProducts());
                                onUpdateShorts(getStoredShorts());
                                setHeroSlides(getStoredHeroSlides());
                                setDiscountConfig(getStoredDiscountConfig());
                                showToast(res.message);
                                soundFX.playSuccess();
                              } else {
                                alert(res.message);
                              }
                            }
                          };
                          reader.readAsText(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
