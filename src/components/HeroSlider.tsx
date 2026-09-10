import { useState, useEffect, useRef, type TouchEvent, type MouseEvent } from 'react';
import { ChevronRight, ChevronLeft, ShieldCheck, Zap, Sparkles, ArrowRight, ArrowLeft, Cpu, MessageSquare } from 'lucide-react';
import { Language, Currency } from '../types';
import { formatPrice, mockProducts } from '../data/mockData';
import { soundFX } from '../utils/audioEffects';

interface HeroSliderProps {
  language: Language;
  currency: Currency;
  onExplore: (category?: string) => void;
  onSelectProduct: (product: any) => void;
}

export default function HeroSlider({
  language,
  currency,
  onExplore,
  onSelectProduct,
}: HeroSliderProps) {
  const isAr = language === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  const slides = [
    {
      id: 1,
      badge: 'الجيل الجديد 2026 • متجر صدام العقاري',
      badgeEn: 'Next-Gen 2026 • Saddam Al-Aqari Store',
      title: 'آبل آيفون 16 برو ماكس',
      titleEn: 'Apple iPhone 16 Pro Max',
      subtitle: 'قوة التيتانيوم الصحراوي، معالج A18 Pro الخارق وشاشة ريتينا XDR 6.9 إنش مع ضمان الوكالة',
      subtitleEn: 'Titanium Grade 5 with A18 Pro Bionic, Camera Control & 6.9" ProMotion Display',
      price: 520000,
      originalPrice: 560000,
      product: mockProducts[0],
      specs: ['شاشة 6.9" 120Hz', 'كاميرا 48MP فيوجن', 'ضمان رسمي'],
      specsEn: ['6.9" ProMotion', '48MP Fusion Camera', 'Official Warranty'],
      // High-resolution Pinterest-style flagship iPhone photography
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=85&w=1920&auto=format&fit=crop',
    },
    {
      id: 2,
      badge: 'ذكاء اصطناعي Galaxy AI • الأقوى عالمياً',
      badgeEn: 'Galaxy AI Inside • Flagship Android',
      title: 'سامسونج جالكسي S25 ألترا 5G',
      titleEn: 'Samsung Galaxy S25 Ultra 5G',
      subtitle: 'معالج Snapdragon 8 Elite الخارق، كاميرا 200 ميجابكسل الأسطورية وقلم S-Pen مدمج',
      subtitleEn: 'Snapdragon 8 Elite with 200MP Space Zoom Camera & Integrated S-Pen',
      price: 490000,
      originalPrice: 535000,
      product: mockProducts[1],
      specs: ['معالج 3 نانومتر فائق', 'شاشة مانعة للانعكاس', 'بطارية 5000 mAh'],
      specsEn: ['3nm Flagship SoC', 'Anti-Reflective Armor', '5,000 mAh Battery'],
      // Premium Pinterest-style Samsung flagship photography
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=85&w=1920&auto=format&fit=crop',
    },
    {
      id: 3,
      badge: 'شواحن GaN فائقة وسماعات أصلية',
      badgeEn: 'GaN Power & Pro Audio Gear',
      title: 'شواحن أنكر وسماعات سوني وآبل',
      titleEn: 'Anker GaN & Sony / Apple Audio',
      subtitle: 'شواحن سريعة حتى 65W ومنصات MagSafe اللاسلكية وسماعات العزل الأسطورية بضمان كامل',
      subtitleEn: 'High-speed 65W GaN Chargers, MagSafe Stands & World-Class Active Noise Canceling',
      price: 25000,
      originalPrice: 32000,
      product: mockProducts[4],
      specs: ['شحن فائق لـ 3 أجهزة', 'عزل ضوضاء فائق', 'كابلات مجدولة 100W'],
      specsEn: ['3-Device Fast Charge', 'Pro Noise Cancellation', '100W Braided Lines'],
      // Aesthetic audio and charger workspace photography
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=85&w=1920&auto=format&fit=crop',
    },
  ];

  useEffect(() => {
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
    if (!touchStart || !touchEnd) return;
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

  const slide = slides[currentSlide];

  return (
    <section
      className="relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] flex items-center overflow-hidden bg-black text-white transform-gpu select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Full-Bleed Top Background Image (الثلاث الصور الي يتقلبين تظهر من فوق و img تكون خلف div) */}
      {slides.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out z-0 pointer-events-none ${
            idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          style={{
            transitionProperty: 'opacity, transform',
            transform: idx === currentSlide
              ? `scale(1.04) translate3d(${-mouseTilt.x * 1.5}px, ${-mouseTilt.y * 1.5}px, 0)`
              : 'scale(1.08)',
            transition: 'transform 300ms ease-out, opacity 1000ms ease-in-out',
          }}
        >
          <img
            src={item.image}
            alt={isAr ? item.title : item.titleEn}
            className="w-full h-full object-cover object-top sm:object-center filter brightness-95"
            referrerPolicy="no-referrer"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* 2. Light, subtle gradient overlay so image shines through clearly from the top (تظهر من فوق صورة الواجهة والكتابة خفيفة فوقها) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/85 md:via-black/40 md:to-transparent rtl:md:bg-gradient-to-l pointer-events-none" />

      {/* Subtle ambient orange/cyan tech glow matching store theme */}
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-orange-500/40 text-xs font-bold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-orange-300 font-sans tracking-wide">
              {isAr ? slide.badge : slide.badgeEn}
            </span>
          </div>

          {/* Slide Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]">
            {isAr ? slide.title : slide.titleEn}
          </h1>

          {/* Light Subtitle description */}
          <p className="text-xs sm:text-sm md:text-base text-gray-200/95 max-w-2xl leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
            {isAr ? slide.subtitle : slide.subtitleEn}
          </p>

          {/* Key Specs Pills (Distributed for Mobile) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(isAr ? slide.specs : slide.specsEn).map((spec, i) => (
              <span
                key={i}
                className="bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-xl text-xs font-semibold text-gray-100 flex items-center gap-1.5 shadow-sm hover:border-orange-400/50 transition-colors"
              >
                <Cpu className="w-3 h-3 text-orange-400" />
                <span>{spec}</span>
              </span>
            ))}
            <span className="bg-emerald-950/60 backdrop-blur-md border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{isAr ? 'ضمان رسمي باليمن' : 'Official Warranty'}</span>
            </span>
          </div>

          {/* Price Callout in Yemeni Rials */}
          <div className="flex flex-wrap items-baseline gap-3 pt-2">
            <span className="text-xs font-bold text-gray-300">
              {isAr ? 'السعر الترويجي:' : 'Promo Price:'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 font-mono drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                {formatPrice(slide.price, currency, isAr)}
              </span>
              {slide.originalPrice && (
                <span className="text-xs sm:text-sm text-gray-400 line-through font-mono">
                  {formatPrice(slide.originalPrice, currency, isAr)}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-900/40 border border-emerald-700/50 px-2 py-0.5 rounded-md">
              {isAr ? 'توفير فوري' : 'Instant Savings'}
            </span>
          </div>

          {/* Responsive Action Buttons: Button 1 small, Button 2 smaller, WhatsApp smallest circular */}
          <div className="flex items-center gap-2 pt-2.5">
            {/* button 1: زر صغير بالركن */}
            <button
              onClick={() => {
                soundFX.playClick();
                onSelectProduct(slide.product);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md active:scale-95 transition-all text-xs flex items-center gap-1.5 border border-orange-400/30 cursor-pointer shrink-0"
              title={isAr ? 'عرض المواصفات والطلب' : 'View Specs & Order'}
            >
              <span>{isAr ? 'عرض والطلب' : 'View & Order'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>

            {/* button 2: زر أصغر */}
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

            {/* a: زر تواصل وتساب دائري أصغر من الجميع يحتوي على https://wa.me/967774102030 */}
            <a
              href={`https://wa.me/967774102030?text=${encodeURIComponent(
                isAr
                  ? `السلام عليكم متجر صدام العقاري، أود طلب وشراء: ${slide.title}`
                  : `Hello Saddam Al-Aqari Store, I would like to order: ${slide.titleEn}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-emerald-400/50 backdrop-blur-md transition-all hover:scale-110 active:scale-95 shrink-0 cursor-pointer"
              title={isAr ? "الطلب السريع عبر واتساب (+967 774 102 030)" : "Quick Order WhatsApp (+967 774 102 030)"}
              aria-label="WhatsApp"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. Controls: Slide Indicators & Next/Prev Arrows */}
      <div className="absolute bottom-4 inset-x-0 z-20 container mx-auto px-4 sm:px-6 flex items-center justify-between pointer-events-auto">
        {/* Indicators */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => changeSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
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
    </section>
  );
}
