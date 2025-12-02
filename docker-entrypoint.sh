#!/bin/bash

if [ -f /home/node/dev/.bash_history ]; then
    echo "History file exists"
    cp /home/node/dev/.bash_history /home/node/.bash_history
else
    cp /home/node/.bash_history /home/node/dev/.bash_history
fi
rm -f /home/node/.bash_history
ln -s /home/node/dev/.bash_history /home/node/.bash_history


if [ "$NODE_ENV" = "production" ]; then
    yarn install --only=prod && yarn run prebuild && yarn build && yarn start;
else
    yarn install && yarn run prebuild && yarn dev;
fi
