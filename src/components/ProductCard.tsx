import { useState, useRef, type MouseEvent } from 'react';
import {
  Heart,
  ShoppingBag,
  Eye,
  Star,
  SlidersHorizontal,
  Check,
  MessageCircle,
  Smartphone,
  Pencil,
  EyeOff,
} from 'lucide-react';
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
  isAdminMode?: boolean;
  onAdminEdit?: (product: Product) => void;
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
  isAdminMode = false,
  onAdminEdit,
}: ProductCardProps) {
  const isAr = language === 'ar';
  const [selectedColor] = useState(product.colors?.[0] || '');
  const [addedAnim, setAddedAnim] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const hasBrand = Boolean(product.brand?.trim());
  const hasRating = Number(product.rating) > 0;
  const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
  const defaultVariant = product.variants?.options?.[0] || '';

  const handleQuickAdd = (e: MouseEvent) => {
    e.stopPropagation();
    soundFX.playAddToCart();
    triggerFlyToCart({
      imageUrl: product.image,
      productName: isAr ? product.nameAr : product.name || product.nameAr,
      sourceElement: imgRef.current || (e.currentTarget as HTMLElement),
    });
    onAddToCart(product, defaultVariant, selectedColor);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 900);
  };

  const handleQuickOrder = (e: MouseEvent) => {
    e.stopPropagation();
    soundFX.playAddToCart();
    triggerFlyToCart({
      imageUrl: product.image,
      productName: isAr ? product.nameAr : product.name || product.nameAr,
      sourceElement: imgRef.current || (e.currentTarget as HTMLElement),
    });
    if (onQuickOrder) {
      onQuickOrder(product, defaultVariant, selectedColor);
    } else {
      onAddToCart(product, defaultVariant, selectedColor);
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
    <article
      className={`relative h-full w-full min-w-0 ${addedAnim ? 'animate-pulse-forward z-20' : ''}`}
    >
      <div
        onClick={() => {
          soundFX.playClick();
          if (isAdminMode && onAdminEdit) {
            onAdminEdit(product);
          } else {
            onSelect(product);
          }
        }}
        className={`group liquid-glass liquid-card-hover rounded-[26px] p-2.5 sm:p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer relative h-full w-full min-w-0 ${
          addedAnim ? 'ring-2 ring-emerald-500' : ''
        } ${isAdminMode ? 'ring-2 ring-[#0071e3]/45 hover:ring-[#0071e3]' : ''} ${
          product.hidden ? 'opacity-65' : ''
        }`}
      >
        {/* Admin Mode Floating Pencil Edit Trigger */}
        {isAdminMode && onAdminEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdminEdit(product);
            }}
            className="absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto z-20 px-2.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white text-[11px] font-extrabold shadow-lg flex items-center gap-1 cursor-pointer"
            title="تعديل هذا المنتج"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>تعديل</span>
          </button>
        )}

        {/* 1. Product Image Stage */}
        <div className="relative aspect-square rounded-[18px] liquid-glass-subtle overflow-hidden mb-3">
          {!isAdminMode && product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="absolute top-2.5 right-2.5 rtl:right-2.5 rtl:left-auto ltr:left-2.5 ltr:right-auto z-10 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-black tabular-nums shadow">
              -{product.discountPercentage}%
            </span>
          ) : null}

          {isAdminMode && product.hidden && (
            <span className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow">
              <EyeOff className="w-3 h-3" />
              <span>مخفي عن الزوار</span>
            </span>
          )}

          {/* Minimal Floating Glass Action Buttons */}
          <div className="absolute top-2.5 left-2.5 rtl:left-2.5 rtl:right-auto ltr:right-2.5 ltr:left-auto z-10 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-500 text-white border-rose-400 shadow'
                  : 'bg-white/75 text-slate-700 border-white/80 hover:bg-white hover:text-rose-500'
              }`}
              title={isAr ? 'إضافة للمفضلة' : 'Wishlist'}
              aria-label={isAr ? 'إضافة للمفضلة' : 'Wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleCompare}
              className={`w-8 h-8 rounded-full backdrop-blur-xl border hidden sm:flex items-center justify-center transition-all cursor-pointer ${
                isCompared
                  ? 'bg-[#0071e3] text-white border-sky-300 shadow'
                  : 'bg-white/75 text-slate-700 border-white/80 hover:bg-white hover:text-[#0071e3]'
              }`}
              title={isAr ? 'مقارنة' : 'Compare'}
              aria-label={isAr ? 'مقارنة' : 'Compare'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleQuickView}
              className="w-8 h-8 rounded-full bg-white/75 hover:bg-white text-slate-700 hover:text-[#0071e3] border border-white/80 backdrop-blur-xl flex items-center justify-center transition-all cursor-pointer"
              title={isAr ? 'معاينة سريعة' : 'Quick view'}
              aria-label={isAr ? 'معاينة سريعة' : 'Quick view'}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Photo with Resilient Fallback */}
          {imgFailed || !product.image?.trim() ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-50/90 to-blue-100/70 text-[#0071e3]/70 p-4 text-center">
              <Smartphone className="w-10 h-10" />
              {hasBrand && (
                <span className="text-[11px] font-bold text-slate-600 line-clamp-1">
                  {product.brand}
                </span>
              )}
            </div>
          ) : (
            <img
              ref={imgRef}
              src={product.image}
              alt={isAr ? product.nameAr : product.name || product.nameAr}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>

        {/* 2. Clean Product Metadata & Info — Strictly conditional */}
        <div className="flex-grow flex flex-col justify-between gap-3 px-0.5">
          <div className="space-y-1.5">
            {(hasBrand || product.categoryNameAr || hasRating) && (
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  {hasBrand && (
                    <span className="font-bold text-[#0071e3] uppercase tracking-wide">
                      {product.brand}
                    </span>
                  )}
                  {hasBrand && (product.categoryNameAr || product.categoryNameEn) && (
                    <span aria-hidden="true">·</span>
                  )}
                  {(product.categoryNameAr || product.categoryNameEn) && (
                    <span className="truncate">
                      {isAr
                        ? product.categoryNameAr
                        : product.categoryNameEn || product.categoryNameAr}
                    </span>
                  )}
                </div>
                {hasRating && (
                  <div className="flex items-center gap-0.5 text-amber-600 font-bold tabular-nums shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                )}
              </div>
            )}

            {/* Product Name */}
            <h3 className="font-bold text-[#0b1220] text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#0071e3] transition-colors min-h-[2.2rem]">
              {isAr ? product.nameAr : product.name || product.nameAr}
            </h3>

            {/* Colors Dots ONLY if colors were entered */}
            {hasColors && (
              <div className="flex items-center gap-1">
                {product.colors.slice(0, 5).map((col, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full border border-slate-900/20 shadow-xs"
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Price & Dual Liquid Glass Actions */}
          <div className="pt-2.5 border-t border-slate-900/8 space-y-2.5">
            <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-[#0b1220] tabular-nums">
                {formatPrice(product.price, currency, isAr)}
              </span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-[11px] text-slate-400 line-through tabular-nums">
                  {formatPrice(product.originalPrice, currency, isAr)}
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`py-2 px-2 rounded-xl font-bold text-[11px] sm:text-xs min-w-0 flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  addedAnim
                    ? 'liquid-btn-emerald text-white'
                    : 'liquid-glass-strong text-[#0b1220] hover:text-[#0071e3] hover:bg-white'
                }`}
                title={isAr ? 'إضافة إلى السلة' : 'Add to Cart'}
              >
                {addedAnim ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{isAr ? 'تمت الإضافة' : 'Added'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#0071e3] shrink-0" />
                    <span className="truncate">{isAr ? 'أضف للسلة' : 'Add'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickOrder}
                className="py-2 px-2 rounded-xl liquid-btn-primary font-bold text-[11px] sm:text-xs min-w-0 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                title={isAr ? 'طلب سريع وفاتورة واتساب' : 'Quick WhatsApp Order'}
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isAr ? 'طلب سريع' : 'Order'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
