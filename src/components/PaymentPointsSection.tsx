import { useState } from 'react';
import { Copy, Check, ShieldCheck, Wallet } from 'lucide-react';
import { Language } from '../types';

interface PaymentPointsSectionProps {
  language: Language;
}

interface PaymentItem {
  id: string;
  nameAr: string;
  nameEn: string;
  labelEn: string;
  number: string;
  accentHex: string;
}

const PAYMENT_ITEMS: PaymentItem[] = [
  { id: 'jawali', nameAr: 'جوّالي', nameEn: 'Jawali', labelEn: 'JAWALI', number: '934373', accentHex: '#3b82f6' },
  { id: 'kuraimi', nameAr: 'الكريمي حاسب', nameEn: 'Al-Kuraimi', labelEn: 'ALKURAIMI', number: '1420180', accentHex: '#a855f7' },
  { id: 'jaib', nameAr: 'جيب', nameEn: 'Jaib', labelEn: 'JAIB', number: '564992', accentHex: '#ef4444' },
  { id: 'onecash', nameAr: 'وان كاش', nameEn: 'One Cash', labelEn: 'ONECASH', number: '166756', accentHex: '#f97316' },
  { id: 'cash', nameAr: 'كاش', nameEn: 'Cash', labelEn: 'CASH', number: '032632', accentHex: '#10b981' },
  { id: 'yemenwallet', nameAr: 'يمن ولت', nameEn: 'Yemen Wallet', labelEn: 'YEMEN WALLET', number: '774102030', accentHex: '#84cc16' },
  { id: 'floosak', nameAr: 'فلوسك', nameEn: 'Floosak', labelEn: 'FLOOSAK', number: '455542', accentHex: '#0ea5e9' },
  { id: 'mobilemoney', nameAr: 'موبايل موني', nameEn: 'Mobile Money', labelEn: 'MOBILE MONEY', number: '926990', accentHex: '#2563eb' },
  { id: 'banky', nameAr: 'بنكي لايت', nameEn: 'Banky Lite', labelEn: 'BANKY', number: '671581', accentHex: '#06b6d4' },
];

export default function PaymentPointsSection({ language }: PaymentPointsSectionProps) {
  const isAr = language === 'ar';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2200);
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
      setTimeout(() => setCopiedId(null), 1800);
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
          setTimeout(() => setCopiedId(null), 1800);
        })
        .catch(() => fallbackCopy(text, successMsg, id));
    } else {
      fallbackCopy(text, successMsg, id);
    }
  };

  const handleCopyFullTransfer = () => {
    handleCopy(
      'صدام علي علي العقاري\n774102030',
      isAr ? 'تم نسخ بيانات الحوالة كاملة (الاسم + الرقم)' : 'Transfer details copied successfully',
      'full-transfer'
    );
  };

  return (
    <section
      className="py-7 sm:py-9 border-b border-white/10 relative overflow-hidden"
      id="payment-points"
    >
      {/* Subtle Sapphire Refraction */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/15 text-sky-300 flex items-center justify-center border border-sky-400/25 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {isAr ? 'نقاط الدفع الإلكتروني المعتمدة' : 'Official Payment Points'}
              </h3>
              <p className="text-[11px] text-slate-300/80">
                {isAr
                  ? 'اضغط على أي محفظة أو حساب لنسخ الرقم فوراً بنقرة واحدة'
                  : 'Tap any payment wallet to copy the account number instantly'}
              </p>
            </div>
          </div>

          <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'حسابات رسمية معتمدة · نسخ فوري' : 'Verified Official Accounts · Instant Copy'}</span>
          </span>
        </div>

        {/* 9 Liquid Glass Payment Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {PAYMENT_ITEMS.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() =>
                  handleCopy(
                    item.number,
                    isAr ? `تم نسخ رقم ${item.nameAr}: ${item.number}` : `Copied ${item.nameEn}`,
                    item.id
                  )
                }
                className="group relative rounded-2xl p-3 bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl border border-white/15 hover:border-sky-300/45 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer select-none overflow-hidden flex flex-col justify-between"
                title={isAr ? `اضغط لنسخ رقم ${item.nameAr}` : `Click to copy ${item.nameEn}`}
              >
                {/* Top specular edge colored lightly by provider */}
                <div
                  className="absolute top-0 inset-x-0 h-[2px] opacity-80"
                  style={{ background: `linear-gradient(90deg, transparent, ${item.accentHex}, transparent)` }}
                />

                {/* Title Row */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/20"
                      style={{ backgroundColor: item.accentHex }}
                    />
                    <span className="font-extrabold text-xs text-white truncate leading-none">
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono hidden xl:inline-block uppercase tracking-wider">
                    {item.labelEn}
                  </span>
                </div>

                {/* Translucent Account Number Strip */}
                <div className="bg-slate-950/55 group-hover:bg-slate-950/75 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1.5 transition-colors">
                  <span
                    className="font-mono tabular-nums font-black text-xs sm:text-sm tracking-wider text-sky-100 flex-1 text-center"
                    dir="ltr"
                  >
                    {item.number}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(
                        item.number,
                        isAr ? `تم نسخ رقم ${item.nameAr}: ${item.number}` : `Copied ${item.nameEn}`,
                        item.id
                      );
                    }}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                    title={isAr ? 'نسخ' : 'Copy'}
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Copied Overlay */}
                {isCopied && (
                  <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-md flex items-center justify-center rounded-2xl">
                    <span className="text-white text-xs font-extrabold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {isAr ? 'تم النسخ!' : 'Copied!'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hawalat Liquid Glass Strip */}
        <div className="mt-4 bg-white/[0.06] border border-white/15 rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 w-full lg:w-auto text-xs">
              {/* Transfer Number */}
              <div
                onClick={() =>
                  handleCopy(
                    '774102030',
                    isAr ? 'تم نسخ رقم الحوالات (774102030)' : 'Copied transfer number',
                    'hawalat-num'
                  )
                }
                className="bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 rounded-xl px-3.5 py-2 flex items-center gap-2 cursor-pointer transition-colors group"
                title={isAr ? 'اضغط لنسخ رقم الحوالات' : 'Copy transfer number'}
              >
                <span className="text-[11px] text-slate-300 font-semibold">
                  {isAr ? 'رقم الحوالات:' : 'Transfer No:'}
                </span>
                <span className="font-mono tabular-nums font-black text-sky-300 text-sm tracking-wider" dir="ltr">
                  774102030
                </span>
                {copiedId === 'hawalat-num' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 group-hover:text-white" />
                )}
              </div>

              {/* Recipient Name */}
              <div
                onClick={() =>
                  handleCopy(
                    'صدام علي علي العقاري',
                    isAr ? 'تم نسخ الاسم الرباعي' : 'Copied recipient name',
                    'hawalat-name'
                  )
                }
                className="bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 rounded-xl px-3.5 py-2 flex items-center gap-2 cursor-pointer transition-colors group"
                title={isAr ? 'اضغط لنسخ الاسم' : 'Copy recipient name'}
              >
                <span className="text-[11px] text-slate-300 font-semibold">
                  {isAr ? 'الاسم الرباعي:' : 'Recipient:'}
                </span>
                <span className="font-bold text-white text-xs sm:text-sm">صدام علي علي العقاري</span>
                {copiedId === 'hawalat-name' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 group-hover:text-white" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <span className="text-[11px] text-slate-300 hidden sm:inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isAr ? 'النجم، الامتياز، يمن إكسبرس' : 'All local transfer networks'}</span>
              </span>

              <button
                type="button"
                onClick={handleCopyFullTransfer}
                className="liquid-btn-primary font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
              >
                {copiedId === 'full-transfer' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نسخ الاسم والرقم معاً' : 'Copy Name & Number'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liquid Glass Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-0 z-[999999] flex justify-center pointer-events-none px-4">
          <div className="liquid-glass-dark text-white border border-emerald-400/40 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </section>
  );
}
