/**
 * Sehat Saathi — Text-to-Speech
 * Prefer South Asian voices (Urdu/Pakistan, Hindi India). Avoid default English engines reading Roman Urdu — sounds unnaturally British/American.
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

/**
 * Higher score = better match for Pakistani Roman Urdu / Urdu patient instructions.
 */
function scoreVoiceForSouthAsianUrdu(v) {
  const lang = normalizeLang(v.lang);
  const name = String(v.name || '').toLowerCase();

  let score = 0;

  if (/urdu|اردو/.test(v.name || '') || /urdu/.test(name)) score += 130;
  if (/pakistan|pakistani/.test(name)) score += 115;

  if (lang === 'ur-pk') score += 105;
  if (lang.startsWith('ur')) score += 88;

  // Hindi (India) — shared phonetics with Urdu; usually sounds regional, not British
  if (lang === 'hi-in') score += 72;
  if (/hindi.*india|microsoft.*hindi|google.*hindi/i.test(name)) score += 68;
  if (lang.startsWith('hi')) score += 58;

  // Other Indian locales — South Asian timbre, closer than en-GB for Roman Urdu
  if (/^(ta|te|mr|gu|pa|bn|kn|ml|or)-in$/i.test(lang)) score += 38;

  // Neural / natural labels often clearer on Edge-Chromium
  if (/natural|neural|premium/i.test(name)) score += 6;

  // Heavy penalty: English voices speaking Urdu lang tags sound wrong ("British Urdu")
  if (lang.startsWith('en')) score -= 95;
  if (/english \(.*uk|united kingdom|british|received pronunciation|\buk\b/i.test(name)) score -= 110;
  if (/daniel|serena|olivia|alice|fred|martha|scansoft/i.test(name) && lang.startsWith('en')) score -= 90;

  return score;
}

function pickBestVoice(allVoices) {
  const ranked = allVoices
    .map((v) => ({ v, s: scoreVoiceForSouthAsianUrdu(v) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (ranked.length) return ranked[0].v;

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

/**
 * Speak text — tuned for Urdu/Roman Urdu with South Asian voice when possible.
 */
export function speak(text, onEnd) {
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
      // Prefer hi-IN tag over ur-PK when no Urdu voice exists — reduces British-default mangling on Chrome/Windows
      utterance.lang = 'hi-IN';
    }

    // Slightly warmer, patient-facing cadence (less “lecture”, less clipped British tone)
    utterance.pitch = 0.98;
    utterance.rate = 0.88;
    utterance.volume = 1;

    utterance.onstart = () => {
      isSpeaking = true;
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

    const fullText = `Medicine number ${current + 1}. 
                     Name: ${med.brand_name}. 
                     Dosage: ${med.dosage}. 
                     Frequency: ${med.frequency}. 
                     Instructions in Urdu: ${med.explanation_urdu}`;

    speak(fullText, () => {
      current++;
      setTimeout(speakNext, 800);
    });
  };

  speakNext();
}
