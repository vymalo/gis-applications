FROM node:24-alpine

LABEL maintainer="Stephane Segning <selastlambou@gmail.com>"
LABEL org.opencontainers.image.description="Drizzle migrations runner for GIS Applications"

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/

RUN yarn install --frozen-lockfile --production=false --ignore-scripts

COPY drizzle.config.ts tsconfig.json ./
COPY drizzle ./drizzle
COPY src/server/db ./src/server/db
COPY companions/migrations/entrypoint.sh ./entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
