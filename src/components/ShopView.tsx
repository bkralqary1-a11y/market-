import { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, X, SearchX } from 'lucide-react';
import { Product, Language, Currency, CategoryId } from '../types';
import ProductCard from './ProductCard';
import { formatPrice } from '../data/mockData';

interface ShopViewProps {
  products: Product[];
  language: Language;
  currency: Currency;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variant: string, color: string) => void;
  onQuickOrder?: (product: Product, variant: string, color: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  comparedIds: string[];
  onToggleCompare: (productId: string) => void;
  initialCategory: CategoryId;
  onCategoryChange?: (cat: CategoryId) => void;
}

export default function ShopView({
  products,
  language,
  currency,
  onSelectProduct,
  onAddToCart,
  onQuickOrder,
  wishlist,
  onToggleWishlist,
  comparedIds,
  onToggleCompare,
  initialCategory = 'all',
  onCategoryChange,
}: ShopViewProps) {
  const isAr = language === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1500000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [fastShippingOnly, setFastShippingOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories: { id: CategoryId; nameEn: string; nameAr: string }[] = [
    { id: 'all', nameEn: 'All Categories', nameAr: 'كافة الأقسام' },
    { id: 'phones', nameEn: 'Smartphones', nameAr: 'الهواتف الذكية' },
    { id: 'audio', nameEn: 'Headphones & Audio', nameAr: 'السماعات' },
    { id: 'cases', nameEn: 'Cases & Covers', nameAr: 'الكفرات' },
    { id: 'chargers', nameEn: 'Chargers & Power', nameAr: 'الشواحن' },
    { id: 'cables', nameEn: 'Cables & Adapters', nameAr: 'الكيابل' },
  ];

  const allBrands = ['Apple', 'Samsung', 'Anker', 'Sony', 'Belkin', 'Baseus', 'Spigen'];

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        if (p.price > maxPrice) return false;
        if (inStockOnly && !p.inStock) return false;
        if (fastShippingOnly && !p.fastShipping) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, selectedCategory, selectedBrands, maxPrice, inStockOnly, fastShippingOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setMaxPrice(1500000);
    setInStockOnly(false);
    setFastShippingOnly(false);
  };

  const filterPanelContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
        <span className="font-extrabold text-[#0b1220] text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#0071e3]" />
          <span>{isAr ? 'تصفية النتائج' : 'Filter Products'}</span>
        </span>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-bold text-[#0071e3] hover:underline cursor-pointer"
        >
          {isAr ? 'إعادة ضبط' : 'Reset'}
        </button>
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-xs font-extrabold text-[#0b1220] mb-3 uppercase tracking-wider">
          {isAr ? 'العلامة التجارية' : 'Brands'}
        </h4>
        <div className="space-y-2.5 text-xs">
          {allBrands.map((b) => (
            <label
              key={b}
              className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-[#0b1220]"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => toggleBrand(b)}
                  className="rounded border-slate-300 text-[#0071e3] accent-[#0071e3] w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold">{b}</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">
                {products.filter((p) => p.brand === b).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div className="pt-4 border-t border-slate-200/70">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-extrabold text-[#0b1220] uppercase tracking-wider">
            {isAr ? 'أقصى سعر' : 'Max Price'}
          </h4>
          <span className="text-xs font-mono tabular-nums font-extrabold text-[#0071e3]">
            {formatPrice(maxPrice, currency, isAr)}
          </span>
        </div>
        <input
          type="range"
          min="10000"
          max="1500000"
          step="10000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#0071e3] cursor-pointer"
        />
      </div>

      {/* Availability Toggles */}
      <div className="pt-4 border-t border-slate-200/70 space-y-3 text-xs">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-slate-700 font-semibold">{isAr ? 'شحن فوري 24 ساعة' : 'Express 24h'}</span>
          <input
            type="checkbox"
            checked={fastShippingOnly}
            onChange={(e) => setFastShippingOnly(e.target.checked)}
            className="rounded border-slate-300 accent-[#0071e3] w-4 h-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-slate-700 font-semibold">{isAr ? 'المتوفر في المخزون فقط' : 'In Stock Only'}</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-slate-300 accent-[#0071e3] w-4 h-4 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div id="shop-view-container" className="py-8 sm:py-10 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0b1220] tracking-tight">
              {isAr ? 'كتالوج الأجهزة والملحقات المعتمدة' : 'Official Hardware & Accessories Catalog'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium tabular-nums">
              {isAr
                ? `عرض ${filteredProducts.length} من أصل ${products.length} جهاز وملحق أصلي`
                : `Showing ${filteredProducts.length} of ${products.length} certified products`}
            </p>
          </div>
        </div>

        {/* Liquid Glass Segmented Category Bar */}
        <div className="liquid-glass-capsule p-1.5 rounded-[22px] inline-flex max-w-full items-center gap-1 overflow-x-auto no-scrollbar mb-7">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (onCategoryChange) onCategoryChange(cat.id);
                }}
                className={`text-xs font-extrabold px-4 py-2 rounded-2xl shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'liquid-btn-primary text-white'
                    : 'text-slate-700 hover:text-[#0071e3] hover:bg-white/60'
                }`}
              >
                {isAr ? cat.nameAr : cat.nameEn}
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-7 w-full min-w-0">
          {/* Desktop Liquid Glass Sidebar */}
          <aside className="hidden lg:block">
            <div className="liquid-glass-strong p-6 rounded-[28px] sticky top-28">
              {filterPanelContent}
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-5 w-full min-w-0">
            {/* Liquid Glass Toolbar */}
            <div className="liquid-glass p-3.5 sm:p-4 rounded-[22px] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 liquid-glass-subtle px-3.5 py-2 rounded-xl text-xs font-bold text-[#0b1220] cursor-pointer"
              >
                <Filter className="w-4 h-4 text-[#0071e3]" />
                <span>{isAr ? 'الفلاتر' : 'Filters'}</span>
              </button>

              <div className="flex items-center gap-2 ml-auto rtl:ml-0 rtl:mr-auto text-xs">
                <span className="text-slate-500 font-semibold hidden sm:inline">
                  {isAr ? 'ترتيب حسب:' : 'Sort by:'}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-low' | 'price-high' | 'rating')}
                  className="liquid-glass-strong rounded-xl px-3.5 py-2 text-xs font-bold text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 cursor-pointer"
                >
                  <option value="featured">{isAr ? 'الأكثر طلباً والشائع' : 'Featured & Popular'}</option>
                  <option value="price-low">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                  <option value="price-high">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                  <option value="rating">{isAr ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filteredProducts.length === 0 ? (
              <div className="liquid-glass-strong p-12 rounded-[28px] text-center">
                <SearchX className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-extrabold text-[#0b1220] mb-1">
                  {isAr ? 'لا توجد منتجات مطابقة لخيارات الفلترة' : 'No products matched your filters'}
                </h3>
                <p className="text-xs text-slate-600 mb-5">
                  {isAr
                    ? 'جرّب توسيع نطاق السعر أو إلغاء تحديد بعض العلامات التجارية.'
                    : 'Try widening your price range or clearing selected brands.'}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="liquid-btn-primary text-xs font-extrabold px-6 py-2.5 rounded-2xl cursor-pointer"
                >
                  {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 w-full min-w-0">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    language={language}
                    currency={currency}
                    onSelect={onSelectProduct}
                    onAddToCart={(prod, vr, col) => onAddToCart(prod, vr, col)}
                    onQuickOrder={onQuickOrder}
                    isWishlisted={wishlist.includes(p.id)}
                    onToggleWishlist={onToggleWishlist}
                    isCompared={comparedIds.includes(p.id)}
                    onToggleCompare={onToggleCompare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Liquid Glass Filter Drawer */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 lg:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="liquid-glass-strong w-full max-w-md rounded-[28px] p-6 max-h-[82vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black text-[#0b1220]">
                {isAr ? 'خيارات الفلترة' : 'Filter Options'}
              </span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/60 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterPanelContent}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="liquid-btn-primary w-full mt-6 py-3 rounded-2xl text-xs font-extrabold cursor-pointer"
            >
              {isAr ? `عرض النتائج (${filteredProducts.length})` : `Show Results (${filteredProducts.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
