FROM node:22-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

# Install deps without triggering prepare script
COPY package*.json ./
RUN npm ci --ignore-scripts

# Build native modules (better-sqlite3 needs its install scripts)
RUN npm rebuild better-sqlite3

# Copy source and build
COPY . .
RUN npm run build

# Install entrypoint wrapper
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
