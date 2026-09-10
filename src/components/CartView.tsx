import { useState, type FormEvent } from 'react';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag, Tag, Check, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { CartItem, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';

interface CartViewProps {
  cart: CartItem[];
  language: Language;
  currency: Currency;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onToggleWarranty?: (index: number) => void;
  onContinueShopping: () => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string) => void;
}

export default function CartView({
  cart,
  language,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onToggleWarranty,
  onContinueShopping,
  onProceedToCheckout,
}: CartViewProps) {
  const isAr = language === 'ar';

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  // Math Calculations
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 49 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const discountRate = appliedCoupon === 'TECH10' ? 0.1 : appliedCoupon === 'VIP20' ? 0.2 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const shippingCost = subtotal >= 200 || subtotal === 0 ? 0 : 25;
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
    return (
      <div id="empty-cart-state" className="py-20 bg-gray-50 min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4 text-center max-w-md bg-white p-10 rounded-3xl border border-gray-line shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-dark mb-2">
            {isAr ? 'سلة التسوق فارغة حالياً' : 'Your Shopping Cart is Empty'}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mb-6 leading-relaxed">
            {isAr
              ? 'لم تقم بإضافة أي أجهزة أو ملحقات إلى السلة بعد. استكشف أقسام الهواتف والشواحن والكيابل.'
              : 'Explore our latest smartphones, headphones, cases, chargers, and cables.'}
          </p>
          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs md:text-sm px-7 py-3 rounded-xl transition-colors shadow-md"
          >
            <span>{isAr ? 'تصفح المتجر والبدء بالشراء' : 'Start Shopping'}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-view-container" className="py-10 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-line">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-dark">
              {isAr ? 'سلة التسوق' : 'Shopping Cart'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isAr
                ? `لديك ${cart.reduce((s, i) => s + i.quantity, 0)} قطع في سلتك`
                : `You have ${cart.reduce((s, i) => s + i.quantity, 0)} items in your cart`}
            </p>
          </div>
          <button
            onClick={onContinueShopping}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-primary transition-colors"
          >
            <span>{isAr ? 'مواصلة التسوق' : 'Continue Shopping'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Layout: Items Table (2/3) & Order Summary (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-line overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-line">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    {/* Item Image */}
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-line shrink-0 p-1">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow min-w-0 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-primary uppercase">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-gray-400 hover:text-rose-600 transition-colors"
                          title={isAr ? 'حذف من السلة' : 'Remove item'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-extrabold text-gray-dark text-sm sm:text-base truncate mb-1">
                        {isAr ? item.product.nameAr : item.product.name}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-mono font-bold">
                          {item.selectedVariant}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"
                            style={{ backgroundColor: item.selectedColor }}
                          />
                        </span>
                      </div>

                      {/* Stepper & Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-gray-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="w-8 h-8 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-base sm:text-lg font-black text-primary font-mono">
                          {formatPrice(
                            (item.product.price + (item.warrantyUpgrade ? 49 : 0)) * item.quantity,
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
            <div className="bg-white p-5 rounded-3xl border border-gray-line shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="text-xs md:text-sm font-bold text-gray-dark">
                  {isAr ? 'هل لديك كود خصم ترويجي؟' : 'Have a Promo or Coupon Code?'}
                </h3>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isAr ? `تم تطبيق الكوبون (${appliedCoupon}) بخصم ${(discountRate * 100)}%` : `Coupon (${appliedCoupon}) applied for ${(discountRate * 100)}% off!`}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:underline font-bold"
                  >
                    {isAr ? 'إلغاء الكود' : 'Remove'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={isAr ? 'أدخل الكود (مثال: TECH10 أو VIP20)' : 'Enter code (e.g. TECH10 or VIP20)'}
                    className="flex-grow uppercase text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-tech-dark hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shrink-0"
                  >
                    {isAr ? 'تطبيق' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && <p className="text-[11px] text-red-600 mt-2 font-medium">{couponError}</p>}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white p-6 rounded-3xl border border-gray-line shadow-sm sticky top-24 space-y-4">
              <h3 className="text-base font-extrabold text-gray-dark pb-3 border-b border-gray-line">
                {isAr ? 'ملخص الفاتورة' : 'Order Summary'}
              </h3>

              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span className="font-bold font-mono text-gray-dark">{formatPrice(subtotal, currency, isAr)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{isAr ? `خصم الكوبون (${appliedCoupon}):` : `Discount (${appliedCoupon}):`}</span>
                    <span className="font-mono">-{formatPrice(discountAmount, currency, isAr)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{isAr ? 'الشحن السريع:' : 'Shipping:'}</span>
                  <span className="font-bold text-gray-dark">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-bold">{isAr ? 'مجاني 🚀' : 'Free'}</span>
                    ) : (
                      formatPrice(shippingCost, currency, isAr)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-line flex justify-between text-sm md:text-base font-black text-gray-dark">
                  <span>{isAr ? 'الإجمالي الكلي:' : 'Grand Total:'}</span>
                  <span className="text-primary font-mono text-xl">{formatPrice(grandTotal, currency, isAr)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-proceed-checkout-btn"
                onClick={() => onProceedToCheckout(discountAmount, appliedCoupon || '')}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>{isAr ? 'متابعة إلى الدفع الآمن' : 'Proceed to Checkout'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center text-[11px] text-gray-400 space-y-1 pt-1">
                <p>{isAr ? '🔒 دفع إلكتروني آمن ومشفر 100%' : '🔒 Safe & Secure 256-Bit SSL'}</p>
                <p>{isAr ? 'شحن مجاني على كل طلب أكثر من 200 ر.س' : 'Free shipping for orders over 200 SAR'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
