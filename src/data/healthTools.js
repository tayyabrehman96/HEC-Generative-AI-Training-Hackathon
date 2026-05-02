/**
 * Non-prescription helpers: BMI math + Pakistan-oriented helpline hints.
 * Numbers are widely publicized but may vary by city — users should verify locally.
 */

export function computeBmi(weightKg, heightCm) {
  const h = Number(heightCm) / 100;
  const w = Number(weightKg);
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;
  const bmi = w / (h * h);
  return Math.round(bmi * 10) / 10;
}

export function bmiCategory(bmi) {
  if (bmi == null || Number.isNaN(bmi)) return null;
  if (bmi < 18.5) return { key: 'under', en: 'Underweight', ur: 'کم وزن' };
  if (bmi < 25) return { key: 'normal', en: 'Normal range', ur: 'معمول کی حد' };
  if (bmi < 30) return { key: 'over', en: 'Overweight', ur: 'زائد وزن' };
  return { key: 'obese', en: 'Obesity range', ur: 'موٹاپے کی رینج' };
}

export const PAKISTAN_HELPLINES = [
  { dial: '15', en: 'Police emergency', ur: 'پولیس ہنگامی' },
  { dial: '115', en: 'Ambulance (Edhi — common in major cities)', ur: 'ایدھی ایمبولینس' },
  { dial: '1122', en: 'Rescue 1122 (Punjab & other provinces — check coverage)', ur: 'ریسکیو ۱۱۲۲' },
  { dial: '130', en: 'Motorway police / NH&MP', ur: 'موٹروے پولیس' },
  { dial: '1992', en: 'Covid-19 helpline (MOH — verify current)', ur: 'کورونا ہیلپ لائن (تصدیق کریں)' },
];
