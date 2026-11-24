import { useState } from 'react';
import { Package, MapPin, ShieldCheck, Truck, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language, Currency, Product } from '../types';
import { formatPrice, mockProducts } from '../data/mockData';

interface AccountViewProps {
  language: Language;
  currency: Currency;
  onBackToStore: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function AccountView({
  language,
  currency,
  onBackToStore,
  onSelectProduct,
}: AccountViewProps) {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'warranty'>('orders');

  const sampleOrder = {
    id: 'ORD-894125',
    date: '08 سبتمبر 2026',
    dateEn: 'Sep 08, 2026',
    trackingNumber: 'YE-SAQ-982147',
    courier: 'توصيل متجر صدام العقاري السريع',
    estimatedDelivery: 'خلال اليوم قبل 6:00 مساءً',
    estimatedDeliveryEn: 'Today before 6:00 PM',
    items: [
      { product: mockProducts[0], qty: 1, variant: '256GB تيتانيوم صحراوي' },
      { product: mockProducts[4], qty: 1, variant: 'كفر MagSafe' },
    ],
    total: mockProducts[0].price + mockProducts[4].price,
  };

  return (
    <div className="py-8 sm:py-10 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <button
          onClick={onBackToStore}
          className="text-xs font-bold text-slate-600 hover:text-[#0071e3] flex items-center gap-1.5 mb-6 transition-colors cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة للتسوق' : 'Back to Shopping'}</span>
        </button>

        {/* Profile Header */}
        <div className="liquid-glass-strong p-6 sm:p-7 rounded-[28px] mb-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-15 h-15 rounded-2xl liquid-btn-primary flex items-center justify-center font-black text-xl">
              ع
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0b1220]">
                {isAr ? 'متابعة الطلبات والضمان' : 'Orders & Warranty'}
              </h1>
              <p className="text-xs text-slate-600">
                {isAr ? 'متجر صدام العقاري · عمران وصنعاء' : 'Saddam Al-Aqari Store · Yemen'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'حساب موثق' : 'Verified Account'}</span>
          </div>
        </div>

        {/* Liquid Glass Segmented Tabs */}
        <div className="liquid-glass-capsule p-1.5 rounded-[22px] flex mb-6 text-xs font-extrabold">
          {[
            { id: 'orders' as const, icon: Package, ar: 'تتبع الشحنات', en: 'Order Tracking' },
            { id: 'addresses' as const, icon: MapPin, ar: 'العناوين', en: 'Addresses' },
            { id: 'warranty' as const, icon: ShieldCheck, ar: 'الضمان', en: 'Warranty' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  active ? 'liquid-btn-primary text-white' : 'text-slate-700 hover:text-[#0071e3]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? tab.ar : tab.en}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'orders' && (
          <div className="liquid-glass-strong p-6 sm:p-8 rounded-[28px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/60 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-black text-sm text-[#0071e3]">{sampleOrder.id}</span>
                  <span className="text-xs text-emerald-700 font-bold">
                    · {isAr ? 'جاري التوصيل السريع' : 'Out for Delivery'}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {isAr ? `تاريخ الطلب: ${sampleOrder.date}` : `Ordered: ${sampleOrder.dateEn}`}
                </span>
              </div>

              <div className="text-right rtl:text-left">
                <span className="text-xs text-slate-500 block">{isAr ? 'إجمالي الفاتورة:' : 'Total:'}</span>
                <span className="text-base font-black text-[#0071e3] font-mono tabular-nums">
                  {formatPrice(sampleOrder.total, currency, isAr)}
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="py-7">
              <div className="grid grid-cols-4 relative">
                <div className="absolute top-4 left-0 right-0 h-1 bg-white/70">
                  <div className="h-full bg-[#0071e3] w-3/4 rounded-full" />
                </div>

                {[
                  { labelAr: 'تم الاستلام', labelEn: 'Received', done: true },
                  { labelAr: 'تجهيز الطلب', labelEn: 'Packed', done: true },
                  { labelAr: 'مع المندوب', labelEn: 'In Transit', current: true },
                  { labelAr: 'تم التسليم', labelEn: 'Delivered', done: false },
                ].map((st, idx) => (
                  <div key={idx} className="text-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${
                        st.current
                          ? 'liquid-btn-primary text-white ring-4 ring-[#0071e3]/20'
                          : st.done
                          ? 'bg-[#0071e3] text-white'
                          : 'bg-white/80 text-slate-400 border border-white'
                      }`}
                    >
                      {st.current ? <Truck className="w-4 h-4" /> : st.done ? '✓' : idx + 1}
                    </div>
                    <span className="font-bold text-[#0b1220] text-[11px] block">
                      {isAr ? st.labelAr : st.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass-subtle p-4 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <span className="text-slate-500 block">{isAr ? 'الشحن ورقم المتابعة:' : 'Courier & ID:'}</span>
                <span className="font-mono font-bold text-[#0b1220]">
                  {sampleOrder.courier} · {sampleOrder.trackingNumber}
                </span>
              </div>
              <div className="text-left rtl:text-right">
                <span className="text-slate-500 block">{isAr ? 'الوصول المتوقع:' : 'ETA:'}</span>
                <span className="font-bold text-emerald-700">
                  {isAr ? sampleOrder.estimatedDelivery : sampleOrder.estimatedDeliveryEn}
                </span>
              </div>
            </div>

            <div className="divide-y divide-white/60 border border-white/70 rounded-2xl overflow-hidden bg-white/45">
              {sampleOrder.items.map((it, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectProduct(it.product)}
                  className="p-3.5 flex items-center justify-between hover:bg-white/60 text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-cover rounded-xl border border-white/80"
                    />
                    <div>
                      <h5 className="font-extrabold text-[#0b1220]">
                        {isAr ? it.product.nameAr : it.product.name}
                      </h5>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {it.variant} · {isAr ? 'الكمية:' : 'Qty:'} {it.qty}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-[#0071e3] font-mono tabular-nums">
                    {formatPrice(it.product.price, currency, isAr)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="liquid-glass-strong p-6 rounded-[26px] border-[#0071e3]/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-[#0b1220] text-sm">
                  {isAr ? 'الفرع الرئيسي - عمران' : 'Main Branch - Amran'}
                </h4>
                <span className="text-[11px] text-[#0071e3] font-bold">{isAr ? 'معتمد' : 'Verified'}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {isAr
                  ? 'عمران - الشارع العام امام ابن مهدي الخدري والهدور - جوار الذفيف'
                  : 'Amran - Main Street, Next to Al-Dhafeef'}
              </p>
              <div className="text-[11px] font-mono text-slate-600" dir="ltr">
                +967 774 102 030
              </div>
            </div>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div className="liquid-glass-strong p-6 sm:p-8 rounded-[28px] space-y-4">
            <div className="pb-4 border-b border-white/60">
              <h3 className="text-sm sm:text-base font-black text-[#0b1220]">
                {isAr ? 'شهادات الضمان الإلكترونية المعتمدة' : 'Official Warranty Cards'}
              </h3>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'كافة منتجات متجر صدام العقاري مغطاة بضمان رسمي معتمد مع فاتورة شراء.'
                  : 'All Saddam Al-Aqari products feature official warranty and invoice.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-[#0b1220]">
                    iPhone 16 Pro Max — {isAr ? 'ضمان متجر صدام العقاري' : 'Official Store Warranty'}
                  </h4>
                  <span className="text-[11px] text-slate-600 font-mono">
                    {isAr ? 'ساري لمدة سنتين من تاريخ الشراء' : 'Valid for 2 years from purchase'}
                  </span>
                </div>
              </div>
              <button className="text-xs bg-white/85 text-emerald-800 font-bold px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 hover:bg-white cursor-pointer w-fit">
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
