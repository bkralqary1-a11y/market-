import { useState, type FormEvent } from 'react';
import { Building2, ShieldCheck, CheckCircle2, FileText, Send, ArrowRight, ArrowLeft, Download } from 'lucide-react';
import { Language, Currency } from '../types';
import { mockProducts, formatPrice } from '../data/mockData';

interface WholesaleViewProps {
  language: Language;
  currency: Currency;
  onBackToStore: () => void;
}

export default function WholesaleView({ language, currency, onBackToStore }: WholesaleViewProps) {
  const isAr = language === 'ar';
  const [companyName, setCompanyName] = useState('مؤسسة آفاق التقنية للاتصالات');
  const [taxNumber, setTaxNumber] = useState('301294827100003');
  const [contactName, setContactName] = useState('سلمان المنصور');
  const [phone, setPhone] = useState('+966 50 987 6543');
  const [email, setEmail] = useState('salman@afaq-tech.com');
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0].id);
  const [quantity, setQuantity] = useState(25);
  const [submitted, setSubmitted] = useState(false);

  const product = mockProducts.find((p) => p.id === selectedProduct) || mockProducts[0];
  const unitWholesalePrice = product.price * (quantity >= 100 ? 0.72 : quantity >= 50 ? 0.8 : 0.88);
  const totalWholesale = unitWholesalePrice * quantity;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back link */}
        <button
          onClick={onBackToStore}
          className="text-xs font-bold text-gray-500 hover:text-primary flex items-center gap-1.5 mb-6 transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة لمتجر التجزئة الرئيسي' : 'Back to Retail Store'}</span>
        </button>

        {/* Hero Banner for Wholesale */}
        <div className="bg-tech-dark text-white p-8 sm:p-12 rounded-3xl mb-8 relative overflow-hidden shadow-xl border border-white/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-amber-400/30">
              <Building2 className="w-4 h-4" />
              <span>{isAr ? 'بوابة الشركات ومبيعات الجملة B2B' : 'B2B Wholesale Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mb-3 font-display">
              {isAr ? 'حلول توريد الإلكترونيات والهواتف بالجملة' : 'Enterprise & Bulk Electronics Supply'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {isAr
                ? 'أسعار خاصة لتجار التجزئة، الشركات، والجهات الحكومية مع فواتير ضريبية نظامية وضمان الوكيل سنتين لكافة الشواحن، الكيابل، الكفرات، والهواتف الأصلية.'
                : 'Preferred corporate tiers, bulk quotation discounts, certified 2-year warranty, and instant VAT invoice generation.'}
            </p>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Building2 className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Wholesale Calculator & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Instant Bulk Quote Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-line shadow-sm">
              <h2 className="text-base sm:text-lg font-black text-gray-dark mb-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>{isAr ? 'طلب عرض سعر فوري مخصص' : 'Request Instant Bulk Quotation'}</span>
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                {isAr
                  ? 'املأ بيانات المنشأة للحصول على تسعيرة رسمية مختومة موجهة لشركتك مباشرة.'
                  : 'Submit your organization details to receive an official formal quote.'}
              </p>

              {submitted ? (
                <div className="py-10 text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-gray-dark mb-2">
                    {isAr ? 'تم استلام طلب التسعيرة بنجاح!' : 'Quotation Request Received!'}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                    {isAr
                      ? `شكراً لك أ. ${contactName}. تم إنشاء عرض السعر المبدئي للكمية (${quantity} قطعة) وأُرسل إلى بريدك ${email}. سيتواصل معك مدير حسابك المخصص خلال ساعتي عمل.`
                      : `Thank you, ${contactName}. An automated formal quote has been sent to ${email}.`}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow"
                  >
                    {isAr ? 'تقديم طلب تسعيرة لمنتج آخر' : 'Request Another Quote'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {isAr ? 'اسم الشركة / المؤسسة' : 'Company Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {isAr ? 'الرقم الضريبي (VAT ID)' : 'Tax Number'}
                      </label>
                      <input
                        type="text"
                        required
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {isAr ? 'اسم مسؤول المشتريات' : 'Contact Person'}
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {isAr ? 'رقم هاتف التواصل' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-gray-700 block mb-1">
                        {isAr ? 'البريد الإلكتروني للعمل' : 'Corporate Email'}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Product & Quantity Selector */}
                  <div className="pt-4 border-t border-gray-line">
                    <h4 className="font-bold text-gray-dark mb-3">
                      {isAr ? 'اختر المنتج والكمية المطلوبة:' : 'Select Product & Bulk Quantity:'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-gray-600 block mb-1">
                          {isAr ? 'المنتج' : 'Product'}
                        </label>
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-xs"
                        >
                          {mockProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.brand}] {isAr ? p.nameAr : p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-gray-600 block mb-1">
                          {isAr ? `الكمية (الحد الأدنى 10 قطع): ${quantity} قطعة` : `Quantity: ${quantity} units`}
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="5"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full accent-primary mt-2"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                          <span>10 قطع (-12%)</span>
                          <span>50 قطعة (-20%)</span>
                          <span>100+ قطعة (-28%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isAr ? 'إرسال طلب التسعيرة الرسمية الفورية' : 'Request Quotation Document'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Col: Pricing Summary Card */}
          <div>
            <div className="bg-white p-6 rounded-3xl border border-gray-line shadow-sm sticky top-28 space-y-4">
              <h3 className="text-sm font-extrabold text-gray-dark pb-3 border-b border-gray-line flex items-center justify-between">
                <span>{isAr ? 'تقدير تسعيرة الجملة' : 'Wholesale Estimate'}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  {quantity >= 100 ? (isAr ? 'خصم 28%' : '28% Off') : quantity >= 50 ? (isAr ? 'خصم 20%' : '20% Off') : (isAr ? 'خصم 12%' : '12% Off')}
                </span>
              </h3>

              <div className="flex items-center gap-3">
                <img src={product.image} alt={product.name} className="w-14 h-16 object-cover rounded-xl border" />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-primary font-bold uppercase">{product.brand}</span>
                  <h4 className="text-xs font-bold text-gray-dark truncate">{isAr ? product.nameAr : product.name}</h4>
                  <span className="text-xs text-gray-400 font-mono">
                    {isAr ? `سعر التجزئة: ${formatPrice(product.price, currency, isAr)}` : `Retail: ${formatPrice(product.price, currency, isAr)}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-gray-line pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'سعر القطعة للجملة:' : 'Wholesale Unit Price:'}</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatPrice(unitWholesalePrice, currency, isAr)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'الكمية المطلوبة:' : 'Quantity:'}</span>
                  <span className="font-mono font-bold text-gray-dark">{quantity} {isAr ? 'قطعة' : 'units'}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'الضمان المعتمد:' : 'Warranty:'}</span>
                  <span className="font-bold text-gray-dark">{isAr ? 'سنتان وكيل رسمي' : '2-Year Official'}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-dark border-t border-gray-line pt-3">
                  <span>{isAr ? 'إجمالي الطلبية المقدر:' : 'Estimated Total:'}</span>
                  <span className="font-mono text-primary">{formatPrice(totalWholesale, currency, isAr)}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'مزايا حسابات الشركات المعتمدة:' : 'B2B Partner Benefits:'}</span>
                </div>
                <p>{isAr ? '• شحن شاحنات مجاني حتى باب المستودع' : '• Free freight delivery'}</p>
                <p>{isAr ? '• شروط دفع ائتمانية مؤجلة (30-60 يوماً للجهات المعتمدة)' : '• Net 30/60 day terms'}</p>
                <p>{isAr ? '• فواتير ضريبية إلكترونية متوافقة مع هيئة الزكاة والضريبة' : '• Full ZATCA compliant invoices'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
