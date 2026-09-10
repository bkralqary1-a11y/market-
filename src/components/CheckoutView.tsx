import { useState, type FormEvent } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Tag,
  Building,
  Smartphone,
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

  // Form states
  const [fullName, setFullName] = useState('صدام صالح');
  const [phone, setPhone] = useState('+967 770 123 456');
  const [city, setCity] = useState('صنعاء');
  const [district, setDistrict] = useState('شارع حدة');
  const [street, setStreet] = useState('بجوار مركز التكنولوجيا - جولة الرويشان');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'kuraimi' | 'onecash' | 'mobile_money' | 'card'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.warrantyUpgrade ? 10000 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = subtotal === 0 || subtotal >= 50000 || discountPercent === 100 ? 0 : 3000;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const vatAmount = 0; // Not applicable or included

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
    }, 1200);
  };

  if (completedOrderId) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-line shadow-lg animate-in zoom-in-95 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {isAr ? 'تم تأكيد الدفع بنجاح' : 'Payment Confirmed'}
              </span>
              <h2 className="text-2xl font-black text-gray-dark mt-3 mb-1">
                {isAr ? 'شكراً لطلبك من إلكترولكس!' : 'Thank you for your order!'}
              </h2>
              <p className="text-xs text-gray-500">
                {isAr
                  ? `تم استلام طلبك برقم بوليصة (${completedOrderId}). أرسلنا تفاصيل الفاتورة الضريبية ورابط التتبع إلى هاتفك.`
                  : `Your order ${completedOrderId} has been processed successfully.`}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-line text-xs text-gray-600 space-y-2 text-left rtl:text-right">
              <div className="flex justify-between">
                <span className="text-gray-400">{isAr ? 'رقم الطلب:' : 'Order ID:'}</span>
                <span className="font-mono font-bold text-gray-dark">{completedOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{isAr ? 'المستلم:' : 'Customer:'}</span>
                <span className="font-bold text-gray-dark">{fullName} ({city})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{isAr ? 'طريقة الدفع:' : 'Payment:'}</span>
                <span className="font-bold text-primary">
                  {paymentMethod === 'apple_pay' ? 'Apple Pay' : paymentMethod === 'tabby' ? 'Tabby (4 دفعات)' : paymentMethod === 'tamara' ? 'Tamara (4 دفعات)' : 'بطاقة مدى / ائتمان'}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-line pt-2 text-sm font-extrabold text-gray-dark">
                <span>{isAr ? 'المبلغ الإجمالي المدفوع:' : 'Total Paid:'}</span>
                <span className="text-primary font-mono">{formatPrice(grandTotal, currency, isAr)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onBackToCart}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-all shadow"
              >
                {isAr ? 'العودة للمتجر ومتابعة التسوق' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Link */}
        <button
          onClick={onBackToCart}
          className="text-xs font-bold text-gray-500 hover:text-primary flex items-center gap-1.5 mb-6 transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة لسلة المشتريات' : 'Back to Cart'}</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-dark tracking-tight mb-8">
          {isAr ? 'إتمام الطلب والدفع الآمن' : 'Secure Checkout & Payment'}
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Main Info (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Delivery Address Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-line shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-line">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="text-sm sm:text-base font-extrabold text-gray-dark">
                  {isAr ? '1. عنوان الشحن والتوصيل السريع' : '1. Delivery Address'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'الاسم الثلاثي' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'رقم الجوال للتوصيل' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'المدينة' : 'City'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold text-gray-800"
                  >
                    <option value="صنعاء">صنعاء (توصيل فوري خلال 2-4 ساعات)</option>
                    <option value="عدن">عدن (توصيل فوري)</option>
                    <option value="تعز">تعز</option>
                    <option value="إب">إب</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="حضرموت - المكلا">حضرموت (المكلا / سيئون)</option>
                    <option value="مأرب">مأرب</option>
                    <option value="ذمار">ذمار</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'المنطقة / الحي' : 'District'}
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'العنوان بالتفصيل ورقم التواصل البديل' : 'Detailed Address & Alternate Phone'}
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Methods Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-line shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-line">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-dark">
                    {isAr ? '2. وسيلة الدفع أو التحويل' : '2. Payment Method'}
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'دفع آمن وموثوق' : 'Secure'}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {/* Cash on Delivery (COD) */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-gray-dark block">
                        {isAr ? 'الدفع نقداً عند الاستلام والفحص' : 'Cash on Delivery'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {isAr ? 'استلم جهازك وافحصه وتأكد من ملحقاته ثم ادفع للمندوب' : 'Inspect product before paying'}
                      </span>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg text-[10px]">
                    {isAr ? 'موصى به' : 'COD'}
                  </span>
                </label>

                {/* Kuraimi Express */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'kuraimi' ? 'border-orange-500 bg-orange-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'kuraimi'}
                      onChange={() => setPaymentMethod('kuraimi')}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-gray-dark block">
                        {isAr ? 'بنك الكريمي / حاسب / الكريمي إكسبرس' : 'Kuraimi Bank / Haseb'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {isAr ? 'تحويل فوري إلى رقم حساب المتجر أو عبر خدمة حاسب' : 'Direct Kuraimi transfer'}
                      </span>
                    </div>
                  </div>
                  <span className="bg-emerald-950 text-emerald-300 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-emerald-800">
                    الكريمي
                  </span>
                </label>

                {/* OneCash */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'onecash' ? 'border-orange-500 bg-orange-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'onecash'}
                      onChange={() => setPaymentMethod('onecash')}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-gray-dark block">
                        {isAr ? 'محفظة ون كاش (OneCash)' : 'OneCash Wallet'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {isAr ? 'دفع إلكتروني مباشر عبر محفظة ون كاش' : 'Direct electronic wallet payment'}
                      </span>
                    </div>
                  </div>
                  <span className="bg-blue-950 text-blue-300 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-blue-800">
                    OneCash
                  </span>
                </label>

                {/* Mobile Money */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'mobile_money' ? 'border-orange-500 bg-orange-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'mobile_money'}
                      onChange={() => setPaymentMethod('mobile_money')}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-gray-dark block">
                        {isAr ? 'محفظة موبايل موني / فلوسك' : 'Mobile Money / Floosak'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {isAr ? 'سداد فوري عبر المحافظ الإلكترونية اليمنية' : 'Yemeni digital wallets'}
                      </span>
                    </div>
                  </div>
                  <span className="bg-amber-950 text-amber-300 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-amber-800">
                    موبايل موني
                  </span>
                </label>

                {/* Bank Cards */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-orange-500 bg-orange-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-gray-dark block">
                        {isAr ? 'بطاقة بنكية دولية (فيزا / ماستركارد)' : 'Visa / Mastercard'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {isAr ? 'للمغتربين والطلبات الخارجية بالبطاقات البنكية' : 'International card payment'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-[10px]">
                    <span className="bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border">VISA</span>
                    <span className="bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border">Master</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right / Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-line shadow-sm space-y-5 sticky top-28">
              <h2 className="text-sm sm:text-base font-extrabold text-gray-dark pb-3 border-b border-gray-line">
                {isAr ? 'ملخص الفاتورة والطلبية' : 'Order Summary'}
              </h2>

              {/* Items preview list */}
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={item.product.image} alt={item.product.name} className="w-10 h-12 object-cover rounded-lg border shrink-0" />
                      <div className="truncate">
                        <h4 className="font-bold text-gray-dark truncate">{isAr ? item.product.nameAr : item.product.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {item.selectedVariant} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-dark shrink-0">
                      {formatPrice(
                        (item.product.price + (item.warrantyUpgrade ? 49 : 0)) * item.quantity,
                        currency,
                        isAr
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div className="pt-2 border-t border-gray-line">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={isAr ? 'كود الخصم (مثال: TECH10)' : 'Promo Code (TECH10)'}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-gray-300 text-xs font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    {isAr ? 'تطبيق' : 'Apply'}
                  </button>
                </div>
                {discountPercent > 0 && (
                  <span className="text-emerald-600 text-[11px] font-bold block mt-1.5">
                    {isAr ? `تم تطبيق خصم ${discountPercent}% بنجاح! ✓` : `Discount of ${discountPercent}% applied!`}
                  </span>
                )}
                {couponError && (
                  <span className="text-rose-600 text-[11px] font-bold block mt-1.5">
                    {couponError}
                  </span>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs border-t border-gray-line pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span className="font-mono font-bold text-gray-dark">{formatPrice(subtotal, currency, isAr)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{isAr ? 'قيمة الخصم:' : 'Discount:'}</span>
                    <span className="font-mono">-{formatPrice(discountAmount, currency, isAr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'الشحن السريع (أرامكس/سمسا):' : 'Shipping:'}</span>
                  <span className="font-bold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600">{isAr ? 'مجاني 🚀' : 'Free'}</span>
                    ) : (
                      formatPrice(shippingFee, currency, isAr)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>{isAr ? 'يشمل ضريبة القيمة المضافة (15%):' : 'Includes 15% VAT:'}</span>
                  <span className="font-mono">{formatPrice(vatAmount, currency, isAr)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-dark border-t border-gray-line pt-3">
                  <span>{isAr ? 'المجموع النهائي المطلوب:' : 'Grand Total:'}</span>
                  <span className="text-primary font-mono text-lg font-black">
                    {formatPrice(grandTotal, currency, isAr)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isAr ? 'جاري معالجة الدفع والطلب...' : 'Processing Payment...'}</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{isAr ? `تأكيد ودفع ${formatPrice(grandTotal, currency, isAr)}` : `Confirm & Pay ${formatPrice(grandTotal, currency, isAr)}`}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'معاملة دفع مشفرة ومضمونة 100%' : '100% Encrypted & Protected'}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
