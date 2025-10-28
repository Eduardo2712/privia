# Use Node.js LTS version
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:docker

EXPOSE 3000

CMD ["npm", "start"]