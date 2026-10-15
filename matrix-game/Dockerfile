# The Matrix - Programming Game: frontend + servidor de compilação (Java 17 e Python 3)
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends openjdk-17-jdk-headless python3 \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY shared ./shared
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787
# o código dos jogadores roda como usuário sem privilégios
USER node
EXPOSE 8787
CMD ["node", "server/index.mjs"]
