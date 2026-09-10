import { X, Trash2, Check, ShoppingCart, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-line flex flex-col">
        {/* Header */}
        <div className="bg-tech-dark text-white p-5 sm:p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {isAr ? 'مقارنة المواصفات التقنية جنباً إلى جنب' : 'Side-by-Side Tech Comparison'}
              </h2>
              <p className="text-xs text-gray-400">
                {isAr
                  ? `مقارنة ${products.length} أجهزة مختارة (الأسعار، المعالج، الشاشة، البطارية، الشحن)`
                  : `Comparing ${products.length} selected devices`}
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

        {/* Comparison Table Content */}
        <div className="p-6 overflow-y-auto flex-grow text-xs sm:text-sm">
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-dark mb-1">
                {isAr ? 'لم تختر أي أجهزة للمقارنة بعد' : 'No products selected for comparison'}
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                {isAr
                  ? 'انقر على أيقونة المقارنة ⇄ الموجودة على بطاقة أي منتج لإضافته هنا ومقارنة مواصفاته مع بقية الأجهزة.'
                  : 'Click the compare icon on any product card to add it to this side-by-side comparison table.'}
              </p>
              <button
                onClick={onClose}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow"
              >
                {isAr ? 'العودة للتسوق' : 'Browse Catalog'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left rtl:text-right font-extrabold text-gray-500 w-1/4 bg-gray-50 rounded-t-xl">
                      {isAr ? 'المنتج والمواصفات' : 'Specification'}
                    </th>
                    {products.map((p) => (
                      <th key={p.id} className="p-3 text-center w-1/3 min-w-[200px] border-l rtl:border-l-0 rtl:border-r border-gray-100">
                        <div className="relative group">
                          <button
                            onClick={() => onRemoveFromCompare(p.id)}
                            className="absolute top-0 right-0 rtl:right-auto rtl:left-0 text-gray-400 hover:text-rose-600 p-1"
                            title={isAr ? 'إزالة' : 'Remove'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-24 h-28 object-cover rounded-xl mx-auto mb-2 border border-gray-line cursor-pointer hover:opacity-90"
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                          />
                          <span className="text-[10px] font-bold text-primary uppercase font-mono">{p.brand}</span>
                          <h4
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="font-extrabold text-gray-dark text-xs truncate cursor-pointer hover:text-primary mb-1"
                          >
                            {isAr ? p.nameAr : p.name}
                          </h4>
                          <span className="text-sm font-black text-primary font-mono block mb-2">
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
                            className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{isAr ? 'أضف للسلة' : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Category */}
                  <tr>
                    <td className="p-3 font-bold text-gray-600 bg-gray-50">{isAr ? 'القسم' : 'Category'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-gray-100">
                        {isAr ? p.categoryNameAr : p.categoryNameEn}
                      </td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr>
                    <td className="p-3 font-bold text-gray-600 bg-gray-50">{isAr ? 'التقييم والمراجعات' : 'Rating'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-gray-100 font-mono font-bold text-amber-500">
                        ★ {p.rating} ({p.reviewsCount} {isAr ? 'تقييم' : 'reviews'})
                      </td>
                    ))}
                  </tr>

                  {/* Warranty */}
                  <tr>
                    <td className="p-3 font-bold text-gray-600 bg-gray-50">{isAr ? 'الضمان المعتمد' : 'Warranty'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-gray-100 font-bold text-emerald-600">
                        ✓ {p.warrantyYears} {isAr ? 'سنوات ضمان محلي' : 'Years Warranty'}
                      </td>
                    ))}
                  </tr>

                  {/* Fast Delivery */}
                  <tr>
                    <td className="p-3 font-bold text-gray-600 bg-gray-50">{isAr ? 'سرعة التوصيل' : 'Delivery'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-gray-100 text-xs">
                        {isAr ? 'توصيل فوري خلال 24-48 ساعة' : 'Express 24-48h Delivery'}
                      </td>
                    ))}
                  </tr>

                  {/* Key specs keys */}
                  {['processor', 'screen', 'camera', 'battery', 'power', 'speed', 'material'].map((specKey) => {
                    const hasAny = products.some((p) => p.specs && p.specs[specKey]);
                    if (!hasAny) return null;
                    return (
                      <tr key={specKey}>
                        <td className="p-3 font-bold text-gray-600 bg-gray-50 uppercase text-[11px]">
                          {specKey === 'processor'
                            ? isAr ? 'المعالج والأداء' : 'Processor'
                            : specKey === 'screen'
                            ? isAr ? 'الشاشة' : 'Display'
                            : specKey === 'camera'
                            ? isAr ? 'الكاميرا والتصوير' : 'Camera'
                            : specKey === 'battery'
                            ? isAr ? 'البطارية والشحن' : 'Battery & Charging'
                            : specKey === 'power'
                            ? isAr ? 'القدرة والواط' : 'Power Output'
                            : specKey === 'speed'
                            ? isAr ? 'سرعة النقل' : 'Transfer Speed'
                            : specKey === 'material'
                            ? isAr ? 'الخامات والتصنيع' : 'Materials'
                            : specKey}
                        </td>
                        {products.map((p) => {
                          const val = p.specs?.[specKey];
                          return (
                            <td key={p.id} className="p-3 text-center border-l rtl:border-l-0 rtl:border-r border-gray-100 text-xs leading-relaxed">
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
        <div className="bg-gray-50 p-4 border-t border-gray-line flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            {isAr ? 'جميع الأجهزة مشمولة بالضمان الرسمي والفاتورة الضريبية' : 'All devices backed by official warranty & VAT invoice'}
          </span>
          <button
            onClick={onClose}
            className="bg-gray-dark hover:bg-black text-white text-xs font-bold px-6 py-2 rounded-full transition-colors"
          >
            {isAr ? 'إغلاق نافذة المقارنة' : 'Close Comparison'}
          </button>
        </div>
      </div>
    </div>
  );
}
