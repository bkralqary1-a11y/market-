import { useState, useEffect, useRef, useMemo, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { soundFX } from '../utils/audioEffects';
import { getYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/videoUtils';

interface Product3DCoverflowProps {
  products: Product[];
  language: Language;
  currency: Currency;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product, variant?: string, color?: string) => void;
}

interface CoverflowVideoItem {
  product: Product;
  year: string;
  genreAr: string;
  genreEn: string;
  videoUrl: string;
  durationText: string;
}

const TECH_TRAILERS: Record<
  string,
  { videoUrl: string; year: string; genreAr: string; genreEn: string; duration: string }
> = {
  'samsung-galaxy-s21-ultra': {
    videoUrl: 'https://youtube.com/shorts/UMyV8ZYXJE4',
    year: 'Phantom S21',
    genreAr: 'جالكسي S21 ألترا • 108MP • 100x Zoom • فانتوم',
    genreEn: 'Galaxy S21 Ultra • 108MP 100x Zoom',
    duration: 'Shorts',
  },
  'samsung-galaxy-s26-ultra': {
    videoUrl: 'https://youtube.com/shorts/Ues_BxS8v-s',
    year: '2026',
    genreAr: 'هاتف ذكي رائد • 5G • 200MP • تيتانيوم',
    genreEn: 'Flagship Smartphone • 5G • Titanium',
    duration: 'Shorts',
  },
  'case-s26-ultra-nano-magsafe': {
    videoUrl: 'https://youtube.com/shorts/K74bSgzDbFk',
    year: '2026',
    genreAr: 'كفر نانو ماج سيف • شواحن GaN الذكية',
    genreEn: 'Nano MagSafe Armor • GaN Chargers',
    duration: 'Shorts',
  },
  'airpods-pro-2-original': {
    videoUrl: 'https://youtube.com/shorts/K74bSgzDbFk',
    year: '2025',
    genreAr: 'سماعات لاسلكية • ANC • ملحقات أصلية',
    genreEn: 'Wireless Audio • ANC • Original',
    duration: 'Shorts',
  },
  'iphone-16-pro-max': {
    videoUrl: 'https://youtube.com/shorts/Ues_BxS8v-s',
    year: '2025',
    genreAr: 'آبل رائد • تيتانيوم • A18 Pro',
    genreEn: 'Apple Flagship • Titanium',
    duration: 'Shorts',
  },
  'sony-wh-1000xm5': {
    videoUrl: 'https://youtube.com/shorts/UMyV8ZYXJE4',
    year: '2025',
    genreAr: 'سماعات احترافية • Hi-Res',
    genreEn: 'Pro Over-Ear • Hi-Res',
    duration: 'Shorts',
  },
  'anker-prime-160w-gan-charger': {
    videoUrl: 'https://youtube.com/shorts/K74bSgzDbFk',
    year: '2026',
    genreAr: 'شواحن GaN فائقة • 160W',
    genreEn: 'GaN Fast Charger • 160W',
    duration: 'Shorts',
  },
};

export default function Product3DCoverflow({
  products,
  language,
  currency,
  onSelectProduct,
  onAddToCart,
}: Product3DCoverflowProps) {
  const isAr = language === 'ar';

  const items: CoverflowVideoItem[] = useMemo(() => {
    const preferredIds = [
      'samsung-galaxy-s21-ultra',
      'samsung-galaxy-s26-ultra',
      'airpods-pro-2-original',
      'iphone-16-pro-max',
      'sony-wh-1000xm5',
      'anker-prime-160w-gan-charger',
      'case-s26-ultra-nano-magsafe',
    ];

    const selected: Product[] = [];
    preferredIds.forEach((id) => {
      const found = products.find((p) => p.id === id);
      if (found) selected.push(found);
    });

    if (selected.length < 5) {
      products.slice(0, 6).forEach((p) => {
        if (!selected.some((s) => s.id === p.id)) selected.push(p);
      });
    }

    return selected.map((prod) => {
      const meta = TECH_TRAILERS[prod.id] || {
        videoUrl: prod.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        year: '2026',
        genreAr: `${prod.categoryNameAr}`,
        genreEn: `${prod.categoryNameEn}`,
        duration: '2:10',
      };
      return {
        product: prod,
        year: meta.year,
        genreAr: meta.genreAr,
        genreEn: meta.genreEn,
        videoUrl: prod.videoUrl || meta.videoUrl,
        durationText: meta.duration,
      };
    });
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Fullscreen video modal state
  const [modalItem, setModalItem] = useState<CoverflowVideoItem | null>(null);

  // Drag / Swipe handling
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragDiffXRef = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalItems = items.length;

  const goToNext = () => {
    soundFX.playWhoosh();
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const goToPrev = () => {
    soundFX.playWhoosh();
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const goToIndex = (idx: number) => {
    if (idx !== currentIndex) {
      soundFX.playWhoosh();
    }
    setCurrentIndex(idx);
  };

  // Play the video of the active center card
  useEffect(() => {
    videoRefs.current.forEach((videoEl, idx) => {
      if (!videoEl) return;
      if (idx === currentIndex) {
        if (isPlaying) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      } else {
        videoEl.pause();
      }
    });
  }, [currentIndex, isPlaying]);

  // Auto-play timer (flips automatically every 4 seconds)
  useEffect(() => {
    if (!isAutoPlay || isHovered || modalItem !== null || totalItems <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoPlay, isHovered, modalItem, totalItems, currentIndex]);

  // Touch / Mouse Swipe
  const handleTouchStart = (e: ReactTouchEvent) => {
    dragStartXRef.current = e.touches[0].clientX;
    dragDiffXRef.current = 0;
    setIsDragging(true);
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!isDragging) return;
    dragDiffXRef.current = e.touches[0].clientX - dragStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDiffXRef.current < -50) goToNext();
    else if (dragDiffXRef.current > 50) goToPrev();
    dragDiffXRef.current = 0;
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    dragStartXRef.current = e.clientX;
    dragDiffXRef.current = 0;
    setIsDragging(true);
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isDragging) return;
    dragDiffXRef.current = e.clientX - dragStartXRef.current;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDiffXRef.current < -50) goToNext();
    else if (dragDiffXRef.current > 50) goToPrev();
    dragDiffXRef.current = 0;
  };

  if (totalItems === 0) return null;

  const activeItem = items[currentIndex];

  return (
    <div
      className="relative w-full bg-white select-none py-6 sm:py-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isDragging) setIsDragging(false);
      }}
    >
      {/* Clean Controls Top Bar: Auto-Play toggle */}
      <div className="flex items-center justify-between max-w-5xl mx-auto px-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {isAr ? 'عروض الفيديو التفاعلية' : 'Interactive Video Showcase'}
          </span>
        </div>

        {/* Auto-Play Toggle */}
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all active:scale-95 shadow-xs ${
            isAutoPlay
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {isAutoPlay ? (
            <>
              <Pause className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'تقليب تلقائي: شغال' : 'Auto-Play: ON'}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-gray-500 fill-gray-500" />
              <span>{isAr ? 'تقليب يدوي (تشغيل)' : 'Manual (Turn On)'}</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Coverflow Stage with Larger Video Templates on White Background with Soft Shadow */}
      <div
        className="relative w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing min-h-[500px] sm:min-h-[580px] lg:min-h-[620px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ perspective: '1400px' }}
      >
        {/* Navigation Arrow Left */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-2 sm:left-6 lg:left-12 z-40 w-12 h-12 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
          aria-label="Previous video"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-2 sm:right-6 lg:right-12 z-40 w-12 h-12 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
          aria-label="Next video"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 3D Cards Container */}
        <div className="relative w-full max-w-5xl h-[460px] sm:h-[540px] lg:h-[580px] flex items-center justify-center transform-gpu">
          {items.map((item, idx) => {
            let offset = idx - currentIndex;
            if (offset > totalItems / 2) offset -= totalItems;
            if (offset < -totalItems / 2) offset += totalItems;

            const isCenter = offset === 0;
            const isNear = Math.abs(offset) <= 2;

            // Spacing for enlarged templates:
            // Desktop: width ~370px, offset step ~250px
            // Mobile: width ~280px, offset step ~130px
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
            const stepX = isMobile ? 130 : 250;
            const farStepX = isMobile ? 220 : 430;

            let translateX = 0;
            let translateZ = 0;
            let rotateY = 0;
            let scale = 1;
            let opacity = 0;
            let zIndex = 10;

            if (offset === 0) {
              translateX = 0;
              translateZ = isMobile ? 40 : 90;
              rotateY = 0;
              scale = 1.05;
              opacity = 1;
              zIndex = 50;
            } else if (offset === -1) {
              translateX = -stepX;
              translateZ = -60;
              rotateY = 32;
              scale = 0.88;
              opacity = 0.75;
              zIndex = 40;
            } else if (offset === 1) {
              translateX = stepX;
              translateZ = -60;
              rotateY = -32;
              scale = 0.88;
              opacity = 0.75;
              zIndex = 40;
            } else if (offset === -2) {
              translateX = -farStepX;
              translateZ = -140;
              rotateY = 45;
              scale = 0.74;
              opacity = 0.45;
              zIndex = 30;
            } else if (offset === 2) {
              translateX = farStepX;
              translateZ = -140;
              rotateY = -45;
              scale = 0.74;
              opacity = 0.45;
              zIndex = 30;
            } else {
              translateX = offset > 0 ? 600 : -600;
              translateZ = -250;
              rotateY = offset > 0 ? -55 : 55;
              scale = 0.5;
              opacity = 0;
              zIndex = 10;
            }

            return (
              <div
                key={item.product.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCenter) {
                    goToIndex(idx);
                  } else if (onSelectProduct) {
                    onSelectProduct(item.product);
                  }
                }}
                title={isAr ? `${item.product.nameAr} - انقر لعرض التفاصيل` : `${item.product.name} - Click for details`}
                style={{
                  position: 'absolute',
                  width: isMobile ? '280px' : '370px',
                  height: isMobile ? '420px' : '530px',
                  transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: 'all 500ms cubic-bezier(0.25, 1, 0.5, 1)',
                  pointerEvents: isNear ? 'auto' : 'none',
                }}
                className={`rounded-3xl overflow-hidden cursor-pointer bg-black ${
                  isCenter
                    ? 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22),0_10px_30px_rgba(0,0,0,0.08)] ring-2 ring-black/5'
                    : 'shadow-[0_15px_35px_-10px_rgba(0,0,0,0.14)]'
                }`}
              >
                {/* VIDEO OR YOUTUBE EMBED INSIDE CARD */}
                <div className="relative w-full h-full bg-black">
                  {(() => {
                    const ytId = getYouTubeId(item.videoUrl);
                    if (ytId) {
                      if (isCenter && isPlaying) {
                        return (
                          <iframe
                            src={getYouTubeEmbedUrl(ytId, {
                              autoplay: true,
                              mute: isMuted,
                              controls: true,
                              loop: true,
                            })}
                            title={item.product.name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full border-0 pointer-events-auto"
                          />
                        );
                      }
                      return (
                        <img
                          src={getYouTubeThumbnail(ytId) || item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      );
                    }
                    return (
                      <video
                        ref={(el) => {
                          videoRefs.current[idx] = el;
                        }}
                        src={item.videoUrl}
                        poster={item.product.image}
                        loop
                        playsInline
                        muted={idx === currentIndex ? isMuted : true}
                        className="w-full h-full object-cover"
                      />
                    );
                  })()}

                  {/* ONLY BADGE: "الجديد" (New) - No other text, buttons, or add-to-cart on moving video */}
                  <div className="absolute top-4 start-4 z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-xl backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>{isAr ? 'الجديد' : 'New'}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {items.map((it, idx) => (
          <button
            key={it.product.id}
            onClick={() => goToIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-7 h-2 bg-primary shadow-sm'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Video ${idx + 1}`}
          />
        ))}
      </div>

      {/* Fullscreen Video Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <div className="flex items-center justify-between p-4 bg-neutral-900/80 border-b border-white/10 text-white">
              <h4 className="font-bold text-sm sm:text-base">
                {isAr ? modalItem.product.nameAr : modalItem.product.name}
              </h4>
              <button
                onClick={() => setModalItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {(() => {
                const ytId = getYouTubeId(modalItem.videoUrl);
                if (ytId) {
                  return (
                    <iframe
                      src={getYouTubeEmbedUrl(ytId, {
                        autoplay: true,
                        mute: false,
                        controls: true,
                        loop: true,
                      })}
                      title={isAr ? modalItem.product.nameAr : modalItem.product.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  );
                }
                return (
                  <video
                    src={modalItem.videoUrl}
                    poster={modalItem.product.image}
                    autoPlay
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
