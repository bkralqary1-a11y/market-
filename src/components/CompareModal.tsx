import { X, Trash2, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';
import { triggerFlyToCart } from './FlyingCartAnimation';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  language: Language;
  currency: Currency;
  onRemoveFromCompare: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export default function CompareModal({
  isOpen,
  onClose,
  products,
  language,
  currency,
  onRemoveFromCompare,
  onAddToCart,
  onSelectProduct,
}: CompareModalProps) {
  if (!isOpen) return null;
  const isAr = language === 'ar';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong w-full max-w-5xl max-h-[90vh] rounded-[30px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Deep Sapphire Header */}
        <div className="liquid-glass-dark text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {isAr ? 'مقارنة المواصفات التقنية' : 'Side-by-Side Comparison'}
              </h2>
              <p className="text-xs text-slate-300">
                {isAr
                  ? `مقارنة ${products.length} أجهزة مختارة`
                  : `Comparing ${products.length} selected devices`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow text-xs sm:text-sm">
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <SlidersHorizontal className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-[#0b1220] mb-1">
                {isAr ? 'لم تختر أي أجهزة للمقارنة بعد' : 'No products selected for comparison'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
                {isAr
                  ? 'انقر على أيقونة المقارنة الموجودة على بطاقة أي منتج لإضافته ومقارنة مواصفاته هنا.'
                  : 'Click the compare icon on any product card to compare specifications side-by-side.'}
              </p>
              <button
                onClick={onClose}
                className="liquid-btn-primary text-xs font-extrabold px-6 py-2.5 rounded-2xl cursor-pointer"
              >
                {isAr ? 'العودة للتسوق' : 'Browse Catalog'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left rtl:text-right font-extrabold text-slate-600 w-1/4 bg-white/50 rounded-t-xl">
                      {isAr ? 'المواصفات' : 'Specification'}
                    </th>
                    {products.map((p) => (
                      <th
                        key={p.id}
                        className="p-3 text-center w-1/3 min-w-[200px] border-l rtl:border-l-0 rtl:border-r border-white/60"
                      >
                        <div className="relative">
                          <button
                            onClick={() => onRemoveFromCompare(p.id)}
                            className="absolute top-0 right-0 rtl:right-auto rtl:left-0 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title={isAr ? 'إزالة' : 'Remove'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-24 h-28 object-cover rounded-2xl mx-auto mb-2 border border-white/80 cursor-pointer"
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                          />
                          <span className="text-[10px] font-bold text-[#0071e3] uppercase font-mono">
                            {p.brand}
                          </span>
                          <h4
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="font-extrabold text-[#0b1220] text-xs truncate cursor-pointer hover:text-[#0071e3] mb-1"
                          >
                            {isAr ? p.nameAr : p.name}
                          </h4>
                          <span className="text-sm font-black text-[#0071e3] font-mono tabular-nums block mb-2">
                            {formatPrice(p.price, currency, isAr)}
                          </span>
                          <button
                            onClick={(e) => {
                              triggerFlyToCart({
                                imageUrl: p.image,
                                productName: isAr ? p.nameAr : p.name,
                                sourceElement: e.currentTarget,
                              });
                              onAddToCart(p);
                            }}
                            className="liquid-btn-primary w-full text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{isAr ? 'أضف للسلة' : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/60">
                  <tr>
                    <td className="p-3 font-bold text-slate-600 bg-white/40">{isAr ? 'القسم' : 'Category'}</td>
                    {products.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-white/60 text-[#0b1220]"
                      >
                        {isAr ? p.categoryNameAr : p.categoryNameEn}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-600 bg-white/40">{isAr ? 'التقييم' : 'Rating'}</td>
                    {products.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-white/60 font-mono tabular-nums font-bold text-amber-500"
                      >
                        ★ {p.rating} ({p.reviewsCount})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-600 bg-white/40">{isAr ? 'الضمان' : 'Warranty'}</td>
                    {products.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-white/60 font-bold text-emerald-700"
                      >
                        ✓ {p.warrantyYears} {isAr ? 'سنوات' : 'Years'}
                      </td>
                    ))}
                  </tr>
                  {['processor', 'screen', 'camera', 'battery', 'power', 'speed', 'material'].map((specKey) => {
                    const hasAny = products.some((p) => p.specs && p.specs[specKey]);
                    if (!hasAny) return null;
                    return (
                      <tr key={specKey}>
                        <td className="p-3 font-bold text-slate-600 bg-white/40 uppercase text-[11px]">
                          {specKey === 'processor'
                            ? isAr ? 'المعالج' : 'Processor'
                            : specKey === 'screen'
                            ? isAr ? 'الشاشة' : 'Display'
                            : specKey === 'camera'
                            ? isAr ? 'الكاميرا' : 'Camera'
                            : specKey === 'battery'
                            ? isAr ? 'البطارية' : 'Battery'
                            : specKey === 'power'
                            ? isAr ? 'القدرة' : 'Power'
                            : specKey === 'speed'
                            ? isAr ? 'السرعة' : 'Speed'
                            : specKey === 'material'
                            ? isAr ? 'الخامات' : 'Materials'
                            : specKey}
                        </td>
                        {products.map((p) => {
                          const val = p.specs?.[specKey];
                          return (
                            <td
                              key={p.id}
                              className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-white/60 text-xs leading-relaxed text-[#0b1220]"
                            >
                              {val ? (isAr ? val.ar : val.en) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/45 p-4 border-t border-white/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-600">
            {isAr
              ? 'جميع الأجهزة مشمولة بالضمان الرسمي والفاتورة المعتمدة'
              : 'All devices backed by official warranty & invoice'}
          </span>
          <button
            onClick={onClose}
            className="liquid-glass-dark text-white text-xs font-bold px-6 py-2 rounded-full cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
