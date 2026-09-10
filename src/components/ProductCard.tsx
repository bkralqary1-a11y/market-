import { useState, useRef, type MouseEvent } from 'react';
import { Heart, ShoppingBag, Eye, Star, ShieldCheck, SlidersHorizontal, Check } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';
import { triggerFlyToCart } from './FlyingCartAnimation';

interface ProductCardProps {
  key?: string;
  product: Product;
  language: Language;
  currency: Currency;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, variant: string, color: string) => void;
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
    triggerFlyToCart({
      imageUrl: product.image,
      productName: isAr ? product.nameAr : product.name,
      sourceElement: imgRef.current || (e.currentTarget as HTMLElement),
    });
    onAddToCart(product, product.variants.options[0] || 'الأساسي', selectedColor);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWishlist = (e: MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(product.id);
  };

  const handleCompare = (e: MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompare) onToggleCompare(product.id);
  };

  const handleQuickView = (e: MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-3xl border border-gray-line hover:border-primary transition-all duration-300 shadow-xs hover:shadow-2xl transform hover:scale-105 flex flex-col justify-between overflow-hidden cursor-pointer relative z-0 hover:z-10 will-change-transform"
    >
      {/* 1. Top Badges & Actions */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden p-4">
        {/* Floating Brand & Tag */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 flex flex-col gap-1">
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
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
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
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
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
          <h3 className="font-extrabold text-gray-dark text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {isAr ? product.nameAr : product.name}
          </h3>
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
          <div className="flex items-baseline justify-between mb-1">
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

            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>{product.warrantyYears} {isAr ? 'سنوات' : 'Yrs'}</span>
            </span>
          </div>

          {/* Payment & Delivery note in Yemen */}
          <div className="text-[10px] text-gray-600 bg-orange-50/60 px-2 py-1 rounded-lg flex items-center justify-between mb-3 border border-orange-100">
            <span className="font-medium">{isAr ? 'الدفع عند الاستلام أو حوالة' : 'Cash on delivery / Kuraimi'}</span>
            <span className="font-bold text-orange-700">{isAr ? 'أصلي معتمد' : 'Certified'}</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 ${
              addedAnim
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 ring-offset-1'
                : 'bg-orange-600 hover:bg-orange-700 text-white hover:shadow-md'
            }`}
          >
            {addedAnim ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>{isAr ? 'تمت الإضافة ✓' : 'Added ✓'}</span>
              </>
            ) : (
              <>
                <span className="text-sm font-black">+</span>
                <span>{isAr ? 'إضافة' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
