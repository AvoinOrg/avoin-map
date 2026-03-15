#!/bin/bash
set -euo pipefail

setup_bash_history() {
    if [ -f /home/node/dev/.bash_history ]; then
        echo "History file exists"
        cp /home/node/dev/.bash_history /home/node/.bash_history
    else
        cp /home/node/.bash_history /home/node/dev/.bash_history
    fi

    rm -f /home/node/.bash_history
    ln -s /home/node/dev/.bash_history /home/node/.bash_history
}

bootstrap_dev_app() {
    yarn install
    yarn visual:install
    yarn run prebuild-dev
}
