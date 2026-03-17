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
