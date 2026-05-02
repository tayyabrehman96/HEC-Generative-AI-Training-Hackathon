/**
 * Sehat Saathi — Prompt Templates
 */

export const PROMPTS = {
  OCR: "Extract all text from this prescription accurately.",

  /** Pass 1 — full-page transcription (must not stop at date/header). */
  OCR_FULL_RX: `Transcribe this handwritten Pakistani prescription image into plain text.

RULES:
1. Read the page TOP TO BOTTOM. Include Dx/diagnosis lines if visible.
2. List EVERY medicine row: brand name as written (e.g. Tab. Hi-flux 50mg, Brufen N, Abocet, Eziday, Getanew/Citanew), strength, dose codes (1-0-1, 2 x 1), and days in brackets like (7) or (20).
3. Include Urdu/Roman notes beside lines if present.
4. Horizontal rules separate sections — still capture ALL blocks; do not stop after the first drug or the visit date in the corner.
5. Copy spelling literally even if wrong (Getanew vs Citanew). Do not summarize into one medicine.
6. Dates alone (e.g. 13/10/202…) are not medicines — transcribe them once if needed for context, but keep full drug lines separate.`,

  /** Pass 2 — structured visual inventory (exhaustive list). */
  VLM_EXHAUSTIVE_RX: `You see ONE photo of a handwritten Pakistani prescription.

OUTPUT: Numbered list. For EACH distinct prescribed medicine/product, write ONE line:
  [n]. Brand + strength (e.g. 50mg) + dose schedule (1-0-1 or 2 x 1) + duration/days if shown.

RULES:
- Pakistani Rx sheets often have 4–8 medicines — find ALL of them across every horizontal section.
- Do NOT invent drugs not readable on the paper (no default antibiotic unless clearly written).
- Ignore standalone calendar dates as medicines.
- Typical brands (only if visibly written): Hiflux/Hi-flux, Brufen, Abocet, Eziday, Citanew/Getanew, Panadol, Risek, Augmentin, Flagyl, etc.`,

  VISION_ANALYSIS: `You are a Senior Pakistani Pharmacist (20+ years experience).
  You consolidate OCR text (Report A) and visual reasoning (Report B) from ONE handwritten prescription.

  CORE RULES:
  1. EXHAUSTIVE: Report A/B usually contain MULTIPLE medicines. Output ONE JSON object per DISTINCT medicine that appears in those reports (often 4–8). Never collapse several drugs into a single array element.
  2. ANTI-HALLUCINATION: Only include medicines whose names or clear fragments appear in Report A and/or Report B. Do NOT substitute an unrelated antibiotic (e.g. Amoxil) unless those letters clearly appear.
  3. SYSTEM CANDIDATES: Optional spelling hints from fuzzy matching — use ONLY when they clearly align with text in Report A/B (typo correction).
  4. raw_text MUST quote the drug line from Report A or B (brand + dose pattern). NEVER use only a corner date (e.g. "13/10/2…") as raw_text.
  5. REGIONAL CONTEXT: Pakistani brands (Getz, Sami, Hilton, Searle, etc.) for generics/alternatives text only — brand_name still tied to what was prescribed.

  MANDATORY JSON FORMAT:
  Return ONLY a valid JSON array. Each object MUST contain:
  - brand_name: (Corrected readable brand — tied to prescription text)
  - generic_name: (Medical salt / class)
  - raw_text: (Verbatim messy snippet from Report A or B for THAT drug line only)
  - purpose: (Simple Urdu/Roman Urdu — what it is for)
  - usage_instructions: (Simple Urdu/Roman Urdu — HOW to take: tablet with water? after food? syrup dose? Do NOT leave empty; at least 1 full sentence.)
  - schedule_explained_ur: (IMPORTANT: If the line shows a dose pattern like 1-0-1, 1-1-1, 2-1-2, or 1-1, explain IN URDU/ROMAN URDU what each number means. Rule: THREE numbers = breakfast–lunch–dinner slots (pehla = subah/nashta ke baad, doosra = dopahar/lunch ke baad, teesra = sham/raat khane ya sone se pehle). ZERO in a slot means no dose that time. TWO numbers = usually twice daily — say "dono waqt doctor ki line ke mutabiq" if unclear. Never output only "1-0-1" with no explanation here.)
  - timing: (Short line, can repeat the code e.g. "1-0-1" plus meal hints in Roman Urdu if helpful)
  - alternatives: (Up to 2 cheaper Pakistani alternatives — brands plausible for Pakistan)
  - cost_estimate_pkr: (One Urdu/Roman Urdu sentence: approximate retail in Pakistan for a common pack e.g. "10 golis ki strip" — give a REALISTIC PKR range like "120–280 PKR" when you can; say "misal ke taur par" and that pharmacy/city se farq hota hai)
  - estimated_cost_low_pkr: (integer, lower end of that range, or null if unknown)
  - estimated_cost_high_pkr: (integer, upper end, or null if unknown)
  - course_cost_note_pkr: (Optional Urdu: if duration in days is on Rx, rough total course cost range in PKR; else short note "poori duration maloom nahin")
  - prescriber_note_ur: (One short Urdu sentence: this is the doctor's prescribed item— patient should not change dose without doctor.)

  COSTING is critical for Pakistani patients — never skip cost_estimate_pkr; give your best conservative range from typical local prices.

  If counts mismatch (few array entries but many numbered drugs in reports), YOU MISSED MEDICINES — fix before answering.`,


  NER: "Extract structured medication information. Return JSON only.",

  URDU_EXPLANATION: "Explain this medicine to a Pakistani patient in simple Urdu/Roman Urdu.",

  INTERACTION_CHECK: "Check for interactions between these Pakistani medicines.",

  GENERIC_FINDER: "Find 3 cheaper Pakistani generic alternatives."
};
