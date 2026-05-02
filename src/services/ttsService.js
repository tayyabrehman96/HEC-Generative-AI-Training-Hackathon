/**
 * Sehat Saathi — Text-to-Speech
 * Prefer Pakistani Urdu female voices (e.g. Microsoft Uzma on Windows/Edge).
 * English (especially en-GB) on Roman Urdu sounds cold / British — avoid.
 */

let synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voices = [];
let isSpeaking = false;

function normalizeLang(lang) {
  return String(lang || '')
    .replace('_', '-')
    .trim()
    .toLowerCase();
}

/** Prefer warm female-sounding Urdu voices common on Windows (Uzma, etc.). */
function scoreFemalePakistani(v) {
  const name = String(v.name || '').toLowerCase();
  let bonus = 0;

  const femaleHint =
    /uzma|dilara|gul|saba|nahid|shabana|nargis|hina|aisha|amna|zara|mehak|nazia|farah|sana|aiman|nimra|female|woman|khatoon/;
  const maleHint = /\bsalman\b|wasim|waseem|\basad\b|ahmed|male\b|muhammad\s*nabeel|hameed/;

  if (femaleHint.test(name)) bonus += 62;
  if (maleHint.test(name)) bonus -= 55;

  return bonus;
}

/**
 * Higher score = better match for Pakistani Urdu (patient instructions).
 */
function scoreVoiceForSouthAsianUrdu(v) {
  const lang = normalizeLang(v.lang);
  const name = String(v.name || '').toLowerCase();

  let score = 0;

  if (/urdu|اردو/.test(v.name || '') || /urdu/.test(name)) score += 130;
  if (/pakistan|pakistani/.test(name)) score += 125;

  if (lang === 'ur-pk') score += 115;
  if (lang.startsWith('ur')) score += 92;

  score += scoreFemalePakistani(v);

  // Hindi (India) — South Asian timbre; use only if no Urdu (better than en-GB for desi text)
  if (lang === 'hi-in') score += 62;
  if (/hindi.*india|microsoft.*hindi|google.*hindi/i.test(name)) score += 58;
  if (lang.startsWith('hi')) score += 48;

  if (/^(ta|te|mr|gu|pa|bn|kn|ml|or)-in$/i.test(lang)) score += 32;

  if (/natural|neural|premium/i.test(name)) score += 8;

  if (lang.startsWith('en')) score -= 100;
  if (/english \(.*uk|united kingdom|british|received pronunciation|en-gb|\buk\b|rishi|southern england/i.test(name)) score -= 130;
  if (/daniel|serena|olivia|alice|fred|martha|karen|arthur|emma|brian|ryan|scansoft|samantha/i.test(name) && lang.startsWith('en'))
    score -= 95;
  if (lang === 'en-us' && !/india|pakistan|urdu/i.test(name)) score -= 40;

  return score;
}

function pickBestVoice(allVoices) {
  const ranked = allVoices
    .map((v) => ({ v, s: scoreVoiceForSouthAsianUrdu(v) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (ranked.length) return ranked[0].v;

  const hindiFemale = allVoices.find((v) => normalizeLang(v.lang).startsWith('hi') && scoreFemalePakistani(v) > 0);
  if (hindiFemale) return hindiFemale;

  const hindiFallback = allVoices.find((v) => normalizeLang(v.lang).startsWith('hi'));
  if (hindiFallback) return hindiFallback;

  const enIndia = allVoices.find((v) => normalizeLang(v.lang) === 'en-in');
  if (enIndia) return enIndia;

  return null;
}

function refreshVoices() {
  if (!synth) return [];
  voices = synth.getVoices();
  return voices;
}

if (synth && typeof synth.addEventListener === 'function') {
  synth.addEventListener('voiceschanged', () => refreshVoices());
} else if (synth) {
  synth.onvoiceschanged = () => refreshVoices();
}

/**
 * Wait for voices then run once (avoids double speak if voices load + timeout both fire).
 */
function scheduleSpeak(run) {
  if (!synth) return;
  let fired = false;
  const safeRun = () => {
    if (fired) return;
    fired = true;
    synth.removeEventListener?.('voiceschanged', safeRun);
    refreshVoices();
    run();
  };
  refreshVoices();
  if (voices.length) {
    safeRun();
    return;
  }
  synth.addEventListener?.('voiceschanged', safeRun);
  setTimeout(safeRun, 600);
}

function resolveSpeakCallbacks(options) {
  if (typeof options === 'function') return { onEnd: options, onStart: null };
  if (options && typeof options === 'object')
    return { onEnd: options.onEnd || null, onStart: options.onStart || null };
  return { onEnd: null, onStart: null };
}

/** Slightly higher pitch + steady pace reads kinder in many Urdu female TTS voices. */
function tuneUtteranceForVoice(utterance, voice) {
  const fem = voice && scoreFemalePakistani(voice) > 0;
  utterance.pitch = fem ? 1.045 : 1.02;
  utterance.rate = 0.89;
  utterance.volume = 1;
}

/**
 * Speak text — Urdu/Roman Urdu with Pakistani/South Asian voice when available.
 * @param {string} text
 * @param {((() => void) | { onEnd?: () => void; onStart?: () => void })} [options]
 */
export function speak(text, options) {
  const { onEnd, onStart } = resolveSpeakCallbacks(options);

  if (!synth || !text) {
    if (onEnd) onEnd();
    return;
  }

  if (isSpeaking) stop();

  scheduleSpeak(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickBestVoice(refreshVoices());

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'ur-PK';
    } else {
      utterance.lang = 'hi-IN';
    }

    tuneUtteranceForVoice(utterance, voice);

    utterance.onstart = () => {
      isSpeaking = true;
      if (onStart) onStart();
    };
    utterance.onend = () => {
      isSpeaking = false;
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.error('TTS Error:', e);
      isSpeaking = false;
      if (onEnd) onEnd();
    };

    synth.speak(utterance);
  });
}

export function stop() {
  if (!synth) return;
  synth.cancel();
  isSpeaking = false;
}

export function getIsSpeaking() {
  return isSpeaking;
}

/** For UI hint — which voice will read (after voices load). */
export function getSelectedVoiceLabel() {
  if (!synth) return '';
  refreshVoices();
  const voice = pickBestVoice(voices);
  if (!voice) return '';
  return `${voice.name} · ${voice.lang || 'ur-PK'}`;
}

/**
 * Speak a sequence of medications
 */
export function speakAll(medications, onMedStart) {
  if (!medications || medications.length === 0) return;

  let current = 0;

  const speakNext = () => {
    if (current >= medications.length) return;

    const med = medications[current];
    if (onMedStart) onMedStart(current);

    const fullText = [
      `Medicine number ${current + 1}.`,
      med.brand_name ? `Name: ${med.brand_name}.` : '',
      med.card_summary ? `Summary: ${med.card_summary}.` : '',
      med.purpose ? `Purpose: ${med.purpose}.` : '',
      med.usage_instructions ? `Usage: ${med.usage_instructions}.` : '',
      med.timing ? `Timing: ${med.timing}.` : '',
      med.prescriber_note_ur ? `Note: ${med.prescriber_note_ur}.` : '',
    ]
      .filter(Boolean)
      .join(' ');

    speak(fullText, () => {
      current++;
      setTimeout(speakNext, 800);
    });
  };

  speakNext();
}
