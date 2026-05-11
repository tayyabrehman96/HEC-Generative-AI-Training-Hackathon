/**
 * Anonymous telemetry — POSTs to Express (same origin /proxy).
 * No prescription text, images, or names.
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

/** session = once per browser tab session after login; tools = each visit to Tools page */
export async function recordTelemetryEvent(type) {
  if (type !== 'session' && type !== 'tools') return;
  const url = `${telemetryBase()}/telemetry/event`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) console.warn('[telemetry] event HTTP', res.status, type);
  } catch (e) {
    console.warn('[telemetry] event failed', type, e?.message ?? e);
  }
}

/** Count one “visitor session” when user reaches home after login (not unique humans). */
export function recordAppSessionOnce() {
  try {
    if (sessionStorage.getItem('sehat_telemetry_sess_v1')) return;
    sessionStorage.setItem('sehat_telemetry_sess_v1', '1');
  } catch {
    return;
  }
  void recordTelemetryEvent('session');
}

export function recordToolsPageOpen() {
  void recordTelemetryEvent('tools');
}

export async function fetchScanStats() {
  const url = `${telemetryBase()}/telemetry/stats`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`stats HTTP ${res.status}`);
  return res.json();
}
