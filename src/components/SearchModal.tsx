import { useState, useMemo } from 'react';
import { Search, X, ArrowRight, ArrowLeft, Smartphone } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  language: Language;
  currency: Currency;
  onSelectProduct: (product: Product) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  products,
  language,
  currency,
  onSelectProduct,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  const quickTags = [
    { label: 'iPhone 16 Pro', q: 'iPhone 16' },
    { label: 'Samsung S25', q: 'Samsung' },
    { label: 'شواحن GaN', q: 'GaN' },
    { label: 'سماعات', q: 'سماعات' },
    { label: 'MagSafe', q: 'MagSafe' },
    { label: 'كابل', q: 'كابل' },
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryNameAr.includes(q) ||
        p.categoryNameEn.toLowerCase().includes(q)
    );
  }, [query, products]);

  if (!isOpen) return null;
  const isAr = language === 'ar';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-md flex items-start justify-center pt-14 sm:pt-24 p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong w-full max-w-2xl rounded-[30px] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight Search Input */}
        <div className="p-4 sm:p-5 border-b border-white/60 flex items-center gap-3 bg-white/45">
          <Search className="w-5 h-5 text-[#0071e3] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={
              isAr
                ? 'ابحث باسم الهاتف، الموديل، الماركة (Apple, Anker, Samsung)...'
                : 'Search by phone name or brand (Apple, Anker, Samsung)...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base font-bold text-[#0b1220] focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-[#0b1220] px-3 py-1.5 rounded-xl hover:bg-white/70 transition-colors cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>

        {/* Trending Queries */}
        <div className="px-4 py-3 border-b border-white/50 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-500 shrink-0 font-semibold">
            {isAr ? 'الأكثر بحثاً:' : 'Trending:'}
          </span>
          {quickTags.map((tag, i) => (
            <button
              key={i}
              onClick={() => setQuery(tag.q)}
              className="bg-white/65 hover:bg-[#0071e3] hover:text-white text-slate-700 font-bold px-3 py-1 rounded-xl border border-white/80 shrink-0 transition-colors cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="p-4 overflow-y-auto flex-grow divide-y divide-white/50">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-500">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-[#0071e3]/60" />
              <p className="text-xs font-medium">
                {isAr
                  ? 'اكتب اسم المنتج أو الماركة للبحث الفوري في الأجهزة والملحقات'
                  : 'Type a product name or brand for instant search'}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-extrabold text-[#0b1220] mb-1">
                {isAr ? 'لم يتم العثور على نتائج مطابقة' : 'No matching results found'}
              </p>
              <p className="text-xs">
                {isAr
                  ? 'جرّب البحث بكلمات أخرى مثل "آيفون" أو "شاحن" أو "سماعات"'
                  : 'Try searching for "iPhone", "Charger", or "Audio"'}
              </p>
            </div>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className="py-3 px-2.5 flex items-center justify-between hover:bg-white/60 rounded-2xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded-xl border border-white/80 bg-white/60 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#0071e3] uppercase">
                      {p.brand}
                    </span>
                    <h4 className="text-xs font-extrabold text-[#0b1220] group-hover:text-[#0071e3] transition-colors truncate">
                      {isAr ? p.nameAr : p.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {isAr ? p.categoryNameAr : p.categoryNameEn}
                    </span>
                  </div>
                </div>

                <div className="text-right rtl:text-left flex items-center gap-2.5 shrink-0">
                  <span className="font-mono tabular-nums font-black text-xs sm:text-sm text-[#0071e3]">
                    {formatPrice(p.price, currency, isAr)}
                  </span>
                  {isAr ? (
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#0071e3]" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0071e3]" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
