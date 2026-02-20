# SuperGamb

Crypto casino-style app with React (Vite) frontend and Express + tRPC backend. Uses a JSON file store for users, balances, and game history.

## Stack

- **Client:** React, Vite, Tailwind, tRPC, Framer Motion, i18next
- **Server:** Express, tRPC, session-based auth
- **Data:** `data/store.json` (no database required)

## Setup

```bash
pnpm install
pnpm run build
```

## Run

- **Development:** `pnpm run dev` (then open the URL shown)
- **Production:** `NODE_ENV=production node dist/index.js`

## Deploy

See [docs/SETUP-UBUNTU-HOSTINGER.md](docs/SETUP-UBUNTU-HOSTINGER.md) for VPS + custom domain (e.g. Hostinger).

## License

MIT
