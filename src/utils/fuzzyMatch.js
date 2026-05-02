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
 * @param {{ looseLen?: boolean }} [opts] - looseLen: relax length filter for Tab./Inj. fragments
 * @returns {Array} List of matches with scores
 */
export function findBestMatches(input, limit = 3, opts = {}) {
  if (!input || input.length < 3) return [];
  const inputLower = input.toLowerCase();
  const loose = opts.looseLen === true;
  const maxLenDiff = loose ? 12 : 5;

  const results = [];
  for (const med of MEDICINE_DB) {
    const brandLower = med.brand.toLowerCase();

    // Optimization 1: Exact match short-circuit
    if (inputLower === brandLower) {
      return [{ ...med, score: 0 }];
    }

    if (!loose && Math.abs(input.length - med.brand.length) > maxLenDiff) continue;

    const brandScore = getLevenshteinDistance(
      input.replace(/-/g, ''),
      med.brand.replace(/-/g, '')
    );
    const denom = Math.max(input.length, med.brand.length);
    const normalized = brandScore / denom;

    if (normalized < 0.42) {
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
  const candidates = new Set();
  const tryAdd = (fragment) => {
    const s = String(fragment || '')
      .replace(/^[(\[]\d+[)\]]\s*/, '')
      .trim();
    if (s.length < 3) return;
    const firstTok = s.split(/[\s/]+/)[0];
    for (const probe of [s.slice(0, 32), firstTok]) {
      if (probe.length < 3) continue;
      const matches = findBestMatches(probe, 1);
      let m = matches;
      if (!m.length && probe.length >= 4) {
        m = findBestMatches(probe, 1, { looseLen: true });
      }
      if (m.length > 0) {
        candidates.add(`${m[0].brand} (${m[0].generic})`);
      }
    }
  };

  const t = String(text || '');
  const lineRx = /(?:^|\n)\s*(?:\d+\.\s*)?(?:[-–—]\s*)?(?:Tab\.|Inj\.|Cap\.|Syp\.|Susp\.)\s*([^\n]+)/gi;
  let lm;
  while ((lm = lineRx.exec(t)) !== null) {
    tryAdd(lm[1]);
  }

  const words = t.split(/[\s,.;:\n()[\]{}]+/).filter((w) => w.length >= 4);
  words.forEach((word) => {
    const w = word.replace(/^\d+[.)]+$/, '');
    if (w.length < 4) return;
    const matches = findBestMatches(w, 1);
    if (matches.length > 0) {
      candidates.add(`${matches[0].brand} (${matches[0].generic})`);
    }
  });

  return Array.from(candidates);
}
