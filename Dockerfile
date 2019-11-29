FROM node:alpine

WORKDIR /usr/src/app/

#RUN apk add --no-cache git
#RUN git clone "https://github.com/The-Nico26/green-platform.git" .
COPY ./ /usr/src/app/

RUN npm install
RUN npm install nodemon -g

COPY config.json /usr/src/app/do