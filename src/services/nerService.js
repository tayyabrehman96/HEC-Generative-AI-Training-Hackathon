/**
 * Sehat Saathi — NER Service
 * Medical Named Entity Recognition using gemma4-31b
 */

import { CONFIG } from '../config.js';
import { chatCompletion } from './regoloApi.js';
import { PROMPTS } from '../utils/prompts.js';

/**
 * Extract structured medication data from OCR text
 * @param {string} ocrText - Raw text from OCR
 * @returns {Promise<Array>} Array of medication objects
 */
export async function extractMedications(ocrText) {
  try {
    const prompt = PROMPTS.NER.replace('{ocr_text}', ocrText);

    console.log('[NER] Requesting extraction for text:', ocrText.substring(0, 100));
    
    const result = await chatCompletion(
      CONFIG.MEDICAL_MODEL,
      [
        { role: 'system', content: 'You are a medical NER expert. Return ONLY valid JSON arrays. No markdown, no explanations.' },
        { role: 'user', content: prompt },
      ],
      CONFIG.NER_SETTINGS
    );

    console.log('[NER] Raw response:', result);

    // Parse JSON from response
    let jsonStr = result.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonStr = match[1].trim();
      } else {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }
    }

    try {
      const medications = JSON.parse(jsonStr);
      
      if (!Array.isArray(medications)) {
        console.warn('[NER] Result is not an array:', medications);
        return [];
      }

      // Validate and normalize
      return medications.map((med, index) => ({
        id: index + 1,
        brand_name: med.brand_name || med.drug_name || 'Unknown',
        generic_name: med.generic_name || med.salt || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        frequency_code: med.frequency_code || '',
        duration_days: med.duration_days || med.duration || 0,
        timing: med.timing || '',
        route: med.route || 'Oral',
        special_instructions: med.special_instructions || '',
      }));
    } catch (parseError) {
      console.error('[NER] JSON Parse Error:', parseError, 'Raw string:', jsonStr);
      // Fallback: try to extract something manually if JSON fails
      return [];
    }
  } catch (error) {
    console.error('NER Service Error:', error);
    return [];
  }
}
