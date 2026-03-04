FROM node:24

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      fonts-liberation \
      gnupg \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libdrm2 \
      libgbm1 \
      libgl1 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libu2f-udev \
      libvulkan1 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxkbcommon0 \
      libxrandr2 \
      wget \
      xdg-utils && \
    mkdir -p /usr/share/keyrings && \
    wget -qO- https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable
RUN yarn set version stable
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends sudo && \
#     rm -rf /var/lib/apt/lists/*
    
# A quick and dirty fix to prevent watchpack errors.
# TODO: figure out why it's scanning root. Using differnt user does not help.
RUN chmod -R 777 /root

RUN mkdir -p /home/node/dev &&\
    chown -R node:node /home/node/dev

WORKDIR /app

USER node
RUN touch /home/node/.bash_history &&\
    echo 'PS0="$PS0"'"'"'$(history -a)'"'" >> /home/node/.bashrc &&\
    echo 'PROMPT_COMMAND="history -n; $PROMPT_COMMAND"' >> /home/node/.bashrc

EXPOSE 3000

ENTRYPOINT ["/bin/bash", "/app/docker-entrypoint.sh"]
