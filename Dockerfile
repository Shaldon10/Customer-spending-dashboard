FROM node:22-bookworm-slim AS build

WORKDIR /workspace/capitech

COPY capitech/package.json capitech/package-lock.json ./
RUN npm ci

COPY capitech/ ./
RUN npx nx build capitech --configuration=production

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app

COPY --from=build --chown=node:node /workspace/capitech/dist/apps/capitech ./dist/apps/capitech

EXPOSE 4000

USER node

CMD ["node", "dist/apps/capitech/server/server.mjs"]
