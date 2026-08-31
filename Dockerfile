# 使用較新的 Node.js 版本 (建議 18 或 20 以支援 Next.js 14)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 停用 Next.js 遙測
ENV NEXT_TELEMETRY_DISABLED=1

# 執行建置
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 注意：Next.js 14 預設不一定會產生 next.config.js 在根目錄，
# 如果你使用的是 next.config.mjs 或 ts，請根據實際檔案修改。
# 但如果你在 next.config.js 中開啟了 output: 'standalone'，則主要執行檔會在 .next/standalone。
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 複製 standalone 建置輸出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 56130
ENV PORT=56130
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
