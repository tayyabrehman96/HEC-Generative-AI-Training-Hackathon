/**
 * Pure helpers for results screen — no API / pipeline logic.
 */

function safeLine(s) {
  const t = String(s ?? '').trim();
  if (!t || t === '—') return '';
  return t;
}

/**
 * Plain-text summary for WhatsApp / copy (Urdu-first labels).
 * @param {unknown[]} medications — normalized meds from state
 * @param {unknown[]} interactions — interaction hints
 * @param {{ maxChars?: number }} [opts]
 */
export function buildWhatsAppSummaryText(medications, interactions = [], opts = {}) {
  const maxChars = opts.maxChars ?? 1700;
  const lines = [
    '*صحت ساتھی — نسخے کا خلاصہ*',
    '(صرف معلومات — خوراک/دوا بدلنے سے پہلے ڈاکٹر یا فارمسسٹ)',
    '',
  ];

  if (!Array.isArray(medications) || medications.length === 0) {
    lines.push('(کوئی دوا پڑھی نہیں گئی — دوبارہ واضح تصویر آزمائیں)');
    return lines.join('\n').trim();
  }

  medications.forEach((med, i) => {
    const name = safeLine(med.brand_name || med.name) || `دوا ${i + 1}`;
    lines.push(`${i + 1}) *${name}*`);
    const g = safeLine(med.generic_name);
    if (g) lines.push(`   عام نام: ${g}`);
    const timing = safeLine(med.timing);
    if (timing) lines.push(`   وقت: ${timing}`);
    const usage = safeLine(med.usage_instructions);
    if (usage) lines.push(`   استعمال: ${usage}`);
    const cost = safeLine(med.cost_estimate_pkr);
    if (cost) lines.push(`   لاگت: ${cost}`);
    lines.push('');
  });

  if (Array.isArray(interactions) && interactions.length > 0) {
    lines.push('⚠️ *ممکنہ باہمی اثر (AI)* — فارمسسٹ سے تصدیق:');
    interactions.slice(0, 6).forEach((it) => {
      if (it && typeof it.pair === 'string') lines.push(`• ${it.pair}`);
    });
    lines.push('');
  }

  let out = lines.join('\n').trim();
  if (out.length > maxChars) {
    out = `${out.slice(0, maxChars - 50).trim()}\n\n…(بقیہ ایپ میں)`;
  }
  return out;
}

export function openWhatsAppWithText(text) {
  const u = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(u, '_blank', 'noopener,noreferrer');
}
