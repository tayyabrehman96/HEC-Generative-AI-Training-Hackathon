/**
 * Normalize API/LLM medication objects and decode common PK dose codes (e.g. 1-0-1).
 */

const SLOT_LABELS_UR = [
  { key: 'subah', ur: 'صبح (ناشتہ کے ساتھ یا بعد)', en: 'Morning — with or after breakfast' },
  { key: 'dopahar', ur: 'دوپہر (لنچ کے ساتھ یا بعد)', en: 'Afternoon — with or after lunch' },
  { key: 'sham', ur: 'شام / رات (رات کے کھانے کے ساتھ یا سونے سے پہلے)', en: 'Evening / night — with dinner or before sleep' },
];

/**
 * Find patterns like 1-0-1, 2-1-2, or 1-1 (two-slot).
 * @param {string} text
 * @returns {{ parts: number[] } | null}
 */
export function parseDoseCode(text) {
  const s = String(text || '');
  const triple = s.match(/\b(\d+)\s*[-–]\s*(\d+)\s*[-–]\s*(\d+)\b/);
  if (triple) {
    return { parts: [parseInt(triple[1], 10), parseInt(triple[2], 10), parseInt(triple[3], 10)] };
  }
  const pair = s.match(/\b(\d+)\s*[-–]\s*(\d+)\b(?!\s*[-–]\s*\d)/);
  if (pair) {
    return { parts: [parseInt(pair[1], 10), parseInt(pair[2], 10)] };
  }
  return null;
}

/**
 * Build Urdu + English lines explaining the code (fallback when model omits).
 */
export function explainScheduleFromCode(text) {
  const parsed = parseDoseCode(text);
  if (!parsed) return { ur: '', en: '', linesUr: [] };

  const { parts } = parsed;
  if (parts.length === 3) {
    const [a, b, c] = parts;
    const lines = [];
    if (a > 0) lines.push(`${SLOT_LABELS_UR[0].ur}: ${a} خوراک`);
    if (b > 0) lines.push(`${SLOT_LABELS_UR[1].ur}: ${b} خوراک`);
    if (c > 0) lines.push(`${SLOT_LABELS_UR[2].ur}: ${c} خوراک`);
    const skipped = [];
    if (a === 0) skipped.push('صبح کچھ نہیں');
    if (b === 0) skipped.push('دوپہر کچھ نہیں');
    if (c === 0) skipped.push('شام والی خوراک نہیں');
    const ur =
      lines.length > 0
        ? `فارمٹ ${a}-${b}-${c} کا مطلب: ${lines.join('؛ ')}۔` +
          (skipped.length ? ` (${skipped.join('، ')})` : '')
        : '';
    return { ur, en: `Pattern ${a}-${b}-${c}: doses align to breakfast / lunch / dinner slots.`, linesUr: lines };
  }

  if (parts.length === 2) {
    const [x, y] = parts;
    const ur = `دو عدد والا کوڈ ${x}-${y}: اکثر دن میں دو بار (صبح/شام) ہو سکتا ہے؛ درست وقت ڈاکٹر کی لائن کے مطابق ہوتا ہے۔ یقین نہ ہو تو ڈاکٹر یا فارمسسٹ سے پوچھیں۔`;
    return { ur, en: `Two-part code ${x}-${y}: often twice daily; confirm timing with your prescriber.`, linesUr: [] };
  }

  return { ur: '', en: '', linesUr: [] };
}

/** Extract first two integers that look like PKR amounts from a string. */
export function extractPkrRange(str) {
  if (!str) return { low: null, high: null };
  const nums = String(str).match(/\d[\d,]*/g);
  if (!nums || nums.length === 0) return { low: null, high: null };
  const values = nums.map((n) => parseInt(n.replace(/,/g, ''), 10)).filter((n) => !Number.isNaN(n) && n > 0);
  if (values.length === 0) return { low: null, high: null };
  if (values.length === 1) return { low: values[0], high: values[0] };
  const sorted = [...values].sort((a, b) => a - b);
  return { low: sorted[0], high: sorted[sorted.length - 1] };
}

/**
 * Ensure all expected keys exist; attach fallback schedule explanation from raw/timing.
 */
export function normalizeMedication(m, index) {
  const raw = m || {};
  const rawText = String(raw.raw_text || '');
  const timing = String(raw.timing || '');
  const fallback = explainScheduleFromCode(`${rawText} ${timing}`);

  const schedule =
    String(raw.schedule_explained_ur || '').trim() ||
    (fallback.ur ? fallback.ur : '');

  const usage = String(raw.usage_instructions || '').trim();

  const priceNote = String(raw.cost_estimate_pkr || raw.price_indicative_pkr || '').trim();
  const courseNote = String(raw.course_cost_note_pkr || '').trim();
  const costLow = raw.estimated_cost_low_pkr != null ? Number(raw.estimated_cost_low_pkr) : null;
  const costHigh = raw.estimated_cost_high_pkr != null ? Number(raw.estimated_cost_high_pkr) : null;
  const fromText = extractPkrRange(priceNote);
  const low = Number.isFinite(costLow) ? costLow : fromText.low;
  const high = Number.isFinite(costHigh) ? costHigh : fromText.high;

  return {
    ...raw,
    brand_name: raw.brand_name || `Medicine ${index + 1}`,
    generic_name: raw.generic_name || '—',
    raw_text: rawText || '—',
    purpose: String(raw.purpose || '').trim() || '—',
    usage_instructions: usage || schedule || fallback.ur || '—',
    schedule_explained_ur: schedule,
    timing: timing || '—',
    alternatives: String(raw.alternatives || '').trim() || '—',
    cost_estimate_pkr: priceNote || 'اندازاً — پاکستانی مارکیٹ میں قیمتیں مختلف ہوتی ہیں؛ فارمیسی سے تصدیق کریں۔',
    course_cost_note_pkr: courseNote,
    estimated_cost_low_pkr: low,
    estimated_cost_high_pkr: high,
    prescriber_note_ur: String(raw.prescriber_note_ur || '').trim(),
  };
}

export function aggregateCostStats(medications) {
  let lowSum = 0;
  let highSum = 0;
  let count = 0;
  const rows = [];

  medications.forEach((med, i) => {
    let low = med.estimated_cost_low_pkr;
    let high = med.estimated_cost_high_pkr;
    if (low == null && high == null) {
      const r = extractPkrRange(med.cost_estimate_pkr);
      low = r.low;
      high = r.high ?? r.low;
    }
    if (low != null || high != null) {
      const L = low ?? high ?? 0;
      const H = high ?? low ?? 0;
      lowSum += L;
      highSum += H;
      count++;
      rows.push({ index: i, label: med.brand_name, low: L, high: H, mid: (L + H) / 2 });
    }
  });

  const maxMid = rows.length ? Math.max(...rows.map((r) => r.mid), 1) : 1;
  return {
    rows,
    lowSum,
    highSum,
    hasNumeric: count > 0,
    maxMid,
  };
}
