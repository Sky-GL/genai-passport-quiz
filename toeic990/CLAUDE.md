# TOEIC990 App - 開発規約

## プロジェクト概要
TOEIC990点取得を目指す学習者向けの学習アプリ。Web優先（Next.js 14 App Router）。

## 技術スタック
- フロントエンド: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- DB/認証: Supabase (Postgres + Auth)
- SRSアルゴリズム: ts-fsrs
- ホスティング: Vercel（`main`ブランチから自動デプロイ）

## ユーザー向け説明ルール（重要）
このプロジェクトのユーザーはエンジニアではない。Supabase/VercelのUI操作やSQL実行に不慣れなため、作業を依頼・説明する際は以下を徹底する。

- **SQLは常に実行可能な完全なコードブロックで渡す**。ファイルパスの参照だけで済ませず、コピペで動く状態にする
- **UI操作は具体的なボタン名・メニュー名で説明する**（例:「Settingsを開く」ではなく「左メニューの歯車アイコン→Settings→Build and Deployment」）。migration、RPC、環境変数といった専門用語は初出時に一言補足する
- **一度に大量の手順を出さない**。1〜2ステップごとに確認を挟む
- **エラー時はまずスクリーンショットをお願いする**。文字だけのエラーメッセージより早く正確に原因特定できる
- UIのレイアウトは時期によって変わるため、断定しすぎず「〜のはずです」「見当たらなければスクリーンショットを」という前提で案内する

## Supabase運用メモ
- マイグレーションは `supabase/migrations/` に連番で追加し、都度SQL Editorで手動実行してもらう（CLIでの自動適用は行っていない）
- 新しいテーブル/カラムを追加したら、既存データへの反映が必要か（UPDATE文が要るか）を都度確認する

## デプロイ運用
- 開発は `claude/toeic990-dev-guidelines-fte80g` ブランチで行い、動作確認後に`main`へマージしてVercel本番デプロイに反映する
- Vercelの環境変数（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`）はダッシュボードで設定済み

## コーディング規約
- コメントは日本語、自明な処理には付けない
- 動作優先、リファクタは指示があった時のみ
- コミット前に `npm run lint` と `npm run typecheck` を実行
- DBアクセスは `/lib/supabase` 経由に統一（コンポーネント内で直接クエリしない）

## ビルド・動作確認手順
- `cd toeic990` で移動してから実行
- コミット前に必ず: `npm run lint` → `npm run typecheck` → `npm run build`（3つとも通ることを確認）
- ローカルプレビューは `npm run dev`。`/login`・`/signup` は認証不要でそのまま確認できるが、`/dashboard` `/vocab` `/mock-test` はログインが必要なため、UI変更の見た目確認は主に認証不要ページか、ユーザーにスクリーンショットを送ってもらう形で行う
- Playwrightはプロジェクトの依存関係に含まれていない。ローカルでスクリーンショット確認したい場合は `/tmp` などプロジェクト外に一時インストールする（package.jsonは汚さない）

## よくある落とし穴・注意点
- **このセッションからはSupabaseへの直接SQL実行権限がない場合がある**（`.env.local`にはRLS制限付きのanon keyしかなく、service role keyやDBパスワードは無い）。その場合ALTER TABLE等のDDLは一切実行できず、データ更新もRLSで拒否される。Supabase MCPツールが有効な回もあれば無効な回もあるため、まず`ToolSearch`で`mcp__Supabase__*`が使えるか確認し、使えなければ「SQL Editorで手動実行してください」という前提で進める
- **mainブランチへのpushは自動承認されない**。`claude/toeic990-dev-guidelines-fte80g`へのpushは通っても、`main`への直接push/マージpushは毎回ユーザーの明示的な確認が必要（過去の許可は引き継がれない）。マージ作業自体（`git merge`をローカルworktreeで行う）は先に済ませておき、実際のpushだけ確認を挟むと手戻りが少ない
- **チャットのコードブロックからのSQLコピペは文字化けのリスクがある**（アポストロフィ`'`がスマートクォート`’`に変換され、文字列リテラルが壊れて構文エラーになることがあった）。アポストロフィを含む長いSQL(例: `company's`のような英文が入る例文)は、可能ならファイルとして送る方が安全。どうしてもコードブロックで求められた場合は、エラーが出たら文字化けを疑う
- **単語データ(vocab_cards)はリポジトリに存在しない**。スキーマ変更(カラム追加等)は`supabase/migrations/`にコミットするが、実際の単語データ(INSERT文)はユーザーに直接SQLを渡して実行してもらう一回限りの作業で、リポジトリには残らない。新しい単語バッチを作る際は、既存の単語と重複しないよう会話履歴やscratchpadの過去SQLを確認する
- **モバイルのレスポンシブ対応を忘れやすい**。ヘッダー等の横並びバッジ+テキストの`flex items-center justify-between`は、スマホ幅で子要素が潰れて縦書きのように折り返される事故が起きた。バッジ類には`shrink-0 whitespace-nowrap`、可変長テキストには`min-w-0 truncate`、必要なら`flex-col sm:flex-row`で段組みを切り替える

## デザイントークン(tailwind.config.ts)
- 角丸: `rounded-xl2`(20px)を通常カード、`rounded-xl3`(28px)をヒーロー/達成演出カードに使う
- シャドウ: `shadow-flat`/`shadow-card`/`shadow-hover`が通常カード用、`shadow-glow`(発光)と`shadow-hero`(大型グラデーションカード用)がアクセント
- トランジション: `ease-spring`(バネ風イージング)をホバー/操作フィードバックに統一使用
- `bg-aurora`: ネイビー背景に重ねる装飾グラデーション(login/signupのようなダーク全面デザインで使用)
- ログイン/サインアップは白カードではなく、ネイビー×グラデーション背景に直接ガラス調(半透明+backdrop-blur)の入力欄を置くダーク基調デザインを採用（詳細は`components/AuthCard.tsx`）

## 開発フェーズ
1. **MVP**: 認証、単語SRS学習（完了）
2. **模試機能**: Part5,6中心のテキスト問題演習
3. **リスニング**: Part1-4、音声再生+設問
4. **弱点分析**: Part別/カテゴリ別正答率の可視化、復習リコメンド

各フェーズはこの順で実装し、フェーズ内は機能単位でタスク分解して進める。
