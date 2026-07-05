FROM node:22-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
