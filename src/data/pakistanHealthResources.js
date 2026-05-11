/**
 * Curated, informational copy for Pakistan users — verify locally (numbers and units change).
 * Does not replace official medical advice or live emergency routing.
 */

export const ORS_BRAND_NOTES = {
  ur:
    'فارمیسی میں WHO فارمولے والے ORS پیکٹ مختلف کمپنیوں کے نام سے ملتے ہیں۔ اصل چیک: لیبل پر لکھا معیار اور واضع ہدایات۔ مشکوک یا کھلا پیکٹ نہ لیں۔',
  en: 'ORS sachets sold under many brand names usually follow the WHO formula. Read the packet label for mixing volume; discard damaged sachets.',
};

/**
 * Where to seek care — generic guidance only (no live routing).
 */
export const SEEK_CARE_GUIDANCE = [
  {
    ur: 'نگراں / ہنگامی: 1122 جہاں دستیاب ہو؛ شہر کے مطابقایمبولینس (مثلاً 115) تصدیق کریں۔',
    en: 'Emergency / ambulance: 1122 where available; confirm local ambulance short codes (e.g. 115) for your city.',
  },
  {
    ur: 'عام علاج: ضلعی ہیڈکوارٹر (DHQ) / تحصیل ہیڈکوارٹر (THQ) ہسپتالوں سے سرکاری طب کے فریق پوچھیں۔',
    en: 'Non-emergency public care: ask locally about DHQ/THQ hospitals and DHUs in your district.',
  },
  {
    ur: 'دوائیوں کی درست خوراک اور بدل — ہمیشہ لائسنس یافتہ فارمسسٹ یا ڈاکٹر۔',
    en: 'Dose changes or substitutes — always confirm with a licensed pharmacist or doctor.',
  },
];

/** Open standards & reference portals (education / interoperability). */
export const OPEN_HEALTH_LINKS = [
  {
    label: 'WHO — nutrition & food safety',
    labelUr: 'عالمی ادارہ صحت — غذائیات',
    url: 'https://www.who.int/teams/nutrition-and-food-safety',
  },
  {
    label: 'HL7 FHIR — MedicationStatement',
    labelUr: 'FHIR معیار — دوا بیان',
    url: 'https://www.hl7.org/fhir/medicationstatement.html',
  },
  {
    label: 'OpenFDA — open US drug data (reference layout)',
    labelUr: 'OpenFDA — امریکی ڈیٹا (صرفحوالہ)',
    url: 'https://open.fda.gov/',
  },
];
