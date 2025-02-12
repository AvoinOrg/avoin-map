#!/bin/bash

if [ -f /home/node/.bash_history ] && [ ! -f /home/node/dev/.bash_history ]; then
  cp /home/node/.bash_history /home/node/dev/.bash_history
fi

# Remove the container’s .bash_history and replace it with a symlink 
# to the file in /home/node/dev. This way, the node user’s history is 
# always read/written from the file in the host-mounted directory.
rm -f /home/node/.bash_history
ln -s /home/node/dev/.bash_history /home/node/.bash_history


if [ "$NODE_ENV" = "production" ]; then
    yarn install --only=prod && node start;
else
    yarn install && yarn dev;
fi
