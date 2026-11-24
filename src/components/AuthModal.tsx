import { useState, type FormEvent } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSuccessLogin: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  language,
  onSuccessLogin,
}: AuthModalProps) {
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;
  const isAr = language === 'ar';

  const handleSendCode = (e: FormEvent) => {
    e.preventDefault();
    setStep('otp');
  };

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    setStep('success');
    setTimeout(() => {
      onSuccessLogin();
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong w-full max-w-md rounded-[30px] overflow-hidden p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-slate-500 hover:text-[#0b1220] rounded-full hover:bg-white/60 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl liquid-btn-primary flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-6 h-6 text-white" />
        </div>

        {step === 'input' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-[#0b1220]">
                {isAr ? 'تسجيل الدخول إلى متجر صدام العقاري' : 'Sign In to Saddam Store'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isAr ? 'لمتابعة طلباتك وفواتيرك بسهولة' : 'Track your orders and invoices'}
              </p>
            </div>

            <div className="liquid-glass-capsule flex p-1 rounded-2xl mb-4 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  method === 'phone' ? 'liquid-btn-primary text-white' : 'text-slate-600'
                }`}
              >
                {isAr ? 'عبر الجوال' : 'Phone'}
              </button>
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  method === 'email' ? 'liquid-btn-primary text-white' : 'text-slate-600'
                }`}
              >
                {isAr ? 'عبر البريد' : 'Email'}
              </button>
            </div>

            <form onSubmit={handleSendCode} className="space-y-4 text-xs">
              {method === 'phone' ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'رقم الجوال' : 'Mobile Number'}
                  </label>
                  <div className="flex items-center border border-white/80 rounded-xl overflow-hidden px-3 bg-white/80 focus-within:border-[#0071e3]">
                    <span className="text-slate-500 font-mono text-xs border-r rtl:border-r-0 rtl:border-l border-slate-200 pr-2 rtl:pr-0 rtl:pl-2">
                      +967
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="77X XXX XXX"
                      className="w-full p-2.5 bg-transparent font-mono text-xs text-[#0b1220] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2.5 rounded-xl border border-white/80 bg-white/80 text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
              )}

              <button
                type="submit"
                className="liquid-btn-primary w-full font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAr ? 'إرسال رمز التحقق' : 'Send Verification Code'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'دخول آمن برمز تحقق فوري' : 'Secure instant OTP login'}</span>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="text-center space-y-4 text-xs">
            <h3 className="text-base font-black text-[#0b1220]">
              {isAr ? 'أدخل رمز التحقق (OTP)' : 'Enter OTP Code'}
            </h3>
            <p className="text-xs text-slate-600">
              {isAr ? 'أرسلنا رمزاً مكوناً من 4 أرقام' : 'We sent a 4-digit verification code'}
            </p>

            <input
              type="text"
              maxLength={4}
              required
              autoFocus
              placeholder="••••"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="text-center font-mono text-2xl font-black tracking-widest w-40 mx-auto p-3 rounded-2xl border-2 border-[#0071e3] focus:outline-none bg-white/80 text-[#0b1220]"
            />

            <button
              type="submit"
              className="liquid-btn-primary w-full font-extrabold py-3 px-4 rounded-2xl text-xs cursor-pointer"
            >
              {isAr ? 'تأكيد الدخول' : 'Confirm & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-[11px] text-[#0071e3] font-bold hover:underline block mx-auto cursor-pointer"
            >
              {isAr ? 'تعديل الرقم' : 'Change number'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-[#0b1220] mb-1">
              {isAr ? 'تم تسجيل الدخول بنجاح' : 'Welcome back'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr ? 'مرحباً بك في متجر صدام العقاري' : 'Welcome to Saddam Al-Aqari Store'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
