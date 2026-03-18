#!/bin/bash
set -euo pipefail

source /app/docker-entrypoint-common.sh

setup_bash_history
setup_codex_mounts

code_server_home="${CODE_SERVER_HOME:-/home/node/code-server}"
code_server_log_dir="${code_server_home}/logs"
app_log_file="${code_server_log_dir}/app-startup.log"
app_status_file="${code_server_log_dir}/app-status.txt"

mkdir -p \
    "${code_server_home}/config" \
    "${code_server_home}/data/user-data" \
    "${code_server_home}/data/extensions" \
    "${code_server_log_dir}"

log_app_message() {
    local message="$1"
    printf '[%s] %s\n' "$(date -Iseconds)" "${message}" | tee -a "${app_log_file}"
}

write_app_status() {
    printf '%s\n' "$1" > "${app_status_file}"
}

code-server \
    --auth none \
    --bind-addr 0.0.0.0:8080 \
    --config "${code_server_home}/config/config.yaml" \
    --user-data-dir "${code_server_home}/data/user-data" \
    --extensions-dir "${code_server_home}/data/extensions" \
    /app &
code_server_pid=$!

(
    set +e

    write_app_status "bootstrapping"
    log_app_message "Starting development bootstrap."

    bootstrap_dev_app 2>&1 | tee -a "${app_log_file}"
    bootstrap_status=${PIPESTATUS[0]}

    if [ "${bootstrap_status}" -ne 0 ]; then
        write_app_status "bootstrap_failed:${bootstrap_status}"
        log_app_message "Bootstrap failed with exit code ${bootstrap_status}. code-server will stay available."
        log_app_message "Fix the issue, then rerun: yarn install && yarn visual:install && yarn run prebuild-dev && yarn dev"
        exit 0
    fi

    write_app_status "running"
    log_app_message "Bootstrap succeeded. Starting Next.js dev server."

    yarn dev 2>&1 | tee -a "${app_log_file}"
    app_status=${PIPESTATUS[0]}

    write_app_status "exited:${app_status}"
    log_app_message "Next.js dev server exited with code ${app_status}. code-server will stay available."
    exit 0
) &
app_pid=$!

cleanup() {
    kill "${app_pid}" "${code_server_pid}" 2>/dev/null || true
    wait "${app_pid}" 2>/dev/null || true
    wait "${code_server_pid}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

wait "${code_server_pid}"
