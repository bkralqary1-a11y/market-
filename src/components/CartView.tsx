import { useState, type FormEvent } from 'react';
import {
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Zap,
  Headphones,
  Cable,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { CartItem, Language, Currency, CategoryId } from '../types';
import { formatPrice } from '../data/mockData';

interface CartViewProps {
  cart: CartItem[];
  language: Language;
  currency: Currency;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onToggleWarranty?: (index: number) => void;
  onContinueShopping: () => void;
  onSelectCategory?: (category: CategoryId) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string) => void;
}

export default function CartView({
  cart,
  language,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onContinueShopping,
  onSelectCategory,
  onProceedToCheckout,
}: CartViewProps) {
  const isAr = language === 'ar';

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 10000 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const discountRate = appliedCoupon === 'TECH10' ? 0.1 : appliedCoupon === 'VIP20' ? 0.2 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const shippingCost = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === 'TECH10' || code === 'VIP20' || code === 'FREESHIP') {
      setAppliedCoupon(code);
      setCouponError('');
    } else {
      setCouponError(isAr ? 'كود الخصم غير صالح أو منتهي الصلاحية' : 'Invalid or expired promo code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  if (cart.length === 0) {
    const quickCategories: { id: CategoryId; nameAr: string; nameEn: string; icon: typeof Smartphone }[] = [
      { id: 'phones', nameAr: 'الهواتف الذكية', nameEn: 'Smartphones', icon: Smartphone },
      { id: 'chargers', nameAr: 'شواحن GaN', nameEn: 'Fast Chargers', icon: Zap },
      { id: 'audio', nameAr: 'سماعات وصوتيات', nameEn: 'Audio & Earbuds', icon: Headphones },
      { id: 'cables', nameAr: 'كيابل الشحن السريع', nameEn: 'High-speed Cables', icon: Cable },
      { id: 'cases', nameAr: 'كفرات وحماية', nameEn: 'Cases & Shields', icon: ShieldCheck },
    ];

    return (
      <div id="empty-cart-state" className="py-12 sm:py-16 min-h-[75vh] flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="liquid-glass-strong p-6 sm:p-10 rounded-[32px] text-center">
            <div className="w-20 h-20 rounded-3xl liquid-btn-primary flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#0b1220] mb-3 tracking-tight">
              {isAr ? 'سلة مشترياتك فارغة حالياً' : 'Your Shopping Cart is Empty'}
            </h2>
            <p className="text-sm text-slate-600 mb-7 max-w-lg mx-auto leading-relaxed">
              {isAr
                ? 'استكشف أحدث الهواتف الذكية المعتمدة، الشواحن السريعة، السماعات الأصلية وكافة الملحقات بضمان رسمي وفاتورة معتمدة.'
                : 'Explore genuine smartphones, fast GaN chargers, audio gear, and certified accessories backed by official warranty.'}
            </p>

            <div className="mb-8">
              <button
                id="empty-cart-browse-btn"
                onClick={onContinueShopping}
                className="liquid-btn-primary inline-flex items-center justify-center gap-2.5 font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-2xl cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isAr ? 'تصفح المنتجات' : 'Browse Products'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            <div className="border-t border-white/60 pt-6">
              <p className="text-xs font-bold text-slate-500 mb-3.5">
                {isAr ? 'أو تصفح مباشرة حسب القسم:' : 'Or jump into a category:'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {quickCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat.id);
                        else onContinueShopping();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 liquid-glass-subtle hover:bg-white hover:text-[#0071e3] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 pt-5 border-t border-white/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-600">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'أجهزة أصلية 100%' : '100% Authentic'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0071e3] shrink-0" />
                <span>{isAr ? 'ضمان رسمي معتمد' : 'Official Warranty'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
                <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{isAr ? 'توصيل فوري مباشر' : 'Fast Delivery'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-view-container" className="py-8 sm:py-10 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-7 pb-4 border-b border-white/60">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0b1220]">
              {isAr ? 'سلة التسوق' : 'Shopping Cart'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 tabular-nums">
              {isAr
                ? `لديك ${cart.reduce((s, i) => s + i.quantity, 0)} قطع في سلتك`
                : `You have ${cart.reduce((s, i) => s + i.quantity, 0)} items in your cart`}
            </p>
          </div>
          <button
            onClick={onContinueShopping}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#0071e3] transition-colors cursor-pointer"
          >
            <span>{isAr ? 'مواصلة التسوق' : 'Continue Shopping'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="liquid-glass-strong rounded-[28px] overflow-hidden">
              <div className="divide-y divide-white/60">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
                  >
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden liquid-glass-subtle shrink-0 p-1">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <div className="flex-grow min-w-0 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#0071e3] uppercase">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title={isAr ? 'حذف من السلة' : 'Remove item'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-extrabold text-[#0b1220] text-sm sm:text-base truncate mb-1">
                        {isAr ? item.product.nameAr : item.product.name}
                      </h3>

                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-3">
                        <span className="font-mono font-bold">{item.selectedVariant}</span>
                        <span>·</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: item.selectedColor }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center liquid-glass-subtle rounded-xl overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 hover:bg-white/70 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-mono tabular-nums font-bold text-[#0b1220]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="w-8 h-8 hover:bg-white/70 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-base sm:text-lg font-black text-[#0071e3] font-mono tabular-nums">
                          {formatPrice(
                            (item.product.price + (item.warrantyUpgrade ? 10000 : 0)) * item.quantity,
                            currency,
                            isAr
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Box */}
            <div className="liquid-glass-strong p-5 rounded-[26px]">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#0071e3]" />
                <h3 className="text-xs md:text-sm font-extrabold text-[#0b1220]">
                  {isAr ? 'هل لديك كود خصم ترويجي؟' : 'Have a Promo Code?'}
                </h3>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isAr
                        ? `تم تطبيق الكوبون (${appliedCoupon}) بخصم ${discountRate * 100}%`
                        : `Coupon (${appliedCoupon}) applied (${discountRate * 100}% off)`}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Remove'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={isAr ? 'أدخل الكود (مثال: TECH10 أو VIP20)' : 'Enter code (TECH10 or VIP20)'}
                    className="flex-grow uppercase text-xs px-3.5 py-2.5 rounded-xl border border-white/80 bg-white/75 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 font-mono text-[#0b1220]"
                  />
                  <button
                    type="submit"
                    className="liquid-glass-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl shrink-0 cursor-pointer"
                  >
                    {isAr ? 'تطبيق' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && <p className="text-[11px] text-rose-600 mt-2 font-semibold">{couponError}</p>}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="liquid-glass-strong p-6 rounded-[28px] sticky top-28 space-y-4">
              <h3 className="text-base font-black text-[#0b1220] pb-3 border-b border-white/60">
                {isAr ? 'ملخص الفاتورة' : 'Order Summary'}
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span className="font-bold font-mono tabular-nums text-[#0b1220]">
                    {formatPrice(subtotal, currency, isAr)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>{isAr ? `خصم (${appliedCoupon}):` : `Discount (${appliedCoupon}):`}</span>
                    <span className="font-mono tabular-nums">-{formatPrice(discountAmount, currency, isAr)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{isAr ? 'الشحن السريع:' : 'Shipping:'}</span>
                  <span className="font-bold text-[#0b1220]">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600">{isAr ? 'مجاني' : 'Free'}</span>
                    ) : (
                      <span className="font-mono tabular-nums">{formatPrice(shippingCost, currency, isAr)}</span>
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/60 flex justify-between text-sm md:text-base font-black text-[#0b1220]">
                  <span>{isAr ? 'الإجمالي الكلي:' : 'Grand Total:'}</span>
                  <span className="text-[#0071e3] font-mono tabular-nums text-xl">
                    {formatPrice(grandTotal, currency, isAr)}
                  </span>
                </div>
              </div>

              <button
                id="cart-proceed-checkout-btn"
                onClick={() => onProceedToCheckout(discountAmount, appliedCoupon || '')}
                className="liquid-btn-primary w-full font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>{isAr ? 'متابعة إلى إتمام الطلب' : 'Proceed to Checkout'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-center text-[11px] text-slate-500 pt-1">
                {isAr ? 'ضمان رسمي معتمد وفاتورة شراء موثقة' : 'Official warranty & verified invoice'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
