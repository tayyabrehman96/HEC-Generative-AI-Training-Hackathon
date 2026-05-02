/**
 * Sehat Saathi — Regolo AI API Wrapper
 * OpenAI-compatible API client for Regolo AI
 */

import { CONFIG } from '../config.js';

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
    console.error('[Regolo] Fetch failed:', err);
    throw new Error(
      'Cannot reach the API proxy. Start it with REGOLO_API_KEY in .env: run `npm run proxy` or `npm run dev:all`, restart `npm run dev`, then retry.'
    );
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
        : data.snippet ?? JSON.stringify(data);
    throw new Error(`Regolo API Error (${response.status}): ${detail}`);
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
