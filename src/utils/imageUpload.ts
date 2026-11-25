/**
 * High-definition client-side image processor for gallery & camera uploads.
 * Preserves the highest possible resolution and visual clarity (up to 1600px / 92% WebP/JPEG)
 * while automatically fitting inside Cloud Firestore document limits.
 */

export interface ImageUploadOptions {
  maxDimension?: number;
  quality?: number;
  maxChars?: number;
  onProgress?: (percent: number) => void;
}

const IMAGE_EXTENSION_REGEX = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i;

export async function compressImageFileToDataUrl(
  file: File,
  options?: ImageUploadOptions
): Promise<string> {
  const maxDimension = options?.maxDimension ?? 1600;
  const initialQuality = options?.quality ?? 0.92;
  const maxChars = options?.maxChars ?? 380000;
  const report = (pct: number) => {
    try {
      options?.onProgress?.(Math.min(100, Math.max(0, Math.round(pct))));
    } catch {
      // ignore progress callback error
    }
  };

  // Samsung / mobile browsers sometimes leave file.type empty for valid photos; check extension too
  const looksLikeImage =
    (file.type && file.type.startsWith('image/')) ||
    (!file.type && IMAGE_EXTENSION_REGEX.test(file.name)) ||
    IMAGE_EXTENSION_REGEX.test(file.name);

  if (!looksLikeImage) {
    throw new Error('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).');
  }

  report(15);

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable && ev.total > 0) {
        report(15 + (ev.loaded / ev.total) * 35);
      }
    };
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة من الجهاز.'));
    reader.readAsDataURL(file);
  });

  report(55);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('تعذر معالجة الصورة المختارة. جرب صيغة JPG أو PNG.'));
    image.src = rawDataUrl;
  });

  report(70);

  const renderAttempt = (dim: number, q: number): string => {
    const naturalW = img.naturalWidth || img.width || 1;
    const naturalH = img.naturalHeight || img.height || 1;
    const ratio = Math.min(1, dim / Math.max(naturalW, naturalH));
    const width = Math.max(1, Math.round(naturalW * ratio));
    const height = Math.max(1, Math.round(naturalH * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return rawDataUrl;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Prefer WebP for dramatically better sharpness per kilobyte, fallback to high-quality JPEG
    const webp = canvas.toDataURL('image/webp', q);
    if (webp.startsWith('data:image/webp')) {
      return webp;
    }
    return canvas.toDataURL('image/jpeg', q);
  };

  let dim = maxDimension;
  let q = initialQuality;
  let result = renderAttempt(dim, q);

  // Fine-grained optimization: trim quality gently first to preserve maximum HD resolution,
  // then gradually step down dimensions only when required to fit the byte budget.
  let attempts = 0;
  while (result.length > maxChars && attempts < 10) {
    attempts += 1;
    if (q > 0.78) {
      q = Math.max(0.76, q - 0.05);
    } else {
      dim = Math.max(480, Math.round(dim * 0.86));
      q = Math.max(0.62, q - 0.04);
    }
    report(70 + Math.min(25, attempts * 3));
    result = renderAttempt(dim, q);
  }

  if (result.length > 440000) {
    throw new Error('حجم الصورة كبير جداً حتى بعد التحسين. يرجى اختيار صورة أخرى.');
  }

  report(100);
  return result;
}
