/**
 * Sehat Saathi — Drug Interaction Service
 * Drug interaction checking using gemma4-31b
 */

import { CONFIG } from '../config.js';
import { chatCompletion } from './regoloApi.js';
import { PROMPTS } from '../utils/prompts.js';

/**
 * Check for drug interactions among prescribed medications
 * @param {Array} medications - Array of medication objects
 * @returns {Promise<Array>} Array of interaction objects
 */
export async function checkInteractions(medications) {
  if (medications.length < 2) {
    return [];
  }

  try {
    const medsJson = JSON.stringify(
      medications.map(m => ({
        brand_name: m.brand_name,
        generic_name: m.generic_name,
        dosage: m.dosage,
      })),
      null,
      2
    );

    const prompt = PROMPTS.INTERACTION.replace('{medications_json}', medsJson);

    const result = await chatCompletion(
      CONFIG.MEDICAL_MODEL,
      [
        { role: 'system', content: 'You are a clinical pharmacist. Return ONLY valid JSON arrays. No markdown, no explanations.' },
        { role: 'user', content: prompt },
      ],
      CONFIG.INTERACTION_SETTINGS
    );

    // Parse JSON from response
    let jsonStr = result.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const interactions = JSON.parse(jsonStr);
    return interactions.map((interaction, index) => ({
      id: index + 1,
      ...interaction,
    }));
  } catch (error) {
    console.error('Interaction Service Error:', error);
    return [];
  }
}

/**
 * Get severity level for styling
 */
export function getSeverityLevel(severity) {
  switch (severity?.toUpperCase()) {
    case 'MAJOR': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'خطرناک', icon: '🔴' };
    case 'MODERATE': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'احتیاط', icon: '🟡' };
    case 'MINOR': return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'معمولی', icon: '🟢' };
    default: return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'نامعلوم', icon: '⚪' };
  }
}
