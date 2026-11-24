import { useState, type FormEvent } from 'react';
import { Building2, ShieldCheck, CheckCircle2, FileText, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language, Currency } from '../types';
import { mockProducts, formatPrice } from '../data/mockData';

interface WholesaleViewProps {
  language: Language;
  currency: Currency;
  onBackToStore: () => void;
}

export default function WholesaleView({ language, currency, onBackToStore }: WholesaleViewProps) {
  const isAr = language === 'ar';
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('عمران / صنعاء');
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0].id);
  const [quantity, setQuantity] = useState(25);
  const [submitted, setSubmitted] = useState(false);

  const product = mockProducts.find((p) => p.id === selectedProduct) || mockProducts[0];
  const unitWholesalePrice = Math.round(
    product.price * (quantity >= 100 ? 0.72 : quantity >= 50 ? 0.8 : 0.88)
  );
  const totalWholesale = unitWholesalePrice * quantity;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-8 sm:py-10 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <button
          onClick={onBackToStore}
          className="text-xs font-bold text-slate-600 hover:text-[#0071e3] flex items-center gap-1.5 mb-6 transition-colors cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة لمتجر التجزئة الرئيسي' : 'Back to Retail Store'}</span>
        </button>

        {/* Deep Sapphire Liquid Glass Hero */}
        <div className="liquid-glass-dark text-white p-7 sm:p-11 rounded-[32px] mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-sky-300 tracking-wide block mb-2">
              {isAr ? 'بوابة الجملة والمحلات · محلات صدام العقاري' : 'Wholesale & Retail Partners'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mb-3 font-display">
              {isAr ? 'توريد الهواتف والملحقات بأسعار الجملة' : 'Bulk Smartphones & Accessories Supply'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'أسعار خاصة لأصحاب المحلات والشركات في كافة المحافظات اليمنية مع فواتير رسمية وضمان معتمد لكافة الهواتف والشواحن والكيابل والسماعات.'
                : 'Special wholesale tiers for resellers and businesses with official invoices and certified warranty.'}
            </p>
          </div>
          <div className="absolute left-0 bottom-0 opacity-10 pointer-events-none">
            <Building2 className="w-64 h-64 text-sky-300" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Quote Form */}
          <div className="lg:col-span-2">
            <div className="liquid-glass-strong p-6 sm:p-8 rounded-[28px]">
              <h2 className="text-base sm:text-lg font-black text-[#0b1220] mb-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0071e3]" />
                <span>{isAr ? 'طلب تسعيرة جملة فورية' : 'Request Bulk Quotation'}</span>
              </h2>
              <p className="text-xs text-slate-600 mb-6">
                {isAr
                  ? 'املأ بيانات المحل أو المؤسسة للتواصل المباشر وتأكيد الكمية.'
                  : 'Submit your shop details to receive a direct wholesale quote.'}
              </p>

              {submitted ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 bg-emerald-500/15 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-400/30">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-black text-[#0b1220] mb-2">
                    {isAr ? 'تم استلام طلب التسعيرة بنجاح' : 'Quotation Request Received'}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
                    {isAr
                      ? `شكراً لك ${contactName}. تم تسجيل طلبك لعدد (${quantity} قطعة) وسيتواصل معك فريق الجملة قريباً.`
                      : `Thank you, ${contactName}. Our wholesale team will reach out shortly.`}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="liquid-btn-primary text-xs font-extrabold py-2.5 px-6 rounded-2xl cursor-pointer"
                  >
                    {isAr ? 'طلب تسعيرة لمنتج آخر' : 'Request Another Quote'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {isAr ? 'اسم المحل / المؤسسة' : 'Shop / Company Name'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isAr ? 'مثال: محلات النجم للاتصالات' : 'Company name'}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {isAr ? 'اسم مسؤول المشتريات' : 'Contact Person'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isAr ? 'الاسم الكريم' : 'Full name'}
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {isAr ? 'رقم الجوال / واتساب' : 'Phone / WhatsApp'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="77XXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] font-mono focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {isAr ? 'المحافظة / المدينة' : 'City'}
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/60">
                    <h4 className="font-extrabold text-[#0b1220] mb-3">
                      {isAr ? 'اختر المنتج والكمية المطلوبة:' : 'Select Product & Quantity:'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-600 block mb-1">
                          {isAr ? 'المنتج' : 'Product'}
                        </label>
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 font-bold text-xs text-[#0b1220]"
                        >
                          {mockProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.brand}] {isAr ? p.nameAr : p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600 block mb-1 tabular-nums">
                          {isAr ? `الكمية: ${quantity} قطعة` : `Quantity: ${quantity} units`}
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="5"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full accent-[#0071e3] mt-2 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>10 (-12%)</span>
                          <span>50 (-20%)</span>
                          <span>100+ (-28%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="liquid-btn-primary w-full font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isAr ? 'إرسال طلب تسعيرة الجملة' : 'Submit Wholesale Request'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div>
            <div className="liquid-glass-strong p-6 rounded-[28px] sticky top-28 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/60">
                <h3 className="text-sm font-black text-[#0b1220]">
                  {isAr ? 'تقدير تسعيرة الجملة' : 'Wholesale Estimate'}
                </h3>
                <span className="text-xs font-extrabold text-emerald-700">
                  {quantity >= 100
                    ? isAr ? 'خصم 28%' : '28% Off'
                    : quantity >= 50
                    ? isAr ? 'خصم 20%' : '20% Off'
                    : isAr ? 'خصم 12%' : '12% Off'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-16 object-cover rounded-xl border border-white/80 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#0071e3] font-bold uppercase">
                    {product.brand}
                  </span>
                  <h4 className="text-xs font-extrabold text-[#0b1220] truncate">
                    {isAr ? product.nameAr : product.name}
                  </h4>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {isAr
                      ? `التجزئة: ${formatPrice(product.price, currency, isAr)}`
                      : `Retail: ${formatPrice(product.price, currency, isAr)}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-white/60 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>{isAr ? 'سعر القطعة للجملة:' : 'Unit Price:'}</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-700">
                    {formatPrice(unitWholesalePrice, currency, isAr)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isAr ? 'الكمية:' : 'Quantity:'}</span>
                  <span className="font-mono tabular-nums font-bold text-[#0b1220]">
                    {quantity} {isAr ? 'قطعة' : 'units'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-[#0b1220] border-t border-white/60 pt-3">
                  <span>{isAr ? 'الإجمالي المقدر:' : 'Estimated Total:'}</span>
                  <span className="font-mono tabular-nums text-[#0071e3]">
                    {formatPrice(totalWholesale, currency, isAr)}
                  </span>
                </div>
              </div>

              <div className="liquid-glass-subtle p-3.5 rounded-2xl text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 text-[#0b1220] font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'مزايا شركاء الجملة:' : 'Wholesale Benefits:'}</span>
                </div>
                <p>{isAr ? '· شحن آمن ومباشر إلى كافة المحافظات' : '· Direct shipping across Yemen'}</p>
                <p>{isAr ? '· ضمان رسمي وفواتير معتمدة' : '· Official warranty & invoices'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
