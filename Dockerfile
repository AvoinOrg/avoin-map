FROM node:24-slim

RUN corepack enable
RUN yarn set version stable
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*
    
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
