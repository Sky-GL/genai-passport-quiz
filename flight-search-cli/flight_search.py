#!/usr/bin/env python3
"""汎用フライト検索CLI（Duffel APIを使用）

国内線・国際線、単純往復、オープンジョーを含むマルチシティ検索に対応する。
検索（offer_requests作成）のみ行い、予約・発券は行わない。
"""

import argparse
import csv
import os
import re
import sys
from datetime import datetime

import requests

BASE_URL = "https://api.duffel.com"
DUFFEL_VERSION = "v2"

IATA_CODE_PATTERN = re.compile(r"^[A-Za-z]{3}$")


class DuffelError(Exception):
    """Duffel API関連のエラーをまとめて扱うための例外"""


def _headers(token, with_content_type=False):
    headers = {
        "Authorization": f"Bearer {token}",
        "Duffel-Version": DUFFEL_VERSION,
        "Accept": "application/json",
    }
    if with_content_type:
        headers["Content-Type"] = "application/json"
    return headers


def _extract_error_message(resp):
    """Duffelのエラーレスポンス（{"errors": [...]}）から人間が読めるメッセージを組み立てる"""
    try:
        errors = resp.json().get("errors", [])
    except ValueError:
        return resp.text
    if not errors:
        return resp.text
    return " / ".join(e.get("message", e.get("title", "")) for e in errors)


def check_token(token):
    """トークンの有効性を軽い呼び出しで確認する（残り区間の検索前に早期に失敗させる）"""
    url = f"{BASE_URL}/places/suggestions"
    try:
        resp = requests.get(url, params={"query": "London"}, headers=_headers(token), timeout=15)
    except requests.RequestException as e:
        raise DuffelError(f"Duffel APIへの接続に失敗しました: {e}")

    if resp.status_code == 401:
        raise DuffelError("認証に失敗しました。DUFFEL_ACCESS_TOKENを確認してください。")
    if resp.status_code == 429:
        raise DuffelError("APIのレート制限を超過しました。しばらく待ってから再実行してください。")
    if not resp.ok:
        raise DuffelError(f"認証確認に失敗しました（HTTP {resp.status_code}）: {_extract_error_message(resp)}")


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
        url = f"{BASE_URL}/places/suggestions"
        headers = _headers(self.token)
        try:
            resp = requests.get(url, params={"query": query}, headers=headers, timeout=15)
        except requests.RequestException as e:
            raise DuffelError(f"「{query}」の検索中に接続エラーが発生しました: {e}")

        if resp.status_code == 429:
            raise DuffelError("APIのレート制限を超過しました。しばらく待ってから再実行してください。")
        if not resp.ok:
            raise DuffelError(f"「{query}」の検索に失敗しました（HTTP {resp.status_code}）: {_extract_error_message(resp)}")

        results = [r for r in resp.json().get("data", []) if r.get("iata_code")]
        if not results:
            raise DuffelError(f"「{query}」に該当する都市・空港が見つかりませんでした。")

        if len(results) == 1:
            return results[0]["iata_code"]

        print(f"\n「{query}」に該当する候補が複数見つかりました。番号を選択してください:")
        for i, item in enumerate(results, start=1):
            name = item.get("name", "")
            place_type = item.get("type", "")
            city_name = (item.get("city") or {}).get("name", "")
            country = item.get("iata_country_code", "")
            label = f"{name} ({place_type}" + (f", {city_name}" if city_name else "") + f", {country})"
            print(f"  [{i}] {item['iata_code']} - {label}")

        while True:
            choice = input(f"番号を入力してください (1-{len(results)}): ").strip()
            if choice.isdigit() and 1 <= int(choice) <= len(results):
                return results[int(choice) - 1]["iata_code"]
            print("無効な入力です。もう一度入力してください。")


def parse_segments(raw_segments, resolver):
    """「出発地,目的地,日付」形式の文字列群をDuffel APIのslices形式に変換する"""
    slices = []
    for raw in raw_segments:
        parts = [p.strip() for p in raw.split(",")]
        if len(parts) != 3:
            raise DuffelError(
                f"区間の指定が不正です: 「{raw}」（「出発地,目的地,日付」の形式で指定してください）"
            )
        origin_raw, dest_raw, date_raw = parts
        try:
            datetime.strptime(date_raw, "%Y-%m-%d")
        except ValueError:
            raise DuffelError(f"日付の形式が不正です: 「{date_raw}」（YYYY-MM-DD形式で指定してください）")

        origin_code = resolver.resolve(origin_raw)
        dest_code = resolver.resolve(dest_raw)

        slices.append({"origin": origin_code, "destination": dest_code, "departure_date": date_raw})
    return slices


def search_flights(token, slices, adults):
    """POST /air/offer_requestsでフライトを検索する（return_offers=trueで同一レスポンスに結果を含める）"""
    url = f"{BASE_URL}/air/offer_requests"
    body = {
        "data": {
            "slices": slices,
            "passengers": [{"type": "adult"} for _ in range(adults)],
        }
    }

    try:
        resp = requests.post(
            url,
            params={"return_offers": "true"},
            json=body,
            headers=_headers(token, with_content_type=True),
            timeout=60,
        )
    except requests.RequestException as e:
        raise DuffelError(f"フライト検索中に接続エラーが発生しました: {e}")

    if resp.status_code == 401:
        raise DuffelError("認証に失敗しました。DUFFEL_ACCESS_TOKENを確認してください。")
    if resp.status_code == 429:
        raise DuffelError("APIのレート制限を超過しました。しばらく待ってから再実行してください。")
    if resp.status_code == 422:
        raise DuffelError(f"検索条件が不正です: {_extract_error_message(resp)}")
    if not resp.ok:
        raise DuffelError(f"フライト検索に失敗しました（HTTP {resp.status_code}）: {_extract_error_message(resp)}")

    offers = resp.json().get("data", {}).get("offers", [])
    if not offers:
        raise DuffelError("該当するフライトが見つかりませんでした。条件を変えて再検索してください。")
    return offers


def format_offer(offer):
    """API結果を表示・CSV出力用の簡易な形に整形する"""
    slices_text = []
    for slice_ in offer["slices"]:
        seg_texts = []
        for seg in slice_["segments"]:
            carrier = seg["marketing_carrier"]["iata_code"]
            number = seg["marketing_carrier_flight_number"]
            origin = seg["origin"]["iata_code"]
            destination = seg["destination"]["iata_code"]
            seg_texts.append(
                f"{carrier}{number} {origin} {seg['departing_at']} → {destination} {seg['arriving_at']}"
            )
        slices_text.append(" / ".join(seg_texts))

    return {
        "price": float(offer["total_amount"]),
        "currency": offer["total_currency"],
        "route": " | ".join(slices_text),
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
    parser = argparse.ArgumentParser(description="Duffel APIを使った汎用フライト検索CLI")
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

    token = os.environ.get("DUFFEL_ACCESS_TOKEN")
    if not token:
        print("エラー: 環境変数 DUFFEL_ACCESS_TOKEN を設定してください。", file=sys.stderr)
        sys.exit(1)

    if args.adults < 1:
        print("エラー: 大人の人数は1人以上を指定してください。", file=sys.stderr)
        sys.exit(1)

    try:
        check_token(token)
        resolver = LocationResolver(token)
        slices = parse_segments(args.segments, resolver)
        raw_offers = search_flights(token, slices, args.adults)
    except DuffelError as e:
        print(f"エラー: {e}", file=sys.stderr)
        sys.exit(1)

    offers = sorted((format_offer(o) for o in raw_offers), key=lambda o: o["price"])[:5]
    print_results(offers)

    if args.csv:
        write_csv(offers, args.csv)


if __name__ == "__main__":
    main()
