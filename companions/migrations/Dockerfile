FROM node:24-alpine

LABEL maintainer="Stephane Segning <selastlambou@gmail.com>"
LABEL org.opencontainers.image.description="Drizzle migrations runner for GIS Applications"

WORKDIR /app

RUN yarn add drizzle-kit

COPY drizzle.config.ts tsconfig.json ./
COPY drizzle ./drizzle
COPY src/server/db ./src/server/db
COPY companions/migrations/entrypoint.sh ./entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
