/**
 * Bilingual health tips & PSAs shown while prescription analysis runs.
 * Informational only — not medical advice; aligns with public-health messaging style.
 */

export const HEALTH_FEED_ITEMS = [
  {
    tag: 'Seasonal',
    tagUr: 'موسم',
    icon: '🦟',
    accent: 'blue',
    title: 'Dengue & mosquito bites',
    titleUr: 'ڈینگی اور مچھر',
    body: 'Use nets, repellent, and cover water containers. Seek care for high fever with aches — early fluids matter.',
    bodyUr: 'ڈینگی میں بخار، جسم درد — کم از کم پانی / ORS اور ڈاکٹر سے رجوع۔ مچھردانیاں اور کھلے پانی کا ڈھکن ضروری۔',
  },
  {
    tag: 'Public service',
    tagUr: 'عوامی پیغام',
    icon: '💧',
    accent: 'green',
    title: 'ORS & hydration',
    titleUr: 'نمکیات اور پانی',
    body: 'Diarrhea or vomiting: ORS sips often beat plain water. Severe weakness or no urine — get urgent care.',
    bodyUr: 'الٹیاں یا دست — ORS چُسکی چُسکی پیئیں۔ کمزوری یا پیشاب بند — فوراً طبی امداد۔',
  },
  {
    tag: 'Heat',
    tagUr: 'گرمی',
    icon: '☀️',
    accent: 'blue',
    title: 'Heat stroke caution',
    titleUr: 'لو لگنے سے بچاؤ',
    body: 'Stay in shade, loose clothes, water breaks. Confusion or fainting in heat — emergency.',
    bodyUr: 'گرمی میں پانی، چھاؤں، ڈھیلے کپڑے۔ بے ہوشی یا بے سمجھی — فوراً ہسپتال۔',
  },
  {
    tag: 'Prevention',
    tagUr: 'احتیاط',
    icon: '🧼',
    accent: 'green',
    title: 'Hand & food hygiene',
    titleUr: 'صفائی',
    body: 'Wash hands before food and after toilet. Boil or treat doubtful water in risky areas.',
    bodyUr: 'کھانے سے پہلے اور بیت الخلا کے بعد ہاتھ دھوئیں۔ مشکوک پانی اُبال کر پیئیں۔',
  },
  {
    tag: 'Safety',
    tagUr: 'حفاظت',
    icon: '💊',
    accent: 'blue',
    title: 'Medicines: use as prescribed',
    titleUr: 'دوا ڈاکٹر کے مطابق',
    body: 'Do not share antibiotics or stop early. Check expiry; buy from licensed pharmacies when possible.',
    bodyUr: 'انٹی بایوٹک بغیر مشورے نہ لیں، دورانیہ پورا کریں۔ ختم شدہ دوا استعمال نہ کریں۔',
  },
  {
    tag: 'PSA',
    tagUr: 'اغازی',
    icon: '📞',
    accent: 'green',
    title: 'Emergencies',
    titleUr: 'ایمرجنسی',
    body: 'Chest pain, trouble breathing, severe bleeding, or unconsciousness — call local emergency / reach ER.',
    bodyUr: 'سانس روکنا، شدید خون، بے ہوشی — فوری قریبی ہسپتال یا ہیلپ لائن۔',
  },
];

/** Split items into two columns (alternate) for left/right feed columns. */
export function healthFeedColumns() {
  const left = HEALTH_FEED_ITEMS.filter((_, i) => i % 2 === 0);
  const right = HEALTH_FEED_ITEMS.filter((_, i) => i % 2 === 1);
  return { left, right };
}

export function renderHealthFeedCard(item) {
  const ac = item.accent === 'green' ? 'health-feed-card--green' : 'health-feed-card--blue';
  return `
    <article class="health-feed-card ${ac}">
      <div class="health-feed-card__top">
        <span class="health-feed-card__icon" aria-hidden="true">${item.icon}</span>
        <div class="health-feed-card__tags">
          <span class="health-feed-tag">${escapeFeed(item.tag)}</span>
          <span class="health-feed-tag health-feed-tag--ur">${escapeFeed(item.tagUr)}</span>
        </div>
      </div>
      <h3 class="health-feed-card__title">${escapeFeed(item.title)}</h3>
      <p class="health-feed-card__title-ur" dir="rtl">${escapeFeed(item.titleUr)}</p>
      <p class="health-feed-card__body">${escapeFeed(item.body)}</p>
      <p class="health-feed-card__body-ur" dir="rtl">${escapeFeed(item.bodyUr)}</p>
    </article>
  `;
}

function escapeFeed(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
