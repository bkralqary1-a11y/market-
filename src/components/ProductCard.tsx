import { useState, useRef, type MouseEvent } from 'react';
import { Heart, ShoppingBag, Eye, Star, ShieldCheck, SlidersHorizontal, Check, Zap } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';
import { triggerFlyToCart } from './FlyingCartAnimation';
import Tilt3D from './Tilt3D';
import { soundFX } from '../utils/audioEffects';

interface ProductCardProps {
  key?: string;
  product: Product;
  language: Language;
  currency: Currency;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, variant: string, color: string) => void;
  onQuickOrder?: (product: Product, variant: string, color: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({
  product,
  language,
  currency,
  onSelect,
  onAddToCart,
  onQuickOrder,
  isWishlisted = false,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
  onQuickView,
}: ProductCardProps) {
  const isAr = language === 'ar';
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '#0f172a');
  const [addedAnim, setAddedAnim] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const installmentPrice = Math.round(product.price / 4);

  const handleQuickAdd = (e: MouseEvent) => {
    e.stopPropagation();
    soundFX.playAddToCart();
    triggerFlyToCart({
      imageUrl: product.image,
      productName: isAr ? product.nameAr : product.name,
      sourceElement: imgRef.current || (e.currentTarget as HTMLElement),
    });
    onAddToCart(product, product.variants.options[0] || 'الأساسي', selectedColor);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleQuickOrder = (e: MouseEvent) => {
    e.stopPropagation();
    soundFX.playAddToCart();
    triggerFlyToCart({
      imageUrl: product.image,
      productName: isAr ? product.nameAr : product.name,
      sourceElement: imgRef.current || (e.currentTarget as HTMLElement),
    });
    const defaultVariant = product.variants.options[0] || 'الأساسي';
    const defaultColor = selectedColor || product.colors[0] || '#0f172a';
    if (onQuickOrder) {
      onQuickOrder(product, defaultVariant, defaultColor);
    } else {
      onAddToCart(product, defaultVariant, defaultColor);
    }
  };

  const handleWishlist = (e: MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    if (onToggleWishlist) onToggleWishlist(product.id);
  };

  const handleCompare = (e: MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    if (onToggleCompare) onToggleCompare(product.id);
  };

  const handleQuickView = (e: MouseEvent) => {
    e.stopPropagation();
    soundFX.playModalOpen();
    if (onQuickView) onQuickView(product);
  };

  return (
    <Tilt3D
      maxAngle={10}
      scale={1.03}
      depth={25}
      className="h-full rounded-3xl"
    >
      <div
        onClick={() => {
          soundFX.playClick();
          onSelect(product);
        }}
        className="group bg-white rounded-3xl border border-gray-line hover:border-primary transition-all duration-300 shadow-xs hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.18)] flex flex-col justify-between overflow-hidden cursor-pointer relative z-0 hover:z-10 h-full transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 1. Top Badges & Actions */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden p-4 transform-gpu" style={{ transform: 'translateZ(15px)' }}>
          {/* Floating Brand & Tag */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 flex flex-col gap-1 transform-gpu" style={{ transform: 'translateZ(25px)' }}>
            <span className="text-[10px] font-mono font-black uppercase bg-tech-dark text-white px-2 py-0.5 rounded-md tracking-wider shadow">
              {product.brand}
            </span>
            {product.tagAr && (
              <span className="text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded-md shadow">
                {isAr ? product.tagAr : product.tag}
              </span>
            )}
          </div>

          {/* Action icons (Wishlist, Compare, Quick View) */}
          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity transform-gpu" style={{ transform: 'translateZ(25px)' }}>
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-xl shadow backdrop-blur-sm transition-all ${
                isWishlisted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:text-rose-500 hover:bg-white'
              }`}
              title={isAr ? 'إضافة للمفضلة' : 'Wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handleCompare}
              className={`p-2 rounded-xl shadow backdrop-blur-sm transition-all ${
                isCompared
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/90 text-gray-600 hover:text-cyan-600 hover:bg-white'
              }`}
              title={isAr ? 'إضافة للمقارنة' : 'Compare'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleQuickView}
              className="p-2 rounded-xl bg-white/90 text-gray-600 hover:text-primary hover:bg-white shadow backdrop-blur-sm transition-all"
              title={isAr ? 'معاينة سريعة' : 'Quick view'}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Image */}
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
          />

          {/* Visual Gradient Overlay on hover for crisp white text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl z-5" />

          {/* Hover White Text Banner */}
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1.5 group-hover:translate-y-0 pointer-events-none flex items-center justify-between text-white drop-shadow-md">
            <span className="text-[11px] font-bold flex items-center gap-1.5 text-white drop-shadow">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'معاينة سريعة' : 'Quick View'}</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-white/25 backdrop-blur-md px-2 py-0.5 rounded-md text-white">
              {product.brand}
            </span>
          </div>

          {/* Fast Delivery Pill (Visible when not hovering) */}
          {product.fastShipping && (
            <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-emerald-50/90 backdrop-blur-sm text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 group-hover:opacity-0 transition-opacity duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{isAr ? 'شحن فوري 24h' : 'Express 24h'}</span>
            </div>
          )}
        </div>

        {/* 2. Product Details */}
        <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3 bg-white">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
              <span className="font-semibold text-primary">
                {isAr ? product.categoryNameAr : product.categoryNameEn}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-gray-400">({product.reviewsCount})</span>
              </div>
            </div>

            {/* Product Name */}
            <h3 className="font-extrabold text-gray-dark text-sm sm:text-base line-clamp-1 leading-snug group-hover:text-primary transition-colors">
              {isAr ? product.nameAr : product.name}
            </h3>

            {/* Product Key Specifications Tags */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="flex flex-wrap gap-1.5 my-2">
                {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
                  <span
                    key={key}
                    className="text-[10px] bg-gray-100/90 hover:bg-orange-50 text-gray-700 hover:text-orange-700 px-2 py-0.5 rounded-md font-medium border border-gray-200/80 transition-colors truncate max-w-full"
                    title={isAr ? val.ar : val.en}
                  >
                    {isAr ? val.ar : val.en}
                  </span>
                ))}
              </div>
            )}

            {/* Product Description Snippet */}
            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mt-1">
              {isAr ? product.descriptionAr : product.description}
            </p>
          </div>

          {/* Color swatches if any */}
          {product.colors && product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] text-gray-400">{isAr ? 'الألوان:' : 'Colors:'}</span>
              <div className="flex items-center gap-1">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                      selectedColor === c ? 'scale-125 border-primary shadow-xs ring-1 ring-primary' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Price & Installments */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-gray-dark font-mono">
                  {formatPrice(product.price, currency, isAr)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through font-mono">
                    {formatPrice(product.originalPrice, currency, isAr)}
                  </span>
                )}
              </div>

              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                <span>{product.warrantyYears} {isAr ? 'سنوات ضمان' : 'Yrs Warranty'}</span>
              </span>
            </div>

            {/* Payment & Delivery note in Yemen */}
            <div className="text-[10px] text-gray-600 bg-orange-50/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between mb-3 border border-orange-200/60">
              <span className="font-medium">{isAr ? 'الدفع عند الاستلام أو حوالة' : 'Cash on delivery / Kuraimi'}</span>
              <span className="font-bold text-orange-700">{isAr ? 'أصلي معتمد' : 'Certified'}</span>
            </div>

            {/* Action Buttons: Add to Cart & One-Click Quick Order */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer border ${
                  addedAnim
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                    : 'bg-white hover:bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300 shadow-xs'
                }`}
                title={isAr ? 'إضافة إلى سلة المشتريات' : 'Add to Cart'}
              >
                {addedAnim ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="truncate">{isAr ? 'تمت الإضافة' : 'Added'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="truncate">{isAr ? 'إضافة للسلة' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickOrder}
                className="py-2.5 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer group"
                title={isAr ? 'طلب سريع فوري عبر واتساب وفاتورة مباشرة' : 'Quick Order via WhatsApp Invoice'}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{isAr ? 'طلب سريع ⚡' : 'Quick Order ⚡'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Tilt3D>
  );
}
