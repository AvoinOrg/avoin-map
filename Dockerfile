FROM mcr.microsoft.com/playwright:v1.48.2-jammy AS base

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      dumb-init \
      fonts-liberation \
      gnupg \
      openssh-client \
      wget \
      xauth \
      xvfb && \
    mkdir -p /usr/share/keyrings && \
    wget -qO- https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# The Playwright base image already ships with a UID 1000 user (`pwuser`).
# Normalize that account to `node` so Dev Containers can attach consistently.
RUN if ! getent passwd node >/dev/null; then \
      existing_uid_user="$(getent passwd 1000 | cut -d: -f1 || true)" && \
      if [ -n "${existing_uid_user}" ]; then \
        usermod --login node "${existing_uid_user}"; \
      elif getent group 1000 >/dev/null; then \
        useradd --uid 1000 --gid 1000 --create-home --home-dir /home/node --shell /bin/bash node; \
      else \
        groupadd --gid 1000 node && \
        useradd --uid 1000 --gid 1000 --create-home --home-dir /home/node --shell /bin/bash node; \
      fi; \
    fi && \
    current_group="$(id -gn node)" && \
    if [ "${current_group}" != "node" ]; then \
      if getent group node >/dev/null; then \
        usermod --gid node node; \
      else \
        groupmod --new-name node "${current_group}"; \
      fi; \
    fi && \
    current_home="$(getent passwd node | cut -d: -f6)" && \
    if [ "${current_home}" != "/home/node" ]; then \
      usermod --home /home/node --move-home node; \
    fi && \
    usermod --shell /bin/bash node

RUN corepack enable && corepack prepare yarn@3.6.0 --activate

# A quick and dirty fix to prevent watchpack errors.
# TODO: figure out why it's scanning root. Using different user does not help.
RUN chmod -R 777 /root

RUN mkdir -p /app /home/node/dev && \
    chown -R node:node /home/node /app

WORKDIR /app

USER node

RUN touch /home/node/.bash_history && \
    echo 'PS0="$PS0"'"'"'$(history -a)'"'" >> /home/node/.bashrc && \
    echo 'PROMPT_COMMAND="history -n; $PROMPT_COMMAND"' >> /home/node/.bashrc

FROM base AS app

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--", "/bin/bash", "/app/docker-entrypoint.sh"]
