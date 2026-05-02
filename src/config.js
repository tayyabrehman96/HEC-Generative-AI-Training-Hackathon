/**
 * Sehat Saathi — Configuration
 * Regolo AI API settings and model configuration
 */

export const CONFIG = {
  // Same-origin /proxy in dev/preview (Vite forwards to Express). Override when deploying front-end separately:
  // build with VITE_API_BASE_URL=https://your-host/proxy
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/proxy',

  // Models
  OCR_MODEL: 'deepseek-ocr-2',
  VLM_MODEL: 'qwen3.5-122b',
  MEDICAL_MODEL: 'Llama-3.3-70B-Instruct',

  // Generation settings
  OCR_SETTINGS: {
    temperature: 0.1,
    max_tokens: 6144,
  },
  VLM_SETTINGS: {
    temperature: 0.15,
    max_tokens: 12288,
  },
  MEDICAL_CONSOLIDATION_SETTINGS: {
    temperature: 0.07,
    max_tokens: 12288,
  },
  NER_SETTINGS: {
    temperature: 0.1,
    max_tokens: 4096,
  },
  EXPLANATION_SETTINGS: {
    temperature: 0.4,
    max_tokens: 8192,
  },
  INTERACTION_SETTINGS: {
    temperature: 0.2,
    max_tokens: 4096,
  },
  GENERIC_SETTINGS: {
    temperature: 0.3,
    max_tokens: 4096,
  },

  // App settings
  MAX_IMAGE_SIZE_MB: 4,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};
