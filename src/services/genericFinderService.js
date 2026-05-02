/**
 * Sehat Saathi — Generic Medicine Finder
 * Find cheaper generic alternatives using gemma4-31b
 */

import { CONFIG } from '../config.js';
import { chatCompletion } from './regoloApi.js';
import { PROMPTS } from '../utils/prompts.js';

/**
 * Find generic alternatives for a brand-name medicine
 * @param {Object} medication - Medication object
 * @returns {Promise<Array>} Array of generic alternatives
 */
export async function findGenerics(medication) {
  try {
    const prompt = PROMPTS.GENERIC_FINDER
      .replace('{brand_name}', medication.brand_name)
      .replace('{generic_name}', medication.generic_name)
      .replace('{dosage}', medication.dosage);

    const result = await chatCompletion(
      CONFIG.MEDICAL_MODEL,
      [
        { role: 'system', content: 'You are a Pakistani pharmaceutical expert. Return ONLY valid JSON arrays.' },
        { role: 'user', content: prompt },
      ],
      CONFIG.GENERIC_SETTINGS
    );

    let jsonStr = result.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Generic Finder Error:', error);
    return [];
  }
}
