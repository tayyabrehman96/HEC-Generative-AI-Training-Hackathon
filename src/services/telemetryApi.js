/**
 * Anonymous scan counters — POSTs to Express (same origin /proxy).
 * No prescription text or images are sent.
 */

import { CONFIG } from '../config.js';

function telemetryBase() {
  return String(CONFIG.API_BASE_URL ?? '/proxy').replace(/\/+$/, '');
}

export async function recordScanOutcome(outcome) {
  const o = outcome === 'success' ? 'success' : 'failure';
  const url = `${telemetryBase()}/telemetry/scan`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome: o }),
    });
    if (!res.ok) console.warn('[telemetry] scan record HTTP', res.status);
  } catch (e) {
    console.warn('[telemetry] scan record failed', e?.message ?? e);
  }
}

export async function fetchScanStats() {
  const url = `${telemetryBase()}/telemetry/stats`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`stats HTTP ${res.status}`);
  return res.json();
}
