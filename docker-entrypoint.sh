#!/bin/bash
set -euo pipefail

source /app/docker-entrypoint-common.sh

setup_bash_history
configure_git_safe_directory

keep_devcontainer_alive() {
    local app_pid
    local exit_code

    yarn dev &
    app_pid=$!

    trap 'kill "${app_pid}" 2>/dev/null || true; wait "${app_pid}" 2>/dev/null || true; exit 0' INT TERM HUP

    set +e
    wait "${app_pid}"
    exit_code=$?
    set -e

    echo "yarn dev exited with code ${exit_code}; keeping container alive for debugging."
    exec tail -f /dev/null
}

if [ "${NODE_ENV:-development}" = "production" ]; then
    yarn workspaces focus -A --production
    yarn build
    yarn start
else
    bootstrap_dev_app
    if [ "${DEVCONTAINER_KEEPALIVE:-0}" = "1" ]; then
        keep_devcontainer_alive
    else
        yarn dev
    fi
fi
