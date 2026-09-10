import { ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface BrandTickerProps {
  language: Language;
}

export default function BrandTicker({ language }: BrandTickerProps) {
  const isAr = language === 'ar';

  const techBrands = [
    { name: 'Apple Authorized', logo: ' Apple' },
    { name: 'Samsung Galaxy', logo: 'SAMSUNG' },
    { name: 'Anker GaNPrime', logo: 'ANKER' },
    { name: 'Sony Hi-Res Audio', logo: 'SONY' },
    { name: 'Belkin Certified', logo: 'belkin' },
    { name: 'Spigen Protection', logo: 'spigen' },
    { name: 'Baseus QuickCharge', logo: 'BASEUS' },
  ];

  return (
    <div id="brands-ticker-section" className="bg-tech-dark text-white py-6 border-b border-white/10 overflow-hidden">
      <div className="container mx-auto px-4 mb-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>{isAr ? 'موزع معتمد لأكبر الشركات العالمية:' : 'Authorized Distributor & Flagship Partner:'}</span>
        </div>
        <span className="text-gray-400 hidden sm:inline text-[11px]">
          {isAr ? 'ضمان رسمي محلي سنتين لجميع الأجهزة' : 'Official 2-Year Authorized GCC Warranty'}
        </span>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-6 overflow-x-auto scrollbar-none py-1">
          {techBrands.map((brand, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all shrink-0 cursor-default"
            >
              <span className="font-mono font-black text-sm tracking-wider text-white">
                {brand.logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
