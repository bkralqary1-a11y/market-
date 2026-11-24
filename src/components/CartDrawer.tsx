import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Smartphone,
  Zap,
  Headphones,
  Cable,
  CheckCircle,
} from 'lucide-react';
import { CartItem, Language, Currency, CategoryId } from '../types';
import { formatPrice } from '../data/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  language: Language;
  currency: Currency;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onToggleWarranty: (index: number) => void;
  onProceedToCheckout: () => void;
  onViewFullCart: () => void;
  onOpenInvoice?: () => void;
  onBrowseProducts?: () => void;
  onSelectCategory?: (category: CategoryId) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  language,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onToggleWarranty,
  onProceedToCheckout,
  onViewFullCart,
  onOpenInvoice,
  onBrowseProducts,
  onSelectCategory,
}: CartDrawerProps) {
  if (!isOpen) return null;
  const isAr = language === 'ar';

  const handleBrowse = () => {
    onClose();
    if (onBrowseProducts) onBrowseProducts();
  };

  const handleCategoryClick = (catId: CategoryId) => {
    onClose();
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else if (onBrowseProducts) {
      onBrowseProducts();
    }
  };

  const FREE_SHIPPING_THRESHOLD = 50000;
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 10000 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3000;
  const grandTotal = subtotal + shippingFee;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`fixed top-3 bottom-3 ${
          isAr ? 'left-3' : 'right-3'
        } w-[calc(100%-24px)] max-w-md liquid-glass-strong rounded-[30px] z-50 flex flex-col justify-between overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/60 flex items-center justify-between bg-white/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#0071e3]/12 text-[#0071e3] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0b1220]">
                {isAr ? 'سلة المشتريات' : 'Shopping Cart'}
              </h3>
              <span className="text-[11px] text-slate-500 font-medium tabular-nums">
                {isAr ? `${cart.length} منتجات في السلة` : `${cart.length} items in cart`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/70 text-slate-500 hover:text-[#0b1220] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        {cart.length > 0 && (
          <div className="bg-[#0071e3]/8 border-b border-[#0071e3]/15 p-3.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-[#005bbf]">
                {remainingForFreeShipping === 0
                  ? isAr
                    ? 'حصلت على شحن مجاني سريع'
                    : 'Free Express Shipping Unlocked'
                  : isAr
                  ? `أضف ${formatPrice(remainingForFreeShipping, currency, true)} للشحن المجاني`
                  : `Add ${formatPrice(remainingForFreeShipping, currency, false)} for Free Shipping`}
              </span>
              <span className="font-mono tabular-nums text-[#0071e3] font-black text-[11px]">
                {freeShippingProgress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0a84ff] to-[#0071e3] rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-grow divide-y divide-white/60 flex flex-col">
          {cart.length === 0 ? (
            <div className="my-auto py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl liquid-btn-primary flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>

              <h4 className="text-lg font-black text-[#0b1220] mb-2">
                {isAr ? 'سلة مشترياتك فارغة' : 'Your cart is empty'}
              </h4>
              <p className="text-xs text-slate-600 mb-6 max-w-xs leading-relaxed">
                {isAr
                  ? 'استكشف أحدث الهواتف الذكية الأصلية، الشواحن السريعة، والسماعات المعتمدة بضمان رسمي.'
                  : 'Explore our genuine smartphones, fast GaN chargers, and official accessories.'}
              </p>

              <button
                id="drawer-browse-products-btn"
                onClick={handleBrowse}
                className="liquid-btn-primary w-full max-w-xs text-xs sm:text-sm font-extrabold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer mb-6"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAr ? 'تصفح المنتجات' : 'Browse Products'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="w-full border-t border-white/60 pt-4">
                <span className="block text-[11px] font-bold text-slate-500 mb-2.5">
                  {isAr ? 'أو انتقل مباشرة إلى القسم:' : 'Jump to category:'}
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    { id: 'phones' as CategoryId, ar: 'الهواتف', en: 'Phones', icon: Smartphone },
                    { id: 'chargers' as CategoryId, ar: 'الشواحن', en: 'Chargers', icon: Zap },
                    { id: 'audio' as CategoryId, ar: 'السماعات', en: 'Audio', icon: Headphones },
                    { id: 'cables' as CategoryId, ar: 'الكيابل', en: 'Cables', icon: Cable },
                  ].map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleCategoryClick(c.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/70 hover:bg-white text-slate-700 hover:text-[#0071e3] px-3 py-1.5 rounded-xl border border-white/80 transition-colors cursor-pointer"
                      >
                        <Icon className="w-3 h-3 text-[#0071e3]" />
                        <span>{isAr ? c.ar : c.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAr ? 'ضمان رسمي معتمد وفاتورة شراء' : 'Official Warranty & Invoice'}</span>
              </div>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <div className="flex gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-2xl border border-white/80 shrink-0 bg-white/60"
                  />

                  <div className="flex-grow min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#0071e3] uppercase font-mono">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title={isAr ? 'حذف' : 'Remove'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-extrabold text-[#0b1220] truncate mb-1">
                        {isAr ? item.product.nameAr : item.product.name}
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                        <span className="font-mono font-bold">{item.selectedVariant}</span>
                        <span>·</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: item.selectedColor }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center liquid-glass-subtle rounded-xl overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                          className="p-1.5 hover:bg-white/70 text-slate-700 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono tabular-nums font-bold text-[#0b1220]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                          className="p-1.5 hover:bg-white/70 text-slate-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs sm:text-sm font-black text-[#0b1220] font-mono tabular-nums">
                        {formatPrice(
                          (item.product.price + (item.warrantyUpgrade ? 10000 : 0)) * item.quantity,
                          currency,
                          isAr
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/60 flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-[#0b1220]">
                    <input
                      type="checkbox"
                      checked={item.warrantyUpgrade || false}
                      onChange={() => onToggleWarranty(idx)}
                      className="rounded border-slate-300 accent-[#0071e3] w-3.5 h-3.5"
                    />
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAr ? 'ضمان VIP ضد الكسر' : 'VIP Damage Shield'}</span>
                  </label>
                  {item.warrantyUpgrade && (
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {isAr ? 'مُفعّل ✓' : 'Active ✓'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/60 bg-white/50 shrink-0 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-mono tabular-nums font-bold text-[#0b1220]">
                  {formatPrice(subtotal, currency, isAr)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{isAr ? 'الشحن السريع:' : 'Shipping:'}</span>
                <span className="font-bold text-[#0b1220]">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600">{isAr ? 'مجاني' : 'Free'}</span>
                  ) : (
                    <span className="font-mono tabular-nums">{formatPrice(shippingFee, currency, isAr)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#0b1220] border-t border-white/70 pt-2">
                <span>{isAr ? 'المجموع الإجمالي:' : 'Total:'}</span>
                <span className="text-[#0071e3] font-mono tabular-nums text-base font-black">
                  {formatPrice(grandTotal, currency, isAr)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenInvoice) {
                    onOpenInvoice();
                  } else {
                    onProceedToCheckout();
                  }
                }}
                className="liquid-btn-emerald w-full font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>{isAr ? 'طلب وإصدار الفاتورة' : 'Request & Issue Invoice'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  onClose();
                  onViewFullCart();
                }}
                className="w-full liquid-glass-subtle hover:bg-white/80 text-slate-700 font-bold py-2.5 px-4 rounded-2xl transition-colors text-xs text-center cursor-pointer"
              >
                {isAr ? 'عرض سلة المشتريات الكاملة' : 'View Full Cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
