/**
 * Test all Regolo AI models
 */
import 'dotenv/config';

const API_KEY = process.env.REGOLO_API_KEY?.trim();
const BASE_URL = 'https://api.regolo.ai/v1';

const models = ['deepseek-ocr-2', 'gemma4-31b', 'qwen3.5-122b', 'Llama-3.3-70B-Instruct', 'gpt-oss-120b'];

if (!API_KEY) {
  console.error('Set REGOLO_API_KEY in .env or environment.');
  process.exit(1);
}

async function testModel(model) {
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with OK only.' }],
        temperature: 0,
        max_tokens: 10,
      }),
    });
    const text = await res.text();
    if (res.ok) {
      console.log(`✅ ${model} — WORKS — ${text.substring(0, 100)}`);
    } else {
      console.log(`❌ ${model} — ERROR ${res.status} — ${text.substring(0, 150)}`);
    }
  } catch (e) {
    console.log(`❌ ${model} — FETCH FAILED — ${e.message}`);
  }
}

(async () => {
  console.log('=== Testing Regolo AI Models ===');
  for (const m of models) {
    await testModel(m);
  }
  console.log('=== Done ===');
})();
