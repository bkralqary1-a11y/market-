import { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Grid, List, Check, ArrowUpDown, X, Sparkles } from 'lucide-react';
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

  // Sync category if initialCategory changes
  useMemo(() => {
    setSelectedCategory(initialCategory);
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

  return (
    <div id="shop-view-container" className="py-10 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-dark tracking-tight">
            {isAr ? 'كتالوج الأجهزة والملحقات المعتمدة' : 'Official Hardware & Accessories Catalog'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isAr
              ? `عرض ${filteredProducts.length} من أصل ${products.length} جهاز وملحق معتمد`
              : `Showing ${filteredProducts.length} certified electronics`}
          </p>
        </div>

        {/* 5 Requested Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (onCategoryChange) onCategoryChange(cat.id);
              }}
              className={`text-xs font-bold px-4 py-2 rounded-xl shrink-0 transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-tech-dark text-white border-tech-dark shadow-md'
                  : 'bg-white text-gray-700 border-gray-line hover:border-gray-300'
              }`}
            >
              {isAr ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Main Grid: Filters Sidebar (1 Col) + Product Grid (3 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-line shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-line">
                <span className="font-extrabold text-gray-dark text-sm flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <span>{isAr ? 'تصفية النتائج' : 'Filter Products'}</span>
                </span>
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  {isAr ? 'إعادة ضبط' : 'Reset All'}
                </button>
              </div>

              {/* Brands filter */}
              <div>
                <h4 className="text-xs font-bold text-gray-dark mb-3 uppercase tracking-wider">
                  {isAr ? 'العلامة التجارية' : 'Brands'}
                </h4>
                <div className="space-y-2 text-xs">
                  {allBrands.map((b) => (
                    <label
                      key={b}
                      className="flex items-center justify-between cursor-pointer text-gray-600 hover:text-gray-dark"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={() => toggleBrand(b)}
                          className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>{b}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        {products.filter((p) => p.brand === b).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-4 border-t border-gray-line">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-dark uppercase tracking-wider">
                    {isAr ? 'أقصى سعر' : 'Max Price'}
                  </h4>
                  <span className="text-xs font-mono font-bold text-orange-600">
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
                  className="w-full accent-orange-600"
                />
              </div>

              {/* Fast Shipping & Stock Toggles */}
              <div className="pt-4 border-t border-gray-line space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700 font-semibold">{isAr ? 'شحن فوري 24 ساعة' : 'Express 24h'}</span>
                  <input
                    type="checkbox"
                    checked={fastShippingOnly}
                    onChange={(e) => setFastShippingOnly(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700 font-semibold">{isAr ? 'المتوفر في المخزون فقط' : 'In Stock Only'}</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar: Sorting and Mobile Filter button */}
            <div className="bg-white p-4 rounded-2xl border border-gray-line shadow-xs flex items-center justify-between gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-xl text-xs font-bold text-gray-700"
              >
                <Filter className="w-4 h-4" />
                <span>{isAr ? 'الفلاتر' : 'Filters'}</span>
              </button>

              <div className="flex items-center gap-2 ml-auto rtl:ml-0 rtl:mr-auto text-xs">
                <span className="text-gray-400 hidden sm:inline">{isAr ? 'ترتيب حسب:' : 'Sort by:'}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-50 border border-gray-line rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-primary"
                >
                  <option value="featured">{isAr ? 'الأكثر طلباً والشائع' : 'Featured & Popular'}</option>
                  <option value="price-low">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                  <option value="price-high">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                  <option value="rating">{isAr ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-line text-center shadow-xs">
                <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-dark mb-1">
                  {isAr ? 'لا توجد منتجات مطابقة لخيارات الفلترة' : 'No products matched your filters'}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {isAr ? 'جرّب توسيع نطاق السعر أو إلغاء تحديد بعض العلامات التجارية.' : 'Try widening your price range.'}
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-primary text-white text-xs font-bold px-5 py-2 rounded-xl shadow"
                >
                  {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </div>
  );
}
