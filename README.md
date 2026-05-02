# Sehat Saathi — صحت ساتھی

**AI-Powered Prescription Intelligence for Pakistan**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![Vite](https://img.shields.io/badge/built%20with-Vite-646CFF)](https://vitejs.dev/)

> **HEC Generative AI Training — Hackathon submission**  
> Repository: [github.com/tayyabrehman96/HEC-Generative-AI-Training-Hackathon](https://github.com/tayyabrehman96/HEC-Generative-AI-Training-Hackathon)

---

## Executive summary (for judges)

**Sehat Saathi** turns a **photo of a handwritten Pakistani prescription** into **structured, patient-friendly explanations**: purpose in Urdu/Roman Urdu, **decoded dose schedules** (e.g. `1-0-1`), **timing in plain language**, **cheaper local alternatives**, and **indicative PKR cost bands**—plus **text-to-speech** so families can listen.  

The system is **not a doctor**: it **explains what is already written** and flags that **dose and drug changes require a clinician or pharmacist**.

**Why it matters:** prescriptions mix **Urdu, English, Latin brands, shorthand, and poor handwriting**. National literacy context means many households rely on **spoken guidance** for dense health text. Sehat Saathi reduces friction between **the paper prescription** and **safe understanding at home**.

---

## Problem statement

| Challenge | Impact |
|-----------|--------|
| Illegible or shorthand Rx lines | Wrong dose or missed medicines |
| English/Latin brand names | Older patients and carers struggle |
| Codes like `1-0-1` without explanation | Guessing meal times |
| Price opacity | Hard to budget or compare generics |
| No single “plain language” layer | Over-reliance on rushed short consultations |

---

## Solution & innovation

1. **Multi-pass generative pipeline** — not a single “one-shot” caption: **specialist OCR → vision reasoning → pharmacist-style JSON consolidation** with anti-hallucination rules (only drugs grounded in the page text).
2. **Pakistan-aware outputs** — brands, **PKR costing**, Roman Urdu, typical local alternates.
3. **UX for real users** — **2D map + 3D-floating labels** for national context; **dashboard** with cost comparison bars after each scan.
4. **Responsible framing** — disclaimers, “prescription assistant” not prescriber; emphasis on **confirming with pharmacy**.

---

## Architecture

```mermaid
 %%{init: {'theme': 'dark'}}%%
flowchart LR
  subgraph client [Browser — Vite SPA]
    UI[Upload / Results / TTS]
  end
  subgraph proxy [Express — localhost:3001]
    P["/proxy/chat/completions"]
  end
  subgraph upstream [Regolo AI]
    OCR["Pass 1 — DeepSeek OCR"]
    VLM["Pass 2 — Qwen VLM"]
    LLM["Pass 3 — Llama 3.3 70B"]
  end
  UI -->|image + prompts| P
  P --> OCR
  P --> VLM
  P --> LLM
  LLM -->|JSON medicines[]| UI
```

| Pass | Model (configurable) | Role |
|------|----------------------|------|
| 1 | `deepseek-ocr-2` | Full-page transcription; preserve every drug line |
| 2 | `qwen3.5-122b` | Exhaustive visual medicine inventory from the image |
| 3 | `Llama-3.3-70B-Instruct` | Merge A+B + fuzzy DB hints → **strict JSON array** per medicine |

Fuzzy matching against a small **Pakistani medicine hint list** corrects OCR spelling **only** when it aligns with visible text (`src/utils/fuzzyMatch.js`).

---

## Feature highlights (evaluation checklist)

- [x] **Camera / file upload** + optional demo image
- [x] **Three-phase processing UI** (Urdu + English friendly copy)
- [x] Per-medicine cards: raw snippet, purpose, usage, **schedule decoded**, timing, **cost**, alternatives
- [x] **Results dashboard**: medicine count, indicative total PKR band, **per-drug cost bar chart**
- [x] **TTS** for hear-aloud instructions
- [x] **Client-side image prep** before API (`src/utils/imageProcessing.js`)
- [x] **Proxy** keeps API keys off the browser; Vite dev server forwards `/proxy` → Express

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Front-end | Vanilla ES modules, **Vite 6** |
| Styling | Custom CSS (Urdu font: Noto Nastaliq via Google Fonts) |
| Back-end | **Express 5** proxy to Regolo OpenAI-compatible API |
| Config | `src/config.js`, `dotenv` on server |
| Package manager | npm |

---

## Project structure (quick map)

```
├── index.html
├── package.json
├── server.js              # API proxy (REGOLO_API_KEY)
├── vite.config.js         # dev server + /proxy rewrite
├── public/
│   └── pakistan-map.svg   # literacy visual (hero)
├── src/
│   ├── main.js            # UI, pipeline orchestration, results dashboard
│   ├── style.css
│   ├── config.js
│   ├── data/medicineDb.js # fuzzy brand hints
│   ├── services/          # regoloApi, tts
│   └── utils/             # prompts, imageProcessing, fuzzyMatch, prescriptionHelpers
└── README.md
```

---

## Local setup (judges & reviewers)

### Prerequisites

- **Node.js 18+** and npm  
- **[Regolo AI](https://regolo.ai/)** API key (or compatible OpenAI-style endpoint if you fork the proxy)

### Steps

```powershell
cd "Sehat AI"
copy .env.example .env
# Edit .env — set REGOLO_API_KEY=your_key_here

npm install
npm run dev:all
```

- **App:** [http://localhost:3000](http://localhost:3000)  
- **Proxy:** [http://127.0.0.1:3001](http://127.0.0.1:3001)  

`dev:all` runs **Vite + Express** together (`concurrently`).

Other scripts:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Front-end only |
| `npm run proxy` | Proxy only |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview build (with proxy config in `vite.config.js`) |

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REGOLO_API_KEY` | **Yes** (server) | Bearer token for `https://api.regolo.ai/v1/chat/completions` |
| `VITE_API_BASE_URL` | No | Override API base for split deployments |

---

## Ethics, safety & limitations

- Output is **informational** only; **not** diagnosis or a substitute for licensed medical advice.
- Models can **omit or misread** text; users should **compare** with the original prescription and **ask a pharmacist**.
- **PK figures** are **indicative**; real prices vary by city, brand batch, and pharmacy.
- **Literacy statistics** on the hero map are **illustrative national context**, not individual profiling.

---

## Reproducibility notes for judges

1. Clone this repository.  
2. Add `REGOLO_API_KEY` in `.env`.  
3. Run `npm install` && `npm run dev:all`.  
4. Use **Try Demo** or upload a clear prescription photo.  
5. Open browser DevTools → **Console** for pass logs (`Pass 1 (OCR)`, `Pass 2 (VLM)`, final JSON).

---

## Future work

- Offline/low-bandwidth mode / SMS summary  
- Official **drug–interaction** API integration (requires vetted medical data)  
- User accounts & scan history (encrypted)  
- Regional price feeds (API) instead of model-estimated bands  

---

## Acknowledgements

- **HEC Generative AI Training — Hackathon** for the problem platform  
- **Regolo AI** for model access (as configured)  
- Geo outline for the Pakistan map derived from simplified public-domain **world** GeoJSON (Natural Earth–style workflow), used for **visualisation only**

---

## License

MIT — see [LICENSE](LICENSE).

---

## Contact & repository

- **GitHub:** [tayyabrehman96/HEC-Generative-AI-Training-Hackathon](https://github.com/tayyabrehman96/HEC-Generative-AI-Training-Hackathon)

*If this README is your first glance: start with **Executive summary**, run **Local setup**, then open the live UI and scan a sample Rx.*
