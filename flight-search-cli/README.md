# flight-search-cli

Duffel APIを使った汎用フライト検索CLIツール。

国内線・国際線、単純往復、オープンジョーを含むマルチシティ（2〜4区間程度）の検索に対応する。
検索（offer_requests作成）のみを行い、予約・発券は行わない。予約はGoogle Flightsか航空会社サイトで別途行うこと。

## セットアップ

1. https://duffel.com/ でアカウントを作成し、ダッシュボードからアクセストークン（test/live）を発行する
2. 依存ライブラリをインストールする

```bash
pip install -r requirements.txt
```

3. 環境変数を設定する（`.env.example` を参考に）

```bash
export DUFFEL_ACCESS_TOKEN=duffel_test_xxxxx
```

## 使い方

`--segments` に `出発地,目的地,日付(YYYY-MM-DD)` の形式で区間をスペース区切りで指定する。出発地・目的地は都市名・空港名・IATAコードのいずれでも指定できる（3文字コード以外は候補検索して選択させる）。

単純往復:

```bash
python flight_search.py --segments 東京,ニューヨーク,2026-11-06 ニューヨーク,東京,2026-11-15
```

マルチシティ・オープンジョー（行きと帰りで空港が異なる例）:

```bash
python flight_search.py --segments デリー,バンコク,2026-11-06 バンコク,メルボルン,2026-11-07
```

大人の人数を指定（デフォルト1人）:

```bash
python flight_search.py --segments NRT,SIN,2026-11-06 SIN,NRT,2026-11-12 --adults 2
```

検索結果をCSVにも出力:

```bash
python flight_search.py --segments NRT,SIN,2026-11-06 --csv result.csv
```

検索結果は価格が安い順に上位5件を表示する（航空会社・便名、出発/到着時刻、概算運賃）。

## 注意事項

- フライト検索（offer_requests作成）自体は無料。実際の予約・発券まで進めない限り課金は発生しない
- 本ツールは検索・スクリーニング用途のみ
