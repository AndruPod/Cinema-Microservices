# One image for all four applications; docker-compose picks the entry point.

FROM node:22-alpine AS build
WORKDIR /usr/src/app
# Toolchain for bcrypt, in case no prebuilt binary matches the platform.
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=build --chown=node:node /usr/src/app/package.json ./
COPY --from=build --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --chown=node:node docker/tcp-healthcheck.js ./docker/
USER node
CMD ["node", "dist/apps/api-gateway/main.js"]
