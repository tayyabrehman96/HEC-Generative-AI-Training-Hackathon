# Public demo URL (free hosting)

Move off **localhost** onto a stable **HTTPS** URL using one cheap Node host. This repo ships **Express + built Vite** on the **same domain**: `/` is the app, **`/proxy`** is the Regolo proxy (API key stays on the server).

| Local | Hosted |
|-------|--------|
| Vite `:3000` + proxy `:3001` | One process: **`npm start`** after **`npm run build`** |

Locally you still use `npm run dev:all`; on the cloud, `NODE_ENV=production` lets `server.js` serve `dist/` and the proxy together.

---

## Option A — [Render](https://render.com/) (easy free subdomain)

Free web services spin down after idle (**cold start** ~30–60s on first load).

1. Push this repo to **GitHub** (fork or new repo).

2. In Render: **New +** → **Web Service**, connect the repo.

3. Use these settings:

   | Setting | Value |
   |---------|--------|
   | **Runtime** | Node |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance type** | Free (if offered) |

4. **Environment** (Production):

   - `NODE_ENV` = `production` (Render often sets this; add if missing.)
   - `REGOLO_API_KEY` = your secret from [.env locally](https://regolo.ai/) — paste only in Render’s dashboard, never in Git.

5. Deploy. Open the URL Render gives (`https://…onrender.com`). That is your **public demo link**.

Do **not** set `PROXY_ONLY` on the server (that flag is only for local `npm run proxy` alongside Vite).

---

## Option B — [Railway](https://railway.app/), [Fly.io](https://fly.io/), VPS

Same idea:

- Install deps → **`npm run build`**
- Start with **`NODE_ENV=production`** and **`REGOLO_API_KEY`**
- Run **`npm start`** (runs `node server.js`)

Expose the HTTP port your host assigns (`PORT`). No `VITE_API_BASE_URL` is required when UI and `/proxy` share one origin.

---

## Smoke-test production build on your PC

```powershell
cd "Sehat AI"
npm install
npm run build
$env:NODE_ENV = "production"
node server.js
```

Open `http://127.0.0.1:3001`. Stop with Ctrl+C ; unset `NODE_ENV` for normal dev again.

---

## Troubleshooting

- **Blank site / 502** — build failed or `dist/` missing on the server: check Render **Logs** → build output.
- **API errors** — `REGOLO_API_KEY` wrong or quota; check server logs (`[Proxy]` lines).
- **Split front/back domains** — if you insist on hosting the SPA elsewhere, rebuild with  
  `VITE_API_BASE_URL=https://YOUR-API-HOST/proxy` and CORS/origin tweaks; not described here.

---

## Security reminder

Treat the public URL as a **demo**: rate limits on the host won’t replace proper auth if you extend the product later.
