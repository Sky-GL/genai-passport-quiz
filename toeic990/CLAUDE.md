# TOEIC990 App - 開発規約（固有）

> 共通方針（ループエンジニアリング、ユーザー向け説明ルール、コーディング規約全般）はリポジトリルートの`../CLAUDE.md`を参照。Claude Codeは親ディレクトリのCLAUDE.mdも自動的に読み込むため、ここには本アプリ固有の情報のみ記載する。

## プロジェクト概要
TOEIC990点取得を目指す学習者向けの学習アプリ。Web優先（Next.js 14 App Router）。

## 技術スタック
- フロントエンド: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- DB/認証: Supabase (Postgres + Auth)
- SRSアルゴリズム: ts-fsrs
- ホスティング: Vercel（`main`ブランチから自動デプロイ）

## Supabase運用メモ
- マイグレーションは `supabase/migrations/` に連番で追加し、都度SQL Editorで手動実行してもらう（CLIでの自動適用は行っていない）
- 新しいテーブル/カラムを追加したら、既存データへの反映が必要か（UPDATE文が要るか）を都度確認する

## デプロイ運用
- 開発は `claude/toeic990-dev-guidelines-fte80g` ブランチで行い、動作確認後に`main`へマージしてVercel本番デプロイに反映する
- Vercelの環境変数（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`）はダッシュボードで設定済み

## コーディング規約（本アプリ固有）
- コミット前に `npm run lint` と `npm run typecheck` を実行（ルート共通方針のループエンジニアリングにおける自動検証ステップの一部として毎回実行する）
- DBアクセスは `/lib/supabase` 経由に統一（コンポーネント内で直接クエリしない）

## 開発フェーズ
1. **MVP**: 認証、単語SRS学習（完了）
2. **模試機能**: Part5,6中心のテキスト問題演習
3. **リスニング**: Part1-4、音声再生+設問
4. **弱点分析**: Part別/カテゴリ別正答率の可視化、復習リコメンド

各フェーズはこの順で実装し、フェーズ内は機能単位でタスク分解して進める。
