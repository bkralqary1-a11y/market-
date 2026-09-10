export type CategoryId = 'all' | 'phones' | 'audio' | 'cases' | 'chargers' | 'cables';

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  category: CategoryId;
  categoryNameEn: string;
  categoryNameAr: string;
  brand: string;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  description: string;
  descriptionAr: string;
  inStock: boolean;
  fastShipping: boolean;
  warrantyYears: number;
  isTrending?: boolean;
  isPopular?: boolean;
  colors: string[];
  colorNamesAr?: string[];
  variants: {
    titleEn: string;
    titleAr: string;
    options: string[];
  };
  specs: {
    [key: string]: { en: string; ar: string };
  };
  sku: string;
  tag?: string;
  tagAr?: string;
  videoUrl?: string;
  pinterestUrl?: string;
  pinterestImages?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedVariant: string;
  warrantyUpgrade?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  nameAr: string;
  descriptionAr: string;
  image: string;
  itemCount: number;
  iconName: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  badge: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  commentAr: string;
  verifiedPurchase?: boolean;
}

export type PageView =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'compare'
  | 'account'
  | 'wholesale';

export type Language = 'ar' | 'en';

export type Currency = 'YER';

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered';
  itemsCount: number;
  items: CartItem[];
}
