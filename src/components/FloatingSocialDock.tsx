import { useState } from 'react';
import { Sparkles, MessageCircle, ExternalLink, X, Shield } from 'lucide-react';
import { Language } from '../types';
import { OFFICIAL_SOCIAL_CHANNELS } from '../data/socialMediaData';
import { soundFX } from '../utils/audioEffects';

interface FloatingSocialDockProps {
  language: Language;
  onOpenAdmin?: () => void;
}

export default function FloatingSocialDock({ language, onOpenAdmin }: FloatingSocialDockProps) {
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    soundFX.playClick();
    setIsOpen((prev) => !prev);
  };

  const getPlatformIcon = (platform: string, className: string = 'w-4 h-4') => {
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
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none">
      {/* Expanded Luxury VIP Social Popover (Regular Click) */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-3xl bg-gray-950/95 backdrop-blur-2xl border border-white/20 p-4 shadow-2xl text-white animate-fadeIn space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-extrabold text-xs tracking-wide text-white">
                {isAr ? 'منصات صدام العقاري الرسمية' : 'Saddam Al-Aqari Channels'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Social Links */}
          <div className="space-y-2">
            {OFFICIAL_SOCIAL_CHANNELS.map((channel) => (
              <a
                key={channel.id}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFX.playClick()}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all group active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-r ${channel.gradient} shadow-md`}>
                    {getPlatformIcon(channel.id, 'w-4 h-4')}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                      {isAr ? channel.nameAr : channel.nameEn}
                    </h5>
                    <p className="text-[10px] text-gray-400 font-mono dir-ltr text-right truncate">
                      {channel.handle}
                    </p>
                  </div>
                </div>

                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span>{isAr ? 'خدمة عملاء فورية' : '24/7 Support'}</span>
            <span className="font-mono text-emerald-400 font-bold">774102030</span>
          </div>

          {/* Discreet Admin Entrance Link */}
          {onOpenAdmin && (
            <div className="pt-2 border-t border-white/5 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdmin();
                }}
                className="text-[11px] text-zinc-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-amber-400" />
                <span>{isAr ? 'لوحة تحكم إدارة المتجر' : 'Store Admin Dashboard'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Yellow/Amber Social Button - Clean, Natural, No Timer Boxes */}
      <button
        id="saddam-floating-social-button"
        onClick={toggleOpen}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-gray-950 font-black px-4 py-3 rounded-full shadow-[0_8px_30px_rgb(245,158,11,0.45)] border-2 border-white/50 backdrop-blur-md transition-all cursor-pointer select-none active:scale-95"
        title={isAr ? 'حساباتنا الرسمية' : 'Official Social Channels'}
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-gray-950 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>

        <span className="font-extrabold text-xs hidden sm:inline-block tracking-wide text-gray-950">
          {isAr ? 'حساباتنا الرسمية' : 'Official Social'}
        </span>

        {/* Social icons preview */}
        <div className="flex items-center -space-x-1 rtl:space-x-reverse">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
          <span className="w-2.5 h-2.5 rounded-full bg-black border border-white" />
          <span className="w-2.5 h-2.5 rounded-full bg-pink-600 border border-white" />
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white" />
        </div>
      </button>
    </div>
  );
}
