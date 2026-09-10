import { useState, type FormEvent } from 'react';
import { X, Lock, Phone, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
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
  if (!isOpen) return null;
  const isAr = language === 'ar';

  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('551234567');
  const [email, setEmail] = useState('customer@example.com');
  const [otpCode, setOtpCode] = useState('');

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
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-line p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-gray-400 hover:text-gray-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-tech-dark text-white flex items-center justify-center mx-auto mb-4 shadow-md">
          <Zap className="w-6 h-6 text-cyan-300" />
        </div>

        {step === 'input' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-gray-dark">
                {isAr ? 'تسجيل الدخول إلى إلكترولكس' : 'Sign In to ElectroLux'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isAr ? 'لمتابعة طلباتك، فواتيرك، والحصول على نقاط الولاء' : 'Track orders & access VIP club benefits'}
              </p>
            </div>

            {/* Toggle Method */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  method === 'phone' ? 'bg-white text-gray-dark shadow-xs' : 'text-gray-500'
                }`}
              >
                {isAr ? 'عبر الجوال' : 'Phone'}
              </button>
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  method === 'email' ? 'bg-white text-gray-dark shadow-xs' : 'text-gray-500'
                }`}
              >
                {isAr ? 'عبر البريد' : 'Email'}
              </button>
            </div>

            <form onSubmit={handleSendCode} className="space-y-4 text-xs">
              {method === 'phone' ? (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'رقم الجوال' : 'Mobile Number'}
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden px-3 bg-white focus-within:border-primary">
                    <span className="text-gray-400 font-mono text-xs border-r rtl:border-r-0 rtl:border-l border-gray-200 pr-2 rtl:pr-0 rtl:pl-2">
                      +966
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="5X XXX XXXX"
                      className="w-full p-2.5 bg-transparent font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl transition-all shadow text-xs flex items-center justify-center gap-2"
              >
                <span>{isAr ? 'إرسال رمز التحقق السريع' : 'Send Verification Code'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'دخول فوري بدون كلمة مرور عبر رمز OTP آمن' : 'Instant passwordless OTP access'}</span>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="text-center space-y-4 text-xs">
            <h3 className="text-base font-black text-gray-dark">
              {isAr ? 'أدخل رمز التحقق (OTP)' : 'Enter OTP Code'}
            </h3>
            <p className="text-xs text-gray-500">
              {isAr ? `أرسلنا رمزاً مكوناً من 4 أرقام إلى هاتفك` : `We sent a 4-digit code`}
            </p>

            <input
              type="text"
              maxLength={4}
              required
              autoFocus
              placeholder="••••"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="text-center font-mono text-2xl font-black tracking-widest w-40 mx-auto p-3 rounded-2xl border-2 border-primary focus:outline-none bg-gray-50"
            />

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl transition-all shadow text-xs"
            >
              {isAr ? 'تأكيد الرمز والدخول' : 'Confirm & Log In'}
            </button>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-[11px] text-primary font-bold hover:underline block mx-auto"
            >
              {isAr ? 'تعديل رقم الجوال' : 'Change number'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-6 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-gray-dark mb-1">
              {isAr ? 'تم تسجيل الدخول بنجاح!' : 'Welcome back!'}
            </h3>
            <p className="text-xs text-gray-400">{isAr ? 'مرحباً بك في إلكترولكس VIP' : 'Loading your VIP account'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
