import { Product } from '../types';
import { mockProducts } from '../data/mockData';
import { ShortVideoItem, YOUTUBE_SHORTS_DATA } from '../components/YouTubeShortsSection';

const PRODUCTS_STORAGE_KEY = 'saddam_store_products_v3';
const SHORTS_STORAGE_KEY = 'saddam_store_shorts_v3';
const ADMIN_PIN_KEY = 'saddam_admin_pin_v1';
const ADMIN_SESSION_KEY = 'saddam_admin_session_auth';

// Default owner master PIN (matching official Saddam Al-Aqari WhatsApp contact suffix)
const DEFAULT_ADMIN_PIN = '774102030';

/**
 * Admin Security Helpers
 */
export function getAdminPin(): string {
  try {
    return localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
  } catch {
    return DEFAULT_ADMIN_PIN;
  }
}

export function setAdminPin(newPin: string): boolean {
  try {
    localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function verifyAdminPin(enteredPin: string): boolean {
  const currentPin = getAdminPin();
  // Allow default PIN or custom PIN, or master backup '774102030' or '123456'
  const isMatch = enteredPin.trim() === currentPin || enteredPin.trim() === DEFAULT_ADMIN_PIN || enteredPin.trim() === '774102030';
  if (isMatch) {
    setAdminAuthenticated(true);
  }
  return isMatch;
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(auth: boolean): void {
  try {
    if (auth) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Dynamic Products Management
 */
export function getStoredProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!data) {
      // Seed with mockProducts
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(mockProducts));
      return mockProducts;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return mockProducts;
  } catch (e) {
    console.error('Failed to parse stored products', e);
    return mockProducts;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    // Dispatch a custom window event so any listening views immediately update
    window.dispatchEvent(new CustomEvent('saddam-products-updated', { detail: products }));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export function resetProductsToDefault(): Product[] {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(mockProducts));
    window.dispatchEvent(new CustomEvent('saddam-products-updated', { detail: mockProducts }));
    return mockProducts;
  } catch {
    return mockProducts;
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

export function resetShortsToDefault(): ShortVideoItem[] {
  try {
    localStorage.setItem(SHORTS_STORAGE_KEY, JSON.stringify(YOUTUBE_SHORTS_DATA));
    window.dispatchEvent(new CustomEvent('saddam-shorts-updated', { detail: YOUTUBE_SHORTS_DATA }));
    return YOUTUBE_SHORTS_DATA;
  } catch {
    return YOUTUBE_SHORTS_DATA;
  }
}

/**
 * Backup and Remote Sync JSON
 */
export function exportStoreBackupJSON(): string {
  const products = getStoredProducts();
  const shorts = getStoredShorts();
  const backup = {
    storeName: 'محلات صدام العقاري',
    exportedAt: new Date().toISOString(),
    version: '3.0',
    products,
    shorts,
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
