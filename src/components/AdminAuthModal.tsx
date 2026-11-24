import { useState, type FormEvent } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  type User,
} from 'firebase/auth';
import {
  ShieldCheck,
  Lock,
  Mail,
  X,
  LogOut,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  popupRedirectResolver,
  ADMIN_EMAIL,
  isVerifiedAdminUser,
} from '../firebase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthenticated: () => void;
}

export default function AdminAuthModal({
  isOpen,
  onClose,
  currentUser,
  onAuthenticated,
}: AdminAuthModalProps) {
  const [authTab, setAuthTab] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [needsVerificationUser, setNeedsVerificationUser] = useState<User | null>(null);

  if (!isOpen) return null;

  const isUnauthorizedSignedIn = currentUser && !isVerifiedAdminUser(currentUser);
  const isInsideIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setErrorCode(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider, popupRedirectResolver);
      if (isVerifiedAdminUser(result.user)) {
        onAuthenticated();
      } else {
        setErrorMsg(
          `الحساب (${result.user.email || 'غير معروف'}) غير مصرح له بإدارة المتجر. يرجى الدخول بحساب المالك المعتمد.`
        );
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const rawMessage = err instanceof Error ? err.message : '';
      console.error('Google Sign-In failed:', code, rawMessage);
      setErrorCode(code || null);

      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('تم إغلاق نافذة تسجيل الدخول قبل الإكمال. حاول مرة أخرى.');
      } else if (code === 'auth/cancelled-popup-request') {
        setErrorMsg('يوجد طلب تسجيل دخول قيد التنفيذ بالفعل. انتظر لحظة وحاول مجدداً.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg(
          'المتصفح منع النافذة المنبثقة. اضغط على "الدخول عبر إعادة التوجيه" أو افتح المتجر في تبويب مستقل أدناه.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg(
          `النطاق الحالي (${window.location.hostname}) غير مضاف في النطاقات المصرح بها (Authorized Domains) في Firebase Authentication.`
        );
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMsg(
          'مزود تسجيل الدخول عبر Google غير مفعّل في Firebase Console > Authentication > Sign-in method.'
        );
      } else if (
        code === 'auth/internal-error' ||
        code === 'auth/web-storage-unsupported' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        setErrorMsg(
          'المتصفح أو نافذة المعاينة المدمجة تمنع نوافذ Google المنبثقة. افتح المتجر في صفحة مستقلة أدناه أو استخدم زر إعادة التوجيه.'
        );
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('تعذر الاتصال بخوادم Google. تأكد من اتصال الإنترنت وحاول مجدداً.');
      } else {
        setErrorMsg(
          `تعذر إتمام تسجيل الدخول بحساب Google. ${code ? `(${code})` : ''} جرب فتح المتجر في صفحة مستقلة أدناه.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setErrorMsg(null);
    setErrorCode(null);
    setLoading(true);
    try {
      try {
        sessionStorage.setItem('saddam_pending_admin_redirect', '1');
      } catch {
        // Ignore storage restriction
      }
      await signInWithRedirect(auth, googleProvider, popupRedirectResolver);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      console.error('Google Redirect Sign-In failed:', code, err);
      setErrorCode(code || null);
      setErrorMsg(
        `تعذر التحويل لتسجيل الدخول ${code ? `(${code})` : ''}. يرجى فتح المتجر في تبويب متصفح مستقل.`
      );
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    setInfoMsg(null);
    setNeedsVerificationUser(null);
    if (!email.trim() || !password) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (isVerifiedAdminUser(result.user)) {
        setPassword('');
        onAuthenticated();
      } else if (
        result.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        !result.user.emailVerified
      ) {
        setNeedsVerificationUser(result.user);
        setErrorMsg(
          'تم الدخول لكن البريد غير موثّق بعد. اضغط على زر "إرسال رابط التوثيق إلى بريدي" أدناه ثم افتح الرابط من Gmail.'
        );
      } else {
        setErrorMsg('هذا البريد الإلكتروني غير مصرح له بإدارة المتجر.');
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      setErrorCode(code || null);
      if (code === 'auth/operation-not-allowed') {
        setErrorMsg(
          'تسجيل الدخول بالبريد وكلمة المرور غير مفعّل بعد في Firebase Console. فعّله من Authentication > Sign-in method.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setErrorMsg('بيانات الدخول غير صحيحة.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('تم إيقاف المحاولات مؤقتاً لكثرة الطلبات. يرجى الانتظار قليلاً.');
      } else {
        setErrorMsg(`تعذر تسجيل الدخول ${code ? `(${code})` : ''}. تأكد من الاتصال وحاول مجدداً.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setErrorMsg(null);
    setErrorCode(null);
    setInfoMsg(null);
    const targetEmail = email.trim() || ADMIN_EMAIL;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setInfoMsg(`تم إرسال رابط تعيين/تغيير كلمة المرور إلى ${targetEmail}. راجع بريدك (بما في ذلك الرسائل غير المرغوب فيها).`);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      setErrorCode(code || null);
      setErrorMsg(
        `تعذر إرسال رابط تغيير كلمة المرور ${code ? `(${code})` : ''}. تأكد من تفعيل Email/Password وإضافة النطاق في Firebase Console.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!needsVerificationUser) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      await sendEmailVerification(needsVerificationUser);
      setInfoMsg('تم إرسال رابط التوثيق إلى بريدك في Gmail. افتح الرابط ثم أعد تسجيل الدخول.');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      setErrorCode(code || null);
      setErrorMsg(`تعذر إرسال رابط التوثيق ${code ? `(${code})` : ''}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setErrorMsg(null);
      setErrorCode(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#070f21]/65 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="liquid-glass-strong w-full max-w-md rounded-[32px] p-6 sm:p-8 relative shadow-2xl border border-white/60 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-slate-600 hover:text-slate-950 cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2.5 mb-6">
          <div className="w-14 h-14 rounded-2xl liquid-btn-primary flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-[#0b1220]">
            التحقق من هوية مالك المتجر
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            محمي بالكامل عبر Firebase Authentication وقواعد Firestore الأمنية
          </p>
        </div>

        {/* Unauthorized User Notice */}
        {isUnauthorizedSignedIn && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div className="text-xs leading-relaxed">
                <p className="font-extrabold">وصول مرفوض</p>
                <p className="mt-0.5">
                  الحساب الحالي (<span className="font-mono">{currentUser.email}</span>) غير مصرح له
                  بالتعديل.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج والتبديل لحساب المالك</span>
            </button>
          </div>
        )}

        {/* Auth Method Switcher */}
        <div className="liquid-glass-capsule p-1 rounded-2xl grid grid-cols-2 gap-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthTab('google');
              setErrorMsg(null);
              setErrorCode(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              authTab === 'google'
                ? 'liquid-btn-primary text-white'
                : 'text-slate-700 hover:text-[#0b1220]'
            }`}
          >
            حساب Google (فوري)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('email');
              setErrorMsg(null);
              setErrorCode(null);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              authTab === 'email'
                ? 'liquid-btn-primary text-white'
                : 'text-slate-700 hover:text-[#0b1220]'
            }`}
          >
            البريد وكلمة المرور
          </button>
        </div>

        {authTab === 'google' ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm text-[#0b1220] font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#0071e3]" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>الدخول الآمن بحساب Google</span>
            </button>

            {/* Mobile / Standalone Redirect Option */}
            {!isInsideIframe && (
              <button
                type="button"
                onClick={handleGoogleRedirectSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-2xl liquid-glass-subtle hover:bg-white/80 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
              >
                <Smartphone className="w-4 h-4 text-[#0071e3]" />
                <span>الدخول عبر إعادة التوجيه (مناسب للجوال)</span>
              </button>
            )}

            {/* Open in Standalone Browser Tab when inside AI Studio preview iframe */}
            {(isInsideIframe || errorMsg) && (
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0071e3] font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>فتح المتجر في صفحة مستقلة لتسجيل الدخول</span>
              </a>
            )}

            <p className="text-[11px] text-center text-slate-500 leading-relaxed pt-1">
              يُسمح بالتعديل فقط لحساب المالك الموثق ({ADMIN_EMAIL})
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bkralqary1@gmail.com"
                  className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-300/80 text-sm text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-300/80 text-sm text-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl liquid-btn-primary text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>تفعيل وضع التحرير</span>
            </button>

            <button
              type="button"
              onClick={handleSendPasswordReset}
              disabled={loading}
              className="w-full py-2 text-xs font-bold text-[#0071e3] hover:underline cursor-pointer disabled:opacity-60"
            >
              إرسال رابط تعيين / تغيير كلمة المرور إلى بريدي
            </button>

            {needsVerificationUser && (
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold cursor-pointer disabled:opacity-60"
              >
                إرسال رابط التوثيق إلى بريدي الآن
              </button>
            )}
          </form>
        )}

        {infoMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold leading-relaxed">
            {infoMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed space-y-1">
            <p>{errorMsg}</p>
            {errorCode && (
              <p dir="ltr" className="text-[10px] font-mono text-rose-500">
                Code: {errorCode}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
