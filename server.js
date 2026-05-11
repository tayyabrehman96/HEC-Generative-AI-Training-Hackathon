import 'dotenv/config';
import dns from 'node:dns';
import fs from 'fs';
import https from 'node:https';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'node:url';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Many PaaS hosts prefer IPv6 first; if the upstream only answers on IPv4, fetch throws "fetch failed".
dns.setDefaultResultOrder('ipv4first');

/** Force IPv4 — more reliable than undici/fetch alone on some Railway/container networks. */
const regoloIpv4Agent = new https.Agent({ family: 4, keepAlive: true, maxSockets: 16 });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REGOLO_API_KEY = process.env.REGOLO_API_KEY?.trim();
if (!REGOLO_API_KEY) {
  console.error('Missing REGOLO_API_KEY. Copy .env.example to .env and set your key.');
  process.exit(1);
}

const REGOLO_BASE = String(process.env.REGOLO_API_BASE_URL ?? 'https://api.regolo.ai/v1').replace(/\/+$/, '');
const REGOLO_CHAT_URL = `${REGOLO_BASE}/chat/completions`;
const REGOLO_FETCH_RETRIES = Math.min(4, Math.max(1, Number(process.env.REGOLO_FETCH_RETRIES ?? 3) || 3));
/** Large models + long OCR context often exceed 3m; cap at 30m for slow tiers. */
const REGOLO_FETCH_TIMEOUT_MS = Math.min(
  1_800_000,
  Math.max(120_000, Number(process.env.REGOLO_FETCH_TIMEOUT_MS ?? 600_000) || 600_000),
);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const distDir = path.join(__dirname, 'dist');
const hasFrontend = fs.existsSync(path.join(distDir, 'index.html'));

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));

/** Liveness for the browser — confirms wiring without calling Regolo. */
app.get('/proxy/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'sehat-saathi-proxy',
    regoloConfigured: Boolean(REGOLO_API_KEY),
    static: hasFrontend,
  });
});

function logAttemptFailure(label, err, attempt) {
  const detail = serializeErrorChain(err);
  console.error(`[Proxy] ${label} attempt ${attempt} failed:`, detail);
}

/** Walk Error/cause/aggregate to surface errno/code (shows in logs and JSON `detail`). */
function serializeErrorChain(err) {
  if (!err) return 'unknown error';
  const parts = [];
  const seen = new Set();
  let e = err;
  let depth = 0;
  while (e && typeof e === 'object' && depth < 8) {
    if (seen.has(e)) break;
    seen.add(e);
    if (typeof e.message === 'string' && e.message.trim()) parts.push(e.message.trim());
    if (typeof e.code === 'string') parts.push(`code=${e.code}`);
    if (e.errno != null) parts.push(`errno=${e.errno}`);
    if (typeof e.syscall === 'string') parts.push(`syscall=${e.syscall}`);
    if (Array.isArray(e.errors)) {
      for (const sub of e.errors.slice(0, 3)) {
        if (sub && typeof sub.message === 'string') parts.push(`aggregate:${sub.message}`);
      }
    }
    e = e.cause;
    depth++;
  }
  return [...new Set(parts)].join(' | ') || String(err);
}

function httpsPostIpv4(urlString, headers, bodyString, timeoutMs) {
  const url = new URL(urlString);
  const bodyBuf = Buffer.from(bodyString, 'utf8');
  const reqHeaders = {
    ...headers,
    'Content-Length': bodyBuf.length,
  };

  return new Promise((resolve, reject) => {
    let settled = false;
    let req;
    let timer;

    const finish = (fn, arg) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      fn(arg);
    };

    timer = setTimeout(() => {
      req?.destroy();
      finish(reject, new Error(`Regolo HTTPS timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        agent: regoloIpv4Agent,
        headers: reqHeaders,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          finish(resolve, {
            statusCode: res.statusCode ?? 502,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
        res.on('error', (err) => finish(reject, err));
      }
    );
    req.on('error', (err) => finish(reject, err));
    req.write(bodyBuf);
    req.end();
  });
}

/** POST to Regolo: try fetch first, then IPv4 https (same path many hosts need on Railway). */
async function postRegoloChat(openAiBody) {
  const payload = JSON.stringify(openAiBody);
  const reqHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${REGOLO_API_KEY}`,
    'User-Agent': 'SehatSaathi-Proxy/1.0',
  };

  let lastThrow = null;

  for (let attempt = 1; attempt <= REGOLO_FETCH_RETRIES; attempt++) {
    try {
      const response = await fetch(REGOLO_CHAT_URL, {
        method: 'POST',
        headers: reqHeaders,
        body: payload,
        signal: AbortSignal.timeout(REGOLO_FETCH_TIMEOUT_MS),
      });
      const rawText = await response.text();
      return { status: response.status, rawText };
    } catch (fetchErr) {
      logAttemptFailure('fetch', fetchErr, attempt);
      try {
        const { statusCode, body } = await httpsPostIpv4(REGOLO_CHAT_URL, reqHeaders, payload, REGOLO_FETCH_TIMEOUT_MS);
        return { status: statusCode, rawText: body };
      } catch (httpsErr) {
        logAttemptFailure('https-ipv4', httpsErr, attempt);
        const combined = new Error(
          `Regolo unreachable (fetch and IPv4 HTTPS failed). fetch: ${serializeErrorChain(fetchErr)}; https: ${serializeErrorChain(httpsErr)}`
        );
        combined.cause = httpsErr;
        lastThrow = combined;
      }
    }

    if (attempt < REGOLO_FETCH_RETRIES) {
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }

  throw lastThrow ?? new Error('Regolo request failed after retries');
}

app.post('/proxy/chat/completions', async (req, res) => {
  const { body } = req.body ?? {};

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing OpenAI-style request body (expected { body: { model, messages, ... } }).' });
  }

  console.log(`\n[Proxy] Requesting model: ${body.model}`);

  try {
    const { status, rawText } = await postRegoloChat(body);

    console.log(`[Proxy] Response status: ${status}`);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      const snippet = rawText.slice(0, 800);
      console.error('[Proxy] Non-JSON upstream body (start):', snippet);
      return res.status(status >= 400 ? status : 502).json({
        error: 'Upstream returned non-JSON response',
        snippet,
      });
    }

    console.log(`[Proxy] Response Content (start):`, JSON.stringify(data).substring(0, 500));

    res.status(status).json(data);
  } catch (error) {
    const detail = serializeErrorChain(error);
    console.error('[Proxy] Regolo connection error:', detail);
    res.status(500).json({
      error: error?.message ?? 'Regolo request failed',
      cause: detail,
    });
  }
});

if (hasFrontend) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/proxy')) return next();
    res.sendFile(path.join(distDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  console.warn('[server] No dist/index.html — serving /proxy only (use Vite for UI, or run npm run build).');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sehat Saathi listening on port ${PORT}${hasFrontend ? ' (SPA + /proxy)' : ' (proxy only)'}`);
  console.log(`[Proxy] Regolo upstream: ${REGOLO_CHAT_URL}`);
  console.log(`[Proxy] Upstream timeout: ${REGOLO_FETCH_TIMEOUT_MS}ms (REGOLO_FETCH_TIMEOUT_MS)`);
});
