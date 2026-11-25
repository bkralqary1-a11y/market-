import { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, X, SearchX, Tag } from 'lucide-react';
import { Product, Language, Currency, CategoryId, StoreCategoryItem, StoreBrandItem } from '../types';
import ProductCard from './ProductCard';
import AddProductTile from './AddProductTile';
import { formatPrice } from '../data/mockData';
import {
  SiteConfig,
  DEFAULT_SITE_CONFIG,
  getStoreCategories,
  DEFAULT_BUILTIN_BRANDS,
} from '../services/firestoreService';

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
  initialBrand?: string;
  onBrandChange?: (brand: string) => void;
  categories?: StoreCategoryItem[];
  brands?: StoreBrandItem[];
  siteConfig?: SiteConfig;
  isAdminMode?: boolean;
  onAdminEditProduct?: (product: Product) => void;
  onAdminCloneProduct?: (product: Product) => void;
  onAdminAddProduct?: (defaultCategory: CategoryId) => void;
}

function normalizeBrandKey(value?: string): string {
  return (value || '').trim().toLowerCase();
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
  initialBrand = '',
  onBrandChange,
  categories: propCategories,
  brands: propBrands,
  siteConfig = DEFAULT_SITE_CONFIG,
  isAdminMode = false,
  onAdminEditProduct,
  onAdminCloneProduct,
  onAdminAddProduct,
}: ShopViewProps) {
  const isAr = language === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialBrand ? [initialBrand] : []
  );
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

  useEffect(() => {
    if (initialBrand && initialBrand.trim()) {
      setSelectedBrands([initialBrand.trim()]);
    } else {
      setSelectedBrands([]);
    }
  }, [initialBrand]);

  const dynamicCategories = propCategories ?? getStoreCategories(siteConfig, isAdminMode);
  const categories: { id: CategoryId; nameEn: string; nameAr: string }[] = [
    { id: 'all', nameEn: 'All Categories', nameAr: 'كافة الأقسام' },
    ...dynamicCategories.map((c) => ({ id: c.id, nameEn: c.nameEn, nameAr: c.nameAr })),
  ];

  // Combine store-managed brands + any legacy brands found on existing products (deduplicated case-insensitively)
  const storeBrands = propBrands ?? DEFAULT_BUILTIN_BRANDS;
  const brandOptions = useMemo(() => {
    const list: { key: string; label: string; logo?: string; matchKeys: string[] }[] = [];
    const seen = new Set<string>();

    storeBrands.forEach((b) => {
      const label = (isAr ? b.nameAr : b.nameEn) || b.nameAr || b.nameEn;
      const key = normalizeBrandKey(label);
      if (!key || seen.has(key)) return;
      seen.add(key);
      const matchKeys = Array.from(
        new Set([normalizeBrandKey(b.nameAr), normalizeBrandKey(b.nameEn), normalizeBrandKey(b.id)].filter(Boolean))
      );
      list.push({ key, label, logo: b.logo, matchKeys });
    });

    products.forEach((p) => {
      const raw = (p.brand || '').trim();
      const key = normalizeBrandKey(raw);
      if (!key) return;
      const alreadyCovered = list.some((item) => item.matchKeys.includes(key));
      if (!alreadyCovered) {
        list.push({ key, label: raw, matchKeys: [key] });
      }
    });

    return list;
  }, [storeBrands, products, isAr]);

  const matchesSelectedBrands = (productBrand?: string): boolean => {
    if (selectedBrands.length === 0) return true;
    const prodKey = normalizeBrandKey(productBrand);
    if (!prodKey) return false;
    return selectedBrands.some((sel) => {
      const selKey = normalizeBrandKey(sel);
      if (prodKey === selKey) return true;
      const opt = brandOptions.find(
        (b) => b.key === selKey || b.matchKeys.includes(selKey)
      );
      return opt ? opt.matchKeys.includes(prodKey) : false;
    });
  };

  const isBrandSelected = (label: string, matchKeys: string[]): boolean => {
    const targetKey = normalizeBrandKey(label);
    return selectedBrands.some((sel) => {
      const selKey = normalizeBrandKey(sel);
      return selKey === targetKey || matchKeys.includes(selKey);
    });
  };

  const toggleBrand = (brandLabel: string, matchKeys: string[]) => {
    setSelectedBrands((prev) => {
      const exists = prev.some((b) => {
        const bk = normalizeBrandKey(b);
        return bk === normalizeBrandKey(brandLabel) || matchKeys.includes(bk);
      });
      const next = exists
        ? prev.filter((b) => {
            const bk = normalizeBrandKey(b);
            return bk !== normalizeBrandKey(brandLabel) && !matchKeys.includes(bk);
          })
        : [...prev, brandLabel];
      if (onBrandChange) {
        onBrandChange(next.length === 1 ? next[0] : '');
      }
      return next;
    });
  };

  const selectSingleBrand = (brandLabel: string) => {
    if (!brandLabel) {
      setSelectedBrands([]);
      onBrandChange?.('');
    } else {
      setSelectedBrands([brandLabel]);
      onBrandChange?.(brandLabel);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (!matchesSelectedBrands(p.brand)) return false;
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
  }, [products, selectedCategory, selectedBrands, brandOptions, maxPrice, inStockOnly, fastShippingOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setMaxPrice(1500000);
    setInStockOnly(false);
    setFastShippingOnly(false);
    onCategoryChange?.('all');
    onBrandChange?.('');
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
          {brandOptions.map((b) => {
            const checked = isBrandSelected(b.label, b.matchKeys);
            const count = products.filter((p) =>
              b.matchKeys.includes(normalizeBrandKey(p.brand))
            ).length;
            return (
              <label
                key={b.key}
                className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-[#0b1220]"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(b.label, b.matchKeys)}
                    className="rounded border-slate-300 text-[#0071e3] accent-[#0071e3] w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold">{b.label}</span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                  {count}
                </span>
              </label>
            );
          })}
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
              {selectedBrands.length === 1
                ? isAr
                  ? `منتجات العلامة التجارية: ${selectedBrands[0]}`
                  : `Brand: ${selectedBrands[0]}`
                : isAr
                  ? 'كتالوج الأجهزة والملحقات المعتمدة'
                  : 'Official Hardware & Accessories Catalog'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium tabular-nums">
              {isAr
                ? `عرض ${filteredProducts.length} من أصل ${products.length} جهاز وملحق أصلي`
                : `Showing ${filteredProducts.length} of ${products.length} certified products`}
            </p>
          </div>
          {(selectedCategory !== 'all' || selectedBrands.length > 0) && (
            <button
              type="button"
              onClick={resetFilters}
              className="self-start sm:self-auto text-xs font-extrabold text-[#0071e3] hover:underline cursor-pointer"
            >
              {isAr ? 'عرض كافة الأقسام والعلامات ×' : 'Clear all filters ×'}
            </button>
          )}
        </div>

        {/* Liquid Glass Segmented Category Bar */}
        <div className="flex flex-col gap-3 mb-7">
          <div className="liquid-glass-capsule p-1.5 rounded-[22px] inline-flex max-w-full items-center gap-1 overflow-x-auto no-scrollbar self-start">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  type="button"
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

          {/* Interactive Brands Bar (Matches Categories Bar) */}
          {brandOptions.length > 0 && (
            <div className="liquid-glass-capsule p-1.5 rounded-[22px] inline-flex max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar self-start">
              <button
                type="button"
                onClick={() => selectSingleBrand('')}
                className={`text-xs font-extrabold px-3.5 py-2 rounded-2xl shrink-0 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedBrands.length === 0
                    ? 'bg-[#0b1220] text-white shadow'
                    : 'text-slate-700 hover:text-[#0071e3] hover:bg-white/60'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{isAr ? 'كل العلامات' : 'All Brands'}</span>
              </button>
              {brandOptions.map((b) => {
                const active = isBrandSelected(b.label, b.matchKeys);
                const count = products.filter((p) =>
                  b.matchKeys.includes(normalizeBrandKey(p.brand))
                ).length;
                return (
                  <button
                    type="button"
                    key={b.key}
                    onClick={() =>
                      active && selectedBrands.length === 1
                        ? selectSingleBrand('')
                        : selectSingleBrand(b.label)
                    }
                    className={`text-xs font-extrabold px-3.5 py-2 rounded-2xl shrink-0 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'liquid-btn-primary text-white shadow'
                        : 'text-slate-700 hover:text-[#0071e3] hover:bg-white/60'
                    }`}
                  >
                    {b.logo && (
                      <img
                        src={b.logo}
                        alt={b.label}
                        className="w-4 h-4 rounded-md object-contain bg-white/80 p-0.5 shrink-0"
                      />
                    )}
                    <span>{b.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
                          active ? 'bg-white/25 text-white' : 'bg-slate-200/70 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
            {filteredProducts.length === 0 && !isAdminMode ? (
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
                    isAdminMode={isAdminMode}
                    onAdminEdit={onAdminEditProduct}
                    onAdminClone={onAdminCloneProduct}
                  />
                ))}
                {isAdminMode && onAdminAddProduct && (
                  <AddProductTile
                    language={language}
                    onClick={() => onAdminAddProduct(selectedCategory)}
                  />
                )}
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
