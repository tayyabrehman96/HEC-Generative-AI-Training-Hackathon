# Deploy Sehat Saathi on Railway

One **Web Service** serves the **Vite build** (`dist/`) and the **`/proxy`** API on the same origin, so the browser never sees `REGOLO_API_KEY`.

## Prerequisites

- GitHub repo connected to your Railway account  
- A **Regolo** API key  

## Steps

1. **[railway.app](https://railway.app)** → **New Project** → **Deploy from GitHub repo** → select this repository.
2. Railway loads **`railway.toml`** (Nixpacks build + `npm start` + health check on **`/proxy/health`**).
3. Open the service → **Variables** → add:
   - **`REGOLO_API_KEY`** = your secret (required).
4. **Deploy** (or push to `main` to trigger a rebuild). Wait for **Build** then **Deploy** to succeed.  
   - If Railway uses **Railpack** by default and the build skips Vite, open the service **Settings** and set **Builder** to **Nixpacks**, or set the **Build command** manually to:  
     `npm install --include=dev && npm run build`
5. **Settings → Networking → Generate Domain** (or attach your own domain). Open the public **HTTPS** URL.

## Verify

- Visit `https://<your-domain>/proxy/health` → JSON with `"ok": true`.  
- Open the site root → login flow → **Try Demo** or upload; scans should complete without CORS errors.

## Local “production” smoke test

```powershell
npm install
npm run build
$env:REGOLO_API_KEY="your_key"
npm start
```

Open `http://localhost:3001` (or the port shown). Same app as Railway without Vite.

## Costs & limits

Railway uses **usage-based** billing with a **trial / credit** tier; monitor usage in the dashboard. Public demos can drive **Regolo** usage — protect the key and rotate if leaked.

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Build fails | Logs → ensure `npm run build` passes (`vite` in devDependencies is installed at build time). |
| Service crashes on start | **REGOLO_API_KEY** set; logs for `Missing REGOLO_API_KEY`. |
| 404 on `/` | Build must produce `dist/index.html`; check build logs. |
| API errors | Regolo quota, key validity, and request size (large images). |
| **401 Authentication Error** / “Invalid proxy server token” | **Regolo rejected the key** (revoked, typo, wrong project, or `Bearer` duplicated in `.env`). Use **only** the raw key (`sk-…`) in `REGOLO_API_KEY` — no `Bearer ` prefix, no quotes. Create a **new key** in the [Regolo dashboard](https://regolo.ai/) and set it in **Railway → Variables** and local `.env`; rotate if the old key was shared. |
| **`fetch failed`** / proxy **500** with `cause` in JSON | This is a **network path** error from Railway to `api.regolo.ai`, not the browser. Confirm **`REGOLO_API_KEY`** is set only in **Railway → Variables** (never rely on committing `.env`). Redeploy so the server uses the **IPv4 HTTPS fallback**; read deploy logs for `fetch` / `https-ipv4` lines and `code=` / `errno=`. |
| **Timeout** / `aborted due to timeout` | Large models (e.g. `qwen3.5-122b`) often need **>3 minutes**. Set **`REGOLO_FETCH_TIMEOUT_MS`** (e.g. `600000` for 10 min, max ~30 min) on Railway. |
