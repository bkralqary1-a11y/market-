import { Plus } from 'lucide-react';
import { Language } from '../types';

interface AddProductTileProps {
  language: Language;
  onClick: () => void;
}

export default function AddProductTile({ language, onClick }: AddProductTileProps) {
  const isAr = language === 'ar';

  return (
    <article className="relative h-full w-full min-w-0">
      <button
        type="button"
        onClick={onClick}
        className="group w-full h-full min-h-[310px] sm:min-h-[360px] rounded-[26px] border-2 border-dashed border-[#0071e3]/55 bg-white/55 hover:bg-white/85 backdrop-blur-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-3.5 transition-all duration-300 hover:border-[#0071e3] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] liquid-btn-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Plus className="w-9 h-9 sm:w-11 sm:h-11 text-white stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <span className="block text-sm sm:text-base font-extrabold text-[#0b1220] group-hover:text-[#0071e3] transition-colors">
            {isAr ? 'إضافة منتج جديد' : 'Add New Product'}
          </span>
          <span className="block text-[11px] sm:text-xs text-slate-600 leading-relaxed max-w-[180px] mx-auto">
            {isAr
              ? 'اضغط لإضافة الصورة، السعر، نسبة الخصم، الألوان والمواصفات'
              : 'Click to add photo, price, discount, colors & specs'}
          </span>
        </div>
      </button>
    </article>
  );
}
