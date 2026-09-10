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
} from 'lucide-react';
import { CartItem } from '../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart?: () => void;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
}: InvoiceModalProps) {
  const modalId = useId();
  // Name & Phone start empty as requested
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isWhatsAppPopupOpen, setIsWhatsAppPopupOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  // Calculate subtotal
  const grandTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Phone validation: at least 9 numeric digits
  const phoneDigits = customerPhone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length >= 9;

  // Build the pre-formatted WhatsApp message
  const buildWhatsAppMessage = () => {
    let message = `السلام عليكم ورحمة الله وبركاته،\n`;
    message += `أود تأكيد طلب جديد من *متجر صدام الفاخر*:\n\n`;
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

  // Generate downloadable invoice HTML file
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
  <title>فاتورة طلب #${invoiceNumber} - متجر صدام الفاخر</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
    * { box-sizing: border-box; font-family: 'Tajawal', sans-serif; margin: 0; padding: 0; }
    body { background-color: #f1f5f9; color: #0f172a; padding: 24px; direction: rtl; }
    .invoice-box { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #cbd5e1; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 24px; }
    .store-title { font-size: 24px; font-weight: 900; color: #ea580c; }
    .store-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 500; }
    .invoice-tag { text-align: left; }
    .invoice-label { font-size: 22px; font-weight: 900; color: #0f172a; }
    .invoice-num { font-size: 13px; font-family: monospace; color: #ea580c; font-weight: bold; }
    .date { font-size: 12px; color: #64748b; margin-top: 4px; }
    .customer-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 20px; margin-bottom: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .customer-label { font-size: 12px; font-weight: 700; color: #64748b; }
    .customer-val { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; overflow: hidden; border-radius: 14px; border: 1px solid #e2e8f0; }
    thead th { background: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 14px; text-align: center; }
    tbody td { padding: 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .item-name { text-align: right; font-weight: 700; color: #0f172a; }
    .total-banner { background: #fff7ed; border: 2px solid #ea580c; border-radius: 16px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .total-title { font-size: 17px; font-weight: 800; color: #9a3412; }
    .total-sum { font-size: 24px; font-weight: 900; color: #ea580c; font-family: monospace; }
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
        <h1 class="store-title">متجر صدام الفاخر</h1>
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
        <div class="customer-label">👤 اسم المشتري:</div>
        <div class="customer-val">${customerName.trim() || 'عميل المتجر'}</div>
      </div>
      <div>
        <div class="customer-label">📞 رقم الهاتف للتواصل:</div>
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
            <td style="font-weight: 800; font-family: monospace; color: #ea580c;">${(
              item.product.price * item.quantity
            ).toLocaleString('en-US')} ريال</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <div class="total-banner">
      <div class="total-title">💰 المبلغ الإجمالي الكلي:</div>
      <div class="total-sum">${grandTotal.toLocaleString('en-US')} ريال</div>
    </div>

    <div class="footer">
      <div>أرجو تأكيد الطلب وتزويدي بموعد التسليم. شكراً لكم!</div>
      <div style="margin-top: 4px;">خدمة العملاء والمبيعات: 967777551485+ / 967774102030+</div>
      <div class="official-seal">✓ فاتورة معتمدة صادرة من متجر صدام الفاخر</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `فاتورة_متجر_صدام_الفاخر_${invoiceNumber}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  // Click on "المتابعة" / "طلب وإكمال الفاتورة"
  const handleProceedOrder = () => {
    if (!isPhoneValid) {
      setValidationError('يرجى كتابة رقم العميل (9 أرقام على الأقل، مثل 77 أو 73 أو 71)');
      return;
    }

    setValidationError('');
    // 1. Download invoice file automatically
    handleDownloadInvoice();
    // 2. Open popup modal with WhatsApp contact rectangles
    setIsWhatsAppPopupOpen(true);
  };

  return (
    <div
      id={modalId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="relative w-full max-w-lg bg-[#0d1117] border border-gray-700/80 rounded-3xl p-5 sm:p-7 text-white shadow-2xl my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              الفاتورة
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">السلة فارغة حالياً. قم بإضافة منتجات لتظهر في الفاتورة.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
            >
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <>
            {/* Invoice Table - Matching requested layout */}
            <div className="border border-gray-700 rounded-2xl overflow-hidden mb-4 bg-black/40">
              {/* Header Row */}
              <div className="grid grid-cols-12 text-center text-xs font-black text-gray-300 bg-white/5 py-3 border-b border-gray-700">
                <div className="col-span-2 border-l border-gray-700/60 py-0.5">العدد</div>
                <div className="col-span-4 border-l border-gray-700/60 py-0.5">الصنف</div>
                <div className="col-span-3 border-l border-gray-700/60 py-0.5">السعر</div>
                <div className="col-span-3 py-0.5">الإجمالي</div>
              </div>

              {/* Data Rows */}
              <div className="divide-y divide-gray-800/80 max-h-60 overflow-y-auto">
                {cart.map((item, index) => {
                  const itemTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 text-center text-xs sm:text-sm py-3 items-center hover:bg-white/5 transition-colors"
                    >
                      {/* Qty with stepper */}
                      <div className="col-span-2 flex items-center justify-center gap-1 border-l border-gray-700/60 px-1">
                        <button
                          onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="font-mono font-bold text-white px-0.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Product Name */}
                      <div className="col-span-4 text-right px-2.5 border-l border-gray-700/60">
                        <div className="font-bold text-gray-100 text-xs truncate" title={item.product.nameAr}>
                          {item.product.nameAr || item.product.name}
                        </div>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-[10px] text-rose-400/80 hover:text-rose-300 flex items-center gap-0.5 mt-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>حذف</span>
                        </button>
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-3 text-center border-l border-gray-700/60 font-mono text-xs text-gray-300">
                        {item.product.price.toLocaleString('en-US')} ر.ي
                      </div>

                      {/* Total for this item */}
                      <div className="col-span-3 text-center font-mono font-bold text-xs text-emerald-400">
                        {itemTotal.toLocaleString('en-US')} ر.ي
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grand Total Row */}
            <div className="flex items-center justify-between px-3 py-2 mb-4 bg-white/5 border border-gray-800 rounded-xl">
              <span className="text-sm sm:text-base font-extrabold text-white">
                الإجمالي الكلي:
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                {grandTotal.toLocaleString('en-US')} ريال
              </span>
            </div>

            {/* Input 1: Customer Name with User Icon */}
            <div className="mb-3">
              <div className="flex items-center bg-black/60 border border-gray-700 focus-within:border-emerald-500 rounded-2xl px-4 py-2.5 transition-all">
                <User className="w-5 h-5 text-gray-400 shrink-0 ml-3" />
                <div className="flex items-center w-full">
                  <span className="text-xs font-bold text-gray-300 ml-2">الاسم:</span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم العميل..."
                    className="w-full bg-transparent border-none outline-none text-white text-xs sm:text-sm font-medium placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Input 2: Customer Phone with Phone/Keypad Icon */}
            <div className="mb-2">
              <div
                className={`flex items-center bg-black/60 border ${
                  isPhoneValid ? 'border-emerald-500/80' : 'border-gray-700'
                } focus-within:border-emerald-500 rounded-2xl px-4 py-2.5 transition-all`}
              >
                <PhoneCall className="w-5 h-5 text-gray-400 shrink-0 ml-3" />
                <div className="flex items-center w-full">
                  <span className="text-xs font-bold text-gray-300 ml-2">الرقم:</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="رقم العميل 77، 73، 71..."
                    dir="ltr"
                    className="w-full bg-transparent border-none outline-none text-white text-xs sm:text-sm font-mono font-medium placeholder-gray-500 text-right"
                  />
                </div>
                {isPhoneValid && (
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-md shrink-0">
                    مكتمل ✓
                  </span>
                )}
              </div>
            </div>

            {/* Validation note or error */}
            {validationError ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-3 px-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            ) : !isPhoneValid ? (
              <div className="text-[11px] text-gray-400 mb-3 px-1">
                * اكتب رقم الهاتف المكون من 9 أرقام على الأقل لإتاحة خيار طلب وإكمال الفاتورة
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400 mb-3 px-1 font-medium">
                ✓ تم التحقق من رقم الهاتف، يمكنك الآن الضغط على طلب وإكمال الفاتورة
              </div>
            )}

            {/* Main Action Button: Gray "المتابعة" if < 9 digits, or Colored "طلب وإكمال الفاتورة" if >= 9 digits */}
            <div className="space-y-2.5">
              {!isPhoneValid ? (
                /* Button when phone is incomplete: Gray, text "المتابعة" without numbers */
                <button
                  onClick={handleProceedOrder}
                  className="w-full py-3.5 px-5 rounded-2xl bg-zinc-700 text-zinc-400 border border-zinc-600 font-bold text-sm sm:text-base flex items-center justify-center cursor-not-allowed transition-all opacity-80"
                  title="يرجى كتابة رقم الهاتف (9 أرقام على الأقل) للمتابعة"
                >
                  <span>المتابعة</span>
                </button>
              ) : (
                /* Button when phone has 9+ digits: Active color, text "طلب وإكمال الفاتورة" */
                <button
                  onClick={handleProceedOrder}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-950/40 active:scale-98 transition-all cursor-pointer animate-in zoom-in-95"
                >
                  <span>طلب وإكمال الفاتورة</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* POPUP MODAL: The dedicated popup that appears after clicking "طلب وإكمال الفاتورة" */}
      {isWhatsAppPopupOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          dir="rtl"
          onClick={() => setIsWhatsAppPopupOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#0f172a] border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-7 text-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsWhatsAppPopupOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success icon & title */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mb-1">
                تم تجهيز وتنزيل الفاتورة بنجاح!
              </h3>
              <p className="text-xs text-gray-300">
                تم تنزيل ملف الفاتورة تلقائياً. اختر الآن أحد أرقام الواتساب لإرسال الطلب والتواصل مباشرة:
              </p>
            </div>

            {/* The Two WhatsApp Rectangles Requested by User */}
            <div className="space-y-3 mb-5">
              {/* WhatsApp Rectangle 1 */}
              <a
                href={`https://wa.me/967777551485?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-950/60 hover:bg-emerald-900/80 transition-all text-white group shadow-lg active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-6 h-6 fill-white" />
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm block text-white">
                      واتساب خدمة العملاء (الرقم الأول)
                    </span>
                    <span className="text-xs font-mono text-emerald-300 font-bold" dir="ltr">
                      +967 777 551 485
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">
                  إرسال 💬
                </span>
              </a>

              {/* WhatsApp Rectangle 2 */}
              <a
                href={`https://wa.me/967774102030?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-950/60 hover:bg-emerald-900/80 transition-all text-white group shadow-lg active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-6 h-6 fill-white" />
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm block text-white">
                      واتساب خدمة العملاء (الرقم الثاني)
                    </span>
                    <span className="text-xs font-mono text-emerald-300 font-bold" dir="ltr">
                      +967 774 102 030
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">
                  إرسال 💬
                </span>
              </a>
            </div>

            {/* Secondary actions: Re-download & Print */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>إعادة تحميل الفاتورة ملف (HTML)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="طباعة"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>طباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
