export interface SocialChannel {
  id: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'whatsapp';
  nameAr: string;
  nameEn: string;
  handle: string;
  url: string;
  color: string;
  gradient: string;
  badge: string;
  statsAr: string;
  statsEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const OFFICIAL_SOCIAL_CHANNELS: SocialChannel[] = [
  {
    id: 'youtube',
    nameAr: 'يوتيوب',
    nameEn: 'YouTube',
    handle: '@saddam_alaqari',
    url: 'https://youtube.com/channel/UCKrhL35COXkwrCL6Qf-NEgg',
    color: '#FF0000',
    gradient: 'from-red-600 via-rose-600 to-red-700',
    badge: 'قناة رسمية',
    statsAr: 'مراجعات وفيديوهات 4K',
    statsEn: '4K Reviews & Shorts',
    descriptionAr: 'قناتنا الرسمية لمراجعات أحدث الهواتف واختبارات الكاميرات والفتح الأولي للعلب.',
    descriptionEn: 'Official channel for smartphone reviews, unboxings, and camera tests.',
  },
  {
    id: 'tiktok',
    nameAr: 'تيك توك',
    nameEn: 'TikTok',
    handle: '@saddam_alaqari_phones',
    url: 'https://www.tiktok.com/@saddam_alaqari_phones?_r=1&_t=ZS-99cQKDeUIFw',
    color: '#00F2FE',
    gradient: 'from-slate-900 via-zinc-900 to-cyan-950',
    badge: 'ترندات وفيديوهات قصيرة',
    statsAr: 'فيديوهات حصرية يومياً',
    statsEn: 'Daily Exclusive Reels',
    descriptionAr: 'شاهد أحدث وصولات الهواتف الأصلية والمقارنات السريعة والعروض أولاً بأول.',
    descriptionEn: 'Watch new arrivals, quick comparisons, and flash sales.',
  },
  {
    id: 'instagram',
    nameAr: 'انستغرام',
    nameEn: 'Instagram',
    handle: '@saddam_alaqari_phones',
    url: 'https://www.instagram.com/saddam_alaqari_phones?stkn=YWNpcng0dWkwYWM5',
    color: '#E1306C',
    gradient: 'from-purple-600 via-pink-600 to-amber-500',
    badge: 'صور وريلز ستوري',
    statsAr: 'تغطيات وأسعار فورية',
    statsEn: 'Stories & Price Updates',
    descriptionAr: 'تغطيات حية للأجهزة الجديدة، صور عالية الدقة لكفرات وشواحن الأجهزة الأصلية.',
    descriptionEn: 'Live stories, high-res photos of devices, cases, and chargers.',
  },
  {
    id: 'facebook',
    nameAr: 'فيسبوك',
    nameEn: 'Facebook',
    handle: 'saddam.alaqari.mobilee',
    url: 'https://www.facebook.com/saddam.alaqari.mobilee?mibextid=ZbWKwL',
    color: '#1877F2',
    gradient: 'from-blue-600 via-indigo-600 to-blue-700',
    badge: 'الصفحة الرسمية',
    statsAr: 'مجتمع عملاء صدام العقاري',
    statsEn: 'Community & Customer Service',
    descriptionAr: 'منشورات يومية عن الهواتف المتوفرة، استفسارات العملاء، والضمان المعتمد.',
    descriptionEn: 'Daily updates on available inventory, customer queries, and certified warranty.',
  },
  {
    id: 'whatsapp',
    nameAr: 'واتساب المبيعات',
    nameEn: 'WhatsApp Direct',
    handle: '+967 774 102 030',
    url: 'https://wa.me/967774102030',
    color: '#25D366',
    gradient: 'from-emerald-600 via-green-600 to-teal-700',
    badge: 'طلب فوري مباشر',
    statsAr: 'رد خلال دقائق 24/7',
    statsEn: 'Instant 24/7 Response',
    descriptionAr: 'تواصل مباشر مع فريق المبيعات وحجز الأجهزة والتوصيل السريع لجميع المحافظات.',
    descriptionEn: 'Direct chat with sales team to book devices with fast delivery.',
  },
];

export interface SocialReelItem {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  titleAr: string;
  titleEn: string;
  tagAr: string;
  tagEn: string;
  videoUrl: string; // YouTube embed or video stream URL
  directUrl: string; // Direct link to channel post/profile
  thumbnail: string;
  views: string;
  likes: string;
  featured?: boolean;
}

export const LUXURY_SOCIAL_REELS: SocialReelItem[] = [
  {
    id: 'reel-1',
    platform: 'youtube',
    titleAr: 'فتح صندوق واختبار أقوى هواتف آبل وسامسونج في متجر صدام العقاري',
    titleEn: 'Flagship Smartphone Unboxing & Performance Test',
    tagAr: 'آبل & سامسونج',
    tagEn: 'Flagship Unboxing',
    videoUrl: 'https://youtube.com/shorts/Ues_BxS8v-s',
    directUrl: 'https://youtube.com/channel/UCKrhL35COXkwrCL6Qf-NEgg',
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
    views: '45.2K',
    likes: '3.8K',
    featured: true,
  },
  {
    id: 'reel-2',
    platform: 'tiktok',
    titleAr: 'وصول أحدث كفرات الحماية الماغ سيف والشواحن الذكية السريعة GaN',
    titleEn: 'MagSafe Protective Cases & Ultra-fast GaN Chargers',
    tagAr: 'ملحقات أصلية',
    tagEn: 'Original Accessories',
    videoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
    directUrl: 'https://www.tiktok.com/@saddam_alaqari_phones?_r=1&_t=ZS-99cQKDeUIFw',
    thumbnail: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?q=80&w=800&auto=format&fit=crop',
    views: '89.4K',
    likes: '12.1K',
    featured: true,
  },
  {
    id: 'reel-3',
    platform: 'instagram',
    titleAr: 'تغطية وصول دفعات الهواتف الأصلية المختومة مع كرت الضمان المعتمد',
    titleEn: 'Exclusive Live Story: Brand New Sealed Phones Arrival',
    tagAr: 'ضمان معتمد',
    tagEn: 'Sealed with Warranty',
    videoUrl: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800&auto=format&fit=crop',
    directUrl: 'https://www.instagram.com/saddam_alaqari_phones?stkn=YWNpcng0dWkwYWM5',
    thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop',
    views: '62.7K',
    likes: '7.4K',
    featured: true,
  },
  {
    id: 'reel-4',
    platform: 'facebook',
    titleAr: 'عروض أسعار خاصة لعملاء عمران وصنعاء وكافة محافظات الجمهورية اليمنية',
    titleEn: 'Special Deals & Fast Shipping across All Yemen Governorates',
    tagAr: 'عروض حصرية',
    tagEn: 'Exclusive Offers',
    videoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?q=80&w=800&auto=format&fit=crop',
    directUrl: 'https://www.facebook.com/saddam.alaqari.mobilee?mibextid=ZbWKwL',
    thumbnail: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
    views: '34.9K',
    likes: '4.2K',
    featured: false,
  },
  {
    id: 'reel-5',
    platform: 'youtube',
    titleAr: 'مقارنة كاميرات تصوير الفيديو بدقة 4K 60FPS والتثبيت السينمائي',
    titleEn: '4K 60FPS Cinematic Camera Stabilization Test',
    tagAr: 'مقارنة كاميرات',
    tagEn: 'Camera Comparison',
    videoUrl: 'https://youtube.com/shorts/Ues_BxS8v-s',
    directUrl: 'https://youtube.com/channel/UCKrhL35COXkwrCL6Qf-NEgg',
    thumbnail: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=800&auto=format&fit=crop',
    views: '51.3K',
    likes: '5.9K',
    featured: false,
  },
  {
    id: 'reel-6',
    platform: 'tiktok',
    titleAr: 'تجربة مقاومة الكفرات الذكية للصدمات والسقوط على الأسطح الصلبة',
    titleEn: 'Shockproof Drop-Test on Premium Protective Cases',
    tagAr: 'اختبار صلابة',
    tagEn: 'Drop Test',
    videoUrl: 'https://images.unsplash.com/photo-1541877590-a15d74268e64?q=80&w=800&auto=format&fit=crop',
    directUrl: 'https://www.tiktok.com/@saddam_alaqari_phones?_r=1&_t=ZS-99cQKDeUIFw',
    thumbnail: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800&auto=format&fit=crop',
    views: '112.5K',
    likes: '19.4K',
    featured: false,
  },
];
