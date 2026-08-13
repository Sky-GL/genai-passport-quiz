#!/usr/bin/env python3
"""汎用フライト検索CLI（RapidAPI「Sky Scrapper」APIを使用）

国内線・国際線、単純往復、オープンジョーを含むマルチシティ検索に対応する。
Sky Scrapperは区間ごとの片道検索APIのため、区間は1つずつ独立に検索し、
区間ごとに価格順の候補を表示する（複数区間をまとめた合算運賃は出さない）。
"""

import argparse
import csv
import os
import sys
from datetime import datetime

import requests

BASE_URL = "https://sky-scrapper.p.rapidapi.com"
API_HOST = "sky-scrapper.p.rapidapi.com"

# Sky Scrapperの検索に必要な市場・通貨・国コード（固定値。結果の言語や表示通貨に影響する）
MARKET = "US"
CURRENCY = "USD"
COUNTRY_CODE = "US"


class SkyScrapperError(Exception):
    """Sky Scrapper API関連のエラーをまとめて扱うための例外"""


def _headers(api_key):
    return {"X-RapidAPI-Key": api_key, "X-RapidAPI-Host": API_HOST}


def _get(api_key, path, params):
    try:
        resp = requests.get(f"{BASE_URL}{path}", params=params, headers=_headers(api_key), timeout=30)
    except requests.RequestException as e:
        raise SkyScrapperError(f"API接続中にエラーが発生しました: {e}")

    if resp.status_code == 401 or resp.status_code == 403:
        raise SkyScrapperError("認証に失敗しました。RAPIDAPI_KEYを確認してください（Sky Scrapperを購読済みか確認）。")
    if resp.status_code == 429:
        raise SkyScrapperError("APIのリクエスト上限（無料枠）を超過しました。しばらく待ってから再実行してください。")
    if not resp.ok:
        raise SkyScrapperError(f"APIエラー（HTTP {resp.status_code}）: {resp.text}")

    return resp.json()


class LocationResolver:
    """都市名・空港名をSky Scrapperの検索用ID（skyId・entityId）に変換し、実行中の結果をキャッシュする"""

    def __init__(self, api_key):
        self.api_key = api_key
        self.cache = {}

    def resolve(self, query):
        if query in self.cache:
            return self.cache[query]

        result = self._search_and_select(query)
        self.cache[query] = result
        return result

    def _search_and_select(self, query):
        data = _get(self.api_key, "/api/v1/flights/searchAirport", {"query": query, "locale": "en-US"})
        candidates = data.get("data", [])

        results = []
        for item in candidates:
            nav = item.get("navigation", {})
            params = nav.get("relevantFlightParams", {})
            sky_id = params.get("skyId")
            entity_id = params.get("entityId") or nav.get("entityId")
            if not sky_id or not entity_id:
                continue
            title = item.get("presentation", {}).get("title", "")
            subtitle = item.get("presentation", {}).get("subtitle", "")
            place_type = params.get("flightPlaceType", nav.get("entityType", ""))
            results.append(
                {"sky_id": sky_id, "entity_id": entity_id, "label": f"{title} ({place_type}, {subtitle})"}
            )

        if not results:
            raise SkyScrapperError(f"「{query}」に該当する都市・空港が見つかりませんでした。")

        if len(results) == 1:
            return results[0]

        print(f"\n「{query}」に該当する候補が複数見つかりました。番号を選択してください:")
        for i, r in enumerate(results, start=1):
            print(f"  [{i}] {r['sky_id']} - {r['label']}")

        while True:
            choice = input(f"番号を入力してください (1-{len(results)}): ").strip()
            if choice.isdigit() and 1 <= int(choice) <= len(results):
                return results[int(choice) - 1]
            print("無効な入力です。もう一度入力してください。")


def parse_segments(raw_segments, resolver):
    """「出発地,目的地,日付」形式の文字列群を、区間ごとの検索条件のリストに変換する"""
    segments = []
    for raw in raw_segments:
        parts = [p.strip() for p in raw.split(",")]
        if len(parts) != 3:
            raise SkyScrapperError(
                f"区間の指定が不正です: 「{raw}」（「出発地,目的地,日付」の形式で指定してください）"
            )
        origin_raw, dest_raw, date_raw = parts
        try:
            datetime.strptime(date_raw, "%Y-%m-%d")
        except ValueError:
            raise SkyScrapperError(f"日付の形式が不正です: 「{date_raw}」（YYYY-MM-DD形式で指定してください）")

        origin = resolver.resolve(origin_raw)
        destination = resolver.resolve(dest_raw)

        segments.append({"origin": origin, "destination": destination, "date": date_raw, "label": raw})
    return segments


def search_one_way(api_key, segment, adults):
    """1区間分の片道フライトをGET /api/v1/flights/searchFlightsで検索する"""
    params = {
        "originSkyId": segment["origin"]["sky_id"],
        "destinationSkyId": segment["destination"]["sky_id"],
        "originEntityId": segment["origin"]["entity_id"],
        "destinationEntityId": segment["destination"]["entity_id"],
        "date": segment["date"],
        "adults": adults,
        "currency": CURRENCY,
        "market": MARKET,
        "countryCode": COUNTRY_CODE,
    }
    data = _get(api_key, "/api/v1/flights/searchFlights", params)
    itineraries = data.get("data", {}).get("itineraries", [])
    if not itineraries:
        raise SkyScrapperError(f"「{segment['label']}」に該当するフライトが見つかりませんでした。")
    return itineraries


def format_itinerary(itinerary):
    """API結果を表示・CSV出力用の簡易な形に整形する"""
    leg = itinerary["legs"][0]
    segs = leg.get("segments") or [
        {
            "marketingCarrier": (leg.get("carriers", {}).get("marketing") or [{}])[0],
            "flightNumber": "",
            "origin": leg.get("origin", {}),
            "destination": leg.get("destination", {}),
            "departure": leg.get("departure", ""),
            "arrival": leg.get("arrival", ""),
        }
    ]

    seg_texts = []
    for seg in segs:
        carrier = seg.get("marketingCarrier", {}).get("alternateId", "")
        number = seg.get("flightNumber", "")
        origin = seg.get("origin", {}).get("displayCode", "")
        destination = seg.get("destination", {}).get("displayCode", "")
        seg_texts.append(f"{carrier}{number} {origin} {seg.get('departure', '')} → {destination} {seg.get('arrival', '')}")

    price = itinerary.get("price", {}).get("raw")
    return {"price": float(price), "currency": CURRENCY, "route": " / ".join(seg_texts)}


def print_results(label, results):
    print(f"\n[{label}] 検索結果（価格順、上位{len(results)}件）:\n")
    for i, r in enumerate(results, start=1):
        print(f"  [{i}] {r['price']:.2f} {r['currency']}")
        print(f"      {r['route']}\n")


def write_csv(all_results, path):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["区間", "順位", "価格", "通貨", "内訳"])
        for label, results in all_results:
            for i, r in enumerate(results, start=1):
                writer.writerow([label, i, r["price"], r["currency"], r["route"]])
    print(f"CSVファイルに出力しました: {path}")


def main():
    parser = argparse.ArgumentParser(description="Sky Scrapper API（RapidAPI）を使った汎用フライト検索CLI")
    parser.add_argument(
        "--segments",
        "-s",
        nargs="+",
        required=True,
        help=(
            "区間を「出発地,目的地,日付(YYYY-MM-DD)」の形式でスペース区切りで複数指定"
            "（例: -s デリー,バンコク,2026-11-06 バンコク,メルボルン,2026-11-07）"
        ),
    )
    parser.add_argument("--adults", "-a", type=int, default=1, help="大人の人数（デフォルト: 1）")
    parser.add_argument("--csv", metavar="FILE", help="検索結果をCSVファイルにも出力する")
    args = parser.parse_args()

    api_key = os.environ.get("RAPIDAPI_KEY")
    if not api_key:
        print("エラー: 環境変数 RAPIDAPI_KEY を設定してください。", file=sys.stderr)
        sys.exit(1)

    if args.adults < 1:
        print("エラー: 大人の人数は1人以上を指定してください。", file=sys.stderr)
        sys.exit(1)

    try:
        resolver = LocationResolver(api_key)
        segments = parse_segments(args.segments, resolver)

        all_results = []
        for segment in segments:
            itineraries = search_one_way(api_key, segment, args.adults)
            results = sorted((format_itinerary(it) for it in itineraries), key=lambda r: r["price"])[:5]
            all_results.append((segment["label"], results))
    except SkyScrapperError as e:
        print(f"エラー: {e}", file=sys.stderr)
        sys.exit(1)

    for label, results in all_results:
        print_results(label, results)

    if args.csv:
        write_csv(all_results, args.csv)


if __name__ == "__main__":
    main()
