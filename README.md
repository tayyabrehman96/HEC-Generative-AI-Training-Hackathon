# Sehat Saathi — صحت ساتھی

**AI-Powered Prescription Intelligence for Pakistan** · *Your Health Companion*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![Vite](https://img.shields.io/badge/built%20with-Vite-646CFF)](https://vitejs.dev/)

> **HEC ASPIRE PK — Hackathon · Cohort 3** (Generative AI Training programme)  
> Repository: [github.com/tayyabrehman96/HEC-Generative-AI-Training-Hackathon](https://github.com/tayyabrehman96/HEC-Generative-AI-Training-Hackathon)  
> Formal cover sheet & team roster: **[PRODUCT_SPECIFICATION.md](PRODUCT_SPECIFICATION.md)** (v1.0 · April 2026)  
> **Engineering reproduction & methodology diagrams:** **[TECHNICAL_REPRODUCTION_GUIDE.md](TECHNICAL_REPRODUCTION_GUIDE.md)** · **Railway deploy:** **[DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)**

**On this page:** [Team](#team) · [Technical reproduction guide](TECHNICAL_REPRODUCTION_GUIDE.md) · [Summary](#executive-summary-for-judges) · [Icon legend](#at-a-glance-icon-legend) · [Architecture](#architecture-high-level) · [Layers](#block-diagram-layers) · [Sequence](#sequence-one-full-scan) · [Medicine bank](#pakistani-medicine-bank-medicine_db) · [Pricing](#pricing-and-pkr-bands-how-it-works) · [Data & DB](#data-schema-and-database-important-for-judges) · [Setup](#local-setup-judges-and-reviewers)

---

## Team

| Name | Role | Background |
|:---|:---|:---|
| **Tayyab Rehman** | Team Lead & AI Architect | Ph.D., Cybersecurity & AI Research |
| **Abdul Wasi** | Software Engineer | 4th Semester, Software Engineering |
| **Hammad ur Rehman** | Backend Developer | 3rd Semester, Software Engineering, COMSATS University |
| **Naila** | Research & Quality Assurance | BS Computer Science |
| **Ayesha** | Domain Expert (Life Sciences) | BS Chemistry, LCWU Lahore |
| **Ayesha** | Content Strategy & Pitch | BS English Language & Literature |

*Two specialists share the name **Ayesha**; roles are separated by chemistry vs. literature focus.*

---

## Executive summary (for judges)

| | |
|:--|:--|
| 🎯 **One-liner** | Turn a **photo of a handwritten Pakistani Rx** into **Urdu-friendly explanations**, **dose decoding**, **alternatives**, and **indicative PKR** cost hints. |
| 🤖 **AI** | **3-model** pipeline (OCR → VLM → Llama JSON) via **Regolo**; keys stay on server. |
| 💊 **Data** | **2,272+** local **brand↔generic** rows for **fuzzy spelling hints** (`medicineDb.js`) — *not* a formulary price DB. |
| 🗄️ **Database** | **No server SQL in MVP**; browser `localStorage` + in-memory state; **PostgreSQL** planned for production (ER in README). |

**Sehat Saathi** turns a **photo of a handwritten Pakistani prescription** into **structured, patient-friendly explanations**: purpose in Urdu/Roman Urdu, **decoded dose schedules** (e.g. `1-0-1`), **timing in plain language**, **cheaper local alternatives**, and **indicative PKR cost bands**—plus **text-to-speech** so families can listen.  

The system is **not a doctor**: it **explains what is already written** and flags that **dose and drug changes require a clinician or pharmacist**.

**Why it matters:** prescriptions mix **Urdu, English, Latin brands, shorthand, and poor handwriting**. National literacy context means many households rely on **spoken guidance** for dense health text. Sehat Saathi reduces friction between **the paper prescription** and **safe understanding at home**.

---

## At a glance (icon legend)

🧭 **Quick visual index** for repo / demo review:

| Icon | Meaning |
|:---:|:---|
| 📷 | Image upload / camera / prescription photo |
| 🧠 | Generative models (OCR, VLM, LLM) |
| 🔐 | Secrets (`REGOLO_API_KEY`), Express proxy |
| 💊 | Medicines, cards, **MEDICINE_DB** hints |
| 💰 | PKR strings + numeric bands + dashboard totals |
| 📊 | Stats dashboard, bar chart (relative cost) |
| 🔊 | Browser TTS (`ttsService.js`) |
| 🗺️ | Pakistan map hero (literacy metaphor) |
| 🗄️ | Persistence: static file DB / future SQL |

```
┌─────────────────────────────────────────────────────────────────┐
│  📷 Rx photo  →  🧠 3 passes (Regolo)  →  💊 JSON + 💰 PKR      │
│       ↑              ↑                        ↓                  │
│   Browser        🔐 Proxy only          📊 Dashboard + 🔊 TTS   │
└─────────────────────────────────────────────────────────────────┘
```

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

## Architecture (high level)

**End-to-end data flow:** browser uploads an image → **Express proxy** forwards OpenAI-style requests to **Regolo** → three model passes run (OCR, VLM, consolidation) → **JSON array** is rendered in the UI (cards, dashboard, TTS). **Optional fourth LLM pass** (≥2 medicines) adds educational interaction hints. For **step-by-step reproduction**, **ports**, and **methodology diagrams** (research → validation), see **[TECHNICAL_REPRODUCTION_GUIDE.md](TECHNICAL_REPRODUCTION_GUIDE.md)**.

```mermaid
flowchart LR
  subgraph client["Browser (Vite SPA)"]
    UI["Upload / Results / TTS"]
  end
  subgraph proxy["Express proxy :3001"]
    EP["POST /proxy/chat/completions"]
  end
  subgraph cloud["Regolo AI API"]
    M1["Pass 1: DeepSeek OCR"]
    M2["Pass 2: Qwen VLM"]
    M3["Pass 3: Llama 3.3 70B"]
  end
  UI -->|"image + prompts"| EP
  EP --> M1
  EP --> M2
  EP --> M3
  M3 -->|"medication JSON array"| UI
```

| Pass | Model | Role |
|------|--------|------|
| 1 | `deepseek-ocr-2` | Full-page transcription; every drug line preserved |
| 2 | `qwen3.5-122b` | Visual inventory of medicines on the image |
| 3 | `Llama-3.3-70B-Instruct` | Merge reports + fuzzy hints → **one JSON object per medicine** |

---

## Block diagram (layers)

*Layers communicate over HTTPS (browser) and HTTP (dev: Vite → Express).*

```mermaid
flowchart TB
  subgraph presentation["Presentation layer"]
    A["index.html + src/main.js"]
    B["src/style.css"]
  end
  subgraph application["Application / domain (client)"]
    C["Image pipeline: imageProcessing.js"]
    D["API client: regoloApi.js"]
    E["Normalization: prescriptionHelpers.js"]
    F["Prompts: prompts.js"]
  end
  subgraph reference["Reference data (client-side, static)"]
    G["medicineDb.js → MEDICINE_DB"]
    H["fuzzyMatch.js"]
  end
  subgraph infrastructure["Infrastructure"]
    I["server.js → Regolo proxy"]
    J["vite.config.js → /proxy rewrite"]
  end
  subgraph external["External services"]
    K["api.regolo.ai"]
  end
  presentation --> application
  application --> reference
  application --> I
  I --> K
  J -->|dev| I
```

---

## Sequence: one full scan

⏱️ **Timeline:** one user scan ripples through the stack (simplified).

```mermaid
sequenceDiagram
  autonumber
  participant Browser as Browser SPA
  participant Proxy as Express proxy
  participant Regolo as Regolo API
  participant Fuzz as MEDICINE_DB hints
  Browser->>Browser: Resize / compress image
  Browser->>Proxy: Pass 1 vision OCR
  Proxy->>Regolo: deepseek-ocr-2
  Regolo-->>Proxy: OCR text
  Proxy-->>Browser: Report A
  Browser->>Proxy: Pass 2 vision VLM
  Proxy->>Regolo: qwen3.5-122b
  Regolo-->>Proxy: numbered drug lines
  Proxy-->>Browser: Report B
  Browser->>Fuzz: scanForMedicines A+B
  Fuzz-->>Browser: candidate brand strings
  Browser->>Proxy: Pass 3 chat consolidation
  Proxy->>Regolo: Llama 3.3 70B + system prompt
  Regolo-->>Proxy: JSON array of medications
  Proxy-->>Browser: Parsed meds
  Browser->>Browser: normalize + dashboard + show cards
```

---

## Pakistani medicine bank (MEDICINE_DB)

💊 Static **reference** data in the client bundle — **spelling hints** for OCR/VLM text (`fuzzyMatch.js`). **Not** prices, **not** prescribing. Export name: `MEDICINE_DB` in `src/data/medicineDb.js`.

### Scale & file

📈 **Stats**

| Metric | Value |
|--------|--------|
| **Records** | **2,272** `{ brand, generic }` objects |
| **Module** | `src/data/medicineDb.js` (~2.3k lines) |
| **Export** | `export const MEDICINE_DB = [ ... ]` |

### Row schema (per entry)

🧱 **Shape**

| Field | Type | Example |
|--------|------|---------|
| `brand` | `string` | `"Panadol"` |
| `generic` | `string` | `"Paracetamol"` |

### Sample rows (file order)

📋 **Excerpt**

| # | Brand | Generic |
|---|--------|---------|
| 1 | Hiflux | Fluoxetine |
| 2 | Provas | Valsartan |
| 3 | Provas N | Valsartan + Amlodipine |
| 4 | Abocet | Cetirizine |
| 5 | Eziday | Losartan |
| 6 | Citanew | Escitalopram |
| 7 | Augmentin | Co-Amoxiclav |
| 8 | Panadol | Paracetamol |
| 9 | Risek | Omeprazole |
| 10 | Flagyl | Metronidazole |
| 11 | Softin | Loratadine |
| 12 | Lowplat | Clopidogrel |

### Matching algorithm (summary)

🔎 **Fuzzy pipeline**

```mermaid
flowchart TD
  T["Tokenise OCR + VLM text"] --> L["Levenshtein vs each MEDICINE_DB.brand"]
  L --> S{"Score normalized < 0.4 ?"}
  S -->|yes| C["Add to candidate set"]
  S -->|no| X["Skip"]
  C --> P["Inject as SYSTEM CANDIDATES in Llama prompt"]
  P --> R["Model may fix spellings; must stay grounded in Rx text"]
```

### What `MEDICINE_DB` is **not**

❌ **Scope limits**

| Misconception | Reality |
|---------------|---------|
| Official drug registry | Curated **hint list** for fuzzy match |
| Price / MRP table | **No** PKR fields; prices come from **LLM + UI parsing** |
| Interaction / contraindication DB | **Not** implemented |
| Prescribing authority | **Never** — assistant explains **existing** Rx only |

---

## Pricing and PKR bands (how it works)

💰 No separate price table — **LLM text + optional integers** → browser **normalize + aggregate**.

### Data path

🔄 **Pipeline**

```mermaid
flowchart LR
  subgraph llm["Llama consolidation"]
    A["cost_estimate_pkr Urdu text"]
    B["estimated_cost_low_pkr"]
    C["estimated_cost_high_pkr"]
    D["course_cost_note_pkr"]
  end
  subgraph ui["Browser helpers"]
    E["prescriptionHelpers.normalizeMedication"]
    F["extractPkrRange from text"]
    G["aggregateCostStats"]
    H["Dashboard bars + total band"]
  end
  llm --> E
  A --> F
  B --> G
  C --> G
  F --> G
  G --> H
```

| Step | Component | Output |
|------|-----------|--------|
| 1 | Prompt (`prompts.js`) | Asks for **realistic PKR range** per strip/pack in Urdu + optional ints |
| 2 | `normalizeMedication` | Fills missing nums by regex on `cost_estimate_pkr` |
| 3 | `aggregateCostStats` | Sums lows/highs, max mid for **bar widths** |
| 4 | Results UI | “≈ PKR X – Y total” + per-medicine bar **comparison** |

### Pricing disclaimers (for judges)

⚠️ **Must disclose**

| Topic | Note |
|--------|------|
| **Accuracy** | Figures are **indicative**; cities, stock, and pharmacy chain differ |
| **Source** | Not live DRAP retail scrape — **generative estimate** unless you plug a price API later |
| **Clinical** | Cost must **not** override doctor’s choice of brand |
| **Audit** | For production, store **timestamp + pharmacy region** if you add a real DB |

---

## Data, schema and database (important for judges)

This hackathon MVP is **serverless for patient data**: there is **no PostgreSQL / Mongo / SQL** in the repo. Storage is intentionally minimal:

| Store | Type | Location | What it holds |
|--------|------|----------|----------------|
| **Medicine hint DB** | Static **reference** data (file-backed) | `src/data/medicineDb.js` | Brand ↔ generic pairs for **fuzzy OCR spelling hints** (not a full drug formulary). |
| **Scan history (optional)** | **Browser** key–value | `localStorage` key `sehat_history` | Reserved / future use; parsed history not wired to full UI in current build. |
| **Session state** | In-memory | `main.js` `state` object | Current image, OCR text, medications[], UI flags (lost on refresh). |
| **Secrets** | Environment | `.env` (see `.env.example`; **recommended** not to publish real keys in public repos) | `REGOLO_API_KEY` for the machine running `server.js`. |
| **Model responses** | Transient | RAM / network | JSON from Llama pass drives the results screen. |

**Future (production):** add a real **DB** (e.g. **PostgreSQL**) for `users`, `prescription_scans`, `medication_rows`, `audit_log`; encrypt PHI; keep API keys server-side only. The **logical** shape below matches what you would persist per scan.

### Logical ER-style model (target for a future SQL DB)

```mermaid
erDiagram
  USER ||--o{ PRESCRIPTION_SCAN : uploads
  PRESCRIPTION_SCAN ||--|{ MEDICATION_ROW : contains
  USER {
    uuid id
    string display_name
  }
  PRESCRIPTION_SCAN {
    uuid id
    timestamp created_at
    string ocr_report_a
    string vlm_report_b
  }
  MEDICATION_ROW {
    uuid id
    string brand_name
    string generic_name
    string raw_text
    string purpose
    string schedule_explained_ur
    int cost_low_pkr
    int cost_high_pkr
  }
```

*MVP:* only the **MEDICATION_ROW**-like object exists **in the browser** after each successful run (see JSON contract below).

### Medication JSON contract (API output — one element of the array)

Fields are produced by the consolidation pass and normalized in `prescriptionHelpers.js`:

| Field | Type | Description |
|--------|------|-------------|
| `brand_name` | string | Readable brand from prescription |
| `generic_name` | string | Salt / class |
| `raw_text` | string | Snippet from OCR/VLM for that line |
| `purpose` | string | Urdu / Roman Urdu |
| `usage_instructions` | string | How to take |
| `schedule_explained_ur` | string | Plain explanation of `1-0-1` style codes |
| `timing` | string | Short schedule line |
| `alternatives` | string | Suggested local alternates |
| `cost_estimate_pkr` | string | Human-readable PKR band |
| `estimated_cost_low_pkr` | number \| null | Parsed low |
| `estimated_cost_high_pkr` | number \| null | Parsed high |
| `course_cost_note_pkr` | string | Optional course total note |
| `prescriber_note_ur` | string | Safety reminder |

---

## Feature highlights (evaluation checklist)

- [x] 📷 **Camera / file upload** + optional demo image
- [x] ⚙️ **Three-phase processing UI** (Urdu + English friendly copy)
- [x] 💊 Per-medicine cards: raw snippet, purpose, usage, **schedule decoded**, timing, **cost**, alternatives
- [x] 📊 **Results dashboard**: medicine count, indicative total PKR band, **per-drug cost bar chart**
- [x] 🔊 **TTS** for hear-aloud instructions
- [x] 🖼️ **Client-side image prep** before API (`src/utils/imageProcessing.js`)
- [x] 🔐 **Proxy** keeps API keys off the browser; Vite dev server forwards `/proxy` → Express

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
│   ├── data/medicineDb.js  # ~2,272 brand↔generic rows (fuzzy hints, not prices)
│   ├── services/          # regoloApi, tts
│   └── utils/             # prompts, imageProcessing, fuzzyMatch, prescriptionHelpers
├── railway.toml           # Railway: build + start + healthcheck
├── DEPLOY_RAILWAY.md      # Railway deploy steps
├── TECHNICAL_REPRODUCTION_GUIDE.md
├── PRODUCT_SPECIFICATION.md         # cover + team v1.0
└── README.md
```

---

## Local setup (judges and reviewers)

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

- **App (Vite):** **http://localhost:5173** (default; if the port is busy, use the **Local** URL Vite prints, e.g. `http://localhost:5174`).  
- **Proxy:** **http://127.0.0.1:3001**  

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

**Full procedure (numbered), health checks, acceptance checklist, and troubleshooting:** **[TECHNICAL_REPRODUCTION_GUIDE.md](TECHNICAL_REPRODUCTION_GUIDE.md)**

Quick start:

1. Clone this repository.  
2. Add `REGOLO_API_KEY` in `.env`.  
3. Run `npm install` && `npm run dev:all`.  
4. Open the **Local** URL shown by Vite (typically **http://localhost:5173**).  
5. Use **Try Demo** or upload a clear prescription photo.  
6. Open browser DevTools → **Console** for pass logs (`Pass 1 (OCR)`, `Pass 2 (VLM)`, final JSON).

---

## Future work

- **PostgreSQL (or similar)** for durable `PRESCRIPTION_SCAN` + `MEDICATION_ROW` with encryption at rest  
- Offline/low-bandwidth mode / SMS summary  
- Official **drug–interaction** API integration (requires vetted medical data)  
- User accounts tied to scan history  
- Regional price feeds (API) instead of model-estimated bands  

---

## Acknowledgements

- **HEC ASPIRE PK — Hackathon · Cohort 3** (HEC Generative AI Training programme) for the problem platform  
- **Regolo AI** for model access (as configured)  
- Geo outline for the Pakistan map derived from simplified public-domain **world** GeoJSON (Natural Earth–style workflow), used for **visualisation only**

---

## License

MIT — see [LICENSE](LICENSE).

---

## Contact & repository

- **GitHub:** [tayyabrehman96/HEC-Generative-AI-Training-Hackathon](https://github.com/tayyabrehman96/HEC-Generative-AI-Training-Hackathon)

*If this README is your first glance: start with **Executive summary**, run **Local setup**, then open the live UI and scan a sample Rx.*
