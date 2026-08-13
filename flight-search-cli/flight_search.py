#!/usr/bin/env python3
"""汎用フライト検索CLI（Amadeus Self-Service Flight Offers Search APIを使用）

国内線・国際線、単純往復、オープンジョーを含むマルチシティ検索に対応する。
"""

import argparse
import csv
import os
import re
import sys
from datetime import datetime

import requests

TEST_BASE_URL = "https://test.api.amadeus.com"
# 本番環境を使う場合は AMADEUS_BASE_URL=https://api.amadeus.com を設定する
BASE_URL = os.environ.get("AMADEUS_BASE_URL", TEST_BASE_URL)

IATA_CODE_PATTERN = re.compile(r"^[A-Za-z]{3}$")


class AmadeusError(Exception):
    """Amadeus API関連のエラーをまとめて扱うための例外"""


def get_access_token(api_key, api_secret):
    """OAuth2 client credentialsでアクセストークンを取得する"""
    url = f"{BASE_URL}/v1/security/oauth2/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": api_key,
        "client_secret": api_secret,
    }
    try:
        resp = requests.post(url, data=data, timeout=15)
    except requests.RequestException as e:
        raise AmadeusError(f"認証サーバーへの接続に失敗しました: {e}")

    if resp.status_code == 401:
        raise AmadeusError("認証に失敗しました。APIキー・シークレットを確認してください。")
    if resp.status_code == 429:
        raise AmadeusError("APIのレート制限を超過しました。しばらく待ってから再実行してください。")
    if not resp.ok:
        raise AmadeusError(f"認証エラー（HTTP {resp.status_code}）: {resp.text}")

    return resp.json()["access_token"]


class LocationResolver:
    """都市名・空港名をIATAコードに変換し、実行中の結果をキャッシュする"""

    def __init__(self, token):
        self.token = token
        self.cache = {}

    def resolve(self, query):
        if query in self.cache:
            return self.cache[query]

        if IATA_CODE_PATTERN.match(query):
            code = query.upper()
        else:
            code = self._search_and_select(query)

        self.cache[query] = code
        return code

    def _search_and_select(self, query):
        url = f"{BASE_URL}/v1/reference-data/locations"
        params = {"keyword": query, "subType": "AIRPORT,CITY", "page[limit]": 10}
        headers = {"Authorization": f"Bearer {self.token}"}
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=15)
        except requests.RequestException as e:
            raise AmadeusError(f"「{query}」の検索中に接続エラーが発生しました: {e}")

        if resp.status_code == 429:
            raise AmadeusError("APIのレート制限を超過しました。しばらく待ってから再実行してください。")
        if not resp.ok:
            raise AmadeusError(f"「{query}」の検索に失敗しました（HTTP {resp.status_code}）: {resp.text}")

        results = resp.json().get("data", [])
        if not results:
            raise AmadeusError(f"「{query}」に該当する都市・空港が見つかりませんでした。")

        if len(results) == 1:
            return results[0]["iataCode"]

        print(f"\n「{query}」に該当する候補が複数見つかりました。番号を選択してください:")
        for i, item in enumerate(results, start=1):
            name = item.get("name", "")
            address = item.get("address", {})
            city = address.get("cityName", "")
            country = address.get("countryName", "")
            print(f"  [{i}] {item['iataCode']} - {name} ({city}, {country})")

        while True:
            choice = input(f"番号を入力してください (1-{len(results)}): ").strip()
            if choice.isdigit() and 1 <= int(choice) <= len(results):
                return results[int(choice) - 1]["iataCode"]
            print("無効な入力です。もう一度入力してください。")


def parse_segments(raw_segments, resolver):
    """「出発地,目的地,日付」形式の文字列群をAmadeus APIのoriginDestinations形式に変換する"""
    origin_destinations = []
    for i, raw in enumerate(raw_segments, start=1):
        parts = [p.strip() for p in raw.split(",")]
        if len(parts) != 3:
            raise AmadeusError(
                f"区間の指定が不正です: 「{raw}」（「出発地,目的地,日付」の形式で指定してください）"
            )
        origin_raw, dest_raw, date_raw = parts
        try:
            datetime.strptime(date_raw, "%Y-%m-%d")
        except ValueError:
            raise AmadeusError(f"日付の形式が不正です: 「{date_raw}」（YYYY-MM-DD形式で指定してください）")

        origin_code = resolver.resolve(origin_raw)
        dest_code = resolver.resolve(dest_raw)

        origin_destinations.append(
            {
                "id": str(i),
                "originLocationCode": origin_code,
                "destinationLocationCode": dest_code,
                "departureDateTimeRange": {"date": date_raw},
            }
        )
    return origin_destinations


def search_flights(token, origin_destinations, adults):
    """Flight Offers Search API（マルチシティ対応のPOSTエンドポイント）でフライトを検索する"""
    url = f"{BASE_URL}/v2/shopping/flight-offers"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    body = {
        "currencyCode": "USD",
        "originDestinations": origin_destinations,
        "travelers": [{"id": str(i + 1), "travelerType": "ADULT"} for i in range(adults)],
        "sources": ["GDS"],
        "searchCriteria": {"maxFlightOffers": 50},
    }

    try:
        resp = requests.post(url, json=body, headers=headers, timeout=30)
    except requests.RequestException as e:
        raise AmadeusError(f"フライト検索中に接続エラーが発生しました: {e}")

    if resp.status_code == 401:
        raise AmadeusError("認証エラーが発生しました。トークンが無効か期限切れです。")
    if resp.status_code == 429:
        raise AmadeusError("APIのレート制限を超過しました。しばらく待ってから再実行してください。")
    if resp.status_code == 400:
        raise AmadeusError(f"検索条件が不正です: {resp.text}")
    if not resp.ok:
        raise AmadeusError(f"フライト検索に失敗しました（HTTP {resp.status_code}）: {resp.text}")

    data = resp.json().get("data", [])
    if not data:
        raise AmadeusError("該当するフライトが見つかりませんでした。条件を変えて再検索してください。")
    return data


def format_offer(offer):
    """API結果を表示・CSV出力用の簡易な形に整形する"""
    price = offer["price"]

    itineraries_text = []
    for itinerary in offer["itineraries"]:
        seg_texts = []
        for seg in itinerary["segments"]:
            carrier = seg["carrierCode"]
            number = seg["number"]
            dep = seg["departure"]
            arr = seg["arrival"]
            seg_texts.append(
                f"{carrier}{number} {dep['iataCode']} {dep['at']} → {arr['iataCode']} {arr['at']}"
            )
        itineraries_text.append(" / ".join(seg_texts))

    return {
        "price": float(price["total"]),
        "currency": price["currency"],
        "route": " | ".join(itineraries_text),
    }


def print_results(offers):
    print(f"\n検索結果（価格順、上位{len(offers)}件）:\n")
    for i, offer in enumerate(offers, start=1):
        print(f"[{i}] {offer['price']:.2f} {offer['currency']}")
        print(f"    {offer['route']}\n")


def write_csv(offers, path):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["順位", "価格", "通貨", "経路"])
        for i, offer in enumerate(offers, start=1):
            writer.writerow([i, offer["price"], offer["currency"], offer["route"]])
    print(f"CSVファイルに出力しました: {path}")


def main():
    parser = argparse.ArgumentParser(description="Amadeus APIを使った汎用フライト検索CLI")
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

    api_key = os.environ.get("AMADEUS_API_KEY")
    api_secret = os.environ.get("AMADEUS_API_SECRET")
    if not api_key or not api_secret:
        print("エラー: 環境変数 AMADEUS_API_KEY / AMADEUS_API_SECRET を設定してください。", file=sys.stderr)
        sys.exit(1)

    if args.adults < 1:
        print("エラー: 大人の人数は1人以上を指定してください。", file=sys.stderr)
        sys.exit(1)

    try:
        token = get_access_token(api_key, api_secret)
        resolver = LocationResolver(token)
        origin_destinations = parse_segments(args.segments, resolver)
        raw_offers = search_flights(token, origin_destinations, args.adults)
    except AmadeusError as e:
        print(f"エラー: {e}", file=sys.stderr)
        sys.exit(1)

    offers = sorted((format_offer(o) for o in raw_offers), key=lambda o: o["price"])[:5]
    print_results(offers)

    if args.csv:
        write_csv(offers, args.csv)


if __name__ == "__main__":
    main()
