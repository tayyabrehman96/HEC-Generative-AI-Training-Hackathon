# Public link (temporary demo)

Use this when you want a **shareable HTTPS URL** while the app still runs on your PC. The link only works while your machine and the tunnel stay running.

## What you run locally

| Port | Role |
|------|------|
| **3000** | Vite + UI (also proxies `/proxy` to the Express server) |
| **3001** | Express + `REGOLO_API_KEY` (do not expose the key in chat or Git) |

Keep **one** public URL for both UI and API: tunnel **port 3000** only, with **`npm run dev:all`** already running.

---

## Process (ngrok)

1. **Account & CLI**  
   Sign up at [ngrok](https://ngrok.com/), install the CLI (Windows: `winget install Ngrok.Ngrok`), open a **new** terminal after install.

2. **Save authtoken once (local only)**  
   Copy the token from [Your Authtoken](https://dashboard.ngrok.com/get-started/your-authtoken). **Never paste it in Cursor chat, issues, or Git.** In your own terminal:

   ```powershell
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ngrok config check
   ```

3. **Start the app** (leave this running):

   ```powershell
   cd "Sehat AI"
   npm run dev:all
   ```

4. **Start the tunnel** (second terminal):

   ```powershell
   ngrok http 3000
   ```

5. **Copy the public link** from the ngrok output (the `https://…` line). That is your **public URL**.  
   Optional: while the tunnel runs, open [http://127.0.0.1:4040](http://127.0.0.1:4040) to inspect requests.

6. **If the browser shows a Vite “blocked host” error**  
   Add your exact tunnel hostname to `.env` (no quotes), restart `npm run dev:all`:

   ```env
   __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=your-subdomain.ngrok-free.app
   ```

   Or add the host pattern to `server.allowedHosts` in `vite.config.js` (see [Vite server.allowedHosts](https://vite.dev/config/server-options.html#server-allowedhosts)).

---

## Process (Cloudflare Quick Tunnel, no ngrok)

1. Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).
2. With `npm run dev:all` running:

   ```powershell
   cloudflared tunnel --url http://localhost:3000
   ```

3. Use the printed `https://….trycloudflare.com` URL as the public link.

---

## Security

- Revoke any authtoken that was ever pasted into chat or a public place; create a new one in the dashboard.
- A public tunnel lets anyone who has the URL use your **Regolo usage**; turn the tunnel off when done.

For a **persistent** free HTTPS demo (no tunnel, no laptop on): see **[DEPLOY_PUBLIC_DEMO.md](./DEPLOY_PUBLIC_DEMO.md)** (Render etc.).
