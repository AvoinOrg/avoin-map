#!/bin/bash
set -euo pipefail

source /app/docker-entrypoint-common.sh

setup_bash_history

if [ "${NODE_ENV:-development}" = "production" ]; then
    yarn workspaces focus -A --production
    yarn build
    yarn start
else
    bootstrap_dev_app
    yarn dev
fi
