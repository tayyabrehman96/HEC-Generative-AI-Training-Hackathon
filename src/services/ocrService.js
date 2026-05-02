/**
 * Sehat Saathi — OCR Service
 * Prescription image scanning using deepseek-ocr-2
 */

import { CONFIG } from '../config.js';
import { visionCompletion } from './regoloApi.js';
import { PROMPTS } from '../utils/prompts.js';

/**
 * Scan a prescription image and extract text
 * @param {string} imageBase64 - Base64-encoded image data
 * @returns {Promise<string>} Extracted text from the prescription
 */
export async function scanPrescription(imageBase64) {
  try {
    const result = await visionCompletion(
      CONFIG.OCR_MODEL,
      PROMPTS.OCR,
      imageBase64,
      CONFIG.OCR_SETTINGS
    );
    return result.trim();
  } catch (error) {
    console.error('OCR Service Error:', error);
    throw new Error('دوائی کا نسخہ پڑھنے میں مسئلہ ہوا۔ براہ کرم دوبارہ کوشش کریں۔');
  }
}
