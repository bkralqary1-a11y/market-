import { useState, useRef, type ReactNode, type MouseEvent } from 'react';
import { soundFX } from '../utils/audioEffects';

interface Tilt3DProps {
  key?: string | number;
  children: ReactNode;
  className?: string;
  maxAngle?: number;
  scale?: number;
  enableGlare?: boolean;
  enableSound?: boolean;
  depth?: number;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export default function Tilt3D({
  children,
  className = '',
  maxAngle = 16,
  scale = 1.035,
  enableGlare = true,
  enableSound = false,
  depth = 32,
  onClick,
}: Tilt3DProps) {
  const [transform, setTransform] = useState<string>(
    'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [boxShadow, setBoxShadow] = useState<string>('0 10px 25px -5px rgba(0, 0, 0, 0.05)');
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    const rotateX = -percentY * maxAngle;
    const rotateY = percentX * maxAngle;

    setTransform(
      `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(${depth}px)`
    );

    // Dynamic directional 3D shadow based on tilt
    const shadowX = -rotateY * 1.5;
    const shadowY = rotateX * 1.5 + 15;
    setBoxShadow(
      `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 32px -8px rgba(249, 115, 22, 0.18), 0 20px 25px -5px rgba(0, 0, 0, 0.1)`
    );

    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (enableSound) {
      soundFX.playHover();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)');
    setBoxShadow('0 10px 25px -5px rgba(0, 0, 0, 0.05)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform,
        boxShadow,
        transformStyle: 'preserve-3d',
        transition: isHovered
          ? 'transform 80ms ease-out, box-shadow 80ms ease-out'
          : 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 500ms ease',
      }}
      className={`relative transform-gpu will-change-transform rounded-2xl ${className}`}
    >
      {/* Child Content */}
      <div className="w-full h-full transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {/* Dynamic 3D Glare / Light Reflection Sheen */}
      {enableGlare && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden z-30 transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.15) 40%, transparent 65%)`,
          }}
        />
      )}
    </div>
  );
}
