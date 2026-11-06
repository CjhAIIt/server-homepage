# 构建应用
FROM node:24 AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@11.25.0 && pnpm install --frozen-lockfile
COPY . .
RUN [ ! -e ".env" ] && cp .env.example .env || true
RUN pnpm run build

# 最小化镜像
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g http-server

EXPOSE 80
CMD ["http-server", "dist", "-p", "80"]
