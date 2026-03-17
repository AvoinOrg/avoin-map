#!/bin/bash
set -euo pipefail

source /app/docker-entrypoint-common.sh

setup_bash_history
bootstrap_dev_app

code_server_home="${CODE_SERVER_HOME:-/home/node/code-server}"
mkdir -p "${code_server_home}/config" "${code_server_home}/data/user-data" "${code_server_home}/data/extensions"

yarn dev &
app_pid=$!

code-server \
    --auth none \
    --bind-addr 0.0.0.0:8080 \
    --config "${code_server_home}/config/config.yaml" \
    --user-data-dir "${code_server_home}/data/user-data" \
    --extensions-dir "${code_server_home}/data/extensions" \
    /app &
code_server_pid=$!

cleanup() {
    kill "${app_pid}" "${code_server_pid}" 2>/dev/null || true
    wait "${app_pid}" 2>/dev/null || true
    wait "${code_server_pid}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

wait -n "${app_pid}" "${code_server_pid}"
