FROM mcr.microsoft.com/playwright:v1.48.2-jammy

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      fonts-liberation \
      gnupg \
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

RUN mkdir -p /app /home/node/dev && \
    chown -R node:node /home/node/dev /app

WORKDIR /app

USER node

RUN touch /home/node/.bash_history && \
    echo 'PS0="$PS0"'"'"'$(history -a)'"'" >> /home/node/.bashrc && \
    echo 'PROMPT_COMMAND="history -n; $PROMPT_COMMAND"' >> /home/node/.bashrc

EXPOSE 3000

ENTRYPOINT ["/bin/bash", "/app/docker-entrypoint.sh"]
