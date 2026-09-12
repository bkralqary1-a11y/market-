import { useState, useRef, FormEvent, ChangeEvent } from 'react';
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
  ExternalLink,
  Smartphone,
  Save,
  AlertCircle
} from 'lucide-react';
import { Product, CategoryId, Language, Currency } from '../types';
import { ShortVideoItem } from './YouTubeShortsSection';
import {
  verifyAdminPin,
  isAdminAuthenticated,
  setAdminAuthenticated,
  getAdminPin,
  setAdminPin,
  saveStoredProducts,
  saveStoredShorts,
  resetProductsToDefault,
  resetShortsToDefault,
  exportStoreBackupJSON,
  importStoreBackupJSON
} from '../utils/storeStorage';
import { formatPrice } from '../data/mockData';
import { getYouTubeId } from '../utils/videoUtils';

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

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated());
  const [enteredPin, setEnteredPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'products' | 'videos' | 'sync'
  const [activeTab, setActiveTab] = useState<'products' | 'videos' | 'sync'>('products');

  // Products filters inside admin
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  // Product Add / Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);

  // Video Add Modal
  const [isAddingNewVideo, setIsAddingNewVideo] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitleAr, setNewVideoTitleAr] = useState('');
  const [newVideoTitleEn, setNewVideoTitleEn] = useState('');
  const [newVideoCaptionAr, setNewVideoCaptionAr] = useState('');
  const [newVideoThumb, setNewVideoThumb] = useState('');
  const [newVideoTagAr, setNewVideoTagAr] = useState('فيديو جديد');

  // Change PIN State
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Backup / Import State
  const [importJsonText, setImportJsonText] = useState('');
  const [importMessage, setImportMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Status Notification Toast
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(enteredPin)) {
      setIsAuthenticated(true);
      setAuthError('');
      setEnteredPin('');
      showToast('تم تسجيل الدخول بنجاح إلى لوحة الإدارة');
    } else {
      setAuthError('رمز المرور غير صحيح. تأكد من إدخال الرمز السري الصحيح.');
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setEnteredPin('');
  };

  // Toggle Product Visibility (Hide / Show)
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
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف المنتج "${productName}" نهائياً من المتجر؟`)) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      saveStoredProducts(updated);
      showToast(`تم حذف "${productName}" بنجاح`);
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const nameAr = (formData.get('nameAr') as string)?.trim() || 'منتج جديد';
    const nameEn = (formData.get('name') as string)?.trim() || nameAr;
    const price = Number(formData.get('price')) || 0;
    const originalPrice = formData.get('originalPrice') ? Number(formData.get('originalPrice')) : undefined;
    const category = (formData.get('category') as CategoryId) || 'phones';
    const brand = (formData.get('brand') as string)?.trim() || 'Generic';
    const image = (formData.get('image') as string)?.trim() || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop';
    
    // Additional images: split by comma or newline
    const imagesRaw = (formData.get('imagesRaw') as string) || '';
    const images = imagesRaw
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 5);
    if (!images.includes(image)) {
      images.unshift(image);
    }

    const descriptionAr = (formData.get('descriptionAr') as string)?.trim() || '';
    const descriptionEn = (formData.get('description') as string)?.trim() || descriptionAr;
    const inStock = formData.get('inStock') === 'on';
    const isTrending = formData.get('isTrending') === 'on';
    const isPopular = formData.get('isPopular') === 'on';
    const videoUrl = (formData.get('videoUrl') as string)?.trim() || undefined;
    const tagAr = (formData.get('tagAr') as string)?.trim() || undefined;

    // Variants options
    const variantsRaw = (formData.get('variantsRaw') as string)?.trim() || 'الأساسي';
    const variantOptions = variantsRaw.split(',').map((v) => v.trim()).filter(Boolean);

    // Category names
    const categoryNamesMap: Record<CategoryId, { ar: string; en: string }> = {
      all: { ar: 'كافة المنتجات', en: 'All Products' },
      phones: { ar: 'هواتف ذكية', en: 'Smartphones' },
      audio: { ar: 'سماعات وصوتيات', en: 'Audio & Earbuds' },
      chargers: { ar: 'شواحن وبطاريات', en: 'Chargers & Power' },
      cases: { ar: 'كفرات وحماية', en: 'Cases & Protection' },
      cables: { ar: 'كيابل وتوصيلات', en: 'Cables & Hubs' },
    };

    if (editingProduct) {
      // Update existing
      const updatedList = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: nameEn,
            nameAr,
            price,
            originalPrice,
            category,
            categoryNameAr: categoryNamesMap[category]?.ar || p.categoryNameAr,
            categoryNameEn: categoryNamesMap[category]?.en || p.categoryNameEn,
            brand,
            image,
            images,
            description: descriptionEn,
            descriptionAr,
            inStock,
            isTrending,
            isPopular,
            videoUrl,
            tagAr,
            variants: {
              ...p.variants,
              options: variantOptions.length > 0 ? variantOptions : ['الأساسي'],
            },
          };
        }
        return p;
      });
      onUpdateProducts(updatedList);
      saveStoredProducts(updatedList);
      showToast(`تم تعديل بيانات "${nameAr}" بنجاح`);
      setEditingProduct(null);
    } else {
      // Create new product
      const newProduct: Product = {
        id: `prod-custom-${Date.now()}`,
        name: nameEn,
        nameAr,
        price,
        originalPrice,
        category,
        categoryNameAr: categoryNamesMap[category]?.ar || 'هواتف ذكية',
        categoryNameEn: categoryNamesMap[category]?.en || 'Smartphones',
        brand,
        image,
        images,
        rating: 5.0,
        reviewsCount: 1,
        description: descriptionEn,
        descriptionAr,
        inStock,
        fastShipping: true,
        warrantyYears: 1,
        isTrending,
        isPopular,
        colors: ['#0f172a', '#e2e8f0'],
        colorNamesAr: ['أسود كربوني', 'فضي تيتانيوم'],
        variants: {
          titleEn: 'Capacity / Model',
          titleAr: 'الموديل والسعة',
          options: variantOptions.length > 0 ? variantOptions : ['الأساسي'],
        },
        specs: {
          'الضمان': { ar: 'ضمان رسمي لمدة عام كامل', en: '1 Year Warranty' },
          'الجودة': { ar: 'أصلي معتمد 100%', en: '100% Original Certified' },
        },
        sku: `SDM-${Math.floor(1000 + Math.random() * 9000)}`,
        tagAr: tagAr || (isTrending ? 'وصل حديثاً' : undefined),
        videoUrl,
        hidden: false,
      };

      const updatedList = [newProduct, ...products];
      onUpdateProducts(updatedList);
      saveStoredProducts(updatedList);
      showToast(`تمت إضافة "${nameAr}" بنجاح إلى المتجر!`);
      setIsAddingNewProduct(false);
    }
  };

  // Add New Video
  const handleAddVideo = (e: FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim() || !newVideoTitleAr.trim()) return;

    const ytId = getYouTubeId(newVideoUrl) || 'dQw4w9WgXcQ';
    const fallbackThumb = newVideoThumb.trim() || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    const newShort: ShortVideoItem = {
      id: `short-custom-${Date.now()}`,
      youtubeId: ytId,
      shortsUrl: newVideoUrl.trim(),
      titleAr: newVideoTitleAr.trim(),
      titleEn: newVideoTitleEn.trim() || newVideoTitleAr.trim(),
      captionAr: newVideoCaptionAr.trim() || 'فيديو استعراض ومراجعة لأحدث الأجهزة الأصلية في محلات صدام العقاري.',
      captionEn: 'Review video from Saddam Al-Aqari Tech.',
      viewsText: '1.5K',
      productId: products[0]?.id || 'custom-item',
      productNameAr: products[0]?.nameAr || 'هاتف ذكي أصلي',
      productNameEn: products[0]?.name || 'Flagship Smartphone',
      productPrice: products[0]?.price || 350000,
      productImage: fallbackThumb,
      tagAr: newVideoTagAr.trim() || 'فيديو جديد',
      tagEn: 'New Video',
    };

    const updatedShorts = [newShort, ...shorts];
    onUpdateShorts(updatedShorts);
    saveStoredShorts(updatedShorts);
    showToast('تمت إضافة الفيديو الجديد بنجاح!');
    setIsAddingNewVideo(false);
    setNewVideoUrl('');
    setNewVideoTitleAr('');
    setNewVideoTitleEn('');
    setNewVideoCaptionAr('');
    setNewVideoThumb('');
  };

  // Delete Video
  const handleDeleteVideo = (videoId: string, videoTitle: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الفيديو "${videoTitle}"؟`)) {
      const updated = shorts.filter((s) => s.id !== videoId);
      onUpdateShorts(updated);
      saveStoredShorts(updated);
      showToast('تم حذف الفيديو بنجاح');
    }
  };

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      productSearch === '' ||
      p.nameAr.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());

    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;

    const matchesStatus =
      productStatusFilter === 'all' ||
      (productStatusFilter === 'visible' && !p.hidden) ||
      (productStatusFilter === 'hidden' && p.hidden);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const visibleCount = products.filter((p) => !p.hidden).length;
  const hiddenCount = products.filter((p) => p.hidden).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Action Notification Toast */}
      {actionToast && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border border-emerald-500/50 animate-bounce">
          <Check className="w-5 h-5 text-emerald-200" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        
        {/* LOGIN SCREEN IF NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
              <Lock className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">لوحة التحكم والإدارة المشفرة</h2>
              <p className="text-sm text-slate-400 mt-2">
                مخصصة لمالك المتجر (محلات صدام العقاري). يُرجى إدخال رمز المرور السري للتحكم الكامل في المتجر.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="أدخل رمز المرور (الافتراضي: 774102030)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-lg font-mono tracking-widest text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  autoFocus
                />
                {authError && (
                  <p className="text-rose-400 text-xs font-bold mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{authError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-5 h-5" />
                  <span>دخول آمن</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 px-5 rounded-2xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>

            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 text-xs text-slate-400 text-center">
              💡 الرمز الافتراضي المبرمج هو رقم المتجر: <strong className="text-amber-400 font-mono">774102030</strong> ويمكنك تغييره من الداخل بأي وقت.
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <>
            {/* Header Bar */}
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black shadow-md">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white">لوحة التحكم والإدارة الشاملة</h2>
                    <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                      متصل كمسؤول
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">إدارة المنتجات، الفيديوهات، الإخفاء والإظهار والروابط</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'products'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>المنتجات ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'videos'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>الفيديوهات ({shorts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('sync')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'sync'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>المزامنة والأمان</span>
                </button>
              </div>

              {/* Top Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  title="تسجيل الخروج من لوحة الإدارة"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* ========================================================================= */}
              {/* TAB 1: PRODUCTS MANAGEMENT */}
              {/* ========================================================================= */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Top Product Actions & Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">إجمالي المنتجات</div>
                        <div className="text-xl font-black text-white">{products.length}</div>
                      </div>
                      <Layers className="w-6 h-6 text-slate-500" />
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-emerald-400 font-medium">معروضة للزوار</div>
                        <div className="text-xl font-black text-emerald-300">{visibleCount}</div>
                      </div>
                      <Eye className="w-6 h-6 text-emerald-500" />
                    </div>

                    <div className="bg-rose-950/40 border border-rose-800/60 p-3.5 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-rose-400 font-medium">مخفية عن الزوار</div>
                        <div className="text-xl font-black text-rose-300">{hiddenCount}</div>
                      </div>
                      <EyeOff className="w-6 h-6 text-rose-500" />
                    </div>

                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsAddingNewProduct(true);
                      }}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black p-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all text-xs sm:text-sm"
                    >
                      <Plus className="w-5 h-5" />
                      <span>إضافة منتج جديد</span>
                    </button>
                  </div>

                  {/* Filters Bar */}
                  <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ابحث باسم المنتج، الماركة..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="all">كل الأقسام</option>
                        <option value="phones">هواتف ذكية</option>
                        <option value="audio">سماعات وصوتيات</option>
                        <option value="chargers">شواحن وبطاريات</option>
                        <option value="cases">كفرات وحماية</option>
                        <option value="cables">كيابل وتوصيلات</option>
                      </select>

                      <select
                        value={productStatusFilter}
                        onChange={(e) => setProductStatusFilter(e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="all">كل الحالات</option>
                        <option value="visible">المعروضة فقط</option>
                        <option value="hidden">المخفية فقط</option>
                      </select>
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="space-y-2.5">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                        لا توجد منتجات مطابقة لخيارات البحث الحالية
                      </div>
                    ) : (
                      filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            prod.hidden
                              ? 'bg-slate-950/60 border-rose-900/40 opacity-75'
                              : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
                          }`}
                        >
                          {/* Image & Main Info */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="relative w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                              <img
                                src={prod.image}
                                alt={prod.nameAr}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).setAttribute(
                                    'src',
                                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300'
                                  );
                                }}
                              />
                              {prod.hidden && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                  <EyeOff className="w-5 h-5 text-rose-400" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-white truncate">{prod.nameAr}</h4>
                                {prod.hidden ? (
                                  <span className="bg-rose-950 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-800 flex items-center gap-1">
                                    <EyeOff className="w-3 h-3" />
                                    <span>مخفي</span>
                                  </span>
                                ) : (
                                  <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    <span>ظاهر بالمتجر</span>
                                  </span>
                                )}
                                <span className="bg-slate-900 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                                  {prod.brand}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                <span className="font-black text-amber-400 font-mono">
                                  {formatPrice(prod.price, currency, isAr)}
                                </span>
                                {prod.originalPrice && (
                                  <span className="line-through text-slate-500 font-mono">
                                    {formatPrice(prod.originalPrice, currency, isAr)}
                                  </span>
                                )}
                                <span>• {prod.categoryNameAr}</span>
                                <span>• {prod.inStock ? 'متوفر' : 'نفد المخزون'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                            {/* Toggle Hide / Show Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleProductVisibility(prod.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                prod.hidden
                                  ? 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border-emerald-700'
                                  : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-800'
                              }`}
                              title={prod.hidden ? 'إظهار المنتج في المتجر' : 'إخفاء المنتج عن الزوار'}
                            >
                              {prod.hidden ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>إظهار في المتجر</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>إخفاء عن الزوار</span>
                                </>
                              )}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(prod);
                                setIsAddingNewProduct(false);
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 transition-all flex items-center gap-1 cursor-pointer"
                              title="تعديل تفاصيل وسعر وصور المنتج"
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-400" />
                              <span>تعديل</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id, prod.nameAr)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950 border border-slate-700 transition-all cursor-pointer"
                              title="حذف المنتج نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: VIDEOS / SHORTS MANAGEMENT */}
              {/* ========================================================================= */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">فيديوهات ريلز ويوتيوب شورتس المعروضة</h3>
                      <p className="text-xs text-slate-400">إضافة وتعديل وحذف الفيديوهات التي تظهر للزوار لطلب المنتجات مباشرة</p>
                    </div>
                    <button
                      onClick={() => setIsAddingNewVideo(true)}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold px-4 py-2.5 rounded-xl shadow text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة فيديو شورتس جديد</span>
                    </button>
                  </div>

                  {/* Videos Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shorts.map((sh) => (
                      <div
                        key={sh.id}
                        className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden flex flex-col group hover:border-slate-600 transition-all"
                      >
                        <div className="relative aspect-[9/12] bg-black overflow-hidden">
                          <img
                            src={sh.productImage}
                            alt={sh.titleAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          <div className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                            {sh.tagAr || 'Shorts'}
                          </div>
                          <div className="absolute bottom-2.5 inset-x-2.5">
                            <h4 className="font-bold text-xs text-white line-clamp-2 leading-snug">{sh.titleAr}</h4>
                            <div className="text-[10px] text-amber-300 font-mono mt-1 font-bold">
                              {formatPrice(sh.productPrice, currency, isAr)}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900 flex items-center justify-between gap-2 border-t border-slate-800">
                          <a
                            href={sh.shortsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 truncate"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">فتح الفيديو</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(sh.id, sh.titleAr)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950 transition-all cursor-pointer"
                            title="حذف الفيديو"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: SYNC, BACKUP & SECURITY */}
              {/* ========================================================================= */}
              {activeTab === 'sync' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  
                  {/* Change Admin PIN */}
                  <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Key className="w-5 h-5" />
                      <h4 className="font-black text-sm text-white">تغيير رمز المرور السري للوحة الإدارة</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      الرمز الحالي مفعل ومحمي. يمكنك تغييره لضمان عدم وصول أي شخص آخر غيرك.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="أدخل الرمز السري الجديد"
                        value={newPinInput}
                        onChange={(e) => {
                          setNewPinInput(e.target.value);
                          setPinChangeSuccess(false);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPinInput.trim().length >= 4) {
                            setAdminPin(newPinInput.trim());
                            setPinChangeSuccess(true);
                            setNewPinInput('');
                            showToast('تم تغيير رمز المرور السري بنجاح');
                          } else {
                            alert('يجب أن يتكون رمز المرور من 4 أرقام أو أحرف على الأقل');
                          }
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        حفظ الرمز
                      </button>
                    </div>
                    {pinChangeSuccess && (
                      <p className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>تم تحديث الرمز السري بنجاح!</span>
                      </p>
                    )}
                  </div>

                  {/* Export Store Backup JSON */}
                  <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Download className="w-5 h-5" />
                      <h4 className="font-black text-sm text-white">تصدير نسخة احتياطية من بيانات المتجر (JSON)</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      احصل على ملف JSON كامل بجميع المنتجات، الفيديوهات، الأسعار وروابط الصور للاحتفاظ بها أو تشغيلها في أي تطبيق خارجي.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const json = exportStoreBackupJSON();
                          navigator.clipboard.writeText(json);
                          setCopySuccess(true);
                          setTimeout(() => setCopySuccess(false), 2500);
                          showToast('تم نسخ كود البيانات JSON إلى الحافظة');
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>{copySuccess ? 'تم النسخ للحافظة ✓' : 'نسخ كود JSON كاملاً'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const json = exportStoreBackupJSON();
                          const blob = new Blob([json], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `saddam-store-backup-${new Date().toISOString().slice(0, 10)}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          showToast('تم تحميل ملف النسخة الاحتياطية بنجاح');
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>تحميل كملف (.json)</span>
                      </button>
                    </div>
                  </div>

                  {/* Import JSON From External System */}
                  <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Upload className="w-5 h-5" />
                      <h4 className="font-black text-sm text-white">استيراد بيانات من تطبيق خارجي أو ملف احتياطي</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      ألصق كود JSON الخاص بالمنتجات هنا لتحديث بيانات المتجر فوراً.
                    </p>
                    <textarea
                      rows={4}
                      placeholder='الصق هنا نص JSON للمنتجات، مثال: {"products": [...]}'
                      value={importJsonText}
                      onChange={(e) => setImportJsonText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!importJsonText.trim()) return;
                        const res = importStoreBackupJSON(importJsonText);
                        if (res.success) {
                          setImportMessage({ text: res.message, isError: false });
                          // Refresh state
                          const p = JSON.parse(localStorage.getItem('saddam_store_products_v3') || '[]');
                          const s = JSON.parse(localStorage.getItem('saddam_store_shorts_v3') || '[]');
                          if (p.length) onUpdateProducts(p);
                          if (s.length) onUpdateShorts(s);
                          setImportJsonText('');
                          showToast(res.message);
                        } else {
                          setImportMessage({ text: res.message, isError: true });
                        }
                      }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>تطبيق واستيراد البيانات الآن</span>
                    </button>
                    {importMessage && (
                      <p className={`text-xs font-bold flex items-center gap-1 ${importMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {importMessage.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        <span>{importMessage.text}</span>
                      </p>
                    )}
                  </div>

                  {/* Reset to Factory Defaults */}
                  <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-xs text-rose-300">إعادة ضبط المصنع للمنتجات والفيديوهات</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">استرجاع قائمة المنتجات الأصلية الافتراضية للمتجر</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل تريد استرجاع المنتجات الافتراضية؟ سيتم إرجاع المنتجات كما كانت أول مرة.')) {
                          const p = resetProductsToDefault();
                          const s = resetShortsToDefault();
                          onUpdateProducts(p);
                          onUpdateShorts(s);
                          showToast('تم استرجاع المنتجات الافتراضية بنجاح');
                        }
                      }}
                      className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer shrink-0"
                    >
                      استرجاع الافتراضي
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer info */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>نظام تحكم مباشر مشفر • التعديلات تنعكس فورياً على واجهة المتجر</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق اللوحة
              </button>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD / EDIT PRODUCT */}
        {/* ========================================================================= */}
        {(isAddingNewProduct || editingProduct) && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
                    {editingProduct ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h3 className="font-black text-base text-white">
                    {editingProduct ? `تعديل: ${editingProduct.nameAr}` : 'إضافة منتج جديد للمتجر'}
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

              <form onSubmit={handleSaveProduct} className="space-y-4">
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنتج بالعربية *</label>
                    <input
                      name="nameAr"
                      required
                      defaultValue={editingProduct?.nameAr || ''}
                      placeholder="مثال: آيفون 16 برو ماكس تيتانيوم"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الاسم بالإنجليزية</label>
                    <input
                      name="name"
                      defaultValue={editingProduct?.name || ''}
                      placeholder="e.g. iPhone 16 Pro Max 256GB"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      السعر الحالي بالريال اليمني (YER) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      defaultValue={editingProduct?.price || 50000}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      السعر قبل الخصم (اختياري للشطب والخصم)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      defaultValue={editingProduct?.originalPrice || ''}
                      placeholder="اتركه فارغاً إن لم يكن هناك خصم"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">القسم والتصنيف</label>
                    <select
                      name="category"
                      defaultValue={editingProduct?.category || 'phones'}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="phones">هواتف ذكية (Smartphones)</option>
                      <option value="audio">سماعات وصوتيات (Audio)</option>
                      <option value="chargers">شواحن وبطاريات (Chargers)</option>
                      <option value="cases">كفرات وحماية (Cases)</option>
                      <option value="cables">كيابل وتوصيلات (Cables)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الماركة / الشركة</label>
                    <input
                      name="brand"
                      defaultValue={editingProduct?.brand || 'Apple'}
                      placeholder="مثال: Apple, Samsung, Anker"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Main Image URL with Live Preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رابط الصورة الرئيسية للمنتج (Image URL) *
                  </label>
                  <input
                    name="image"
                    required
                    defaultValue={editingProduct?.image || ''}
                    placeholder="https://images.unsplash.com/... أو أي رابط صورة مباشر"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ضع رابط الصورة المباشر من الإنترنت (من Google، Unsplash، Cloudinary، أو أي موقع).
                  </p>
                </div>

                {/* Additional Images (URLs) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    روابط صور إضافية لمعرض الصور (كل رابط في سطر أو مفصول بفاصلة)
                  </label>
                  <textarea
                    name="imagesRaw"
                    rows={2}
                    defaultValue={editingProduct?.images?.join('\n') || ''}
                    placeholder="https://...\nhttps://..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رابط فيديو توضيحي (YouTube Shorts / Video URL)
                  </label>
                  <input
                    name="videoUrl"
                    defaultValue={editingProduct?.videoUrl || ''}
                    placeholder="https://youtube.com/shorts/... أو رابط يوتيوب عادي"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الوصف بالعربية</label>
                    <textarea
                      name="descriptionAr"
                      rows={3}
                      defaultValue={editingProduct?.descriptionAr || ''}
                      placeholder="وصف تفصيلي لمواصفات الجهاز ومحتويات العلبة..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الوصف بالإنجليزية</label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingProduct?.description || ''}
                      placeholder="Product specifications and details in English..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Variants & Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      الخيارات / السعات المتوفرة (مفصولة بفاصلة)
                    </label>
                    <input
                      name="variantsRaw"
                      defaultValue={editingProduct?.variants?.options?.join(', ') || '256GB, 512GB, 1TB'}
                      placeholder="مثال: 256GB, 512GB, 1TB"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">شارة ترويجية (Tag)</label>
                    <input
                      name="tagAr"
                      defaultValue={editingProduct?.tagAr || ''}
                      placeholder="مثال: ضمان الوكيل، تخفيض حصري"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Badges & Checkboxes */}
                <div className="flex flex-wrap items-center gap-4 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="inStock"
                      defaultChecked={editingProduct ? editingProduct.inStock : true}
                      className="rounded accent-orange-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-slate-200">متوفر في المخزون</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isTrending"
                      defaultChecked={editingProduct ? editingProduct.isTrending : true}
                      className="rounded accent-orange-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-slate-200">منتج رائج (Trending)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPopular"
                      defaultChecked={editingProduct ? editingProduct.isPopular : false}
                      className="rounded accent-orange-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-slate-200">الأكثر طلباً (Popular)</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewProduct(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج إلى المتجر'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD NEW VIDEO */}
        {/* ========================================================================= */}
        {isAddingNewVideo && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">
                    <Video className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-base text-white">إضافة فيديو شورتس / ريلز جديد</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNewVideo(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVideo} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رابط فيديو يوتيوب أو يوتيوب شورتس *
                  </label>
                  <input
                    required
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/... أو https://youtu.be/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    سيتم استخراج صورة الغالف وتضمين الفيديو تلقائياً.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الفيديو بالعربية *</label>
                  <input
                    required
                    value={newVideoTitleAr}
                    onChange={(e) => setNewVideoTitleAr(e.target.value)}
                    placeholder="مثال: فتح صندوق آيفون 16 برو ماكس وتجربة الكاميرا"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العنوان بالإنجليزية (اختياري)</label>
                  <input
                    value={newVideoTitleEn}
                    onChange={(e) => setNewVideoTitleEn(e.target.value)}
                    placeholder="e.g. iPhone 16 Pro Max Unboxing & Hands-on"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نص توضيحي / كابشن</label>
                  <textarea
                    rows={2}
                    value={newVideoCaptionAr}
                    onChange={(e) => setNewVideoCaptionAr(e.target.value)}
                    placeholder="نبذة سريعة عن مميزات الجهاز المعروض بالفيديو..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">شارة الفيديو</label>
                  <input
                    value={newVideoTagAr}
                    onChange={(e) => setNewVideoTagAr(e.target.value)}
                    placeholder="مثال: الأحدث لعام 2026، الأكثر مبيعاً"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewVideo(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة الفيديو للمتجر</span>
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
