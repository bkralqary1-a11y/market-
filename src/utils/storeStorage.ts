import { Product, HeroSlideItem } from '../types';
import { ShortVideoItem } from '../types';
import { YOUTUBE_SHORTS_DATA } from '../components/YouTubeShortsSection';
import {
  MASTER_ADMIN_PIN,
  verifyAdminPinSecure,
  isAdminSessionActive,
  setAdminSessionActive,
  setCustomAdminPin,
  resetAdminPinToDefault,
} from './security';

const PRODUCTS_STORAGE_KEY = 'saddam_store_products_v4';
const SHORTS_STORAGE_KEY = 'saddam_store_shorts_v4';
const STORE_DISCOUNT_CONFIG_KEY = 'saddam_store_discounts_v1';
const HERO_SLIDES_STORAGE_KEY = 'saddam_store_hero_slides_v1';

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'slide-1',
    badgeAr: 'الجيل الجديد 2026 • متجر صدام العقاري',
    badgeEn: 'Next-Gen 2026 • Saddam Al-Aqari Store',
    titleAr: 'آبل آيفون 16 برو ماكس',
    titleEn: 'Apple iPhone 16 Pro Max',
    subtitleAr: 'قوة التيتانيوم الصحراوي، معالج A18 Pro الخارق وشاشة ريتينا XDR 6.9 إنش مع ضمان الوكالة',
    subtitleEn: 'Titanium Grade 5 with A18 Pro Bionic, Camera Control & 6.9" ProMotion Display',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=85&w=1920&auto=format&fit=crop',
    buttonTextAr: 'طلب فوري عبر واتساب',
    buttonLink: 'https://wa.me/967774102030',
    enabled: true,
  },
  {
    id: 'slide-2',
    badgeAr: 'ذكاء اصطناعي Galaxy AI • الأقوى عالمياً',
    badgeEn: 'Galaxy AI Inside • Flagship Android',
    titleAr: 'سامسونج جالكسي S25 ألترا 5G',
    titleEn: 'Samsung Galaxy S25 Ultra 5G',
    subtitleAr: 'معالج Snapdragon 8 Elite الخارق، كاميرا 200 ميجابكسل الأسطورية وقلم S-Pen مدمج',
    subtitleEn: 'Snapdragon 8 Elite with 200MP Space Zoom Camera & Integrated S-Pen',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=85&w=1920&auto=format&fit=crop',
    buttonTextAr: 'استعراض الأجهزة',
    buttonLink: '#shop',
    enabled: true,
  },
  {
    id: 'slide-3',
    badgeAr: 'شواحن GaN فائقة وسماعات أصلية',
    badgeEn: 'GaN Power & Pro Audio Gear',
    titleAr: 'شواحن أنكر وسماعات سوني وآبل',
    titleEn: 'Anker GaN & Sony / Apple Audio',
    subtitleAr: 'شواحن سريعة حتى 65W ومنصات MagSafe اللاسلكية وسماعات العزل الأسطورية بضمان كامل',
    subtitleEn: 'High-speed 65W GaN Chargers, MagSafe Stands & World-Class Active Noise Canceling',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=85&w=1920&auto=format&fit=crop',
    buttonTextAr: 'تسوق الملحقات',
    buttonLink: '#shop',
    enabled: true,
  },
];

export function getStoredHeroSlides(): HeroSlideItem[] {
  try {
    const data = localStorage.getItem(HERO_SLIDES_STORAGE_KEY);
    if (!data) return DEFAULT_HERO_SLIDES;
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_HERO_SLIDES;
  } catch {
    return DEFAULT_HERO_SLIDES;
  }
}

export function saveStoredHeroSlides(slides: HeroSlideItem[]): void {
  try {
    localStorage.setItem(HERO_SLIDES_STORAGE_KEY, JSON.stringify(slides));
    window.dispatchEvent(new CustomEvent('saddam-hero-slides-updated', { detail: slides }));
  } catch (e) {
    console.error('Failed to save hero slides', e);
  }
}

export interface StoreDiscountConfig {
  enabled: boolean;
  bannerTextAr: string;
  bannerTextEn: string;
  discountPercentage: number;
  promoCode: string;
}

export const DEFAULT_DISCOUNT_CONFIG: StoreDiscountConfig = {
  enabled: false,
  bannerTextAr: 'عروض حصرية وخصومات خاصة لفترة محدودة بمناسبة الافتتاح!',
  bannerTextEn: 'Exclusive discounts & special offers for a limited time!',
  discountPercentage: 10,
  promoCode: 'SADDAM10',
};

// Initial user-requested product from owner's screenshot: "غلافات نسائي A32"
export const INITIAL_USER_PRODUCT: Product = {
  id: 'prod-user-a32-case',
  sku: 'SDM-8892',
  name: 'Samsung Galaxy A32 Women Cases',
  nameAr: 'غلافات نسائي A32',
  brand: 'GENERIC',
  price: 1500,
  originalPrice: 2000,
  discountPercentage: 25,
  category: 'cases',
  categoryNameEn: 'Cases & Protection',
  categoryNameAr: 'كفرات وحماية',
  description: 'Stylish high-protection women case for Samsung Galaxy A32 with shockproof bumpers.',
  descriptionAr: 'كفر أنيق وعصري عالي الحماية لهاتف سامسونج جالاكسي A32، مقاوم للصدمات والخدوش بتصميم نسائي متميز.',
  rating: 5.0,
  reviewsCount: 1,
  stock: 45,
  inStock: true,
  warrantyYears: 1,
  fastShipping: true,
  image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
  images: [
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
  ],
  colors: [], // No colors forced
  variants: {
    titleEn: 'Model',
    titleAr: 'الموديل',
    options: ['Samsung A32 4G', 'Samsung A32 5G'],
  },
  specs: {
    material: { en: 'Shockproof TPU / Acrylic', ar: 'سيليكون مقوى مقاوم للصدمات' },
    protection: { en: 'Drop Protection & Raised Camera Lips', ar: 'حماية متكاملة وحواف بارزة للكاميرا' },
  },
  hidden: false,
};

// Start clean with only user's product, NO mock products
export const INITIAL_PRODUCTS_LIST: Product[] = [INITIAL_USER_PRODUCT];

/**
 * Dynamic Products Management
 */
export function getStoredProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS_LIST));
      return INITIAL_PRODUCTS_LIST;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // If user has saved products, return them
      return parsed;
    }
    return INITIAL_PRODUCTS_LIST;
  } catch (e) {
    console.error('Failed to parse stored products', e);
    return INITIAL_PRODUCTS_LIST;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('saddam-products-updated', { detail: products }));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

/**
 * Wipe all products and start completely empty for the owner
 */
export function clearAllProducts(): Product[] {
  try {
    const empty: Product[] = [];
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(empty));
    window.dispatchEvent(new CustomEvent('saddam-products-updated', { detail: empty }));
    return empty;
  } catch {
    return [];
  }
}

/**
 * Reset to initial owner product
 */
export function resetProductsToInitial(): Product[] {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS_LIST));
    window.dispatchEvent(new CustomEvent('saddam-products-updated', { detail: INITIAL_PRODUCTS_LIST }));
    return INITIAL_PRODUCTS_LIST;
  } catch {
    return INITIAL_PRODUCTS_LIST;
  }
}

/**
 * Dynamic YouTube Shorts / Reels Management
 */
export function getStoredShorts(): ShortVideoItem[] {
  try {
    const data = localStorage.getItem(SHORTS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SHORTS_STORAGE_KEY, JSON.stringify(YOUTUBE_SHORTS_DATA));
      return YOUTUBE_SHORTS_DATA;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return YOUTUBE_SHORTS_DATA;
  } catch (e) {
    console.error('Failed to load stored shorts', e);
    return YOUTUBE_SHORTS_DATA;
  }
}

export function saveStoredShorts(shorts: ShortVideoItem[]): void {
  try {
    localStorage.setItem(SHORTS_STORAGE_KEY, JSON.stringify(shorts));
    window.dispatchEvent(new CustomEvent('saddam-shorts-updated', { detail: shorts }));
  } catch (e) {
    console.error('Failed to save shorts to localStorage', e);
  }
}

/**
 * Store-Wide Discount Configuration
 */
export function getStoredDiscountConfig(): StoreDiscountConfig {
  try {
    const data = localStorage.getItem(STORE_DISCOUNT_CONFIG_KEY);
    if (!data) return DEFAULT_DISCOUNT_CONFIG;
    return JSON.parse(data);
  } catch {
    return DEFAULT_DISCOUNT_CONFIG;
  }
}

export function saveStoredDiscountConfig(config: StoreDiscountConfig): void {
  try {
    localStorage.setItem(STORE_DISCOUNT_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('saddam-discount-updated', { detail: config }));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Backup and Remote Sync JSON
 */
export function exportStoreBackupJSON(): string {
  const products = getStoredProducts();
  const shorts = getStoredShorts();
  const discounts = getStoredDiscountConfig();
  const heroSlides = getStoredHeroSlides();
  const backup = {
    storeName: 'محلات صدام العقاري',
    exportedAt: new Date().toISOString(),
    version: '4.1',
    products,
    shorts,
    discounts,
    heroSlides,
  };
  return JSON.stringify(backup, null, 2);
}

export function importStoreBackupJSON(jsonStr: string): { success: boolean; message: string; productsCount?: number; shortsCount?: number } {
  try {
    const parsed = JSON.parse(jsonStr);
    let importedProducts = 0;
    let importedShorts = 0;

    if (parsed.products && Array.isArray(parsed.products)) {
      saveStoredProducts(parsed.products);
      importedProducts = parsed.products.length;
    }

    if (parsed.shorts && Array.isArray(parsed.shorts)) {
      saveStoredShorts(parsed.shorts);
      importedShorts = parsed.shorts.length;
    }

    if (parsed.discounts) {
      saveStoredDiscountConfig(parsed.discounts);
    }

    if (parsed.heroSlides && Array.isArray(parsed.heroSlides)) {
      saveStoredHeroSlides(parsed.heroSlides);
    }

    if (importedProducts === 0 && importedShorts === 0) {
      return { success: false, message: 'الملف لا يحتوي على بيانات منتجات أو فيديوهات صالحة' };
    }

    return {
      success: true,
      message: `تم استيراد ${importedProducts} منتج و ${importedShorts} فيديو بنجاح!`,
      productsCount: importedProducts,
      shortsCount: importedShorts,
    };
  } catch (err: any) {
    return { success: false, message: `فشل استيراد البيانات: ${err?.message || 'تنسيق JSON غير صالح'}` };
  }
}

// Re-export Security helpers for convenience
export {
  MASTER_ADMIN_PIN,
  verifyAdminPinSecure,
  isAdminSessionActive,
  setAdminSessionActive,
  setCustomAdminPin,
  resetAdminPinToDefault,
};
