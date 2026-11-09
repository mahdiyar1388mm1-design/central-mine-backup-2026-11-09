# syntax=docker/dockerfile:1
FROM node:22-alpine AS development
WORKDIR /app
COPY ./package.json ./package-lock.json ./
# Cache mount so a flaky registry connection only has to re-fetch what
# actually failed on retry, not the whole tree from zero; the extra
# fetch-retry settings give npm more patience with a slow/unstable network.
RUN --mount=type=cache,target=/root/.npm \
    npm set fetch-retries 5 && \
    npm set fetch-retry-mintimeout 20000 && \
    npm set fetch-retry-maxtimeout 120000 && \
    npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm set fetch-retries 5 && \
    npm set fetch-retry-mintimeout 20000 && \
    npm set fetch-retry-maxtimeout 120000 && \
    npm ci --omit=dev
COPY --from=development /app/dist ./dist
CMD ["npm", "run", "start:prod"]
