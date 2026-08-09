# TOEIC990 App

TOEIC990点取得を目指す学習者向けアプリ（Next.js 14 + Supabase）。

## セットアップ

```bash
npm install
cp .env.example .env.local  # Supabaseのプロジェクト情報を設定
# SupabaseのSQL Editorで supabase/migrations/0001_vocab_cards.sql を実行
npm run dev
```

動作確認用のサンプル単語カードを入れたい場合は、`supabase/seed_sample_vocab.sql` の
`<YOUR_USER_ID>` を自分のuser_idに置き換えてSQL Editorで実行してください。

## スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run lint` - ESLint実行
- `npm run typecheck` - 型チェック
- `npm run build` - 本番ビルド

## 実装状況（フェーズ1: MVP）

- [x] Supabase認証（サインアップ / ログイン / ログアウト）
- [x] 基本ダッシュボード
- [x] 単語カードSRS学習（ts-fsrs、表(英)/裏(意味・例文)、正誤で復習間隔を自動調整）
- [ ] 文法問題（4択、誤答時解説表示）
