/**
 * Permanent direct-link utilities for sharing individual products across
 * WhatsApp, social media, and external hosts (works seamlessly with static hosting like Netlify).
 */

export function getProductShareUrl(productId: string): string {
  if (typeof window === 'undefined') {
    return `#/product/${encodeURIComponent(productId)}`;
  }
  const basePath = `${window.location.origin}${window.location.pathname}`;
  return `${basePath}#/product/${encodeURIComponent(productId)}`;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for mobile WebViews / non-focused contexts
    }
  }

  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export async function shareOrCopyProductLink(product: {
  id: string;
  nameAr: string;
  name?: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  const url = getProductShareUrl(product.id);
  const title = product.nameAr || product.name || 'منتج من محلات صدام العقاري';

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text: `${title}\n${url}`,
        url,
      });
      return 'shared';
    } catch (err) {
      // User cancelled native share sheet — do not treat as copy failure
      if (err instanceof Error && err.name === 'AbortError') {
        return 'failed';
      }
    }
  }

  const copied = await copyTextToClipboard(url);
  return copied ? 'copied' : 'failed';
}
