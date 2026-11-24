import {
  ShieldCheck,
  Plus,
  Settings,
  LogOut,
  Eye,
  CloudUpload,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface AdminFloatingBarProps {
  adminEmail: string;
  needsInitialSeed: boolean;
  seeding: boolean;
  toastMessage: string | null;
  onAddNewProduct: () => void;
  onOpenStoreSettings: () => void;
  onSeedCloud: () => void;
  onExitEditMode: () => void;
  onSignOut: () => void;
}

export default function AdminFloatingBar({
  needsInitialSeed,
  seeding,
  toastMessage,
  onAddNewProduct,
  onOpenStoreSettings,
  onSeedCloud,
  onExitEditMode,
  onSignOut,
}: AdminFloatingBarProps) {
  return (
    <div dir="rtl" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[950] w-[96%] max-w-4xl">
      {toastMessage && (
        <div className="mb-2 mx-auto w-fit px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-extrabold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="liquid-glass-dark rounded-[26px] px-3.5 sm:px-5 py-2.5 sm:py-3 border border-sky-400/40 shadow-2xl flex flex-wrap items-center justify-between gap-2.5 text-white">
        {/* Admin Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-sky-500/25 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>وضع التعديل المباشر للمتجر</span>
            </div>
            <div className="text-[10px] text-sky-200/80 font-bold truncate">
              جلسة مالك موثّقة ومشفّرة
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {needsInitialSeed && (
            <button
              type="button"
              onClick={onSeedCloud}
              disabled={seeding}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-60"
            >
              {seeding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5" />
              )}
              <span>حفظ بيانات المتجر بالسحابة</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddNewProduct}
            className="px-3 py-2 rounded-xl liquid-btn-primary text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>منتج جديد</span>
          </button>

          <button
            type="button"
            onClick={onOpenStoreSettings}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-sky-300" />
            <span>الإعدادات والأرقام</span>
          </button>

          <button
            type="button"
            onClick={onExitEditMode}
            className="px-3 py-2 rounded-xl bg-white/12 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title="معاينة المتجر كعميل"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">معاينة كعميل</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="px-2.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/30 text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            title="تسجيل الخروج نهائياً"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
