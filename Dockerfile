# ベースイメージ：軽量でNode.js入り
FROM node:18-alpine

# 作業ディレクトリ作成
WORKDIR /app

# package.jsonとlockファイルをコピーして依存関係インストール
COPY package*.json ./
RUN npm install

# アプリ全体をコピー
COPY . .

# Next.js ビルド（output: 'standalone' でOK）
RUN npm run build

# ポート3000で起動（Next.jsデフォルト）
EXPOSE 3000
CMD ["npm", "start"]
