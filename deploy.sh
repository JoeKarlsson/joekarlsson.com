#!/bin/bash
set -euo pipefail

echo "Building site..."
npm run build

echo "Deploying to CT 165..."
rsync -avz --delete dist/ root@192.168.0.165:/var/www/joekarlsson.com/

echo "Deployed to http://192.168.0.165"
