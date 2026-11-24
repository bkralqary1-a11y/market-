import { useState, useEffect, type TouchEvent } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Language, Currency, HeroSlideItem, CategoryId } from '../types';
import { soundFX } from '../utils/audioEffects';
import { getStoredHeroSlides } from '../utils/storeStorage';
import { getYouTubeId, getYouTubeEmbedUrl } from '../utils/videoUtils';

interface HeroSliderProps {
  language: Language;
  currency: Currency;
  onExplore: (category?: CategoryId) => void;
  onSelectProduct: (product: any) => void;
}

export default function HeroSlider({ language, onExplore }: HeroSliderProps) {
  const isAr = language === 'ar';
  const [slides, setSlides] = useState<HeroSlideItem[]>(() => {
    const loaded = getStoredHeroSlides();
    return loaded.filter((s) => s.enabled);
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleUpdated = (e: Event) => {
      const updated = (e as CustomEvent).detail as HeroSlideItem[];
      if (Array.isArray(updated)) {
        const enabledOnes = updated.filter((s) => s.enabled);
        setSlides(enabledOnes.length > 0 ? enabledOnes : getStoredHeroSlides());
        setCurrentSlide(0);
      }
    };
    window.addEventListener('saddam-hero-slides-updated', handleUpdated);
    return () => window.removeEventListener('saddam-hero-slides-updated', handleUpdated);
  }, []);

  const changeSlide = (newIndex: number) => {
    soundFX.playWhoosh();
    setCurrentSlide(newIndex);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleTouchStart = (e: TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
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
    <section className="pt-3 sm:pt-5 pb-6 px-3 sm:px-5 relative z-10">
      <div className="container mx-auto max-w-7xl">
        {/* TrustBuy-Inspired Asymmetric Bento Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          {/* Primary Dominant Hero Showcase (8 Cols) */}
          <div
            className="lg:col-span-8 relative min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] rounded-[32px] overflow-hidden liquid-glass-dark flex items-end select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Media Layer */}
            {slides.map((item, idx) => {
              const isCurrent = idx === currentSlide;
              const ytId = item.mediaType === 'video' && item.videoUrl ? getYouTubeId(item.videoUrl) : null;
              const isDirectVideo = item.mediaType === 'video' && item.videoUrl && !ytId;
              const failed = imgFailed[item.id || String(idx)];

              return (
                <div
                  key={item.id || idx}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 pointer-events-none ${
                    isCurrent ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {item.mediaType === 'video' && ytId ? (
                    <div className="w-full h-full overflow-hidden scale-125">
                      <iframe
                        src={getYouTubeEmbedUrl(ytId, { autoplay: isCurrent, mute: true, loop: true })}
                        title={item.titleAr}
                        className="w-full h-full border-0"
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
                      className="w-full h-full object-cover object-center"
                    />
                  ) : failed ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background:
                          'radial-gradient(circle at 75% 30%, rgba(10, 132, 255, 0.45), transparent 55%), linear-gradient(135deg, #0b1630 0%, #091124 100%)',
                      }}
                    >
                      <Smartphone className="w-28 h-28 text-sky-300/20" />
                    </div>
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={isAr ? item.titleAr : item.titleEn || item.titleAr}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      onError={() => setImgFailed((prev) => ({ ...prev, [item.id || String(idx)]: true }))}
                    />
                  )}
                </div>
              );
            })}

            {/* Measured High-Contrast Sapphire Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070f21]/92 via-[#09152e]/55 to-[#09152e]/15 pointer-events-none" />

            {/* Specular Top Glass Edge Highlight */}
            <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/25 pointer-events-none" />

            {/* Hero Foreground Content */}
            <div className="relative z-10 w-full p-6 sm:p-9 lg:p-11 flex flex-col justify-end gap-4">
              {/* Quiet Unboxed Editorial Kicker */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-sky-200/95 font-semibold">
                <span>{isAr ? slide.badgeAr || 'تسوق بثقة · متجر صدام العقاري' : slide.badgeEn || 'Shop with Confidence'}</span>
                <span aria-hidden="true" className="opacity-50">·</span>
                <span>{isAr ? slide.featureBadge2Ar || 'ضمان رسمي معتمد' : slide.featureBadge2En || 'Official Warranty'}</span>
              </div>

              {/* Balanced Display Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[2.85rem] font-extrabold text-white leading-[1.15] tracking-tight max-w-2xl">
                {isAr ? slide.titleAr : slide.titleEn || slide.titleAr}
              </h1>

              {/* Subtitle */}
              {(slide.subtitleAr || slide.subtitleEn) && (
                <p className="text-sm sm:text-base text-slate-200/90 max-w-xl leading-relaxed">
                  {isAr ? slide.subtitleAr : slide.subtitleEn}
                </p>
              )}

              {/* Primary CTA + Quick WhatsApp Action + Slide Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      onExplore('all');
                    }}
                    className="liquid-btn-primary px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span>{isAr ? slide.buttonTextAr || 'تصفح الأجهزة الآن' : slide.buttonTextEn || 'Explore Devices'}</span>
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>

                  <a
                    href={`https://wa.me/967774102030?text=${encodeURIComponent(
                      slide.whatsappCustomTextAr ||
                        (isAr
                          ? `السلام عليكم متجر صدام العقاري، أود الاستفسار عن: ${slide.titleAr}`
                          : `Hello Saddam Al-Aqari Store, I want to inquire about: ${slide.titleEn || slide.titleAr}`)
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFX.playClick()}
                    className="h-11 px-4 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/25 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span>{isAr ? 'اطلب عبر واتساب' : 'WhatsApp Order'}</span>
                  </a>
                </div>

                {/* Minimal Liquid Glass Slide Controls */}
                {slides.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/12 backdrop-blur-xl border border-white/20">
                      {slides.map((_, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => changeSlide(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => changeSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
                      className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                      aria-label="Previous slide"
                    >
                      {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => changeSlide((currentSlide + 1) % slides.length)}
                      className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                      aria-label="Next slide"
                    >
                      {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side TrustBuy-Style Liquid Glass Bento Cards (4 Cols) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
            {/* Side Glass Tile 1: Flagship Phones & Official Warranty */}
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onExplore('phones');
              }}
              className="liquid-glass liquid-card-hover rounded-[28px] p-6 text-right rtl:text-right ltr:text-left flex flex-col justify-between min-h-[210px] lg:min-h-0 cursor-pointer group overflow-hidden relative"
            >
              <div
                aria-hidden="true"
                className="absolute -bottom-10 -left-10 rtl:-left-10 ltr:-right-10 w-40 h-40 rounded-full bg-[#0071e3]/15 blur-2xl pointer-events-none"
              />
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#0071e3] block">
                    {isAr ? 'تسوق بثقة · ضمان الوكالة' : 'Shop with Confidence'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0b1220] leading-snug">
                    {isAr ? 'أحدث الهواتف الذكية 5G' : 'Latest 5G Flagship Phones'}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'آيفون 16 برو ماكس وسامسونج ألترا بأفضل سعر وفاتورة رسمية.'
                      : 'iPhone 16 Pro Max & Galaxy Ultra with certified warranty.'}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl liquid-glass-strong flex items-center justify-center text-[#0071e3] shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/8 flex items-center justify-between text-xs font-bold text-[#0071e3] relative z-10">
                <span>{isAr ? 'استعراض الهواتف' : 'Browse Phones'}</span>
                {isAr ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </button>

            {/* Side Glass Tile 2: Fast Charging & Certified Accessories */}
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onExplore('chargers');
              }}
              className="liquid-glass liquid-card-hover rounded-[28px] p-6 text-right rtl:text-right ltr:text-left flex flex-col justify-between min-h-[210px] lg:min-h-0 cursor-pointer group overflow-hidden relative"
            >
              <div
                aria-hidden="true"
                className="absolute -bottom-10 -left-10 rtl:-left-10 ltr:-right-10 w-40 h-40 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none"
              />
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-700 block">
                    {isAr ? 'شحن فائق GaN · ملحقات أصلية' : 'GaN Power & Original Gear'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0b1220] leading-snug">
                    {isAr ? 'الشواحن والسماعات المعتمدة' : 'Chargers, Audio & MagSafe'}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'Anker و Belkin و Sony مع فحص فوري قبل الدفع وتوصيل سريع.'
                      : 'Anker, Belkin & Sony with instant inspection & fast dispatch.'}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl liquid-glass-strong flex items-center justify-center text-emerald-600 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/8 flex items-center justify-between text-xs font-bold text-emerald-700 relative z-10">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'تصفح الملحقات الأصلية' : 'Browse Accessories'}</span>
                </span>
                {isAr ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
