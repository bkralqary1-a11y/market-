import { ArrowRight, ArrowLeft, Calendar, User, Cpu } from 'lucide-react';
import { Language } from '../types';

interface BlogSectionProps {
  language: Language;
}

export default function BlogSection({ language }: BlogSectionProps) {
  const isAr = language === 'ar';

  const posts = [
    {
      id: 1,
      titleEn: 'GaN vs Silicon: Why Gallium Nitride Changed Phone Charging Forever',
      titleAr: 'تقنية GaN مقابل السيليكون: لماذا غير نيتريد الغاليوم شحن الهواتف للأبد؟',
      excerptEn: 'How modern 65W and 140W GaN chargers deliver immense fast-charge speed in a pocket-friendly size without overheating.',
      excerptAr: 'تعرف على كيف توفر شواحن GaN طاقة هائلة تصل إلى 140 واط بحجم صغير جداً مع الحفاظ على برودة بطارية هاتفك وصحتها.',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=700&auto=format&fit=crop',
      date: isAr ? '١٠ مارس ٢٠٢٦' : 'Mar 10, 2026',
      author: isAr ? 'مختبرات إلكترولكس' : 'ElectroLux Lab',
      category: isAr ? 'دليل الشواحن' : 'Charging Guide',
    },
    {
      id: 2,
      titleEn: 'iPhone 16 Pro Max vs Samsung Galaxy S25 Ultra: The Ultimate Flagship Shootout',
      titleAr: 'مقارنة العمالقة: آيفون 16 برو ماكس ضد سامسونج جالكسي S25 ألترا',
      excerptEn: 'Detailed camera sensor analysis, titanium durability tests, and 5G cellular modem efficiency benchmarks.',
      excerptAr: 'تحليل دقيق لأداء الكاميرات، معالجة الذكاء الاصطناعي، قوة هياكل التيتانيوم وسرعات معالجات 3 نانومتر.',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=700&auto=format&fit=crop',
      date: isAr ? '٥ مارس ٢٠٢٦' : 'Mar 5, 2026',
      author: isAr ? 'فريق المقارنات' : 'Benchmark Team',
      category: isAr ? 'مقارنة الهواتف' : 'Flagship Review',
    },
    {
      id: 3,
      titleEn: 'How to Choose the Right Braided Cable for 100W PD & High-Speed Data Transfer',
      titleAr: 'دليلك لاختيار الكابل المجدول المناسب لشحن 100W ونقل البيانات الفائق',
      excerptEn: 'Avoid slow-charging pitfalls: understanding E-Marker chips, nylon braiding endurance, and USB 3.2 data bandwidth.',
      excerptAr: 'تجنب تلف البطاريات والشحن البطيء: أهمية شريحة E-Marker الذكية والألياف الكيفلارية المقاومة للقطع والانحناء.',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=700&auto=format&fit=crop',
      date: isAr ? '١ مارس ٢٠٢٦' : 'Mar 1, 2026',
      author: isAr ? 'مهندس صيانة معتمد' : 'Tech Engineer',
      category: isAr ? 'أدلة الكيابل' : 'Cable Guide',
    },
  ];

  return (
    <section id="blog-section" className="py-14 bg-gray-50 border-t border-gray-line">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>{isAr ? 'مركز المعرفة والأبحاث التقنية' : 'Tech Hub & Buying Guides'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-dark tracking-tight mb-2">
            {isAr ? 'أحدث المقالات ومراجعات الهواتف والملحقات' : 'Latest Insights & Device Comparisons'}
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            {isAr
              ? 'مقالات من إعداد خبراء التقنية لمساعدتك في اتخاذ القرار الصحيح وحماية أجهزتك بأفضل الملحقات.'
              : 'Expert advice, in-depth hardware comparisons, and gear reviews from certified engineers.'}
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-gray-line rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={post.image}
                  alt={post.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-tech-dark/90 backdrop-blur-sm text-cyan-300 text-[11px] font-mono font-bold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-gray-dark text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {isAr ? post.titleAr : post.titleEn}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {isAr ? post.excerptAr : post.excerptEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
                  <span>{isAr ? 'قراءة التحليل والمقارنة' : 'Read Full Analysis'}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
