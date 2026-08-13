# flight-search-cli

RapidAPIの「Sky Scrapper」API（Skyscannerの非公式ラッパー）を使った汎用フライト検索CLIツール。

国内線・国際線、単純往復、オープンジョーを含むマルチシティ（2〜4区間程度）の検索に対応する。
Sky Scrapperは区間ごとの片道検索APIのため、指定した区間を1つずつ独立に検索し、区間ごとに価格順の候補を表示する
（複数区間をまとめた1枚の合算運賃チケットは出せない点に注意）。

## セットアップ

1. https://rapidapi.com/ でアカウントを作成する（会社登録は不要）
2. [Sky Scrapper](https://rapidapi.com/apiheya/api/sky-scrapper) のページで無料プラン（Basic）をSubscribeする
3. 「Endpoints」タブなどに表示される `X-RapidAPI-Key` をコピーする
4. 依存ライブラリをインストールする

```bash
pip install -r requirements.txt
```

5. 環境変数を設定する（`.env.example` を参考に）

```bash
export RAPIDAPI_KEY=your-rapidapi-key-here
```

無料プランはひと月あたりのリクエスト数に上限があるので注意（1区間の検索でAPIコールを2回消費する：都市名解決1回＋フライト検索1回）。

## 使い方

`--segments` に `出発地,目的地,日付(YYYY-MM-DD)` の形式で区間をスペース区切りで指定する。出発地・目的地は都市名・空港名・IATAコードのいずれでも指定できる（候補が複数あれば番号選択させる）。

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

各区間について、価格が安い順に上位5件を表示する（航空会社・便名、出発/到着時刻、概算運賃）。

## 注意事項

- 本ツールは検索・スクリーニング用途のみ。実際の予約はGoogle Flightsか航空会社サイトで別途行うこと
- 区間ごとの独立検索のため、乗り継ぎ割引や複数区間セット運賃は反映されない（各区間を素直に足し合わせた場合の目安として利用する）
