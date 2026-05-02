/**
 * Sehat Saathi — Drug interaction hints (same prescription list)
 * Uses consolidation model; output is educational only — not a substitute for pharmacist review.
 */

import { CONFIG } from '../config.js';
import { chatCompletion } from './regoloApi.js';
import { PROMPTS } from '../utils/prompts.js';

function parseInteractionResponse(raw) {
  if (!raw || typeof raw !== 'string') return [];
  let s = raw.trim();
  if (s.includes('```')) {
    const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) s = m[1].trim();
  }
  try {
    const data = JSON.parse(s);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.interactions)) return data.interactions;
    return [];
  } catch {
    return [];
  }
}

/**
 * @param {Array<object>} medications - normalized medication objects from results
 * @returns {Promise<Array<{ pair: string, severity: string, note_en: string, note_ur: string }>>}
 */
export async function checkInteractions(medications) {
  if (!Array.isArray(medications) || medications.length < 2) {
    return [];
  }

  const medsJson = JSON.stringify(
    medications.map((m) => ({
      brand_name: m.brand_name,
      generic_name: m.generic_name || '',
      timing: m.timing && m.timing !== '—' ? m.timing : '',
      usage: m.usage_instructions && m.usage_instructions !== '—' ? m.usage_instructions : '',
    })),
    null,
    2
  );

  const prompt = PROMPTS.INTERACTION_CHECK.replace('{medications_json}', medsJson);

  const result = await chatCompletion(
    CONFIG.MEDICAL_MODEL,
    [
      {
        role: 'system',
        content:
          'You are a clinical pharmacist assistant. Return ONLY a valid JSON array as instructed. No markdown fences, no extra keys at root.',
      },
      { role: 'user', content: prompt },
    ],
    CONFIG.INTERACTION_SETTINGS
  );

  const parsed = parseInteractionResponse(result);
  return parsed
    .filter((x) => x && typeof x.pair === 'string' && typeof x.severity === 'string')
    .map((interaction, index) => ({
      id: index + 1,
      pair: interaction.pair,
      severity: String(interaction.severity).toUpperCase(),
      note_en: String(interaction.note_en || '').trim() || '—',
      note_ur: String(interaction.note_ur || '').trim() || '—',
    }));
}

/**
 * @param {string} severity
 * @returns {{ color: string, bg: string, label: string, icon: string }}
 */
export function getSeverityLevel(severity) {
  switch (String(severity || '').toUpperCase()) {
    case 'MAJOR':
      return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'خطرناک / Major', icon: '🔴' };
    case 'MODERATE':
      return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'احتیاط / Moderate', icon: '🟡' };
    case 'MINOR':
      return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'معمولی / Minor', icon: '🟢' };
    default:
      return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'نامعلوم', icon: '⚪' };
  }
}
