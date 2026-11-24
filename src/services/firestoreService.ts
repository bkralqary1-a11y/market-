import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { Product, HeroSlideItem, StoreCategoryItem } from '../types';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_CATEGORY_IMAGES,
  INITIAL_PRODUCTS_LIST,
} from '../utils/storeStorage';
import { sanitizeSafeHttpUrl, sanitizeSafeMediaUrl } from '../utils/urlSecurity';

export interface CustomCategoryConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string;
  hidden: boolean;
}

export interface SiteConfig {
  storeNameAr: string;
  storeNameEn: string;
  taglineAr: string;
  taglineEn: string;
  addressAr: string;
  addressEn: string;
  whatsappPrimary: string;
  whatsappSecondary: string;
  phoneTertiary: string;
  bannerEnabled: boolean;
  bannerTextAr: string;
  bannerTextEn: string;
  promoCode: string;
  bento1BadgeAr: string;
  bento1TitleAr: string;
  bento1DescAr: string;
  bento2BadgeAr: string;
  bento2TitleAr: string;
  bento2DescAr: string;
  catPhonesImg: string;
  catAudioImg: string;
  catCasesImg: string;
  catChargersImg: string;
  catCablesImg: string;
  catPhonesNameAr: string;
  catAudioNameAr: string;
  catCasesNameAr: string;
  catChargersNameAr: string;
  catCablesNameAr: string;
  categoriesSectionBadgeAr: string;
  categoriesSectionTitleAr: string;
  productsSectionBadgeAr: string;
  productsSectionTitleAr: string;
  hideHero?: boolean;
  hideBento1?: boolean;
  hideBento2?: boolean;
  hideTrustPillars?: boolean;
  hideBrandsBar?: boolean;
  hideCategoriesSection?: boolean;
  hideProductsSection?: boolean;
  hiddenCategories?: string[];
  customCategories?: CustomCategoryConfig[];
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  storeNameAr: 'محلات صدام العقاري',
  storeNameEn: 'Saddam Al-Aqari Store',
  taglineAr: 'تسوق بثقة · الهواتف الذكية ومستلزماتها',
  taglineEn: 'Shop with Confidence · Smartphones & Gear',
  addressAr: 'عمران - الشارع العام امام ابن مهدي الخدري والهدور - جوار الذفيف',
  addressEn: 'Amran - Main Street, In front of Ibn Mahdi Al-Khadri & Al-Hadoor, Next to Al-Dhafeef',
  whatsappPrimary: '774102030',
  whatsappSecondary: '777551485',
  phoneTertiary: '777059581',
  bannerEnabled: false,
  bannerTextAr: 'عروض حصرية وخصومات خاصة لفترة محدودة بمناسبة الافتتاح!',
  bannerTextEn: 'Exclusive discounts & special offers for a limited time!',
  promoCode: 'SADDAM10',
  bento1BadgeAr: 'تسوق بثقة · ضمان الوكالة',
  bento1TitleAr: 'أحدث الهواتف الذكية 5G',
  bento1DescAr: 'آيفون 16 برو ماكس وسامسونج ألترا بأفضل سعر وفاتورة رسمية.',
  bento2BadgeAr: 'شحن فائق GaN · ملحقات أصلية',
  bento2TitleAr: 'الشواحن والسماعات المعتمدة',
  bento2DescAr: 'Anker و Belkin و Sony مع فحص فوري قبل الدفع وتوصيل سريع.',
  catPhonesImg: DEFAULT_CATEGORY_IMAGES.phones,
  catAudioImg: DEFAULT_CATEGORY_IMAGES.audio,
  catCasesImg: DEFAULT_CATEGORY_IMAGES.cases,
  catChargersImg: DEFAULT_CATEGORY_IMAGES.chargers,
  catCablesImg: DEFAULT_CATEGORY_IMAGES.cables,
  catPhonesNameAr: 'الهواتف الذكية',
  catAudioNameAr: 'السماعات',
  catCasesNameAr: 'الكفرات',
  catChargersNameAr: 'الشواحن',
  catCablesNameAr: 'الكيابل',
  categoriesSectionBadgeAr: 'تصفح حسب القسم',
  categoriesSectionTitleAr: 'أقسام المتجر المعتمدة',
  productsSectionBadgeAr: 'مختارات الثقة والأكثر طلباً',
  productsSectionTitleAr: 'أحدث الأجهزة والملحقات الأصلية',
  hideHero: false,
  hideBento1: false,
  hideBento2: false,
  hideTrustPillars: false,
  hideBrandsBar: false,
  hideCategoriesSection: false,
  hideProductsSection: false,
  hiddenCategories: [],
  customCategories: [],
};

export const CATEGORY_META: Record<string, { nameAr: string; nameEn: string }> = {
  phones: { nameAr: 'الهواتف الذكية', nameEn: 'Smartphones' },
  audio: { nameAr: 'السماعات', nameEn: 'Headphones & Audio' },
  cases: { nameAr: 'الكفرات', nameEn: 'Cases & Covers' },
  chargers: { nameAr: 'الشواحن', nameEn: 'Chargers & Power' },
  cables: { nameAr: 'الكيابل', nameEn: 'Cables & Adapters' },
};

export const BUILTIN_CATEGORY_IDS = ['phones', 'audio', 'cases', 'chargers', 'cables'] as const;

export function getStoreCategories(
  siteConfig: SiteConfig,
  includeHidden = false
): StoreCategoryItem[] {
  const hiddenSet = new Set(siteConfig.hiddenCategories || []);

  const builtIns: StoreCategoryItem[] = [
    {
      id: 'phones',
      nameAr: siteConfig.catPhonesNameAr || 'الهواتف الذكية',
      nameEn: 'Smartphones',
      image: siteConfig.catPhonesImg || DEFAULT_CATEGORY_IMAGES.phones,
      hidden: hiddenSet.has('phones'),
      isCustom: false,
    },
    {
      id: 'audio',
      nameAr: siteConfig.catAudioNameAr || 'السماعات',
      nameEn: 'Headphones & Audio',
      image: siteConfig.catAudioImg || DEFAULT_CATEGORY_IMAGES.audio,
      hidden: hiddenSet.has('audio'),
      isCustom: false,
    },
    {
      id: 'cases',
      nameAr: siteConfig.catCasesNameAr || 'الكفرات',
      nameEn: 'Cases & Covers',
      image: siteConfig.catCasesImg || DEFAULT_CATEGORY_IMAGES.cases,
      hidden: hiddenSet.has('cases'),
      isCustom: false,
    },
    {
      id: 'chargers',
      nameAr: siteConfig.catChargersNameAr || 'الشواحن',
      nameEn: 'Chargers & Power',
      image: siteConfig.catChargersImg || DEFAULT_CATEGORY_IMAGES.chargers,
      hidden: hiddenSet.has('chargers'),
      isCustom: false,
    },
    {
      id: 'cables',
      nameAr: siteConfig.catCablesNameAr || 'الكيابل',
      nameEn: 'Cables & Adapters',
      image: siteConfig.catCablesImg || DEFAULT_CATEGORY_IMAGES.cables,
      hidden: hiddenSet.has('cables'),
      isCustom: false,
    },
  ];

  const customs: StoreCategoryItem[] = (siteConfig.customCategories || [])
    .filter((c) => c && c.id && c.nameAr)
    .map((c) => ({
      id: c.id,
      nameAr: c.nameAr,
      nameEn: c.nameEn || c.nameAr,
      image: c.image || '',
      hidden: Boolean(c.hidden),
      isCustom: true,
    }));

  const all = [...builtIns, ...customs];
  return includeHidden ? all : all.filter((c) => !c.hidden);
}

const clip = (val: unknown, maxLen: number, fallback = ''): string => {
  if (typeof val !== 'string') return fallback.slice(0, maxLen);
  return val.trim().slice(0, maxLen);
};

export function normalizeSafeId(rawId: string, prefix: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 120);
  if (cleaned.length >= 2) return cleaned;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Keep track of Firestore createdAt timestamps so updates strictly satisfy immutable createdAt rule
const productCreatedAtCache = new Map<string, Timestamp>();
const slideCreatedAtCache = new Map<string, Timestamp>();

function sanitizeSpecs(
  specs: Product['specs'] | undefined
): Record<string, { en: string; ar: string }> {
  const result: Record<string, { en: string; ar: string }> = {};
  if (!specs || typeof specs !== 'object') return result;
  const entries = Object.entries(specs).slice(0, 25);
  for (const [k, v] of entries) {
    const safeKey = k.trim().slice(0, 60);
    if (!safeKey || !v) continue;
    const arVal = clip(v.ar, 200);
    const enVal = clip(v.en || v.ar, 200);
    if (!arVal && !enVal) continue;
    result[safeKey] = { ar: arVal, en: enVal };
  }
  return result;
}

export function sanitizeProductForFirestore(
  product: Product,
  existingCreatedAt?: Timestamp | null
): Record<string, unknown> {
  const safeId = normalizeSafeId(product.id, 'prod');
  const rawCategory = (product.category || 'phones').trim();
  const safeCategory =
    rawCategory && rawCategory !== 'all' ? normalizeSafeId(rawCategory, 'cat') : 'phones';
  const catMeta = CATEGORY_META[safeCategory] || {
    nameAr: product.categoryNameAr || '',
    nameEn: product.categoryNameEn || product.categoryNameAr || '',
  };

  const cleanImages = (Array.isArray(product.images) ? product.images : [])
    .map((url) => sanitizeSafeMediaUrl(clip(url, 250000)))
    .filter((url) => url.length > 0)
    .slice(0, 8);
  const primaryImage = sanitizeSafeMediaUrl(clip(product.image || cleanImages[0] || '', 250000));
  if (primaryImage && !cleanImages.includes(primaryImage)) {
    cleanImages.unshift(primaryImage);
  }

  const cleanColors = (Array.isArray(product.colors) ? product.colors : [])
    .map((c) => clip(c, 40))
    .filter((c) => c.length > 0)
    .slice(0, 12);

  const cleanColorNamesAr = (Array.isArray(product.colorNamesAr) ? product.colorNamesAr : [])
    .map((c) => clip(c, 60))
    .slice(0, 12);

  const cleanVariantOptions = (
    Array.isArray(product.variants?.options) ? product.variants.options : []
  )
    .map((opt) => clip(opt, 100))
    .filter((opt) => opt.length > 0)
    .slice(0, 20);

  const price = Math.max(0, Number(product.price) || 0);
  const originalPrice =
    product.originalPrice !== undefined && Number(product.originalPrice) > 0
      ? Math.max(0, Number(product.originalPrice))
      : undefined;
  const discountPercentage =
    product.discountPercentage !== undefined && Number(product.discountPercentage) > 0
      ? Math.min(100, Math.max(0, Math.round(Number(product.discountPercentage))))
      : undefined;

  // Respect empty/zero optional values — NEVER inject fake defaults!
  const rating = Math.min(5, Math.max(0, Number(product.rating) || 0));
  const reviewsCount = Math.max(0, Math.round(Number(product.reviewsCount) || 0));
  const warrantyYears = Math.min(10, Math.max(0, Number(product.warrantyYears) || 0));
  const stock =
    product.stock !== undefined ? Math.max(0, Math.round(Number(product.stock) || 0)) : 0;

  const payload: Record<string, unknown> = {
    id: safeId,
    sku: clip(product.sku || '', 64),
    name: clip(product.name || '', 200),
    nameAr: clip(product.nameAr || product.name, 200, 'منتج جديد'),
    brand: clip(product.brand || '', 80),
    price,
    category: safeCategory,
    categoryNameEn: clip(product.categoryNameEn || catMeta.nameEn, 80),
    categoryNameAr: clip(product.categoryNameAr || catMeta.nameAr, 80),
    image: primaryImage,
    images: cleanImages.slice(0, 8),
    rating,
    reviewsCount,
    description: clip(product.description || '', 3000),
    descriptionAr: clip(product.descriptionAr || '', 3000),
    inStock: Boolean(product.inStock),
    stock,
    fastShipping: Boolean(product.fastShipping),
    warrantyYears,
    isTrending: Boolean(product.isTrending ?? true),
    isPopular: Boolean(product.isPopular ?? false),
    isFeatured: Boolean(product.isFeatured ?? false),
    colors: cleanColors,
    variants: {
      titleEn: clip(product.variants?.titleEn || '', 80),
      titleAr: clip(product.variants?.titleAr || '', 80),
      options: cleanVariantOptions,
    },
    specs: sanitizeSpecs(product.specs),
    hidden: Boolean(product.hidden ?? false),
    createdAt: existingCreatedAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (originalPrice !== undefined) payload.originalPrice = originalPrice;
  if (discountPercentage !== undefined) payload.discountPercentage = discountPercentage;
  if (cleanColorNamesAr.length > 0) payload.colorNamesAr = cleanColorNamesAr;
  if (product.tag && clip(product.tag, 60)) payload.tag = clip(product.tag, 60);
  if (product.tagAr && clip(product.tagAr, 60)) payload.tagAr = clip(product.tagAr, 60);
  const safeVideoUrl = sanitizeSafeHttpUrl(clip(product.videoUrl || '', 1500));
  if (safeVideoUrl) {
    payload.videoUrl = safeVideoUrl;
  }

  return payload;
}

export function sanitizeHeroSlideForFirestore(
  slide: HeroSlideItem,
  order: number,
  existingCreatedAt?: Timestamp | null
): Record<string, unknown> {
  const safeId = normalizeSafeId(slide.id, 'slide');
  const payload: Record<string, unknown> = {
    id: safeId,
    badgeAr: clip(slide.badgeAr || '', 160),
    titleAr: clip(slide.titleAr || 'عرض خاص', 200, 'عرض خاص'),
    subtitleAr: clip(slide.subtitleAr || '', 500),
    mediaType: slide.mediaType === 'video' ? 'video' : 'image',
    imageUrl: sanitizeSafeMediaUrl(clip(slide.imageUrl || '', 250000)),
    order: Math.min(100, Math.max(0, Math.round(order))),
    enabled: slide.enabled !== false,
    createdAt: existingCreatedAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (slide.badgeEn) payload.badgeEn = clip(slide.badgeEn, 160);
  if (slide.titleEn) payload.titleEn = clip(slide.titleEn, 200);
  if (slide.subtitleEn) payload.subtitleEn = clip(slide.subtitleEn, 500);
  const safeSlideVideoUrl = sanitizeSafeHttpUrl(clip(slide.videoUrl || '', 1500));
  if (safeSlideVideoUrl) payload.videoUrl = safeSlideVideoUrl;
  if (slide.buttonTextAr) payload.buttonTextAr = clip(slide.buttonTextAr, 80);
  if (slide.buttonTextEn) payload.buttonTextEn = clip(slide.buttonTextEn, 80);
  if (slide.featureBadge1Ar) payload.featureBadge1Ar = clip(slide.featureBadge1Ar, 100);
  if (slide.featureBadge2Ar) payload.featureBadge2Ar = clip(slide.featureBadge2Ar, 100);
  if (slide.whatsappCustomTextAr) {
    payload.whatsappCustomTextAr = clip(slide.whatsappCustomTextAr, 300);
  }

  return payload;
}

export function sanitizeSiteConfigForFirestore(config: SiteConfig): Record<string, unknown> {
  const cleanHiddenCats = (Array.isArray(config.hiddenCategories) ? config.hiddenCategories : [])
    .map((id) => clip(id, 80))
    .filter(Boolean)
    .slice(0, 20);

  const cleanCustomCats: CustomCategoryConfig[] = (
    Array.isArray(config.customCategories) ? config.customCategories : []
  )
    .filter((c) => c && typeof c === 'object' && clip(c.nameAr, 80).length > 0)
    .slice(0, 15)
    .map((c) => ({
      id: normalizeSafeId(c.id || '', 'cat'),
      nameAr: clip(c.nameAr, 80),
      nameEn: clip(c.nameEn || c.nameAr, 80),
      image: sanitizeSafeMediaUrl(clip(c.image || '', 120000)),
      hidden: Boolean(c.hidden),
    }));

  return {
    storeNameAr: clip(config.storeNameAr, 120, DEFAULT_SITE_CONFIG.storeNameAr),
    storeNameEn: clip(config.storeNameEn, 120, DEFAULT_SITE_CONFIG.storeNameEn),
    taglineAr: clip(config.taglineAr, 200),
    taglineEn: clip(config.taglineEn, 200),
    addressAr: clip(config.addressAr, 300),
    addressEn: clip(config.addressEn, 300),
    whatsappPrimary: clip(config.whatsappPrimary, 30, DEFAULT_SITE_CONFIG.whatsappPrimary),
    whatsappSecondary: clip(config.whatsappSecondary, 30, DEFAULT_SITE_CONFIG.whatsappSecondary),
    phoneTertiary: clip(config.phoneTertiary, 30, DEFAULT_SITE_CONFIG.phoneTertiary),
    bannerEnabled: Boolean(config.bannerEnabled),
    bannerTextAr: clip(config.bannerTextAr, 300),
    bannerTextEn: clip(config.bannerTextEn, 300),
    promoCode: clip(config.promoCode, 40),
    bento1BadgeAr: clip(config.bento1BadgeAr, 120),
    bento1TitleAr: clip(config.bento1TitleAr, 160),
    bento1DescAr: clip(config.bento1DescAr, 300),
    bento2BadgeAr: clip(config.bento2BadgeAr, 120),
    bento2TitleAr: clip(config.bento2TitleAr, 160),
    bento2DescAr: clip(config.bento2DescAr, 300),
    catPhonesImg: sanitizeSafeMediaUrl(clip(config.catPhonesImg, 150000)),
    catAudioImg: sanitizeSafeMediaUrl(clip(config.catAudioImg, 150000)),
    catCasesImg: sanitizeSafeMediaUrl(clip(config.catCasesImg, 150000)),
    catChargersImg: sanitizeSafeMediaUrl(clip(config.catChargersImg, 150000)),
    catCablesImg: sanitizeSafeMediaUrl(clip(config.catCablesImg, 150000)),
    catPhonesNameAr: clip(config.catPhonesNameAr || DEFAULT_SITE_CONFIG.catPhonesNameAr, 80),
    catAudioNameAr: clip(config.catAudioNameAr || DEFAULT_SITE_CONFIG.catAudioNameAr, 80),
    catCasesNameAr: clip(config.catCasesNameAr || DEFAULT_SITE_CONFIG.catCasesNameAr, 80),
    catChargersNameAr: clip(config.catChargersNameAr || DEFAULT_SITE_CONFIG.catChargersNameAr, 80),
    catCablesNameAr: clip(config.catCablesNameAr || DEFAULT_SITE_CONFIG.catCablesNameAr, 80),
    categoriesSectionBadgeAr: clip(
      config.categoriesSectionBadgeAr || DEFAULT_SITE_CONFIG.categoriesSectionBadgeAr,
      120
    ),
    categoriesSectionTitleAr: clip(
      config.categoriesSectionTitleAr || DEFAULT_SITE_CONFIG.categoriesSectionTitleAr,
      160
    ),
    productsSectionBadgeAr: clip(
      config.productsSectionBadgeAr || DEFAULT_SITE_CONFIG.productsSectionBadgeAr,
      120
    ),
    productsSectionTitleAr: clip(
      config.productsSectionTitleAr || DEFAULT_SITE_CONFIG.productsSectionTitleAr,
      160
    ),
    hideHero: Boolean(config.hideHero),
    hideBento1: Boolean(config.hideBento1),
    hideBento2: Boolean(config.hideBento2),
    hideTrustPillars: Boolean(config.hideTrustPillars),
    hideBrandsBar: Boolean(config.hideBrandsBar),
    hideCategoriesSection: Boolean(config.hideCategoriesSection),
    hideProductsSection: Boolean(config.hideProductsSection),
    hiddenCategories: cleanHiddenCats,
    customCategories: cleanCustomCats,
    updatedAt: serverTimestamp(),
  };
}

// --- Real-Time Listeners ---

export function subscribeToProducts(
  onData: (products: Product[], hasCloudDocs: boolean) => void,
  includeHidden = false
) {
  const colRef = collection(db, 'products');
  const q = includeHidden ? colRef : query(colRef, where('hidden', '==', false));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData([], false);
        return;
      }
      const list: Product[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        if (data.createdAt instanceof Timestamp) {
          productCreatedAtCache.set(docSnap.id, data.createdAt);
        }
        const safeImg = sanitizeSafeMediaUrl(data.image);
        const safeImages = (
          Array.isArray(data.images) ? data.images : safeImg ? [safeImg] : []
        )
          .map((u: unknown) => sanitizeSafeMediaUrl(u))
          .filter(Boolean);
        return {
          ...(data as Product),
          id: docSnap.id,
          image: safeImg || safeImages[0] || '',
          images: safeImages,
          videoUrl: sanitizeSafeHttpUrl(data.videoUrl) || undefined,
          colors: Array.isArray(data.colors) ? data.colors : [],
          colorNamesAr: Array.isArray(data.colorNamesAr) ? data.colorNamesAr : [],
          variants: data.variants || { titleEn: '', titleAr: '', options: [] },
          specs: data.specs || {},
        };
      });
      onData(list, true);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'products');
      } catch {
        // Logged in structured format
      }
    }
  );
}

export function subscribeToHeroSlides(
  onData: (slides: (HeroSlideItem & { order?: number })[], hasCloudDocs: boolean) => void,
  includeDisabled = false
) {
  const colRef = collection(db, 'heroSlides');
  const q = includeDisabled ? colRef : query(colRef, where('enabled', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData([], false);
        return;
      }
      const list = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          if (data.createdAt instanceof Timestamp) {
            slideCreatedAtCache.set(docSnap.id, data.createdAt);
          }
          return {
            ...(data as HeroSlideItem & { order?: number }),
            id: docSnap.id,
            imageUrl: sanitizeSafeMediaUrl(data.imageUrl),
            videoUrl: sanitizeSafeHttpUrl(data.videoUrl) || undefined,
          };
        })
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(list, true);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'heroSlides');
      } catch {
        // Logged in structured format
      }
    }
  );
}

export function subscribeToSiteConfig(
  onData: (config: SiteConfig, hasCloudDoc: boolean) => void
) {
  const docRef = doc(db, 'siteConfig', 'main');
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        onData(DEFAULT_SITE_CONFIG, false);
        return;
      }
      const raw = snap.data() as Partial<SiteConfig>;
      const merged: SiteConfig = {
        ...DEFAULT_SITE_CONFIG,
        ...raw,
        catPhonesImg: sanitizeSafeMediaUrl(raw.catPhonesImg ?? DEFAULT_SITE_CONFIG.catPhonesImg),
        catAudioImg: sanitizeSafeMediaUrl(raw.catAudioImg ?? DEFAULT_SITE_CONFIG.catAudioImg),
        catCasesImg: sanitizeSafeMediaUrl(raw.catCasesImg ?? DEFAULT_SITE_CONFIG.catCasesImg),
        catChargersImg: sanitizeSafeMediaUrl(raw.catChargersImg ?? DEFAULT_SITE_CONFIG.catChargersImg),
        catCablesImg: sanitizeSafeMediaUrl(raw.catCablesImg ?? DEFAULT_SITE_CONFIG.catCablesImg),
        customCategories: Array.isArray(raw.customCategories)
          ? raw.customCategories.map((c) => ({
              ...c,
              image: sanitizeSafeMediaUrl(c?.image),
            }))
          : [],
      };
      onData(merged, true);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'siteConfig/main');
      } catch {
        // Logged in structured format
      }
    }
  );
}

// --- Admin Cloud Write Operations ---

export async function saveProductToCloud(product: Product): Promise<string> {
  const safeId = normalizeSafeId(product.id, 'prod');
  const docRef = doc(db, 'products', safeId);
  try {
    let existingCreatedAt = productCreatedAtCache.get(safeId) || null;
    if (!existingCreatedAt) {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists() && existingSnap.data().createdAt instanceof Timestamp) {
        existingCreatedAt = existingSnap.data().createdAt as Timestamp;
        productCreatedAtCache.set(safeId, existingCreatedAt);
      }
    }
    const payload = sanitizeProductForFirestore({ ...product, id: safeId }, existingCreatedAt);
    await setDoc(docRef, payload);
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${safeId}`);
  }
}

export async function deleteProductFromCloud(productId: string): Promise<void> {
  const docRef = doc(db, 'products', productId);
  try {
    await deleteDoc(docRef);
    productCreatedAtCache.delete(productId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}

export async function saveHeroSlideToCloud(
  slide: HeroSlideItem,
  order: number
): Promise<string> {
  const safeId = normalizeSafeId(slide.id, 'slide');
  const docRef = doc(db, 'heroSlides', safeId);
  try {
    let existingCreatedAt = slideCreatedAtCache.get(safeId) || null;
    if (!existingCreatedAt) {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists() && existingSnap.data().createdAt instanceof Timestamp) {
        existingCreatedAt = existingSnap.data().createdAt as Timestamp;
        slideCreatedAtCache.set(safeId, existingCreatedAt);
      }
    }
    const payload = sanitizeHeroSlideForFirestore(
      { ...slide, id: safeId },
      order,
      existingCreatedAt
    );
    await setDoc(docRef, payload);
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `heroSlides/${safeId}`);
  }
}

export async function deleteHeroSlideFromCloud(slideId: string): Promise<void> {
  const docRef = doc(db, 'heroSlides', slideId);
  try {
    await deleteDoc(docRef);
    slideCreatedAtCache.delete(slideId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `heroSlides/${slideId}`);
  }
}

export async function saveSiteConfigToCloud(config: SiteConfig): Promise<void> {
  const docRef = doc(db, 'siteConfig', 'main');
  try {
    const payload = sanitizeSiteConfigForFirestore(config);
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteConfig/main');
  }
}

export async function seedDefaultDataToCloud(
  initialProducts: Product[] = INITIAL_PRODUCTS_LIST,
  initialSlides: HeroSlideItem[] = DEFAULT_HERO_SLIDES,
  initialConfig: SiteConfig = DEFAULT_SITE_CONFIG
): Promise<void> {
  await saveSiteConfigToCloud(initialConfig);
  for (let i = 0; i < initialSlides.length; i++) {
    await saveHeroSlideToCloud(initialSlides[i], i);
  }
  for (const prod of initialProducts) {
    await saveProductToCloud(prod);
  }
}
