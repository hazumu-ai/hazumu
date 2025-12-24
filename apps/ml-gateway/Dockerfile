# syntax=docker/dockerfile:1

FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
ARG PNPM_VERSION=10.25.0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY apps/ml-gateway/pnpm-lock.yaml ./pnpm-lock.yaml
COPY apps/ml-gateway/package.json ./package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY apps/ml-gateway/tsconfig.json ./tsconfig.json
COPY apps/ml-gateway/prisma.config.ts ./prisma.config.ts
COPY apps/ml-gateway/prisma ./prisma
COPY apps/ml-gateway/src ./src
RUN pnpm run prisma:generate
RUN pnpm run build
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/src/generated ./src/generated

# Create an entrypoint script to run migrations then start the app
RUN echo '#!/bin/sh\n\
set -e\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
echo "Starting application..."\n\
node dist/index.js' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3000
CMD ["/app/entrypoint.sh"]

