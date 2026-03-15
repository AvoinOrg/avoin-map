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

RUN if ! getent passwd node >/dev/null; then \
      groupadd --gid 1000 node && \
      useradd --uid 1000 --gid 1000 --create-home --shell /bin/bash node; \
    fi

RUN corepack enable && corepack prepare yarn@3.6.0 --activate

# A quick and dirty fix to prevent watchpack errors.
# TODO: figure out why it's scanning root. Using different user does not help.
RUN chmod -R 777 /root

RUN mkdir -p /app /home/node/dev /home/node/.config/code-server /home/node/.local/share/code-server && \
    chown -R node:node /home/node /app

WORKDIR /app

USER node

RUN touch /home/node/.bash_history && \
    echo 'PS0="$PS0"'"'"'$(history -a)'"'" >> /home/node/.bashrc && \
    echo 'PROMPT_COMMAND="history -n; $PROMPT_COMMAND"' >> /home/node/.bashrc

FROM base AS app

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--", "/bin/bash", "/app/docker-entrypoint.sh"]

FROM base AS dev-server

USER root

ARG CODE_SERVER_VERSION=4.106.3

RUN curl -fsSL -o /tmp/code-server.deb "https://github.com/coder/code-server/releases/download/v${CODE_SERVER_VERSION}/code-server_${CODE_SERVER_VERSION}_amd64.deb" && \
    apt-get update && \
    apt-get install -y --no-install-recommends /tmp/code-server.deb && \
    rm -f /tmp/code-server.deb && \
    rm -rf /var/lib/apt/lists/*

USER node

EXPOSE 3000 8080

ENTRYPOINT ["/usr/bin/dumb-init", "--", "/bin/bash", "/app/docker-entrypoint-dev-server.sh"]
