import { useState, type FormEvent } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { CartItem, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';

interface CheckoutViewProps {
  cart: CartItem[];
  language: Language;
  currency: Currency;
  onBackToCart: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export default function CheckoutView({
  cart,
  language,
  currency,
  onBackToCart,
  onOrderSuccess,
}: CheckoutViewProps) {
  const isAr = language === 'ar';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('صنعاء');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'kuraimi' | 'onecash' | 'mobile_money' | 'card'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 10000 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = subtotal === 0 || subtotal >= 50000 || discountPercent === 100 ? 0 : 3000;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'TECH10') {
      setDiscountPercent(10);
    } else if (code === 'VIP20') {
      setDiscountPercent(20);
    } else if (code === 'FREESHIP') {
      setDiscountPercent(5);
    } else {
      setCouponError(isAr ? 'كود الخصم غير صالح أو منتهي الصلاحية' : 'Invalid coupon code');
    }
  };

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setIsProcessing(false);
      setCompletedOrderId(newOrderId);
      onOrderSuccess(newOrderId);
    }, 900);
  };

  const getPaymentLabel = () => {
    switch (paymentMethod) {
      case 'kuraimi':
        return isAr ? 'بنك الكريمي' : 'Kuraimi Bank';
      case 'onecash':
        return 'OneCash';
      case 'mobile_money':
        return isAr ? 'موبايل موني' : 'Mobile Money';
      case 'cod':
        return isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery';
      case 'card':
        return isAr ? 'بطاقة بنكية / حوالة' : 'Card / Transfer';
    }
  };

  if (completedOrderId) {
    return (
      <div className="py-14 min-h-screen">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <div className="liquid-glass-strong p-8 sm:p-10 rounded-[32px] space-y-6">
            <div className="w-20 h-20 bg-emerald-500/15 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-400/30">
              <CheckCircle2 className="w-11 h-11" />
            </div>

            <div>
              <span className="text-xs font-extrabold text-emerald-700">
                {isAr ? 'تم تأكيد الطلب بنجاح' : 'Order Confirmed'}
              </span>
              <h2 className="text-2xl font-black text-[#0b1220] mt-2 mb-1">
                {isAr ? 'شكراً لطلبك من متجر صدام العقاري' : 'Thank you for your order'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? `تم تسجيل طلبك برقم (${completedOrderId}). سيتواصل معك فريقنا لتأكيد التوصيل.`
                  : `Your order ${completedOrderId} has been recorded. Our team will contact you shortly.`}
              </p>
            </div>

            <div className="liquid-glass-subtle p-4 rounded-2xl text-xs text-slate-600 space-y-2 text-left rtl:text-right">
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'رقم الطلب:' : 'Order ID:'}</span>
                <span className="font-mono font-bold text-[#0b1220]">{completedOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'المستلم:' : 'Customer:'}</span>
                <span className="font-bold text-[#0b1220]">
                  {fullName} ({city})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'طريقة الدفع:' : 'Payment:'}</span>
                <span className="font-bold text-[#0071e3]">{getPaymentLabel()}</span>
              </div>
              <div className="flex justify-between border-t border-white/60 pt-2 text-sm font-black text-[#0b1220]">
                <span>{isAr ? 'المبلغ الإجمالي:' : 'Total:'}</span>
                <span className="text-[#0071e3] font-mono tabular-nums">
                  {formatPrice(grandTotal, currency, isAr)}
                </span>
              </div>
            </div>

            <button
              onClick={onBackToCart}
              className="liquid-btn-primary w-full font-extrabold py-3.5 px-6 rounded-2xl cursor-pointer text-sm"
            >
              {isAr ? 'العودة للمتجر ومتابعة التسوق' : 'Continue Shopping'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-10 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <button
          onClick={onBackToCart}
          className="text-xs font-bold text-slate-600 hover:text-[#0071e3] flex items-center gap-1.5 mb-6 transition-colors cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة لسلة المشتريات' : 'Back to Cart'}</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-[#0b1220] tracking-tight mb-7">
          {isAr ? 'إتمام الطلب والدفع الآمن' : 'Secure Checkout'}
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Card */}
            <div className="liquid-glass-strong p-6 rounded-[28px] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/60">
                <Truck className="w-5 h-5 text-[#0071e3]" />
                <h2 className="text-sm sm:text-base font-extrabold text-[#0b1220]">
                  {isAr ? '1. بيانات المستلم وعنوان التوصيل' : '1. Delivery Address'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'الاسم الثلاثي...' : 'Your full name'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'رقم الجوال للتوصيل' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="77XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'المحافظة / المدينة' : 'City'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 font-bold text-[#0b1220]"
                  >
                    <option value="صنعاء">صنعاء (توصيل فوري)</option>
                    <option value="عمران">عمران (استلام من المحل أو توصيل فوري)</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="إب">إب</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="حضرموت">حضرموت</option>
                    <option value="ذمار">ذمار</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'المنطقة / الحي' : 'District'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'الشارع أو الحي...' : 'District'}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'العنوان بالتفصيل وأقرب معلم' : 'Detailed Address'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'تفاصيل العنوان لتسهيل وصول المندوب...' : 'Landmark / street details'}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="liquid-glass-strong p-6 rounded-[28px] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/60">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0071e3]" />
                  <h2 className="text-sm sm:text-base font-extrabold text-[#0b1220]">
                    {isAr ? '2. وسيلة الدفع أو التحويل' : '2. Payment Method'}
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'دفع موثوق' : 'Secure'}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    id: 'cod' as const,
                    titleAr: 'الدفع نقداً عند الاستلام والفحص',
                    titleEn: 'Cash on Delivery',
                    descAr: 'افحص جهازك وتأكد من ملحقاته ثم ادفع للمندوب',
                    descEn: 'Inspect product before paying',
                    tag: isAr ? 'موصى به' : 'COD',
                  },
                  {
                    id: 'kuraimi' as const,
                    titleAr: 'بنك الكريمي / حاسب',
                    titleEn: 'Kuraimi Bank / Haseb',
                    descAr: 'تحويل مباشر إلى رقم حساب المتجر الرسمي',
                    descEn: 'Direct Kuraimi transfer',
                    tag: 'الكريمي',
                  },
                  {
                    id: 'onecash' as const,
                    titleAr: 'محفظة ون كاش (OneCash)',
                    titleEn: 'OneCash Wallet',
                    descAr: 'دفع إلكتروني مباشر عبر ون كاش',
                    descEn: 'Direct wallet payment',
                    tag: 'OneCash',
                  },
                  {
                    id: 'mobile_money' as const,
                    titleAr: 'محفظة موبايل موني / فلوسك',
                    titleEn: 'Mobile Money / Floosak',
                    descAr: 'سداد فوري عبر المحافظ الإلكترونية اليمنية',
                    descEn: 'Local digital wallets',
                    tag: 'موبايل موني',
                  },
                  {
                    id: 'card' as const,
                    titleAr: 'حوالة مالية / بطاقة دولية',
                    titleEn: 'Transfer / International Card',
                    descAr: 'للمغتربين والطلبات عبر شبكات الحوالات المحلية',
                    descEn: 'Transfer or card payment',
                    tag: 'Transfer',
                  },
                ].map((opt) => {
                  const selected = paymentMethod === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        selected
                          ? 'border-[#0071e3] bg-[#0071e3]/10'
                          : 'border-white/80 bg-white/55 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={selected}
                          onChange={() => setPaymentMethod(opt.id)}
                          className="accent-[#0071e3] w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <span className="font-extrabold text-[#0b1220] block">
                            {isAr ? opt.titleAr : opt.titleEn}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            {isAr ? opt.descAr : opt.descEn}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#0071e3] shrink-0">{opt.tag}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Order Summary */}
          <div className="lg:col-span-5">
            <div className="liquid-glass-strong p-6 rounded-[28px] space-y-5 sticky top-28">
              <h2 className="text-sm sm:text-base font-black text-[#0b1220] pb-3 border-b border-white/60">
                {isAr ? 'ملخص الفاتورة والطلبية' : 'Order Summary'}
              </h2>

              <div className="divide-y divide-white/60 max-h-56 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-12 object-cover rounded-xl border border-white/80 shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="font-bold text-[#0b1220] truncate">
                          {isAr ? item.product.nameAr : item.product.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.selectedVariant} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums font-bold text-[#0b1220] shrink-0">
                      {formatPrice(
                        (item.product.price + (item.warrantyUpgrade ? 10000 : 0)) * item.quantity,
                        currency,
                        isAr
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="pt-2 border-t border-white/60">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={isAr ? 'كود الخصم (TECH10)' : 'Promo Code (TECH10)'}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-white/80 bg-white/80 text-xs font-mono uppercase text-[#0b1220]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="liquid-glass-dark text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    {isAr ? 'تطبيق' : 'Apply'}
                  </button>
                </div>
                {discountPercent > 0 && (
                  <span className="text-emerald-700 text-[11px] font-bold block mt-1.5">
                    {isAr ? `تم تطبيق خصم ${discountPercent}% ✓` : `Discount of ${discountPercent}% applied`}
                  </span>
                )}
                {couponError && (
                  <span className="text-rose-600 text-[11px] font-bold block mt-1.5">{couponError}</span>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-xs border-t border-white/60 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span className="font-mono tabular-nums font-bold text-[#0b1220]">
                    {formatPrice(subtotal, currency, isAr)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>{isAr ? 'قيمة الخصم:' : 'Discount:'}</span>
                    <span className="font-mono tabular-nums">-{formatPrice(discountAmount, currency, isAr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>{isAr ? 'الشحن السريع:' : 'Shipping:'}</span>
                  <span className="font-bold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600">{isAr ? 'مجاني' : 'Free'}</span>
                    ) : (
                      <span className="font-mono tabular-nums">{formatPrice(shippingFee, currency, isAr)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-[#0b1220] border-t border-white/60 pt-3">
                  <span>{isAr ? 'المجموع النهائي:' : 'Grand Total:'}</span>
                  <span className="text-[#0071e3] font-mono tabular-nums text-lg font-black">
                    {formatPrice(grandTotal, currency, isAr)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="liquid-btn-primary w-full font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isAr ? 'جاري تأكيد الطلب...' : 'Confirming Order...'}</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {isAr
                        ? `تأكيد الطلب (${formatPrice(grandTotal, currency, isAr)})`
                        : `Confirm Order (${formatPrice(grandTotal, currency, isAr)})`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'طلب آمن مع ضمان الفحص عند الاستلام' : 'Safe order with inspection on delivery'}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
