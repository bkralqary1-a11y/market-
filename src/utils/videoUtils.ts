/**
 * Video Utilities for Saddam Al-Aqari Tech Store
 * Handles YouTube Shorts, standard YouTube, and HTML5 video URLs seamlessly.
 */

export interface YouTubeVideoData {
  id: string;
  url: string;
  shortsUrl: string;
  embedUrl: string;
  thumbnail: string;
}

/**
 * Extracts YouTube Video ID from any YouTube URL (Shorts, Watch, youtu.be, Embed)
 */
export function getYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // 1. YouTube Shorts: https://youtube.com/shorts/Ues_BxS8v-s or https://www.youtube.com/shorts/Ues_BxS8v-s?feature=share
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // 2. Short form: youtu.be/Ues_BxS8v-s
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch && youtuBeMatch[1]) return youtuBeMatch[1];

  // 3. Watch url: youtube.com/watch?v=Ues_BxS8v-s
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // 4. Embed url: youtube.com/embed/Ues_BxS8v-s
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // 5. Bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Generates an optimized YouTube embed URL
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options: {
    autoplay?: boolean;
    mute?: boolean;
    controls?: boolean;
    loop?: boolean;
  } = {}
): string {
  const { autoplay = true, mute = false, controls = true, loop = true } = options;

  const params = new URLSearchParams({
    enablejsapi: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    controls: controls ? '1' : '0',
  });

  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Returns highest-resolution YouTube thumbnail available
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Checks if a URL is a YouTube link
 */
export function isYouTubeUrl(url?: string | null): boolean {
  return !!getYouTubeId(url);
}
