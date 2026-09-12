import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
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
    if (onBrowseProducts) {
      onBrowseProducts();
    }
  };

  const handleCategoryClick = (catId: CategoryId) => {
    onClose();
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else if (onBrowseProducts) {
      onBrowseProducts();
    }
  };

  // Free shipping threshold = 200 SAR
  const FREE_SHIPPING_THRESHOLD = 200;
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 49 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 25;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Drawer Container */}
      <div
        className={`fixed top-0 bottom-0 ${
          isAr ? 'left-0' : 'right-0'
        } w-full max-w-md bg-white shadow-2xl z-50 flex flex-col justify-between border-l rtl:border-l-0 rtl:border-r border-gray-line animate-in slide-in-from-${
          isAr ? 'left' : 'right'
        } duration-300`}
      >
        {/* 1. Header */}
        <div className="p-4 sm:p-5 border-b border-gray-line flex items-center justify-between bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-dark">
                {isAr ? 'سلة المشتريات' : 'Shopping Cart'}
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">
                {isAr ? `${cart.length} منتجات في السلة` : `${cart.length} items in cart`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Free Shipping Progress Bar (Shown when cart has items) */}
        {cart.length > 0 && (
          <div className="bg-primary/5 border-b border-primary/15 p-3.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {remainingForFreeShipping === 0
                    ? isAr
                      ? 'تهانينا! حصلت على شحن مجاني سريع 🚀'
                      : 'Congratulations! You unlocked Free Shipping 🚀'
                    : isAr
                    ? `أضف ${formatPrice(remainingForFreeShipping, currency, true)} للحصول على شحن مجاني!`
                    : `Add ${formatPrice(remainingForFreeShipping, currency, false)} more for Free Shipping!`}
                </span>
              </span>
              <span className="font-mono text-primary font-black text-[11px]">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-primary rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Cart Items List / Empty State */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-grow divide-y divide-gray-100 flex flex-col">
          {cart.length === 0 ? (
            <div className="my-auto py-8 text-center flex flex-col items-center">
              {/* Welcoming Top Badge */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-200 mb-4">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{isAr ? 'أهلاً بك في متجر صدام' : 'Welcome to Saddam Tech'}</span>
              </div>

              {/* Glowing Icon */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4">
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-pulse" />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <ShoppingBag className="w-8 h-8 sm:w-9 sm:h-9" />
                </div>
              </div>

              {/* Welcoming Headline & Message */}
              <h4 className="text-lg font-black text-gray-900 mb-2">
                {isAr ? 'سلة مشترياتك فارغة وجاهزة' : 'Your cart is empty and ready'}
              </h4>
              <p className="text-xs text-gray-600 mb-6 max-w-xs leading-relaxed">
                {isAr
                  ? 'يسعدنا وجودك معنا! لم تقم بإضافة أي أجهزة أو ملحقات بعد. استكشف أحدث الهواتف الذكية الأصلية، الشواحن السريعة، والسماعات المعتمدة.'
                  : 'Welcome! You have not added any items yet. Explore our genuine smartphones, fast GaN chargers, and official accessories.'}
              </p>

              {/* Main Button: Browse Products */}
              <button
                id="drawer-browse-products-btn"
                onClick={handleBrowse}
                className="w-full max-w-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer mb-6"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAr ? 'تصفح المنتجات' : 'Browse Products'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Quick Categories to avoid blank space */}
              <div className="w-full border-t border-gray-100 pt-4">
                <span className="block text-[11px] font-bold text-gray-500 mb-2.5">
                  {isAr ? 'أو تصفح مباشرة حسب القسم:' : 'Or jump directly to a category:'}
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    onClick={() => handleCategoryClick('phones')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    <Smartphone className="w-3 h-3 text-emerald-600" />
                    <span>{isAr ? 'الهواتف' : 'Phones'}</span>
                  </button>
                  <button
                    onClick={() => handleCategoryClick('chargers')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>{isAr ? 'الشواحن' : 'Chargers'}</span>
                  </button>
                  <button
                    onClick={() => handleCategoryClick('audio')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    <Headphones className="w-3 h-3 text-purple-500" />
                    <span>{isAr ? 'السماعات' : 'Audio'}</span>
                  </button>
                  <button
                    onClick={() => handleCategoryClick('cables')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    <Cable className="w-3 h-3 text-teal-600" />
                    <span>{isAr ? 'الكيابل' : 'Cables'}</span>
                  </button>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200/80">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAr ? 'ضمان رسمي معتمد وفاتورة شراء' : 'Official Warranty & Invoice'}</span>
              </div>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-gray-line shrink-0 bg-gray-50"
                  />

                  {/* Details */}
                  <div className="flex-grow min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase font-mono">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                          title={isAr ? 'حذف من السلة' : 'Remove item'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-extrabold text-gray-dark truncate mb-1">
                        {isAr ? item.product.nameAr : item.product.name}
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-mono font-bold">
                          {item.selectedVariant}
                        </span>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: item.selectedColor }}
                          title={item.selectedColor}
                        />
                      </div>
                    </div>

                    {/* Stepper & Price */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-gray-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right rtl:text-left">
                        <span className="text-xs sm:text-sm font-black text-primary font-mono">
                          {formatPrice(
                            (item.product.price + (item.warrantyUpgrade ? 49 : 0)) * item.quantity,
                            currency,
                            isAr
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extended Warranty Addon Option */}
                <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-dark">
                    <input
                      type="checkbox"
                      checked={item.warrantyUpgrade || false}
                      onChange={() => onToggleWarranty(idx)}
                      className="rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAr ? 'ضمان VIP ذهبي ضد الكسر (+49 ر.س)' : 'VIP Damage Shield (+49 SAR)'}</span>
                  </label>
                  {item.warrantyUpgrade && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {isAr ? 'مُفعّل ✓' : 'Active ✓'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 4. Footer & Action Buttons */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-line bg-gray-50/70 shrink-0 space-y-3">
            {/* Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-mono font-bold text-gray-dark">
                  {formatPrice(subtotal, currency, isAr)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{isAr ? 'الشحن السريع:' : 'Shipping:'}</span>
                <span className="font-bold text-gray-dark">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600">{isAr ? 'مجاني' : 'Free'}</span>
                  ) : (
                    <span className="font-mono">{formatPrice(shippingFee, currency, isAr)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-dark border-t border-gray-line pt-2">
                <span>{isAr ? 'المجموع الإجمالي:' : 'Estimated Total:'}</span>
                <span className="text-primary font-mono text-base font-black">
                  {formatPrice(grandTotal, currency, isAr)}
                </span>
              </div>
            </div>

            {/* Authentic & Warranty trust badge */}
            <div className="bg-emerald-50 border border-emerald-200/80 p-2 rounded-xl text-[11px] text-emerald-900 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isAr ? 'منتجات أصلية معتمدة مع الضمان وفاتورة رسمية' : 'Official certified hardware with warranty'}</span>
              </span>
            </div>

            {/* Checkout & Full Cart Buttons */}
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                <span>{isAr ? 'طلب وإصدار الفاتورة' : 'Request & Issue Invoice'}</span>
                <span className="font-mono text-xs bg-black/20 px-2 py-0.5 rounded">
                  {formatPrice(grandTotal, currency, isAr)}
                </span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  onClose();
                  onViewFullCart();
                }}
                className="w-full bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-xl border border-gray-300 transition-colors text-xs text-center"
              >
                {isAr ? 'عرض سلة المشتريات وتفاصيل الشحن' : 'View Full Cart & Shipping'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
