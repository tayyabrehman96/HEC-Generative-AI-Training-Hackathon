/**
 * Sehat Saathi — Explanation Service
 * Urdu medical explanation generation using gemma4-31b
 */

import { CONFIG } from '../config.js';
import { chatCompletion } from './regoloApi.js';
import { PROMPTS } from '../utils/prompts.js';

/**
 * Generate patient-friendly Urdu explanation for a medication
 * @param {Object} medication - Medication object from NER
 * @returns {Promise<string>} Urdu explanation text
 */
export async function generateExplanation(medication) {
  try {
    const prompt = PROMPTS.EXPLANATION
      .replace('{brand_name}', medication.brand_name)
      .replace('{brand_name}', medication.brand_name)
      .replace('{generic_name}', medication.generic_name)
      .replace('{generic_name}', medication.generic_name)
      .replace('{dosage}', medication.dosage)
      .replace('{frequency}', medication.frequency)
      .replace('{duration_days}', medication.duration_days)
      .replace('{timing}', medication.timing);

    const result = await chatCompletion(
      CONFIG.MEDICAL_MODEL,
      [
        { role: 'system', content: 'You are a compassionate medical educator. Respond in Urdu script with Roman Urdu transliteration. Be warm and reassuring.' },
        { role: 'user', content: prompt },
      ],
      CONFIG.EXPLANATION_SETTINGS
    );

    return result.trim();
  } catch (error) {
    console.error('Explanation Service Error:', error);
    throw new Error('دوائی کی وضاحت بنانے میں مسئلہ ہوا۔');
  }
}

/**
 * Generate explanations for all medications
 * @param {Array} medications - Array of medication objects
 * @returns {Promise<Array>} Medications with explanations added
 */
export async function generateAllExplanations(medications) {
  const results = [];
  for (const med of medications) {
    try {
      const explanation = await generateExplanation(med);
      results.push({ ...med, explanation_urdu: explanation });
    } catch (error) {
      results.push({ ...med, explanation_urdu: 'وضاحت دستیاب نہیں ہے۔' });
    }
  }
  return results;
}
