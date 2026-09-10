import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Check, Sparkles } from 'lucide-react';

export type ThrowStyle = 'arc' | 'spin' | 'sonic' | 'slingshot';

export interface FlyToCartDetail {
  imageUrl: string;
  productName: string;
  sourceElement?: HTMLElement | null;
  coords?: { x: number; y: number; width?: number; height?: number };
  style?: ThrowStyle;
}

interface ActiveFlyingItem {
  id: string;
  imageUrl: string;
  productName: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  targetX: number;
  targetY: number;
  style: ThrowStyle;
  styleNameAr: string;
  startTime: number;
  duration: number;
  // Current animation state
  currentX: number;
  currentY: number;
  currentScale: number;
  currentRotate: number;
  currentOpacity: number;
  glowColor: string;
}

interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
}

const THROW_STYLES: { type: ThrowStyle; nameAr: string; duration: number; glow: string }[] = [
  {
    type: 'arc',
    nameAr: 'رجم قوسي بالستي 🎯',
    duration: 750,
    glow: 'rgba(249, 115, 22, 0.6)', // orange
  },
  {
    type: 'spin',
    nameAr: 'إلقاء لولبي سريع 🌀',
    duration: 800,
    glow: 'rgba(59, 130, 246, 0.6)', // blue
  },
  {
    type: 'sonic',
    nameAr: 'رمية نفاثة خاطفة ⚡',
    duration: 650,
    glow: 'rgba(16, 185, 129, 0.6)', // emerald
  },
  {
    type: 'slingshot',
    nameAr: 'قذف منجنيق مرتد 🏹',
    duration: 850,
    glow: 'rgba(236, 72, 153, 0.6)', // pink
  },
];

let styleCycleIndex = 0;

export function triggerFlyToCart(detail: FlyToCartDetail) {
  window.dispatchEvent(new CustomEvent('fly-to-cart', { detail }));
}

export default function FlyingCartAnimation() {
  const [flyingItems, setFlyingItems] = useState<ActiveFlyingItem[]>([]);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const [activeToast, setActiveToast] = useState<{
    name: string;
    style: string;
  } | null>(null);

  const flyingItemsRef = useRef<ActiveFlyingItem[]>([]);
  flyingItemsRef.current = flyingItems;

  const particlesRef = useRef<SparkleParticle[]>([]);
  particlesRef.current = particles;

  const animFrameIdRef = useRef<number | null>(null);

  // Spawn sparkle burst at target upon landing
  const createSparklesAt = (x: number, y: number) => {
    const colors = ['#f59e0b', '#10b981', '#f97316', '#3b82f6', '#ec4899', '#ffffff'];
    const newParticles: SparkleParticle[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5;
      const speed = 2.5 + Math.random() * 4.5;
      newParticles.push({
        id: `${Date.now()}-${i}-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        opacity: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  useEffect(() => {
    const handleFlyEvent = (e: Event) => {
      const customEvt = e as CustomEvent<FlyToCartDetail>;
      const detail = customEvt.detail;
      if (!detail) return;

      // 1. Calculate Start Coords
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;
      let startWidth = 90;
      let startHeight = 90;

      if (detail.sourceElement) {
        const rect = detail.sourceElement.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        startWidth = Math.min(Math.max(rect.width, 60), 120);
        startHeight = Math.min(Math.max(rect.height, 60), 120);
      } else if (detail.coords) {
        startX = detail.coords.x;
        startY = detail.coords.y;
        if (detail.coords.width) startWidth = detail.coords.width;
        if (detail.coords.height) startHeight = detail.coords.height;
      }

      // 2. Calculate Target Coords (Header cart button or floating cart button)
      const headerCartBtn = document.getElementById('main-header-cart-btn');
      const floatingCartBtn = document.getElementById('floating-cart-button');

      let targetEl: HTMLElement | null = null;
      if (floatingCartBtn) {
        const rect = floatingCartBtn.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          targetEl = floatingCartBtn;
        }
      }
      if (!targetEl && headerCartBtn) {
        targetEl = headerCartBtn;
      }

      let targetX = window.innerWidth - 65;
      let targetY = 40;

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      // 3. Choose throwing style (Cycles automatically: Arc -> Spin -> Sonic -> Slingshot)
      const styleConfig = detail.style
        ? THROW_STYLES.find((s) => s.type === detail.style) || THROW_STYLES[0]
        : THROW_STYLES[styleCycleIndex % THROW_STYLES.length];
      styleCycleIndex++;

      const newItem: ActiveFlyingItem = {
        id: `flying-${Date.now()}-${Math.random()}`,
        imageUrl: detail.imageUrl,
        productName: detail.productName,
        startX,
        startY,
        startWidth,
        startHeight,
        targetX,
        targetY,
        style: styleConfig.type,
        styleNameAr: styleConfig.nameAr,
        startTime: performance.now(),
        duration: styleConfig.duration,
        currentX: startX,
        currentY: startY,
        currentScale: 1,
        currentRotate: 0,
        currentOpacity: 1,
        glowColor: styleConfig.glow,
      };

      setFlyingItems((prev) => [...prev, newItem]);
    };

    window.addEventListener('fly-to-cart', handleFlyEvent);
    return () => window.removeEventListener('fly-to-cart', handleFlyEvent);
  }, []);

  // Main Animation Physics Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update Flying Items
      if (flyingItemsRef.current.length > 0) {
        const remainingItems: ActiveFlyingItem[] = [];

        flyingItemsRef.current.forEach((item) => {
          const elapsed = currentTime - item.startTime;
          const rawT = Math.min(elapsed / item.duration, 1);

          if (rawT >= 1) {
            // Item arrived at destination!
            // 1. Trigger Cart impact bump & sound vibration
            window.dispatchEvent(
              new CustomEvent('cart-bump', {
                detail: { targetX: item.targetX, targetY: item.targetY },
              })
            );
            // 2. Create sparkles burst
            createSparklesAt(item.targetX, item.targetY);
            // 3. Trigger toast banner
            setActiveToast({
              name: item.productName,
              style: item.styleNameAr,
            });
            return;
          }

          // Physics calculation per style
          let posX = item.startX;
          let posY = item.startY;
          let scale = 1;
          let rotate = 0;
          let opacity = 1;

          if (item.style === 'arc') {
            // 🎯 High Arc Trajectory
            // Ease in-out along X, high parabolic arc along Y
            const t = rawT;
            posX = (1 - t) * item.startX + t * item.targetX;
            const dist = Math.hypot(item.targetX - item.startX, item.targetY - item.startY);
            const arcHeight = Math.max(140, Math.min(dist * 0.45, 300));
            posY = (1 - t) * item.startY + t * item.targetY - Math.sin(t * Math.PI) * arcHeight;
            // Slight tilt following flight direction
            const dir = item.targetX >= item.startX ? 1 : -1;
            rotate = Math.sin(t * Math.PI) * 28 * dir;
            // Scale: swells up slightly at launch then shrinks into cart
            scale = (1 + Math.sin(t * Math.PI * 0.5) * 0.25) * (1 - t * 0.65);
            opacity = t > 0.85 ? (1 - t) / 0.15 : 1;
          } else if (item.style === 'spin') {
            // 🌀 Spinning Vortex Trajectory
            const t = rawT;
            // Spiral perturbation
            const wobble = Math.sin(t * Math.PI * 3) * 30 * (1 - t);
            posX = (1 - t) * item.startX + t * item.targetX + wobble;
            posY = (1 - t) * item.startY + t * item.targetY - Math.sin(t * Math.PI) * 90;
            // Rapid double 720 rotation
            rotate = t * 720;
            scale = 1 - t * 0.72;
            opacity = t > 0.9 ? (1 - t) / 0.1 : 1;
          } else if (item.style === 'sonic') {
            // ⚡ Sonic Jet Dash (Accelerating supersonic thrust)
            // Cubic acceleration
            const t = rawT * rawT * (3 - 2 * rawT);
            posX = (1 - t) * item.startX + t * item.targetX;
            posY = (1 - t) * item.startY + t * item.targetY;
            // Slight stretch / tilt towards target
            const angle = Math.atan2(item.targetY - item.startY, item.targetX - item.startX);
            rotate = (angle * 180) / Math.PI;
            scale = 1 - rawT * 0.68;
            opacity = rawT > 0.92 ? (1 - rawT) / 0.08 : 1;
          } else {
            // 🏹 Slingshot Launch (Pulls back first, then shoots forward)
            let t = rawT;
            if (t < 0.2) {
              // Pullback phase
              const pullT = t / 0.2;
              const dirX = Math.sign(item.startX - item.targetX);
              const dirY = Math.sign(item.startY - item.targetY);
              posX = item.startX + Math.sin(pullT * Math.PI) * 35 * dirX;
              posY = item.startY + Math.sin(pullT * Math.PI) * 25 * dirY;
              scale = 1.15;
              rotate = -15 * dirX;
            } else {
              // Shoot phase (0.2 to 1.0)
              const shootT = (t - 0.2) / 0.8;
              const eased = Math.pow(shootT, 2); // Accelerate
              posX = (1 - eased) * item.startX + eased * item.targetX;
              posY =
                (1 - eased) * item.startY +
                eased * item.targetY -
                Math.sin(shootT * Math.PI) * 110;
              rotate = shootT * 360;
              scale = (1 - shootT * 0.7) * 1.1;
              opacity = shootT > 0.88 ? (1 - shootT) / 0.12 : 1;
            }
          }

          remainingItems.push({
            ...item,
            currentX: posX,
            currentY: posY,
            currentScale: Math.max(scale, 0.15),
            currentRotate: rotate,
            currentOpacity: Math.max(opacity, 0),
          });
        });

        setFlyingItems(remainingItems);
      }

      // Update Sparkle Particles
      if (particlesRef.current.length > 0) {
        const remainingParticles = particlesRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy + 0.15, // slight gravity
            opacity: p.opacity - dt * 2.2,
          }))
          .filter((p) => p.opacity > 0);

        setParticles(remainingParticles);
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
    }, 2800);
    return () => clearTimeout(timer);
  }, [activeToast]);

  return (
    <>
      {/* 1. Flying Product Images Layer (Zero interaction, on top of everything) */}
      <div className="fixed inset-0 pointer-events-none z-[9999999] overflow-hidden">
        {flyingItems.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'fixed',
              left: `${item.currentX}px`,
              top: `${item.currentY}px`,
              width: `${item.startWidth}px`,
              height: `${item.startHeight}px`,
              transform: `translate(-50%, -50%) scale(${item.currentScale}) rotate(${item.currentRotate}deg)`,
              opacity: item.currentOpacity,
              willChange: 'transform, opacity, left, top',
              boxShadow: `0 10px 25px ${item.glowColor}, 0 0 20px rgba(255,255,255,0.8)`,
            }}
            className="rounded-2xl border-2 border-white bg-white overflow-hidden flex items-center justify-center p-1.5 transition-shadow"
          >
            <img
              src={item.imageUrl}
              alt={item.productName}
              className="w-full h-full object-cover rounded-xl"
              crossOrigin="anonymous"
            />
            {/* Trail Sparkle Icon in Corner */}
            <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-tech-dark w-5 h-5 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-white fill-white animate-spin" />
            </div>
          </div>
        ))}

        {/* 2. Impact Sparkle Particles at the Cart Target */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'fixed',
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* 3. Sleek Floating Banner Notification upon Throw Success */}
      {activeToast && (
        <div className="fixed top-20 sm:top-24 inset-x-0 z-[999999] flex justify-center pointer-events-none px-4 animate-in slide-in-from-top-6 duration-300">
          <div className="bg-tech-dark/95 text-white border border-amber-500/50 shadow-[0_15px_35px_rgba(0,0,0,0.5)] px-4 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md max-w-md w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{activeToast.name}</span>
              </div>
              <div className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1 mt-0.5">
                <span>تم إلقاؤه في السلة بنجاح</span>
                <span>•</span>
                <span className="font-mono text-emerald-300">{activeToast.style}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
