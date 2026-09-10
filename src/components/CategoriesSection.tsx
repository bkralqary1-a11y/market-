import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Smartphone, Headphones, Shield, Zap, Cable, ArrowRight, ArrowLeft, Layers } from 'lucide-react';
import { CategoryId, Language } from '../types';
import { mockCategories } from '../data/mockData';

interface CategoriesSectionProps {
  language: Language;
  onSelectCategory: (catId: CategoryId) => void;
}

export default function CategoriesSection({
  language,
  onSelectCategory,
}: CategoriesSectionProps) {
  const isAr = language === 'ar';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const categoryIcons: Record<string, ReactNode> = {
    phones: <Smartphone className="w-5 h-5 text-white" />,
    audio: <Headphones className="w-5 h-5 text-white" />,
    cases: <Shield className="w-5 h-5 text-white" />,
    chargers: <Zap className="w-5 h-5 text-white" />,
    cables: <Cable className="w-5 h-5 text-white" />,
  };

  // High quality Pinterest-style catalog background images for each category
  const categoryImages: Record<string, string> = {
    phones: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000&auto=format&fit=crop',
    audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    cases: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1000&auto=format&fit=crop',
    chargers: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?q=80&w=1000&auto=format&fit=crop',
    cables: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop',
  };

  // Auto-slide to the right every 2 seconds as requested
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % mockCategories.length;
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const cardWidth = container.firstElementChild
            ? (container.firstElementChild as HTMLElement).clientWidth + 16
            : 260;
          
          container.scrollTo({
            left: isAr ? -nextIndex * cardWidth : nextIndex * cardWidth,
            behavior: 'smooth',
          });
        }
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isPaused, isAr]);

  // Scroll manually left or right
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).clientWidth + 16
        : 260;
      const scrollAmount = direction === 'right' ? cardWidth : -cardWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="categories-section" className="py-10 md:py-14 bg-gray-50/50">
      <div className="container mx-auto px-4">
        {/* 1. Header with the Orange-to-White 3D Rectangle requested by user */}
        <div className="flex flex-col items-center mb-6">
          {/* Vertical / Dimension Rectangle for "الأقسام" */}
          <div className="relative group">
            {/* 3D Drop Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-300 pointer-events-none" />
            
            {/* The main orange fading down to white container */}
            <div
              className="relative px-8 sm:px-14 py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-3 border-2 border-orange-400/60 shadow-[0_12px_24px_rgba(234,88,12,0.35),inset_0_2px_0_rgba(255,255,255,0.75),0_6px_0_#c2410c] active:translate-y-1 active:shadow-[0_4px_12px_rgba(234,88,12,0.3)] transition-all cursor-default"
              style={{
                background: 'linear-gradient(180deg, #ea580c 0%, #f97316 45%, #fed7aa 85%, #ffffff 100%)',
              }}
            >
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-bounce" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wider drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)] font-display">
                {isAr ? 'الأقسام' : 'CATEGORIES'}
              </h2>
            </div>
          </div>

          {/* 2. Secondary 3D Base Strip Bar underneath as requested */}
          <div className="w-full max-w-xl h-2.5 sm:h-3 mt-3 rounded-full bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 shadow-[0_4px_10px_rgba(234,88,12,0.25),inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_0_#9a3412] border border-orange-300/40" />
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-bold text-gray-700 font-sans">
              {isAr ? 'اسحب للتنقل بين الأقسام (تتحرك تلقائياً)' : 'Swipe to explore (auto-sliding)'}
            </span>
          </div>

          {/* Nav arrows for mobile & desktop */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-gray-700 border border-gray-200 shadow-sm transition-all active:scale-95"
              aria-label="Previous category"
            >
              <ArrowRight className="w-4 h-4 rtl:hidden" />
              <ArrowLeft className="w-4 h-4 ltr:hidden" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-gray-700 border border-gray-200 shadow-sm transition-all active:scale-95"
              aria-label="Next category"
            >
              <ArrowLeft className="w-4 h-4 rtl:hidden" />
              <ArrowRight className="w-4 h-4 ltr:hidden" />
            </button>
          </div>
        </div>

        {/* 3. The 3D Category Cards Carousel (Touch-swipeable & Auto-slides every 2 seconds) */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex items-center gap-4 sm:gap-5 overflow-x-auto pb-6 pt-2 scroll-smooth no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockCategories.map((cat, idx) => {
            const bgImg = categoryImages[cat.id] || cat.image;
            const isSelected = currentIndex === idx;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-none w-[240px] sm:w-[280px] md:w-[300px] h-[220px] sm:h-[250px] relative rounded-2xl overflow-hidden group cursor-pointer snap-start transition-all duration-300 select-none border-2 ${
                  isSelected ? 'border-orange-500 shadow-xl scale-[1.02]' : 'border-white/80 shadow-md hover:shadow-xl hover:scale-[1.02]'
                }`}
                style={{
                  boxShadow: isSelected
                    ? '0 12px 28px rgba(234, 88, 12, 0.25), 0 4px 0 #ea580c'
                    : '0 8px 20px rgba(0, 0, 0, 0.12), 0 3px 0 rgba(0,0,0,0.08)',
                }}
              >
                {/* Full Background Image */}
                <img
                  src={bgImg}
                  alt={isAr ? cat.nameAr : cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Subtle Black Shadow / Gradient behind text as requested */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 transition-opacity duration-300 group-hover:from-black/95 group-hover:via-black/50" />

                {/* Top Badge (Icon & Count) */}
                <div className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 flex items-center gap-2 z-10">
                  <span className="text-[11px] font-bold font-mono text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                    {cat.itemCount} {isAr ? 'منتج' : 'items'}
                  </span>
                </div>

                <div className="absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5 z-10">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/90 backdrop-blur-md text-white flex items-center justify-center border border-white/25 shadow-md group-hover:scale-110 group-hover:bg-orange-500 transition-all">
                    {categoryIcons[cat.id] || <Zap className="w-5 h-5 text-white" />}
                  </div>
                </div>

                {/* Card Bottom: Text written in White with Subtle Black Drop Shadow */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 text-right rtl:text-right ltr:text-left flex flex-col justify-end">
                  {/* Category Title in pure white */}
                  <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1.5 leading-tight tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] group-hover:text-amber-300 transition-colors">
                    {isAr ? cat.nameAr : cat.name}
                  </h3>

                  {/* Description in soft white */}
                  <p className="text-xs text-white/90 line-clamp-2 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mb-3">
                    {isAr ? cat.descriptionAr : cat.name}
                  </p>

                  {/* Browse CTA Button in White/Orange */}
                  <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/15 backdrop-blur-md w-fit px-3 py-1.5 rounded-lg border border-white/30 group-hover:bg-orange-500 group-hover:border-orange-400 transition-all shadow-sm">
                    <span>{isAr ? 'استعراض المنتجات' : 'View Products'}</span>
                    {isAr ? (
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-2">
          {mockCategories.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                if (scrollContainerRef.current) {
                  const container = scrollContainerRef.current;
                  const cardWidth = container.firstElementChild
                    ? (container.firstElementChild as HTMLElement).clientWidth + 16
                    : 260;
                  container.scrollTo({
                    left: isAr ? -idx * cardWidth : idx * cardWidth,
                    behavior: 'smooth',
                  });
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-8 bg-orange-500 shadow-sm' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to category ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
