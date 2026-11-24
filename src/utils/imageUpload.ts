/**
 * Client-side image compression utility for gallery / camera uploads.
 * Resizes and compresses picked images into compact Data URLs so they
 * load instantaneously and fit safely inside Cloud Firestore documents.
 */

export async function compressImageFileToDataUrl(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
    maxChars?: number;
  }
): Promise<string> {
  const maxDimension = options?.maxDimension ?? 760;
  const initialQuality = options?.quality ?? 0.76;
  const maxChars = options?.maxChars ?? 180000;

  if (!file.type.startsWith('image/')) {
    throw new Error('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة من الجهاز.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('تعذر معالجة الصورة المختارة.'));
    image.src = rawDataUrl;
  });

  const renderAttempt = (dim: number, q: number): string => {
    const ratio = Math.min(1, dim / Math.max(img.width || 1, img.height || 1));
    const width = Math.max(1, Math.round((img.width || 1) * ratio));
    const height = Math.max(1, Math.round((img.height || 1) * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return rawDataUrl;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Prefer WebP for smaller size with higher clarity, fallback to JPEG
    const webp = canvas.toDataURL('image/webp', q);
    if (webp.startsWith('data:image/webp')) {
      return webp;
    }
    return canvas.toDataURL('image/jpeg', q);
  };

  let dim = maxDimension;
  let q = initialQuality;
  let result = renderAttempt(dim, q);

  // Progressively compress if image exceeds target budget
  let attempts = 0;
  while (result.length > maxChars && attempts < 5) {
    dim = Math.round(dim * 0.78);
    q = Math.max(0.45, q - 0.08);
    result = renderAttempt(dim, q);
    attempts += 1;
  }

  if (result.length > 240000) {
    throw new Error('حجم الصورة كبير جداً حتى بعد الضغط. يرجى اختيار صورة أصغر.');
  }

  return result;
}
