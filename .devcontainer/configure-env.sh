#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

gid=$(stat -c '%g' /var/run/docker.sock)
if ! getent group docker | grep -q ":${gid}:"; then
    sudo groupadd -g "$gid" docker
fi
sudo usermod -aG "$gid" "$(id -un)"
