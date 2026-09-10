interface WaveDividerProps {
  variant?: 'cyan-orange' | 'orange-gold' | 'sky-cyan' | 'gray-subtle';
  flip?: boolean;
  className?: string;
}

export default function WaveDivider({
  variant = 'cyan-orange',
  flip = false,
  className = '',
}: WaveDividerProps) {
  const getGradients = () => {
    switch (variant) {
      case 'cyan-orange':
        return {
          id: 'waveGradCyanOrange',
          stop1: '#0284c7',
          stop2: '#f97316',
          stop3: '#06b6d4',
        };
      case 'orange-gold':
        return {
          id: 'waveGradOrangeGold',
          stop1: '#ea580c',
          stop2: '#f59e0b',
          stop3: '#d97706',
        };
      case 'sky-cyan':
        return {
          id: 'waveGradSkyCyan',
          stop1: '#0284c7',
          stop2: '#38bdf8',
          stop3: '#0ea5e9',
        };
      case 'gray-subtle':
      default:
        return {
          id: 'waveGradGray',
          stop1: '#e2e8f0',
          stop2: '#cbd5e1',
          stop3: '#f1f5f9',
        };
    }
  };

  const g = getGradients();

  return (
    <div
      className={`relative w-full overflow-hidden leading-none select-none pointer-events-none ${
        flip ? 'rotate-180 -scale-x-100' : ''
      } ${className}`}
      style={{ height: '52px' }}
    >
      {/* Background 3D Wave Layer (Slow Flow) */}
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-35 animate-wave-reverse"
      >
        <path
          d="M0,0 C150,90 350,-40 500,60 C650,160 900,-20 1200,40 L1200,120 L0,120 Z"
          fill={g.stop1}
          opacity="0.25"
        />
      </svg>

      {/* Foreground 3D Wave Ribbon (Dynamic Gradient) */}
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-full opacity-60 animate-wave-flow"
      >
        <defs>
          <linearGradient id={g.id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={g.stop1} stopOpacity="0.4" />
            <stop offset="50%" stopColor={g.stop2} stopOpacity="0.6" />
            <stop offset="100%" stopColor={g.stop3} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d="M0,30 C200,100 450,10 650,75 C850,140 1050,20 1200,65 L1200,120 L0,120 Z"
          fill={`url(#${g.id})`}
        />
      </svg>
    </div>
  );
}
