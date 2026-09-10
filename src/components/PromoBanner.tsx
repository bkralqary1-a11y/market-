import { Language, Product, Currency } from '../types';
import Product3DCoverflow from './Product3DCoverflow';
import { mockProducts } from '../data/mockData';

interface PromoBannerProps {
  language: Language;
  onShopNow?: () => void;
  products?: Product[];
  currency?: Currency;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product, variant?: string, color?: string) => void;
}

export default function PromoBanner({
  language,
  products = mockProducts,
  currency = 'YER',
  onSelectProduct,
  onAddToCart,
}: PromoBannerProps) {
  const isAr = language === 'ar';

  return (
    <section id="promo-banner" className="py-10 sm:py-14 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Simple Minimal Title on Pure White Canvas */}
        <div className="text-center max-w-xl mx-auto mb-2">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
            {isAr ? 'معرض فيديوهات المنتجات الرائدة' : 'Flagship Products Video Showcase'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isAr
              ? 'تقليب تفاعلي وتلقائي للفيديوهات ثلاثية الأبعاد بدقة عالية'
              : 'Interactive 3D Video Coverflow with Auto & Manual Flipping'}
          </p>
        </div>

        {/* 3D Video Templates on Pure White Background with Soft Shadow */}
        <div className="w-full">
          <Product3DCoverflow
            products={products}
            language={language}
            currency={currency}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
          />
        </div>
      </div>
    </section>
  );
}
