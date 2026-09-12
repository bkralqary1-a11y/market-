import { useState, useRef, type MouseEvent } from 'react';
import { Heart, ShoppingBag, Eye, Star, ShieldCheck, SlidersHorizontal, Check, Zap } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';
import { triggerFlyToCart } from './FlyingCartAnimation';
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
    setTimeout(() => setAddedAnim(false), 900);
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
    <div
      className={`relative h-full w-full min-w-0 transition-all duration-300 ${
        addedAnim ? 'animate-pulse-forward z-30' : 'hover:-translate-y-1 hover:shadow-xl'
      }`}
    >
      <div
        onClick={() => {
          soundFX.playClick();
          onSelect(product);
        }}
        className={`group bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative h-full w-full min-w-0 ${
          addedAnim
            ? 'border-emerald-500 ring-2 ring-emerald-400 shadow-2xl'
            : 'border-gray-200 hover:border-primary shadow-xs hover:shadow-xl'
        }`}
      >
        {/* 1. Top Badges & Actions */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden p-2.5 sm:p-4">
          {/* Floating Brand & Tag */}
          <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 z-10 flex flex-col gap-1">
            <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase bg-tech-dark text-white px-1.5 sm:px-2 py-0.5 rounded-md tracking-wider shadow">
              {product.brand}
            </span>
            {product.tagAr && (
              <span className="text-[8px] sm:text-[9px] font-bold bg-primary text-white px-1.5 sm:px-2 py-0.5 rounded-md shadow">
                {isAr ? product.tagAr : product.tag}
              </span>
            )}
          </div>

          {/* Action icons (Wishlist, Compare, Quick View) */}
          <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 z-10 flex flex-col gap-1 sm:gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow backdrop-blur-sm transition-all ${
                isWishlisted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:text-rose-500 hover:bg-white'
              }`}
              title={isAr ? 'إضافة للمفضلة' : 'Wishlist'}
            >
              <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handleCompare}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow backdrop-blur-sm transition-all hidden sm:block ${
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
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/90 text-gray-600 hover:text-primary hover:bg-white shadow backdrop-blur-sm transition-all"
              title={isAr ? 'معاينة سريعة' : 'Quick view'}
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Product Image */}
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover rounded-xl sm:rounded-2xl group-hover:scale-105 transition-transform duration-500"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl sm:rounded-2xl" />

          {/* Fast Delivery Pill */}
          {product.fastShipping && (
            <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 bg-emerald-50/95 backdrop-blur-sm text-emerald-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 group-hover:opacity-0 transition-opacity duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{isAr ? 'شحن فوري' : 'Express'}</span>
            </div>
          )}
        </div>

        {/* 2. Product Details */}
        <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between space-y-2.5 bg-white">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-400 mb-1">
              <span className="font-semibold text-primary truncate max-w-[65%]">
                {isAr ? product.categoryNameAr : product.categoryNameEn}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500 font-bold font-mono shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
            </div>

            {/* Product Name */}
            <h3 className="font-black text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2rem]">
              {isAr ? product.nameAr : product.name}
            </h3>

            {/* Product Key Specifications Tags */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1.5 my-2">
                {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
                  <span
                    key={key}
                    className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium border border-gray-200 truncate max-w-full"
                    title={isAr ? val.ar : val.en}
                  >
                    {isAr ? val.ar : val.en}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price & Warranty & Order Actions */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-black text-gray-900 font-mono">
                  {formatPrice(product.price, currency, isAr)}
                </span>
                {product.originalPrice && (
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                    {formatPrice(product.originalPrice, currency, isAr)}
                  </span>
                )}
              </div>

              <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3" />
                <span>{product.warrantyYears} {isAr ? 'سنوات ضمان' : 'Yrs'}</span>
              </span>
            </div>

            {/* Authentic Certified Badge */}
            <div className="text-[9px] sm:text-[10px] text-gray-600 bg-gray-50 px-2 py-1 rounded-lg flex items-center justify-between mb-2.5 border border-gray-200/80">
              <span className="font-medium truncate">{isAr ? 'دفع عند الاستلام / حوالة' : 'Cash / Transfer'}</span>
              <span className="font-bold text-emerald-700 shrink-0">{isAr ? 'أصلي معتمد' : 'Original'}</span>
            </div>

            {/* Action Buttons: Add to Cart & One-Click Quick Order (Optimized for 2-column side-by-side grid) */}
            <div className="grid grid-cols-2 gap-1 sm:gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl font-bold text-[10px] sm:text-xs min-w-0 flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer border ${
                  addedAnim
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                    : 'bg-white hover:bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300 shadow-xs'
                }`}
                title={isAr ? 'إضافة إلى سلة المشتريات' : 'Add to Cart'}
              >
                {addedAnim ? (
                  <>
                    <Check className="w-3 h-3 text-white shrink-0" />
                    <span className="truncate">{isAr ? 'أُضيف' : 'Added'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3 text-orange-600 shrink-0" />
                    <span className="truncate">{isAr ? 'أضف' : 'Add'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickOrder}
                className="py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl font-black text-[10px] sm:text-xs min-w-0 flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-sm active:scale-95 transition-all cursor-pointer group"
                title={isAr ? 'طلب سريع فوري عبر واتساب وفاتورة مباشرة' : 'Quick Order via WhatsApp Invoice'}
              >
                <Zap className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{isAr ? 'شراء ⚡' : 'Buy ⚡'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

