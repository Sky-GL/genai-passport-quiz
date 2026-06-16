import { ANTHROPIC_API_KEY } from '../config';

export const CATEGORIES = [
  { id: "basics",   label: "生成AIの基礎",  emoji: "🧠", color: "#6366f1", desc: "LLM・プロンプト・仕組みの基本" },
  { id: "tools",    label: "AIツール活用",  emoji: "🛠️", color: "#8b5cf6", desc: "ChatGPT・Copilot・画像生成AI等" },
  { id: "business", label: "ビジネス活用",  emoji: "💼", color: "#3b82f6", desc: "業務効率化・DX・活用事例" },
  { id: "ethics",   label: "倫理・リスク",  emoji: "⚖️", color: "#f59e0b", desc: "著作権・ハルシネーション・バイアス" },
  { id: "security", label: "セキュリティ",  emoji: "🔐", color: "#e11d48", desc: "情報漏洩・プロンプトインジェクション" },
  { id: "society",  label: "社会・法律",    emoji: "🌐", color: "#10b981", desc: "AI規制・著作権法・ガイドライン" },
];

export const EXAM_MODE = { id: "exam", label: "本番モード", emoji: "🎓", color: "#f97316", desc: "全6分野からランダム出題・本試験形式" };

export const FOCUS_MAP = {
  basics:   "生成AIの仕組み、LLM、プロンプトエンジニアリング、トークン、ファインチューニング、RAG",
  tools:    "ChatGPT・Claude・Gemini・Copilot・Midjourney・Stable Diffusionの活用法と特徴",
  business: "生成AIによる業務効率化、DX推進、活用事例、ROI、導入プロセス",
  ethics:   "ハルシネーション、ディープフェイク、バイアス、フェアネス、説明可能性（XAI）",
  security: "プロンプトインジェクション、情報漏洩、敵対的攻撃、セキュリティリスク",
  society:  "AI規制（EU AI Act等）、著作権、プライバシー、日本政府のAIガイドライン",
};

export const BATCH_OPTIONS = [5, 10, 20];

export const getCatInfo = (id) => id === "exam" ? EXAM_MODE : (CATEGORIES.find(c => c.id === id) || EXAM_MODE);

const SYLLABUS_2026 = `
=== 生成AIパスポート 2026年最新シラバス完全版（GUGA公式テキスト第4版） ===

【第1章：AI基礎】
ダートマス会議(1956年)=「人工知能」誕生の歴史的会議
教師あり学習=正解ラベル付きデータで学習
教師なし学習=正解なしでクラスタリング・次元削減
強化学習=報酬最大化を自律的に学ぶ手法（囲碁AI・自動運転）
次元削減=高次元データを低次元に圧縮
クラスタリング=似たもの同士を自動グループ分け
転移学習=学習済みモデルを新タスクに流用
誤差逆伝播法(Backpropagation)=誤差を逆方向に伝えて重みを修正する基幹技術
RLHF=人間の採点フィードバックでAIを調教する技術

【第2章：生成AIの仕組み（最頻出）】
自己回帰モデル=直前の出力を次の入力にしてしりとり風に文章生成
スケーリング則=データ量・パラメータ・計算リソース増加でLLM性能が向上する経験則
創発性(Emergent Abilities)=パラメータが閾値超えで高度能力が突然開花
ハルシネーション=AIがもっともらしい嘘を出力する現象
カタストロフィック忘却=新知識学習で古い知識を完全に忘れる現象
Top-p=確率合計が上位p%に達するまで候補を動的に絞るパラメーター
Top-k=上位k個に足し切りするパラメーター
Temperature=高いほど創造的・低いほど決定論的な出力
GAN=偽札画家vs警察の敵対的学習で超リアル画像生成
CNN=画像を畳み込みフィルターでスキャンする画像認識専門家
LSTM=忘却ゲートで短期記憶を長持ちさせた改良版RNN
Transformer=Attentionで文脈の遠い単語同士の関係を一度に処理する現代LLMの基盤
Multimodal=テキスト・画像・音声など複数モードを同時処理

【第3章：RAG・AIエージェント★最重要★】
RAG=外部データを検索して強化してから生成するハルシネーション激減システム
チャンク化=長文書を意味のある一口サイズに切り分ける必須の前処理
ベクトルDB=文章を数字の羅列に変換し意味の近さで高速検索できるデータベース
AIエージェント=自分で計画立案・Web検索・コード実行を自律的に回す代理人
MCP(Model Context Protocol)=★超重要★異なるAIと外部ツールが共通ルールで繋がる通信標準規格
Operator=AIエージェントを業務システムで稼働させる事業者

【第4章：法的リスク・規制★2026年大幅刷新★】
著作権法第30条の4=AI学習（インプット）は原則許可不要。ただしアウトプットの侵害は免除しない
類似性と依拠性=既存作品に似ており知っていて真似た場合は著作権侵害成立
AI新法（2025年6月公布）=日本のAI利活用促進の最新基本法
AI事業者ガイドライン第1.1版=開発者・提供者・利用者の行動指針
EU AI法リスク階層規制=禁止・高リスク・限定的・最小限の4段階分類
PII=個人を特定できる情報。プロンプト入力は最大タブー
ディープフェイク=顔や声を精巧に偽造する技術
バイアス=学習データの偏りがAIの差別的出力を引き起こす問題

【第5章：プロンプト・セキュリティ】
CoT(Chain of Thought)=ステップバイステップで考えてと指示するだけで正答率大幅向上
Few-shot=例題を数個見せてパターンを学ばせる技法
Zero-shot=例題なしで直接タスクを依頼する技法
プレテキスト攻撃=偽の口実で成りすまし機密情報を盗むソーシャルエンジニアリング
ベイト攻撃=マルウェア入りUSBをオフィスに落として拾わせる攻撃
シャドーAI=IT部門の許可なく業務秘密データをAIに入力する情報漏洩リスク行為
プロンプトインジェクション=悪意ある入力でAIのシステムを無効化するサイバー攻撃
XAI(Explainable AI)=AIの判断理由を人間が理解できるように説明可能にする技術
`;

// 問題から中心キーワードを抽出
const extractKeyword = (q) => {
  if (!q) return "";
  // questionTextとchoicesから主要な固有名詞・用語を抽出
  const combined = q.questionText + " " + Object.values(q.choices).join(" ");
  const terms = [
    "RAG","チャンク","ベクトル","エージェント","MCP","ハルシネーション","著作権","EU AI",
    "シャドー","プロンプトインジェクション","CoT","RLHF","GAN","CNN","LSTM","VAE",
    "Transformer","Temperature","Top-p","Top-k","バックプロパゲーション","強化学習",
    "教師あり","教師なし","転移学習","創発","スケーリング","XAI","PII","ディープフェイク",
    "バイアス","アライメント","Few-shot","Zero-shot","ベイト","プレテキスト",
    "Operator","Multimodal","LSTM","次元削減","クラスタリング"
  ];
  const found = terms.filter(t => combined.includes(t));
  return found.length > 0 ? found[0] : q.questionText.slice(0, 20);
};

export const fetchOne = async (catId, questionNumber, usedTexts = [], usedCorrects = []) => {
  const isExam = catId === "exam";
  const cat = getCatInfo(catId);
  const focus = isExam
    ? "全6分野（生成AIの基礎・AIツール活用・ビジネス活用・倫理・リスク・セキュリティ・社会・法律）からランダムに1つ選んで"
    : `【${cat.label}】（${FOCUS_MAP[catId]}）から`;

  // キーワードリストで重複防止（直近8問分）
  const usedKeywords = usedTexts.slice(-8);
  const avoidList = usedKeywords.length > 0
    ? `

【⛔ 絶対禁止リスト】以下のキーワード・テーマは既出のため、問題文にも選択肢にも絶対に使わないこと：
${usedKeywords.map((k,i) => `  ${i+1}. 「${k}」`).join("
")}
→ 上記と少しでも似たテーマ・用語・概念は完全にNG。全く別の分野・用語を選ぶこと。`
    : "";

  const avoidCorrect = usedCorrects.slice(-4).length > 0
    ? `
【正解バランス】直近4問の正解選択肢：${usedCorrects.slice(-4).join(" → ")}。同じ選択肢（a/b/c/d）が3連続しないよう正解をバランスよく分散させること。`
    : "";

  const prompt = `あなたは「生成AIパスポート」試験対策AIです。2026年最新シラバスに完全準拠した問題を1問生成してください。

${SYLLABUS_2026}
${avoidList}
【出題指示】
- ${focus}、問題番号${questionNumber}の4択問題を1問だけ生成
- 上記シラバスの重要用語・法規制・最新トピックから、禁止リストにない全く異なるトピックを選ぶ
- 選択肢4つはそれぞれ明確に異なる概念・用語にすること（似た言葉の並列NG）
- 解説は英語語源・直感的イメージを含め初心者が納得できるように${avoidCorrect}

JSONのみ返す（コードブロック\`\`\`厳禁）:
{"questionNumber":${questionNumber},"category":"<分野名>","questionText":"<問題文>","choices":{"a":"<a>","b":"<b>","c":"<c>","d":"<d>"},"correct":"<a/b/c/d>","explanation":"<解説>","wrongExplanations":{"a":"<なぜ違うか>","b":"<なぜ違うか>","c":"<なぜ違うか>","d":"<なぜ違うか>"}}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  const text = data.content?.map(i => i.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
};

export const fetchHint = async (q) => {
  const prompt = `この問題のヒントを正解を明かさず2〜3文でJSONで返してください（コードブロック禁止）：
{"hint":"<ヒント>"}
問題：${q.questionText}
選択肢：a)${q.choices.a} b)${q.choices.b} c)${q.choices.c} d)${q.choices.d}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.map(i => i.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
};
