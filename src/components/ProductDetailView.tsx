import { useState, type FormEvent } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  Zap,
  Cpu,
  Info,
  Video,
  ExternalLink,
  Image as ImageIcon,
  Smartphone,
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
  const [imgFailed, setImgFailed] = useState(false);
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

  const variantIndex = product.variants.options.indexOf(selectedVariant);
  const variantPriceExtra = variantIndex > 0 ? variantIndex * (product.price > 2000 ? 500 : 40) : 0;
  const currentPrice = product.price + variantPriceExtra;

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

  const relatedProducts = mockProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div id="product-detail-page" className="py-8 sm:py-10 pb-24 lg:pb-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/60 text-xs font-bold text-slate-600">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 hover:text-[#0071e3] transition-colors cursor-pointer"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? 'العودة للمتجر والكتالوج' : 'Back to Catalog'}</span>
          </button>

          <span className="font-mono text-slate-500">SKU: {product.sku}</span>
        </div>

        {/* Main Liquid Glass Product Showcase */}
        <div className="liquid-glass-strong rounded-[32px] p-5 sm:p-8 lg:p-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Gallery Column */}
            <div className="lg:col-span-5 space-y-4">
              {product.videoUrl && (
                <div className="liquid-glass-capsule inline-flex items-center gap-1 p-1 rounded-2xl">
                  <button
                    onClick={() => setMediaMode('photo')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      mediaMode === 'photo'
                        ? 'liquid-btn-primary text-white'
                        : 'text-slate-600 hover:text-[#0b1220]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>
                      {isAr
                        ? `الصور (${product.images?.length || 1})`
                        : `Photos (${product.images?.length || 1})`}
                    </span>
                  </button>

                  <button
                    onClick={() => setMediaMode('video')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      mediaMode === 'video'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-[#0b1220]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{isAr ? 'فيديو حقيقي' : 'Product Video'}</span>
                  </button>
                </div>
              )}

              {/* Image Stage */}
              <div className="aspect-square liquid-glass-subtle rounded-[26px] overflow-hidden relative p-4 group flex items-center justify-center">
                {mediaMode === 'photo' ? (
                  <>
                    {!imgFailed ? (
                      <img
                        id="product-detail-main-img"
                        src={activeImage}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        onError={() => setImgFailed(true)}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Smartphone className="w-16 h-16 opacity-60" />
                        <span className="text-xs font-bold">{product.brand}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center relative">
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
                            <a
                              href={product.videoUrl || `https://youtube.com/shorts/${ytId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-20 px-3 py-1.5 rounded-xl liquid-glass-dark text-white text-[11px] font-bold flex items-center gap-1.5"
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

              {/* Thumbnails Strip */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveImage(img);
                        setImgFailed(false);
                        setMediaMode('photo');
                      }}
                      className={`w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-0.5 bg-white/70 cursor-pointer ${
                        activeImage === img && mediaMode === 'photo'
                          ? 'border-[#0071e3] ring-2 ring-[#0071e3]/20 scale-105'
                          : 'border-white/70 hover:border-[#0071e3]/40'
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
            </div>

            {/* Configuration Column */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                {/* Clean Unboxed Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-[#0071e3] uppercase font-mono">{product.brand}</span>
                    <span>·</span>
                    <span>{isAr ? product.categoryNameAr : product.categoryNameEn}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold font-mono tabular-nums">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-500 font-sans">
                      ({product.reviewsCount} {isAr ? 'تقييم' : 'reviews'})
                    </span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-[#0b1220] tracking-tight leading-snug mb-3">
                  {isAr ? product.nameAr : product.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  {isAr ? product.descriptionAr : product.description}
                </p>

                {/* Price & Trust Block */}
                <div className="p-4 sm:p-5 rounded-2xl liquid-glass-subtle mb-5 space-y-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-[#0b1220] font-mono tabular-nums">
                      {formatPrice(currentPrice, currency, isAr)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                        {formatPrice(product.originalPrice + variantPriceExtra, currency, isAr)}
                      </span>
                    )}
                    <span className="text-xs text-emerald-700 font-bold">
                      · {isAr ? 'متوفر فوري' : 'In Stock'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700 pt-2 border-t border-white/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">
                      {isAr
                        ? `منتج أصلي 100% معتمد مع ضمان ${product.warrantyYears} سنوات وفاتورة رسمية`
                        : `100% Certified Original with ${product.warrantyYears}-Year Official Warranty`}
                    </span>
                  </div>
                </div>

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-5">
                    <span className="text-xs font-extrabold text-slate-700 block mb-2">
                      {isAr ? 'اللون والتشطيب:' : 'Color Finish:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c, i) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                            selectedColor === c
                              ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                              : 'border-white/80 bg-white/60 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: c }}
                          />
                          <span>{product.colorNamesAr?.[i] || c}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants Selection */}
                {product.variants?.options && (
                  <div className="mb-6">
                    <span className="text-xs font-extrabold text-slate-700 block mb-2">
                      {isAr ? product.variants.titleAr : product.variants.titleEn}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariant(opt)}
                          className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all font-mono cursor-pointer ${
                            selectedVariant === opt
                              ? 'liquid-btn-primary border-transparent text-white'
                              : 'border-white/80 bg-white/60 text-slate-700 hover:bg-white'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-white/60">
                <div className="flex flex-wrap gap-3">
                  {/* Stepper */}
                  <div className="flex items-center liquid-glass-subtle rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-3 hover:bg-white/60 text-slate-700 font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 font-mono tabular-nums font-bold text-sm text-[#0b1220]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3.5 py-3 hover:bg-white/60 text-slate-700 font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAdd}
                    id="product-detail-add-to-cart-btn"
                    className="liquid-btn-primary flex-1 min-w-[160px] font-extrabold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>{isAr ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
                  </button>

                  {/* Quick Order */}
                  <button
                    onClick={handleQuickOrder}
                    id="product-detail-quick-order-btn"
                    className="liquid-btn-emerald flex-1 min-w-[160px] font-extrabold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                    title={isAr ? 'طلب فوري وفتح الفاتورة للواتساب' : 'Quick Order via WhatsApp Invoice'}
                  >
                    <Zap className="w-4 h-4 text-white" />
                    <span>{isAr ? 'طلب سريع بالواتساب' : 'Quick WhatsApp Order'}</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'border-rose-400 bg-rose-50/90 text-rose-600'
                        : 'border-white/80 bg-white/65 text-slate-600 hover:text-rose-500'
                    }`}
                    title={isAr ? 'المفضلة' : 'Wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                  </button>

                  {/* Compare */}
                  {onToggleCompare && (
                    <button
                      onClick={() => onToggleCompare(product.id)}
                      className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                        isCompared
                          ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                          : 'border-white/80 bg-white/65 text-slate-600 hover:text-[#0071e3]'
                      }`}
                      title={isAr ? 'مقارنة المواصفات' : 'Compare'}
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {addedAlert && (
                  <div className="bg-emerald-50/90 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'تمت إضافة المنتج بنجاح إلى سلة الشراء!' : 'Item added to your cart!'}</span>
                  </div>
                )}

                {/* Clean Trust Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px] text-slate-600 font-semibold">
                  <div className="flex items-center gap-2 liquid-glass-subtle p-2.5 rounded-xl">
                    <Truck className="w-4 h-4 text-[#0071e3] shrink-0" />
                    <span>{isAr ? 'توصيل سريع 24-48 ساعة' : 'Fast 24-48h Delivery'}</span>
                  </div>
                  <div className="flex items-center gap-2 liquid-glass-subtle p-2.5 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isAr ? `ضمان رسمي ${product.warrantyYears} سنوات` : `${product.warrantyYears}-Year Warranty`}</span>
                  </div>
                  <div className="flex items-center gap-2 liquid-glass-subtle p-2.5 rounded-xl">
                    <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{isAr ? 'فحص واستبدال عند الاستلام' : 'Inspect on Delivery'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs & Details Tabs */}
        <div className="liquid-glass-strong rounded-[30px] overflow-hidden mb-10">
          <div className="flex border-b border-white/60 bg-white/40 px-4 sm:px-6 text-xs font-extrabold overflow-x-auto no-scrollbar">
            {[
              { id: 'desc', icon: Info, ar: 'الوصف والمميزات', en: 'Overview' },
              { id: 'specs', icon: Cpu, ar: 'المواصفات التقنية', en: 'Specifications' },
              { id: 'reviews', icon: Star, ar: `آراء المشترين (${reviewsList.length})`, en: `Reviews (${reviewsList.length})` },
              { id: 'warranty', icon: ShieldCheck, ar: 'الضمان الرسمي', en: 'Warranty' },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'specs' | 'desc' | 'reviews' | 'warranty')}
                  className={`py-3.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'border-[#0071e3] text-[#0071e3]'
                      : 'border-transparent text-slate-600 hover:text-[#0b1220]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{isAr ? tab.ar : tab.en}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-8 text-xs sm:text-sm">
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-[#0b1220] text-base">
                  {isAr ? 'جدول المواصفات والخصائص الهندسية' : 'Hardware Specifications'}
                </h3>
                <div className="divide-y divide-white/60 border border-white/70 rounded-2xl overflow-hidden bg-white/45">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/50"
                    >
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] sm:w-1/3">
                        {key === 'processor'
                          ? isAr ? 'المعالج' : 'Processor'
                          : key === 'screen'
                          ? isAr ? 'الشاشة والسطوع' : 'Display'
                          : key === 'camera'
                          ? isAr ? 'الكاميرات والتصوير' : 'Cameras'
                          : key === 'battery'
                          ? isAr ? 'البطارية والشحن' : 'Battery & Charging'
                          : key === 'power'
                          ? isAr ? 'القدرة والمنافذ' : 'Power Ports'
                          : key === 'speed'
                          ? isAr ? 'سرعة النقل' : 'Data Speed'
                          : key === 'material'
                          ? isAr ? 'الخامات والتصميم' : 'Materials'
                          : key}
                      </span>
                      <span className="font-semibold text-[#0b1220] sm:w-2/3 leading-relaxed">
                        {isAr ? val.ar : val.en}
                      </span>
                    </div>
                  ))}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] sm:w-1/3">
                      {isAr ? 'الضمان المعتمد' : 'Warranty'}
                    </span>
                    <span className="font-bold text-emerald-700 sm:w-2/3">
                      {product.warrantyYears} {isAr ? 'سنوات ضمان الوكيل الرسمي' : 'Years official authorized warranty'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="space-y-4 leading-relaxed text-slate-700">
                <p className="text-sm font-semibold text-[#0b1220]">
                  {isAr ? product.descriptionAr : product.description}
                </p>
                <div className="bg-[#0071e3]/8 p-4 rounded-2xl border border-[#0071e3]/20 text-xs text-[#005bbf] font-semibold">
                  {isAr
                    ? 'جميع الهواتف والملحقات المعروضة في متجر صدام العقاري للإلكترونيات أصلية 100% ومستوردة من الوكلاء الرسميين مع الضمان المعتمد.'
                    : 'All devices and accessories at Saddam Al-Aqari Electronics are 100% genuine with official authorized warranty.'}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddReview}
                  className="liquid-glass-subtle p-5 rounded-2xl space-y-3"
                >
                  <h4 className="font-extrabold text-[#0b1220] text-xs">
                    {isAr ? 'أضف تقييمك وتجربتك للجهاز:' : 'Leave a verified review:'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'اسمك الكريم' : 'Your name'}
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="p-2.5 rounded-xl border border-white/80 bg-white/80 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">{isAr ? 'التقييم:' : 'Rating:'}</span>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="p-2.5 rounded-xl border border-white/80 bg-white/80 text-xs font-mono font-bold text-[#0b1220]"
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
                    placeholder={isAr ? 'اكتب رأيك الصادق في جودة المنتج وسرعة التسليم...' : 'Your detailed feedback...'}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-xs text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="liquid-btn-primary font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      {isAr ? 'نشر التقييم' : 'Post Review'}
                    </button>
                    {reviewSubmitted && (
                      <span className="text-emerald-700 font-bold text-xs">
                        {isAr ? 'شكراً لك! تم نشر تقييمك بنجاح.' : 'Review posted!'}
                      </span>
                    )}
                  </div>
                </form>

                <div className="space-y-3">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl liquid-glass-subtle space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0b1220]">{rev.author}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[11px] text-emerald-700 font-bold">
                              · {isAr ? 'مشتري موثق' : 'Verified Buyer'}
                            </span>
                          )}
                        </div>
                        <span className="text-amber-500 font-mono text-xs">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isAr ? rev.commentAr : rev.comment}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block">{rev.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200/80 text-emerald-950 space-y-2">
                <h4 className="font-black text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>{isAr ? 'شهادة الضمان الذهبي المعتمد' : 'Official Comprehensive Warranty'}</span>
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {isAr
                    ? 'يغطي الضمان كافة العيوب المصنعية والأعطال الفنية مع إمكانية فحص الجهاز والتأكد من ملحقاته قبل الاستلام مع فاتورة رسمية من محلات صدام العقاري.'
                    : 'Comprehensive coverage for manufacturing and hardware defects backed by an official invoice from Saddam Al-Aqari Store.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[#0b1220] mb-5">
              {isAr ? 'منتجات وملحقات مشابهة' : 'Related Hardware & Accessories'}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  language={language}
                  currency={currency}
                  onSelect={onSelectRelated}
                  onAddToCart={(prod, vr, col) => onAddToCart(prod, vr, col, 1)}
                  onQuickOrder={(prod, vr, col) =>
                    onQuickOrder ? onQuickOrder(prod, vr, col, 1) : onAddToCart(prod, vr, col, 1)
                  }
                  isWishlisted={isWishlisted}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compact Liquid Glass Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 liquid-glass-strong p-2.5 border-t border-white/80 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-slate-600 truncate font-semibold">
            {isAr ? product.nameAr : product.name}
          </div>
          <div className="text-sm font-black text-[#0b1220] font-mono tabular-nums leading-tight">
            {formatPrice(currentPrice, currency, isAr)}
          </div>
        </div>
        <button
          onClick={handleAdd}
          id="mobile-sticky-add-to-cart-btn"
          className="liquid-btn-primary font-extrabold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 text-xs shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isAr ? 'للسلة' : 'Add'}</span>
        </button>
        <button
          onClick={handleQuickOrder}
          id="mobile-sticky-quick-order-btn"
          className="liquid-btn-emerald font-extrabold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 text-xs shrink-0 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isAr ? 'طلب سريع' : 'Quick Order'}</span>
        </button>
      </div>
    </div>
  );
}
