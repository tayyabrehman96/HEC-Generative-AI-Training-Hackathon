/**
 * Test OCR vision with an image (path via env).
 */
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const API_KEY = process.env.REGOLO_API_KEY?.trim();
const BASE_URL = 'https://api.regolo.ai/v1';

const imgPath =
  process.env.TEST_IMAGE_PATH?.trim() ||
  path.join(process.cwd(), 'public', 'sample_prescription.png');

if (!API_KEY) {
  console.error('Set REGOLO_API_KEY in .env or environment.');
  process.exit(1);
}

if (!fs.existsSync(imgPath)) {
  console.error(`Image not found: ${imgPath}. Set TEST_IMAGE_PATH or add public/sample_prescription.png`);
  process.exit(1);
}

const imgBuffer = fs.readFileSync(imgPath);
const imgBase64 = `data:image/png;base64,${imgBuffer.toString('base64')}`;
console.log(`Image loaded: ${(imgBuffer.length / 1024).toFixed(1)} KB`);

const res = await fetch(`${BASE_URL}/chat/completions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
  body: JSON.stringify({
    model: 'deepseek-ocr-2',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all text from this medical prescription. List each medicine.' },
          { type: 'image_url', image_url: { url: imgBase64 } },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 2048,
  }),
});

console.log(`Status: ${res.status}`);
const raw = await res.text();
let data;
try {
  data = JSON.parse(raw);
} catch {
  console.error('Non-JSON response:', raw.slice(0, 500));
  process.exit(1);
}
if (res.ok) {
  console.log('✅ OCR:', data.choices?.[0]?.message?.content);
} else {
  console.log('❌ Error:', JSON.stringify(data, null, 2));
}
