import { useState } from 'react';
import { Play, ExternalLink, MessageCircle, X, ChevronRight, ChevronLeft, Sparkles, Smartphone, Eye, Share2, Volume2 } from 'lucide-react';
import { Language, Currency, Product } from '../types';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/videoUtils';
import Tilt3D from './Tilt3D';
import { soundFX } from '../utils/audioEffects';
import { formatPrice } from '../data/mockData';

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
}

export const YOUTUBE_SHORTS_DATA: ShortVideoItem[] = [
  {
    id: 'short-1',
    youtubeId: 'Ues_BxS8v-s',
    shortsUrl: 'https://youtube.com/shorts/Ues_BxS8v-s',
    titleAr: 'سامسونج S26 ألترا تيتانيوم 5G الخارق',
    titleEn: 'Samsung Galaxy S26 Ultra 5G Titanium',
    captionAr: 'استعراض أداء معالج Snapdragon 8 Elite وكاميرا 200MP وتصميم التيتانيوم المقاوم للصدمات مع قلم S-Pen الذكي.',
    captionEn: 'Reviewing Snapdragon 8 Elite performance, 200MP camera, and titanium frame with S-Pen.',
    viewsText: '48.5K',
    productId: 'samsung-galaxy-s26-ultra',
    productNameAr: 'Samsung Galaxy S26 Ultra 5G',
    productNameEn: 'Samsung Galaxy S26 Ultra 5G',
    productPrice: 385000,
    productImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1000&auto=format&fit=crop',
    tagAr: 'الأحدث لعام 2026',
    tagEn: 'Flagship 2026',
  },
  {
    id: 'short-2',
    youtubeId: 'UMyV8ZYXJE4',
    shortsUrl: 'https://youtube.com/shorts/UMyV8ZYXJE4',
    titleAr: 'جالكسي S21 ألترا فانتوم بلاك • زوم 100x',
    titleEn: 'Galaxy S21 Ultra Phantom Black 100x Zoom',
    captionAr: 'تجربة الكاميرا الأسطورية بدقة 108MP مع تقريب بصري هائل 100x Space Zoom وتصوير فيديو احترافي بدقة 8K.',
    captionEn: 'Testing the 108MP camera with 100x Space Zoom and cinema-grade 8K recording.',
    viewsText: '62.1K',
    productId: 'samsung-galaxy-s21-ultra',
    productNameAr: 'Samsung Galaxy S21 Ultra 5G (Phantom Edition)',
    productNameEn: 'Samsung Galaxy S21 Ultra 5G',
    productPrice: 245000,
    productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1000&auto=format&fit=crop',
    tagAr: 'الأكثر مبيعاً',
    tagEn: 'Best Seller',
  },
  {
    id: 'short-3',
    youtubeId: 'K74bSgzDbFk',
    shortsUrl: 'https://youtube.com/shorts/K74bSgzDbFk',
    titleAr: 'فتح صندوق واختبار إكسسوارات وشواحن الماج سيف',
    titleEn: 'Unboxing MagSafe Accessories & GaN Fast Chargers',
    captionAr: 'نظرة سريعة على كفرات الحماية النانو المغناطيسية وشواحن GaN الذكية المقاومة لارتفاع درجات الحرارة.',
    captionEn: 'Quick look at magnetic nano cases and high-speed intelligent GaN chargers.',
    viewsText: '35.4K',
    productId: 'case-s26-ultra-nano-magsafe',
    productNameAr: 'جراب حماية S26 Ultra نانو ماج سيف',
    productNameEn: 'S26 Ultra Nano MagSafe Armor Case',
    productPrice: 8000,
    productImage: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1000&auto=format&fit=crop',
    tagAr: 'ملحقات أصلية',
    tagEn: 'Original Accessories',
  },
];

interface YouTubeShortsSectionProps {
  language: Language;
  currency?: Currency;
  onSelectProduct?: (product: Product) => void;
  products?: Product[];
}

export default function YouTubeShortsSection({
  language,
  currency = 'YER',
  onSelectProduct,
  products = [],
}: YouTubeShortsSectionProps) {
  const isAr = language === 'ar';
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleOpenFullscreen = (idx: number) => {
    soundFX.playModalOpen();
    setFullscreenIndex(idx);
  };

  const handleNextFullscreen = () => {
    if (fullscreenIndex === null) return;
    soundFX.playWhoosh();
    setFullscreenIndex((fullscreenIndex + 1) % YOUTUBE_SHORTS_DATA.length);
  };

  const handlePrevFullscreen = () => {
    if (fullscreenIndex === null) return;
    soundFX.playWhoosh();
    setFullscreenIndex((fullscreenIndex - 1 + YOUTUBE_SHORTS_DATA.length) % YOUTUBE_SHORTS_DATA.length);
  };

  const handleShareShort = (short: ShortVideoItem) => {
    soundFX.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(short.shortsUrl);
      setCopiedLink(short.id);
      setTimeout(() => setCopiedLink(null), 2500);
    }
  };

  const currentFullscreenShort = fullscreenIndex !== null ? YOUTUBE_SHORTS_DATA[fullscreenIndex] : null;

  return (
    <section id="youtube-shorts-section" className="py-12 sm:py-16 bg-gradient-to-b from-neutral-900 via-black to-neutral-950 text-white relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Title with YouTube Branding */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold mb-3 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{isAr ? 'فيديوهات يوتيوب القصيرة الحصرية' : 'Exclusive YouTube Shorts'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                {isAr ? 'ريلز وفيديوهات الأجهزة الذكية' : 'Tech Shorts & Product Reels'}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
              {isAr
                ? 'شاهد مراجعات الهواتف، فتح الصندوق، واختبارات الكاميرات والملحقات الأصلية مباشرة من قناتنا على يوتيوب بجودة فائقة.'
                : 'Watch real phone reviews, unboxing, camera zoom tests, and original accessories right from our YouTube channel.'}
            </p>
          </div>

          {/* Direct YouTube Channel CTA Button */}
          <div className="flex items-center gap-3">
            <a
              href="https://youtube.com/shorts/Ues_BxS8v-s"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-red-600/30 transition-all active:scale-95 border border-red-400/40"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isAr ? 'مشاهدة كل الفيديوهات على يوتيوب' : 'Open YouTube Channel'}</span>
            </a>
          </div>
        </div>

        {/* 3D Vertical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {YOUTUBE_SHORTS_DATA.map((short, index) => {
            const isPlaying = activePlayId === short.id;
            const embedSrc = getYouTubeEmbedUrl(short.youtubeId, { autoplay: true, mute: false, loop: true });
            const thumbSrc = getYouTubeThumbnail(short.youtubeId);

            return (
              <Tilt3D
                key={short.id}
                maxAngle={8}
                scale={1.02}
                depth={25}
                className="w-full h-full"
              >
                <div
                  className="w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/15 shadow-2xl flex flex-col group transition-all duration-300 relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Smartphone Bezel & Aspect Ratio Frame (9:16) */}
                  <div className="relative w-full aspect-[9/15] bg-black overflow-hidden flex items-center justify-center">
                    {isPlaying ? (
                      /* ACTIVE YOUTUBE IFRAME EMBED */
                      <div className="w-full h-full relative bg-black">
                        <iframe
                          src={embedSrc}
                          title={isAr ? short.titleAr : short.titleEn}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                        {/* Close / Stop playing overlay button */}
                        <button
                          onClick={() => {
                            soundFX.playClick();
                            setActivePlayId(null);
                          }}
                          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/30 backdrop-blur-md transition-all active:scale-90"
                          title={isAr ? 'إيقاف الفيديو' : 'Close Player'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* PREVIEW THUMBNAIL WITH PLAY TRIGGER */
                      <div className="w-full h-full relative group/thumb cursor-pointer">
                        {/* High-res Thumbnail */}
                        <img
                          src={thumbSrc}
                          alt={isAr ? short.titleAr : short.titleEn}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                          <span className="bg-red-600/90 text-white text-[10px] font-mono font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-red-400/40 shadow-sm flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            <span>Shorts</span>
                          </span>

                          <span className="bg-black/60 text-gray-200 text-[10px] font-mono px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-red-400" />
                            <span>{short.viewsText}</span>
                          </span>
                        </div>

                        {/* Center Big Play Button */}
                        <button
                          onClick={() => {
                            soundFX.playModalOpen();
                            setActivePlayId(short.id);
                          }}
                          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl border-2 border-white/80 group-hover/thumb:scale-110 active:scale-95 transition-all z-20 cursor-pointer backdrop-blur-xs"
                          title={isAr ? 'تشغيل الفيديو' : 'Play Short'}
                        >
                          <Play className="w-7 h-7 fill-white translate-x-0.5" />
                        </button>

                        {/* Fullscreen Reel Trigger in corner */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFullscreen(index);
                          }}
                          className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 z-20 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold backdrop-blur-md border border-white/30 transition-all flex items-center gap-1 active:scale-90"
                          title={isAr ? 'مشاهدة ملء الشاشة' : 'Fullscreen Reel'}
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{isAr ? 'شاشة كاملة' : 'Fullscreen'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta & Quick Order Controls */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-neutral-900/90 border-t border-white/10">
                    <div>
                      {/* Tag & Share */}
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <span className="text-orange-400 font-bold text-[11px]">
                          {isAr ? short.tagAr : short.tagEn}
                        </span>

                        <button
                          onClick={() => handleShareShort(short)}
                          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                          title={isAr ? 'نسخ رابط الفيديو' : 'Copy Short link'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{copiedLink === short.id ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'مشاركة' : 'Share')}</span>
                        </button>
                      </div>

                      {/* Video Title */}
                      <h3 className="font-extrabold text-sm sm:text-base text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-amber-300 transition-colors">
                        {isAr ? short.titleAr : short.titleEn}
                      </h3>

                      {/* Video Caption */}
                      <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-3">
                        {isAr ? short.captionAr : short.captionEn}
                      </p>
                    </div>

                    {/* Linked Product & WhatsApp Order Buttons */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium truncate max-w-[150px]">
                          {isAr ? short.productNameAr : short.productNameEn}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {formatPrice(short.productPrice, currency, isAr)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Direct WhatsApp Order */}
                        <a
                          href={`https://wa.me/967774102030?text=${encodeURIComponent(
                            isAr
                              ? `مرحباً محلات صدام العقاري، أريد الاستفسار والطلب بعد مشاهدة هذا الفيديو القصير:\n${short.titleAr}\nالرابط: ${short.shortsUrl}`
                              : `Hello Saddam Al-Aqari Store, I would like to order after watching this Short:\n${short.titleEn}\nLink: ${short.shortsUrl}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => soundFX.playClick()}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 border border-emerald-400/30"
                          title={isAr ? 'اطلب الآن عبر واتساب' : 'Order on WhatsApp'}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'طلب واتساب' : 'WhatsApp'}</span>
                        </a>

                        {/* Open on YouTube */}
                        <a
                          href={short.shortsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => soundFX.playClick()}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all active:scale-95 border border-white/15"
                          title={isAr ? 'فتح الفيديو على يوتيوب' : 'Open in YouTube'}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                          <span>{isAr ? 'على يوتيوب' : 'YouTube'}</span>
                        </a>
                      </div>

                      {/* View Product Details in Store */}
                      {onSelectProduct && (
                        <button
                          onClick={() => {
                            soundFX.playClick();
                            const matched = products.find((p) => p.id === short.productId);
                            if (matched) {
                              onSelectProduct(matched);
                            }
                          }}
                          className="w-full text-center py-1.5 text-[11px] font-bold text-gray-300 hover:text-orange-400 transition-colors block cursor-pointer"
                        >
                          {isAr ? 'عرض المواصفات التقنية الكاملة لهذا الجهاز ←' : 'View Full Specs of this device →'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Tilt3D>
            );
          })}
        </div>
      </div>

      {/* FULLSCREEN REELS MODAL (LIKE YOUTUBE SHORTS / TIKTOK REEL VIEWER) */}
      {currentFullscreenShort && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md h-[92vh] max-h-[820px] bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col">
            {/* Top Bar with Close & Short Title */}
            <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold font-mono tracking-wider text-red-400">
                  YouTube Shorts ({fullscreenIndex! + 1}/{YOUTUBE_SHORTS_DATA.length})
                </span>
              </div>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setFullscreenIndex(null);
                }}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                title={isAr ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Video Embed */}
            <div className="w-full h-full relative bg-black">
              <iframe
                src={getYouTubeEmbedUrl(currentFullscreenShort.youtubeId, {
                  autoplay: true,
                  mute: false,
                  controls: true,
                  loop: true,
                })}
                title={isAr ? currentFullscreenShort.titleAr : currentFullscreenShort.titleEn}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Bottom Controls inside modal */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-3">
              <a
                href={`https://wa.me/967774102030?text=${encodeURIComponent(
                  `طلب عبر ريلز يوتيوب: ${currentFullscreenShort.titleAr}\n${currentFullscreenShort.shortsUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFX.playClick()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isAr ? 'اطلب الآن بالواتساب' : 'Order on WhatsApp'}</span>
              </a>

              <a
                href={currentFullscreenShort.shortsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30"
                title={isAr ? 'فتح على يوتيوب' : 'Open in YouTube'}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Next / Previous Floating Arrow Controls */}
            <button
              onClick={handlePrevFullscreen}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md active:scale-90 transition-all cursor-pointer"
              title={isAr ? 'الفيديو السابق' : 'Previous Short'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextFullscreen}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md active:scale-90 transition-all cursor-pointer"
              title={isAr ? 'الفيديو التالي' : 'Next Short'}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
