# Set up SuperGamb on Ubuntu (Hostinger VPS + domain)

Use this guide when your **domain** is on Hostinger and your **VPS** is Ubuntu (Hostinger or any provider).

---

## What you need

- Your **domain** (e.g. `yourdomain.com`) – DNS on Hostinger
- Your **VPS public IP** (e.g. `123.45.67.89`)
- SSH access to the VPS (username + password or SSH key)

---

## Step 1 – Point your domain to the VPS (Hostinger DNS)

1. Log in to **Hostinger** → **Domains** → select your domain → **DNS / Nameservers** (or **Manage DNS**).
2. Add or edit **A records**:
   - **Name:** `@` (or leave blank for root) → **Points to:** your VPS IP → **TTL:** 3600 (or default)
   - **Name:** `www` → **Points to:** same VPS IP → **TTL:** 3600
3. Save. DNS can take 5–30 minutes to update. You can check with:  
   `ping yourdomain.com` (should show your VPS IP when ready).

---

## Step 2 – Connect to your Ubuntu server

From your computer:

```bash
ssh root@YOUR_VPS_IP
# Or if you use a user: ssh youruser@YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with the real IP (e.g. `123.45.67.89`).

---

## Step 3 – Install Node.js, pnpm, nginx, and Certbot

Run these on the server (copy-paste as a block or one by one):

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install nginx (reverse proxy) and certbot (free SSL)
apt install -y nginx certbot python3-certbot-nginx

# Check versions
node -v   # should be v20.x
pnpm -v
nginx -v
```

---

## Step 4 – Put your app on the server

You can either **upload the project** or **clone from Git**.

### Option A – Upload from your PC (no Git)

1. On your **Windows PC**, build the app first:
   ```powershell
   cd C:\Users\Yassi\Desktop\supergamb
   pnpm install
   pnpm run build
   ```
2. Zip the project (include `dist`, `node_modules`, `package.json`, `data`, etc.).  
   Or zip everything and run `pnpm install --prod` and `pnpm run build` on the server.
3. From your PC, upload the zip (e.g. with **FileZilla**, **WinSCP**, or **scp**):
   ```bash
   scp -r C:\Users\Yassi\Desktop\supergamb root@YOUR_VPS_IP:/var/www/
   ```
   Or upload the zip and unzip on the server.

4. On the **server**:
   ```bash
   mkdir -p /var/www
   cd /var/www
   # If you uploaded a zip:
   # unzip supergamb.zip -d supergamb
   cd supergamb
   ```

### Option B – Clone from Git (if the project is in GitHub/GitLab)

On the server:

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/YOUR_USERNAME/supergamb.git
cd supergamb
```

Then install and build on the server:

```bash
cd /var/www/supergamb
pnpm install
pnpm run build
```

If you used Option A and already built on PC, you can skip `pnpm run build` only if you uploaded the `dist` folder; otherwise run `pnpm install` and `pnpm run build` on the server.

---

## Step 5 – Create the data directory and run the app

```bash
cd /var/www/supergamb
mkdir -p data
# If you use store.json, ensure it exists (e.g. copy from your PC or leave empty and let the app create it)
NODE_ENV=production PORT=3000 node dist/index.js
```

You should see something like: `Server running on http://localhost:3000/`.  
Press **Ctrl+C** to stop. We’ll run it with PM2 next.

---

## Step 6 – Run the app with PM2 (keeps it running)

```bash
cd /var/www/supergamb
npm install -g pm2
NODE_ENV=production PORT=3000 pm2 start dist/index.js --name supergamb
pm2 save
pm2 startup
# Run the command that pm2 startup prints (e.g. env PATH=... pm2 startup systemd -u root --hp /root)
```

Check:

```bash
pm2 status
pm2 logs supergamb
```

The app is now running on port **3000** on the server (not public yet; nginx will expose it).

---

## Step 7 – Configure nginx (reverse proxy)

Create a config (replace `yourdomain.com` with your real domain):

```bash
nano /etc/nginx/sites-available/supergamb
```

Paste this (change `yourdomain.com` and `www.yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
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

Save (Ctrl+O, Enter, Ctrl+X). Then enable the site and test:

```bash
ln -sf /etc/nginx/sites-available/supergamb /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Open **http://yourdomain.com** in the browser. The site should load (HTTP only for now).

---

## Step 8 – Enable HTTPS (SSL) with Let’s Encrypt

Make sure DNS for `yourdomain.com` and `www.yourdomain.com` points to this server, then:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts (email, agree to terms). Certbot will adjust nginx and get a certificate. After that, use **https://yourdomain.com**.

---

## Step 9 – Firewall (optional but recommended)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## Quick reference

| Task              | Command |
|-------------------|--------|
| Restart app       | `pm2 restart supergamb` |
| View logs         | `pm2 logs supergamb` |
| Stop app          | `pm2 stop supergamb` |
| Reload nginx      | `systemctl reload nginx` |
| Renew SSL         | `certbot renew` (or set up a cron job) |

---

## Troubleshooting

- **Site not loading:** Check `pm2 status` and `pm2 logs supergamb`. Ensure nginx is running: `systemctl status nginx`.
- **502 Bad Gateway:** App not running or wrong port. Check `pm2 status` and that the app listens on `3000`; in nginx `proxy_pass` must be `http://127.0.0.1:3000`.
- **Domain not resolving:** Wait for DNS (Hostinger). Check with `ping yourdomain.com` and ensure the A record points to your VPS IP.
- **Cookie / login issues:** Ensure you’re using **https://** and that nginx sends `X-Forwarded-Proto` (the config above does).

Once these steps are done, your site is live on **https://yourdomain.com** on your Ubuntu VPS with your Hostinger domain.
