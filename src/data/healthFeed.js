/**
 * Bilingual health tips & Pakistan-focused public-health briefings shown while prescription analysis runs.
 * Curated library (informational only — not medical advice). “Today” line uses the device clock; not a live news API.
 */

export const HEALTH_FEED_ITEMS = [
  {
    tag: 'Pakistan',
    tagUr: 'پاکستان',
    icon: '🦟',
    accent: 'blue',
    title: 'Dengue watch (urban)',
    titleUr: 'شہروں میں ڈینگی',
    body: 'Mosquito breeding peaks after rain in Karachi, Lahore, Rawalpindi, Islamabad. Empty saucers, use nets; persistent high fever needs testing.',
    bodyUr: 'بارش کے بعد شہروں میں مچھر بڑھتے ہیں۔ برتن خالی رکھیں، دانیاں لگائیں؛ مسلسل بخار پر ٹیسٹ اور ڈاکٹر ضروری。',
  },
  {
    tag: 'Public service',
    tagUr: 'عوامی پیغام',
    icon: '💧',
    accent: 'green',
    title: 'ORS & dehydration',
    titleUr: 'آر او ایس اور پانی',
    body: 'Dry mouth, dizziness, or kids with loose stools: ORS sip-by-sip. DHUs and rural centres often stock packets cheaply.',
    bodyUr: 'خشک منہ، چکر، یا بچوں میں دست — ORS چُسکی چُسکی۔ سرکاری آسپتالوں میں سستے پیکٹ دستیاب ہوتے ہیں。',
  },
  {
    tag: 'Heat / آج',
    tagUr: 'گرمی',
    icon: '☀️',
    accent: 'blue',
    title: 'Heat & load-shedding days',
    titleUr: 'لوڈ شیڈنگ اور گرمی',
    body: 'When fans cut out in heat, move to cooler air, wet cloth on neck, and sip water. Elderly and babies tire faster.',
    bodyUr: 'بجلی جائے تو نم کپڑا، سایہ، پانی۔ بوڑھے اور چھوٹے بچے جلدی تھک جاتے ہیں — خاص خیال رکھیں。',
  },
  {
    tag: 'Pakistan',
    tagUr: 'پاکستان',
    icon: '🧼',
    accent: 'green',
    title: 'Typhoid & safe water',
    titleUr: 'ٹیفائڈ اور صاف پانی',
    body: 'Uncertain tap or tank water: boil or filter; street drinks with ice can carry bugs in summer outbreaks.',
    bodyUr: 'ٹینکی/نل کا مشکوک پانی اُبالیں۔ گلی کی بوتلوں اور برف سے احتیاط — گرمیوں میں خاص طور پر。',
  },
  {
    tag: 'Medicines',
    tagUr: 'دوائیں',
    icon: '💊',
    accent: 'blue',
    title: 'Use only as prescribed',
    titleUr: 'ڈاکٹر کے مطابق',
    body: 'Do not borrow tablets; finish antibiotic courses unless your doctor stops them. Check strips for expiry.',
    bodyUr: 'دوسرے کی دوا نہ لیں۔ انٹی بایوٹک مکمل کریں جب تک ڈاکٹر نہ روکے۔ ختم تاریخ دیکھیں。',
  },
  {
    tag: 'Emergency',
    tagUr: 'ایمرجنسی',
    icon: '📞',
    accent: 'green',
    title: 'When to go to ER',
    titleUr: 'فوراً ہسپتال',
    body: 'Severe breathlessness, crushing chest pain, heavy bleeding, seizures, or sudden weakness on one side — do not wait.',
    bodyUr: 'سانس نہ آئے، سینے میں شدید درد، بہت زیادہ خون، دورے، یا ایک طرف کمزوری — دیر نہ کریں۔',
  },
  {
    tag: 'Polio / Pakistan',
    tagUr: 'پولیو',
    icon: '💉',
    accent: 'green',
    title: 'Every drop counts',
    titleUr: 'قطرہ زندگی',
    body: 'National drives still run house-to-house — let vaccinators mark the finger; travel babies need drops on schedule.',
    bodyUr: 'پولیو ٹیم آئے تو ہمکاری کریں؛ سفر پر بچوں کا قطرہ شیڈول مکمل رکھیں — یہ ملک بھر کی ذمہ داری ہے。',
  },
  {
    tag: 'Smog / Punjab',
    tagUr: 'سموگ',
    icon: '🌫️',
    accent: 'blue',
    title: 'Winter air & lungs',
    titleUr: 'سردی کی فضا',
    body: 'Thick haze season: N95-style masks outdoors if you must go out; kids and asthmatics avoid peak traffic hours.',
    bodyUr: 'دھند/سموگ میں بچے اور دمہ والے احتیاط کریں؛ ماسک اور گھریلو ہوا صاف رکھیں جب ممکن ہو۔',
  },
  {
    tag: 'Hepatitis',
    tagUr: 'جگر',
    icon: '🩸',
    accent: 'blue',
    title: 'Hepatitis A/E & food',
    titleUr: 'ہیپاٹائٹس A اور E',
    body: 'Contaminated water and unhygienic stalls spike A/E; vaccine exists for A. Jaundice or pale stools — get tested early.',
    bodyUr: 'گندا پانی یا گلی کا کھانا — A/E کا خطرہ۔ یرقان یا ہلکہ رنگ کا پیشاب: جلد ٹیسٹ کروائیں۔',
  },
  {
    tag: 'TB awareness',
    tagUr: 'ٹی بی',
    icon: '🫁',
    accent: 'green',
    title: 'Cough over 2 weeks',
    titleUr: 'کھانسی دو ہفتوں سے',
    body: 'Free DOTS programmes exist; weight loss, night sweats, or blood-streaked sputum deserve a chest work-up.',
    bodyUr: 'لمبی کھانسی، وزن کم ہونا، رات کو پسینہ — ٹی بی مفت علاج میں آتا ہے؛ شرم نہ کریں، چیک کروائیں۔',
  },
  {
    tag: 'Diabetes',
    tagUr: 'ذیابیطس',
    icon: '🩺',
    accent: 'blue',
    title: 'Sugar control in Ramazan/off-season',
    titleUr: 'شوگر کی دیکھ بھال',
    body: 'Skip random herbal “cures”; walk after meals when safe, and monitor feet for cuts — infections hide in neuropathy.',
    bodyUr: 'جڑی بٹیوں کا انحصار چھوڑیں؛ پاؤں کے زخم چیک کریں — شوگر والوں میں جلدی انفیکشن ہو جاتا ہے。',
  },
  {
    tag: 'Blood pressure',
    tagUr: 'بلند فشار',
    icon: '❤️',
    accent: 'green',
    title: 'Hypertension — silent risk',
    titleUr: 'بلند فشار خون',
    body: 'Cheap BP checks at clinics; cut extra salt in achars and processed buns; medicine daily beats “only when headache”.',
    bodyUr: 'نمک کم کریں؛ دوا روزانہ لیں — صرف سر درد پر نہیں۔ کلینک پر سستا بی پی چیک کروائیں۔',
  },
  {
    tag: 'Maternal health',
    tagUr: 'ماں بچہ',
    icon: '🤱',
    accent: 'green',
    title: 'ANC visits matter',
    titleUr: 'حمل کی دیکھ بھال',
    body: 'LHW programmes and DHQs give folic/iron guidance; bleeding or severe swelling in pregnancy needs same-day review.',
    bodyUr: 'حمل میں باقاعدہ چیک اپ؛ خون بہنا یا چہرے پر سوجن — فوری مشورہ۔',
  },
  {
    tag: 'Child health',
    tagUr: 'بچے',
    icon: '🍼',
    accent: 'blue',
    title: 'Diarrhoea in toddlers',
    titleUr: 'بچوں میں دست',
    body: 'Continue breastfeeding + zinc courses as advised; watch for sunken eyes or no tears — urgent fluids.',
    bodyUr: 'دودھ جاری رکھیں؛ زنک کی خوراک — آنکھیں دھنسی ہوں تو فوراً علاج۔',
  },
  {
    tag: 'Nutrition',
    tagUr: 'غذائیت',
    icon: '🥣',
    accent: 'green',
    title: 'Anaemia & school meals',
    titleUr: 'خون کی کمی',
    body: 'Lentils, eggs when affordable, and screened iron if doctor suggests — tired kids may need labs, not only “tonics”.',
    bodyUr: 'تھکن صرف شربت سے نہیں جاتی؛ ڈاکٹر کے مشورے پر آئرن اور خوراک درست کریں۔',
  },
  {
    tag: 'Mental health',
    tagUr: 'دماغی صحت',
    icon: '🧠',
    accent: 'blue',
    title: 'Stress without shame',
    titleUr: 'دباؤ بغیر شرم',
    body: 'PMC-registered counsellors and hospital psychiatry exist in major cities — prolonged panic or sleep loss warrants care.',
    bodyUr: 'ذہنی دباؤ میں مدد مانگنا کمزوری نہیں؛ بڑے شہروں میں ماہر دستیاب ہیں۔',
  },
  {
    tag: 'Road safety',
    tagUr: 'ٹریفک',
    icon: '🏥',
    accent: 'blue',
    title: 'Helmets & RTA',
    titleUr: 'حادثات',
    body: 'Motorcycle trauma fills ERs — helmet, no phone while riding; keep emergency numbers saved for trips on motorways.',
    bodyUr: 'موٹرسائیکل پر ہیلمٹ لازمی؛ فون نہ چلائیں۔ لانگ روٹ پر نمبر محفوظ رکھیں۔',
  },
  {
    tag: 'Pharmacy',
    tagUr: 'فارمس',
    icon: '🏪',
    accent: 'green',
    title: 'Registered outlets',
    titleUr: 'رجسٹرڈ دوا خانہ',
    body: 'Ask for receipt and intact seals; report suspect copies to DRAP channels when you can.',
    bodyUr: 'رسید اور مہر ٹوٹی ہو تو شک کریں — DRAP کے ذریعے شکایت ممکن ہے۔',
  },
  {
    tag: 'Skin / season',
    tagUr: 'جلد',
    icon: '🧴',
    accent: 'blue',
    title: 'Scabies & crowded homes',
    titleUr: 'خارش (سرپھیلی)',
    body: 'Itchy webs between fingers spreads in hostels — hot wash bedding and whole household treatment when prescribed.',
    bodyUr: 'انگلیوں کے درمیان خارش پھیل سکتی ہے؛ کپڑے گرم پانی سے دھوئیں، گھر کے سب ارکان علاج۔',
  },
  {
    tag: 'Vision',
    tagUr: 'نظر',
    icon: '👁️',
    accent: 'green',
    title: 'Screen time & kids',
    titleUr: 'موبائل اور بچے',
    body: 'Outdoor play reduces myopia rise; flickering rural classrooms benefit from back-row kids getting eyes checked yearly.',
    bodyUr: 'باہر کھیلنا آنکھوں کے لیے بہتر ہے؛ اسکول میں پیچھے بیٹھے بچوں کی سالانہ چیک مفید ہے۔',
  },
  {
    tag: 'Dental',
    tagUr: 'دانت',
    icon: '🦷',
    accent: 'blue',
    title: 'Miswak is not enough alone',
    titleUr: 'مسواک',
    body: 'Sweet chai + supari habits drive caries; pain with swelling may need drainage — don’t rely only on painkillers.',
    bodyUr: 'چائے چینی اور سپاری دانت خراب کرتی ہے؛ سوجن درد — صرف گولی سے ہر دفعہ حل نہیں۔',
  },
  {
    tag: 'Rabies',
    tagUr: 'کتے کا کاٹنا',
    icon: '🐕',
    accent: 'green',
    title: 'Street dog bites',
    titleUr: 'کتے کا کاٹنا',
    body: 'Wash 15 minutes with soap; get ARV same day from major hospitals — don’t wait for the dog to “look sick”.',
    bodyUr: 'کاٹنے پر صابن سے دھوئیں؛ فوری انٹی ریبيز شاٹ — کتے کو دیکھ کر انتظار نہ کریں۔',
  },
  {
    tag: 'Today / tips',
    tagUr: 'آج',
    icon: '📅',
    accent: 'green',
    title: 'Small habit, big win',
    titleUr: 'آج ایک عادت',
    body: 'Ten minutes of walking after dinner when safe, plus one extra vegetable sabzi on the plate — builds slowly.',
    bodyUr: 'آج: کھانے کے بعد دس منٹ ٹہلنا اور ایک سبزی زیادہ — بیماری سے بچاؤ میں مدد۔',
  },
  {
    tag: 'COVID & flu',
    tagUr: 'نزلہ',
    icon: '😷',
    accent: 'blue',
    title: 'Winter respiratory mix',
    titleUr: 'سردی کھانسی',
    body: 'Mask when crowded; high fever or oxygen drop in elders — don’t self-treat pneumonia at home for days.',
    bodyUr: 'بھیڑ میں ماسک؛ بوڑھوں میں سانس پھولنا — گھریلو علاج میں دیر خطرناک ہے۔',
  },
  {
    tag: 'Kidney stones',
    tagUr: 'گردے',
    icon: '💠',
    accent: 'blue',
    title: 'Low water, hot plains',
    titleUr: 'پتھر',
    body: 'Plain water beats fuzzy drinks; sudden flank pain or blood in urine — ultrasound centres in cities help triage.',
    bodyUr: 'پانی زیادہ پیئیں؛ کمر یا پیٹ کے ایک طرف اچانک درد یا خون — جلد معائنہ۔',
  },
  {
    tag: 'Pakistan / floods',
    tagUr: 'سیلاب',
    icon: '🌊',
    accent: 'green',
    title: 'Flood aftermath hygiene',
    titleUr: 'سیلابی علاقے',
    body: 'Mud+stagnant water raises leptospirosis and worm risk — dry feet, boots if wading, and watch for fever after.',
    bodyUr: 'کیچڑ اور کھڑا پانی بیماریاں بڑھاتا ہے؛ جوتے پہن کر چلیں؛ بخار پر خیال رکھیں۔',
  },
  {
    tag: 'Thalassemia / PK',
    tagUr: 'تھیلیسیمیا',
    icon: '🧬',
    accent: 'blue',
    title: 'Carrier screening matters',
    titleUr: 'تھیلیسیمیا — ٹیسٹ',
    body: 'Before marriage, many families discuss thalassaemia carrier tests — reduces severe inherited anaemia births.',
    bodyUr: 'شادی سے پہلے کیریئر ٹیسٹ مفید ہیں؛ شدید جینی خون کی بیماری کم ہو سکتی ہے — معلومات ڈاکٹر سے لیں۔',
  },
  {
    tag: 'Malaria',
    tagUr: 'میلیریا',
    icon: '🗺️',
    accent: 'green',
    title: 'Travel to endemic belts',
    titleUr: 'سفر اور ملیریا',
    body: 'Rural southern/forest-edge travel in season: nets at night; cyclical fever with chills — thick/thin smear or RDT.',
    bodyUr: 'دیہاتی سفر میں رات کو دانیاں؛ بار بار بخار اور کپکپی — ٹیسٹ کروائیں، خود علاج طویل نہ کریں۔',
  },
  {
    tag: 'Snake bite',
    tagUr: 'سانپ',
    icon: '⚕️',
    accent: 'blue',
    title: 'No cutting / no herbs',
    titleUr: 'سانپ کا ڈسنا',
    body: 'Immobilise limb, reach a hospital with antivenom stock; tourniquets and snake-stone myths lose precious hours.',
    bodyUr: 'زخم کاٹنا یا جڑی بُٹی نہ — لمبا آرام، فوری ہسپتال جہاں اینٹی وینم ہو۔',
  },
  {
    tag: 'Vitamin D',
    tagUr: 'وٹامن ڈی',
    icon: '☀️',
    accent: 'green',
    title: 'Indoor routines & bone ache',
    titleUr: 'ہڈیوں کا درد',
    body: 'Many city office workers run low — safe sun on arms/legs when possible; supplements only if labs and doctor advise.',
    bodyUr: 'دھوپ حد میں مفید؛ گولیاں صرف ٹیسٹ اور مشورے پر — خود سے زیادہ ڈوز نہ کریں۔',
  },
  {
    tag: 'Cancer awareness',
    tagUr: 'کینسر',
    icon: '🎗️',
    accent: 'blue',
    title: 'Lumps, bleeding, weight loss',
    titleUr: 'گلٹی یا خون',
    body: 'New breast lump, blood in stool, or unexplained weight loss for weeks — early specialist review saves options.',
    bodyUr: 'چھاتی میں نئی گُلٹی، پیشاب یا پاخانہ میں خون، یا وزن اچانک کم — دیر مت کریں۔',
  },
  {
    tag: 'Elder care',
    tagUr: 'بزرگ',
    icon: '🦯',
    accent: 'green',
    title: 'Falls at home',
    titleUr: 'گرنا',
    body: 'Loose rugs, dim stairs, and low BP on standing — simple fixes plus walking aids cut fractures in parents.',
    bodyUr: 'پھسلاؤ فرش اور اندھیری سیڑھی سے بچیں؛ اچانک کھڑے ہونے پر چکر — علاج میں ڈاکٹر کی مدد لیں۔',
  },
  {
    tag: 'Work health',
    tagUr: 'دفتر',
    icon: '⌨️',
    accent: 'blue',
    title: 'Desk & neck strain',
    titleUr: 'گردن درد',
    body: 'Screen at eye level, shoulders relaxed, 20-20-20 breaks — chronic headaches often link to posture, not only stress.',
    bodyUr: 'سکرین آنکھ کے برابر؛ ہر بیس منٹ دور تک دیکھیں — مسلسل سخت گردن درد پر مشورہ۔',
  },
  {
    tag: 'Pakistan / milk',
    tagUr: 'دودھ',
    icon: '🥛',
    accent: 'green',
    title: 'Adulteration caution',
    titleUr: 'ملاوٹ',
    body: 'If milk smells odd, foams wrong, or prices are too good — prefer vetted brands or boil; kids dehydrate fast if diarrhoea.',
    bodyUr: 'شک پر اُبال کر یا معروف ذریعہ؛ بچوں میں ملاوٹی دودھ سے دست خطرناک ہو سکتے ہیں۔',
  },
];

/** Split items into two columns (alternate) for legacy layouts. */
export function healthFeedColumns() {
  const left = HEALTH_FEED_ITEMS.filter((_, i) => i % 2 === 0);
  const right = HEALTH_FEED_ITEMS.filter((_, i) => i % 2 === 1);
  return { left, right };
}

/**
 * @param {{ tag: string, tagUr: string, icon: string, accent: string, title: string, titleUr: string, body: string, bodyUr: string }} item
 * @param {'default' | 'compact'} [variant]
 */
export function renderHealthFeedCard(item, variant = 'default') {
  const ac = item.accent === 'green' ? 'health-feed-card--green' : 'health-feed-card--blue';
  const compact = variant === 'compact' ? ' health-feed-card--compact' : '';
  return `
    <article class="health-feed-card ${ac}${compact}">
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

/** Device “today” line — informational banner, not wired to external news APIs. */
export function getProcessingFeedDateLineHtml() {
  try {
    const d = new Date();
    const en = d.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    let ur = '';
    try {
      ur = d.toLocaleDateString('ur-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      ur = '';
    }
    const urPart = ur ? `<span dir="rtl" class="health-feed-today-ur">${escapeFeed(ur)}</span>` : '';
    return `<p class="health-feed-today-line" role="status"><span class="health-feed-today-badge">آج · Pakistan brief</span><span class="health-feed-today-en">${escapeFeed(en)}</span>${urPart}</p>`;
  } catch {
    return '';
  }
}

function escapeFeed(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
