/**
 * Sehat Saathi — Configuration
 * Regolo AI API settings and model configuration
 */

/** Empty or wrong API base breaks fetch (e.g. "/chat/completions" instead of "/proxy/..."). */
function normalizeApiBaseUrl(raw) {
  const isEmpty = raw == null || String(raw).trim() === '';
  let v = isEmpty ? '/proxy' : String(raw).trim();

  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      let path = u.pathname.replace(/\/+$/, '');
      if (path === '') path = '/';
      const segments = path.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      if (last !== 'proxy') {
        path = path === '/' ? '/proxy' : `${path}/proxy`;
      }
      return `${u.origin}${path}`.replace(/\/+$/, '');
    } catch {
      return '/proxy';
    }
  }

  if (!v.startsWith('/')) v = `/${v}`;
  v = v.replace(/\/+$/, '');
  return v || '/proxy';
}

export const CONFIG = {
  // Same-origin `/proxy` in production (Express). Dev: Vite proxies `/proxy` → Express.
  // Split deploy: set VITE_API_BASE_URL=https://your-api.example.com (origin only is OK — `/proxy` is appended).
  API_BASE_URL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),

  // Models
  OCR_MODEL: 'deepseek-ocr-2',
  VLM_MODEL: 'qwen3.5-122b',
  MEDICAL_MODEL: 'Llama-3.3-70B-Instruct',

  // Generation settings
  OCR_SETTINGS: {
    temperature: 0.1,
    /** Pass 1 full-page Rx transcription — avoid finish_reason=length mid-page. */
    max_tokens: 16384,
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
