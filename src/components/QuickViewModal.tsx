import { useState, useRef } from 'react';
import { X, Star, ShoppingBag, Heart, Check, ShieldCheck, Zap } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';
import { triggerFlyToCart } from './FlyingCartAnimation';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  language: Language;
  currency: Currency;
  onAddToCart: (product: Product, variant: string, color: string, qty: number) => void;
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
  onViewFullDetails,
  isWishlisted,
  onToggleWishlist,
}: QuickViewModalProps) {
  if (!product) return null;
  const isAr = language === 'ar';

  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '#0f172a');
  const [selectedVariant, setSelectedVariant] = useState(product.variants.options[0] || 'الأساسي');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const modalImgRef = useRef<HTMLImageElement | null>(null);

  const handleAdd = () => {
    triggerFlyToCart({
      imageUrl: product.image,
      productName: isAr ? product.nameAr : product.name,
      sourceElement: modalImgRef.current,
    });
    onAddToCart(product, selectedVariant, selectedColor, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative border border-gray-line flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 text-gray-500 hover:text-gray-900 p-1.5 rounded-full bg-white/80 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 aspect-square md:aspect-auto bg-gray-50 relative p-4 flex items-center justify-center">
          <img ref={modalImgRef} src={product.image} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
          <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-tech-dark text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
            {product.brand}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-primary uppercase font-mono">
                {isAr ? product.categoryNameAr : product.categoryNameEn}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-black text-gray-dark mb-2">
              {isAr ? product.nameAr : product.name}
            </h3>

            {/* Price & Installments */}
            <div className="mb-3 pb-2 border-b border-gray-line">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl font-black text-primary font-mono">
                  {formatPrice(product.price, currency, isAr)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through font-mono">
                    {formatPrice(product.originalPrice, currency, isAr)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>
                  {isAr
                    ? `أو ${formatPrice(Math.round(product.price / 4), currency, isAr)} / شهر مع تابي`
                    : `or 4x ${formatPrice(Math.round(product.price / 4), currency, isAr)} with Tabby`}
                </span>
              </span>
            </div>

            {/* Variants options */}
            {product.variants.options && (
              <div className="mb-3">
                <span className="text-xs font-bold text-gray-700 block mb-1">
                  {isAr ? product.variants.titleAr : product.variants.titleEn}:
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {product.variants.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariant(opt)}
                      className={`px-2.5 py-1 rounded-lg border font-bold ${
                        selectedVariant === opt
                          ? 'bg-tech-dark text-white border-tech-dark'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty Badge */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{product.warrantyYears} {isAr ? 'سنوات ضمان الوكيل المعتمد' : 'Years official warranty'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-gray-line">
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? (isAr ? 'تمت الإضافة للسلة ✓' : 'Added! ✓') : (isAr ? 'إضافة إلى السلة' : 'Add to Cart')}</span>
              </button>
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`p-3 rounded-xl border flex items-center justify-center ${
                  isWishlisted ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-gray-200 text-gray-500'
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
              className="w-full text-center text-xs text-primary font-bold hover:underline py-1"
            >
              {isAr ? 'عرض المواصفات الكاملة وجدول المقارنة' : 'View Full Specifications & Comparison'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
