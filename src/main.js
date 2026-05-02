/**
 * Sehat Saathi — Main Application
 * AI-Powered Prescription Intelligence for Pakistan
 */

import { speak } from './services/ttsService.js';
import { fileToBase64, processImage } from './utils/imageProcessing.js';
import { visionCompletion, chatCompletion } from './services/regoloApi.js';
import { scanForMedicines } from './utils/fuzzyMatch.js';
import { CONFIG } from './config.js';
import { PROMPTS } from './utils/prompts.js';
import { normalizeMedication, aggregateCostStats } from './utils/prescriptionHelpers.js';

// ===== State =====
let state = {
  view: 'auth',
  user: null,
  imageData: null,
  ocrText: '',
  medications: [],
  interactions: [],
  expandedCards: new Set(),
  speakingIndex: -1,
  history: JSON.parse(localStorage.getItem('sehat_history') || '[]'),
};

const app = document.getElementById('app');

/** Vector brand mark — clinical cross + ring on gradient (no pill emoji). */
function brandLogoSvg(size, gradId) {
  const s = size;
  return `<svg class="brand-logo-svg" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brand-grad-${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399"/>
        <stop offset="42%" stop-color="#10b981"/>
        <stop offset="100%" stop-color="#6366f1"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="17" fill="url(#brand-grad-${gradId})"/>
    <path d="M32 15v34M15 32h34" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="10" fill="none" stroke="rgba(248,250,252,0.32)" stroke-width="2"/>
  </svg>`;
}

/** Human-friendly copy for each AI pass (Urdu + simple English — no jargon). */
const ANALYSIS_PHASES = [
  {
    badgeUr: 'مرحلہ ۱ از ۳',
    progress: 26,
    urMain: 'آپ کے نسخے کی تصویر پڑھی جا رہی ہے',
    urSub: 'ڈاکٹر کی دستخط کمپیوٹر متن میں بدلی جا رہی ہے تاکہ الفاظ چھُٹ نہ جائیں۔',
    enFriendly: 'Step 1 of 3 — We read every word that appears on your prescription photo.',
  },
  {
    badgeUr: 'مرحلہ ۲ از ۳',
    progress: 55,
    urMain: 'دوائیوں کی فہرست بنائی جا رہی ہے',
    urSub: 'تصویر سے ہر دوا کا نام، مقدار اور خوراک کا اندازہ لگایا جا رہا ہے۔',
    enFriendly: 'Step 2 of 3 — We list each medicine name and dose pattern we can see on the paper.',
  },
  {
    badgeUr: 'مرحلہ ۳ از ۳',
    progress: 82,
    urMain: 'آسان ہدایات تیار کی جا رہی ہیں',
    urSub: 'مقصد، استعمال کا طریقہ، وقت اور مناسب متبادل لکھے جا رہے ہیں۔',
    enFriendly: 'Step 3 of 3 — We turn that into simple explanations you can follow (not a substitute for your doctor).',
  },
];

// ===== Render Functions =====
function render() {
  switch (state.view) {
    case 'auth': renderAuth(); break;
    case 'landing': renderLanding(); break;
    case 'uploading': renderUpload(); break;
    case 'processing': renderProcessing(); break;
    case 'results': renderResults(); break;
  }
}

function renderAuth() {
  app.innerHTML = `
    <div class="auth-container auth-container-split">
      <div class="auth-hero" aria-hidden="false">
        <div class="auth-map-stage">
          <div class="auth-map-scene">
            <div class="auth-map-float">
              <div class="auth-map-base-2d">
                <div class="auth-map-svg-bezel">
                  <img src="/pakistan-map.svg" alt="" class="auth-map-svg-img" width="400" height="320" decoding="async" />
                </div>
              </div>
              <div class="auth-map-overlays-3d">
              <div class="auth-map-pct-layer" aria-hidden="true">
                <div class="auth-map-pct auth-map-pct--lit">
                  <span class="auth-map-pct-num">~59%</span>
                  <span class="auth-map-pct-ur">بالغ آبادی — رسائی بہتر</span>
                  <span class="auth-map-pct-en">Literate band (UNESCO / govt. estimates vary)</span>
                </div>
                <div class="auth-map-pct auth-map-pct--oral">
                  <span class="auth-map-pct-num">~41%</span>
                  <span class="auth-map-pct-ur">زیادہ زبانی / خاندانی مدد</span>
                  <span class="auth-map-pct-en">Heavier need for spoken guidance on dense text</span>
                </div>
              </div>
              <div class="auth-map-cities" aria-hidden="true">
                <span class="auth-city-tag auth-city--ajk">AJK<span class="auth-city-sub">آزاد کشمیر</span></span>
                <span class="auth-city-tag auth-city--pew">Peshawar<span class="auth-city-sub">پشاور</span></span>
                <span class="auth-city-tag auth-city--isb">Islamabad<span class="auth-city-sub">اسلام آباد</span></span>
                <span class="auth-city-tag auth-city--lhe">Lahore<span class="auth-city-sub">لاہور</span></span>
                <span class="auth-city-tag auth-city--mux">Multan<span class="auth-city-sub">ملتان</span></span>
                <span class="auth-city-tag auth-city--qta">Quetta<span class="auth-city-sub">کوئٹہ</span></span>
                <span class="auth-city-tag auth-city--khi">Karachi<span class="auth-city-sub">کراچی</span></span>
              </div>
              <span class="auth-map-pin" aria-hidden="true">💊</span>
              </div>
            </div>
          </div>
        </div>
        <p class="auth-hero-tagline">پورے پاکستان کے لیے — ہاتھ کے نسخے، اردو وضاحت، 🔊 سن کر سمجھیں</p>
      </div>

      <div class="auth-card">
        <div class="auth-card-stack">
          <div class="auth-card-top">
            <div class="auth-header auth-header--compact">
              <div class="logo-mark logo-mark--auth">${brandLogoSvg(84, 'auth')}</div>
              <h1>Sehat Saathi</h1>
              <p class="subtitle" style="color:var(--text-muted)">صحت ساتھی — لاگ ان کریں</p>
            </div>
            <p class="auth-card-lead">
              ہر شہر، ہر خطے میں ہم آپ کے <strong>ڈاکٹر کے نسخے</strong> کو آسان اردو، وقت، اور لاگت میں سمجھنے میں مدد دیتے ہیں۔
            </p>
          </div>

          <div class="auth-card-mid" aria-hidden="false">
            <div class="auth-feature-grid">
              <div class="auth-feature-tile"><span class="auth-ft-ico">📸</span><span>نسخے کی تصویر</span></div>
              <div class="auth-feature-tile"><span class="auth-ft-ico">🔊</span><span>سن کر سمجھیں</span></div>
              <div class="auth-feature-tile"><span class="auth-ft-ico">📝</span><span>1-0-1 وضاحت</span></div>
              <div class="auth-feature-tile"><span class="auth-ft-ico">💰</span><span>اندازاً PKR</span></div>
            </div>
            <p class="auth-card-note">Information only — ڈاکٹر/فارمسسٹ کی ہدایت ضروری رہتی ہے۔</p>
          </div>

          <div class="auth-card-bottom">
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="form-input" id="nameInput" value="Muhammad Tayyab">
            </div>
            <button class="btn btn-primary" id="loginBtn">Start High-Accuracy Scan</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('loginBtn').addEventListener('click', () => {
    state.user = { name: document.getElementById('nameInput').value || 'User' };
    state.view = 'landing';
    render();
  });
}

function renderLanding() {
  app.innerHTML = `
    ${renderHeader()}
    <div class="container">
      <section class="landing landing-enter">
        <div style="text-align:center; margin-bottom:2rem">
          <div class="landing-hero-badge">✨ صاف روشن تصویر پر بہتر نتیجہ</div>
          <h2 style="margin-bottom:0.5rem">Welcome, ${escapeHtml(state.user.name)}</h2>
          <p style="color:var(--primary); font-weight:500">نسخہ پڑھنے میں مدد — صحت ساتھی</p>
          <p style="color:var(--text-muted); font-size:0.9rem; max-width:28rem; margin:0.75rem auto 0">
            تین آسان مراحل: تصویر بھیجیں، ہم تجزیہ کریں، آپ کو ہدایات ملیں۔
          </p>
        </div>
        <div class="how-steps">
          <div class="how-step-pill"><span class="num">۱</span><span><strong>تصویر</strong> اپ لوڈ کریں</span></div>
          <div class="how-step-pill"><span class="num">۲</span><span><strong>انتظار</strong> — AI تین مراحل میں پڑھتا ہے</span></div>
          <div class="how-step-pill"><span class="num">۳</span><span><strong>نتیجہ</strong> ہدایات پڑھیں / سنیں 🔊</span></div>
        </div>
        <div class="features-grid">
          <div class="feature-card"><div class="icon">🔍</div><h3>Raw Text</h3><p>اصل تحریر</p></div>
          <div class="feature-card"><div class="icon">🎯</div><h3>Purpose</h3><p>مقصد</p></div>
          <div class="feature-card"><div class="icon">🥣</div><h3>Usage</h3><p>طریقہ استعمال</p></div>
          <div class="feature-card"><div class="icon">⏰</div><h3>Timing</h3><p>وقت</p></div>
          <div class="feature-card"><div class="icon">🔄</div><h3>Alternates</h3><p>متبادل</p></div>
          <div class="feature-card"><div class="icon">💰</div><h3>Cost</h3><p>اندازاً لاگت</p></div>
          <div class="feature-card"><div class="icon">📊</div><h3>Stats</h3><p>مقایسہ</p></div>
        </div>
        <button class="btn btn-primary" id="startBtn" style="padding:1.25rem">📸 نیا نسخہ اسکین کریں — Start scan</button>
      </section>
      ${renderFooter()}
    </div>
  `;
  document.getElementById('startBtn').addEventListener('click', () => {
    state.view = 'uploading';
    state.imageData = null;
    render();
  });
}

function renderUpload() {
  app.innerHTML = `
    ${renderHeader()}
    <div class="container">
      <section class="upload-section">
        <div style="text-align:center; margin-bottom:1.25rem">
          <h2 style="font-size:1.35rem; margin-bottom:0.35rem">نسخے کی تصویر بھیجیں</h2>
          <p style="color:var(--text-muted); font-size:0.9rem">Upload prescription photo — براہ کرم سیدھی اور واضح تصویر لیں</p>
        </div>
        <div class="upload-area" id="uploadArea" role="button" tabindex="0" aria-label="Choose prescription image">
          <div class="upload-icon">📄</div>
          <h3 style="margin:0.5rem 0 0.25rem">یہاں تھپتھپائیں یا فائل منتخب کریں</h3>
          <p style="color:var(--text-muted); font-size:0.85rem">Tap to upload — JPG / PNG</p>
          <input type="file" id="fileInput" accept="image/*" style="display:none" />
        </div>
        <div class="camera-btn-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-top:1rem">
          <button type="button" class="btn btn-secondary" id="uploadBtn">📁 Choose File</button>
          <button type="button" class="btn btn-secondary" id="demoBtn" style="background:var(--secondary); color:white; border:none">🧪 Try Demo</button>
        </div>
        <div class="upload-tips">
          <strong>تیز اور صاف نتیجے کے لیے:</strong>
          روشن روشنی میں تصویر لیں، نسخہ پھٹا ہوا ہو تو ہر حصّے پر الگ فوٹو، اور ڈاکٹر کی تحریر تصویر کے مرکز میں رہے۔
        </div>
        ${state.imageData ? `
          <div class="image-preview" style="margin-top:1.5rem; border-radius:16px; overflow:hidden; border:1px solid var(--border); animation: cardEnter 0.45s ease">
            <img src="${state.imageData}" alt="Prescription preview" style="width:100%; display:block" />
            <button type="button" class="btn btn-primary" id="analyzeBtn" style="margin-top:1rem">🔍 اب تجزیہ کریں — Analyze</button>
          </div>
        ` : ''}
      </section>
      ${renderFooter()}
    </div>
  `;
  setupUploadEvents();
}

function renderProcessing() {
  app.innerHTML = `
    <div class="processing-overlay">
      <div class="processing-card">
        <div class="processing-spinner-wrap">
          <div class="processing-spinner-glow" aria-hidden="true"></div>
          <div class="processing-spinner" role="status" aria-label="Loading"></div>
        </div>
        <div class="processing-phase-badge" id="processingPhaseBadge">مرحلہ ۱ از ۳</div>
        <div class="processing-ur-main" id="processingStep">…</div>
        <div class="processing-ur-sub" id="processingUrSub"></div>
        <p class="processing-en-friendly" id="processingText"></p>
        <div class="processing-progress" aria-hidden="true">
          <div class="processing-progress-fill" id="processingProgressFill" style="width:26%"></div>
        </div>
        <ul class="processing-step-list" aria-label="آپ کا نسخہ کیسے پڑھا جاتا ہے">
          <li class="processing-step-item" id="processingStepMark1">
            <span class="step-ico">📝</span>
            <span>
              <strong>۱ — تحریر پڑھنا</strong>
              <span class="step-line-en">Reading handwriting from your photo</span>
            </span>
          </li>
          <li class="processing-step-item" id="processingStepMark2">
            <span class="step-ico">💊</span>
            <span>
              <strong>۲ — دوائیں پہچاننا</strong>
              <span class="step-line-en">Finding medicine names & doses on the paper</span>
            </span>
          </li>
          <li class="processing-step-item" id="processingStepMark3">
            <span class="step-ico">📋</span>
            <span>
              <strong>۳ — آسان ہدایات</strong>
              <span class="step-line-en">Writing purpose, usage & timing for you</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  `;
  setProcessingPhase(1);
}

function renderResults() {
  const emptyAnalysis =
    state.medications.length === 0
      ? `
        <div class="empty-results" style="padding:1.75rem; margin-bottom:1.5rem; background:var(--glass); border-radius:12px; border:1px solid var(--border)">
          <p style="margin:0 0 0.5rem"><strong>No medicines were parsed.</strong></p>
          <p style="margin:0; color:var(--text-muted); font-size:0.9rem">
            Common causes: OCR/VLM returned little text, the final model emitted <code>[]</code>, or only date fragments were filtered out.
            Check the browser console for <strong>Pass 1 (OCR)</strong> and <strong>Pass 2 (VLM)</strong>. Try a sharper photo or retry.
          </p>
          ${
            state.ocrText
              ? `<details style="margin-top:1rem"><summary style="cursor:pointer;color:var(--primary)">Show OCR + VLM excerpt</summary>
              <pre style="white-space:pre-wrap;font-size:0.72rem;margin-top:0.6rem;max-height:280px;overflow:auto;color:var(--text-muted)">${escapeHtml(state.ocrText)}</pre></details>`
              : ''
          }
        </div>`
      : '';

  const costAgg = aggregateCostStats(state.medications);

  app.innerHTML = `
    ${renderHeader()}
    <div class="container container-results">
      <section class="results-section results-enter">
        <div class="results-header" style="margin-bottom:2rem">
          <div>
            <h2 style="margin-bottom:0.25rem">📋 آپ کا تجزیہ تیار ہے</h2>
            <p style="color:var(--text-muted); font-size:0.85rem; font-weight:400">ہر دوا پر تھپتھپا کر کھولیں — 🔊 سن بھی سکتے ہیں</p>
          </div>
          <button type="button" class="btn btn-secondary" id="newScanBtn" style="width:auto">New Scan</button>
        </div>
        ${state.medications.length ? renderResultsDashboard(state.medications, costAgg) : ''}
        <div class="drug-cards">
          ${emptyAnalysis}
          ${state.medications.map((med, i) => renderDrugCard(med, i)).join('')}
        </div>
        <div class="disclaimer" style="margin-top:3rem; padding:1.5rem; background:rgba(239,68,68,0.05); border-radius:12px; font-size:0.85rem">
          ⚠️ <strong>Disclaimer:</strong> This AI analysis is for information only. Always consult a real doctor or pharmacist.
        </div>
      </section>
      ${renderFooter()}
    </div>
  `;
  setupResultEvents();
}

function renderResultsDashboard(medications, costAgg) {
  const n = medications.length;
  const totalLine =
    costAgg.hasNumeric && costAgg.lowSum > 0
      ? `≈ PKR ${costAgg.lowSum.toLocaleString('en-PK')} – ${costAgg.highSum.toLocaleString('en-PK')} (سب طے شدہ دوائوں کا اندازاً کل)`
      : 'مکمل کل کے لیے ہر دوا کی قیمت نیچے دیکھیں — شہر اور فارمیسی کے مطابق فرق ہوتا ہے۔';

  const bars =
    costAgg.rows.length > 0
      ? costAgg.rows
          .map((r) => {
            const pct = Math.max(8, Math.round((r.mid / costAgg.maxMid) * 100));
            const range =
              r.low === r.high
                ? `≈ ${r.low.toLocaleString('en-PK')}`
                : `${r.low.toLocaleString('en-PK')} – ${r.high.toLocaleString('en-PK')}`;
            return `
            <div class="cost-bar-row">
              <div class="cost-bar-label">${escapeHtml(r.label)}</div>
              <div class="cost-bar-track">
                <div class="cost-bar-fill" style="width:${pct}%"></div>
              </div>
              <div class="cost-bar-value">${range} PKR</div>
            </div>`;
          })
          .join('')
      : `<p class="cost-bar-empty">اعداد الشمار تب بنتے ہیں جب ماڈل PKR رینج دے — نہ ملیں تو ہر دوا کے نیچے متن والی قیمت دیکھیں۔</p>`;

  return `
    <div class="results-dashboard">
      <div class="dashboard-ai-banner">
        <div class="dashboard-ai-icon" aria-hidden="true">🤖</div>
        <div>
          <div class="dashboard-ai-title">AI نسخہ معاون — Prescription assistant</div>
          <p class="dashboard-ai-copy">
            یہ سکرین آپ کے <strong>ڈاکٹر کے لکھے ہوئے</strong> نسخے کو سمجھنے، وقت، اور لاگت کے بارے میں واضح کرنے میں مدد دیتی ہے۔
            یہ خود سے نئی دوا تجویز <em>نہیں</em> کرتی — خوراک یا دوا بدلنے سے پہلے ہمیشہ ڈاکٹر/فارمسسٹ سے پوچھیں۔
          </p>
        </div>
      </div>
      <div class="dashboard-stats-grid">
        <div class="stat-tile">
          <div class="stat-value">${n}</div>
          <div class="stat-label">دوائیں / Medicines</div>
        </div>
        <div class="stat-tile stat-tile-wide">
          <div class="stat-label" style="margin-bottom:0.35rem">کل لاگت (انڈیکٹیو) / Total cost hint</div>
          <div class="stat-sub">${escapeHtml(totalLine)}</div>
        </div>
      </div>
      <div class="dashboard-chart-card">
        <div class="dashboard-chart-title">فی دوا لاگت (موازنہ) — Cost by medicine</div>
        <p class="dashboard-chart-hint">بار لمبائی ہر دوا کی اندازاً درمیانی قیمت سے — آسانی کے لیے، مارکیٹ میں حتمی نہیں۔</p>
        <div class="cost-bar-list">${bars}</div>
      </div>
    </div>
  `;
}

function renderDrugCard(med, index) {
  const isOpen = state.expandedCards.has(index);
  const sched = String(med.schedule_explained_ur || '').trim();
  const schedBlock =
    sched && sched !== '—'
      ? `
          <div class="analysis-item schedule-breakdown">
            <div style="color:var(--text-muted); font-size:0.8rem">وقت کی وضاحت (1-0-1 وغیرہ) — Schedule decoded</div>
            <div style="font-family:var(--font-urdu); font-size:1.05rem; line-height:1.75">${escapeHtml(sched)}</div>
          </div>`
      : '';
  const costExtra = med.course_cost_note_pkr
    ? `<div class="cost-course-note">${escapeHtml(med.course_cost_note_pkr)}</div>`
    : '';
  const prescNote = med.prescriber_note_ur
    ? `<div class="prescriber-note">${escapeHtml(med.prescriber_note_ur)}</div>`
    : '';

  return `
    <div class="drug-card drug-card-enter" style="animation-delay:${index * 0.06}s">
      <div class="drug-card-header" data-toggle="${index}" style="padding:1.5rem; background:var(--glass)">
        <div class="drug-info">
          <div class="drug-number">${index + 1}</div>
          <div>
            <div class="drug-name">${escapeHtml(med.brand_name)}</div>
            <div class="drug-generic">${escapeHtml(med.generic_name)}</div>
          </div>
        </div>
        <button class="btn-icon speak-btn" data-speak="${index}" style="background:none; border:none; font-size:1.5rem; cursor:pointer">🔊</button>
      </div>
      
      <div class="drug-card-body" style="display: ${isOpen ? 'block' : 'none'}; padding:1.5rem; border-top:1px solid var(--border)">
        <div class="analysis-grid" style="display:grid; gap:1.25rem">
          <div class="analysis-item">
            <div style="color:var(--text-muted); font-size:0.8rem">1. RAW TEXT (اصل تحریر)</div>
            <div style="font-weight:500; color:var(--primary)">"${escapeHtml(med.raw_text)}"</div>
          </div>
          <div class="analysis-item">
            <div style="color:var(--text-muted); font-size:0.8rem">2. PURPOSE (مقصد)</div>
            <div style="font-family:var(--font-urdu); font-size:1.1rem">${escapeHtml(med.purpose)}</div>
          </div>
          <div class="analysis-item">
            <div style="color:var(--text-muted); font-size:0.8rem">3. USAGE (طریقہ استعمال)</div>
            <div style="font-family:var(--font-urdu); font-size:1.1rem">${escapeHtml(med.usage_instructions)}</div>
          </div>
          ${schedBlock}
          <div class="analysis-item">
            <div style="color:var(--text-muted); font-size:0.8rem">4. TIMING (وقت)</div>
            <div style="font-weight:600">${escapeHtml(med.timing)}</div>
          </div>
          <div class="analysis-item cost-item">
            <div style="color:var(--text-muted); font-size:0.8rem">5. لاگت / Cost (PK — اندازاً)</div>
            <div style="font-family:var(--font-urdu); font-size:1.05rem; line-height:1.6">${escapeHtml(med.cost_estimate_pkr)}</div>
            ${costExtra}
          </div>
          <div class="analysis-item" style="background:rgba(16,185,129,0.05); padding:1rem; border-radius:8px">
            <div style="color:var(--text-muted); font-size:0.8rem">6. ALTERNATIVES (متبادل ادویات)</div>
            <div style="font-weight:600; color:var(--secondary)">${escapeHtml(med.alternatives)}</div>
          </div>
          ${prescNote ? `<div class="analysis-item prescriber-item">${prescNote}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderHeader() {
  return `<header class="app-header" style="padding:1rem 2rem; display:flex; justify-content:space-between; align-items:center; background:var(--card-bg)">
    <div class="logo-group">
      <div class="logo-mark logo-mark--nav">${brandLogoSvg(44, 'nav')}</div>
      <h1 style="font-size:1.2rem">Sehat Saathi</h1>
    </div>
    <div style="font-size:0.9rem">${state.user?.name}</div>
  </header>`;
}

function renderFooter() {
  return `<footer style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.8rem">Sehat Saathi — HEC ASPIREPK</footer>`;
}

// ===== Events =====
function setupUploadEvents() {
  const fileInput = document.getElementById('fileInput');
  const uploadArea = document.getElementById('uploadArea');
  document.getElementById('uploadBtn').addEventListener('click', () => fileInput.click());
  document.getElementById('demoBtn').addEventListener('click', () => loadDemo());
  const pickFile = () => fileInput.click();
  uploadArea.addEventListener('click', pickFile);
  uploadArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pickFile();
    }
  });
  fileInput.addEventListener('change', async e => {
    if (e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      state.imageData = await processImage(base64);
      render();
    }
  });
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) analyzeBtn.addEventListener('click', () => startAnalysis());
}

function setupResultEvents() {
  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.toggle);
      if (state.expandedCards.has(idx)) state.expandedCards.delete(idx);
      else state.expandedCards.add(idx);
      render();
    });
  });

  document.querySelectorAll('.speak-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.speak);
      const med = state.medications[idx];
      const sched = med.schedule_explained_ur ? ` Schedule: ${med.schedule_explained_ur}` : '';
      const cost = med.cost_estimate_pkr ? ` Cost: ${med.cost_estimate_pkr}` : '';
      const text = `Medicine: ${med.brand_name}. Purpose: ${med.purpose}. Usage: ${med.usage_instructions}.${sched} Timing: ${med.timing}.${cost}`;
      speak(text);
    });
  });

  document.getElementById('newScanBtn').addEventListener('click', () => {
    state.view = 'landing';
    state.imageData = null;
    state.medications = [];
    render();
  });
}

async function loadDemo() {
  try {
    const res = await fetch('/sample_prescription.png');
    if (!res.ok) throw new Error(`Could not load demo image (HTTP ${res.status}).`);
    const blob = await res.blob();
    const base64 = await fileToBase64(blob);
    state.imageData = await processImage(base64);
    render();
  } catch (error) {
    console.error('Demo load failed:', error);
    alert('Demo failed: ' + error.message);
  }
}

/** Drop rows where raw_text is only a visit date (model sometimes latches onto corner dates). */
function isLikelyDateOnlySnippet(rawText) {
  const t = String(rawText || '')
    .trim()
    .replace(/^["']+|["']+$/g, '');
  if (t.length > 24) return false;
  return /^\d{1,2}\s*[\/\-.]\s*\d{1,2}(\s*[\/\-.]\s*\d{1,4})?$/.test(t);
}

function filterSpuriousMedications(meds) {
  return meds.filter((m) => !isLikelyDateOnlySnippet(m.raw_text));
}

/** First top-level JSON array substring with bracket/brace-aware scanning (avoids greedy-regex mangling). */
function extractFirstBalancedJsonArray(text) {
  const start = text.indexOf('[');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  const s = text;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"' && !escaped) {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) return s.slice(start, i + 1);
      }
    }
  }
  return null;
}

/** Parse Llama JSON array from model output (fenced blocks, trailing prose). */
function extractMedicationsJson(rawModelOutput) {
  let jsonStr = rawModelOutput.trim();
  if (jsonStr.includes('```')) {
    const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1].trim();
  }
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) throw new SyntaxError('Expected JSON array');
    return parsed;
  } catch {
    const balanced = extractFirstBalancedJsonArray(jsonStr);
    if (balanced) {
      try {
        const parsed = JSON.parse(balanced);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* fall through */
      }
    }
    console.error('Could not parse medications JSON. Raw model output:', jsonStr);
    throw new Error(
      `Model did not return a valid JSON array. First 400 chars:\n${jsonStr.slice(0, 400)}`
    );
  }
}

/**
 * ULTRA-PERMISSIVE PIPELINE: NO REFUSALS ALLOWED
 */
async function startAnalysis() {
  state.view = 'processing';
  render();

  try {
    // PASS 1: Specialist OCR (DeepSeek)
    const rawOcr = await visionCompletion(
      CONFIG.OCR_MODEL,
      PROMPTS.OCR_FULL_RX,
      state.imageData,
      CONFIG.OCR_SETTINGS
    );
    console.log('Pass 1 (OCR):', rawOcr);

    // PASS 2: Visual Reasoning (Qwen/Gemma)
    setProcessingPhase(2);
    const vlmReasoning = await visionCompletion(
      CONFIG.VLM_MODEL,
      PROMPTS.VLM_EXHAUSTIVE_RX,
      state.imageData,
      CONFIG.VLM_SETTINGS
    );
    console.log('Pass 2 (VLM):', vlmReasoning);

    // PASS 3: Consolidation & Medical Logic (Llama 70B)
    setProcessingPhase(3);
    
    // Perform Fuzzy Matching for auto-correction
    const fuzzyCandidates = scanForMedicines(`${rawOcr} ${vlmReasoning}`);
    console.log('Fuzzy Matched Candidates:', fuzzyCandidates);

    const finalResult = await chatCompletion(
      CONFIG.MEDICAL_MODEL,
      [
        { role: 'system', content: PROMPTS.VISION_ANALYSIS },
        {
          role: 'user',
          content: `Prescription reports for ONE image:

      REPORT A (OCR transcription): "${rawOcr}"

      REPORT B (Visual medicine list): "${vlmReasoning}"

      SYSTEM CANDIDATES (fuzzy matches from Pakistani medicine DB — spelling hints ONLY): 
      ${fuzzyCandidates.length > 0 ? fuzzyCandidates.join(', ') : 'None.'}

      YOUR JOB:
      1. COUNT distinct medicines described in A and/or B — output that many JSON objects (typically 4–8). Never merge multiple drugs into one object.
      2. Each raw_text MUST copy the drug-specific line from A or B (brand + dose). Never use only a calendar date as raw_text.
      3. Only include medicines grounded in A/B text — do not invent unrelated drugs.
      4. Use SYSTEM CANDIDATES only to fix spelling when they clearly match a line in A/B.
      Return ONLY the JSON array as specified in the system message.`,
        },
      ],
      CONFIG.MEDICAL_CONSOLIDATION_SETTINGS
    );

    console.log('Final Result:', finalResult);

    const parsedMeds = extractMedicationsJson(finalResult);
    const cleaned = filterSpuriousMedications(parsedMeds);
    const list = cleaned.length > 0 ? cleaned : parsedMeds;
    state.medications = list.map((m, i) => normalizeMedication(m, i));
    state.ocrText = `OCR: ${rawOcr}\nVLM: ${vlmReasoning}`;
    state.expandedCards = new Set(state.medications.map((_, i) => i));
    state.view = 'results';
    render();
  } catch (error) {
    console.error('Analysis failed:', error);
    alert('Analysis failed: ' + error.message);
    state.view = 'uploading';
    render();
  }
}

function setProcessingPhase(phase) {
  const p = ANALYSIS_PHASES[phase - 1];
  if (!p) return;

  const badgeEl = document.getElementById('processingPhaseBadge');
  const urMainEl = document.getElementById('processingStep');
  const urSubEl = document.getElementById('processingUrSub');
  const enEl = document.getElementById('processingText');
  const fillEl = document.getElementById('processingProgressFill');

  if (badgeEl) badgeEl.textContent = p.badgeUr;
  if (urMainEl) urMainEl.textContent = p.urMain;
  if (urSubEl) urSubEl.textContent = p.urSub;
  if (enEl) enEl.textContent = p.enFriendly;
  if (fillEl) fillEl.style.width = `${p.progress}%`;

  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`processingStepMark${i}`);
    if (!el) continue;
    el.classList.remove('pending', 'active', 'done');
    if (i < phase) el.classList.add('done');
    else if (i === phase) el.classList.add('active');
    else el.classList.add('pending');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

render();
