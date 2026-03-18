#!/bin/bash
set -euo pipefail

setup_bash_history() {
    local persistent_history="/home/node/dev/.bash_history"
    local shell_history="/home/node/.bash_history"

    mkdir -p /home/node/dev

    if [ -e "${shell_history}" ] && [ "${shell_history}" -ef "${persistent_history}" ]; then
        echo "History file already linked"
        return
    fi

    if [ -f "${persistent_history}" ]; then
        echo "History file exists"
        cp "${persistent_history}" "${shell_history}"
    elif [ -e "${shell_history}" ]; then
        cp "${shell_history}" "${persistent_history}"
    else
        touch "${persistent_history}"
    fi

    rm -f "${shell_history}"
    ln -s "${persistent_history}" "${shell_history}"
}

bootstrap_dev_app() {
    yarn install
    yarn visual:install
    yarn run prebuild-dev
}

sync_codex_file() {
    local relative_path="$1"
    local mounted_path="$2"
    local workspace_codex_dir="${CODEX_HOME:-/app/.codex}"
    local workspace_path="${workspace_codex_dir}/${relative_path}"

    mkdir -p "$(dirname "${workspace_path}")"

    if [ -f "${mounted_path}" ]; then
        rm -rf "${workspace_path}"
        ln -s "${mounted_path}" "${workspace_path}"
        return
    fi

    if [ ! -e "${workspace_path}" ]; then
        touch "${workspace_path}"
    fi
}

setup_codex_mounts() {
    local workspace_codex_dir="${CODEX_HOME:-/app/.codex}"

    mkdir -p "${workspace_codex_dir}" "${workspace_codex_dir}/rules"

    sync_codex_file "auth.json" "/codex-mounts/auth.json"
    sync_codex_file ".credentials.json" "/codex-mounts/.credentials.json"
    sync_codex_file "rules/default.rules" "/codex-mounts/rules/default.rules"
}
