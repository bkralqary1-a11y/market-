import { useState, useEffect, useRef } from 'react';
import { X, Star, ShoppingBag, Heart, Zap, Smartphone } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';
import { triggerFlyToCart } from './FlyingCartAnimation';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  language: Language;
  currency: Currency;
  onAddToCart: (product: Product, variant: string, color: string, qty: number) => void;
  onQuickOrder?: (product: Product, variant: string, color: string, qty: number) => void;
  onViewFullDetails: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  language,
  currency,
  onAddToCart,
  onQuickOrder,
  onViewFullDetails,
  isWishlisted,
  onToggleWishlist,
}: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.options?.[0] || '');
  const [activeModalImg, setActiveModalImg] = useState(product?.images?.[0] || product?.image || '');
  const [added, setAdded] = useState(false);
  const modalImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!product) return;
    setSelectedColor(product.colors?.[0] || '');
    setSelectedVariant(product.variants?.options?.[0] || '');
    setActiveModalImg(product.images?.[0] || product.image || '');
    setAdded(false);
  }, [product]);

  if (!product) return null;
  const isAr = language === 'ar';
  const displayedImg = activeModalImg || product.image;
  const hasBrand = Boolean(product.brand?.trim());
  const hasRating = Number(product.rating) > 0;
  const displayDesc = (isAr ? product.descriptionAr : product.description || product.descriptionAr)?.trim() || '';
  const variantOptions = (product.variants?.options || []).filter((o) => Boolean(o?.trim()));

  const handleAdd = () => {
    triggerFlyToCart({
      imageUrl: displayedImg,
      productName: isAr ? product.nameAr : product.name || product.nameAr,
      sourceElement: modalImgRef.current,
    });
    onAddToCart(product, selectedVariant, selectedColor, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 650);
  };

  const handleQuickOrder = () => {
    triggerFlyToCart({
      imageUrl: displayedImg,
      productName: isAr ? product.nameAr : product.name || product.nameAr,
      sourceElement: modalImgRef.current,
    });
    if (onQuickOrder) {
      onQuickOrder(product, selectedVariant, selectedColor, 1);
    } else {
      onAddToCart(product, selectedVariant, selectedColor, 1);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong w-full max-w-2xl rounded-[30px] overflow-hidden relative flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 text-slate-600 hover:text-[#0b1220] p-2 rounded-full liquid-glass-capsule cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image Stage */}
        <div className="md:w-1/2 bg-white/40 relative p-5 flex flex-col items-center justify-between">
          <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-2xl liquid-glass-subtle p-2">
            {displayedImg?.trim() ? (
              <img
                ref={modalImgRef}
                src={displayedImg}
                alt={product.nameAr || product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-sky-50 to-blue-100/70 flex flex-col items-center justify-center gap-1.5 text-[#0071e3] text-xs font-bold">
                <Smartphone className="w-10 h-10 opacity-70" />
                {hasBrand && <span>{product.brand}</span>}
              </div>
            )}
          </div>

          {product.images && product.images.filter((u) => Boolean(u?.trim())).length > 1 && (
            <div className="flex gap-2 mt-3 w-full overflow-x-auto pb-1 no-scrollbar">
              {product.images
                .filter((u) => Boolean(u?.trim()))
                .map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveModalImg(img)}
                    className={`w-12 h-12 shrink-0 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white/80 cursor-pointer ${
                      displayedImg === img ? 'border-[#0071e3] scale-105' : 'border-white/80'
                    }`}
                  >
                    <img
                      src={img}
                      alt="thumb"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between space-y-4">
          <div>
            {(hasBrand || product.categoryNameAr || hasRating) && (
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-bold text-[#0071e3]">
                  {[hasBrand ? product.brand : '', isAr ? product.categoryNameAr : product.categoryNameEn]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                {hasRating && (
                  <div className="flex items-center gap-1 text-amber-500 font-bold font-mono tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                )}
              </div>
            )}

            <h3 className="text-base sm:text-lg font-black text-[#0b1220] mb-2">
              {isAr ? product.nameAr : product.name || product.nameAr}
            </h3>

            {displayDesc && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                {displayDesc}
              </p>
            )}

            <div className="mb-3 pb-3 border-b border-white/60">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-[#0b1220] font-mono tabular-nums">
                  {formatPrice(product.price, currency, isAr)}
                </span>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                    {formatPrice(product.originalPrice, currency, isAr)}
                  </span>
                ) : null}
              </div>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                {product.colors.map((c, idx) => (
                  <button
                    key={`${c}-${idx}`}
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${
                      selectedColor === c ? 'border-[#0071e3] scale-110' : 'border-white'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            )}

            {variantOptions.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isAr
                    ? product.variants.titleAr || 'السعة / الموديل'
                    : product.variants.titleEn || 'Option'}
                  :
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {variantOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariant(opt)}
                      className={`px-3 py-1 rounded-xl border font-bold cursor-pointer transition-all ${
                        selectedVariant === opt
                          ? 'liquid-btn-primary border-transparent text-white'
                          : 'bg-white/65 text-slate-700 border-white/80 hover:bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-white/60">
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="liquid-btn-primary flex-1 text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? (isAr ? 'تمت الإضافة ✓' : 'Added ✓') : isAr ? 'للسلة' : 'Add'}</span>
              </button>
              <button
                onClick={handleQuickOrder}
                className="liquid-btn-emerald flex-1 text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isAr ? 'طلب سريع' : 'Quick Order'}</span>
              </button>
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-center cursor-pointer ${
                  isWishlisted
                    ? 'border-rose-400 text-rose-600 bg-rose-50/90'
                    : 'border-white/80 bg-white/65 text-slate-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewFullDetails(product);
              }}
              className="w-full text-center text-xs text-[#0071e3] font-bold hover:underline py-1 cursor-pointer"
            >
              {isAr ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
