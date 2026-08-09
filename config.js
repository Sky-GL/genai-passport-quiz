// ⚠️ APIキーは環境変数から読み込んでください（コード内に直接書かない）
// 生成AIパスポートアプリはオフライン版に移行したため、現在このキーは未使用です
// .env に EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-... を設定してください（.envはgitignore対象）
// EXPO_PUBLIC_ プレフィックスの環境変数はクライアントバンドルに埋め込まれるため、
// 配布用ビルドではAPIキーが端末側から抽出され得る点に注意（サーバー経由の呼び出しへの移行を推奨）
export const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? "";
