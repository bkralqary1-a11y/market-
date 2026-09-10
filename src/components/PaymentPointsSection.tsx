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
  icon: string;
  number: string;
  bgHex: string;
  textColorHex: string;
}

const PAYMENT_ITEMS: PaymentItem[] = [
  {
    id: 'jawali',
    nameAr: 'جوّالي',
    nameEn: 'Jawali',
    labelEn: 'JAWALI',
    icon: '📱',
    number: '934373',
    bgHex: '#1e3a8a',
    textColorHex: '#1e3a8a',
  },
  {
    id: 'kuraimi',
    nameAr: 'الكريمي حاسب',
    nameEn: 'Al-Kuraimi',
    labelEn: 'ALKURAIMI',
    icon: '💜',
    number: '1420180',
    bgHex: '#6b2c91',
    textColorHex: '#6b2c91',
  },
  {
    id: 'jaib',
    nameAr: 'جيب',
    nameEn: 'Jaib',
    labelEn: 'JAIB',
    icon: '🔴',
    number: '564992',
    bgHex: '#dc2626',
    textColorHex: '#dc2626',
  },
  {
    id: 'onecash',
    nameAr: 'وان كاش',
    nameEn: 'One Cash',
    labelEn: 'One Cash',
    icon: '🟠',
    number: '166756',
    bgHex: '#f26522',
    textColorHex: '#f26522',
  },
  {
    id: 'cash',
    nameAr: 'كاش',
    nameEn: 'Cash',
    labelEn: 'CASH',
    icon: '💚',
    number: '032632',
    bgHex: '#059669',
    textColorHex: '#059669',
  },
  {
    id: 'yemenwallet',
    nameAr: 'يمن ولت',
    nameEn: 'Yemen Wallet',
    labelEn: 'Yemen Wallet',
    icon: '🟢',
    number: '774102030',
    bgHex: '#65a30d',
    textColorHex: '#65a30d',
  },
  {
    id: 'floosak',
    nameAr: 'فلوسك',
    nameEn: 'Floosak',
    labelEn: 'Floosak',
    icon: '🔵',
    number: '455542',
    bgHex: '#0ea5e9',
    textColorHex: '#0ea5e9',
  },
  {
    id: 'mobilemoney',
    nameAr: 'موبايل موني',
    nameEn: 'Mobile Money',
    labelEn: 'Mobile Money',
    icon: '💳',
    number: '926990',
    bgHex: '#1e40af',
    textColorHex: '#1e40af',
  },
  {
    id: 'banky',
    nameAr: 'بنكي لايت',
    nameEn: 'Banky Lite',
    labelEn: 'BANKY',
    icon: '🏦',
    number: '671581',
    bgHex: '#0369a1',
    textColorHex: '#0369a1',
  },
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

  const handleCopy = (text: string, successMsg: string, id: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        showToast(successMsg);
        setTimeout(() => setCopiedId(null), 1800);
      }).catch(() => {
        fallbackCopy(text, successMsg, id);
      });
    } else {
      fallbackCopy(text, successMsg, id);
    }
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

  const handleCopyFullTransfer = () => {
    const transferText = 'صدام علي علي العقاري\n774102030';
    handleCopy(
      transferText,
      isAr ? 'تم نسخ بيانات الحوالة كاملة (الاسم + الرقم)' : 'Transfer details copied successfully',
      'full-transfer'
    );
  };

  return (
    <section className="bg-tech-dark/95 text-white py-6 sm:py-8 border-t border-white/10 relative overflow-hidden" id="payment-points">
      {/* Background ambient subtle glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {isAr ? 'نقاط الدفع الإلكتروني المعتمدة' : 'Official Payment Points'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {isAr ? 'مربعات مصغرة سريعة - اضغط على أي رقم لنسخه فوراً' : 'Click any box or number to copy account number instantly'}
              </p>
            </div>
          </div>

          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
            {isAr ? 'نسخ تلقائي بنقرة واحدة' : 'One-click copy'}
          </span>
        </div>

        {/* 9 Mini Payment Cards Grid - Very Small and Compact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {PAYMENT_ITEMS.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleCopy(item.number, isAr ? `تم نسخ رقم ${item.nameAr}: ${item.number}` : `Copied ${item.nameEn}`, item.id)}
                style={{ backgroundColor: item.bgHex }}
                className="group relative rounded-xl p-2 sm:p-2.5 text-white shadow-xs hover:shadow-md transition-all duration-150 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-white/20 select-none overflow-hidden flex flex-col justify-between"
                title={isAr ? `اضغط لنسخ رقم ${item.nameAr}` : `Click to copy ${item.nameEn}`}
              >
                {/* Top subtle highlight */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-white/30" />

                {/* Card Title & Icon - Mini Header */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm shrink-0">{item.icon}</span>
                    <span className="font-extrabold text-[11px] sm:text-xs text-white truncate leading-none">
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                  </div>
                  <span className="text-[8px] text-white/75 font-mono hidden xl:inline-block uppercase">
                    {item.labelEn}
                  </span>
                </div>

                {/* Compact White Number Box with Copy Icon */}
                <div className="bg-white/95 group-hover:bg-white rounded-lg px-2 py-1 flex items-center justify-between shadow-xs gap-1 transition-colors">
                  <span
                    className="font-mono font-black text-xs sm:text-sm tracking-wider text-center flex-1"
                    style={{ color: item.textColorHex }}
                    dir="ltr"
                  >
                    {item.number}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item.number, isAr ? `تم نسخ رقم ${item.nameAr}: ${item.number}` : `Copied ${item.nameEn}`, item.id);
                    }}
                    className="p-0.5 rounded text-gray-500 hover:text-gray-900 transition-colors shrink-0 cursor-pointer"
                    title={isAr ? 'نسخ' : 'Copy'}
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Copied Overlay Badge */}
                {isCopied && (
                  <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-xs flex items-center justify-center rounded-xl animate-in fade-in duration-100">
                    <span className="text-white text-[10px] font-black flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {isAr ? 'تم النسخ!' : 'Copied!'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Compact Transfer Section (حوالات : 774102030 - صدام علي علي العقاري) */}
        <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Hawalat Number & Name in compact row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 w-full lg:w-auto text-xs">
              {/* Number */}
              <div
                onClick={() => handleCopy('774102030', isAr ? 'تم نسخ رقم الحوالات (774102030)' : 'Copied transfer number', 'hawalat-num')}
                className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors group"
                title={isAr ? 'اضغط لنسخ رقم الحوالات' : 'Copy transfer number'}
              >
                <span className="text-[10px] text-gray-400 font-semibold">{isAr ? 'رقم الحوالات:' : 'Transfer No:'}</span>
                <span className="font-mono font-black text-amber-400 text-sm tracking-wider" dir="ltr">
                  774102030
                </span>
                {copiedId === 'hawalat-num' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400 group-hover:text-white" />
                )}
              </div>

              {/* Name */}
              <div
                onClick={() => handleCopy('صدام علي علي العقاري', isAr ? 'تم نسخ الاسم الرباعي' : 'Copied recipient name', 'hawalat-name')}
                className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors group"
                title={isAr ? 'اضغط لنسخ الاسم' : 'Copy recipient name'}
              >
                <span className="text-[10px] text-gray-400 font-semibold">{isAr ? 'الاسم الرباعي:' : 'Recipient:'}</span>
                <span className="font-bold text-white text-xs sm:text-sm">
                  صدام علي علي العقاري
                </span>
                {copiedId === 'hawalat-name' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400 group-hover:text-white" />
                )}
              </div>
            </div>

            {/* Actions & Hint */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
              <span className="text-[10px] text-gray-400 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isAr ? 'النجم، الامتياز، يمن إكسبرس' : 'All local networks'}</span>
              </span>

              <button
                type="button"
                onClick={handleCopyFullTransfer}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {copiedId === 'full-transfer' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? 'نسخ الاسم والرقم معاً' : 'Copy Name & Number'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-0 z-[999999] flex justify-center pointer-events-none px-4 animate-in slide-in-from-bottom-5 duration-150">
          <div className="bg-gray-900 text-white border border-emerald-500/50 shadow-xl px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </section>
  );
}
