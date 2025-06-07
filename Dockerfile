FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 本番ビルド
RUN npm run build

# ポート開放（Next.jsデフォルト）
EXPOSE 3000

# ✅ standaloneモードでの起動
CMD ["node", ".next/standalone/server.js"]
