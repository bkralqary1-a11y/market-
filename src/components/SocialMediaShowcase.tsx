import React, { useState } from 'react';
import {
  Play,
  ExternalLink,
  RotateCw,
  Sparkles,
  Share2,
  X,
  MessageCircle,
  Video,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
} from 'lucide-react';
import { Language } from '../types';
import { OFFICIAL_SOCIAL_CHANNELS, LUXURY_SOCIAL_REELS, SocialReelItem, SocialChannel } from '../data/socialMediaData';
import { soundFX } from '../utils/audioEffects';
import { getYouTubeId, getYouTubeEmbedUrl } from '../utils/videoUtils';

interface SocialMediaShowcaseProps {
  language: Language;
}

export default function SocialMediaShowcase({ language }: SocialMediaShowcaseProps) {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'all' | 'youtube' | 'tiktok' | 'instagram' | 'facebook'>('all');
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [activeModalReel, setActiveModalReel] = useState<SocialReelItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const filteredReels = activeTab === 'all'
    ? LUXURY_SOCIAL_REELS
    : LUXURY_SOCIAL_REELS.filter((r) => r.platform === activeTab);

  const handleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    setFlippedCardId((prev) => (prev === id ? null : id));
  };

  const handleOpenModal = (reel: SocialReelItem) => {
    soundFX.playModalOpen();
    setActiveModalReel(reel);
  };

  const handleShare = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const getPlatformIcon = (platform: string, className: string = 'w-5 h-5') => {
    switch (platform) {
      case 'youtube':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.34-.02 2.58-.8 3.14-2.02.35-.71.45-1.52.44-2.31.02-4.75-.01-9.51.01-14.26z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'whatsapp':
        return <MessageCircle className={className} />;
      default:
        return <Video className={className} />;
    }
  };

  return (
    <section id="social-showcase-section" className="relative py-14 sm:py-20 bg-gradient-to-b from-gray-950 via-slate-900 to-tech-dark text-white overflow-hidden">
      {/* Dynamic 3D Ambient Lighting Background */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-24 start-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 end-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-rose-500/20 border border-orange-500/30 text-orange-400 font-bold text-xs uppercase tracking-wider mb-4 shadow-lg shadow-orange-500/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{isAr ? 'عالم صدام العقاري الرقمي • منصاتنا الرسمية' : 'Official Social Channels & Reels'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight mb-4">
            {isAr ? (
              <>
                تابع أحدث الفيديوهات ومراجعات الأجهزة عبر{' '}
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                  منصاتنا الرسمية
                </span>
              </>
            ) : (
              <>
                Explore Exclusive Tech Reels & Follow{' '}
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                  Our Channels
                </span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed">
            {isAr
              ? 'شاهد مراجعات حية للأجهزة الجديدة، اختبارات الكاميرات، وصول الشواحن والكفرات الأصلية، وتواصل معنا مباشرة عبر جميع المنصات بنقرة واحدة.'
              : 'Live smartphone unboxings, camera tests, certified warranty reveals, and instant one-click connection on all social platforms.'}
          </p>
        </div>

        {/* 1. Luxurious Interactive Channel Cards (البطاقات التفاعلية لجميع الحسابات) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-12">
          {OFFICIAL_SOCIAL_CHANNELS.map((channel: SocialChannel) => (
            <a
              key={channel.id}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="group relative rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 hover:border-white/25 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
              style={{
                boxShadow: `0 10px 30px -10px ${channel.color}25`,
              }}
            >
              {/* Subtle Ambient Color Glow */}
              <div
                className="absolute top-0 end-0 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ backgroundColor: channel.color }}
              />

              <div>
                {/* Header Icon + Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: channel.color }}
                  >
                    {getPlatformIcon(channel.id, 'w-5 h-5')}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{channel.badge}</span>
                  </span>
                </div>

                {/* Name & Handle */}
                <h3 className="font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>{isAr ? channel.nameAr : channel.nameEn}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-[11px] font-mono text-gray-400 group-hover:text-gray-300 mt-0.5 dir-ltr text-right truncate">
                  {channel.handle}
                </p>

                {/* Description Snippet */}
                <p className="text-[11px] text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                  {isAr ? channel.descriptionAr : channel.descriptionEn}
                </p>
              </div>

              {/* Action Follow Button */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-300">
                  {isAr ? channel.statsAr : channel.statsEn}
                </span>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-xl text-white shadow-sm transition-all group-hover:shadow-md flex items-center gap-1"
                  style={{ backgroundColor: channel.color }}
                >
                  <span>{isAr ? 'متابعة' : 'Follow'}</span>
                  <span>+</span>
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* 2. Interactive Video Showcase Filters (فلاتر الفيديوهات والتقلبات التفاعلية) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-orange-400" />
            <span className="font-extrabold text-base text-white">
              {isAr ? 'ريلز وفيديوهات تفاعلية (اقلب البطاقة أو شاهد الفيديو)' : 'Interactive Reels (Flip Card or Play)'}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('youtube');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {getPlatformIcon('youtube', 'w-3.5 h-3.5')}
              <span>{isAr ? 'يوتيوب' : 'YouTube'}</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('tiktok');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tiktok'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {getPlatformIcon('tiktok', 'w-3.5 h-3.5')}
              <span>{isAr ? 'تيك توك' : 'TikTok'}</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('instagram');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'instagram'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {getPlatformIcon('instagram', 'w-3.5 h-3.5')}
              <span>{isAr ? 'انستغرام' : 'Instagram'}</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('facebook');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'facebook'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {getPlatformIcon('facebook', 'w-3.5 h-3.5')}
              <span>{isAr ? 'فيسبوك' : 'Facebook'}</span>
            </button>
          </div>
        </div>

        {/* 3. Interactive 3D Flipping Reels Grid ("تقلبات تفاعلية ومزج فخم") */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredReels.map((reel: SocialReelItem) => {
            const isFlipped = flippedCardId === reel.id;

            return (
              <div
                key={reel.id}
                className="relative h-[380px] sm:h-[400px] w-full rounded-2xl perspective-1000 cursor-pointer group select-none"
                onClick={(e) => handleFlip(reel.id, e)}
              >
                {/* 3D Card Inner */}
                <div
                  className={`w-full h-full duration-700 preserve-3d transition-transform relative rounded-2xl shadow-xl ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* FRONT OF CARD (الواجهة الأمامية للفيديو) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-white/15 bg-gray-900 backface-hidden flex flex-col justify-between"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Background Poster / Image */}
                    <img
                      src={reel.thumbnail}
                      alt={isAr ? reel.titleAr : reel.titleEn}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient Overlay for readable text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 pointer-events-none" />

                    {/* Top Platform Badge & Flip Trigger */}
                    <div className="relative z-10 p-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white backdrop-blur-md bg-black/60 border border-white/20 shadow-md">
                        {getPlatformIcon(reel.platform, 'w-3.5 h-3.5')}
                        <span className="capitalize">{reel.platform}</span>
                      </span>

                      <button
                        onClick={(e) => handleFlip(reel.id, e)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20"
                        title={isAr ? 'اقلب لعرض التفاصيل' : 'Flip for details'}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Center Play Button */}
                    <div className="relative z-10 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(reel);
                        }}
                        className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/40 border border-white/30 transform group-hover:scale-110 active:scale-95 transition-all"
                        title={isAr ? 'مشاهدة الفيديو' : 'Play Video'}
                      >
                        <Play className="w-6 h-6 fill-white translate-x-0.5" />
                      </button>
                    </div>

                    {/* Bottom Metadata & Views */}
                    <div className="relative z-10 p-3.5 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30 inline-block mb-1.5">
                        {isAr ? reel.tagAr : reel.tagEn}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug drop-shadow-md">
                        {isAr ? reel.titleAr : reel.titleEn}
                      </h4>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[10px] text-gray-300">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-orange-400" />
                          <span>{reel.views}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                          <span>{reel.likes}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK OF CARD (الوجه الخلفي للبطاقة - تفاعلي وفاخر) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl p-4 bg-gradient-to-b from-gray-900 via-slate-900 to-black border-2 border-orange-500/40 shadow-2xl backface-hidden flex flex-col justify-between text-white"
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div>
                      {/* Top Bar on back */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-orange-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تفاصيل الريلز' : 'Reel Specs'}</span>
                        </span>
                        <button
                          onClick={(e) => handleFlip(reel.id, e)}
                          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                          title="قلب البطاقة"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                      </div>

                      <h4 className="font-black text-xs sm:text-sm leading-snug text-white mb-2">
                        {isAr ? reel.titleAr : reel.titleEn}
                      </h4>

                      <p className="text-[11px] text-gray-300 leading-relaxed mb-3">
                        {isAr
                          ? 'متوفر الآن بأفضل سعر مع الضمان المعتمد والتوصيل السريع لجميع محافظات الجمهورية اليمنية.'
                          : 'Available with official warranty and express delivery across all Yemen governorates.'}
                      </p>

                      <div className="space-y-1.5 text-[11px] bg-white/5 p-2 rounded-xl border border-white/10 font-mono">
                        <div className="flex items-center justify-between text-gray-400">
                          <span>{isAr ? 'المشاهدات:' : 'Views:'}</span>
                          <span className="font-bold text-white">{reel.views}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-400">
                          <span>{isAr ? 'التفاعل والإعجابات:' : 'Likes:'}</span>
                          <span className="font-bold text-rose-400">{reel.likes}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-400">
                          <span>{isAr ? 'المنصة:' : 'Platform:'}</span>
                          <span className="font-bold text-amber-300 capitalize">{reel.platform}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Links on Back */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <a
                        href={reel.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? 'مشاهدة على المنصة' : 'Watch on Platform'}</span>
                      </a>

                      <a
                        href={`https://wa.me/967774102030?text=${encodeURIComponent(
                          `السلام عليكم متجر صدام العقاري، أود الاستفسار وطلب الجهاز المعروض في ريلز: ${reel.titleAr}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? 'طلب الجهاز بالواتساب' : 'Order via WhatsApp'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Luxury Cinematic Reel Modal (مشغل الفيديو السينمائي الفاخر) */}
      {activeModalReel && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setActiveModalReel(null)}
        >
          <div
            className="relative w-full max-w-lg bg-gray-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-gray-900/90 border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                  {getPlatformIcon(activeModalReel.platform, 'w-4 h-4')}
                </span>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm line-clamp-1">
                    {isAr ? activeModalReel.titleAr : activeModalReel.titleEn}
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    {isAr ? 'صدام العقاري للهواتف الذكية' : 'Saddam Al-Aqari Phones'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => handleShare(activeModalReel.directUrl, e)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="مشاركة الرابط"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    soundFX.playModalClose();
                    setActiveModalReel(null);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-[9/16] sm:aspect-[9/14] max-h-[55vh] bg-black w-full flex items-center justify-center overflow-hidden">
              {(() => {
                const ytId = getYouTubeId(activeModalReel.videoUrl);
                if (ytId) {
                  return (
                    <iframe
                      src={getYouTubeEmbedUrl(ytId, { autoplay: true, mute: false, controls: true })}
                      title={activeModalReel.titleAr}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                return (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <img
                      src={activeModalReel.thumbnail}
                      alt="Thumbnail"
                      className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40"
                    />
                    <div className="relative z-10 space-y-4 max-w-xs">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center mx-auto text-white shadow-xl">
                        {getPlatformIcon(activeModalReel.platform, 'w-8 h-8')}
                      </div>
                      <p className="font-bold text-sm text-white">
                        {isAr ? 'شاهد هذا الفيديو الكامل بجودة 4K على حسابنا الرسمي' : 'Watch full video in 4K on our official handle'}
                      </p>
                      <a
                        href={activeModalReel.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{isAr ? 'فتح على التطبيق / المنصة' : 'Open in App'}</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-gray-900 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? activeModalReel.tagAr : activeModalReel.tagEn}</span>
                </span>
                <span className="font-mono text-gray-400">{activeModalReel.views} مشاهدة</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={activeModalReel.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isAr ? 'صفحتنا الرسمية' : 'Official Page'}</span>
                </a>

                <a
                  href={`https://wa.me/967774102030?text=${encodeURIComponent(
                    `السلام عليكم متجر صدام العقاري، أود الاستفسار وطلب: ${activeModalReel.titleAr}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isAr ? 'طلب الجهاز واتساب' : 'Order via WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
