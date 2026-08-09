# TOEIC990 App

TOEIC990点取得を目指す学習者向けアプリ（Next.js 14 + Supabase）。

## セットアップ

```bash
npm install
cp .env.example .env.local  # Supabaseのプロジェクト情報を設定
npm run dev
```

## スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run lint` - ESLint実行
- `npm run typecheck` - 型チェック
- `npm run build` - 本番ビルド

## 実装状況（フェーズ1: MVP）

- [x] Supabase認証（サインアップ / ログイン / ログアウト）
- [x] 基本ダッシュボード
- [ ] 単語・文法SRS学習（ts-fsrs）
