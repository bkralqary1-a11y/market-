import { useState, useEffect } from 'react';

export default function Ambient3DBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 28;
      const y = (e.clientY / innerHeight - 0.5) * 28;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Top-Right Sapphire Refraction Light Pool */}
      <div
        className="absolute -top-36 -right-24 w-[40rem] h-[40rem] rounded-full blur-[110px] opacity-60 animate-liquid-drift"
        style={{
          background:
            'radial-gradient(circle, rgba(10, 132, 255, 0.34) 0%, rgba(56, 189, 248, 0.18) 45%, transparent 72%)',
          transform: `translate3d(${mousePos.x * 1.1}px, ${mousePos.y * 1.1}px, 0)`,
        }}
      />

      {/* Mid-Left Cool Cyan-Pearl Specular Bloom */}
      <div
        className="absolute top-[28%] -left-32 w-[38rem] h-[38rem] rounded-full blur-[115px] opacity-55 animate-liquid-drift-reverse"
        style={{
          background:
            'radial-gradient(circle, rgba(56, 189, 248, 0.30) 0%, rgba(99, 102, 241, 0.14) 50%, transparent 72%)',
          transform: `translate3d(${-mousePos.x * 1.2}px, ${-mousePos.y * 1.2}px, 0)`,
        }}
      />

      {/* Lower-Center Trust Indigo & Ice Aqua Caustic */}
      <div
        className="absolute bottom-[-14rem] left-[28%] w-[44rem] h-[44rem] rounded-full blur-[120px] opacity-50 animate-liquid-drift"
        style={{
          background:
            'radial-gradient(circle, rgba(0, 113, 227, 0.24) 0%, rgba(14, 165, 233, 0.16) 48%, transparent 72%)',
          transform: `translate3d(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px, 0)`,
        }}
      />

      {/* Subtle Crisp Architectural Specular Light Beam */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(rgba(0, 113, 227, 0.09) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 20%, black 25%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 65% at 50% 20%, black 25%, transparent 80%)',
        }}
      />
    </div>
  );
}
