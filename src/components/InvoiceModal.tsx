import { useState, useId } from 'react';
import {
  X,
  User,
  PhoneCall,
  Plus,
  Minus,
  Trash2,
  Download,
  MessageSquare,
  CheckCircle2,
  Printer,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  Smartphone,
  Zap,
  Headphones,
  Cable,
  Receipt,
} from 'lucide-react';
import { CartItem, CategoryId } from '../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart?: () => void;
  onBrowseProducts?: () => void;
  onSelectCategory?: (category: CategoryId) => void;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onBrowseProducts,
  onSelectCategory,
}: InvoiceModalProps) {
  const modalId = useId();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isWhatsAppPopupOpen, setIsWhatsAppPopupOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleBrowse = () => {
    onClose();
    if (onBrowseProducts) {
      onBrowseProducts();
    }
  };

  const handleCategoryClick = (catId: CategoryId) => {
    onClose();
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else if (onBrowseProducts) {
      onBrowseProducts();
    }
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const phoneDigits = customerPhone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length >= 9;

  const buildWhatsAppMessage = () => {
    let message = `السلام عليكم ورحمة الله وبركاته،\n`;
    message += `أود تأكيد طلب جديد من *متجر صدام العقاري*:\n\n`;
    message += `📋 \`قائمة المشتريات:\`\n\n`;

    cart.forEach((item, index) => {
      const itemTotal = item.product.price * item.quantity;
      const itemName = item.product.nameAr || item.product.name;
      message += `${index + 1}. *${itemName}*\n`;
      message += `   - الكمية: ${item.quantity}\n`;
      message += `   - السعر: ${itemTotal.toLocaleString('en-US')} ريال\n\n`;
    });

    message += `💰 *المبلغ الإجمالي:* ${grandTotal.toLocaleString('en-US')} ريال\n`;
    message += `─────────────────\n`;
    message += `👤 *اسم المشتري:* ${customerName.trim() || 'عميل المتجر'}\n`;
    message += `📞 *رقم الهاتف للتواصل:* ${customerPhone.trim() || phoneDigits}\n`;
    message += `─────────────────\n`;
    message += `أرجو تأكيد الطلب وتزويدي بموعد التسليم. شكراً لكم!`;

    return message;
  };

  const handleDownloadInvoice = () => {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const currentDate = new Date().toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاتورة طلب #${invoiceNumber} - متجر صدام العقاري</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
    body { background-color: #eef4fc; color: #0b1220; padding: 24px; direction: rtl; }
    .invoice-box { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #dbe6f5; padding: 36px; box-shadow: 0 12px 32px rgba(9,17,36,0.08); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0071e3; padding-bottom: 20px; margin-bottom: 24px; }
    .store-title { font-size: 24px; font-weight: 900; color: #0071e3; }
    .store-subtitle { font-size: 13px; color: #52607a; margin-top: 4px; font-weight: 600; }
    .invoice-tag { text-align: left; }
    .invoice-label { font-size: 22px; font-weight: 900; color: #0b1220; }
    .invoice-num { font-size: 13px; font-family: monospace; color: #0071e3; font-weight: bold; }
    .date { font-size: 12px; color: #64748b; margin-top: 4px; }
    .customer-card { background: #f8fbff; border: 1px solid #dbe6f5; border-radius: 16px; padding: 16px 20px; margin-bottom: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .customer-label { font-size: 12px; font-weight: 700; color: #64748b; }
    .customer-val { font-size: 15px; font-weight: 800; color: #0b1220; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; overflow: hidden; border-radius: 14px; border: 1px solid #dbe6f5; }
    thead th { background: #091124; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 14px; text-align: center; }
    tbody td { padding: 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) { background: #f8fbff; }
    .item-name { text-align: right; font-weight: 700; color: #0b1220; }
    .total-banner { background: #eff6ff; border: 2px solid #0071e3; border-radius: 16px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .total-title { font-size: 17px; font-weight: 800; color: #091124; }
    .total-sum { font-size: 24px; font-weight: 900; color: #0071e3; font-family: monospace; }
    .footer { text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; color: #64748b; font-size: 12px; line-height: 1.6; }
    .official-seal { display: inline-block; padding: 6px 14px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 999px; color: #047857; font-weight: bold; font-size: 11px; margin-top: 12px; }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-box { box-shadow: none; border: none; padding: 10px; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <h1 class="store-title">متجر صدام العقاري</h1>
        <div class="store-subtitle">للهواتف الذكية ومستلزماتها الأصلية - اليمن</div>
      </div>
      <div class="invoice-tag">
        <div class="invoice-label">فاتورة مبيعات</div>
        <div class="invoice-num">#${invoiceNumber}</div>
        <div class="date">${currentDate}</div>
      </div>
    </div>

    <div class="customer-card">
      <div>
        <div class="customer-label">اسم المشتري:</div>
        <div class="customer-val">${customerName.trim() || 'عميل المتجر'}</div>
      </div>
      <div>
        <div class="customer-label">رقم الهاتف للتواصل:</div>
        <div class="customer-val" dir="ltr" style="text-align: right;">${customerPhone.trim() || 'غير محدد'}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 12%;">العدد</th>
          <th style="text-align: right; width: 48%;">الصنف</th>
          <th style="width: 20%;">السعر</th>
          <th style="width: 20%;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${cart
          .map(
            (item) => `
          <tr>
            <td style="font-weight: 800; font-family: monospace;">${item.quantity}</td>
            <td class="item-name">${item.product.nameAr || item.product.name}</td>
            <td style="font-family: monospace;">${item.product.price.toLocaleString('en-US')} ريال</td>
            <td style="font-weight: 800; font-family: monospace; color: #0071e3;">${(
              item.product.price * item.quantity
            ).toLocaleString('en-US')} ريال</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <div class="total-banner">
      <div class="total-title">المبلغ الإجمالي الكلي:</div>
      <div class="total-sum">${grandTotal.toLocaleString('en-US')} ريال</div>
    </div>

    <div class="footer">
      <div>أرجو تأكيد الطلب وتزويدي بموعد التسليم. شكراً لكم!</div>
      <div style="margin-top: 4px;">خدمة العملاء والمبيعات: 967777551485+ / 967774102030+</div>
      <div class="official-seal">فاتورة معتمدة صادرة من متجر صدام العقاري</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `فاتورة_متجر_صدام_العقاري_${invoiceNumber}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProceedOrder = () => {
    if (!isPhoneValid) {
      setValidationError('يرجى كتابة رقم العميل (9 أرقام على الأقل، مثل 77 أو 73 أو 71)');
      return;
    }

    setValidationError('');
    handleDownloadInvoice();
    setIsWhatsAppPopupOpen(true);
  };

  return (
    <div
      id={modalId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md overflow-y-auto"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg liquid-glass-dark rounded-[30px] p-5 sm:p-7 text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/12 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">الفاتورة</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-18 h-18 rounded-3xl liquid-btn-primary flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              سلة مشترياتك وفاتورتك فارغة حالياً
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-sm leading-relaxed">
              تصفح تشكيلتنا من أحدث الهواتف الذكية المعتمدة، الشواحن السريعة، والسماعات لإصدار فاتورتك الفورية وإرسالها عبر واتساب.
            </p>

            <button
              onClick={handleBrowse}
              className="liquid-btn-primary inline-flex items-center justify-center gap-2 font-extrabold text-sm px-7 py-3 rounded-2xl cursor-pointer mb-6"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>تصفح المنتجات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-full border-t border-white/10 pt-4 max-w-md">
              <span className="block text-xs font-bold text-slate-400 mb-2.5">
                أو تصفح مباشرة حسب القسم:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleCategoryClick('phones')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/8 hover:bg-sky-500/20 hover:text-sky-300 px-3 py-1.5 rounded-xl border border-white/12 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>الهواتف</span>
                </button>
                <button
                  onClick={() => handleCategoryClick('chargers')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/8 hover:bg-sky-500/20 hover:text-sky-300 px-3 py-1.5 rounded-xl border border-white/12 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>الشواحن</span>
                </button>
                <button
                  onClick={() => handleCategoryClick('audio')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/8 hover:bg-sky-500/20 hover:text-sky-300 px-3 py-1.5 rounded-xl border border-white/12 transition-colors cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-sky-400" />
                  <span>السماعات</span>
                </button>
                <button
                  onClick={() => handleCategoryClick('cables')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/8 hover:bg-sky-500/20 hover:text-sky-300 px-3 py-1.5 rounded-xl border border-white/12 transition-colors cursor-pointer"
                >
                  <Cable className="w-3.5 h-3.5 text-sky-400" />
                  <span>الكيابل</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Invoice Table */}
            <div className="border border-white/15 rounded-2xl overflow-hidden mb-4 bg-white/[0.04]">
              <div className="grid grid-cols-12 text-center text-xs font-extrabold text-slate-200 bg-white/[0.07] py-3 border-b border-white/12">
                <div className="col-span-2 border-l border-white/10 py-0.5">العدد</div>
                <div className="col-span-4 border-l border-white/10 py-0.5">الصنف</div>
                <div className="col-span-3 border-l border-white/10 py-0.5">السعر</div>
                <div className="col-span-3 py-0.5">الإجمالي</div>
              </div>

              <div className="divide-y divide-white/10 max-h-60 overflow-y-auto">
                {cart.map((item, index) => {
                  const itemTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 text-center text-xs sm:text-sm py-3 items-center hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="col-span-2 flex items-center justify-center gap-1 border-l border-white/10 px-1">
                        <button
                          onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                          className="w-5 h-5 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="font-mono tabular-nums font-bold text-white px-0.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="col-span-4 text-right px-2.5 border-l border-white/10">
                        <div className="font-bold text-white text-xs truncate" title={item.product.nameAr}>
                          {item.product.nameAr || item.product.name}
                        </div>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5 mt-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>حذف</span>
                        </button>
                      </div>

                      <div className="col-span-3 text-center border-l border-white/10 font-mono tabular-nums text-xs text-slate-300">
                        {item.product.price.toLocaleString('en-US')} ر.ي
                      </div>

                      <div className="col-span-3 text-center font-mono tabular-nums font-bold text-xs text-sky-300">
                        {itemTotal.toLocaleString('en-US')} ر.ي
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between px-4 py-3 mb-4 bg-white/[0.07] border border-white/15 rounded-2xl">
              <span className="text-sm sm:text-base font-extrabold text-white">الإجمالي الكلي:</span>
              <span className="text-base sm:text-lg font-black font-mono tabular-nums text-emerald-400">
                {grandTotal.toLocaleString('en-US')} ريال
              </span>
            </div>

            {/* Customer Name Input */}
            <div className="mb-3">
              <div className="flex items-center bg-white/[0.06] border border-white/15 focus-within:border-sky-400 rounded-2xl px-4 py-2.5 transition-all">
                <User className="w-4 h-4 text-slate-300 shrink-0 ml-3" />
                <div className="flex items-center w-full">
                  <span className="text-xs font-bold text-slate-300 ml-2">الاسم:</span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم العميل..."
                    className="w-full bg-transparent border-none outline-none text-white text-xs sm:text-sm font-medium placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Customer Phone Input */}
            <div className="mb-2">
              <div
                className={`flex items-center bg-white/[0.06] border ${
                  isPhoneValid ? 'border-emerald-400/70' : 'border-white/15'
                } focus-within:border-sky-400 rounded-2xl px-4 py-2.5 transition-all`}
              >
                <PhoneCall className="w-4 h-4 text-slate-300 shrink-0 ml-3" />
                <div className="flex items-center w-full">
                  <span className="text-xs font-bold text-slate-300 ml-2">الرقم:</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="رقم العميل 77، 73، 71..."
                    dir="ltr"
                    className="w-full bg-transparent border-none outline-none text-white text-xs sm:text-sm font-mono font-medium placeholder-slate-400 text-right"
                  />
                </div>
                {isPhoneValid && (
                  <span className="text-[11px] text-emerald-300 font-bold shrink-0">مكتمل ✓</span>
                )}
              </div>
            </div>

            {/* Validation Status */}
            {validationError ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-3 px-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            ) : !isPhoneValid ? (
              <div className="text-[11px] text-slate-400 mb-3 px-1">
                * اكتب رقم الهاتف المكون من 9 أرقام على الأقل لإتاحة طلب وإكمال الفاتورة
              </div>
            ) : (
              <div className="text-[11px] text-emerald-300 mb-3 px-1 font-medium">
                ✓ تم التحقق من رقم الهاتف، يمكنك الآن إكمال الفاتورة وإرسالها بالواتساب
              </div>
            )}

            {/* Submit Button */}
            <div className="space-y-2.5">
              {!isPhoneValid ? (
                <button
                  onClick={handleProceedOrder}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white/10 text-slate-400 border border-white/12 font-bold text-sm sm:text-base flex items-center justify-center cursor-not-allowed"
                  title="يرجى كتابة رقم الهاتف (9 أرقام على الأقل) للمتابعة"
                >
                  <span>المتابعة</span>
                </button>
              ) : (
                <button
                  onClick={handleProceedOrder}
                  className="liquid-btn-primary w-full py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>طلب وإكمال الفاتورة</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* WhatsApp Dispatch Popup */}
      {isWhatsAppPopupOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
          dir="rtl"
          onClick={() => setIsWhatsAppPopupOpen(false)}
        >
          <div
            className="relative w-full max-w-md liquid-glass-dark border border-emerald-400/50 rounded-[30px] p-6 sm:p-7 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsWhatsAppPopupOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mb-1">
                تم تجهيز وتنزيل الفاتورة بنجاح
              </h3>
              <p className="text-xs text-slate-300">
                اختر أحد أرقام الواتساب التالية لإرسال طلبك مباشرة لفريق المبيعات:
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <a
                href={`https://wa.me/967777551485?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-emerald-400/45 bg-emerald-500/15 hover:bg-emerald-500/25 transition-all text-white group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 fill-white" />
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm block text-white">
                      واتساب خدمة العملاء (الرقم الأول)
                    </span>
                    <span className="text-xs font-mono tabular-nums text-emerald-300 font-bold" dir="ltr">
                      +967 777 551 485
                    </span>
                  </div>
                </div>
                <span className="liquid-btn-emerald text-xs font-bold px-3.5 py-1.5 rounded-xl">
                  إرسال
                </span>
              </a>

              <a
                href={`https://wa.me/967774102030?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-emerald-400/45 bg-emerald-500/15 hover:bg-emerald-500/25 transition-all text-white group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 fill-white" />
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm block text-white">
                      واتساب خدمة العملاء (الرقم الثاني)
                    </span>
                    <span className="text-xs font-mono tabular-nums text-emerald-300 font-bold" dir="ltr">
                      +967 774 102 030
                    </span>
                  </div>
                </div>
                <span className="liquid-btn-emerald text-xs font-bold px-3.5 py-1.5 rounded-xl">
                  إرسال
                </span>
              </a>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-white/12">
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>إعادة تحميل الفاتورة (HTML)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="طباعة"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>طباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
