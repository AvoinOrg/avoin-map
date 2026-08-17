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

configure_git_safe_directory() {
    if ! command -v git >/dev/null 2>&1; then
        return
    fi

    git config --global --get-all safe.directory | grep -Fx /app >/dev/null 2>&1 || \
        git config --global --add safe.directory /app
}

configure_ssh_known_hosts() {
    local ssh_dir="/home/node/.ssh"
    local known_hosts="${ssh_dir}/known_hosts"

    if [ ! -f /ssh-known-hosts ]; then
        return
    fi

    mkdir -p "${ssh_dir}"
    chmod 700 "${ssh_dir}"
    cp /ssh-known-hosts "${known_hosts}"
    chmod 600 "${known_hosts}"
}

bootstrap_dev_app() {
    yarn install
    yarn visual:install
    yarn run prebuild-dev
}
