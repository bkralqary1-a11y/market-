import { useState, useEffect } from 'react';

export default function Ambient3DBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 50;
      const y = (e.clientY / innerHeight - 0.5) * 50;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 3D Parallax Orb 1 - Sky Cyan */}
      <div
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-cyan-400/10 blur-3xl transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 1.8}px, ${mousePos.y * 1.8}px, 40px)`,
        }}
      />

      {/* 3D Parallax Orb 2 - Primary Tech Orange */}
      <div
        className="absolute top-1/3 -right-32 w-[36rem] h-[36rem] rounded-full bg-orange-500/8 blur-3xl transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${-mousePos.x * 2.2}px, ${-mousePos.y * 2.2}px, 60px)`,
        }}
      />

      {/* 3D Parallax Orb 3 - Deep Amber / Gold */}
      <div
        className="absolute -bottom-32 left-1/4 w-[34rem] h-[34rem] rounded-full bg-amber-400/8 blur-3xl transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 2.5}px, ${mousePos.y * 2.5}px, 50px)`,
        }}
      />

      {/* Animated 3D Wave Ribbon 1 - Top/Mid Flow */}
      <div
        className="absolute top-1/4 -left-1/4 w-[160%] h-48 opacity-25 animate-wave-flow pointer-events-none"
        style={{
          transform: `perspective(800px) rotateX(${15 + mousePos.y * 0.5}deg) rotateZ(-6deg)`,
        }}
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGrad1)"
            d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,213.3C672,213,768,171,864,165.3C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Animated 3D Wave Ribbon 2 - Mid/Bottom Counter Flow */}
      <div
        className="absolute top-2/3 -right-1/4 w-[160%] h-56 opacity-20 animate-wave-reverse pointer-events-none"
        style={{
          transform: `perspective(800px) rotateX(${-12 + mousePos.y * 0.4}deg) rotateZ(4deg)`,
        }}
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGrad2)"
            d="M0,64L48,96C96,128,192,192,288,202.7C384,213,480,171,576,144C672,117,768,107,864,128C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Concentric 3D Expanding Water Ripple Rings (Top Right) */}
      <div
        className="absolute top-24 right-1/4 w-72 h-72 pointer-events-none opacity-40"
        style={{
          transform: `perspective(600px) rotateX(${40 + mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        }}
      >
        <div className="absolute inset-0 rounded-full border border-orange-400/40 animate-ripple-ring" />
        <div
          className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ripple-ring"
          style={{ animationDelay: '1.4s' }}
        />
        <div
          className="absolute inset-0 rounded-full border border-orange-500/30 animate-ripple-ring"
          style={{ animationDelay: '2.8s' }}
        />
      </div>

      {/* Floating 3D Cyber Holographic Crystals */}
      <div
        className="absolute top-36 right-16 w-20 h-20 border-2 border-orange-400/30 rounded-3xl opacity-40 animate-float-3d shadow-lg shadow-orange-500/10"
        style={{
          transform: `perspective(600px) rotateX(${mousePos.y * 2}deg) rotateY(${mousePos.x * 2}deg)`,
        }}
      />

      <div
        className="absolute top-1/2 left-12 w-16 h-16 border-2 border-cyan-400/30 rounded-2xl opacity-35 animate-float-3d"
        style={{
          animationDelay: '-3s',
          transform: `perspective(600px) rotateX(${-mousePos.y * 2.5}deg) rotateY(${-mousePos.x * 2.5}deg)`,
        }}
      />

      <div
        className="absolute bottom-48 right-24 w-24 h-24 border border-amber-400/30 rounded-full opacity-30 animate-float-3d"
        style={{
          animationDelay: '-6s',
          transform: `perspective(600px) rotateX(${mousePos.y * 1.5}deg) rotateY(${-mousePos.x * 1.5}deg)`,
        }}
      />
    </div>
  );
}
