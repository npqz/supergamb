# Upload SuperGamb to GitHub

Follow these steps to put your project on GitHub.

---

## 1. Install Git (if you don't have it)

- Download: https://git-scm.com/download/win  
- Run the installer (defaults are fine).  
- **Restart your terminal or VS Code** after installing.

---

## 2. Open terminal in the project folder

In VS Code: open the `supergamb` folder, then **Terminal → New Terminal** (or press `` Ctrl+` ``).

Or in PowerShell:

```powershell
cd C:\Users\Yassi\Desktop\supergamb
```

---

## 3. Initialize Git and make the first commit

Run these commands **one by one**:

```bash
git init
git add .
git status
```

Check that `node_modules`, `dist`, `.env`, and `data/store.json` are **not** in the list (they're in `.gitignore`). Then:

```bash
git commit -m "Initial commit: SuperGamb app"
```

---

## 4. Create a repo on GitHub

1. Go to **https://github.com** and sign in.  
2. Click **+** (top right) → **New repository**.  
3. **Repository name:** `supergamb` (or any name you like).  
4. Leave it **empty** (no README, no .gitignore).  
5. Click **Create repository**.

---

## 5. Connect and push

GitHub will show commands like these. Use yours (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/supergamb.git
git branch -M main
git push -u origin main
```

When asked for credentials, use your **GitHub username** and a **Personal Access Token** (not your GitHub password):

- GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token**.  
- Give it a name, tick **repo**, generate, then **copy the token** and paste it when Git asks for a password.

---

## 6. Done

Your code is on GitHub. To deploy on your VPS you can then:

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/supergamb.git
cd supergamb
pnpm install
pnpm run build
# ... then PM2 + nginx as in docs/SETUP-UBUNTU-HOSTINGER.md
```

To push future changes from your PC:

```bash
cd C:\Users\Yassi\Desktop\supergamb
git add .
git commit -m "Describe your changes"
git push
```
