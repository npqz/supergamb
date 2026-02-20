# Hosting SuperGamb on a Custom Domain

This app is a single Node.js process: it serves the built React client and the tRPC API. To use your own domain (e.g. `supergamb.com`), you need a server, build the app, point DNS to the server, and put HTTPS in front.

---

## 1. Build for production

On your machine or CI:

```bash
pnpm install
pnpm run build
```

This produces:

- **Client:** `dist/public/` (static files + `index.html`)
- **Server:** `dist/index.js` (Express app that serves `dist/public` and `/api/trpc`)

Test locally:

```bash
NODE_ENV=production node dist/index.js
# Or on Windows PowerShell:
$env:NODE_ENV="production"; node dist/index.js
```

Open `http://localhost:3000` (or the port shown). The app should load and API calls should work.

---

## 2. Choose where to run it

You need a host that can run Node and (for your domain) point DNS to it.

| Option | Best for | Custom domain |
|--------|----------|----------------|
| **VPS** (DigitalOcean, Linode, Vultr, etc.) | Full control, one server | Yes – you set DNS and reverse proxy |
| **Railway / Render / Fly.io** | Easiest deploy from Git | Yes – they give you a hostname; you add a CNAME or A record |

---

## 3. Option A – VPS (e.g. Ubuntu) with your domain

### 3.1 Server setup

- Create an Ubuntu (or similar) VPS.
- Point your domain’s **A record** to the VPS IP (e.g. `supergamb.com` → `123.45.67.89`).
- SSH in and install Node (v20+), and optionally **nginx** (or Caddy) and **certbot** for HTTPS.

### 3.2 Run the app

- Copy the **whole project** (or clone from Git) and run:

```bash
pnpm install --prod
pnpm run build
PORT=3000 NODE_ENV=production node dist/index.js
```

Keep it running with **PM2**:

```bash
npm install -g pm2
cd /path/to/supergamb
PORT=3000 NODE_ENV=production pm2 start dist/index.js --name supergamb
pm2 save && pm2 startup
```

The app listens on `3000` (or whatever `PORT` you set). It should **not** be exposed directly to the internet; put nginx (or Caddy) in front.

### 3.3 Reverse proxy + HTTPS (nginx)

- Install nginx and certbot, then configure a server for your domain:

```nginx
# /etc/nginx/sites-available/supergamb
server {
    listen 80;
    server_name supergamb.com www.supergamb.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- Enable the site, get a certificate, reload nginx:

```bash
sudo ln -s /etc/nginx/sites-available/supergamb /etc/nginx/sites-enabled/
sudo certbot --nginx -d supergamb.com -d www.supergamb.com
sudo nginx -t && sudo systemctl reload nginx
```

Your app is now served over **https://supergamb.com**. The server code already uses `X-Forwarded-Proto` for secure cookies.

---

## 4. Option B – Railway / Render / Fly.io

These platforms run `node dist/index.js` for you and give you a URL. You then point your **custom domain** at that URL.

1. **Connect your repo** and set:
   - **Build:** `pnpm install && pnpm run build`
   - **Start:** `NODE_ENV=production node dist/index.js`
   - **Root directory** (if needed): project root where `package.json` and `dist/` live.

2. **Set env:**  
   `NODE_ENV=production` (and `PORT` if the platform doesn’t set it).

3. **Custom domain:**  
   In the dashboard, add your domain (e.g. `supergamb.com`). They’ll show either:
   - A **CNAME** target (e.g. `your-app.up.railway.app`), or  
   - An **A** record (IP).  
   In your DNS provider, create the CNAME or A record they specify.

4. **HTTPS:**  
   Usually automatic once the domain points to their host.

---

## 5. Environment variables

- **Server (runtime):**
  - `NODE_ENV=production` – required so the app serves `dist/public` and uses production cookie behavior.
  - `PORT` – port the Node process listens on (default `3000`; platforms often set this).

- **Client (build time):**  
  If you use OAuth (e.g. `getLoginUrl()` in `client/src/const.ts`), set **when you run `pnpm run build`**:
  - `VITE_OAUTH_PORTAL_URL` – OAuth provider base URL.
  - `VITE_APP_ID` – app id for that provider.  

  The client uses `window.location.origin` for redirects, so once the site is on `https://supergamb.com`, redirect URIs will be correct as long as users use that URL.

- **Data:**  
  The app uses `data/store.json` (and any paths you configured). On a VPS, make sure that path is writable and backed up. On Railway/Render/Fly, use their persistent disk or attach a database if you later move off JSON.

---

## 6. Checklist for your custom domain

1. **DNS:**  
   - For VPS: A record for `supergamb.com` (and optionally `www`) to your server IP.  
   - For Railway/Render/Fly: CNAME (or A) for the hostname they give you.

2. **HTTPS:**  
   - VPS: nginx + Certbot (or Caddy with automatic HTTPS).  
   - PaaS: usually automatic after adding the domain.

3. **Cookies:**  
   - The app already sets cookies using `X-Forwarded-Proto` and `sameSite`/`secure` correctly for HTTPS behind a proxy. No extra config needed if you use a reverse proxy or PaaS with HTTPS.

4. **OAuth (if used):**  
   - Register `https://supergamb.com` (and `https://supergamb.com/api/oauth/callback`) as allowed redirect URIs in your OAuth provider.  
   - Build the client with the right `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` if they differ from dev.

After that, opening **https://supergamb.com** should load your app and keep sessions and API calls working on your custom domain.
