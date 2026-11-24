import { useState } from 'react';
import { Copy, Check, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types';

interface PaymentPointsSectionProps {
  language: Language;
}

interface PaymentItem {
  id: string;
  nameAr: string;
  nameEn: string;
  number: string;
  accentHex: string;
  featured?: boolean;
}

const PAYMENT_ITEMS: PaymentItem[] = [
  { id: 'jaib', nameAr: 'جيب', nameEn: 'Jaib', number: '564992', accentHex: '#ef4444', featured: true },
  { id: 'jawali', nameAr: 'جوّالي', nameEn: 'Jawali', number: '934373', accentHex: '#3b82f6', featured: true },
  { id: 'kuraimi', nameAr: 'الكريمي حاسب', nameEn: 'Al-Kuraimi', number: '1420180', accentHex: '#a855f7' },
  { id: 'onecash', nameAr: 'وان كاش', nameEn: 'One Cash', number: '166756', accentHex: '#f97316' },
  { id: 'cash', nameAr: 'كاش', nameEn: 'Cash', number: '032632', accentHex: '#10b981' },
  { id: 'yemenwallet', nameAr: 'يمن ولت', nameEn: 'Yemen Wallet', number: '774102030', accentHex: '#84cc16' },
  { id: 'floosak', nameAr: 'فلوسك', nameEn: 'Floosak', number: '455542', accentHex: '#0ea5e9' },
  { id: 'mobilemoney', nameAr: 'موبايل موني', nameEn: 'Mobile Money', number: '926990', accentHex: '#2563eb' },
  { id: 'banky', nameAr: 'بنكي لايت', nameEn: 'Banky Lite', number: '671581', accentHex: '#06b6d4' },
];

export default function PaymentPointsSection({ language }: PaymentPointsSectionProps) {
  const isAr = language === 'ar';
  const [showAll, setShowAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2000);
  };

  const fallbackCopy = (text: string, successMsg: string, id: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      showToast(successMsg);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      showToast(isAr ? 'يرجى نسخ الرقم يدوياً' : 'Please copy manually');
    }
    document.body.removeChild(textarea);
  };

  const handleCopy = (text: string, successMsg: string, id: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedId(id);
          showToast(successMsg);
          setTimeout(() => setCopiedId(null), 1600);
        })
        .catch(() => fallbackCopy(text, successMsg, id));
    } else {
      fallbackCopy(text, successMsg, id);
    }
  };

  const visibleItems = showAll ? PAYMENT_ITEMS : PAYMENT_ITEMS.filter((item) => item.featured);
  const hiddenCount = PAYMENT_ITEMS.length - 2;

  return (
    <section className="py-3.5 sm:py-4 border-b border-white/10 relative" id="payment-points">
      <div className="px-4 sm:px-6 relative z-10">
        {/* Compact Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <h3 className="text-xs font-extrabold text-white tracking-tight">
              {isAr ? 'المحافظ الإلكترونية (اضغط للنسخ)' : 'E-Wallets (Tap to copy)'}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-[11px] font-bold text-sky-300 flex items-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <span>
              {showAll
                ? isAr
                  ? 'إخفاء البقية'
                  : 'Show Less'
                : isAr
                ? `إظهار الكل (+${hiddenCount})`
                : `Show All (+${hiddenCount})`}
            </span>
            {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Compact Wallet Tiles: Only Jaib & Jawali visible by default */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {visibleItems.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  handleCopy(
                    item.number,
                    isAr ? `تم نسخ رقم ${item.nameAr}: ${item.number}` : `Copied ${item.nameEn}`,
                    item.id
                  )
                }
                className="group relative rounded-xl px-2.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 hover:border-sky-300/40 transition-all active:scale-95 cursor-pointer select-none overflow-hidden flex items-center justify-between gap-2 text-right rtl:text-right ltr:text-left"
                title={isAr ? `اضغط لنسخ رقم ${item.nameAr}` : `Tap to copy ${item.nameEn}`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.accentHex }}
                  />
                  <span className="font-bold text-[11px] text-white truncate">
                    {isAr ? item.nameAr : item.nameEn}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 bg-slate-950/50 px-2 py-0.5 rounded-lg border border-white/10">
                  <span
                    className="font-mono tabular-nums font-bold text-[11px] text-sky-200 tracking-wide"
                    dir="ltr"
                  >
                    {item.number}
                  </span>
                  {isCopied ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 text-slate-400 group-hover:text-white shrink-0" />
                  )}
                </div>

                {isCopied && (
                  <div className="absolute inset-0 bg-emerald-600/90 flex items-center justify-center rounded-xl">
                    <span className="text-white text-[10px] font-extrabold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {isAr ? 'تم النسخ' : 'Copied'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Compact Transfer Row shown only when expanded */}
        {showAll && (
          <div className="mt-2.5 bg-white/[0.05] border border-white/12 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    '774102030',
                    isAr ? 'تم نسخ رقم الحوالات (774102030)' : 'Copied transfer number',
                    'hawalat-num'
                  )
                }
                className="bg-white/[0.07] hover:bg-white/[0.14] rounded-lg px-2.5 py-1 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-slate-300">{isAr ? 'حوالات:' : 'Transfer:'}</span>
                <span className="font-mono font-bold text-sky-300" dir="ltr">
                  774102030
                </span>
                <Copy className="w-2.5 h-2.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    'صدام علي علي العقاري',
                    isAr ? 'تم نسخ الاسم الرباعي' : 'Copied name',
                    'hawalat-name'
                  )
                }
                className="bg-white/[0.07] hover:bg-white/[0.14] rounded-lg px-2.5 py-1 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="font-bold text-white">صدام علي علي العقاري</span>
                <Copy className="w-2.5 h-2.5 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-0 z-[999999] flex justify-center pointer-events-none px-4">
          <div className="liquid-glass-dark text-white border border-emerald-400/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </section>
  );
}
