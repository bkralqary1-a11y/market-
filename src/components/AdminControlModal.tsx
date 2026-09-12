import React, { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ShieldAlert,
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
  FolderPlus,
  HelpCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Product, CategoryId, Language, Currency } from '../types';
import { ShortVideoItem } from './YouTubeShortsSection';
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
} from '../utils/storeStorage';
import { formatPrice } from '../data/mockData';
import { getYouTubeId } from '../utils/videoUtils';
import { compressAndConvertImageFile, sanitizeImageUrl, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  shorts: ShortVideoItem[];
  onUpdateShorts: (shorts: ShortVideoItem[]) => void;
  language: Language;
  currency: Currency;
}

export default function AdminControlModal({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  shorts,
  onUpdateShorts,
  language,
  currency,
}: AdminControlModalProps) {
  const isAr = language === 'ar';

  // 1. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminSessionActive());
  const [enteredPin, setEnteredPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // 2. Active Tab: 'products' | 'discounts' | 'videos' | 'security'
  const [activeTab, setActiveTab] = useState<'products' | 'discounts' | 'videos' | 'security'>('products');

  // 3. Products Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  // 4. Product Add / Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);

  // Product Form Fields State
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formPrice, setFormPrice] = useState<number>(1500);
  const [formHasDiscount, setFormHasDiscount] = useState(false);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(2000);
  const [formCategory, setFormCategory] = useState<CategoryId>('cases');
  const [formDescriptionAr, setFormDescriptionAr] = useState('');
  const [formWarrantyYears, setFormWarrantyYears] = useState<number>(1);
  const [formStock, setFormStock] = useState<number>(25);
  const [formSku, setFormSku] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formNewImageUrl, setFormNewImageUrl] = useState('');
  const [formImageWarning, setFormImageWarning] = useState<string | null>(null);
  const [formEnableColors, setFormEnableColors] = useState(false);
  const [formColorsList, setFormColorsList] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 5. Store-wide Discounts State
  const [discountConfig, setDiscountConfig] = useState<StoreDiscountConfig>(() => getStoredDiscountConfig());

  // 6. Video Add State
  const [isAddingNewVideo, setIsAddingNewVideo] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitleAr, setNewVideoTitleAr] = useState('');
  const [newVideoCaptionAr, setNewVideoCaptionAr] = useState('');

  // 7. Change PIN State
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // 8. Toast Feedback
  const [actionToast, setActionToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Sync lockout countdown
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAuthError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  // Handle Login with PIN 20203
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!enteredPin.trim()) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      const result = await verifyAdminPinSecure(enteredPin);
      if (result.success) {
        setIsAuthenticated(true);
        setEnteredPin('');
        showToast('🔓 تم التحقق الأمني وفك التشفير بنجاح!');
      } else {
        if (result.lockedOut && result.remainingSeconds) {
          setLockoutSeconds(result.remainingSeconds);
        }
        setAuthError(result.message || 'رمز المرور غير صحيح');
      }
    } catch {
      setAuthError('حدث خطأ أثناء التحقق من الرمز المشفر');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setAdminSessionActive(false);
    setIsAuthenticated(false);
    setEnteredPin('');
    showToast('تم تسجيل الخروج وقفل لوحة الإدارة');
  };

  // Open Add Product Modal with clean defaults (No colors as requested by user)
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormPrice(1500);
    setFormHasDiscount(false);
    setFormOriginalPrice(2000);
    setFormCategory('cases');
    setFormDescriptionAr('');
    setFormWarrantyYears(1);
    setFormStock(25);
    setFormSku(`SDM-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormImages([]);
    setFormNewImageUrl('');
    setFormImageWarning(null);
    setFormEnableColors(false); // User request: لا أريد أي ألوان
    setFormColorsList([]);
    setIsAddingNewProduct(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormNameAr(prod.nameAr || '');
    setFormNameEn(prod.name || '');
    setFormPrice(prod.price || 0);
    setFormHasDiscount(Boolean(prod.originalPrice && prod.originalPrice > prod.price));
    setFormOriginalPrice(prod.originalPrice || prod.price);
    setFormCategory(prod.category);
    setFormDescriptionAr(prod.descriptionAr || '');
    setFormWarrantyYears(prod.warrantyYears || 1);
    setFormStock(prod.stock || 20);
    setFormSku(prod.sku || `SDM-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormImages(prod.images && prod.images.length > 0 ? [...prod.images] : [prod.image]);
    setFormNewImageUrl('');
    setFormImageWarning(null);
    setFormEnableColors(Boolean(prod.colors && prod.colors.length > 0));
    setFormColorsList(prod.colors || []);
    setIsAddingNewProduct(true);
  };

  // Direct Phone/PC File Upload for Images (Solves Pinterest issue 100%)
  const handleImageFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setFormImageWarning(null);

    try {
      const convertedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressAndConvertImageFile(file, 1200, 0.82);
        convertedList.push(dataUrl);
      }

      setFormImages((prev) => [...prev, ...convertedList]);
      showToast(`تم رفع ومعالجة ${convertedList.length} صورة من جهازك بنجاح!`);
    } catch (err: any) {
      setFormImageWarning(`خطأ أثناء رفع الصورة: ${err?.message || 'تأكد من اختيار ملف صورة صالح'}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add Image via Direct URL with Pinterest Detection
  const handleAddImageUrl = () => {
    if (!formNewImageUrl.trim()) return;

    const sanitized = sanitizeImageUrl(formNewImageUrl);
    if (sanitized.isPinterestWebpage) {
      setFormImageWarning(sanitized.warning || null);
    } else {
      setFormImageWarning(null);
    }

    setFormImages((prev) => [...prev, sanitized.url]);
    setFormNewImageUrl('');
    showToast('تمت إضافة رابط الصورة');
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
    showToast('تم تعيين الصورة كصورة رئيسية للمنتج');
  };

  // Save Product (Create or Update)
  const handleSaveProductForm = (e: FormEvent) => {
    e.preventDefault();

    if (!formNameAr.trim()) {
      alert('يرجى إدخال اسم المنتج بالعربية');
      return;
    }

    const primaryImg = formImages[0] || FALLBACK_PRODUCT_IMAGE;
    const allImgs = formImages.length > 0 ? formImages : [primaryImg];

    // Category display name
    const categoryNamesMap: Record<CategoryId, { ar: string; en: string }> = {
      cases: { ar: 'كفرات وحماية', en: 'Cases & Protection' },
      phones: { ar: 'هواتف ذكية', en: 'Smartphones' },
      chargers: { ar: 'شواحن وبطاريات', en: 'Chargers & Power' },
      audio: { ar: 'سماعات وصوتيات', en: 'Headphones & Audio' },
      cables: { ar: 'كيابل ومحولات', en: 'Cables & Adapters' },
      all: { ar: 'إلكترونيات', en: 'Electronics' },
    };

    const catName = categoryNamesMap[formCategory] || { ar: 'كفرات وحماية', en: 'Cases & Protection' };

    const originalPriceValue = formHasDiscount && formOriginalPrice > formPrice ? formOriginalPrice : undefined;
    const discountPct = originalPriceValue
      ? Math.round(((originalPriceValue - formPrice) / originalPriceValue) * 100)
      : undefined;

    if (editingProduct) {
      // Update existing
      const updatedList = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            nameAr: formNameAr,
            name: formNameEn || formNameAr,
            price: Number(formPrice),
            originalPrice: originalPriceValue,
            discountPercentage: discountPct,
            category: formCategory,
            categoryNameAr: catName.ar,
            categoryNameEn: catName.en,
            descriptionAr: formDescriptionAr,
            warrantyYears: Number(formWarrantyYears),
            stock: Number(formStock),
            sku: formSku,
            image: primaryImg,
            images: allImgs,
            colors: formEnableColors ? formColorsList : [],
          };
        }
        return p;
      });

      onUpdateProducts(updatedList);
      saveStoredProducts(updatedList);
      showToast(`تم تحديث المنتج "${formNameAr}" بنجاح!`);
    } else {
      // Create new
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        sku: formSku || `SDM-${Math.floor(1000 + Math.random() * 9000)}`,
        nameAr: formNameAr,
        name: formNameEn || formNameAr,
        brand: 'GENERIC',
        price: Number(formPrice),
        originalPrice: originalPriceValue,
        discountPercentage: discountPct,
        category: formCategory,
        categoryNameAr: catName.ar,
        categoryNameEn: catName.en,
        descriptionAr: formDescriptionAr,
        description: formNameEn || formNameAr,
        rating: 5.0,
        reviewsCount: 1,
        inStock: true,
        stock: Number(formStock),
        warrantyYears: Number(formWarrantyYears),
        fastShipping: true,
        image: primaryImg,
        images: allImgs,
        colors: formEnableColors ? formColorsList : [],
        variants: {
          titleAr: 'الموديل',
          titleEn: 'Model',
          options: ['الأساسي'],
        },
        specs: {},
        hidden: false,
      };

      const updatedList = [newProduct, ...products];
      onUpdateProducts(updatedList);
      saveStoredProducts(updatedList);
      showToast(`تمت إضافة المنتج "${formNameAr}" للمتجر بنجاح!`);
    }

    setIsAddingNewProduct(false);
    setEditingProduct(null);
  };

  // Toggle Visibility
  const handleToggleProductVisibility = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const nextHidden = !p.hidden;
        showToast(nextHidden ? `تم إخفاء المنتج "${p.nameAr}" عن الزوار` : `تم إظهار المنتج "${p.nameAr}" في المتجر`);
        return { ...p, hidden: nextHidden };
      }
      return p;
    });
    onUpdateProducts(updated);
    saveStoredProducts(updated);
  };

  // Delete Product
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك بحذف المنتج "${productName}" نهائياً من المتجر؟`)) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      saveStoredProducts(updated);
      showToast(`تم حذف المنتج "${productName}" بنجاح`);
    }
  };

  // Wipe All Products (User request: اخفي كل الروابط المنتجات بالكامل تختفي ساضي انا على منتج منتج)
  const handleWipeAllProducts = () => {
    if (
      window.confirm(
        '⚠️ هل تريد مسح كافة المنتجات الحالية نهائياً والبدء بمتجر فارغ تماماً لتضيف منتجاتك الخاصة واحداً تلو الآخر؟'
      )
    ) {
      const empty = clearAllProducts();
      onUpdateProducts(empty);
      showToast('تم تفريغ كافة المنتجات بنجاح. يمكنك الآن إضافة منتجاتك الخاصة!');
    }
  };

  // Save Store-wide Discount Config
  const handleSaveDiscountConfig = (e: FormEvent) => {
    e.preventDefault();
    saveStoredDiscountConfig(discountConfig);
    showToast('تم حفظ إعدادات وتخفيضات المتجر بنجاح!');
  };

  // Quick toggle product discount from discount table
  const handleQuickToggleDiscount = (prod: Product) => {
    const hasDiscount = Boolean(prod.originalPrice && prod.originalPrice > prod.price);
    const updated = products.map((p) => {
      if (p.id === prod.id) {
        if (hasDiscount) {
          // Turn off discount
          return {
            ...p,
            originalPrice: undefined,
            discountPercentage: undefined,
          };
        } else {
          // Turn on default 20% discount
          const original = Math.round(p.price * 1.25);
          return {
            ...p,
            originalPrice: original,
            discountPercentage: 20,
          };
        }
      }
      return p;
    });
    onUpdateProducts(updated);
    saveStoredProducts(updated);
    showToast(`تم تحديث خصم المنتج "${prod.nameAr}"`);
  };

  // Change Admin PIN
  const handleChangePin = async (e: FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      alert('يجب أن يتكون رمز المرور من 4 أرقام أو أحرف على الأقل');
      return;
    }

    const success = await setCustomAdminPin(newPinInput.trim());
    if (success) {
      setPinChangeSuccess(true);
      setNewPinInput('');
      showToast('تم تغيير رمز المشرف وتشفيره بنجاح!');
      setTimeout(() => setPinChangeSuccess(false), 4000);
    }
  };

  // Add YouTube Video
  const handleAddVideo = (e: FormEvent) => {
    e.preventDefault();
    const ytId = getYouTubeId(newVideoUrl);
    if (!ytId) {
      alert('رابط يوتيوب غير صالح. يرجى إدخال رابط فيديو أو شورتس يوتيوب صحيح');
      return;
    }

    const newShort: ShortVideoItem = {
      id: `short-${Date.now()}`,
      youtubeId: ytId,
      shortsUrl: `https://youtube.com/shorts/${ytId}`,
      titleAr: newVideoTitleAr,
      titleEn: newVideoTitleAr,
      captionAr: newVideoCaptionAr || newVideoTitleAr,
      captionEn: newVideoTitleAr,
      viewsText: '1.2K',
      productId: 'prod-general',
      productNameAr: 'متجر صدام',
      productNameEn: 'Saddam Store',
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
    showToast('تمت إضافة الفيديو إلى المتجر بنجاح!');
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      const updated = shorts.filter((s) => s.id !== id);
      onUpdateShorts(updated);
      saveStoredShorts(updated);
      showToast('تم حذف الفيديو');
    }
  };

  // Filter products for table
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

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[100000] bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{actionToast}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-700/80 text-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ========================================================================= */}
        {/* HEADER */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md">
              <Lock className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {isAr ? 'لوحة تحكم المشرف المشفرة' : 'Encrypted Admin Control Panel'}
                </h2>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SHA-256</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'التحكم الكامل بالمنتجات، الخصومات، رفع الصور من الهاتف، والفيديوهات'
                  : 'Manage products, discounts, mobile image uploads, and videos'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="قفل لوحة الإدارة"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">قفل اللوحة</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BODY: IF NOT AUTHENTICATED -> SHOW HIGH-SECURITY PIN KEYPAD */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
              <Key className="w-8 h-8 animate-pulse" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h3 className="text-xl font-black text-white">
                {isAr ? 'الدخول المشفر للمالك والمشرف' : 'Encrypted Owner Authentication'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? 'هذه البوابة مشفرة ضد محاولات الاختراق. أدخل رمز المرور السري الخاص بك للمتابعة.'
                  : 'Encrypted portal protected against unauthorized access. Enter your PIN.'}
              </p>
            </div>

            {/* Lockout Warning */}
            {lockoutSeconds > 0 && (
              <div className="p-3 bg-red-950/90 border border-red-600/60 rounded-2xl text-red-300 text-xs flex items-center gap-2 max-w-sm">
                <Clock className="w-4 h-4 animate-spin text-red-400 shrink-0" />
                <span>
                  تم قفل النظام مؤقتاً لحماية المتجر. متبقي: <b className="font-mono text-white">{lockoutSeconds}</b> ثانية.
                </span>
              </div>
            )}

            {/* PIN Entry Form */}
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  disabled={lockoutSeconds > 0 || isVerifying}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="•••••"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-2xl py-3 px-4 text-center text-2xl font-mono tracking-widest text-white shadow-inner focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>

              {authError && (
                <div className="p-2.5 bg-red-950/70 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={lockoutSeconds > 0 || isVerifying || !enteredPin}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Unlock className="w-4 h-4 text-slate-950" />
                )}
                <span>{isVerifying ? 'جارِ فك التشفير...' : 'تأكيد الدخول'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* AUTHENTICATED DASHBOARD */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="bg-slate-950 px-4 pt-3 flex items-center gap-2 border-b border-slate-800 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'products'
                    ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>إدارة المنتجات ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('discounts')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'discounts'
                    ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Percent className="w-4 h-4 text-orange-400" />
                <span>التحكم بالخصومات والعروض</span>
              </button>

              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'videos'
                    ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-4 h-4 text-red-400" />
                <span>الفيديوهات والريلز ({shorts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'security'
                    ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-4 h-4 text-cyan-400" />
                <span>تغيير الرمز والنسخ الاحتياطي</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900">
              {/* =================================================================== */}
              {/* TAB 1: PRODUCTS MANAGEMENT */}
              {/* =================================================================== */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="بحث بالاسم أو الكود..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="all">كل الأقسام</option>
                        <option value="cases">كفرات وحماية</option>
                        <option value="phones">هواتف ذكية</option>
                        <option value="chargers">شواحن وبطاريات</option>
                        <option value="audio">سماعات وصوتيات</option>
                        <option value="cables">كيابل ومحولات</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={handleWipeAllProducts}
                        className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="مسح كل المنتجات التجريبية لبدء متجرك الخاص"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">مسح المنتجات والبدء فارغاً</span>
                      </button>

                      <button
                        onClick={handleOpenAddProduct}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-slate-950" />
                        <span>إضافة منتج جديد</span>
                      </button>
                    </div>
                  </div>

                  {/* Products Table */}
                  {filteredProducts.length === 0 ? (
                    <div className="p-12 text-center bg-slate-950/60 border border-slate-800 rounded-3xl space-y-3">
                      <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                      <h4 className="text-base font-bold text-white">لا توجد منتجات حالياً</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        متجرك جاهز بالكامل! اضغط على زر "إضافة منتج جديد" لإضافة أول منتج خاص بك مع رفع الصور مباشرة من هاتفك.
                      </p>
                      <button
                        onClick={handleOpenAddProduct}
                        className="mt-2 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة أول منتج الآن</span>
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                          <tr>
                            <th className="p-3">الصورة</th>
                            <th className="p-3">اسم المنتج</th>
                            <th className="p-3">القسم</th>
                            <th className="p-3">السعر</th>
                            <th className="p-3">الخصم</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3 text-center">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-slate-900/40 transition-colors">
                              {/* Image */}
                              <td className="p-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 relative">
                                  <img
                                    src={prod.image}
                                    alt={prod.nameAr}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                                    }}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>

                              {/* Title & SKU */}
                              <td className="p-3 font-bold text-white">
                                <div>{prod.nameAr}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{prod.sku}</div>
                              </td>

                              {/* Category */}
                              <td className="p-3 text-slate-300 font-medium">{prod.categoryNameAr}</td>

                              {/* Price */}
                              <td className="p-3 font-mono font-bold text-amber-400">
                                {formatPrice(prod.price, currency, isAr)}
                              </td>

                              {/* Discount */}
                              <td className="p-3">
                                {prod.originalPrice && prod.originalPrice > prod.price ? (
                                  <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                    خصم {prod.discountPercentage || Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[11px]">—</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="p-3">
                                <button
                                  onClick={() => handleToggleProductVisibility(prod.id)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                    prod.hidden
                                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                  }`}
                                >
                                  {prod.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{prod.hidden ? 'مخفي' : 'معروض بالمتجر'}</span>
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                                    title="تعديل المنتج والخصم"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteProduct(prod.id, prod.nameAr)}
                                    className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg transition-colors cursor-pointer"
                                    title="حذف المنتج"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
              )}

              {/* =================================================================== */}
              {/* TAB 2: DISCOUNTS & PROMOTIONS MANAGEMENT */}
              {/* =================================================================== */}
              {activeTab === 'discounts' && (
                <div className="space-y-6">
                  {/* Store-wide Announcement Banner Form */}
                  <form
                    onSubmit={handleSaveDiscountConfig}
                    className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-orange-400" />
                        <h4 className="font-bold text-sm text-white">شريط العروض والخصومات العام أعلى المتجر</h4>
                      </div>

                      {/* Enable / Disable Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs text-slate-300 font-bold">
                          {discountConfig.enabled ? 'مفعّل 🟢' : 'معطّل ⚪'}
                        </span>
                        <input
                          type="checkbox"
                          checked={discountConfig.enabled}
                          onChange={(e) =>
                            setDiscountConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                          }
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          نص رسالة الخصم الترويجية
                        </label>
                        <input
                          type="text"
                          value={discountConfig.bannerTextAr}
                          onChange={(e) =>
                            setDiscountConfig((prev) => ({ ...prev, bannerTextAr: e.target.value }))
                          }
                          placeholder="مثال: خصم 20% على جميع الكفرات والشواحن لفترة محدودة!"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">كود الخصم (Promo Code)</label>
                        <input
                          type="text"
                          value={discountConfig.promoCode}
                          onChange={(e) =>
                            setDiscountConfig((prev) => ({ ...prev, promoCode: e.target.value.toUpperCase() }))
                          }
                          placeholder="SADDAM20"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>حفظ إعدادات شريط الخصومات</span>
                      </button>
                    </div>
                  </form>

                  {/* Individual Products Quick Discounts Table */}
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Percent className="w-4 h-4 text-amber-400" />
                          <span>التحكم السريع بخصم كل منتج</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          اضغط على زر تفعيل أو إلغاء الخصم لتطبيق شارة العرض المخفض فوراً على المنتجات
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="text-slate-400 font-bold border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">المنتج</th>
                            <th className="p-2.5">السعر الحالي</th>
                            <th className="p-2.5">السعر قبل الخصم</th>
                            <th className="p-2.5">نسبة الخصم</th>
                            <th className="p-2.5 text-center">التحكم بالخصم</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {products.map((p) => {
                            const hasDiscount = Boolean(p.originalPrice && p.originalPrice > p.price);
                            return (
                              <tr key={p.id} className="hover:bg-slate-900/50">
                                <td className="p-2.5 font-bold text-white flex items-center gap-2">
                                  <img
                                    src={p.image}
                                    alt={p.nameAr}
                                    referrerPolicy="no-referrer"
                                    className="w-7 h-7 rounded-lg object-cover bg-slate-800"
                                  />
                                  <span>{p.nameAr}</span>
                                </td>
                                <td className="p-2.5 font-mono text-amber-400 font-bold">
                                  {formatPrice(p.price, currency, isAr)}
                                </td>
                                <td className="p-2.5 font-mono text-slate-400">
                                  {p.originalPrice ? formatPrice(p.originalPrice, currency, isAr) : '—'}
                                </td>
                                <td className="p-2.5">
                                  {hasDiscount ? (
                                    <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                      {p.discountPercentage}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => handleQuickToggleDiscount(p)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      hasDiscount
                                        ? 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900'
                                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                                    }`}
                                  >
                                    {hasDiscount ? 'إلغاء الخصم ❌' : 'تفعيل خصم 20% ⚡'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 3: VIDEOS & SHORTS */}
              {/* =================================================================== */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <h4 className="font-bold text-sm text-white">فيديوهات يوتيوب والريلز</h4>
                      <p className="text-xs text-slate-400">الفيديوهات المعروضة في قسم الريلز بالصفحة الرئيسية</p>
                    </div>
                    <button
                      onClick={() => setIsAddingNewVideo(true)}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة فيديو جديد</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {shorts.map((s) => (
                      <div
                        key={s.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-3 space-y-2 flex flex-col justify-between"
                      >
                        <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                          <img
                            src={`https://img.youtube.com/vi/${s.youtubeId}/hqdefault.jpg`}
                            alt={s.titleAr}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-white line-clamp-2">{s.titleAr}</h5>
                          <span className="text-[10px] text-red-400 font-mono">YouTube: {s.youtubeId}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex justify-end">
                          <button
                            onClick={() => handleDeleteVideo(s.id)}
                            className="p-1.5 text-red-400 hover:bg-red-950/60 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 4: SECURITY & BACKUP */}
              {/* =================================================================== */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Change PIN Form */}
                  <form
                    onSubmit={handleChangePin}
                    className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4 max-w-lg"
                  >
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Key className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-sm text-white">تغيير رمز المرور السري (PIN)</h4>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      الرمز الافتراضي الحالي هو: <b className="font-mono text-amber-400 font-bold">{MASTER_ADMIN_PIN}</b>.
                      يمكنك تغييره إلى أي رمز جديد تريده وسيتم تشفيره فوراً.
                    </p>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">رمز المرور الجديد</label>
                      <input
                        type="text"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="أدخل الرمز الجديد..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {pinChangeSuccess && (
                      <div className="p-2.5 bg-emerald-950/70 border border-emerald-700 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>تم حفظ وتشفير رمز المرور الجديد بنجاح!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!newPinInput.trim()}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ الرمز المشفر الجديد</span>
                    </button>
                  </form>

                  {/* Backup & Export */}
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4 max-w-lg">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <h4 className="font-bold text-sm text-white">النسخ الاحتياطي للمتجر</h4>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      يمكنك تنزيل ملف يحتوي على كافة منتجاتك وخصوماتك وصورك للاحتفاظ بنسخة احتياطية على جهازك أو نقلها لأي متصفح آخر.
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const json = exportStoreBackupJSON();
                          const blob = new Blob([json], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `saddam-store-backup-${Date.now()}.json`;
                          a.click();
                          showToast('تم تحميل ملف النسخة الاحتياطية بنجاح!');
                        }}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل نسخة احتياطية (JSON)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD / EDIT PRODUCT */}
        {/* ========================================================================= */}
        {isAddingNewProduct && (
          <div className="fixed inset-0 z-[100001] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base text-white">
                    {editingProduct ? 'تعديل بيانات المنتج والخصم' : 'إضافة منتج جديد للمتجر'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewProduct(false);
                    setEditingProduct(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductForm} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم المنتج بالعربية * (مثال: غلافات نسائي A32)
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: غلافات نسائي A32"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">القسم / التصنيف *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="cases">كفرات وحماية</option>
                      <option value="phones">هواتف ذكية</option>
                      <option value="chargers">شواحن وبطاريات</option>
                      <option value="audio">سماعات وصوتيات</option>
                      <option value="cables">كيابل ومحولات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">كود المنتج (SKU)</label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="SDM-8892"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Price & Discounts Section */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-amber-400" />
                      <span>السعر والخصومات</span>
                    </span>

                    {/* Discount Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formHasDiscount}
                        onChange={(e) => setFormHasDiscount(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-bold">تفعيل خصم على هذا المنتج ⚡</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        السعر النهائي للبيع (ريال يمني YER) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {formHasDiscount && (
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          السعر الأصلي قبل الخصم (مشطوب)
                        </label>
                        <input
                          type="number"
                          min={formPrice + 1}
                          value={formOriginalPrice}
                          onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                        />
                        {formOriginalPrice > formPrice && (
                          <span className="text-[10px] text-red-400 font-bold mt-1 block">
                            نسبة الخصم المحسوبة:{' '}
                            {Math.round(((formOriginalPrice - formPrice) / formOriginalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* IMAGES SECTION: Mobile Direct File Upload & Pinterest Fix */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>صور المنتج (رفع من الهاتف أو رابط مباشر)</span>
                      </span>
                      <p className="text-[10px] text-slate-400">
                        الأفضل والأسهل: ارفع الصور مباشرة من هاتفك لتعمل فوراً 100% بدون أي روابط وبدون انقطاع!
                      </p>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isUploadingImage ? 'جارِ المعالجة...' : '📸 رفع من المعرض'}</span>
                    </button>
                  </div>

                  {/* Pinterest URL input with validation */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formNewImageUrl}
                      onChange={(e) => setFormNewImageUrl(e.target.value)}
                      placeholder="أو ضع رابط صورة مباشر (https://...)"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
                    >
                      إضافة الرابط
                    </button>
                  </div>

                  {/* Warning if user pasted Pinterest webpage */}
                  {formImageWarning && (
                    <div className="p-3 bg-amber-950/80 border border-amber-600/70 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{formImageWarning}</span>
                    </div>
                  )}

                  {/* Thumbnails preview */}
                  {formImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-xl border-2 border-slate-700 bg-slate-900 overflow-hidden group"
                        >
                          <img
                            src={img}
                            alt={`preview-${idx}`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                            className="w-full h-full object-cover"
                          />

                          {idx === 0 && (
                            <span className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow">
                              الرئيسية
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="p-1 bg-amber-500 text-slate-950 rounded-md text-[10px] font-bold"
                                title="تعيين كصورة رئيسية"
                              >
                                ⭐
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 bg-red-600 text-white rounded-md text-[10px]"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors Preference: User explicitly requested "لا أريد أي ألوان" */}
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">خيارات الألوان للمنتج</span>
                    <span className="text-[10px] text-slate-500">
                      افتراضياً: بدون ألوان (منتج موحد كما طلبت)
                    </span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formEnableColors}
                      onChange={(e) => setFormEnableColors(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 font-medium">تفعيل ألوان متعددة</span>
                  </label>
                </div>

                {/* Description & Warranty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">وصف المنتج (اختياري)</label>
                    <textarea
                      rows={2}
                      value={formDescriptionAr}
                      onChange={(e) => setFormDescriptionAr(e.target.value)}
                      placeholder="وصف مختصر لمميزات المنتج..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">مدة الضمان (سنوات)</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={formWarrantyYears}
                        onChange={(e) => setFormWarrantyYears(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الكمية في المخزون</label>
                      <input
                        type="number"
                        min={1}
                        value={formStock}
                        onChange={(e) => setFormStock(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewProduct(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>{editingProduct ? 'حفظ التعديلات' : 'نشر المنتج بالمتجر فوراً'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD VIDEO */}
        {/* ========================================================================= */}
        {isAddingNewVideo && (
          <div className="fixed inset-0 z-[100001] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-sm text-white">إضافة فيديو شورتس جديد</h3>
                <button
                  onClick={() => setIsAddingNewVideo(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddVideo} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رابط فيديو يوتيوب أو شورتس *
                  </label>
                  <input
                    type="url"
                    required
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/... أو https://youtu.be/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الفيديو بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={newVideoTitleAr}
                    onChange={(e) => setNewVideoTitleAr(e.target.value)}
                    placeholder="مثال: استعراض غلافات ومسكات A32 المقاومة للصدمات"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewVideo(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs"
                  >
                    إضافة الفيديو
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
