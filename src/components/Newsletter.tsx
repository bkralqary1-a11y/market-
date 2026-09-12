import { useState, type FormEvent } from 'react';
import { Mail, CheckCircle, Zap } from 'lucide-react';
import { Language } from '../types';

interface NewsletterProps {
  language: Language;
}

export default function Newsletter({ language }: NewsletterProps) {
  const isAr = language === 'ar';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section id="newsletter-section" className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div className="bg-tech-dark text-white rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="w-12 h-12 bg-primary/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/30">
            <Zap className="w-6 h-6" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black mb-2 font-display">
            {isAr
              ? 'انضم لقائمتنا وتلقّ أحدث الوصولات فوراً'
              : 'Join Our VIP Updates for New Flagship Arrivals'}
          </h2>

          <p className="text-xs md:text-sm text-gray-300 max-w-md mx-auto mb-6">
            {isAr
              ? 'احصل على إشعارات فورية عند وصول أحدث أجهزة آبل وسامسونج والشواحن والسماعات الأصلية.'
              : 'Instant alerts for official smartphone restocks, original chargers and audio gear.'}
          </p>

          {submitted ? (
            <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-6 py-4 rounded-2xl flex items-center justify-center gap-2 max-w-md mx-auto text-xs sm:text-sm font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {isAr ? 'تم انضمامك بنجاح! كود القسيمة: VIP50' : 'Welcome! Your coupon code is: VIP50'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? 'أدخل بريدك الإلكتروني...' : 'Enter your email address...'}
                className="flex-grow px-4 py-3 text-xs sm:text-sm rounded-xl border border-white/20 focus:outline-none focus:border-primary bg-white/10 text-white placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all active:scale-95 shadow-lg shrink-0"
              >
                {isAr ? 'انضم الآن' : 'Subscribe'}
              </button>
            </form>
          )}

          <p className="text-[11px] text-gray-400 mt-4">
            {isAr
              ? '🛡️ نحترم خصوصيتك بالكامل. بدون أي رسائل مزعجة وبإمكانك إلغاء الاشتراك بنقرة واحدة.'
              : '🛡️ 100% privacy guaranteed. No spam, one-click unsubscribe.'}
          </p>
        </div>
      </div>
    </section>
  );
}
