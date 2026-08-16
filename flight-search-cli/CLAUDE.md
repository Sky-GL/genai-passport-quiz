# flight-search-cli - 開発規約

## プロジェクト概要
Amadeus → Duffel → RapidAPI「Sky Scrapper」の順で試し、最終的にSky Scrapperに落ち着いた汎用フライト検索CLI。
個人利用が前提で、会社登録が必要なAPIは採用しない方針。

## 技術スタック
- Python 3 + `requests` のみ（依存を増やさない）
- API: RapidAPI「Sky Scrapper」（`sky-scrapper.p.rapidapi.com`、Skyscannerの非公式ラッパー）
- 認証: `RAPIDAPI_KEY` 環境変数（`X-RapidAPI-Key`ヘッダー）

## ビルド・実行手順
```bash
cd flight-search-cli
pip install -r requirements.txt
export RAPIDAPI_KEY=xxxxx
python flight_search.py --segments 出発地,目的地,2026-11-06 --adults 1
```
`--csv FILE` で結果もCSV出力できる。ビルドという工程はなく、この2ステップ（依存インストール→実行）のみ。

## ユーザー向け説明ルール（重要）
このプロジェクトのユーザーはエンジニアではなく、主にスマホからClaude Code on the webを操作している。

- **ターミナル操作を前提にしない**。基本はチャットで検索条件（出発地・目的地・日付・人数）を伝えてもらい、Claudeがこのセッション内で`flight_search.py`を実行して結果を返す運用
- **UI操作は具体的なボタン名・タブ名で説明する**（例:「設定を開く」ではなく「…メニュー→環境を編集→ネットワークアクセス」）
- **一度に大量の手順を出さない**。詰まったらまずスクリーンショットをお願いする
- APIキー・トークンは**環境変数の設定欄に書かない**（下記「よくあるミス」参照）。チャットに直接貼ってもらい、Claudeがそのセッション内でのみ使う

## よくあるミス・詰まりどころ
- **クラウド環境のネットワークアクセスは初期状態で「Trusted」**（npm/GitHubなど決められたドメインのみ）。外部API（Duffel、RapidAPIなど）を呼ぶには、環境設定→ネットワークアクセスを「Custom」にして対象ドメイン（例: `api.duffel.com`, `sky-scrapper.p.rapidapi.com`）を1行ずつ追加する必要がある。変更は既存セッションにすぐ反映されないことがある
- **環境変数の設定欄に秘密情報を置かない**。「この環境を使用するすべてのユーザーに表示される」ため、シークレットストアではない。APIキーはチャットで直接渡してもらい、コミット・ファイル書き込みはしない
- **本番/Live相当のAPIキーは業者登録を求められることがある**（Amadeusの本番移行、Duffelのlive token発行など）。個人利用ではハードルが高いので、その場合はRapidAPI経由の代替APIを検討する
- **Sky Scrapperは区間ごとの片道検索API**であり、Amadeus/Duffelのような複数区間をまとめた合算運賃の検索はできない。区間を1つずつ独立に検索し、区間ごとに価格順トップ5を出す実装にしている
- Sky Scrapper無料プラン（Basic）は月あたりのリクエスト数に上限がある。1区間の検索で「都市名解決（searchAirport）」×2（出発地・目的地）＋「フライト検索（searchFlights）」×1 = 最大3コールを消費する点に注意
- 都市名解決結果は実行中のみキャッシュされる（`LocationResolver.cache`）。同じ入力を何度も検索APIに投げない

## コーディング規約
- コメントは日本語、自明な処理には付けない
- 動作優先、リファクタは指示があった時のみ
- 依存ライブラリは`requests`のみに保つ（新しい外部ライブラリを増やさない）
- エラーは`SkyScrapperError`にまとめ、日本語の分かりやすいメッセージで`main()`から`sys.exit(1)`する
