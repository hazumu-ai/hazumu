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
COPY apps/ml-gateway/src ./src
RUN pnpm run build
RUN pnpm prune --prod

FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["dist/index.js"]
