import { useState } from 'react';
import { X, FolderTree, Code2, Sparkles, CheckCircle, FileText, Palette, Database, CreditCard, Globe } from 'lucide-react';
import { Language } from '../types';

interface TemplateAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function TemplateAnalysisModal({
  isOpen,
  onClose,
  language,
}: TemplateAnalysisModalProps) {
  if (!isOpen) return null;
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'architecture' | 'roadmap'>('overview');

  const fileTreeData = [
    {
      name: 'index.html',
      size: '41 KB',
      purposeEn: 'Homepage: Hero Swiper slider, categories grid, trending & popular products, blog articles, email subscription, footer.',
      purposeAr: 'الصفحة الرئيسية: سلايدر العروض الترويجية، شبكة الفئات، المنتجات الرائجة، مقالات المدونة، النشرة البريدية، والتذييل.',
    },
    {
      name: 'shop.html',
      size: '36 KB',
      purposeEn: 'Catalog page: Sidebar filters (categories, price slider, colors, sizes), product listing grid, sorting, pagination.',
      purposeAr: 'صفحة المتجر: فلاتر التصنيف، شريط السعر، فلاتر الألوان والمقاسات، شبكة المنتجات، والترتيب والترقيم.',
    },
    {
      name: 'single-product-page.html',
      size: '51 KB',
      purposeEn: 'Product details: Multi-image gallery with thumbnails, color/size selection, quantity controls, tabbed specifications, customer reviews.',
      purposeAr: 'صفحة تفاصيل المنتج: معرض صور متعدد الزوايا، تحديد المقاس واللون، الكمية، تبويبات المواصفات وآراء المشترين.',
    },
    {
      name: 'cart.html',
      size: '25 KB',
      purposeEn: 'Shopping cart: Cart items table, quantity adjustments, line subtotals, promo coupon code handler, order summary.',
      purposeAr: 'سلة المشتريات: جدول المنتجات، تعديل الكميات، حاسبة الكوبونات، وحساب إجمالي الطلب والشحن.',
    },
    {
      name: 'checkout.html',
      size: '23 KB',
      purposeEn: 'Checkout flow: Customer shipping information, delivery option selector, payment method options, order breakdown.',
      purposeAr: 'صفحة إتمام الدفع: بيانات المستلم والعنوان، خيارات الشحن، بوابات الدفع، وتأكيد الفاتورة.',
    },
    {
      name: 'register.html',
      size: '22 KB',
      purposeEn: 'User Auth: Clean login and registration forms with password toggles and social login options.',
      purposeAr: 'تسجيل الدخول والتسجيل: واجهات الدخول وإنشاء حساب جديد مع أمان كلمات المرور.',
    },
    {
      name: '404.html',
      size: '20 KB',
      purposeEn: 'Error page: Custom styled error illustration with clear navigation back to store.',
      purposeAr: 'صفحة الخطأ 404: تصميم مخصص ودود يوجه الزائر للعودة إلى المتجر.',
    },
    {
      name: 'assets/css/tailwind.css & styles.css',
      size: 'CSS',
      purposeEn: 'Tailwind CSS v4 theme config defining --color-primary (#ff0042), --color-gray-dark (#010717), Manrope font, and breakpoints.',
      purposeAr: 'إعدادات Tailwind CSS v4 مع تعريف ألوان الهوية الرئيسية (#ff0042) والخطوط والمسافات.',
    },
    {
      name: 'assets/js/script.js',
      size: 'JS',
      purposeEn: 'Client interactivity: Hamburger mobile menu, Swiper initialization, product tabs toggler, filter dropdowns.',
      purposeAr: 'البرمجة التفاعلية: القائمة المتجاوبة، سلايدر Swiper، تبويبات المنتجات، وقوائم الفلترة.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-line flex flex-col">
        {/* Modal Header */}
        <div className="bg-gray-dark text-white p-5 sm:p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {isAr ? 'التقرير الشامل وتحليل قالب TailStore v4' : 'TailStore v4 Full Architectural Analysis'}
              </h2>
              <p className="text-xs text-gray-400">
                {isAr
                  ? 'تفاصيل الملفات، الهيكلية، والخيارات المتاحة للتعديل الشامل والتطوير'
                  : 'File structure inspection, code architecture, and suggested roadmap'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-line px-6 bg-gray-50 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-dark'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'نظرة عامة والملخص' : 'Overview & Summary'}</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'files' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-dark'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>{isAr ? 'تفصيل الملفات والمحتويات' : 'Files Breakdown'}</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'architecture' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-dark'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{isAr ? 'التقنيات والألوان' : 'Tech & Design System'}</span>
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'roadmap' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-dark'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAr ? 'خطة التعديلات المقترحة' : 'Customization Roadmap'}</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto flex-grow text-xs sm:text-sm text-gray-700 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 leading-relaxed">
              <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl">
                <h3 className="font-extrabold text-primary text-base mb-2">
                  {isAr ? 'ما هو قالب TailStore v4؟' : 'What is TailStore v4?'}
                </h3>
                <p className="text-gray-700">
                  {isAr
                    ? 'قالب TailStore v4 هو قالب متجر إلكتروني مفتوح المصدر تم بناؤه بالاعتماد على الإصدار الرابع الحديث من Tailwind CSS v4. يوفر القالب مجموعة متكاملة من الصفحات والمكونات الجاهزة لإنشاء متجر تسوق عصري وسريع مع واجهات مستخدم نظيفة ومتجاوبة على كافة الشاشات (الهواتف، الأجهزة اللوحية، والحواسيب).'
                    : 'TailStore v4 is an open-source eCommerce store template constructed with Tailwind CSS v4. It delivers a comprehensive collection of pre-designed pages and user interfaces for high-converting online stores.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-line p-4 rounded-xl bg-gray-50">
                  <span className="font-bold text-gray-dark block mb-1">
                    {isAr ? '🛒 7 صفحات رئيسية' : '🛒 7 Key Pages'}
                  </span>
                  <p className="text-gray-500 text-xs">
                    {isAr
                      ? 'الرئيسية، المتجر بالفلاتر، صفحة تفاصيل المنتج، سلة المشتريات، الدفع، الحساب، وصفحة 404.'
                      : 'Home, Shop catalog, Product details, Cart, Checkout, Auth, and 404.'}
                  </p>
                </div>
                <div className="border border-gray-line p-4 rounded-xl bg-gray-50">
                  <span className="font-bold text-gray-dark block mb-1">
                    {isAr ? '⚡ مبني بـ Tailwind v4' : '⚡ Tailwind v4 Engine'}
                  </span>
                  <p className="text-gray-500 text-xs">
                    {isAr
                      ? 'يعتمد التوجيه الجديد @theme بدون الحاجة لملف tailwind.config.js القديم وبسرعة معالجة عالية.'
                      : 'Uses modern @theme CSS directives for lightning fast build times.'}
                  </p>
                </div>
                <div className="border border-gray-line p-4 rounded-xl bg-gray-50">
                  <span className="font-bold text-gray-dark block mb-1">
                    {isAr ? '🚀 تم تحويله إلى React متكامل' : '🚀 Live React Version Active'}
                  </span>
                  <p className="text-gray-500 text-xs">
                    {isAr
                      ? 'قمنا بتحويله في المعاينة إلى تطبيق تفاعلي مع سلة نشطة ودعم كامل للعربية والإنجليزية.'
                      : 'Ported into React state with live cart, coupon codes, and Arabic RTL.'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-line pt-4">
                <h4 className="font-bold text-gray-dark mb-2">
                  {isAr ? 'جاهز للتعديل الفوري وفق رغبتك:' : 'Ready for Customization:'}
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600 list-disc list-inside">
                  <li>{isAr ? 'تغيير ألوان الهوية والشعار والخطوط' : 'Theme branding, logos & custom palette'}</li>
                  <li>{isAr ? 'إضافة أو تعديل المنتجات، الأسعار والتصنيفات' : 'Custom products, pricing & categories'}</li>
                  <li>{isAr ? 'ربط بوابات دفع إلكترونية أو قواعد بيانات (Firebase / Supabase / SQL)' : 'Payment gateway and database integrations'}</li>
                  <li>{isAr ? 'لوحة تحكم للمدير لإدارة الطلبات والمخزون' : 'Admin dashboard for order & stock tracking'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: FILES BREAKDOWN */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mb-4">
                {isAr
                  ? 'تفصيل الملفات الموجودة في الأرشيف المرفق (tailstore4-main) ودور كل ملف في بنية المتجر:'
                  : 'Breakdown of all files included in tailstore4-main and their functional roles:'}
              </p>
              {fileTreeData.map((f, i) => (
                <div key={i} className="border border-gray-line p-3.5 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-primary text-xs">{f.name}</span>
                    <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">{f.size}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {isAr ? f.purposeAr : f.purposeEn}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & DESIGN */}
          {activeTab === 'architecture' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-dark mb-2">{isAr ? 'نظام الألوان الرسمي للمتجر' : 'Color Palette System'}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="border border-gray-line p-3 rounded-xl">
                    <div className="w-full h-8 rounded-lg bg-[#ff0042] mb-2" />
                    <span className="font-bold text-xs block">Primary Color</span>
                    <span className="text-[11px] font-mono text-gray-500">#ff0042 (أحمر كرزي)</span>
                  </div>
                  <div className="border border-gray-line p-3 rounded-xl">
                    <div className="w-full h-8 rounded-lg bg-[#010717] mb-2" />
                    <span className="font-bold text-xs block">Gray Dark</span>
                    <span className="text-[11px] font-mono text-gray-500">#010717 (كحلي داكن)</span>
                  </div>
                  <div className="border border-gray-line p-3 rounded-xl">
                    <div className="w-full h-8 rounded-lg bg-[#FAF7F3] border mb-2" />
                    <span className="font-bold text-xs block">Gray Lighter</span>
                    <span className="text-[11px] font-mono text-gray-500">#FAF7F3 (بيج هادئ)</span>
                  </div>
                  <div className="border border-gray-line p-3 rounded-xl">
                    <div className="w-full h-8 rounded-lg bg-[#323232] mb-2" />
                    <span className="font-bold text-xs block">Gray Light</span>
                    <span className="text-[11px] font-mono text-gray-500">#323232 (رمادي نصوص)</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-line pt-4">
                <h3 className="font-bold text-gray-dark mb-2">{isAr ? 'المكتبات والتقنيات المستخدمة' : 'Libraries & Dependencies'}</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-semibold">Tailwind CSS:</span>
                    <span className="text-gray-500">v4.1.x (Utility-First CSS)</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-semibold">Swiper:</span>
                    <span className="text-gray-500">v11 (Touch Slider for Hero & Products)</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-semibold">Font:</span>
                    <span className="text-gray-500">Manrope + Cairo (Arabic Typography)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Icons:</span>
                    <span className="text-gray-500">Lucide React / SVG icons</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROADMAP FOR MODIFICATION */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-dark text-sm">
                {isAr ? 'المسارات المقترحة للبدء بالتعديل الشامل:' : 'Proposed Modification Options:'}
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-dark text-xs sm:text-sm">
                      {isAr ? '١. تعريب وتخصيص هوية المتجر (Branding & Localization)' : '1. Store Branding & Localization'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {isAr
                        ? 'تغيير الاسم، الشعار، العملة (ريال سعودي، درهم، دولار)، وتخصيص النصوص والبانرات الترويجية لتناسب علامتك التجارية.'
                        : 'Custom logo, store title, regional currencies (SAR, AED, USD), and custom promotional banners.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-line bg-gray-50 flex items-start gap-3">
                  <Database className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-dark text-xs sm:text-sm">
                      {isAr ? '٢. استبدال المنتجات وإضافة مخزون مخصص (Products & Inventory)' : '2. Dynamic Catalog & Products'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {isAr
                        ? 'إدراج منتجاتك الحقيقية، صورك الخاصة، الأسعار، المقاسات، والخيارات مع إمكانية إضافة وإدارة المنتجات بسهولة.'
                        : 'Replace sample apparel with your real products, imagery, inventory counts, and custom variants.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-line bg-gray-50 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-dark text-xs sm:text-sm">
                      {isAr ? '٣. بوابات الدفع وقواعد البيانات الحقيقية (Payments & Backend)' : '3. Payment Gateways & Real Backend'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {isAr
                        ? 'ربط بوابات دفع حقيقية (مثل Stripe، تابي، تمارا، أو مدى) مع قاعدة بيانات لحفظ الطلبات والعملاء وتتبع الشحنات.'
                        : 'Integrate real checkout providers, Firestore / PostgreSQL database, and order management.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-4 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {isAr
                    ? 'أخبرني بالاتجاه الذي تفضل البدء به فوراً، وسنقوم بتطبيقه خطوة بخطوة!'
                    : 'Tell me which direction you would like to proceed with, and we can start tailoring it right away!'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Action */}
        <div className="bg-gray-50 p-4 border-t border-gray-line flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            {isAr ? 'القالب يعمل الآن بنجاح داخل المعاينة الحية' : 'Template is now fully running in live preview'}
          </span>
          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors"
          >
            {isAr ? 'إغلاق ومتابعة التصفح' : 'Close & Explore Store'}
          </button>
        </div>
      </div>
    </div>
  );
}
