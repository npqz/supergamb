#!/bin/bash
# Run this script ON THE UBUNTU SERVER from the project root: bash scripts/deploy-ubuntu.sh
# Makes sure deps are installed, build is fresh, and PM2 runs the app.

set -e
cd "$(dirname "$0")/.."

echo "Installing dependencies..."
pnpm install

echo "Building..."
pnpm run build

echo "Ensuring data dir exists..."
mkdir -p data

if command -v pm2 &> /dev/null; then
  echo "Restarting app with PM2..."
  NODE_ENV=production PORT=3000 pm2 restart supergamb --update-env || \
  NODE_ENV=production PORT=3000 pm2 start dist/index.js --name supergamb
  pm2 save
  echo "Done. Check: pm2 status && pm2 logs supergamb"
else
  echo "PM2 not found. Install with: npm install -g pm2"
  echo "Then run: NODE_ENV=production PORT=3000 pm2 start dist/index.js --name supergamb && pm2 save && pm2 startup"
fi
