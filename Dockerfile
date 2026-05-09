FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g @nestjs/cli
