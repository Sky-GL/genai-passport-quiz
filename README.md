# 🤖 生成AIパスポート 試験対策アプリ
## Expo React Native → Android APK ビルド手順（Windows版）

---

## ✅ STEP 1：Node.jsをインストール
1. https://nodejs.org/ を開く
2. **「LTS」版**をダウンロードしてインストール
3. インストール完了後、コマンドプロンプトで確認：
   ```
   node -v
   ```
   → `v20.x.x` のように表示されればOK

---

## ✅ STEP 2：このフォルダをPCに配置
1. このフォルダ `genai-passport-app` をデスクトップに置く

---

## ✅ STEP 3：APIキーを設定
1. https://console.anthropic.com にアクセス
2. 「API Keys」→「Create Key」でAPIキーを取得
3. `config.js` をメモ帳で開く
4. `sk-ant-ここにAPIキーを貼り付け` の部分を実際のAPIキーに書き換えて保存

---

## ✅ STEP 4：Expoアカウント作成
1. https://expo.dev にアクセスして無料アカウント作成

---

## ✅ STEP 5：コマンドプロンプトでセットアップ
デスクトップの `genai-passport-app` フォルダを右クリック →「ターミナルで開く」（または「コマンドプロンプト」）

```bash
# パッケージインストール
npm install

# EAS CLIをインストール
npm install -g eas-cli

# Expoにログイン
eas login

# プロジェクトの初期設定（初回のみ）
eas init
```

---

## ✅ STEP 6：APKをビルド（クラウドでビルド）
```bash
eas build -p android --profile preview
```

- ビルドはExpoのクラウドサーバーで実行されます（PCのスペック不要！）
- 完了まで約5〜15分
- ビルド完了後にダウンロードURLが表示されます

---

## ✅ STEP 7：Androidにインストール
1. ダウンロードしたAPKファイルをスマホに転送
2. Androidの「設定」→「セキュリティ」→「提供元不明のアプリ」をON
3. APKをタップしてインストール

---

## 📱 動作確認（実機なしでテストしたい場合）
```bash
# Expoアプリをスマホにインストール→QRコードでプレビュー
npx expo start
```

---

## ⚠️ 注意事項
- APIキーは `config.js` に保存されています。APKを他人に配布する場合はAPIキーが見られる可能性があります
- APIの使用料はAnthropicに別途かかります（従量課金）

---

## 📁 ファイル構成
```
genai-passport-app/
├── app/
│   ├── index.js      ← カテゴリ選択画面
│   ├── quiz.js       ← 問題画面
│   ├── result.js     ← 結果画面
│   └── quiz-data.js  ← 問題データ・API呼び出し
├── config.js         ← ⚠️ APIキーをここに入力！
├── app.json          ← アプリ設定
├── eas.json          ← ビルド設定
├── package.json      ← パッケージ設定
└── README.md         ← この説明書
```
