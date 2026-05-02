/**
 * Sehat Saathi — Fuzzy Matching Utility
 * Uses Levenshtein distance to find closest medicine matches
 */

import { MEDICINE_DB } from '../data/medicineDb.js';

/**
 * Calculate Levenshtein distance between two strings
 */
export function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => 
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Find the best medicine matches for a given string
 * @param {string} input - The messy OCR text
 * @param {number} limit - Max matches to return
 * @returns {Array} List of matches with scores
 */
export function findBestMatches(input, limit = 3) {
  if (!input || input.length < 3) return [];
  const inputLower = input.toLowerCase();

  const results = [];
  for (const med of MEDICINE_DB) {
    const brandLower = med.brand.toLowerCase();
    
    // Optimization 1: Exact match short-circuit
    if (inputLower === brandLower) {
      return [{ ...med, score: 0 }];
    }

    // Optimization 2: Length-based skip (if length difference is too large, skip)
    if (Math.abs(input.length - med.brand.length) > 5) continue;

    const brandScore = getLevenshteinDistance(input, med.brand);
    const normalized = brandScore / Math.max(input.length, med.brand.length);
    
    if (normalized < 0.4) { // Tightened threshold for better candidates
      results.push({ ...med, score: normalized });
    }
  }

  return results
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}


/**
 * Scan a block of text and find all potential medicine candidates
 */
export function scanForMedicines(text) {
  const words = text.split(/[\s,.;:\n]+/).filter(w => w.length >= 4);
  const candidates = new Set();

  words.forEach(word => {
    const matches = findBestMatches(word, 1);
    if (matches.length > 0) {
      candidates.add(`${matches[0].brand} (${matches[0].generic})`);
    }
  });

  return Array.from(candidates);
}
