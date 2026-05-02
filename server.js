import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const REGOLO_API_KEY = process.env.REGOLO_API_KEY?.trim();
if (!REGOLO_API_KEY) {
  console.error('Missing REGOLO_API_KEY. Copy .env.example to .env and set your key.');
  process.exit(1);
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));

app.post('/proxy/chat/completions', async (req, res) => {
  const { body } = req.body ?? {};

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing OpenAI-style request body (expected { body: { model, messages, ... } }).' });
  }

  console.log(`\n[Proxy] Requesting model: ${body.model}`);

  try {
    const response = await fetch('https://api.regolo.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REGOLO_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    console.log(`[Proxy] Response status: ${response.status}`);

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      const snippet = rawText.slice(0, 800);
      console.error('[Proxy] Non-JSON upstream body (start):', snippet);
      return res.status(response.status >= 400 ? response.status : 502).json({
        error: 'Upstream returned non-JSON response',
        snippet,
      });
    }

    console.log(`[Proxy] Response Content (start):`, JSON.stringify(data).substring(0, 500));

    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Proxy] Fetch Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sehat Saathi Proxy Server running at http://127.0.0.1:${PORT}`);
});
