import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REGOLO_API_KEY = process.env.REGOLO_API_KEY?.trim();
if (!REGOLO_API_KEY) {
  console.error('Missing REGOLO_API_KEY. Copy .env.example to .env and set your key.');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const distPath = path.join(__dirname, 'dist');
const proxyOnly = process.env.PROXY_ONLY === '1';
const serveFrontend =
  !proxyOnly && fs.existsSync(distPath) && process.env.NODE_ENV === 'production';

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

    console.log('[Proxy] Response Content (start):', JSON.stringify(data).substring(0, 500));

    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Proxy] Fetch Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

if (serveFrontend) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  const mode = serveFrontend ? `UI + proxy (dist/, NODE_ENV=${process.env.NODE_ENV})` : `proxy only (PROXY_ONLY=${proxyOnly ? '1' : 'unset'})`;
  console.log(`Sehat Saathi — ${mode} — http://0.0.0.0:${PORT}`);
});
