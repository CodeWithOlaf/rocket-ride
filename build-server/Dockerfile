FROM alpine:3.18
ENV NODE_VERSION 21.6.2


RUN apk add --no-cache --upgrade bash
RUN apk add npm
RUN apk add git

WORKDIR /home/app
COPY main.sh main.sh
COPY script.js script.js
COPY package*.json .

RUN npm install


RUN chmod +x main.sh
RUN chmod +x script.js

ENTRYPOINT [ "/home/app/main.sh" ] 
