FROM node

WORKDIR /usr/src/app

RUN git clone "https://github.com/The-Nico26/green-platform.git" .
RUN npm install
RUN npm install nodemon -g