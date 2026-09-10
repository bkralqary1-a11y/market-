import { Zap, ShieldCheck, Truck, RotateCcw, Headphones, Phone, Mail, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import { Language, CategoryId, PageView } from '../types';
import PaymentPointsSection from './PaymentPointsSection';

interface FooterProps {
  language: Language;
  onSelectCategory: (catId: CategoryId) => void;
  onNavigate: (view: PageView) => void;
}

export default function Footer({ language, onSelectCategory, onNavigate }: FooterProps) {
  const isAr = language === 'ar';

  return (
    <footer className="bg-tech-dark text-white border-t border-white/10 text-xs">
      {/* 1. Value Proposition Pillars */}
      <div className="border-b border-white/10 py-8 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs sm:text-sm">
                  {isAr ? 'شحن وتوصيل فوري لكافة المحافظات' : 'Express Delivery across Yemen'}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isAr ? 'توصيل خلال ساعات بصنعاء وعدن وجميع المدن اليمنية' : 'Fast delivery in Sanaa, Aden and all governorates'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs sm:text-sm">
                  {isAr ? 'ضمان رسمي معتمد للأجهزة الأصلية' : 'Official Authorized Warranty'}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isAr ? 'منتجات أصلية 100% مع كرت الضمان المعتمد' : '100% genuine with official warranty card'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs sm:text-sm">
                  {isAr ? 'فحص واستبدال فوري عند الاستلام' : 'Instant Inspection Guarantee'}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isAr ? 'افحص هاتفك وتأكد من ملحقاته قبل الدفع' : 'Inspect your device before completing payment'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs sm:text-sm">
                  {isAr ? 'خدمة عملاء وطلب سريع بالواتساب' : 'Direct WhatsApp & Phone Support'}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isAr ? 'فريق متخصص في خدمتكم على مدار الساعة' : '24/7 dedicated support team'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Electronic Payment Points & Transfer Grid */}
      <PaymentPointsSection language={language} />

      {/* 3. Main Navigation & Links Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg border border-orange-400/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl font-display block">
                  محلات <span className="text-orange-500">صدام العقاري</span>
                </span>
                <span className="text-[11px] text-gray-300 font-medium">
                  {isAr ? 'للإلكترونيات والهواتف الذكية ومستلزماتها' : 'Electronics, Smartphones & Accessories'}
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              {isAr
                ? 'محلات صدام العقاري للإلكترونيات والهواتف الذكية ومستلزماتها - وجهتكم الأولى لأحدث الهواتف الذكية والسماعات والشواحن والملحقات الأصلية المعتمدة بضمان رسمي.'
                : 'Saddam Al-Aqari Electronics & Smartphones - Your premier destination for original devices, accessories, and guaranteed warranty.'}
            </p>

            <div className="flex items-start gap-2 text-xs text-gray-300 pt-1">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-gray-300">
                {isAr
                  ? 'عمران - الشارع العام امام ابن مهدي الخدري والهدور - جوار الذفيف'
                  : 'Amran - Main Street, In front of Ibn Mahdi Al-Khadri & Al-Hadoor, Next to Al-Dhafeef'}
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-gray-400 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'مركز معتمد في اليمن' : 'Certified Center in Yemen'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'التعامل بالريال اليمني (YER)' : 'Transactions in YER'}</span>
              </div>
            </div>
          </div>

          {/* 5 Specific Requested Categories */}
          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4 text-orange-400">
              {isAr ? 'الأقسام الرئيسية' : 'Categories'}
            </h4>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('phones');
                    onNavigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {isAr ? 'الهواتف الذكية' : 'Smartphones'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('audio');
                    onNavigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {isAr ? 'السماعات' : 'Headphones'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('cases');
                    onNavigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {isAr ? 'الكفرات' : 'Cases & Covers'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('chargers');
                    onNavigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {isAr ? 'الشواحن' : 'Chargers'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('cables');
                    onNavigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {isAr ? 'الكيابل' : 'Cables'}
                </button>
              </li>
            </ul>
          </div>

          {/* Enterprise & Customer Services */}
          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4 text-orange-400">
              {isAr ? 'خدمات المتجر' : 'Store Services'}
            </h4>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <button onClick={() => onNavigate('wholesale')} className="hover:text-white transition-colors flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'مبيعات الجملة والمحلات' : 'Wholesale Portal'}</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">
                  {isAr ? 'تتبع حالة الطلب' : 'Track Order'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('compare')} className="hover:text-white transition-colors">
                  {isAr ? 'مقارنة مواصفات الهواتف' : 'Compare Phones'}
                </button>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  {isAr ? 'سياسة الضمان والاستبدال' : 'Warranty & Guarantee'}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4 text-orange-400">
              {isAr ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="space-y-3 text-gray-300">
              {/* Store Title */}
              <div>
                <p className="font-bold text-white text-xs">
                  {isAr ? 'محلات صدام العقاري' : 'Saddam Al-Aqari Shops'}
                </p>
                <p className="text-[11px] text-gray-400">
                  {isAr ? 'للإلكترونيات والهواتف الذكية ومستلزماتها' : 'Electronics & Smartphones'}
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-300 leading-snug">
                  {isAr
                    ? 'عمران - الشارع العام امام ابن مهدي الخدري والهدور - جوار الذفيف'
                    : 'Amran - Main Street, In front of Ibn Mahdi Al-Khadri & Al-Hadoor, Next to Al-Dhafeef'}
                </span>
              </div>

              {/* Phone Numbers in Green, Click to Call / Direct Dialing */}
              <div className="pt-1 border-t border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'أرقام الاتصال المباشر (اضغط للاتصال):' : 'Direct Call Numbers:'}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <a
                    href="tel:774102030"
                    className="inline-flex items-center justify-between bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all font-mono font-black text-sm tracking-wider group"
                    title={isAr ? 'اضغط للاتصال بـ 774102030' : 'Call 774102030'}
                  >
                    <span>774102030</span>
                    <span className="text-[10px] text-emerald-300/90 group-hover:text-emerald-200 font-sans font-bold">
                      {isAr ? 'اتصال 📞' : 'Call'}
                    </span>
                  </a>

                  <a
                    href="tel:777551485"
                    className="inline-flex items-center justify-between bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all font-mono font-black text-sm tracking-wider group"
                    title={isAr ? 'اضغط للاتصال بـ 777551485' : 'Call 777551485'}
                  >
                    <span>777551485</span>
                    <span className="text-[10px] text-emerald-300/90 group-hover:text-emerald-200 font-sans font-bold">
                      {isAr ? 'اتصال 📞' : 'Call'}
                    </span>
                  </a>

                  <a
                    href="tel:777059581"
                    className="inline-flex items-center justify-between bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all font-mono font-black text-sm tracking-wider group"
                    title={isAr ? 'اضغط للاتصال بـ 777059581' : 'Call 777059581'}
                  >
                    <span>777059581</span>
                    <span className="text-[10px] text-emerald-300/90 group-hover:text-emerald-200 font-sans font-bold">
                      {isAr ? 'اتصال 📞' : 'Call'}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Transfer Gateways Bar */}
        <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs">
            © 2026 {isAr ? 'متجر صدام العقاري للهواتف الذكية ومستلزماتها. كافة الحقوق محفوظة.' : 'Saddam Al-Aqari Store. All rights reserved.'}
          </p>

          {/* Yemeni Payment & Transfer Method Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono font-bold text-[10px]">
            <span className="bg-emerald-950 border border-emerald-700 px-2 py-1 rounded text-emerald-300">الكريمي Kuraimi</span>
            <span className="bg-blue-950 border border-blue-700 px-2 py-1 rounded text-blue-300">ون كاش OneCash</span>
            <span className="bg-amber-950 border border-amber-700 px-2 py-1 rounded text-amber-300">موبايل موني Mobile Money</span>
            <span className="bg-white/10 border border-white/15 px-2 py-1 rounded text-white">الدفع عند الاستلام COD</span>
            <span className="bg-white/10 border border-white/15 px-2 py-1 rounded text-white">VISA / Master</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
