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

const NO_ALT =
  'No safe alternative suggestion without pharmacist review';

/**
 * Normalize API/LLM medication — supports new pharmacy card shape (name, summary, …)
 * and legacy fields (brand_name, usage_instructions, …).
 */
export function normalizeMedication(m, index) {
  const raw = m || {};

  const isNewShape = raw.name != null || (raw.summary != null && raw.brand_name == null);

  const name = String(raw.name || raw.brand_name || '').trim() || `Medicine ${index + 1}`;
  const summary = String(raw.summary || '').trim();
  const purpose =
    String(raw.purpose || '').trim() ||
    (isNewShape
      ? 'Purpose not confidently identified — pharmacist/doctor verification needed'
      : '—');

  const usage = String(raw.usage || raw.usage_instructions || '').trim() || '—';

  const timing = String(raw.timing || '').trim() || '—';
  const rawLine = String(raw.raw_text || raw.rx_line || raw.raw_line || '').trim();
  const salt = String(raw.generic_name || '').trim();

  const fallback = explainScheduleFromCode(`${rawLine} ${timing} ${purpose}`);

  const scheduleFromModel = String(raw.schedule_explained_ur || '').trim();
  const schedule_explained_ur =
    scheduleFromModel || (fallback.ur && !scheduleFromModel ? fallback.ur : '') || '';

  const costStr = String(raw.cost || raw.cost_estimate_pkr || '').trim();

  let altList = [];
  if (Array.isArray(raw.alternatives)) {
    altList = raw.alternatives.map((x) => String(x).trim()).filter(Boolean);
  } else {
    const s = String(raw.alternatives || '').trim();
    if (s && s !== '—') altList = s.split(/[;,]+/).map((x) => String(x).trim()).filter(Boolean);
  }

  const alternativesText =
    altList.length > 0 ? altList.join('; ') : isNewShape ? NO_ALT : String(raw.alternatives || '').trim() || '—';

  const warning = String(raw.warning || raw.prescriber_note_ur || '').trim();
  const confidence = String(raw.confidence || 'Medium').trim();

  const costLow = raw.estimated_cost_low_pkr != null ? Number(raw.estimated_cost_low_pkr) : null;
  const costHigh = raw.estimated_cost_high_pkr != null ? Number(raw.estimated_cost_high_pkr) : null;
  const fromText = extractPkrRange(costStr);
  const low = Number.isFinite(costLow) ? costLow : fromText.low;
  const high = Number.isFinite(costHigh) ? costHigh : fromText.high;

  let spotPkr = null;
  if (low != null && high != null) spotPkr = Math.round((low + high) / 2);
  else if (low != null) spotPkr = Math.round(low);
  else if (high != null) spotPkr = Math.round(high);

  const priceHintUr =
    ' اندازاً عام فارمیسی فروخت (ماڈل کا مارکیٹ علم)؛ لائیو/حتمی قیمت نہیں — خریدنے سے پہلے فارمسسٹ سے تصدیق کریں۔';

  let priceNote = costStr.trim();
  if (spotPkr != null && spotPkr > 0) {
    priceNote = `≈ PKR ${spotPkr.toLocaleString('en-PK')}.${priceHintUr}`;
  } else if (!priceNote) {
    priceNote = isNewShape ? 'Cost not available' : 'اندازاً — پاکستانی مارکیٹ میں قیمتیں مختلف ہوتی ہیں؛ فارمیسی سے تصدیق کریں۔';
  }

  const courseNote = String(raw.course_cost_note_pkr || '').trim();

  return {
    ...raw,
    brand_name: name,
    generic_name: salt || (isNewShape ? '' : String(raw.generic_name || '').trim() || '—'),
    card_summary: summary,
    confidence,
    alternatives_list: altList,
    raw_text: rawLine || (isNewShape ? `—` : String(raw.raw_text || '').trim() || '—'),
    purpose,
    usage_instructions: usage,
    schedule_explained_ur,
    timing,
    alternatives: alternativesText,
    cost_estimate_pkr: priceNote,
    course_cost_note_pkr: courseNote,
    estimated_cost_low_pkr: low,
    estimated_cost_high_pkr: high,
    estimated_spot_pkr: spotPkr,
    prescriber_note_ur: warning,
  };
}

export function aggregateCostStats(medications) {
  let totalSpot = 0;
  let count = 0;
  const rows = [];

  medications.forEach((med, i) => {
    let spot =
      med.estimated_spot_pkr != null && Number.isFinite(Number(med.estimated_spot_pkr))
        ? Math.round(Number(med.estimated_spot_pkr))
        : null;
    let low = med.estimated_cost_low_pkr;
    let high = med.estimated_cost_high_pkr;
    if (low == null && high == null) {
      const r = extractPkrRange(med.cost_estimate_pkr);
      low = r.low;
      high = r.high ?? r.low;
    }
    if (spot == null && (low != null || high != null)) {
      if (low != null && high != null) spot = Math.round((low + high) / 2);
      else spot = Math.round(low ?? high ?? 0);
    }

    const hasNumeric = spot != null && spot > 0;
    const costText = String(med.cost_estimate_pkr || '').trim() || 'Cost not available';

    if (hasNumeric) {
      totalSpot += spot;
      count++;
      rows.push({
        index: i,
        label: med.brand_name,
        spot,
        noNumeric: false,
        costText,
      });
    } else {
      rows.push({
        index: i,
        label: med.brand_name,
        spot: null,
        noNumeric: true,
        costText,
      });
    }
  });

  const spots = rows.filter((r) => r.spot != null).map((r) => r.spot);
  const maxSpot = spots.length ? Math.max(...spots, 1) : 1;
  return {
    rows,
    totalSpot,
    hasNumeric: count > 0,
    maxSpot,
  };
}
