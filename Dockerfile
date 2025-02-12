FROM node:18

RUN corepack enable
RUN yarn set version stable
# A quick and dirty fix to prevent watchpack errors.
# TODO: figure out why it's scanning root. Using differnt user does not help.
RUN chmod -R 777 /root

RUN mkdir -p /home/node/dev &&\
    chown -R node:node /home/node/dev

WORKDIR /app

USER node
RUN touch /home/node/.bash_history &&\
    export PROMPT_COMMAND='history -a; history -n'

EXPOSE 3000

ENTRYPOINT ["/bin/bash", "/app/docker-entrypoint.sh"]
