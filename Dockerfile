# ベースイメージ（軽量なNode.js環境）
FROM node:18-alpine

# 作業ディレクトリの作成・移動
WORKDIR /app

# 依存ファイルをコピーしてインストール
COPY package*.json ./
RUN npm install

# アプリケーションファイル全体をコピー
COPY . .

# ✅ 本番ビルド（これが重要！）
RUN npm run build

# ポート3000を開放（Next.jsデフォルト）
EXPOSE 3000

# アプリ起動コマンド
CMD ["npm", "start"]
