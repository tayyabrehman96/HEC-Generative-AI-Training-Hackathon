/**
 * Sehat Saathi — Regolo AI API Wrapper
 * OpenAI-compatible API client for Regolo AI
 */

import { CONFIG } from '../config.js';

/**
 * Verify Vite dev proxy can reach Express (does not call Regolo).
 */
export async function checkProxyHealth() {
  const base = String(CONFIG.API_BASE_URL ?? '/proxy').replace(/\/+$/, '');
  const url = `${base}/health`;
  try {
    const response = await fetch(url, { method: 'GET' });
    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { _rawSnippet: raw.slice(0, 280) };
    }

    if (!response.ok) {
      const upstream =
        typeof data.error === 'string'
          ? data.error
          : typeof data.snippet === 'string'
            ? data.snippet
            : typeof data.message === 'string'
              ? data.message
              : null;
      const detail = upstream ?? (data._rawSnippet ? `${data._rawSnippet}` : null);

      let error;
      if (response.status === 404) {
        error =
          'Proxy returned 404 on /proxy/health — stop old Node processes, free port 3001, then run `npm run dev:all`.';
      } else if (response.status === 503 || data.service === 'vite-proxy-bridge') {
        error =
          upstream ??
          'Vite cannot reach Express on port 3001. Start `npm run proxy` (or `npm run dev:all`) with REGOLO_API_KEY in `.env`.';
      } else if (response.status === 500) {
        error =
          upstream ??
          (detail?.trim()
            ? `Proxy health check HTTP 500: ${detail.trim()}`
            : `HTTP 500 from ${url}. Another process may be using port 3001 (not Sehat Saathi's Express). Confirm \`curl http://127.0.0.1:3001/proxy/health\` returns JSON with "service":"sehat-saathi-proxy".`);
      } else {
        error =
          upstream ?? `Proxy health check failed (HTTP ${response.status})${detail ? `: ${detail}` : ''}`;
      }

      return { ok: false, error };
    }

    if (data.service !== 'sehat-saathi-proxy' || data.ok !== true) {
      return {
        ok: false,
        error:
          typeof data.error === 'string'
            ? data.error
            : `Port 3001 returned HTTP 200 but not Sehat Saathi health JSON (${url}). Another process may occupy 3001; stop it or set PORT in .env and redeploy.`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: `Cannot reach ${url}: ${err?.message ?? err}. Run \`npm run dev:all\` (or \`npm run proxy\` + \`npm run dev\`).`,
    };
  }
}

/** Some models (e.g. Qwen with reasoning) put text in reasoning_content while content stays empty — breaks downstream prompts if ignored. */
function textFromAssistantMessage(message) {
  if (!message || typeof message !== 'object') return '';
  let c = message.content;
  if (typeof c === 'string' && c.trim()) return c.trim();
  if (Array.isArray(c)) {
    const chunks = [];
    for (const part of c) {
      if (!part || typeof part !== 'object') continue;
      if (part.type === 'text' && typeof part.text === 'string') chunks.push(part.text);
    }
    const joined = chunks.join('\n').trim();
    if (joined) return joined;
  }
  const r = message.reasoning_content ?? message.reasoning;
  if (typeof r === 'string' && r.trim()) return r.trim();
  return '';
}

/**
 * Make a chat completion request to Regolo AI
 */
export async function chatCompletion(model, messages, settings = {}) {
  let response;
  try {
    response = await fetch(`${CONFIG.API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: {
          model,
          messages,
          temperature: settings.temperature ?? 0.3,
          max_tokens: settings.max_tokens ?? 4096,
          stream: false,
        },
      }),
    });
  } catch (err) {
    const detail = err?.message ?? String(err);
    const base = String(CONFIG.API_BASE_URL ?? '/proxy');
    console.error('[Regolo] Fetch failed:', detail, '→', `${base}/chat/completions`);
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const hint = isLocalhost
      ? 'Locally: run `npm run dev:all` (or `npm run proxy` in one terminal + `npm run dev` in another) and ensure `.env` has REGOLO_API_KEY.'
      : 'Production: open the app from the same host that serves `/proxy` (e.g. your Railway URL). If the UI is on another domain, build with `VITE_API_BASE_URL=https://your-backend.example.com` (see `.env.example`).';
    throw new Error(`Cannot reach the API proxy (${detail}). ${hint}`);
  }

  const rawText = await response.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    console.error('Proxy returned non-JSON:', response.status, rawText.slice(0, 500));
    throw new Error(`Proxy error (${response.status}): invalid JSON — ${rawText.slice(0, 400)}`);
  }

  if (!response.ok) {
    console.error('Regolo API Error:', response.status, data);
    const detail =
      typeof data.error === 'string'
        ? data.error
        : typeof data.error?.message === 'string'
          ? data.error.message
          : data.snippet ?? JSON.stringify(data);
    const cause =
      typeof data.cause === 'string' && data.cause.trim()
        ? data.cause.trim()
        : null;
    const blob = `${detail} ${cause ?? ''}`;
    const networkHint =
      response.status === 500 &&
      /fetch failed|unreachable|ECONN|ENOTFOUND|ETIMEDOUT|certificate|TLS|socket/i.test(blob);
    const hint = networkHint
      ? ' (Host-to-Regolo connection failed — set REGOLO_API_KEY in Railway Variables, redeploy, and check server logs.)'
      : '';
    const authHint =
      response.status === 401
        ? ' Fix: use a valid Regolo API key (raw sk-… only, no "Bearer " in .env). Set REGOLO_API_KEY in Railway Variables or .env and redeploy.'
        : '';
    throw new Error(
      cause
        ? `Regolo API Error (${response.status}): ${detail} — ${cause}${hint}${authHint}`
        : `Regolo API Error (${response.status}): ${detail}${hint}${authHint}`
    );
  }

  console.log(`[Regolo] ${model} response:`, data);
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error(`Invalid API response format for ${model}`);
  }

  const choice = data.choices[0];
  if (choice.finish_reason === 'length') {
    console.warn(`[Regolo] ${model}: truncated (finish_reason=length). Raise max_tokens if outputs look cut off.`);
  }

  return textFromAssistantMessage(choice.message);
}

/**
 * Make a vision request (image + text) to Regolo AI
 * Used with deepseek-ocr-2 for prescription scanning
 */
export async function visionCompletion(model, textPrompt, imageBase64, settings = {}) {
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: textPrompt,
        },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64 // Should already be data:image/jpeg;base64,...
          },
        },
      ],
    },
  ];

  return chatCompletion(model, messages, settings);
}

/**
 * Test API connectivity
 */
export async function testConnection() {
  try {
    const result = await chatCompletion(
      CONFIG.MEDICAL_MODEL,
      [{ role: 'user', content: 'Reply with "OK" only.' }],
      { temperature: 0, max_tokens: 10 }
    );
    return { success: true, response: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
