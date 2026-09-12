import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Image as ImageIcon,
  Video,
  Film,
  Upload,
  Link2,
  Check,
  RefreshCw,
  Trash2,
  Plus,
  Eye,
  ExternalLink,
  Sparkles,
  Smartphone,
  Headphones,
  Shield,
  Zap,
  Cable,
  AlertCircle,
  Play,
  Layers,
  Search,
} from 'lucide-react';
import {
  Product,
  Language,
  HeroSlideItem,
  ShortVideoItem,
  CategoryId,
} from '../types';
import {
  CategoryImagesConfig,
  getStoredCategoryImages,
  saveStoredCategoryImages,
  resetStoredCategoryImages,
  DEFAULT_CATEGORY_IMAGES,
  saveStoredShorts,
  saveStoredHeroSlides,
  saveStoredProducts,
} from '../utils/storeStorage';
import {
  compressAndConvertImageFile,
  sanitizeImageUrl,
  FALLBACK_PRODUCT_IMAGE,
} from '../utils/imageUtils';
import { getYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from '../utils/videoUtils';
import { soundFX } from '../utils/audioEffects';

interface AdminMediaManagerProps {
  language: Language;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  shorts: ShortVideoItem[];
  onUpdateShorts: (shorts: ShortVideoItem[]) => void;
  heroSlides: HeroSlideItem[];
  onUpdateHeroSlides: (slides: HeroSlideItem[]) => void;
  onShowToast: (msg: string) => void;
}

export default function AdminMediaManager({
  language,
  products,
  onUpdateProducts,
  shorts,
  onUpdateShorts,
  heroSlides,
  onUpdateHeroSlides,
  onShowToast,
}: AdminMediaManagerProps) {
  const isAr = language === 'ar';

  // Sub-navigation inside Media Manager
  const [mediaTab, setMediaTab] = useState<'categories' | 'videos' | 'hero' | 'products' | 'tester'>('categories');

  // 1. Categories Images State
  const [categoryImages, setCategoryImages] = useState<CategoryImagesConfig>(() => getStoredCategoryImages());
  const [editingCategory, setEditingCategory] = useState<keyof CategoryImagesConfig>('phones');
  const [categoryUrlInput, setCategoryUrlInput] = useState<string>(categoryImages.phones);
  const categoryFileInputRef = useRef<HTMLInputElement | null>(null);

  // 2. Video Shorts State
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitleAr, setNewVideoTitleAr] = useState('');
  const [newVideoTitleEn, setNewVideoTitleEn] = useState('');
  const [newVideoCaptionAr, setNewVideoCaptionAr] = useState('');
  const [newVideoCaptionEn, setNewVideoCaptionEn] = useState('');
  const [newVideoProductId, setNewVideoProductId] = useState('');
  const [newVideoThumbnailUrl, setNewVideoThumbnailUrl] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  // 3. Quick Product External Images Updater State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productCoverUrl, setProductCoverUrl] = useState('');
  const [productGalleryUrls, setProductGalleryUrls] = useState<string[]>(['', '', '', '']);

  // Update product form when selected product changes
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleSelectProduct = (prod: Product) => {
    setSelectedProductId(prod.id);
    setProductCoverUrl(prod.image || '');
    const gallery = prod.images || [];
    setProductGalleryUrls([
      gallery[0] || '',
      gallery[1] || '',
      gallery[2] || '',
      gallery[3] || '',
    ]);
  };

  // Initialize selected product URLs on first load or when products change
  React.useEffect(() => {
    if (selectedProduct && !productCoverUrl) {
      setProductCoverUrl(selectedProduct.image || '');
      const gallery = selectedProduct.images || [];
      setProductGalleryUrls([
        gallery[0] || '',
        gallery[1] || '',
        gallery[2] || '',
        gallery[3] || '',
      ]);
    }
  }, [selectedProduct]);

  // 4. Universal URL Tester State
  const [testerUrl, setTesterUrl] = useState('');
  const [testedMediaType, setTestedMediaType] = useState<'image' | 'video' | 'invalid' | null>(null);
  const [testWarning, setTestWarning] = useState<string | null>(null);

  // Category Information list
  const categoryMetadata: {
    key: keyof CategoryImagesConfig;
    nameAr: string;
    nameEn: string;
    icon: React.ReactNode;
    descriptionAr: string;
  }[] = [
    {
      key: 'phones',
      nameAr: 'الهواتف الذكية المعتمدة',
      nameEn: 'Certified Smartphones',
      icon: <Smartphone className="w-5 h-5 text-amber-400" />,
      descriptionAr: 'صورة خلفية بطاقة قسم الهواتف في الواجهة الرئيسية للمتجر.',
    },
    {
      key: 'audio',
      nameAr: 'السماعات والأنظمة الصوتية',
      nameEn: 'Headphones & Audio Gear',
      icon: <Headphones className="w-5 h-5 text-cyan-400" />,
      descriptionAr: 'صورة بطاقة قسم السماعات اللاسلكية والأنظمة الصوتية.',
    },
    {
      key: 'cases',
      nameAr: 'كفرات وحماية الأجهزة',
      nameEn: 'Cases & Screen Protection',
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      descriptionAr: 'صورة قسم جرابات الحماية النانو والماج سيف واستكرات الشاشة.',
    },
    {
      key: 'chargers',
      nameAr: 'الشواحن ومنصات الطاقة',
      nameEn: 'GaN Chargers & Power Banks',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      descriptionAr: 'صورة قسم شواحن GaN السريعة ومنصات الشحن اللاسلكي.',
    },
    {
      key: 'cables',
      nameAr: 'الكيابل والوصلات المعتمدة',
      nameEn: 'High-Speed Cables & Adapters',
      icon: <Cable className="w-5 h-5 text-emerald-400" />,
      descriptionAr: 'صورة قسم كيابل Type-C وLightning عالية التحمل 100W+.',
    },
  ];

  // Save Category Image URL
  const handleSaveCategoryImage = (catKey: keyof CategoryImagesConfig, urlToSave?: string) => {
    const finalUrl = (urlToSave || categoryUrlInput).trim();
    if (!finalUrl) {
      onShowToast(isAr ? 'الرجاء إدخال رابط الصورة أولاً' : 'Please provide an image URL');
      return;
    }

    const sanitized = sanitizeImageUrl(finalUrl);
    if (sanitized.isPinterestWebpage) {
      onShowToast(sanitized.warning || (isAr ? 'رابط صفحة وليس صورة مباشرة' : 'Webpage link, not direct image'));
      return;
    }

    const updated = {
      ...categoryImages,
      [catKey]: sanitized.url,
    };

    saveStoredCategoryImages(updated);
    setCategoryImages(updated);
    soundFX.playAddToCart();
    onShowToast(isAr ? `تم تحديث صورة قسم (${catKey}) وتطبيقها فوراً في المتجر!` : `Category image updated!`);
  };

  // Upload Category Image from Device
  const handleUploadCategoryImageFile = async (e: ChangeEvent<HTMLInputElement>, catKey: keyof CategoryImagesConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      onShowToast(isAr ? 'جاري ضغط ومعالجة الصورة...' : 'Compressing image...');
      const dataUrl = await compressAndConvertImageFile(file, 1200, 0.85);
      const updated = {
        ...categoryImages,
        [catKey]: dataUrl,
      };
      saveStoredCategoryImages(updated);
      setCategoryImages(updated);
      setCategoryUrlInput(dataUrl);
      soundFX.playAddToCart();
      onShowToast(isAr ? 'تم رفع وحفظ صورة القسم بنجاح وتطبيقها في المتجر!' : 'Category image uploaded!');
    } catch {
      onShowToast(isAr ? 'حدث خطأ أثناء معالجة الصورة' : 'Failed to process image');
    }
  };

  // Reset Category Images to Defaults
  const handleResetCategoryImages = () => {
    if (!confirm(isAr ? 'هل أنت متأكد من استعادة الصور الافتراضية لكافة الأقسام؟' : 'Reset all category images to defaults?')) return;
    const res = resetStoredCategoryImages();
    setCategoryImages(res);
    setCategoryUrlInput(res[editingCategory]);
    soundFX.playAddToCart();
    onShowToast(isAr ? 'تمت استعادة صور الأقسام الافتراضية بنجاح!' : 'Category images reset to default!');
  };

  // Save New YouTube Video Short
  const handleAddVideoShort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) {
      onShowToast(isAr ? 'الرجاء إدخال رابط فيديو يوتيوب أو الشورتس' : 'Please enter YouTube video URL');
      return;
    }

    const ytId = getYouTubeId(newVideoUrl.trim());
    if (!ytId) {
      onShowToast(isAr ? 'رابط يوتيوب غير صالح، يرجى التأكد من الرابط' : 'Invalid YouTube URL');
      return;
    }

    const linkedProd = products.find((p) => p.id === newVideoProductId);
    const newShort: ShortVideoItem = {
      id: `short-${Date.now()}`,
      youtubeId: ytId,
      shortsUrl: newVideoUrl.trim(),
      titleAr: newVideoTitleAr.trim() || (isAr ? 'فيديو استعراض جديد' : 'New Video Showcase'),
      titleEn: newVideoTitleEn.trim() || 'New Video Showcase',
      captionAr: newVideoCaptionAr.trim() || (isAr ? 'شاهد تفاصيل ومميزات المنتج المعتمد من متجر صدام العقاري' : 'Watch product details and features'),
      captionEn: newVideoCaptionEn.trim() || 'Watch certified product features',
      viewsText: '1.2K',
      productId: linkedProd?.id || products[0]?.id || 'iphone-16-pro',
      productNameAr: linkedProd?.nameAr || 'آيفون 16 برو تيتانيوم',
      productNameEn: linkedProd?.name || 'iPhone 16 Pro',
      productPrice: linkedProd?.price || 1200,
      productImage: newVideoThumbnailUrl.trim() || (linkedProd?.image || getYouTubeThumbnail(ytId)),
      tagAr: isAr ? 'فيديو جديد' : 'New Video',
      tagEn: 'New Video',
    };

    const updated = [newShort, ...shorts];
    onUpdateShorts(updated);
    saveStoredShorts(updated);
    soundFX.playAddToCart();
    onShowToast(isAr ? 'تمت إضافة الفيديو بنجاح إلى واجهة المتجر!' : 'Video added successfully to store!');

    // Reset form
    setNewVideoUrl('');
    setNewVideoTitleAr('');
    setNewVideoTitleEn('');
    setNewVideoCaptionAr('');
    setNewVideoCaptionEn('');
    setNewVideoThumbnailUrl('');
    setNewVideoProductId('');
    setIsAddingVideo(false);
  };

  // Delete Short Video
  const handleDeleteShortVideo = (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الفيديو من واجهة المتجر؟' : 'Delete this video?')) return;
    const updated = shorts.filter((s) => s.id !== id);
    onUpdateShorts(updated);
    saveStoredShorts(updated);
    soundFX.playAddToCart();
    onShowToast(isAr ? 'تم حذف الفيديو من المتجر' : 'Video deleted');
  };

  // Save Quick Product External Images
  const handleSaveProductExternalImages = () => {
    if (!selectedProduct) return;

    const sanitizedCover = sanitizeImageUrl(productCoverUrl.trim()).url || FALLBACK_PRODUCT_IMAGE;
    const validGallery = productGalleryUrls
      .map((u) => sanitizeImageUrl(u.trim()).url)
      .filter((u) => Boolean(u));

    const updatedProduct: Product = {
      ...selectedProduct,
      image: sanitizedCover,
      images: validGallery.length > 0 ? validGallery : [sanitizedCover],
    };

    const updatedProducts = products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p));
    onUpdateProducts(updatedProducts);
    saveStoredProducts(updatedProducts);
    soundFX.playAddToCart();
    onShowToast(
      isAr
        ? `تم تحديث صور المنتج (${selectedProduct.nameAr || selectedProduct.name}) وتطبيقها فوراً في المتجر!`
        : `Product images updated and applied dynamically!`
    );
  };

  // Universal URL Tester Handler
  const handleTestUrl = () => {
    const trimmed = testerUrl.trim();
    if (!trimmed) {
      setTestedMediaType(null);
      setTestWarning(null);
      return;
    }

    const ytId = getYouTubeId(trimmed);
    if (ytId) {
      setTestedMediaType('video');
      setTestWarning(null);
      return;
    }

    const sanitized = sanitizeImageUrl(trimmed);
    if (sanitized.isPinterestWebpage) {
      setTestedMediaType('invalid');
      setTestWarning(sanitized.warning || (isAr ? 'رابط صفحة وليس صورة مباشرة' : 'Webpage link, not direct image'));
      return;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
      setTestedMediaType('image');
      setTestWarning(null);
      return;
    }

    setTestedMediaType('invalid');
    setTestWarning(isAr ? 'الرابط غير صالح، يرجى إدخال رابط يبدأ بـ https://' : 'Invalid URL');
  };

  // Apply tested URL directly to category
  const handleApplyTesterToCategory = (catKey: keyof CategoryImagesConfig) => {
    if (!testerUrl.trim()) return;
    handleSaveCategoryImage(catKey, testerUrl.trim());
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white">
                {isAr ? 'التحكم في روابط الصور والفيديوهات للواجهة' : 'UI External Media & Video Links Controller'}
              </h2>
              <span className="text-[10px] font-bold bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20">
                {isAr ? 'تحديث ديناميكي فوري' : 'Live Dynamic Sync'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'تحكم كامل ومباشر في صور الأقسام، وفيديوهات يوتيوب والشورتس، وبانرات الواجهة العلوية، وصور المنتجات عبر روابط خارجية من الإنترنت أو رفع الصور من جهازك مع التحديث المباشر للمتجر بدون الحاجة لإعادة البناء.'
                : 'Full control over category images, YouTube video shorts, hero banners, and product catalog images using external web links or local file uploads with instant real-time sync.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetCategoryImages}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-neutral-700 active:scale-95"
              title={isAr ? 'استعادة صور الأقسام الافتراضية' : 'Restore Default Images'}
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isAr ? 'استعادة الافتراضيات' : 'Reset Defaults'}</span>
            </button>
          </div>
        </div>

        {/* Media Manager Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setMediaTab('categories');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mediaTab === 'categories'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isAr ? 'صور أقسام المتجر (5 أقسام)' : 'Category Images (5)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setMediaTab('videos');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mediaTab === 'videos'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{isAr ? `فيديوهات يوتيوب والشورتس (${shorts.length})` : `YouTube Shorts (${shorts.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setMediaTab('products');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mediaTab === 'products'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'تحديث صور المنتجات سريعا' : 'Quick Product Images'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setMediaTab('tester');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mediaTab === 'tester'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'فاحص ومعاين الروابط الخارجية' : 'URL Tester & Deployer'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CATEGORY BACKGROUND IMAGES */}
      {/* ========================================================================= */}
      {mediaTab === 'categories' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Category Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {categoryMetadata.map((cat) => {
              const isSelected = editingCategory === cat.key;
              const imgUrl = categoryImages[cat.key];

              return (
                <div
                  key={cat.key}
                  onClick={() => {
                    setEditingCategory(cat.key);
                    setCategoryUrlInput(categoryImages[cat.key]);
                  }}
                  className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                    isSelected
                      ? 'border-amber-400 bg-neutral-800/90 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'border-neutral-800 bg-neutral-900/90 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-700">
                        {cat.icon}
                      </div>
                      <span className="text-xs font-black text-white leading-tight">
                        {isAr ? cat.nameAr : cat.nameEn}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                    )}
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="relative w-full h-28 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 mb-2">
                    <img
                      src={imgUrl}
                      alt={cat.nameAr}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 right-2 rtl:right-auto rtl:left-2 text-[9px] font-mono text-neutral-300 bg-black/60 px-1.5 py-0.5 rounded">
                      {cat.key}
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-400 line-clamp-1">
                    {cat.descriptionAr}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Category Edit Form Panel */}
          {editingCategory && (
            <div className="bg-neutral-900 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <span>{isAr ? 'تعديل صورة قسم:' : 'Edit Category Image:'}</span>
                      <span className="text-amber-400">
                        {categoryMetadata.find((c) => c.key === editingCategory)?.[isAr ? 'nameAr' : 'nameEn']}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {isAr
                        ? 'أدخل رابط الصورة الخارجي المباشر من الإنترنت، أو ارفع صورة مباشرة من معرض جهازك.'
                        : 'Enter direct external web URL or upload an image file from your device.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={categoryFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadCategoryImageFile(e, editingCategory)}
                  />
                  <button
                    type="button"
                    onClick={() => categoryFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAr ? '📸 رفع صورة من الجهاز' : 'Upload from Device'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Inputs Left / Right based on dir */}
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      {isAr ? 'رابط الصورة الخارجي (External Image URL):' : 'External Image URL:'}
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={categoryUrlInput}
                        onChange={(e) => setCategoryUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/... or https://i.pinimg.com/..."
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-neutral-600 outline-none transition-colors"
                      />
                      {categoryUrlInput && (
                        <button
                          type="button"
                          onClick={() => setCategoryUrlInput('')}
                          className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isAr
                        ? 'يدعم جميع روابط الصور المباشرة (Unsplash, Pexels, Imgur, Cloudinary, وغيرها).'
                        : 'Supports all direct image links (Unsplash, Pexels, Imgur, Cloudinary, etc).'}
                    </p>
                  </div>

                  {/* Pinterest warning if user pasted webpage */}
                  {sanitizeImageUrl(categoryUrlInput).isPinterestWebpage && (
                    <div className="p-3 bg-amber-950/40 border border-amber-600/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <span>{sanitizeImageUrl(categoryUrlInput).warning}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveCategoryImage(editingCategory)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isAr ? 'حفظ وتحديث القسم فوراً' : 'Save & Update Category'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultImg = DEFAULT_CATEGORY_IMAGES[editingCategory];
                        setCategoryUrlInput(defaultImg);
                        handleSaveCategoryImage(editingCategory, defaultImg);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{isAr ? 'استعادة الصورة الافتراضية لهذا القسم' : 'Reset to Default'}</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Column */}
                <div className="lg:col-span-4">
                  <span className="block text-xs font-bold text-neutral-400 mb-2">
                    {isAr ? 'معاينة حية للصورة:' : 'Live Image Preview:'}
                  </span>
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-inner group">
                    <img
                      src={categoryUrlInput || FALLBACK_PRODUCT_IMAGE}
                      alt="Category Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <span className="text-white font-extrabold text-sm">
                        {categoryMetadata.find((c) => c.key === editingCategory)?.[isAr ? 'nameAr' : 'nameEn']}
                      </span>
                      <span className="text-[10px] text-amber-300">
                        {isAr ? 'ظهور مباشر في قسم التصفح' : 'Displayed in Store Category Section'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: YOUTUBE SHORTS & UI VIDEOS */}
      {/* ========================================================================= */}
      {mediaTab === 'videos' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Video Button Bar */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isAr ? 'فيديوهات وشورتس واجهة المتجر' : 'Storefront YouTube Shorts & Videos'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'إضافة فيديوهات مراجعة واستعراض الأجهزة المعروضة في قسم الشورتس بالصفحة الرئيسية.'
                  : 'Manage showcase video shorts displayed on the homepage shorts carousel.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingVideo(!isAddingVideo)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all cursor-pointer active:scale-95 shadow-lg shadow-amber-500/20"
            >
              {isAddingVideo ? '✕' : <Plus className="w-4 h-4" />}
              <span>{isAddingVideo ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? 'إضافة فيديو جديد' : 'Add New Video')}</span>
            </button>
          </div>

          {/* New Video Form */}
          {isAddingVideo && (
            <form
              onSubmit={handleAddVideoShort}
              className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'إضافة فيديو يوتيوب أو شورتس جديد' : 'Add New YouTube Video / Short'}</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    {isAr ? 'رابط فيديو يوتيوب أو الشورتس *' : 'YouTube Video / Short URL *'}
                  </label>
                  <input
                    type="url"
                    required
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/... or https://youtu.be/..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {isAr ? 'مثال: https://youtube.com/shorts/Ues_BxS8v-s' : 'Example: https://youtube.com/shorts/Ues_BxS8v-s'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    {isAr ? 'ربط بمنتج محدد (اختياري)' : 'Link to Product (Optional)'}
                  </label>
                  <select
                    value={newVideoProductId}
                    onChange={(e) => setNewVideoProductId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="">{isAr ? '-- بدون ربط منتج --' : '-- No linked product --'}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameAr || p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    {isAr ? 'عنوان الفيديو بالعربية *' : 'Video Title (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newVideoTitleAr}
                    onChange={(e) => setNewVideoTitleAr(e.target.value)}
                    placeholder="مثال: استعراض آيفون 16 برو تيتانيوم"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    {isAr ? 'عنوان الفيديو بالإنجليزية' : 'Video Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={newVideoTitleEn}
                    onChange={(e) => setNewVideoTitleEn(e.target.value)}
                    placeholder="e.g. iPhone 16 Pro Titanium Showcase"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    {isAr ? 'وصف أو تفاصيل المقطع' : 'Video Description / Caption'}
                  </label>
                  <textarea
                    rows={2}
                    value={newVideoCaptionAr}
                    onChange={(e) => setNewVideoCaptionAr(e.target.value)}
                    placeholder="تفاصيل المقطع أو نص الإعلان..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'إضافة الفيديو ونشره في الواجهة' : 'Publish Video'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Videos Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shorts.map((item) => {
              const ytId = item.youtubeId || getYouTubeId(item.shortsUrl);
              const thumb = item.productImage || (ytId ? getYouTubeThumbnail(ytId) : FALLBACK_PRODUCT_IMAGE);
              const isPlaying = previewVideoId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg group hover:border-neutral-700 transition-all"
                >
                  {/* Video Player or Thumbnail */}
                  <div className="relative w-full aspect-video bg-black overflow-hidden">
                    {isPlaying && ytId ? (
                      <iframe
                        src={getYouTubeEmbedUrl(ytId, { autoplay: true })}
                        title={item.titleAr}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={thumb}
                          alt={item.titleAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewVideoId(item.id)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </button>
                      </>
                    )}
                    <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                      YouTube
                    </span>
                  </div>

                  {/* Content Info */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white line-clamp-1 mb-1">
                        {isAr ? item.titleAr : item.titleEn || item.titleAr}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {item.captionAr}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                      <a
                        href={item.shortsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-amber-400 inline-flex items-center gap-1 font-mono text-[10px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>فتح الرابط</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteShortVideo(item.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40 cursor-pointer"
                        title={isAr ? 'حذف الفيديو' : 'Delete Video'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: QUICK PRODUCT EXTERNAL IMAGES */}
      {/* ========================================================================= */}
      {mediaTab === 'products' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'تحديث وتعيين صور أي منتج عبر روابط خارجية' : 'Quick Product External Image URLs'}</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isAr
                ? 'اختر أي منتج من المتجر وضع روابط الصور الخارجية المباشرة لتحديثه فوراً وبدون الحاجة لفتح نافذة تعديل المنتج بالكامل.'
                : 'Select any product from the catalog and paste direct external image URLs to update its images dynamically.'}
            </p>
          </div>

          {/* Product Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                {isAr ? 'اختر المنتج المراد تعديل صوره:' : 'Select Product:'}
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const prod = products.find((p) => p.id === e.target.value);
                  if (prod) handleSelectProduct(prod);
                }}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameAr || p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <img
                  src={selectedProduct.image || FALLBACK_PRODUCT_IMAGE}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0"
                />
                <div>
                  <span className="text-xs font-black text-white block">
                    {selectedProduct.nameAr || selectedProduct.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {selectedProduct.brand} • {selectedProduct.category}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cover & Gallery Inputs */}
          {selectedProduct && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  {isAr ? 'رابط الصورة الأساسية (Primary Cover URL) *:' : 'Primary Cover Image URL *:'}
                </label>
                <input
                  type="url"
                  value={productCoverUrl}
                  onChange={(e) => setProductCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>

              {/* 4 Gallery Inputs */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-2">
                  {isAr ? 'روابط الصور الإضافية للمعرض (Gallery Image URLs):' : 'Gallery Image URLs (1 - 4):'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productGalleryUrls.map((url, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[10px] font-bold text-neutral-500">
                        {isAr ? `صورة إضافية رقم ${idx + 1}` : `Gallery Image ${idx + 1}`}
                      </span>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const updated = [...productGalleryUrls];
                          updated[idx] = e.target.value;
                          setProductGalleryUrls(updated);
                        }}
                        placeholder={`https://...`}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Preview Strip */}
              <div>
                <span className="block text-xs font-bold text-neutral-400 mb-2">
                  {isAr ? 'معاينة صور المنتج الحالية والمعدلة:' : 'Product Images Preview:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-950 border border-amber-400/50">
                    <img
                      src={productCoverUrl || FALLBACK_PRODUCT_IMAGE}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE)}
                    />
                    <span className="absolute bottom-1 right-1 bg-amber-500 text-neutral-950 text-[8px] font-bold px-1 rounded">
                      غلاف
                    </span>
                  </div>

                  {productGalleryUrls.filter(Boolean).map((gUrl, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                      <img
                        src={gUrl}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleSaveProductExternalImages}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'تطبيق وتحديث صور المنتج في المتجر فوراً' : 'Save & Update Product Images'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: UNIVERSAL EXTERNAL URL TESTER & QUICK DEPLOY */}
      {/* ========================================================================= */}
      {mediaTab === 'tester' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'فاحص ومعاين الروابط الخارجية وتطبيقها السريع' : 'Universal URL Tester & Quick Deployer'}</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isAr
                ? 'الصق أي رابط صورة أو فيديو خارجي من أي موقع بالإنترنت لمعاينته والتحقق من صحته، ثم تطبيقه بضغطة زر واحدة على أي قسم أو كفيديو.'
                : 'Paste any external image or video URL to verify and test it live, then assign it with 1-click.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={testerUrl}
                onChange={(e) => {
                  setTesterUrl(e.target.value);
                  setTestedMediaType(null);
                  setTestWarning(null);
                }}
                placeholder="https://..."
                className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleTestUrl}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all cursor-pointer shrink-0"
              >
                <Eye className="w-4 h-4" />
                <span>{isAr ? 'معاينة وفحص الرابط' : 'Inspect & Test'}</span>
              </button>
            </div>

            {testWarning && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{testWarning}</span>
              </div>
            )}
          </div>

          {/* Test Preview Result */}
          {testedMediaType && (
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>
                    {testedMediaType === 'video'
                      ? (isAr ? 'تم التحقق: رابط فيديو يوتيوب صالح' : 'Verified: Valid YouTube Video')
                      : (isAr ? 'تم التحقق: رابط صورة مباشر صالح' : 'Verified: Valid Image URL')}
                  </span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400 truncate max-w-xs">
                  {testerUrl}
                </span>
              </div>

              {/* Render Preview */}
              <div className="max-w-md mx-auto aspect-video rounded-xl overflow-hidden bg-black border border-neutral-800">
                {testedMediaType === 'video' ? (
                  <iframe
                    src={getYouTubeEmbedUrl(getYouTubeId(testerUrl) || '', { autoplay: false })}
                    title="Preview"
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={testerUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setTestedMediaType('invalid');
                      setTestWarning(isAr ? 'فشل تحميل الصورة من هذا الرابط، يرجى التأكد من الرابط المباشر' : 'Failed to load image from URL');
                    }}
                  />
                )}
              </div>

              {/* Quick Deploy Buttons */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-400 block">
                  {isAr ? 'تطبيق هذا الرابط مباشرة على:' : 'Deploy this URL directly to:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyTesterToCategory('phones')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isAr ? 'قسم الهواتف 📱' : 'Phones Category'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTesterToCategory('audio')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>{isAr ? 'قسم السماعات 🎧' : 'Audio Category'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTesterToCategory('cases')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{isAr ? 'قسم الكفرات 🛡️' : 'Cases Category'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTesterToCategory('chargers')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isAr ? 'قسم الشواحن ⚡' : 'Chargers Category'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTesterToCategory('cables')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Cable className="w-3.5 h-3.5" />
                    <span>{isAr ? 'قسم الكيابل 🔌' : 'Cables Category'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
