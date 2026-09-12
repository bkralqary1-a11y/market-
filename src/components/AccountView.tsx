import { useState } from 'react';
import { User, Package, MapPin, ShieldCheck, Truck, CheckCircle2, Clock, Download, ArrowRight, ArrowLeft, ExternalLink, Lock } from 'lucide-react';
import { Language, Currency } from '../types';
import { formatPrice, mockProducts } from '../data/mockData';

interface AccountViewProps {
  language: Language;
  currency: Currency;
  onBackToStore: () => void;
  onSelectProduct: (product: any) => void;
}

export default function AccountView({ language, currency, onBackToStore, onSelectProduct }: AccountViewProps) {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'warranty'>('orders');

  // Sample order
  const sampleOrder = {
    id: 'ORD-894125',
    date: '08 سبتمبر 2026',
    dateEn: 'Sep 08, 2026',
    status: 'in_transit',
    trackingNumber: 'SA-ARX-98214736',
    courier: 'أرامكس إكسبريس (Aramex Priority)',
    estimatedDelivery: 'خلال اليوم قبل 6:00 مساءً',
    estimatedDeliveryEn: 'Today before 6:00 PM',
    items: [
      { product: mockProducts[0], qty: 1, variant: '256GB تيتانيوم صحراوي' },
      { product: mockProducts[4], qty: 1, variant: 'كفر جلدي فاخر MagSafe' },
    ],
    total: mockProducts[0].price + mockProducts[4].price,
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back button */}
        <button
          onClick={onBackToStore}
          className="text-xs font-bold text-gray-500 hover:text-primary flex items-center gap-1.5 mb-6 transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة للتسوق' : 'Back to Shopping'}</span>
        </button>

        {/* Profile Card Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-line shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-tech-dark text-white flex items-center justify-center font-black text-2xl shadow-md">
              ع
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-dark">
                  {isAr ? 'عبدالله الشمري' : 'Abdullah Al-Shammari'}
                </h1>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  ★ VIP Platinum
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">abdullah@example.com • +966 55 123 4567</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'حساب موثق ومحمى' : 'Verified Account'}</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-line mb-6 bg-white rounded-2xl p-1.5 border shadow-xs text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'orders' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-dark'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isAr ? 'تتبع الشحنات والطلبات' : 'Order Tracking'}</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'addresses' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-dark'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{isAr ? 'العناوين المسجلة' : 'Saved Addresses'}</span>
          </button>
          <button
            onClick={() => setActiveTab('warranty')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'warranty' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-dark'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'شهادات الضمان والفواتير' : 'Warranty Cards'}</span>
          </button>
        </div>

        {/* Tab 1: Orders & Live Tracking */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-line shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-line gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-black text-sm text-primary">{sampleOrder.id}</span>
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                      {isAr ? 'جاري التوصيل السريع' : 'Out for Delivery'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {isAr ? `تاريخ الطلب: ${sampleOrder.date}` : `Ordered: ${sampleOrder.dateEn}`}
                  </span>
                </div>

                <div className="text-right rtl:text-left">
                  <span className="text-xs text-gray-500 block">{isAr ? 'إجمالي الفاتورة:' : 'Total Amount:'}</span>
                  <span className="text-base font-black text-primary font-mono">
                    {formatPrice(sampleOrder.total, currency, isAr)}
                  </span>
                </div>
              </div>

              {/* Step Progress Tracker */}
              <div className="py-8">
                <div className="grid grid-cols-4 relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-0">
                    <div className="h-full bg-primary w-3/4 rounded-full" />
                  </div>

                  {/* Step 1 */}
                  <div className="text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold shadow">
                      ✓
                    </div>
                    <span className="font-bold text-gray-dark text-[11px] block">{isAr ? 'تم استلام الطلب' : 'Received'}</span>
                    <span className="text-[10px] text-gray-400 font-mono">10:15 AM</span>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold shadow">
                      ✓
                    </div>
                    <span className="font-bold text-gray-dark text-[11px] block">{isAr ? 'تجهيز المستودع' : 'Processed'}</span>
                    <span className="text-[10px] text-gray-400 font-mono">01:30 PM</span>
                  </div>

                  {/* Step 3 */}
                  <div className="text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold shadow ring-4 ring-primary/20 animate-pulse">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="font-black text-primary text-[11px] block">{isAr ? 'مع مندوب التوصيل' : 'Out for Delivery'}</span>
                    <span className="text-[10px] text-primary font-mono font-bold">الآن</span>
                  </div>

                  {/* Step 4 */}
                  <div className="text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                      4
                    </div>
                    <span className="font-semibold text-gray-400 text-[11px] block">{isAr ? 'تم التسليم' : 'Delivered'}</span>
                    <span className="text-[10px] text-gray-400 font-mono">اليوم</span>
                  </div>
                </div>
              </div>

              {/* Courier info block */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-line text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <span className="text-gray-400 block">{isAr ? 'شركة الشحن ورقم البوليصة:' : 'Courier & Tracking:'}</span>
                  <span className="font-mono font-bold text-gray-dark">{sampleOrder.courier} • {sampleOrder.trackingNumber}</span>
                </div>
                <div className="text-left rtl:text-right">
                  <span className="text-gray-400 block">{isAr ? 'موعد الوصول المتوقع:' : 'Estimated Arrival:'}</span>
                  <span className="font-bold text-emerald-700">{isAr ? sampleOrder.estimatedDelivery : sampleOrder.estimatedDeliveryEn}</span>
                </div>
              </div>

              {/* Order Items */}
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">{isAr ? 'المنتجات المطلوبة في هذه الشحنة:' : 'Shipped Items:'}</h4>
              <div className="divide-y divide-gray-100 border border-gray-line rounded-2xl overflow-hidden mb-4">
                {sampleOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={it.product.image} alt={it.product.name} className="w-12 h-14 object-cover rounded-lg border" />
                      <div>
                        <h5 className="font-bold text-gray-dark">{isAr ? it.product.nameAr : it.product.name}</h5>
                        <span className="text-[11px] text-gray-400 font-mono">{it.variant} • الكمية: {it.qty}</span>
                      </div>
                    </div>
                    <span className="font-bold text-primary font-mono">{formatPrice(it.product.price, currency, isAr)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border-2 border-primary shadow-sm relative">
              <span className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                {isAr ? 'العنوان الافتراضي' : 'Default'}
              </span>
              <h4 className="font-black text-gray-dark text-sm mb-1">{isAr ? 'المنزل - الرياض' : 'Home - Riyadh'}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                حي الصحافة، شارع الإمام سعود بن فيصل، مبنى 14، الرياض 12345، المملكة العربية السعودية.
              </p>
              <div className="text-[11px] font-mono text-gray-600">الهاتف: +966 55 123 4567</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-line shadow-sm">
              <h4 className="font-black text-gray-dark text-sm mb-1">{isAr ? 'العمل / المكتب' : 'Office'}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                مركز الملك عبدالله المالي (KAFD)، برج 4.02، الطابق 18، الرياض.
              </p>
              <div className="text-[11px] font-mono text-gray-600">الهاتف: +966 11 234 5678</div>
            </div>
          </div>
        )}

        {/* Tab 3: Warranty Cards */}
        {activeTab === 'warranty' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-line shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-line">
              <div>
                <h3 className="text-sm sm:text-base font-black text-gray-dark">
                  {isAr ? 'شهادات الضمان الإلكترونية المعتمدة' : 'Official Warranty Cards'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAr ? 'كافة منتجات متجر إلكترولكس مغطاة بضمان الوكيل الرسمي المعتمد سنتين كاملتين.' : 'All ElectroLux products feature official 2-year authorized warranty.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-gray-dark">iPhone 16 Pro Max - ضمان حاسبات العرب المعتمد</h4>
                  <span className="text-[11px] text-gray-500 font-mono">ساري حتى: 08 سبتمبر 2028 (سنتان متبقيتان)</span>
                </div>
              </div>
              <button className="text-xs bg-white text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100">
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحميل الوثيقة' : 'Download'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
