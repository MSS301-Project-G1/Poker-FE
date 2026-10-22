# syntax=docker/dockerfile:1

# ---- deps: shared by the dev server and the production build ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev: Vite dev server in game mode (local bot tables, ?devUser) ----
# Source is bind-mounted by compose.yml, so this stage only needs node_modules.
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev:game", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]

# ---- build: static bundle; VITE_* values are baked in at build time ----
FROM deps AS build
ARG VITE_API_BASE_URL=""
ARG VITE_GAME_API_BASE_URL=""
ARG VITE_GAME_WS_URL=""
ARG VITE_SOCIAL_WS_URL=""
ARG VITE_CHAT_WS_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_GAME_API_BASE_URL=$VITE_GAME_API_BASE_URL \
    VITE_GAME_WS_URL=$VITE_GAME_WS_URL \
    VITE_SOCIAL_WS_URL=$VITE_SOCIAL_WS_URL \
    VITE_CHAT_WS_URL=$VITE_CHAT_WS_URL
COPY . .
RUN npm run build

# ---- prod: nginx serves dist/ and proxies the backend on the same origin ----
FROM nginx:1.27-alpine AS prod
# The nginx image runs envsubst on /etc/nginx/templates/*.template at startup.
ENV API_GATEWAY_URL=http://host.docker.internal:8080 \
    GAME_SERVICE_URL=http://host.docker.internal:8082 \
    SOCIAL_SERVICE_URL=http://host.docker.internal:8084 \
    CHAT_SERVICE_URL=http://host.docker.internal:8085
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
