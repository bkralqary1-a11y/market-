import { useState, useEffect, type TouchEvent, type MouseEvent } from 'react';
import { ChevronRight, ChevronLeft, ShieldCheck, ArrowRight, ArrowLeft, Cpu, MessageSquare } from 'lucide-react';
import { Language, Currency, HeroSlideItem } from '../types';
import { soundFX } from '../utils/audioEffects';
import { getStoredHeroSlides } from '../utils/storeStorage';
import { getYouTubeId, getYouTubeEmbedUrl } from '../utils/videoUtils';

interface HeroSliderProps {
  language: Language;
  currency: Currency;
  onExplore: (category?: string) => void;
  onSelectProduct: (product: any) => void;
}

export default function HeroSlider({
  language,
  onExplore,
}: HeroSliderProps) {
  const isAr = language === 'ar';
  const [slides, setSlides] = useState<HeroSlideItem[]>(() => {
    const loaded = getStoredHeroSlides();
    return loaded.filter((s) => s.enabled);
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Listen for admin changes to hero slides
  useEffect(() => {
    const handleUpdated = (e: any) => {
      const updated = e.detail as HeroSlideItem[];
      if (Array.isArray(updated)) {
        const enabledOnes = updated.filter((s) => s.enabled);
        setSlides(enabledOnes.length > 0 ? enabledOnes : getStoredHeroSlides());
        setCurrentSlide(0);
      }
    };
    window.addEventListener('saddam-hero-slides-updated', handleUpdated);
    return () => window.removeEventListener('saddam-hero-slides-updated', handleUpdated);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((clientY - rect.top) / rect.height - 0.5) * -8;
    setMouseTilt({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  const changeSlide = (newIndex: number) => {
    soundFX.playWhoosh();
    setCurrentSlide(newIndex);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Handle touch swipe for mobile phones
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || slides.length <= 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isAr) {
      if (isLeftSwipe) setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      if (isRightSwipe) setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else {
      if (isLeftSwipe) setCurrentSlide((prev) => (prev + 1) % slides.length);
      if (isRightSwipe) setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const slide = slides[currentSlide] || slides[0];
  if (!slide) return null;

  return (
    <section
      className="relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] flex items-center overflow-hidden bg-black text-white transform-gpu select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Full-Bleed Top Background Media (Images or Videos) */}
      {slides.map((item, idx) => {
        const isCurrent = idx === currentSlide;
        const ytId = item.mediaType === 'video' && item.videoUrl ? getYouTubeId(item.videoUrl) : null;
        const isDirectVideo = item.mediaType === 'video' && item.videoUrl && !ytId;

        return (
          <div
            key={item.id || idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out z-0 pointer-events-none ${
              isCurrent ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{
              transitionProperty: 'opacity, transform',
              transform: isCurrent
                ? `scale(1.04) translate3d(${-mouseTilt.x * 1.5}px, ${-mouseTilt.y * 1.5}px, 0)`
                : 'scale(1.08)',
              transition: 'transform 300ms ease-out, opacity 1000ms ease-in-out',
            }}
          >
            {item.mediaType === 'video' && ytId ? (
              <div className="w-full h-full pointer-events-none overflow-hidden scale-125">
                <iframe
                  src={getYouTubeEmbedUrl(ytId, { autoplay: isCurrent, mute: true, loop: true })}
                  title={item.titleAr}
                  className="w-full h-full border-0 pointer-events-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : item.mediaType === 'video' && isDirectVideo ? (
              <video
                src={item.videoUrl}
                autoPlay={isCurrent}
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center filter brightness-90"
              />
            ) : (
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=85&w=1920&auto=format&fit=crop'}
                alt={isAr ? item.titleAr : item.titleEn}
                className="w-full h-full object-cover object-top sm:object-center filter brightness-95"
                referrerPolicy="no-referrer"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        );
      })}

      {/* 2. Light subtle gradient overlay so image/video shines through from the top */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/85 md:via-black/40 md:to-transparent rtl:md:bg-gradient-to-l pointer-events-none" />

      {/* Ambient glowing orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* 3. Text Overlay Content with 3D Depth Layering */}
      <div
        className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-16 pb-12 sm:pb-16 md:py-20 relative z-10 w-full transform-gpu transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${mouseTilt.y * 0.8}deg) rotateY(${mouseTilt.x * 0.8}deg) translateZ(20px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="max-w-3xl space-y-4 sm:space-y-5">
          {/* Top Badge */}
          {(slide.badgeAr || slide.badgeEn) && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-orange-500/40 text-xs font-bold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-300 font-sans tracking-wide">
                {isAr ? slide.badgeAr : slide.badgeEn}
              </span>
            </div>
          )}

          {/* Slide Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]">
            {isAr ? slide.titleAr : slide.titleEn}
          </h1>

          {/* Subtitle description */}
          {(slide.subtitleAr || slide.subtitleEn) && (
            <p className="text-xs sm:text-sm md:text-base text-gray-200/95 max-w-2xl leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
              {isAr ? slide.subtitleAr : slide.subtitleEn}
            </p>
          )}

          {/* Badges / Tech specs pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-xl text-xs font-semibold text-gray-100 flex items-center gap-1.5 shadow-sm">
              <Cpu className="w-3 h-3 text-orange-400" />
              <span>{isAr ? 'أجهزة أصلية 100%' : '100% Genuine'}</span>
            </span>
            <span className="bg-emerald-950/60 backdrop-blur-md border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{isAr ? 'ضمان رسمي باليمن' : 'Official Warranty'}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2.5">
            {/* Main Action Button */}
            {slide.buttonLink ? (
              <a
                href={slide.buttonLink}
                onClick={() => soundFX.playClick()}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md active:scale-95 transition-all text-xs flex items-center gap-1.5 border border-orange-400/30 cursor-pointer shrink-0"
              >
                <span>{isAr ? (slide.buttonTextAr || 'طلب واستعراض') : (slide.buttonTextEn || 'Order & Explore')}</span>
                {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </a>
            ) : (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onExplore();
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md active:scale-95 transition-all text-xs flex items-center gap-1.5 border border-orange-400/30 cursor-pointer shrink-0"
              >
                <span>{isAr ? (slide.buttonTextAr || 'تسوق الآن') : (slide.buttonTextEn || 'Shop Now')}</span>
                {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Secondary button: browse categories */}
            <button
              onClick={() => {
                soundFX.playClick();
                onExplore();
              }}
              className="bg-white/15 hover:bg-white/25 text-white/90 font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/25 backdrop-blur-md transition-all text-[11px] sm:text-xs text-center cursor-pointer shrink-0"
              title={isAr ? 'استعراض كل الأقسام' : 'Browse Categories'}
            >
              {isAr ? 'الأقسام' : 'Categories'}
            </button>

            {/* Direct WhatsApp circular button */}
            <a
              href={`https://wa.me/967774102030?text=${encodeURIComponent(
                isAr
                  ? `السلام عليكم متجر صدام العقاري، أود الاستفسار والطلب: ${slide.titleAr}`
                  : `Hello Saddam Al-Aqari Store, I would like to inquire about: ${slide.titleEn}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-emerald-400/50 backdrop-blur-md transition-all hover:scale-110 active:scale-95 shrink-0 cursor-pointer"
              title={isAr ? 'الطلب السريع عبر واتساب (+967 774 102 030)' : 'WhatsApp Order'}
            >
              <MessageSquare className="w-4 h-4 fill-white" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. Controls: Slide Indicators & Next/Prev Arrows */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 z-20 container mx-auto px-4 sm:px-6 flex items-center justify-between pointer-events-auto">
          {/* Indicators */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => changeSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? 'w-7 sm:w-8 bg-orange-500 shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
              className="p-2 sm:p-2.5 rounded-xl bg-black/40 hover:bg-orange-500 text-white transition-all border border-white/20 backdrop-blur-md active:scale-95 cursor-pointer"
              aria-label="Previous slide"
            >
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => changeSlide((currentSlide + 1) % slides.length)}
              className="p-2 sm:p-2.5 rounded-xl bg-black/40 hover:bg-orange-500 text-white transition-all border border-white/20 backdrop-blur-md active:scale-95 cursor-pointer"
              aria-label="Next slide"
            >
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
