FROM node:alpine

ARG module
ENV MOD=${module}

WORKDIR /usr/src/app/

RUN git clone "https://github.com/The-Nico26/green-platform.git" .

COPY package.json /usr/src/app/
RUN npm install
RUN npm install nodemon -g

COPY config.json /usr/src/app/
ENTRYPOINT "nodemon" ${MOD}