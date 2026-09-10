import { useState, useMemo } from 'react';
import { Search, X, ArrowRight, ArrowLeft, Zap, Smartphone, Headphones, Shield, Cable } from 'lucide-react';
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
  if (!isOpen) return null;
  const isAr = language === 'ar';
  const [query, setQuery] = useState('');

  const quickPills = [
    { label: 'iPhone 16 Pro', q: 'iPhone 16' },
    { label: 'Samsung S25', q: 'Samsung' },
    { label: 'شواحن GaN 65W', q: 'GaN' },
    { label: 'سماعات عزل الضوضاء', q: 'سماعات' },
    { label: 'كفرات MagSafe', q: 'MagSafe' },
    { label: 'كيابل 100W', q: 'كابل' },
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-line flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-line flex items-center gap-3 bg-gray-50">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={
              isAr
                ? 'ابحث باسم الهاتف، الموديل، الماركة (Apple, Anker, Samsung)...'
                : 'Search by phone name, brand (Apple, Anker, Samsung)...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base font-bold text-gray-dark focus:outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-500 hover:text-gray-dark px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>

        {/* Quick Search Tags */}
        <div className="p-3 bg-white border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-gray-400 shrink-0 font-medium">{isAr ? 'الأكثر بحثاً:' : 'Trending:'}</span>
          {quickPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => setQuery(pill.q)}
              className="bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-600 font-bold px-3 py-1 rounded-full shrink-0 transition-colors"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto flex-grow divide-y divide-gray-100">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-gray-400">
              <Zap className="w-8 h-8 mx-auto mb-2 text-primary opacity-50" />
              <p className="text-xs">
                {isAr
                  ? 'اكتب اسم المنتج أو الماركة للبحث الفوري في قاعدة الأجهزة والملحقات'
                  : 'Type product name or brand for instant suggestions'}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm font-bold text-gray-dark mb-1">
                {isAr ? 'لم يتم العثور على نتائج مطابقة' : 'No matching results found'}
              </p>
              <p className="text-xs">
                {isAr ? 'جرّب البحث بكلمات أخرى مثل "آيفون" أو "شاحن" أو "سماعات"' : 'Try searching for "iPhone" or "Charger"'}
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
                className="py-3 px-2 flex items-center justify-between hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-12 h-14 object-cover rounded-xl border bg-gray-50" />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-primary uppercase">{p.brand}</span>
                    <h4 className="text-xs font-bold text-gray-dark group-hover:text-primary transition-colors">
                      {isAr ? p.nameAr : p.name}
                    </h4>
                    <span className="text-[11px] text-gray-400">
                      {isAr ? p.categoryNameAr : p.categoryNameEn}
                    </span>
                  </div>
                </div>

                <div className="text-right rtl:text-left flex items-center gap-3">
                  <span className="font-mono font-black text-xs sm:text-sm text-primary">
                    {formatPrice(p.price, currency, isAr)}
                  </span>
                  {isAr ? (
                    <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
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
