import { Zap, ShieldCheck, Truck, RotateCcw, Headphones, Phone, Mail, MapPin, Building2, CheckCircle2, MessageCircle, ExternalLink, Lock } from 'lucide-react';
import { Language, CategoryId, PageView } from '../types';
import PaymentPointsSection from './PaymentPointsSection';
import { soundFX } from '../utils/audioEffects';

interface FooterProps {
  language: Language;
  onSelectCategory: (catId: CategoryId) => void;
  onNavigate: (view: PageView) => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ language, onSelectCategory, onNavigate, onOpenAdmin }: FooterProps) {
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

              {/* Official Social Media Channels (جميع وسائل التواصل الرسمية) */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 block mb-1">
                  {isAr ? 'تابعنا على منصات التواصل الرسمية:' : 'Follow Official Channels:'}
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://youtube.com/channel/UCKrhL35COXkwrCL6Qf-NEgg"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFX.playClick()}
                    className="flex items-center gap-2 p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-white font-bold text-[11px] transition-all active:scale-95 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <span className="truncate">{isAr ? 'يوتيوب' : 'YouTube'}</span>
                  </a>

                  <a
                    href="https://www.tiktok.com/@saddam_alaqari_phones?_r=1&_t=ZS-99cQKDeUIFw"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFX.playClick()}
                    className="flex items-center gap-2 p-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-white font-bold text-[11px] transition-all active:scale-95 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.34-.02 2.58-.8 3.14-2.02.35-.71.45-1.52.44-2.31.02-4.75-.01-9.51.01-14.26z"/>
                      </svg>
                    </div>
                    <span className="truncate">{isAr ? 'تيك توك' : 'TikTok'}</span>
                  </a>

                  <a
                    href="https://www.instagram.com/saddam_alaqari_phones?stkn=YWNpcng0dWkwYWM5"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFX.playClick()}
                    className="flex items-center gap-2 p-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-white font-bold text-[11px] transition-all active:scale-95 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <span className="truncate">{isAr ? 'انستغرام' : 'Instagram'}</span>
                  </a>

                  <a
                    href="https://www.facebook.com/saddam.alaqari.mobilee?mibextid=ZbWKwL"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFX.playClick()}
                    className="flex items-center gap-2 p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-white font-bold text-[11px] transition-all active:scale-95 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <span className="truncate">{isAr ? 'فيسبوك' : 'Facebook'}</span>
                  </a>
                </div>

                {/* Direct WhatsApp Quick Chat */}
                <a
                  href="https://wa.me/967774102030?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D8%AD%D9%84%D8%A7%D8%AA%20%D8%B5%D8%AF%D8%A7%D9%85%20%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A3%D8%AC%D9%87%D8%B2%D8%A9"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundFX.playClick()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isAr ? 'واتساب المبيعات المباشر (+967 774 102 030)' : 'Direct WhatsApp (+967 774 102 030)'}</span>
                </a>
              </div>

              {/* Phone Numbers in Green, Click to Call / Direct Dialing */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'أرقام الاتصال المباشر (اضغط للاتصال):' : 'Direct Call Numbers:'}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <a
                    href="tel:+967774102030"
                    onClick={() => soundFX.playClick()}
                    className="inline-flex items-center justify-between bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all font-mono font-black text-sm tracking-wider group"
                    title={isAr ? 'اضغط للاتصال بـ 774102030' : 'Call 774102030'}
                  >
                    <span>774102030</span>
                    <span className="text-[10px] text-emerald-300/90 group-hover:text-emerald-200 font-sans font-bold">
                      {isAr ? 'اتصال 📞' : 'Call'}
                    </span>
                  </a>

                  <a
                    href="tel:+967777551485"
                    onClick={() => soundFX.playClick()}
                    className="inline-flex items-center justify-between bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all font-mono font-black text-sm tracking-wider group"
                    title={isAr ? 'اضغط للاتصال بـ 777551485' : 'Call 777551485'}
                  >
                    <span>777551485</span>
                    <span className="text-[10px] text-emerald-300/90 group-hover:text-emerald-200 font-sans font-bold">
                      {isAr ? 'اتصال 📞' : 'Call'}
                    </span>
                  </a>

                  <a
                    href="tel:+967777059581"
                    onClick={() => soundFX.playClick()}
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
