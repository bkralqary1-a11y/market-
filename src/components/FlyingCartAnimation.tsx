import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Check } from 'lucide-react';

export interface FlyToCartDetail {
  imageUrl: string;
  productName: string;
  sourceElement?: HTMLElement | null;
  coords?: { x: number; y: number; width?: number; height?: number };
}

interface ActivePopItem {
  id: string;
  imageUrl: string;
  productName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  startTime: number;
  duration: number;
  progress: number;
}

export function triggerFlyToCart(detail: FlyToCartDetail) {
  window.dispatchEvent(new CustomEvent('fly-to-cart', { detail }));
}

export default function FlyingCartAnimation() {
  const [popItems, setPopItems] = useState<ActivePopItem[]>([]);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const popItemsRef = useRef<ActivePopItem[]>([]);
  popItemsRef.current = popItems;
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleFlyEvent = (e: Event) => {
      const customEvt = e as CustomEvent<FlyToCartDetail>;
      const detail = customEvt.detail;
      if (!detail) return;

      let posX = window.innerWidth / 2;
      let posY = window.innerHeight / 2;
      let width = 140;
      let height = 140;

      if (detail.sourceElement) {
        const rect = detail.sourceElement.getBoundingClientRect();
        posX = rect.left + rect.width / 2;
        posY = rect.top + rect.height / 2;
        width = Math.min(Math.max(rect.width, 100), 220);
        height = Math.min(Math.max(rect.height, 100), 220);
      } else if (detail.coords) {
        posX = detail.coords.x;
        posY = detail.coords.y;
        if (detail.coords.width) width = detail.coords.width;
        if (detail.coords.height) height = detail.coords.height;
      }

      // Notify cart button bump
      window.dispatchEvent(new CustomEvent('cart-bump'));

      const newItem: ActivePopItem = {
        id: `pop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        imageUrl: detail.imageUrl,
        productName: detail.productName,
        x: posX,
        y: posY,
        width,
        height,
        startTime: performance.now(),
        duration: 700, // Quick punchy pop forward then return
        progress: 0,
      };

      setPopItems((prev) => [...prev, newItem]);
      setActiveToast(detail.productName);
    };

    window.addEventListener('fly-to-cart', handleFlyEvent);
    return () => window.removeEventListener('fly-to-cart', handleFlyEvent);
  }, []);

  // Animation Frame Loop for Smooth Pop & Pulse without any tilt/rotation
  useEffect(() => {
    const loop = (currentTime: number) => {
      if (popItemsRef.current.length > 0) {
        const updated = popItemsRef.current
          .map((item) => {
            const elapsed = currentTime - item.startTime;
            const progress = Math.min(elapsed / item.duration, 1);
            return { ...item, progress };
          })
          .filter((item) => item.progress < 1);

        setPopItems(updated);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 2200);
    return () => clearTimeout(timer);
  }, [activeToast]);

  return (
    <>
      {/* Pop Forward Pulse Overlay Layer - Completely zero tilt or angle */}
      <div className="fixed inset-0 pointer-events-none z-[9999999] overflow-hidden">
        {popItems.map((item) => {
          // Keyframe mathematical trajectory:
          // 0 -> 0.35: Thrust forward strongly (scale 1.0 -> 1.35, elevation -16px, zero rotation)
          // 0.35 -> 0.7: High energy punch pulse (scale 1.35 -> 1.15)
          // 0.7 -> 1.0: Smooth return to origin and fade (scale 1.15 -> 1.0, opacity 1 -> 0)
          const p = item.progress;
          let scale = 1;
          let translateY = 0;
          let opacity = 1;

          if (p < 0.35) {
            const t = p / 0.35;
            // Easing forward punch
            scale = 1 + Math.sin(t * (Math.PI / 2)) * 0.38;
            translateY = -Math.sin(t * (Math.PI / 2)) * 18;
            opacity = 1;
          } else if (p < 0.7) {
            const t = (p - 0.35) / 0.35;
            scale = 1.38 - t * 0.22;
            translateY = -18 + t * 8;
            opacity = 1;
          } else {
            const t = (p - 0.7) / 0.3;
            scale = 1.16 - t * 0.16;
            translateY = -10 + t * 10;
            opacity = 1 - t;
          }

          return (
            <div
              key={item.id}
              style={{
                position: 'fixed',
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
                transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
                opacity,
                willChange: 'transform, opacity',
                filter: 'drop-shadow(0 20px 35px rgba(16, 185, 129, 0.45)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))',
              }}
              className="rounded-2xl border-2 border-emerald-400 bg-white/95 overflow-hidden flex items-center justify-center p-2 shadow-2xl"
            >
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-full h-full object-cover rounded-xl"
                crossOrigin="anonymous"
              />
              <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Elegant Instant Success Notice */}
      {activeToast && (
        <div className="fixed top-20 sm:top-24 inset-x-0 z-[999999] flex justify-center pointer-events-none px-4 animate-in slide-in-from-top-4 duration-200">
          <div className="bg-neutral-900/95 text-white border border-emerald-500/40 shadow-2xl px-4 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md max-w-sm w-full">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{activeToast}</span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium mt-0.5">
                تمت الإضافة إلى السلة بنجاح
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
