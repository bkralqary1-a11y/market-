export type CategoryId = 'all' | 'phones' | 'audio' | 'cases' | 'chargers' | 'cables';

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
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
  stock?: number;
  fastShipping: boolean;
  warrantyYears: number;
  isTrending?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  condition?: string;
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
  hidden?: boolean;
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
  | 'wholesale'
  | 'admin';

export type Language = 'ar' | 'en';

export type Currency = 'YER';

export interface HeroSlideItem {
  id: string;
  badgeAr: string;
  badgeEn?: string;
  titleAr: string;
  titleEn?: string;
  subtitleAr: string;
  subtitleEn?: string;
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string;
  buttonTextAr?: string;
  buttonLink?: string;
  enabled?: boolean;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered';
  itemsCount: number;
  items: CartItem[];
}

export interface ShortVideoItem {
  id: string;
  youtubeId: string;
  shortsUrl: string;
  titleAr: string;
  titleEn: string;
  captionAr: string;
  captionEn: string;
  viewsText: string;
  productId: string;
  productNameAr: string;
  productNameEn: string;
  productPrice: number;
  productImage: string;
  tagAr: string;
  tagEn: string;
  hidden?: boolean;
}
