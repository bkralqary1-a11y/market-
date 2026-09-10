import { useState, type FormEvent } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Cpu,
  Info,
  Video,
  Play,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Language, Currency, Review } from '../types';
import { mockReviews, mockProducts, formatPrice } from '../data/mockData';
import { triggerFlyToCart } from './FlyingCartAnimation';
import ProductCard from './ProductCard';
import { getYouTubeId, getYouTubeEmbedUrl } from '../utils/videoUtils';

interface ProductDetailViewProps {
  product: Product;
  language: Language;
  currency: Currency;
  onBack: () => void;
  onAddToCart: (product: Product, variant: string, color: string, quantity: number) => void;
  onQuickOrder?: (product: Product, variant: string, color: string, quantity: number) => void;
  onSelectRelated: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (productId: string) => void;
}

export default function ProductDetailView({
  product,
  language,
  currency,
  onBack,
  onAddToCart,
  onQuickOrder,
  onSelectRelated,
  isWishlisted,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
}: ProductDetailViewProps) {
  const isAr = language === 'ar';

  const [activeImage, setActiveImage] = useState<string>(product.images[0] || product.image);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || '#0f172a');
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants.options[0] || 'الأساسي'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews' | 'warranty'>('desc');
  const [reviewsList, setReviewsList] = useState<Review[]>(mockReviews);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [addedAlert, setAddedAlert] = useState(false);
  const [mediaMode, setMediaMode] = useState<'photo' | 'video'>('photo');

  // Price adjustment for higher variants
  const variantIndex = product.variants.options.indexOf(selectedVariant);
  const variantPriceExtra = variantIndex > 0 ? variantIndex * (product.price > 2000 ? 500 : 40) : 0;
  const currentPrice = product.price + variantPriceExtra;
  const installment4 = Math.round(currentPrice / 4);

  const handleAdd = () => {
    const mainImg = document.getElementById('product-detail-main-img');
    triggerFlyToCart({
      imageUrl: activeImage || product.image,
      productName: isAr ? product.nameAr : product.name,
      sourceElement: mainImg,
    });
    onAddToCart(product, selectedVariant, selectedColor, quantity);
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2000);
  };

  const handleQuickOrder = () => {
    const mainImg = document.getElementById('product-detail-main-img');
    triggerFlyToCart({
      imageUrl: activeImage || product.image,
      productName: isAr ? product.nameAr : product.name,
      sourceElement: mainImg,
    });
    if (onQuickOrder) {
      onQuickOrder(product, selectedVariant, selectedColor, quantity);
    } else {
      onAddToCart(product, selectedVariant, selectedColor, quantity);
    }
  };

  const handleAddReview = (e: FormEvent) => {
    e.preventDefault();
    if (newReviewAuthor.trim() && newReviewComment.trim()) {
      const newRev: Review = {
        id: `rev-${Date.now()}`,
        author: newReviewAuthor,
        rating: newReviewRating,
        date: isAr ? 'الآن' : 'Just now',
        comment: newReviewComment,
        commentAr: newReviewComment,
        verifiedPurchase: true,
      };
      setReviewsList([newRev, ...reviewsList]);
      setNewReviewAuthor('');
      setNewReviewComment('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
    }
  };

  // Related products from same category or popular
  const relatedProducts = mockProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div id="product-detail-page" className="py-10 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back navigation & Category indicator */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-line text-xs font-bold text-gray-500">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? 'العودة للمتجر والكتالوج' : 'Back to Catalog'}</span>
          </button>

          <span className="font-mono text-gray-400">SKU: {product.sku}</span>
        </div>

        {/* Product Hero Details Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-line shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Gallery Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Media Mode Tabs: Photos vs Real Video */}
              {product.videoUrl && (
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                  <button
                    onClick={() => setMediaMode('photo')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      mediaMode === 'photo'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{isAr ? `معرض الصور (${product.images?.length || 1})` : `Photos (${product.images?.length || 1})`}</span>
                  </button>

                  <button
                    onClick={() => setMediaMode('video')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      mediaMode === 'video'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-current animate-pulse" />
                    <span>{isAr ? 'فيديو حقيقي بدقة 8K' : 'Real 8K Video'}</span>
                  </button>
                </div>
              )}

              {/* Main Media Showcase Container */}
              <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-line relative p-4 group">
                {mediaMode === 'photo' ? (
                  <>
                    <img
                      id="product-detail-main-img"
                      src={activeImage}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Brand Logo Floating */}
                    <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-tech-dark text-white text-xs font-mono font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">
                      {product.brand}
                    </div>

                    {/* 2-Year Warranty Badge */}
                    <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{product.warrantyYears} {isAr ? 'سنوات ضمان رسمي' : 'Years Warranty'}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center relative">
                    {(() => {
                      const ytId = getYouTubeId(product.videoUrl);
                      if (ytId) {
                        return (
                          <div className="w-full h-full relative flex items-center justify-center">
                            <iframe
                              src={getYouTubeEmbedUrl(ytId, {
                                autoplay: true,
                                mute: false,
                                controls: true,
                                loop: true,
                              })}
                              title={product.name}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                            {/* Watch on YouTube direct link */}
                            <a
                              href={product.videoUrl || `https://youtube.com/shorts/${ytId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-20 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-[11px] font-bold border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                              <span>{isAr ? 'فتح على يوتيوب' : 'Open in YouTube'}</span>
                            </a>
                          </div>
                        );
                      }
                      return (
                        <video
                          src={product.videoUrl}
                          poster={activeImage}
                          autoPlay
                          controls
                          loop
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Thumbnails Strip (Scrollable for 6+ images) */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveImage(img);
                        setMediaMode('photo');
                      }}
                      className={`w-16 h-16 sm:w-18 sm:h-18 shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-0.5 bg-gray-50 ${
                        activeImage === img && mediaMode === 'photo'
                          ? 'border-primary ring-2 ring-primary/20 scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${i}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Pinterest Integration Button & Source Badge */}
              {product.pinterestUrl && (
                <a
                  href={product.pinterestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200 text-[#E60023] transition-all shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#E60023] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.97-.1-2.47.02-3.53.11-.97.74-6.3.74-6.3s-.19-.38-.19-.94c0-.88.51-1.54 1.15-1.54.54 0 .8.41.8.9 0 .55-.35 1.37-.53 2.13-.15.64.32 1.15.95 1.15 1.14 0 2.02-1.2 2.02-2.94 0-1.54-1.1-2.61-2.68-2.61-1.83 0-2.9 1.37-2.9 2.79 0 .55.21 1.14.48 1.46.05.06.06.12.04.18l-.18.73c-.03.11-.1.14-.22.08-1-.46-1.62-1.92-1.62-3.1 0-2.52 1.83-4.84 5.28-4.84 2.77 0 4.93 1.98 4.93 4.62 0 2.76-1.74 4.98-4.15 4.98-.81 0-1.57-.42-1.84-.91l-.5 1.9c-.18.7-.67 1.58-1 2.11A11.96 11.96 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        {isAr ? 'تصفح المزيد من الصور والأفكار على Pinterest' : 'Explore more photos & pins on Pinterest'}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {isAr ? 'معرض صور عالي الدقة وريفيوهات ملهمة' : 'Curated high-res galleries & video clips'}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#E60023] transition-colors" />
                </a>
              )}
            </div>

            {/* Product Configuration Column (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                {/* Category & Rating */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="font-bold text-primary uppercase tracking-wider">
                    {isAr ? product.categoryNameAr : product.categoryNameEn}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-gray-400 font-sans">({product.reviewsCount} {isAr ? 'تقييم موثق' : 'verified reviews'})</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-3xl font-black text-gray-dark tracking-tight leading-snug mb-3">
                  {isAr ? product.nameAr : product.name}
                </h1>

                {/* Product Description - Always visible and prominently placed */}
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-sky-50/50 border border-orange-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 mb-1.5">
                    <Info className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>{isAr ? 'وصف المنتج ومميزاته الرسمية:' : 'Product Overview & Key Features:'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                    {isAr ? product.descriptionAr : product.description}
                  </p>
                </div>

                {/* Price & Installments Callout */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-line mb-5">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl font-black text-gray-dark font-mono">
                      {formatPrice(currentPrice, currency, isAr)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through font-mono">
                        {formatPrice(product.originalPrice + variantPriceExtra, currency, isAr)}
                      </span>
                    )}
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                      {isAr ? 'شامل ضريبة القيمة المضافة 15%' : 'VAT Included'}
                    </span>
                  </div>

                  {/* Tabby & Tamara Installment Banner */}
                  <div className="flex items-center justify-between text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>{isAr ? `قسطها على 4 دفعات بقيمة ${formatPrice(installment4, currency, isAr)} بدون أي فوائد` : `Or 4 interest-free payments of ${formatPrice(installment4, currency, isAr)}`}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-black text-[10px]">
                      <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">tabby</span>
                      <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">tamara</span>
                    </div>
                  </div>
                </div>

                {/* Colors Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700">
                        {isAr ? 'اللون والتشطيب:' : 'Color Finish:'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((c, i) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all ${
                            selectedColor === c
                              ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/20'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: c }}
                          />
                          <span>{product.colorNamesAr?.[i] || c}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants Selection (Storage / Wattage / Length) */}
                {product.variants?.options && (
                  <div className="mb-6">
                    <span className="text-xs font-bold text-gray-700 block mb-2">
                      {isAr ? product.variants.titleAr : product.variants.titleEn}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariant(opt)}
                          className={`text-xs font-bold px-4 py-2 rounded-xl border-2 transition-all font-mono ${
                            selectedVariant === opt
                              ? 'border-primary bg-primary text-white shadow-md'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Add to Cart, Stepper, Wishlist, Compare */}
              <div className="space-y-4 pt-4 border-t border-gray-line">
                <div className="flex flex-wrap gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-3 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 font-mono font-bold text-sm text-gray-dark">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-3 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    onClick={handleAdd}
                    id="product-detail-add-to-cart-btn"
                    className="flex-1 min-w-[180px] bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3.5 px-5 rounded-2xl transition-all shadow-md hover:shadow-orange-500/25 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98 cursor-pointer ring-2 ring-orange-400/20"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>{isAr ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
                  </button>

                  {/* One-Click Quick Order CTA */}
                  <button
                    onClick={handleQuickOrder}
                    id="product-detail-quick-order-btn"
                    className="flex-1 min-w-[180px] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-3.5 px-5 rounded-2xl transition-all shadow-md hover:shadow-emerald-600/30 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98 cursor-pointer group"
                    title={isAr ? 'طلب فوري بضغطة واحدة وفتح الفاتورة للواتساب' : 'Quick Order via WhatsApp Invoice'}
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
                    <span>{isAr ? 'طلب سريع فوري ⚡' : 'Quick Order ⚡'}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isWishlisted
                        ? 'border-rose-500 bg-rose-50 text-rose-600'
                        : 'border-gray-200 bg-white text-gray-500 hover:text-rose-500'
                    }`}
                    title={isAr ? 'المفضلة' : 'Wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                  </button>

                  {/* Compare Button */}
                  {onToggleCompare && (
                    <button
                      onClick={() => onToggleCompare(product.id)}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        isCompared
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-600'
                          : 'border-gray-200 bg-white text-gray-500 hover:text-cyan-600'
                      }`}
                      title={isAr ? 'مقارنة المواصفات' : 'Compare'}
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {addedAlert && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-in zoom-in-95">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'تمت إضافة المنتج بنجاح إلى سلة الشراء!' : 'Item added to your shopping cart!'}</span>
                  </div>
                )}

                {/* Trust Row */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-line">
                    <Truck className="w-4 h-4 text-primary shrink-0" />
                    <span>{isAr ? 'توصيل خلال 24-48 ساعة' : 'Fast 24-48h Dispatch'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-line">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isAr ? 'ضمان رسمي سنتين' : '2-Year Warranty'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-line">
                    <RotateCcw className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>{isAr ? 'استرجاع مجاني 14 يوماً' : '14-Day Free Returns'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs & Details Tabs */}
        <div className="bg-white rounded-3xl border border-gray-line shadow-sm overflow-hidden mb-12">
          <div className="flex border-b border-gray-line bg-gray-50 px-6 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'specs' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-dark'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'المواصفات التقنية الدقيقة' : 'Technical Specifications'}</span>
            </button>
            <button
              onClick={() => setActiveTab('desc')}
              className={`py-3.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'desc' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-dark'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>{isAr ? 'الوصف والمميزات' : 'Overview & Features'}</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'reviews' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-dark'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>{isAr ? `آراء المشترين (${reviewsList.length})` : `Reviews (${reviewsList.length})`}</span>
            </button>
            <button
              onClick={() => setActiveTab('warranty')}
              className={`py-3.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'warranty' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-dark'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'الضمان وخدمات ما بعد البيع' : 'Warranty & Support'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 text-xs sm:text-sm">
            {/* Tab 1: Specs Table */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-gray-dark text-base mb-4">
                  {isAr ? 'جدول المواصفات والخصائص الهندسية:' : 'Hardware Specification Table:'}
                </h3>
                <div className="divide-y divide-gray-100 border border-gray-line rounded-2xl overflow-hidden">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-gray-50">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px] sm:w-1/3">
                        {key === 'processor' ? isAr ? 'المعالج' : 'Processor'
                          : key === 'screen' ? isAr ? 'الشاشة والسطوع' : 'Display'
                          : key === 'camera' ? isAr ? 'الكاميرات والتصوير' : 'Cameras'
                          : key === 'battery' ? isAr ? 'البطارية والشحن' : 'Battery & Charging'
                          : key === 'power' ? isAr ? 'القدرة والمنافذ' : 'Power Ports'
                          : key === 'speed' ? isAr ? 'سرعة النقل' : 'Data Speed'
                          : key === 'material' ? isAr ? 'الخامات والتصميم' : 'Materials'
                          : key}
                      </span>
                      <span className="font-semibold text-gray-dark sm:w-2/3 leading-relaxed">
                        {isAr ? val.ar : val.en}
                      </span>
                    </div>
                  ))}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-gray-50">
                    <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px] sm:w-1/3">
                      {isAr ? 'الضمان المعتمد' : 'Warranty'}
                    </span>
                    <span className="font-bold text-emerald-700 sm:w-2/3">
                      {product.warrantyYears} {isAr ? 'سنوات ضمان حاسبات العرب والوكيل الرسمي' : 'Years official authorized warranty'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Overview Description */}
            {activeTab === 'desc' && (
              <div className="space-y-4 leading-relaxed text-gray-600">
                <p className="text-sm font-semibold text-gray-800">
                  {isAr ? product.descriptionAr : product.description}
                </p>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 text-xs text-primary font-medium">
                  {isAr
                    ? 'جميع الهواتف والملحقات المعروضة في متجر صدام العقاري للإلكترونيات أصلية 100%، مستوردة من الوكلاء الرسميين مع الضمان المعتمد.'
                    : 'All devices and accessories at Saddam Al-Aqari Electronics are 100% genuine with official authorized warranty.'}
                </div>
              </div>
            )}

            {/* Tab 3: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Add Review Form */}
                <form onSubmit={handleAddReview} className="bg-gray-50 p-5 rounded-2xl border border-gray-line space-y-3">
                  <h4 className="font-bold text-gray-dark text-xs">{isAr ? 'أضف تقييمك وتجربتك للجهاز:' : 'Leave a verified review:'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'اسمك الكريم' : 'Your name'}
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{isAr ? 'التقييم:' : 'Rating:'}</span>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="p-2.5 rounded-xl border border-gray-300 bg-white text-xs font-mono font-bold"
                      >
                        <option value="5">★★★★★ (5/5)</option>
                        <option value="4">★★★★☆ (4/5)</option>
                        <option value="3">★★★☆☆ (3/5)</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder={isAr ? 'اكتب رأيك الصادق في سرعة الشحن وجودة المنتج...' : 'Your detailed feedback...'}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold px-6 py-2 rounded-xl text-xs shadow hover:bg-primary-hover"
                  >
                    {isAr ? 'نشر التقييم' : 'Post Review'}
                  </button>
                  {reviewSubmitted && (
                    <span className="text-emerald-600 font-bold text-xs mr-3">
                      {isAr ? 'شكراً لك! تم نشر تقييمك بنجاح.' : 'Review posted!'}
                    </span>
                  )}
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-gray-line space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-dark">{rev.author}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              {isAr ? 'مشتري موثق ✓' : 'Verified Buyer ✓'}
                            </span>
                          )}
                        </div>
                        <span className="text-amber-500 font-mono text-xs">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {isAr ? rev.commentAr : rev.comment}
                      </p>
                      <span className="text-[10px] text-gray-400 font-mono block">{rev.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Warranty */}
            {activeTab === 'warranty' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2">
                  <h4 className="font-black text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>{isAr ? 'شهادة الضمان الذهبي المعتمد لمدة عامين' : '2-Year Official Comprehensive Warranty'}</span>
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {isAr
                      ? 'يغطي الضمان كافة العيوب المصنعية والأعطال الفنية مع إمكانية استبدال الجهاز أو صيانته في أي مركز خدمة معتمد داخل المملكة ودول مجلس التعاون الخليجي.'
                      : 'Comprehensive coverage for all hardware and manufacturing defects across official GCC repair centers.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products from Same Category */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-black text-gray-dark mb-6 pb-2 border-b border-gray-line">
              {isAr ? 'منتجات وملحقات مشابهة قد تهمك' : 'Related Hardware & Accessories'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  language={language}
                  currency={currency}
                  onSelect={onSelectRelated}
                  onAddToCart={(prod, vr, col) => onAddToCart(prod, vr, col, 1)}
                  onQuickOrder={(prod, vr, col) => onQuickOrder ? onQuickOrder(prod, vr, col, 1) : onAddToCart(prod, vr, col, 1)}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </div>
        )}
        {/* Persistent Sticky Bottom Action Bar for Mobile - Add to Cart is NEVER lost */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md p-2.5 border-t border-gray-200 shadow-2xl flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-500 truncate">{isAr ? product.nameAr : product.name}</div>
            <div className="text-sm font-black text-gray-dark font-mono leading-tight">
              {formatPrice(currentPrice, currency, isAr)}
            </div>
          </div>
          <button
            onClick={handleAdd}
            id="mobile-sticky-add-to-cart-btn"
            className="bg-white hover:bg-orange-50 border border-orange-200 text-orange-700 font-bold py-2.5 px-3 rounded-xl shadow-xs flex items-center gap-1.5 text-xs active:scale-95 shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
            <span>{isAr ? 'إضافة' : 'Add'}</span>
          </button>
          <button
            onClick={handleQuickOrder}
            id="mobile-sticky-quick-order-btn"
            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md flex items-center gap-1.5 text-xs active:scale-95 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{isAr ? 'طلب سريع ⚡' : 'Quick Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
