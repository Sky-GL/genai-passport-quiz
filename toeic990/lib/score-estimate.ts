// 語彙問題(Part5形式)の正答率からTOEIC予想スコアを出す。
// 単語セット自体が★5=990レベルになるよう相対調整されているため、
// 「このセット全問正解 ≒ 990、半分 ≒ 770」を目安に線形で対応づける。
const SCORE_FLOOR = 550;
const SCORE_RANGE = 440;

// 星の数(1〜5)をそのまま重みに使い、難しい語の正解ほど高く評価する
const DEFAULT_LEVEL = 3;

// これ未満の回答数では予想を出さない(ブレが大きすぎるため)
export const MIN_SAMPLE_FOR_ESTIMATE = 20;

export type ScoredAnswer = {
  isCorrect: boolean;
  level: number | null;
};

export type ScoreEstimate = {
  score: number;
  // 予想の根拠にした回答数
  sampleSize: number;
  // 難易度で重みづけした正答率(0〜100)
  weightedAccuracy: number;
  // 990まであと何点か
  gapTo990: number;
};

export function estimateToeicScore(answers: ScoredAnswer[]): ScoreEstimate | null {
  if (answers.length < MIN_SAMPLE_FOR_ESTIMATE) return null;

  let totalWeight = 0;
  let correctWeight = 0;
  for (const answer of answers) {
    const weight = answer.level ?? DEFAULT_LEVEL;
    totalWeight += weight;
    if (answer.isCorrect) correctWeight += weight;
  }
  if (totalWeight === 0) return null;

  const ratio = correctWeight / totalWeight;
  // TOEICのスコアは5点刻み
  const raw = SCORE_FLOOR + ratio * SCORE_RANGE;
  const score = Math.min(990, Math.max(SCORE_FLOOR, Math.round(raw / 5) * 5));

  return {
    score,
    sampleSize: answers.length,
    weightedAccuracy: Math.round(ratio * 100),
    gapTo990: 990 - score,
  };
}
