FROM node:22-alpine AS builder

WORKDIR /app

COPY nest-app/package*.json ./
RUN npm ci

COPY nest-app/ .
RUN npm run build

FROM node:22-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

COPY nest-app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY dataset /dataset

EXPOSE 3000

CMD ["node", "dist/main.js"]
