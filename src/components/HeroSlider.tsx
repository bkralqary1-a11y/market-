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
  Pencil,
} from 'lucide-react';
import { Language, Currency, HeroSlideItem, CategoryId } from '../types';
import { soundFX } from '../utils/audioEffects';
import { DEFAULT_HERO_SLIDES } from '../utils/storeStorage';
import { getYouTubeId, getYouTubeEmbedUrl } from '../utils/videoUtils';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../services/firestoreService';
import { type EditableSectionTarget } from './VisualSectionEditorModal';

interface HeroSliderProps {
  language: Language;
  currency: Currency;
  onExplore: (category?: CategoryId) => void;
  onSelectProduct: (product: any) => void;
  slides?: HeroSlideItem[];
  siteConfig?: SiteConfig;
  isAdminMode?: boolean;
  onAdminEditSection?: (target: EditableSectionTarget) => void;
}

export default function HeroSlider({
  language,
  onExplore,
  slides: propSlides,
  siteConfig = DEFAULT_SITE_CONFIG,
  isAdminMode = false,
  onAdminEditSection,
}: HeroSliderProps) {
  const isAr = language === 'ar';
  const activeSlides =
    propSlides && propSlides.length > 0
      ? propSlides.filter((s) => isAdminMode || s.enabled !== false)
      : DEFAULT_HERO_SLIDES;
  const slides = activeSlides.length > 0 ? activeSlides : DEFAULT_HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

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

            {/* Admin Mode Floating Pencil Trigger for Hero */}
            {isAdminMode && onAdminEditSection && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdminEditSection({ type: 'hero', slideIndex: currentSlide });
                }}
                className="absolute top-4 left-4 rtl:left-4 rtl:right-auto z-30 px-3.5 py-2 rounded-2xl bg-[#0071e3] hover:bg-[#005bbf] text-white text-xs font-extrabold shadow-xl flex items-center gap-1.5 cursor-pointer border border-white/30"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل الشريحة الرئيسية</span>
              </button>
            )}

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
                    href={`https://wa.me/967${siteConfig.whatsappPrimary.replace(/\D/g, '')}?text=${encodeURIComponent(
                      slide.whatsappCustomTextAr ||
                        (isAr
                          ? `السلام عليكم ${siteConfig.storeNameAr}، أود الاستفسار عن: ${slide.titleAr}`
                          : `Hello ${siteConfig.storeNameEn}, I want to inquire about: ${slide.titleEn || slide.titleAr}`)
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
            {/* Side Glass Tile 1 */}
            <div className="relative flex flex-col">
              {isAdminMode && onAdminEditSection && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdminEditSection({ type: 'bento1' });
                  }}
                  className="absolute top-3 left-3 rtl:left-3 rtl:right-auto z-20 w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white flex items-center justify-center shadow-lg cursor-pointer"
                  title="تعديل البطاقة الجانبية الأولى"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  if (isAdminMode && onAdminEditSection) {
                    onAdminEditSection({ type: 'bento1' });
                  } else {
                    onExplore('phones');
                  }
                }}
                className={`liquid-glass liquid-card-hover rounded-[28px] p-6 text-right rtl:text-right ltr:text-left flex flex-col justify-between min-h-[210px] lg:min-h-0 flex-1 cursor-pointer group overflow-hidden relative ${
                  isAdminMode ? 'ring-2 ring-[#0071e3]/45 hover:ring-[#0071e3]' : ''
                }`}
              >
                <div
                  aria-hidden="true"
                  className="absolute -bottom-10 -left-10 rtl:-left-10 ltr:-right-10 w-40 h-40 rounded-full bg-[#0071e3]/15 blur-2xl pointer-events-none"
                />
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#0071e3] block">
                      {isAr ? siteConfig.bento1BadgeAr : 'Shop with Confidence'}
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0b1220] leading-snug">
                      {isAr ? siteConfig.bento1TitleAr : 'Latest 5G Flagship Phones'}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr
                        ? siteConfig.bento1DescAr
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
            </div>

            {/* Side Glass Tile 2 */}
            <div className="relative flex flex-col">
              {isAdminMode && onAdminEditSection && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdminEditSection({ type: 'bento2' });
                  }}
                  className="absolute top-3 left-3 rtl:left-3 rtl:right-auto z-20 w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#005bbf] text-white flex items-center justify-center shadow-lg cursor-pointer"
                  title="تعديل البطاقة الجانبية الثانية"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  if (isAdminMode && onAdminEditSection) {
                    onAdminEditSection({ type: 'bento2' });
                  } else {
                    onExplore('chargers');
                  }
                }}
                className={`liquid-glass liquid-card-hover rounded-[28px] p-6 text-right rtl:text-right ltr:text-left flex flex-col justify-between min-h-[210px] lg:min-h-0 flex-1 cursor-pointer group overflow-hidden relative ${
                  isAdminMode ? 'ring-2 ring-[#0071e3]/45 hover:ring-[#0071e3]' : ''
                }`}
              >
                <div
                  aria-hidden="true"
                  className="absolute -bottom-10 -left-10 rtl:-left-10 ltr:-right-10 w-40 h-40 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none"
                />
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-700 block">
                      {isAr ? siteConfig.bento2BadgeAr : 'GaN Power & Original Gear'}
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0b1220] leading-snug">
                      {isAr ? siteConfig.bento2TitleAr : 'Chargers, Audio & MagSafe'}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr
                        ? siteConfig.bento2DescAr
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
      </div>
    </section>
  );
}
